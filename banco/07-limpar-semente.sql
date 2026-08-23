-- ============================================================================
-- 07 — APAGAR A SEMENTE DE DEMONSTRAÇÃO
--
-- Tira do banco as 12 terapeutas e as 55 clientes fictícias, sem tocar em quem
-- se cadastrou de verdade.
--
-- Como ele sabe a diferença: todo usuário da semente tem e-mail terminado em
-- `@exemplo.invalido`. O domínio `.invalido` é reservado justamente para isto
-- (RFC 2606) — nenhuma pessoa real pode ter um endereço assim, nem por engano.
--
-- O resto some sozinho: `profiles` referencia `auth.users` com
-- `on delete cascade`, e tudo o mais pendura em `profiles`.
-- ============================================================================

begin;

-- Quantos vão sair (rode antes, para não apagar no escuro)
select count(*) as usuarios_de_demonstracao
from auth.users
where email like '%@exemplo.invalido';

delete from auth.users
where email like '%@exemplo.invalido';

commit;

-- ============================================================================
-- CONFERÊNCIA — as quatro têm de voltar zero
-- ============================================================================
select 'usuarios demo'  as coisa, count(*) as sobrou from auth.users where email like '%@exemplo.invalido'
union all select 'perfis',     count(*) from perfis_terapeuta
union all select 'avaliacoes', count(*) from avaliacoes
union all select 'servicos',   count(*) from servicos;

-- ⚠️ Se `perfis` NÃO voltar zero e você não cadastrou ninguém de verdade, é
-- sinal de que o `on delete cascade` não está no lugar. Confira 02-tabelas.sql
-- antes de seguir: sem o cascade, excluir conta (LGPD) deixa rastro.
