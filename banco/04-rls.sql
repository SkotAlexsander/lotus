-- ============================================================================
-- 04 — ROW LEVEL SECURITY (arquivo 04 do briefing)
--
-- ⚠️ LEIA ISTO ANTES DE RODAR QUALQUER COISA
--
-- No Supabase, a chave `anon` vai DENTRO do aplicativo — ela é pública por
-- projeto, qualquer pessoa lê o JavaScript e a copia. Isso é normal e esperado.
-- O que separa "normal" de "vazamento" é UMA coisa: RLS ligada em toda tabela.
--
-- Tabela com RLS DESLIGADA é aberta para o mundo com essa chave: dá para ler,
-- alterar e apagar tudo de fora do aplicativo, sem exploit nenhum, com um
-- comando de terminal.
--
-- Por isso este arquivo começa ligando RLS em TODAS as tabelas e termina com uma
-- consulta que aponta qualquer uma que tenha ficado de fora. Rode a conferência
-- do fim SEMPRE que criar tabela nova.
-- ============================================================================


-- ============================================================================
-- 1. LIGAR A RLS EM TUDO
-- ============================================================================
alter table profiles            enable row level security;
alter table admins              enable row level security;
alter table terapias            enable row level security;
alter table perfis_terapeuta    enable row level security;
alter table terapeuta_terapias  enable row level security;
alter table servicos            enable row level security;
alter table fotos_terapeuta     enable row level security;
alter table horarios            enable row level security;
alter table avaliacoes          enable row level security;
alter table favoritos           enable row level security;
alter table denuncias           enable row level security;


-- ============================================================================
-- 2. PERMISSÕES DE COLUNA
-- ============================================================================
--
-- RLS decide QUAIS LINHAS. Isto decide QUAIS COLUNAS. São coisas diferentes e
-- as duas são necessárias: sem esta parte, quem lê `profiles` para mostrar o
-- primeiro nome de quem avaliou leva junto o TELEFONE da pessoa.

revoke all on profiles from anon, authenticated;
grant select (id, papel, nome, foto_url, criado_em) on profiles to authenticated;
grant update (nome, foto_url, telefone)             on profiles to authenticated;
grant delete                                        on profiles to authenticated;
-- INSERT em profiles não é dado a ninguém de propósito: quem cria a linha é o
-- gatilho `handle_new_user`, no momento do cadastro.

-- O telefone é da pessoa e de mais ninguém. A política de leitura abaixo já
-- limita a linha; o grant separado abaixo devolve a coluna só para a dona.
grant select (telefone) on profiles to authenticated;
-- (a política "ver o próprio perfil" é o que impede ler o telefone alheio)


-- ============================================================================
-- 3. PROFILES
-- ============================================================================
drop policy if exists "ver perfis" on profiles;
create policy "ver perfis" on profiles
  for select to authenticated
  using (true);
-- Nome e foto são públicos por necessidade: aparecem em cada avaliação e em cada
-- pino do mapa. O telefone fica de fora pelo grant de coluna acima.

drop policy if exists "editar o proprio perfil" on profiles;
create policy "editar o proprio perfil" on profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "excluir a propria conta" on profiles;
create policy "excluir a propria conta" on profiles
  for delete to authenticated
  using (auth.uid() = id);
-- LGPD, direito da titular (arquivo 04): apagar a conta apaga tudo em cascata.


-- ============================================================================
-- 4. ADMINS
-- ============================================================================
drop policy if exists "so admin ve admins" on admins;
create policy "so admin ve admins" on admins
  for select to authenticated
  using (sou_admin());
-- Nenhuma política de INSERT/UPDATE/DELETE, de propósito: admin se cadastra
-- pelo painel do Supabase, nunca pelo aplicativo. Sem política, a operação é
-- negada — RLS nega tudo o que não foi explicitamente liberado.


-- ============================================================================
-- 5. TERAPIAS (catálogo)
-- ============================================================================
drop policy if exists "catalogo e publico" on terapias;
create policy "catalogo e publico" on terapias
  for select to anon, authenticated
  using (true);

drop policy if exists "so admin mexe no catalogo" on terapias;
create policy "so admin mexe no catalogo" on terapias
  for all to authenticated
  using (sou_admin())
  with check (sou_admin());


