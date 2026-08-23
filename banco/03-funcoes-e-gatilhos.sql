-- ============================================================================
-- 03 — FUNÇÕES E GATILHOS
--
-- Aqui mora o que o banco faz SOZINHO. A regra que orienta o arquivo inteiro:
-- o que precisa ser verdade sempre não pode depender do aplicativo lembrar de
-- fazer. Regra no app é sugestão; regra no banco é lei.
-- ============================================================================


-- ============================================================================
-- 1. ⚠️ O GATILHO QUE FALTA NO BRIEFING — sem ele o app não funciona
-- ============================================================================
--
-- O arquivo 03 diz que `profiles` "espelha o login do Supabase Auth". Mas nada
-- faz esse espelho acontecer: quem cria conta entra em `auth.users` e NÃO ganha
-- linha em `profiles`. Resultado: a pessoa loga, o app procura o perfil dela,
-- não acha, e trava — sem erro nenhum no caminho.
--
-- `security definer` é obrigatório: o gatilho roda no momento do cadastro, quando
-- a pessoa ainda não tem permissão para escrever em `profiles`.
--
-- ⚠️ CUIDADO: erro dentro deste gatilho REPROVA O CADASTRO INTEIRO. Por isso o
-- papel é normalizado à força em vez de confiar no que veio do cliente: um
-- `papel` inválido bateria no CHECK e ninguém mais conseguiria criar conta.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, papel, nome, telefone)
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'papel' = 'terapeuta' then 'terapeuta'
      else 'cliente'
    end,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'nome'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),   -- vem do Google
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Pessoa'
    ),
    new.phone
  )
  on conflict (id) do nothing;   -- reexecução não pode quebrar o cadastro
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ============================================================================
-- 2. Quem é admin (usado pelas políticas do 04-rls.sql)
-- ============================================================================
--
-- `security definer` aqui não é conveniência, é necessidade: as políticas da
-- própria tabela `admins` chamam esta função. Sem definer, a política consulta
-- a tabela que a política protege e o Postgres entra em recursão infinita.
create or replace function sou_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;


-- ============================================================================
-- 3. "Aberta agora" — o mesmo cálculo do app, agora também no banco
-- ============================================================================
--
-- O app já calcula isso (arquivo 02). Existir aqui também é o que permite o
-- FILTRO "aberta agora" rodar no servidor na Fase 2 — filtrar no aplicativo
-- exigiria baixar todo mundo primeiro.
--
-- O fuso é parâmetro e não `now()` cru de propósito: o servidor do Supabase
-- roda em UTC. Comparar 14:00 UTC com "abre às 14:00" erraria em 3 horas.
create or replace function esta_aberta(
  p_terapeuta uuid,
  quando      timestamptz default now(),
  fuso        text        default 'America/Sao_Paulo'
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from horarios h
    where h.terapeuta_id = p_terapeuta
      and h.dia_semana = extract(dow from (quando at time zone fuso))::int
      and (quando at time zone fuso)::time >= h.abre
      and (quando at time zone fuso)::time <  h.fecha
  );
$$;

comment on function esta_aberta(uuid, timestamptz, text) is
  'extract(dow) devolve 0 para domingo — a mesma convenção de horarios.dia_semana. '
  'Se um dia isso mudar, o selo passa a mentir um dia inteiro sem dar erro.';


-- ============================================================================
-- 4. A faixa de preço deixa de poder mentir
-- ============================================================================
--
-- `perfis_terapeuta.preco_min/preco_max` repetem o que já está em `servicos`.
-- Campo repetido SEMPRE diverge: a terapeuta muda o valor de um serviço e o
-- mapa continua mostrando o preço antigo. Este gatilho recalcula a faixa a cada
-- mudança em `servicos`, então a repetição para de ser um risco.
create or replace function sincronizar_faixa_preco()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  alvo uuid;
begin
  -- Em gatilho de DELETE o registro `new` NÃO EXISTE: tocar em `new.qualquer`
  -- levanta "record new is not assigned yet". Por isso o desvio explícito.
  if (tg_op = 'DELETE') then
    alvo := old.terapeuta_id;
  else
    alvo := new.terapeuta_id;
  end if;

  update perfis_terapeuta p
     set preco_min = faixa.mn,
         preco_max = faixa.mx
    from (
      select min(valor) as mn, max(valor) as mx
      from servicos
      where terapeuta_id = alvo
    ) as faixa
   where p.user_id = alvo;

  -- Mudou de dona (raro, mas possível): a antiga também precisa recalcular.
  if (tg_op = 'UPDATE' and old.terapeuta_id is distinct from new.terapeuta_id) then
    update perfis_terapeuta p
       set preco_min = faixa.mn, preco_max = faixa.mx
      from (select min(valor) as mn, max(valor) as mx
            from servicos where terapeuta_id = old.terapeuta_id) as faixa
     where p.user_id = old.terapeuta_id;
  end if;

  return null;   -- gatilho AFTER: o retorno é ignorado
