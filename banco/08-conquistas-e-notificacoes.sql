-- ============================================================================
-- 08 — CONQUISTAS E NOTIFICAÇÕES
--
-- Rodar DEPOIS do 05-catalogo e, de preferência, ANTES da semente (06):
-- os gatilhos daqui reagem a avaliações e favoritos, então rodar a semente
-- depois deles concede conquistas às clientes fictícias — o que é inofensivo
-- e até útil num banco de demonstração.
--
-- POR QUE A CONQUISTA É CONCEDIDA PELO BANCO, E NÃO PELO APLICATIVO
-- -----------------------------------------------------------------
-- Se o aplicativo escrevesse "conquistei X" direto na tabela, qualquer pessoa
-- com a chave anon escreveria também — e um selo que se dá a si mesmo não vale
-- nada. Aqui NINGUÉM tem permissão de INSERT em `conquistas_usuario`: quem
-- concede é o gatilho, disparado pelo fato em si (a avaliação publicada, o
-- perfil no ar). O aplicativo só LÊ. Regra no app é sugestão; no banco é lei.
-- ============================================================================


-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- ====== CATÁLOGO DE CONQUISTAS ======
-- Espelha o catálogo do protótipo (src/03b-conquistas.js). O conferidor
-- (banco/conferir.js) compara os dois — divergiu, reprova.
create table if not exists conquistas (
  id          text primary key,          -- 'primeira-avaliacao', legível em log
  nome        text not null,
  descricao   text not null,
  icone       text,
  papel       text not null check (papel in ('cliente','terapeuta','ambos')),
  ordem       int  not null default 0
);

-- ====== CONQUISTAS DE CADA PESSOA ======
create table if not exists conquistas_usuario (
  user_id        uuid not null references profiles(id) on delete cascade,
  conquista_id   text not null references conquistas(id) on delete cascade,
  conquistada_em timestamptz not null default now(),
  primary key (user_id, conquista_id)
);

comment on table conquistas_usuario is
  'Sem política de INSERT de propósito: só os gatilhos (security definer) '
  'escrevem aqui. Conquista que o app pudesse se dar não valeria nada.';

-- ====== NOTIFICAÇÕES (a caixa de entrada) ======
-- O que o app mostra vem daqui; o push (Fase 3) só AVISA que há algo aqui.
-- Assim a notificação sobrevive ao celular desligado: quem perdeu o aviso
-- encontra a caixa.
create table if not exists notificacoes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  tipo       text not null check (tipo in
             ('conquista','avaliacao_nova','resposta_nova','sistema')),
  titulo     text not null,
  corpo      text not null,
  dados      jsonb,                     -- ex.: {"conquista":"primeira-avaliacao"}
  criada_em  timestamptz not null default now(),
  lida_em    timestamptz               -- nulo = não lida
);

-- ====== PREFERÊNCIAS DE AVISO ======
-- "Inteligente" começa em respeitar a pessoa: horário de silêncio guardado
-- por usuária, não cravado no aplicativo.
create table if not exists preferencias_notificacao (
  user_id         uuid primary key references profiles(id) on delete cascade,
  avisos_ligados  boolean not null default true,
  silencio_inicio time    not null default '21:00',
  silencio_fim    time    not null default '08:00',
  atualizado_em   timestamptz not null default now()
);

-- ====== APARELHOS (pronto para o push da Fase 3) ======
-- O token de push identifica UM aparelho de UMA pessoa. Fica desde já no
-- modelo para a Fase 3 não precisar mexer em estrutura — só usar.
create table if not exists aparelhos (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  plataforma text not null check (plataforma in ('android','ios','web')),
  token_push text not null,
  criado_em  timestamptz not null default now(),
  visto_em   timestamptz not null default now(),
  unique (user_id, token_push)
);


-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

-- A pergunta mais frequente será "quantas não lidas?" — este índice parcial
-- responde sem varrer as lidas, que só acumulam.
create index if not exists idx_notificacoes_nao_lidas
  on notificacoes (user_id, criada_em desc) where lida_em is null;