-- ============================================================================
-- 6. PERFIS DE TERAPEUTA
-- ============================================================================
drop policy if exists "ver perfis ativos" on perfis_terapeuta;
create policy "ver perfis ativos" on perfis_terapeuta
  for select to authenticated
  using (ativa = true or auth.uid() = user_id or sou_admin());
-- Perfil pausado (férias, RF15) some para todo mundo menos para a dona.

drop policy if exists "criar o proprio perfil" on perfis_terapeuta;
create policy "criar o proprio perfil" on perfis_terapeuta
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from profiles p
                where p.id = auth.uid() and p.papel = 'terapeuta')
  );
-- ⚠️ A conferência do papel é AQUI, no servidor. No aplicativo ela é só
-- experiência: quem chama a API direto ignora a tela.

drop policy if exists "atualizar o proprio perfil" on perfis_terapeuta;
create policy "atualizar o proprio perfil" on perfis_terapeuta
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "apagar o proprio perfil" on perfis_terapeuta;
create policy "apagar o proprio perfil" on perfis_terapeuta
  for delete to authenticated
  using (auth.uid() = user_id);

-- ⚠️ `verificada` NÃO pode ser escrita pela própria terapeuta — senão o selo de
-- confiança do app vira um botão que qualquer uma aperta. Só admin.
revoke update (verificada) on perfis_terapeuta from authenticated;


-- ============================================================================
-- 7. O QUE PENDURA NO PERFIL (terapias, serviços, horários)
-- ============================================================================
-- Mesmo padrão nas três: leitura pública de quem está ativa, escrita só da dona.

drop policy if exists "ler terapias de quem esta ativa" on terapeuta_terapias;
create policy "ler terapias de quem esta ativa" on terapeuta_terapias
  for select to authenticated
  using (exists (select 1 from perfis_terapeuta p
                 where p.user_id = terapeuta_id
                   and (p.ativa or p.user_id = auth.uid())));

drop policy if exists "dona mexe nas proprias terapias" on terapeuta_terapias;
create policy "dona mexe nas proprias terapias" on terapeuta_terapias
  for all to authenticated
  using (auth.uid() = terapeuta_id)
  with check (auth.uid() = terapeuta_id);


drop policy if exists "ler servicos de quem esta ativa" on servicos;
create policy "ler servicos de quem esta ativa" on servicos
  for select to authenticated
  using (exists (select 1 from perfis_terapeuta p
                 where p.user_id = terapeuta_id
                   and (p.ativa or p.user_id = auth.uid())));

drop policy if exists "dona mexe nos proprios servicos" on servicos;
create policy "dona mexe nos proprios servicos" on servicos
  for all to authenticated
  using (auth.uid() = terapeuta_id)
  with check (auth.uid() = terapeuta_id);


-- Fotos seguem a mesma regra dos serviços: o mundo vê as de perfil ativo,
-- e só a dona mexe nas dela.
drop policy if exists "ler fotos de quem esta ativa" on fotos_terapeuta;
create policy "ler fotos de quem esta ativa" on fotos_terapeuta
  for select to authenticated
  using (exists (select 1 from perfis_terapeuta p
                 where p.user_id = terapeuta_id
                   and (p.ativa or p.user_id = auth.uid())));

drop policy if exists "dona mexe nas proprias fotos" on fotos_terapeuta;
create policy "dona mexe nas proprias fotos" on fotos_terapeuta
  for all to authenticated
  using (auth.uid() = terapeuta_id)
  with check (auth.uid() = terapeuta_id);


drop policy if exists "ler horarios de quem esta ativa" on horarios;
create policy "ler horarios de quem esta ativa" on horarios
  for select to authenticated
  using (exists (select 1 from perfis_terapeuta p
                 where p.user_id = terapeuta_id
                   and (p.ativa or p.user_id = auth.uid())));

drop policy if exists "dona mexe nos proprios horarios" on horarios;
create policy "dona mexe nos proprios horarios" on horarios
  for all to authenticated
  using (auth.uid() = terapeuta_id)
  with check (auth.uid() = terapeuta_id);


