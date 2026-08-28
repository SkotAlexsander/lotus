-- ============================================================================
-- 02 — TABELAS
-- Transcrição fiel do arquivo 03 do briefing, com as adições MARCADAS.
--
-- Regra desta pasta: o que vem do briefing vai igual; o que eu acrescentei
-- leva a etiqueta ADIÇÃO e o motivo. Assim dá para conferir depois o que é
-- decisão sua e o que é decisão minha.
-- ============================================================================

-- ====== USUÁRIOS (espelha o login do Supabase Auth) ======
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  papel       text not null check (papel in ('cliente','terapeuta')),
  nome        text not null,
  foto_url    text,
  telefone    text,
  criado_em   timestamptz not null default now()
);

comment on table profiles is
  'Um registro por pessoa logada. O papel é gravado aqui e conferido no servidor '
  'pelas políticas de RLS — nunca só no aplicativo (arquivo 04, item 1).';

-- ADIÇÃO: quem é admin.
-- O arquivo 04 diz "denúncias: autora cria, só admin lê" e fala em fila de
-- moderação — mas `profiles.papel` só aceita 'cliente' ou 'terapeuta'. Sem uma
-- forma de dizer quem é admin, a política de moderação não tem como ser escrita.
-- Tabela separada em vez de mais um valor no check: assim o app nunca consegue
-- se autopromover mexendo no próprio perfil.
create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  criado_em  timestamptz not null default now()
);

-- ====== CATÁLOGO DE TERAPIAS ======
create table if not exists terapias (
  id     serial primary key,
  nome   text unique not null,
  icone  text
);

comment on table terapias is
  'Controlado pelo admin. É o que evita a lista virar bagunça com '
  '"Apometria", "apometria" e "Apometria Quântica" como três coisas.';

-- ====== PERFIL PROFISSIONAL DA TERAPEUTA ======
create table if not exists perfis_terapeuta (
  user_id        uuid primary key references profiles(id) on delete cascade,
  bio            text,
  endereco       text,          -- endereço completo digitado
  bairro         text,
  cidade         text not null,
  uf             char(2) not null,
  localizacao    geography(point, 4326) not null,  -- lat/lng geocodificada
  atendimento    text[] not null default '{presencial}',  -- presencial/online
  whatsapp       text not null, -- 55DDDNÚMERO
  instagram      text,
  preco_min      numeric(10,2),
  preco_max      numeric(10,2),
  verificada     boolean not null default false,
  ativa          boolean not null default true,   -- aparece no mapa?
  criado_em      timestamptz not null default now(),

  -- ADIÇÃO: o "mostrar só o bairro" existe na tela (arquivo 05, passo 2 do
  -- assistente) e no arquivo 04 ("precisão controlada"), mas não tinha coluna.
  -- Sem ela, a escolha da terapeuta não tem onde ser guardada.
  so_bairro      boolean not null default false
);

comment on column perfis_terapeuta.so_bairro is
  'true = a cliente vê a região e o mapa aproximado, não o número da rua. '
  'Proteção de quem atende em casa (arquivo 04, item 4).';

-- ====== TERAPIAS DE CADA TERAPEUTA (N:N) ======
create table if not exists terapeuta_terapias (
  terapeuta_id uuid references perfis_terapeuta(user_id) on delete cascade,
  terapia_id   int  references terapias(id),
  primary key (terapeuta_id, terapia_id)
);

-- ====== SERVIÇOS E VALORES ======
create table if not exists servicos (
  id            bigint generated always as identity primary key,
  terapeuta_id  uuid not null references perfis_terapeuta(user_id) on delete cascade,
  nome          text not null,           -- "Sessão de Apometria"
  descricao     text,
  duracao_min   int,                     -- 60, 90...
  valor         numeric(10,2) not null,

  -- ADIÇÃO: valor negativo não é serviço, é erro de digitação.
  constraint valor_positivo check (valor >= 0)
);

-- ====== FOTOS DO ESPAÇO E DO TRABALHO ======
-- ADIÇÃO (pedido de 27/08): a terapeuta mostra o local de atendimento e o
-- trabalho em duas galerias no perfil. O arquivo em si mora no Storage do
-- Supabase (bucket próprio, na Fase 1); aqui fica só o caminho e a legenda.
-- A modalidade (presencial/on-line/híbrido) NÃO vira coluna: é derivada dos
-- dois flags de atendimento que já existem — campo derivado digitado diverge.