create index if not exists idx_conquistas_usuario
  on conquistas_usuario (user_id);


-- ============================================================================
-- 3. O CATÁLOGO
-- ============================================================================
insert into conquistas (id, nome, descricao, icone, papel, ordem) values
  ('primeiros-passos',   'Primeiros passos', 'Abriu o mapa da sua região pela primeira vez', 'mapa',    'cliente',   1),
  ('exploradora',        'Exploradora',      'Visitou 5 perfis de terapeutas',               'busca',   'cliente',   2),
  ('colecionadora',      'Colecionadora',    'Guardou 3 terapeutas nas favoritas',           'coracao', 'cliente',   3),
  ('primeiro-contato',   'Primeiro contato', 'Chamou uma terapeuta no WhatsApp',             'zap',     'cliente',   4),
  ('primeira-avaliacao', 'Voz que ajuda',    'Publicou a sua primeira avaliação',            'estrela', 'cliente',   5),
  ('perfil-no-ar',       'Perfil no ar',     'Publicou o seu perfil profissional',           'local',   'terapeuta', 6),
  ('primeira-resposta',  'Diálogo aberto',   'Respondeu a uma avaliação recebida',           'lapis',   'terapeuta', 7)
on conflict (id) do nothing;


-- ============================================================================
-- 4. CONCEDER — a única porta de entrada
-- ============================================================================
-- Idempotente: conceder duas vezes não duplica nem re-notifica. É o que
-- permite chamá-la de vários gatilhos sem medo.
create or replace function conceder_conquista(pessoa uuid, slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  c conquistas%rowtype;
  ja_tem boolean;
begin
  select * into c from conquistas where id = slug;
  if not found then
    -- Slug errado é defeito de código, não condição de corrida: barulho, já.
    raise warning 'conquista inexistente: %', slug;
    return;
  end if;

  insert into conquistas_usuario (user_id, conquista_id)
  values (pessoa, slug)
  on conflict do nothing
  returning true into ja_tem;

  -- `returning` só devolve linha quando INSERIU: é o que separa a primeira
  -- vez das repetições, sem uma segunda consulta.
  if ja_tem then
    insert into notificacoes (user_id, tipo, titulo, corpo, dados)
    values (pessoa, 'conquista',
            'Conquista: ' || c.nome, c.descricao,
            jsonb_build_object('conquista', c.id));
  end if;
end;
$$;


-- ============================================================================
-- 5. OS GATILHOS — o fato concede, não a boa vontade
-- ============================================================================

-- Avaliação publicada → 'primeira-avaliacao' (para quem escreveu)
--                     → 'resposta_nova' é assunto do gatilho de resposta
create or replace function apos_avaliacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'publicada' then
    perform conceder_conquista(new.cliente_id, 'primeira-avaliacao');

    -- A terapeuta fica sabendo que foi avaliada — na caixa, não por mágica.
    insert into notificacoes (user_id, tipo, titulo, corpo, dados)
    values (new.terapeuta_id, 'avaliacao_nova',
            'Você recebeu uma avaliação',
            'Uma cliente avaliou o seu atendimento. Responder aumenta a confiança de quem procura.',
            jsonb_build_object('avaliacao', new.id));
  end if;
  return null;
end;
$$;

drop trigger if exists trg_apos_avaliacao on avaliacoes;
create trigger trg_apos_avaliacao
  after insert on avaliacoes
  for each row execute function apos_avaliacao();


-- Resposta escrita → 'primeira-resposta' (terapeuta) + aviso à autora
create or replace function apos_resposta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.resposta is not null and old.resposta is distinct from new.resposta then
    perform conceder_conquista(new.terapeuta_id, 'primeira-resposta');

    insert into notificacoes (user_id, tipo, titulo, corpo, dados)
    values (new.cliente_id, 'resposta_nova',
            'A terapeuta respondeu você',
            'Sua avaliação recebeu uma resposta.',
            jsonb_build_object('avaliacao', new.id));
  end if;
  return null;
end;
$$;

drop trigger if exists trg_apos_resposta on avaliacoes;
create trigger trg_apos_resposta
  after update of resposta on avaliacoes
  for each row execute function apos_resposta();


-- 3º favorito → 'colecionadora'
create or replace function apos_favorito()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from favoritos where cliente_id = new.cliente_id) >= 3 then
    perform conceder_conquista(new.cliente_id, 'colecionadora');
  end if;
  return null;