end;
$$;

drop trigger if exists trg_faixa_preco on servicos;
create trigger trg_faixa_preco
  after insert or update or delete on servicos
  for each row execute function sincronizar_faixa_preco();


-- ============================================================================
-- 5. Moderação automática de avaliação (arquivo 04, item 5)
-- ============================================================================
--
-- Palavrão detectado → a avaliação nasce 'pendente' e não aparece até um admin
-- olhar. Não bloqueia: bloquear ensina a pessoa a driblar o filtro.
--
-- A lista vive dentro da função por enquanto. Quando existir painel de admin
-- (Fase 4), ela vira tabela editável — está anotado no roadmap.
create or replace function moderar_avaliacao()
returns trigger
language plpgsql
as $$
declare
  suspeitas text[] := array[
    'idiota','burra','burro','vagabunda','vagabundo','golpista','charlatã',
    'charlata','ladra','ladrao','ladrão','estelionat','picareta','fraude'
  ];
  texto text;
  palavra text;
begin
  if new.comentario is null then
    return new;
  end if;

  -- Sem acento e em minúsculas: "charlatã" e "charlata" têm de cair no mesmo lugar.
  texto := lower(f_unaccent(new.comentario));

  foreach palavra in array suspeitas loop
    if position(f_unaccent(palavra) in texto) > 0 then
      new.status := 'pendente';
      exit;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_moderar_avaliacao on avaliacoes;
create trigger trg_moderar_avaliacao
  before insert or update of comentario on avaliacoes
  for each row execute function moderar_avaliacao();


-- ============================================================================
-- 5b. A terapeuta responde, mas NÃO reescreve a nota que recebeu
-- ============================================================================
--
-- O arquivo 01 (RF16) dá à terapeuta o direito de responder avaliações. Na
-- prática isso vira permissão de UPDATE na linha da avaliação — e RLS decide
-- QUAL LINHA, nunca QUAIS COLUNAS. Só com política, quem responde a uma crítica
-- de 2 estrelas poderia transformá-la em 5 e reescrever o texto.
--
-- Este gatilho é a trava: quem não é a autora só consegue mexer em `resposta`.
create or replace function proteger_avaliacao()
returns trigger
language plpgsql
as $$
begin
  -- A própria autora edita nota e comentário à vontade (RF10: editável).
  if auth.uid() = old.cliente_id then
    -- ...mas não escreve a resposta no lugar da terapeuta.
    if new.resposta is distinct from old.resposta then
      raise exception 'A resposta é da terapeuta, não de quem avaliou.';
    end if;
    return new;
  end if;

  -- Qualquer outra pessoa (na prática: a terapeuta avaliada) só toca a resposta.
  if new.nota       is distinct from old.nota
     or new.comentario is distinct from old.comentario
     or new.cliente_id is distinct from old.cliente_id
     or new.criado_em  is distinct from old.criado_em then
    raise exception 'Só a autora pode alterar a nota e o comentário.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_proteger_avaliacao on avaliacoes;
create trigger trg_proteger_avaliacao
  before update on avaliacoes
  for each row execute function proteger_avaliacao();


