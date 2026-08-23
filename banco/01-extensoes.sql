-- ============================================================================
-- 01 — EXTENSÕES
-- Rodar PRIMEIRO. As outras etapas dependem destas.
--
-- Onde rodar: Supabase → SQL Editor → New query → colar → Run.
-- ============================================================================

-- PostGIS: é o que permite perguntar "quem está a menos de X km daqui" sem
-- varrer a tabela inteira. Sem ela, a busca do mapa não existe.
create extension if not exists postgis;

-- ADIÇÃO ao arquivo 03 do briefing, com motivo:
-- `unaccent` remove acentos na comparação. Sem ela, quem digita "reiki" acha,
-- mas quem digita "constelacao" (sem cedilha, sem til) NÃO acha "Constelação
-- Familiar" — e é assim que metade das pessoas digita no celular.
create extension if not exists unaccent;

-- ADIÇÃO: `pg_trgm` faz a busca aguentar erro de digitação e busca parcial
-- ("apometr" acha "Apometria"). É o índice que segura a barra de busca.
create extension if not exists pg_trgm;

-- ⚠️ `unaccent()` NÃO É IMMUTABLE, e o Postgres recusa função não-immutable
-- dentro de índice ("functions in index expression must be marked IMMUTABLE").
-- Ela não é immutable porque depende do dicionário instalado, que pode mudar.
-- O invólucro abaixo fixa o dicionário e aí SIM pode ser indexada.
-- Sem isto, o 02-tabelas.sql falha na criação dos índices de busca.
create or replace function f_unaccent(texto text)
returns text
language sql
immutable
strict
parallel safe
as $$
  select public.unaccent('public.unaccent'::regdictionary, texto)
$$;

comment on function f_unaccent(text) is
  'unaccent() com o dicionário fixado, para poder entrar em índice. Use SEMPRE '
  'esta, nunca a unaccent() crua, em qualquer expressão indexada.';

-- Confere que as três entraram. Esperado: 3 linhas.
select extname from pg_extension where extname in ('postgis', 'unaccent', 'pg_trgm');

-- Confere o invólucro. Esperado: 'constelacao familiar'
select f_unaccent('Constelação Familiar');