end;
$$;

drop trigger if exists trg_apos_favorito on favoritos;
create trigger trg_apos_favorito
  after insert on favoritos
  for each row execute function apos_favorito();


-- Perfil profissional criado → 'perfil-no-ar'
create or replace function apos_perfil_terapeuta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform conceder_conquista(new.user_id, 'perfil-no-ar');
  return null;
end;
$$;

drop trigger if exists trg_apos_perfil_terapeuta on perfis_terapeuta;
create trigger trg_apos_perfil_terapeuta
  after insert on perfis_terapeuta
  for each row execute function apos_perfil_terapeuta();

-- 'primeiros-passos', 'exploradora' e 'primeiro-contato' acontecem no APARELHO
-- (abrir mapa, ver perfil, tocar no WhatsApp) e não deixam rastro no banco —
-- de propósito: registrar cada tela vista seria coletar mais do que o app
-- precisa (minimização, arquivo 04). Elas são concedidas pela função abaixo,
-- que o app chama, e valem o que valem: selos de uso, não de fato verificável.
create or replace function conceder_conquista_de_uso(slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Só as três de uso podem vir do aplicativo. As demais, nem por aqui.
  if slug not in ('primeiros-passos', 'exploradora', 'primeiro-contato') then
    raise exception 'a conquista % não pode ser concedida pelo aplicativo', slug;
  end if;
  perform conceder_conquista(auth.uid(), slug);
end;
$$;


-- ============================================================================
-- 6. RLS
-- ============================================================================
alter table conquistas               enable row level security;
alter table conquistas_usuario       enable row level security;
alter table notificacoes             enable row level security;
alter table preferencias_notificacao enable row level security;
alter table aparelhos                enable row level security;

drop policy if exists "catalogo de conquistas e publico" on conquistas;
create policy "catalogo de conquistas e publico" on conquistas
  for select to anon, authenticated using (true);

drop policy if exists "cada um ve as proprias conquistas" on conquistas_usuario;
create policy "cada um ve as proprias conquistas" on conquistas_usuario
  for select to authenticated using (auth.uid() = user_id);
-- Sem INSERT/UPDATE/DELETE: só os gatilhos escrevem. É o ponto inteiro.

drop policy if exists "cada um le as proprias notificacoes" on notificacoes;
create policy "cada um le as proprias notificacoes" on notificacoes
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "marcar como lida" on notificacoes;
create policy "marcar como lida" on notificacoes
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- UPDATE liberado na linha; a coluna é restringida abaixo — RLS não sabe
-- separar coluna, e sem o revoke a pessoa reescreveria o TEXTO do aviso.
revoke update on notificacoes from authenticated;
grant  update (lida_em) on notificacoes to authenticated;

drop policy if exists "preferencias sao da pessoa" on preferencias_notificacao;
create policy "preferencias sao da pessoa" on preferencias_notificacao
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "aparelhos sao da pessoa" on aparelhos;
create policy "aparelhos sao da pessoa" on aparelhos
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================================
-- CONFERÊNCIA — esperado: 7 conquistas, 5 tabelas com RLS, 4 gatilhos
-- ============================================================================
select count(*) as conquistas_no_catalogo from conquistas;

select c.relname as tabela, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('conquistas','conquistas_usuario','notificacoes',
                    'preferencias_notificacao','aparelhos')
order by 1;

select tgname from pg_trigger
where tgname like 'trg_apos%' and not tgisinternal
order by 1;