create table if not exists fotos_terapeuta (
  id            bigint generated always as identity primary key,
  terapeuta_id  uuid not null references perfis_terapeuta(user_id) on delete cascade,
  tipo          text not null check (tipo in ('local','trabalho')),
  caminho       text not null,           -- caminho no bucket do Storage
  legenda       text,
  ordem         int not null default 0,
  criada_em     timestamptz not null default now()
);

create index if not exists idx_fotos_terapeuta
  on fotos_terapeuta (terapeuta_id, tipo, ordem);

-- ====== HORÁRIOS DE ATENDIMENTO ======
create table if not exists horarios (
  id            bigint generated always as identity primary key,
  terapeuta_id  uuid not null references perfis_terapeuta(user_id) on delete cascade,
  dia_semana    int not null check (dia_semana between 0 and 6), -- 0 = domingo
  abre          time not null,
  fecha         time not null,
  check (fecha > abre)
);

-- ====== AVALIAÇÕES ======
create table if not exists avaliacoes (
  id            bigint generated always as identity primary key,
  terapeuta_id  uuid not null references perfis_terapeuta(user_id) on delete cascade,
  cliente_id    uuid not null references profiles(id) on delete cascade,
  nota          int not null check (nota between 1 and 5),
  comentario    text check (char_length(comentario) <= 1000),
  resposta      text,                    -- resposta da terapeuta
  status        text not null default 'publicada'
                check (status in ('publicada','pendente','removida')),
  criado_em     timestamptz not null default now(),
  unique (terapeuta_id, cliente_id),     -- 1 avaliação por cliente
  check (terapeuta_id <> cliente_id)     -- ninguém avalia a si mesma
);

comment on table avaliacoes is
  'As duas travas anti-fraude do arquivo 04 estão NO BANCO, não no aplicativo: '
  'uma avaliação por cliente por terapeuta, e ninguém avalia a si mesma. '
  'Regra que vive só no app é sugestão; no banco é lei.';

-- ====== FAVORITOS ======
create table if not exists favoritos (
  cliente_id   uuid references profiles(id) on delete cascade,
  terapeuta_id uuid references perfis_terapeuta(user_id) on delete cascade,
  criado_em    timestamptz not null default now(),
  primary key (cliente_id, terapeuta_id)
);

-- ====== DENÚNCIAS ======
create table if not exists denuncias (
  id           bigint generated always as identity primary key,
  autor_id     uuid not null references profiles(id),
  alvo_tipo    text not null check (alvo_tipo in ('perfil','avaliacao')),
  alvo_id      text not null,
  motivo       text not null,
  status       text not null default 'aberta'
               check (status in ('aberta','analisada','encerrada')),
  criado_em    timestamptz not null default now()
);


-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- O coração da busca "quem está perto de mim". Sem ele, cada abertura do mapa
-- lê a tabela inteira.
create index if not exists idx_terapeuta_local
  on perfis_terapeuta using gist (localizacao);

create index if not exists idx_terapeuta_cidade
  on perfis_terapeuta (cidade, uf) where ativa;

create index if not exists idx_horarios_terapeuta
  on horarios (terapeuta_id, dia_semana);

-- ADIÇÃO: sem estes, "as avaliações desta terapeuta" e "as favoritas desta
-- cliente" viram varredura de tabela assim que houver movimento.
create index if not exists idx_avaliacoes_terapeuta
  on avaliacoes (terapeuta_id) where status = 'publicada';
create index if not exists idx_servicos_terapeuta
  on servicos (terapeuta_id);
create index if not exists idx_favoritos_cliente
  on favoritos (cliente_id);
create index if not exists idx_denuncias_status
  on denuncias (status, criado_em desc);

-- ADIÇÃO: busca por nome aguentando acento e erro de digitação.
-- `f_unaccent` (não `unaccent`) porque só a versão com dicionário fixado pode
-- entrar em índice — ver o comentário no 01-extensoes.sql.
create index if not exists idx_profiles_nome_busca
  on profiles using gin (f_unaccent(nome) gin_trgm_ops);
create index if not exists idx_terapias_nome_busca
  on terapias using gin (f_unaccent(nome) gin_trgm_ops);


-- ============================================================================
-- CONFERÊNCIA — esperado: 11 linhas (uma por tabela deste arquivo; o número
-- anterior, 9, estava errado desde a primeira versão — ninguém contou)
-- ============================================================================
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles','admins','terapias','perfis_terapeuta',
                     'terapeuta_terapias','servicos','horarios',
                     'avaliacoes','favoritos','denuncias','fotos_terapeuta')
order by table_name;