-- ============================================================================
-- 8. AVALIAÇÕES
-- ============================================================================
drop policy if exists "ler avaliacoes publicadas" on avaliacoes;
create policy "ler avaliacoes publicadas" on avaliacoes
  for select to authenticated
  using (
    status = 'publicada'
    or auth.uid() in (cliente_id, terapeuta_id)
    or sou_admin()
  );
-- Avaliação em moderação continua visível para quem escreveu e para quem
-- recebeu — sumir sem explicação é pior que estar pendente.

drop policy if exists "cliente avalia" on avaliacoes;
create policy "cliente avalia" on avaliacoes
  for insert to authenticated
  with check (
    auth.uid() = cliente_id
    and exists (select 1 from profiles p
                where p.id = auth.uid() and p.papel = 'cliente')
  );
-- As outras duas travas anti-fraude (1 por cliente, ninguém se avalia) são
-- CONSTRAINTs em 02-tabelas.sql — política se troca, constraint não.

drop policy if exists "autora edita a propria avaliacao" on avaliacoes;
create policy "autora edita a propria avaliacao" on avaliacoes
  for update to authenticated
  using (auth.uid() = cliente_id)
  with check (auth.uid() = cliente_id);

drop policy if exists "terapeuta responde a avaliacao" on avaliacoes;
create policy "terapeuta responde a avaliacao" on avaliacoes
  for update to authenticated
  using (auth.uid() = terapeuta_id)
  with check (auth.uid() = terapeuta_id);
-- ⚠️ Esta política sozinha deixaria a terapeuta REESCREVER a nota que recebeu:
-- RLS libera a LINHA inteira. Quem impede é o gatilho `proteger_avaliacao`
-- (03-funcoes-e-gatilhos.sql, seção 5b). Sem ele, esta política é um buraco.

drop policy if exists "autora apaga a propria avaliacao" on avaliacoes;
create policy "autora apaga a propria avaliacao" on avaliacoes
  for delete to authenticated
  using (auth.uid() = cliente_id or sou_admin());

drop policy if exists "admin modera" on avaliacoes;
create policy "admin modera" on avaliacoes
  for update to authenticated
  using (sou_admin())
  with check (sou_admin());


-- ============================================================================
-- 9. FAVORITOS
-- ============================================================================
drop policy if exists "so a dona ve as proprias favoritas" on favoritos;
create policy "so a dona ve as proprias favoritas" on favoritos
  for all to authenticated
  using (auth.uid() = cliente_id)
  with check (auth.uid() = cliente_id);
-- Quem uma pessoa favoritou é informação dela. Nem a terapeuta favoritada vê.


-- ============================================================================
-- 10. DENÚNCIAS
-- ============================================================================
drop policy if exists "qualquer pessoa denuncia" on denuncias;
create policy "qualquer pessoa denuncia" on denuncias
  for insert to authenticated
  with check (auth.uid() = autor_id);

drop policy if exists "so admin le denuncias" on denuncias;
create policy "so admin le denuncias" on denuncias
  for select to authenticated
  using (sou_admin());
-- A denúncia é anônima para quem foi denunciado (arquivo 04). Se a terapeuta
-- pudesse ler a fila, a denúncia deixaria de ser segura para quem denuncia.

drop policy if exists "so admin resolve denuncias" on denuncias;
create policy "so admin resolve denuncias" on denuncias
  for update to authenticated
  using (sou_admin())
  with check (sou_admin());


-- ============================================================================
-- CONFERÊNCIA 1 — ⚠️ tem de voltar VAZIA
-- Qualquer tabela listada aqui está aberta para o mundo com a chave `anon`.
-- ============================================================================
select c.relname as tabela_sem_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity
order by 1;


-- ============================================================================
-- CONFERÊNCIA 2 — tabela com RLS ligada e NENHUMA política também tem de
-- aparecer vazia aqui (RLS ligada sem política = ninguém lê nada, o app quebra).
-- ============================================================================
select c.relname as tabela_sem_politica
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity
  and not exists (select 1 from pg_policy p where p.polrelid = c.oid)
order by 1;


-- ============================================================================
-- CONFERÊNCIA 3 — o mapa das políticas, para leitura humana
-- ============================================================================
select tablename as tabela, policyname as politica, cmd as operacao
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;