-- ============================================================================
-- 6. A CONSULTA PRINCIPAL DO MAPA — "quem está perto de mim"
-- ============================================================================
--
-- Vinda do arquivo 03, com três correções assinaladas.
create or replace function terapeutas_proximas(
  lat    double precision,
  lng    double precision,
  raio_m int default 30000
)
returns table (
  user_id          uuid,
  nome             text,
  foto_url         text,
  bairro           text,
  cidade           text,
  uf               char(2),
  latitude         double precision,
  longitude        double precision,
  preco_min        numeric,
  preco_max        numeric,
  verificada       boolean,
  aberta_agora     boolean,
  nota_media       numeric,
  total_avaliacoes bigint,
  distancia_m      double precision
)
language sql
stable
as $$
  select
    p.user_id,
    pr.nome,
    pr.foto_url,
    p.bairro,
    p.cidade,
    p.uf,

    -- CORREÇÃO 1 (privacidade): quem marcou "mostrar só o bairro" tem a posição
    -- ARREDONDADA para uma grade de ~330 m antes de sair do banco. Mascarar só
    -- na tela não adianta: a posição exata já teria viajado pela rede, e quem
    -- olha a resposta da API vê o endereço de casa dela.
    case when p.so_bairro
         then round(st_y(p.localizacao::geometry)::numeric / 0.003) * 0.003
         else st_y(p.localizacao::geometry)::numeric
    end::double precision,
    case when p.so_bairro
         then round(st_x(p.localizacao::geometry)::numeric / 0.003) * 0.003
         else st_x(p.localizacao::geometry)::numeric
    end::double precision,

    p.preco_min,
    p.preco_max,
    p.verificada,
    esta_aberta(p.user_id),

    round(avg(a.nota) filter (where a.status = 'publicada'), 1),
    count(a.id) filter (where a.status = 'publicada'),
    st_distance(p.localizacao, st_makepoint(lng, lat)::geography)
  from perfis_terapeuta p
  join profiles pr on pr.id = p.user_id
  left join avaliacoes a on a.terapeuta_id = p.user_id
  where p.ativa
    and st_dwithin(p.localizacao, st_makepoint(lng, lat)::geography, raio_m)

  -- CORREÇÃO 2: agrupar pelas CHAVES PRIMÁRIAS (`p.user_id`, `pr.id`), não por
  -- `pr.nome, pr.foto_url`. Agrupar por nome funciona por acidente enquanto
  -- ninguém acrescenta coluna de `profiles` ao select — no dia em que alguém
  -- acrescentar, o erro aparece longe daqui.
  group by p.user_id, pr.id

  order by distancia_m;
$$;

comment on function terapeutas_proximas(double precision, double precision, int) is
  'CORREÇÃO 3 em relação ao arquivo 03: a posição da CLIENTE chega por parâmetro '
  'e não é gravada em lugar nenhum — nem em log de aplicação. É a regra de ouro '
  'do modelo (arquivo 03) e a minimização do arquivo 04.';


-- ============================================================================
-- 7. A vitrine pública — é isto que o app deve ler
-- ============================================================================
--
-- RLS filtra LINHA, não COLUNA: mesmo com a política certa, quem lê
-- `perfis_terapeuta` recebe o `endereco` completo de quem pediu para mostrar só
-- o bairro. A view resolve mascarando na origem.
create or replace view terapeutas_publicas as
select
  p.user_id,
  pr.nome,
  pr.foto_url,
  p.bio,
  case when p.so_bairro
       then coalesce(p.bairro, p.cidade) || ' — endereço enviado após contato'
       else p.endereco
  end                                   as endereco,
  p.bairro,
  p.cidade,
  p.uf,
  case when p.so_bairro
       then round(st_y(p.localizacao::geometry)::numeric / 0.003) * 0.003
       else st_y(p.localizacao::geometry)::numeric
  end::double precision                 as latitude,
  case when p.so_bairro
       then round(st_x(p.localizacao::geometry)::numeric / 0.003) * 0.003
       else st_x(p.localizacao::geometry)::numeric
  end::double precision                 as longitude,
  p.atendimento,
  p.whatsapp,
  p.instagram,
  p.preco_min,
  p.preco_max,
  p.verificada,
  esta_aberta(p.user_id)                as aberta_agora
from perfis_terapeuta p
join profiles pr on pr.id = p.user_id
where p.ativa;

-- ⚠️ `security_invoker` faz a view respeitar a RLS de quem consulta. SEM isto,
-- a view roda com os poderes de quem a criou e vira um buraco por onde se lê
-- tudo, RLS ou não. É o erro mais comum de view no Supabase.
alter view terapeutas_publicas set (security_invoker = on);


-- ============================================================================
-- CONFERÊNCIA — esperado: 6 funções e 1 view
-- ============================================================================
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('handle_new_user','sou_admin','esta_aberta',
                       'sincronizar_faixa_preco','moderar_avaliacao',
                       'terapeutas_proximas')
order by routine_name;

select table_name from information_schema.views
where table_schema = 'public' and table_name = 'terapeutas_publicas';
