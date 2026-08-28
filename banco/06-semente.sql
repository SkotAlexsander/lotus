-- ============================================================================
-- 06 — SEMENTE DE DEMONSTRAÇÃO  (ARQUIVO GERADO — NÃO EDITE À MÃO)
--
-- Gerado por banco/gerar_semente.js a partir de src/03-dados.js, que é a fonte
-- única das 12 terapeutas fictícias. Editar aqui é criar uma segunda verdade.
--
-- ⚠️ ISTO É PARA UM BANCO DE DEMONSTRAÇÃO. NÃO RODE EM PRODUÇÃO.
--
--    Ele insere usuários direto em auth.users — coisa que o Supabase espera que
--    seja feita pelo cadastro, não por SQL. Funciona para dar sustentação às
--    chaves estrangeiras (nenhum destes usuários consegue logar: a senha é um
--    hash inválido de propósito), mas não é o caminho de um banco real.
--
-- Nenhuma pessoa, telefone ou endereço abaixo existe.
-- Para desfazer: rode 07-limpar-semente.sql.
-- ============================================================================

begin;

-- ------------------------------------------------------------------------
-- 55 clientes fictícias (as autoras das avaliações)
-- ------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '5431d1d0-e32e-4c0a-8f03-2c157cd206dc', 'authenticated', 'authenticated',
  'cliente01@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Cláudia M.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('5431d1d0-e32e-4c0a-8f03-2c157cd206dc', 'cliente', 'Cláudia M.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '949030bb-f30c-4097-be10-ec66062c93ca', 'authenticated', 'authenticated',
  'cliente02@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Juliana T.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('949030bb-f30c-4097-be10-ec66062c93ca', 'cliente', 'Juliana T.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '404363ed-98ca-4d3d-a793-1739987c4025', 'authenticated', 'authenticated',
  'cliente03@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Marcelo P.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('404363ed-98ca-4d3d-a793-1739987c4025', 'cliente', 'Marcelo P.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a1af79e4-7522-4bb6-8cfa-70511c7d2b99', 'authenticated', 'authenticated',
  'cliente04@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Ana Paula S.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('a1af79e4-7522-4bb6-8cfa-70511c7d2b99', 'cliente', 'Ana Paula S.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '824a870c-5891-4add-9cd2-a692a12c7c92', 'authenticated', 'authenticated',
  'cliente05@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Rita C.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('824a870c-5891-4add-9cd2-a692a12c7c92', 'cliente', 'Rita C.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '4d0b8426-933e-4dae-b8b1-7c8a9f8d9166', 'authenticated', 'authenticated',
  'cliente06@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Fernanda L.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('4d0b8426-933e-4dae-b8b1-7c8a9f8d9166', 'cliente', 'Fernanda L.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '84e15761-bdf8-444c-99dc-9d4207ea6b92', 'authenticated', 'authenticated',
  'cliente07@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Bruna R.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('84e15761-bdf8-444c-99dc-9d4207ea6b92', 'cliente', 'Bruna R.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'e1b385f8-5c60-4f3e-922f-19cdd8994e2a', 'authenticated', 'authenticated',
  'cliente08@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Camila V.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('e1b385f8-5c60-4f3e-922f-19cdd8994e2a', 'cliente', 'Camila V.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'd06ec71c-f1be-4ac2-83d2-fcea28b6ff21', 'authenticated', 'authenticated',
  'cliente09@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Patrícia G.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('d06ec71c-f1be-4ac2-83d2-fcea28b6ff21', 'cliente', 'Patrícia G.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '91dc7076-b3df-4b3e-b999-4a5c939e71ab', 'authenticated', 'authenticated',
  'cliente10@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Letícia F.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('91dc7076-b3df-4b3e-b999-4a5c939e71ab', 'cliente', 'Letícia F.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '75951a73-8152-4056-8bcc-f4df48a30372', 'authenticated', 'authenticated',
  'cliente11@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Sandra B.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('75951a73-8152-4056-8bcc-f4df48a30372', 'cliente', 'Sandra B.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '90092862-dab4-4959-822e-dd9070f819e8', 'authenticated', 'authenticated',
  'cliente12@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Elisandra K.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('90092862-dab4-4959-822e-dd9070f819e8', 'cliente', 'Elisandra K.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'c11aadbc-929e-4b87-aa0c-c132f2eb469a', 'authenticated', 'authenticated',
  'cliente13@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Vera M.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('c11aadbc-929e-4b87-aa0c-c132f2eb469a', 'cliente', 'Vera M.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'f9138173-4f31-4c01-b0f9-46919fbd007a', 'authenticated', 'authenticated',
  'cliente14@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Douglas A.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('f9138173-4f31-4c01-b0f9-46919fbd007a', 'cliente', 'Douglas A.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'fad6980f-f1c4-4659-aeb2-acbac8e33123', 'authenticated', 'authenticated',
  'cliente15@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Renata C.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('fad6980f-f1c4-4659-aeb2-acbac8e33123', 'cliente', 'Renata C.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '0adce106-263d-472a-a3da-b902c0eca88c', 'authenticated', 'authenticated',
  'cliente16@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Tatiane O.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('0adce106-263d-472a-a3da-b902c0eca88c', 'cliente', 'Tatiane O.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '3b11bc7b-2757-42b7-a827-41dd4a0ea4fb', 'authenticated', 'authenticated',
  'cliente17@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Aline S.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('3b11bc7b-2757-42b7-a827-41dd4a0ea4fb', 'cliente', 'Aline S.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '786c2e4b-d616-47cd-aa85-b14e04a9fa32', 'authenticated', 'authenticated',
  'cliente18@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Michele D.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('786c2e4b-d616-47cd-aa85-b14e04a9fa32', 'cliente', 'Michele D.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'fbf10daf-7dc1-4c16-a85c-25525a3b9cd4', 'authenticated', 'authenticated',
  'cliente19@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Karina P.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('fbf10daf-7dc1-4c16-a85c-25525a3b9cd4', 'cliente', 'Karina P.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a8bab833-8006-4ea7-8fc6-f607d2d87c1a', 'authenticated', 'authenticated',
  'cliente20@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Simara L.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('a8bab833-8006-4ea7-8fc6-f607d2d87c1a', 'cliente', 'Simara L.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '16705be1-6af1-4b86-a01a-c3090dea2037', 'authenticated', 'authenticated',
  'cliente21@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Cristiane H.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('16705be1-6af1-4b86-a01a-c3090dea2037', 'cliente', 'Cristiane H.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'e74b557a-8b95-4114-8a60-ab76b7ac0619', 'authenticated', 'authenticated',
  'cliente22@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Rodrigo N.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('e74b557a-8b95-4114-8a60-ab76b7ac0619', 'cliente', 'Rodrigo N.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '26c96869-cf83-4eb2-9bc9-ee1ebcad80a0', 'authenticated', 'authenticated',
  'cliente23@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Ivana F.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('26c96869-cf83-4eb2-9bc9-ee1ebcad80a0', 'cliente', 'Ivana F.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'e95298aa-4acf-4b0f-ae0b-07ee93938b7f', 'authenticated', 'authenticated',
  'cliente24@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Sônia R.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('e95298aa-4acf-4b0f-ae0b-07ee93938b7f', 'cliente', 'Sônia R.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '9ec25ae2-be33-48a1-976c-2767ab5e4052', 'authenticated', 'authenticated',
  'cliente25@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Josiane M.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('9ec25ae2-be33-48a1-976c-2767ab5e4052', 'cliente', 'Josiane M.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'f6728243-3532-4dd0-abfa-b593d4e0d8ce', 'authenticated', 'authenticated',
  'cliente26@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Paulo R.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('f6728243-3532-4dd0-abfa-b593d4e0d8ce', 'cliente', 'Paulo R.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '45c4529d-9f4a-4bb0-b240-d51fc71557d1', 'authenticated', 'authenticated',
  'cliente27@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Neusa T.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('45c4529d-9f4a-4bb0-b240-d51fc71557d1', 'cliente', 'Neusa T.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '7abbdd57-768c-43e9-88ab-e7e55506768b', 'authenticated', 'authenticated',
  'cliente28@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Adriana Q.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('7abbdd57-768c-43e9-88ab-e7e55506768b', 'cliente', 'Adriana Q.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '4acba4bd-d498-45a7-a861-150da152d0f1', 'authenticated', 'authenticated',
  'cliente29@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Roberta A.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('4acba4bd-d498-45a7-a861-150da152d0f1', 'cliente', 'Roberta A.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'c4d539b1-b5b7-449f-9ab9-7ab72a408f1e', 'authenticated', 'authenticated',
  'cliente30@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Vanessa C.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('c4d539b1-b5b7-449f-9ab9-7ab72a408f1e', 'cliente', 'Vanessa C.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '5c176ebb-0c70-4242-bb55-683944dd6335', 'authenticated', 'authenticated',
  'cliente31@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Márcia B.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('5c176ebb-0c70-4242-bb55-683944dd6335', 'cliente', 'Márcia B.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'b26f0a6e-7e4c-412e-9f08-fc1d149afce3', 'authenticated', 'authenticated',
  'cliente32@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Luana E.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('b26f0a6e-7e4c-412e-9f08-fc1d149afce3', 'cliente', 'Luana E.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'fb01b058-6dbd-499c-89dd-40754667ede4', 'authenticated', 'authenticated',
  'cliente33@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Gisele W.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('fb01b058-6dbd-499c-89dd-40754667ede4', 'cliente', 'Gisele W.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '1018e62c-7cdc-4968-a844-f03c66b6d114', 'authenticated', 'authenticated',
  'cliente34@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Marlene S.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('1018e62c-7cdc-4968-a844-f03c66b6d114', 'cliente', 'Marlene S.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '3659cb4c-2d09-499d-b744-46c6f92272ac', 'authenticated', 'authenticated',
  'cliente35@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Jéssica P.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('3659cb4c-2d09-499d-b744-46c6f92272ac', 'cliente', 'Jéssica P.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '1f71d58b-eb7d-4b1d-8d89-1d367dc695b1', 'authenticated', 'authenticated',
  'cliente36@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Eliane G.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('1f71d58b-eb7d-4b1d-8d89-1d367dc695b1', 'cliente', 'Eliane G.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '98a19a87-3c8d-4850-aaf5-1b1a0684f67b', 'authenticated', 'authenticated',
  'cliente37@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Cleber M.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('98a19a87-3c8d-4850-aaf5-1b1a0684f67b', 'cliente', 'Cleber M.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'cea3b9f4-b1f5-447f-bdf6-8c42ffec61a7', 'authenticated', 'authenticated',
  'cliente38@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Rosa H.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('cea3b9f4-b1f5-447f-bdf6-8c42ffec61a7', 'cliente', 'Rosa H.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a88d9be2-0774-4924-a043-b6e09532dc4e', 'authenticated', 'authenticated',
  'cliente39@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Fabiana R.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('a88d9be2-0774-4924-a043-b6e09532dc4e', 'cliente', 'Fabiana R.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '6072882e-ff47-43ea-a4bb-c8a718391cec', 'authenticated', 'authenticated',
  'cliente40@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Débora L.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('6072882e-ff47-43ea-a4bb-c8a718391cec', 'cliente', 'Débora L.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '71814af2-e1d2-4bc4-9776-bc58d62a8d51', 'authenticated', 'authenticated',
  'cliente41@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Tais M.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('71814af2-e1d2-4bc4-9776-bc58d62a8d51', 'cliente', 'Tais M.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'd40da6fe-a15b-405c-837a-7bb9ca123bf3', 'authenticated', 'authenticated',
  'cliente42@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Amanda F.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('d40da6fe-a15b-405c-837a-7bb9ca123bf3', 'cliente', 'Amanda F.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '5d1a00e1-1527-4194-bcab-640a20a6e9b8', 'authenticated', 'authenticated',
  'cliente43@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Ivete C.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('5d1a00e1-1527-4194-bcab-640a20a6e9b8', 'cliente', 'Ivete C.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'b127907d-fb0e-43ae-be46-df046a93bf84', 'authenticated', 'authenticated',
  'cliente44@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Silvana B.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('b127907d-fb0e-43ae-be46-df046a93bf84', 'cliente', 'Silvana B.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'bc52fc83-c93c-49aa-af82-8fe94ad2369f', 'authenticated', 'authenticated',
  'cliente45@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Jorge A.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('bc52fc83-c93c-49aa-af82-8fe94ad2369f', 'cliente', 'Jorge A.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'a684e95c-a6ff-496b-b718-753f3f9ecb93', 'authenticated', 'authenticated',
  'cliente46@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Terezinha O.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('a684e95c-a6ff-496b-b718-753f3f9ecb93', 'cliente', 'Terezinha O.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'cc995c4e-5131-4062-b3e4-a25c48c60d8c', 'authenticated', 'authenticated',
  'cliente47@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Nadia S.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('cc995c4e-5131-4062-b3e4-a25c48c60d8c', 'cliente', 'Nadia S.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '1b691f9f-4dc0-42a8-8e35-a9f97adb1133', 'authenticated', 'authenticated',
  'cliente48@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Carla D.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('1b691f9f-4dc0-42a8-8e35-a9f97adb1133', 'cliente', 'Carla D.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '2e39b074-b873-4b91-a1ec-b6609a8cd819', 'authenticated', 'authenticated',
  'cliente49@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Márcio V.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('2e39b074-b873-4b91-a1ec-b6609a8cd819', 'cliente', 'Márcio V.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'bae44e0f-626c-47a6-8bff-9570c01b5999', 'authenticated', 'authenticated',
  'cliente50@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Beatriz N.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('bae44e0f-626c-47a6-8bff-9570c01b5999', 'cliente', 'Beatriz N.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '155ef90c-72e9-4f5b-bc21-87e0c162f8c1', 'authenticated', 'authenticated',
  'cliente51@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Helena F.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('155ef90c-72e9-4f5b-bc21-87e0c162f8c1', 'cliente', 'Helena F.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '53522142-51b2-4134-b78b-0a5ad6e61948', 'authenticated', 'authenticated',
  'cliente52@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Luciana M.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('53522142-51b2-4134-b78b-0a5ad6e61948', 'cliente', 'Luciana M.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '6e1fd2ff-6f11-48a0-a470-66b8b58a0fb7', 'authenticated', 'authenticated',
  'cliente53@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Kelly S.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('6e1fd2ff-6f11-48a0-a470-66b8b58a0fb7', 'cliente', 'Kelly S.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '298d7e5d-e9aa-4c01-8206-593f1df3fbc7', 'authenticated', 'authenticated',
  'cliente54@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Raquel P.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('298d7e5d-e9aa-4c01-8206-593f1df3fbc7', 'cliente', 'Raquel P.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '5b654564-0f14-4322-b56b-e21b34db5ff3', 'authenticated', 'authenticated',
  'cliente55@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Diego T.', 'papel', 'cliente'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('5b654564-0f14-4322-b56b-e21b34db5ff3', 'cliente', 'Diego T.')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;

-- ------------------------------------------------------------------------
-- 12 terapeutas fictícias
-- ------------------------------------------------------------------------

-- 1. Rosane Albuquerque — Centro Histórico, Porto Alegre (5.1 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '3ef906f0-882a-4f34-a2f9-9b40a651d747', 'authenticated', 'authenticated',
  'terapeuta01@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Rosane Albuquerque', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('3ef906f0-882a-4f34-a2f9-9b40a651d747', 'terapeuta', 'Rosane Albuquerque')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '3ef906f0-882a-4f34-a2f9-9b40a651d747', 'Trabalho com Apometria há onze anos, num consultório no centro, com hora marcada e sem pressa. Atendo quem chega cansado da rotina e também quem já vem acompanhando um processo há tempo. A primeira conversa é sem custo, para a gente ver se faz sentido seguir junto.', 'Rua dos Andradas, 1200 — sala 43', 'Centro Histórico', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.23033, -30.0325), 4326)::geography,
  '{"presencial","online"}', '5551999120043', 'rosane.apometria',
  true, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', id from terapias where nome = 'Apometria'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', id from terapias where nome = 'Limpeza Energética'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', id from terapias where nome = 'Mesa Radiônica'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 'Sessão de Apometria', 'Primeira sessão inclui anamnese completa', 90, 180
  where not exists (select 1 from servicos where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and nome = 'Sessão de Apometria');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 'Limpeza energética do ambiente', 'Casa ou local de trabalho', 60, 150
  where not exists (select 1 from servicos where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and nome = 'Limpeza energética do ambiente');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 'Mesa radiônica (à distância)', null, 45, 120
  where not exists (select 1 from servicos where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and nome = 'Mesa radiônica (à distância)');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 1, '09:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 1 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 1, '13:30', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 1 and abre = '13:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 2, '09:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 2 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 2, '13:30', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 2 and abre = '13:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 3, '09:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 3 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 3, '13:30', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 3 and abre = '13:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 4, '09:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 4 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 4, '13:30', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 4 and abre = '13:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 5, '09:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 5 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3ef906f0-882a-4f34-a2f9-9b40a651d747', 6, '09:00', '13:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3ef906f0-882a-4f34-a2f9-9b40a651d747' and dia_semana = 6 and abre = '09:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3ef906f0-882a-4f34-a2f9-9b40a651d747', '5431d1d0-e32e-4c0a-8f03-2c157cd206dc', 5, 'Saí leve de um jeito que não sei explicar direito. A Rosane escuta de verdade antes de começar, isso fez muita diferença pra mim.', 'Que bom te receber, Cláudia. Fico à disposição.',
          now() - interval '6 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3ef906f0-882a-4f34-a2f9-9b40a651d747', '949030bb-f30c-4097-be10-ec66062c93ca', 5, 'Consultório tranquilo, ela é pontual e explica cada etapa. Já indiquei pra duas amigas.', null,
          now() - interval '19 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3ef906f0-882a-4f34-a2f9-9b40a651d747', '404363ed-98ca-4d3d-a793-1739987c4025', 4, 'Atendimento muito bom. Só achei o horário da tarde difícil de conseguir, tive que esperar duas semanas.', 'Obrigada pelo retorno, Marcelo. Abri mais horários nas quintas à noite.',
          now() - interval '41 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3ef906f0-882a-4f34-a2f9-9b40a651d747', 'a1af79e4-7522-4bb6-8cfa-70511c7d2b99', 5, 'Fiz três sessões e voltei a dormir. Vale cada centavo.', null,
          now() - interval '68 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3ef906f0-882a-4f34-a2f9-9b40a651d747', '824a870c-5891-4add-9cd2-a692a12c7c92', 5, 'Profissional séria, sem promessa milagrosa. É o que eu procurava.', null,
          now() - interval '95 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 2. Marina Corrêa — Bom Fim, Porto Alegre (3.6 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '5872b277-3129-4816-a7fa-4f4fa2a227f3', 'authenticated', 'authenticated',
  'terapeuta02@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Marina Corrêa', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('5872b277-3129-4816-a7fa-4f4fa2a227f3', 'terapeuta', 'Marina Corrêa')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '5872b277-3129-4816-a7fa-4f4fa2a227f3', 'Reikiana desde 2018, formada nos três níveis. Atendo numa casa antiga do Bom Fim, com jardim. Gosto de combinar o Reiki com cromoterapia quando a pessoa está num período de muita agitação.', 'Rua Fernandes Vieira, 380 — casa 2', 'Bom Fim', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.21172, -30.0334), 4326)::geography,
  '{"presencial"}', '5551998451207', 'marinacorrea.reiki',
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', id from terapias where nome = 'Reiki'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', id from terapias where nome = 'Cromoterapia'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', id from terapias where nome = 'Aromaterapia'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 'Sessão de Reiki', null, 50, 90
  where not exists (select 1 from servicos where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and nome = 'Sessão de Reiki');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 'Reiki com cromoterapia', null, 70, 130
  where not exists (select 1 from servicos where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and nome = 'Reiki com cromoterapia');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 'Pacote 4 sessões', 'Válido por 60 dias', 50, 320
  where not exists (select 1 from servicos where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and nome = 'Pacote 4 sessões');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 1, '14:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and dia_semana = 1 and abre = '14:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 2, '14:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and dia_semana = 2 and abre = '14:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 3, '10:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and dia_semana = 3 and abre = '10:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 4, '14:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and dia_semana = 4 and abre = '14:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5872b277-3129-4816-a7fa-4f4fa2a227f3', 5, '10:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5872b277-3129-4816-a7fa-4f4fa2a227f3' and dia_semana = 5 and abre = '10:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5872b277-3129-4816-a7fa-4f4fa2a227f3', '4d0b8426-933e-4dae-b8b1-7c8a9f8d9166', 5, 'O espaço é lindo e muito calmo. Ela recebe com chá, parece visita de amiga.', null,
          now() - interval '3 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5872b277-3129-4816-a7fa-4f4fa2a227f3', '84e15761-bdf8-444c-99dc-9d4207ea6b92', 5, 'Fazia tempo que eu não relaxava assim. Voltei na semana seguinte.', null,
          now() - interval '22 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5872b277-3129-4816-a7fa-4f4fa2a227f3', 'e1b385f8-5c60-4f3e-922f-19cdd8994e2a', 4, 'Ótima sessão. O único detalhe é que não tem estacionamento perto, precisei rodar um pouco.', null,
          now() - interval '33 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5872b277-3129-4816-a7fa-4f4fa2a227f3', 'd06ec71c-f1be-4ac2-83d2-fcea28b6ff21', 5, 'A cromoterapia junto foi uma surpresa boa. Recomendo.', null,
          now() - interval '57 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5872b277-3129-4816-a7fa-4f4fa2a227f3', '91dc7076-b3df-4b3e-b999-4a5c939e71ab', 4, 'Gostei bastante, só senti a sessão um pouco curta pro valor.', 'Obrigada, Letícia! Criei a opção de 70 minutos justamente por isso.',
          now() - interval '80 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 3. Lúcia Fontoura — Vila Betânia, Cachoeirinha (11.4 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'authenticated', 'authenticated',
  'terapeuta03@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Lúcia Fontoura', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'terapeuta', 'Lúcia Fontoura')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'Formada em Apometria pela linha do Dr. Lacerda e sigo estudando todo ano. Atendo em Cachoeirinha e também on-line para quem mora longe. Trabalho com agenda enxuta porque prefiro poucos atendimentos bem feitos por semana.', 'Av. Flores da Cunha, 2400 — sala 12', 'Vila Betânia', 'Cachoeirinha', 'RS',
  st_setsrid(st_makepoint(-51.08989, -29.94934), 4326)::geography,
  '{"presencial","online"}', '5551997330288', 'lucia.fontoura.apometria',
  true, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', id from terapias where nome = 'Apometria'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', id from terapias where nome = 'Mesa Radiônica'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', id from terapias where nome = 'Limpeza Energética'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'Sessão de Apometria', 'Sessão longa, com retorno incluído', 120, 220
  where not exists (select 1 from servicos where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and nome = 'Sessão de Apometria');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'Apometria on-line', null, 90, 180
  where not exists (select 1 from servicos where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and nome = 'Apometria on-line');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'Mesa radiônica', null, 60, 150
  where not exists (select 1 from servicos where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and nome = 'Mesa radiônica');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 2, '08:00', '11:30'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 2 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 2, '13:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 2 and abre = '13:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 3, '08:00', '11:30'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 3 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 3, '13:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 3 and abre = '13:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 4, '08:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 4 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 5, '08:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 5 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '76a2417e-35d9-4142-a5b7-a4d57774b6ff', 6, '08:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '76a2417e-35d9-4142-a5b7-a4d57774b6ff' and dia_semana = 6 and abre = '08:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('76a2417e-35d9-4142-a5b7-a4d57774b6ff', '75951a73-8152-4056-8bcc-f4df48a30372', 5, 'A sessão de duas horas parece muito, mas passa voando. Ela é extremamente cuidadosa.', null,
          now() - interval '11 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('76a2417e-35d9-4142-a5b7-a4d57774b6ff', '90092862-dab4-4959-822e-dd9070f819e8', 5, 'Fiz on-line de Santa Maria e funcionou igual. Não achei que fosse dar certo à distância.', null,
          now() - interval '26 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'c11aadbc-929e-4b87-aa0c-c132f2eb469a', 5, 'Melhor atendimento que já tive na região. Sem enrolação, sem venda de pacote.', null,
          now() - interval '44 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('76a2417e-35d9-4142-a5b7-a4d57774b6ff', 'f9138173-4f31-4c01-b0f9-46919fbd007a', 5, 'Achei por indicação e virei cliente fixo. Vale a viagem.', null,
          now() - interval '72 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 4. Bianca Nunes — Moinhos de Vento, Porto Alegre (2.5 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'authenticated', 'authenticated',
  'terapeuta04@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Bianca Nunes', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'terapeuta', 'Bianca Nunes')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'Facilitadora de ThetaHealing e Barras de Access, com consultório nos Moinhos. Meu trabalho é bem direcionado a crenças que travam decisões — carreira, dinheiro, relacionamento. Também conduzo constelação em grupo uma vez por mês.', 'Rua Padre Chagas, 90 — conjunto 704', 'Moinhos de Vento', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.20542, -30.02407), 4326)::geography,
  '{"presencial","online"}', '5551991887744', 'biancanunes.theta',
  true, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', id from terapias where nome = 'ThetaHealing'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', id from terapias where nome = 'Barras de Access'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', id from terapias where nome = 'Constelação Familiar'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'ThetaHealing individual', null, 90, 260
  where not exists (select 1 from servicos where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and nome = 'ThetaHealing individual');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'Barras de Access', null, 60, 180
  where not exists (select 1 from servicos where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and nome = 'Barras de Access');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'Constelação em grupo', 'Um sábado por mês, vagas limitadas', 180, 200
  where not exists (select 1 from servicos where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and nome = 'Constelação em grupo');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 1, '08:30', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and dia_semana = 1 and abre = '08:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 2, '08:30', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and dia_semana = 2 and abre = '08:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 3, '08:30', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and dia_semana = 3 and abre = '08:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 4, '08:30', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and dia_semana = 4 and abre = '08:30');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 5, '08:30', '16:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e' and dia_semana = 5 and abre = '08:30');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'fad6980f-f1c4-4659-aeb2-acbac8e33123', 5, 'Fui por causa de uma decisão de carreira que estava travada há meses. Saí com clareza.', null,
          now() - interval '2 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', '0adce106-263d-472a-a3da-b902c0eca88c', 4, 'Muito boa, e o consultório é impecável. O valor pesa um pouco, mas a sessão é longa.', null,
          now() - interval '14 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', '3b11bc7b-2757-42b7-a827-41dd4a0ea4fb', 3, 'A técnica é boa mas achei o atendimento um pouco corrido no dia, ela estava atrasada.', 'Aline, peço desculpa por aquele dia. Reduzi o número de horários seguidos para não acontecer de novo.',
          now() - interval '30 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', '786c2e4b-d616-47cd-aa85-b14e04a9fa32', 5, 'A constelação em grupo foi das experiências mais fortes que já vivi.', null,
          now() - interval '48 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'fbf10daf-7dc1-4c16-a85c-25525a3b9cd4', 5, 'Já tinha feito Barras antes e a diferença de condução é enorme. Ela conduz muito bem.', null,
          now() - interval '63 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('b64ad8bf-a5fd-4690-a0cc-a890a3bfee6e', 'a8bab833-8006-4ea7-8fc6-f607d2d87c1a', 4, 'Bom atendimento, ambiente agradável. Voltarei.', null,
          now() - interval '88 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 5. Denise Wachholz — Marechal Rondon, Canoas (10.3 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '2d49397d-7677-48b0-902e-ef489ec3a923', 'authenticated', 'authenticated',
  'terapeuta05@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Denise Wachholz', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('2d49397d-7677-48b0-902e-ef489ec3a923', 'terapeuta', 'Denise Wachholz')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '2d49397d-7677-48b0-902e-ef489ec3a923', 'Constelo há sete anos e trago a Apometria quando o caso pede uma limpeza antes do trabalho sistêmico. Atendo em Canoas, em sala própria, sempre com hora marcada.', 'Rua Ipiranga, 515', 'Marechal Rondon', 'Canoas', 'RS',
  st_setsrid(st_makepoint(-51.16301, -29.92233), 4326)::geography,
  '{"presencial"}', '5551996204411', 'denise.constelacao',
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', id from terapias where nome = 'Constelação Familiar'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', id from terapias where nome = 'Apometria'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', 'Constelação individual', null, 90, 190
  where not exists (select 1 from servicos where terapeuta_id = '2d49397d-7677-48b0-902e-ef489ec3a923' and nome = 'Constelação individual');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', 'Sessão de Apometria', null, 80, 160
  where not exists (select 1 from servicos where terapeuta_id = '2d49397d-7677-48b0-902e-ef489ec3a923' and nome = 'Sessão de Apometria');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', 1, '13:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2d49397d-7677-48b0-902e-ef489ec3a923' and dia_semana = 1 and abre = '13:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', 3, '13:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2d49397d-7677-48b0-902e-ef489ec3a923' and dia_semana = 3 and abre = '13:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', 5, '13:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2d49397d-7677-48b0-902e-ef489ec3a923' and dia_semana = 5 and abre = '13:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2d49397d-7677-48b0-902e-ef489ec3a923', 6, '09:00', '14:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2d49397d-7677-48b0-902e-ef489ec3a923' and dia_semana = 6 and abre = '09:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2d49397d-7677-48b0-902e-ef489ec3a923', '16705be1-6af1-4b86-a01a-c3090dea2037', 5, 'A Denise tem uma leitura muito precisa. Em uma sessão entendi coisa que anos de conversa não resolveram.', null,
          now() - interval '9 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2d49397d-7677-48b0-902e-ef489ec3a923', 'e74b557a-8b95-4114-8a60-ab76b7ac0619', 5, 'Fui cético e saí impressionado. Recomendo.', null,
          now() - interval '35 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2d49397d-7677-48b0-902e-ef489ec3a923', '26c96869-cf83-4eb2-9bc9-ee1ebcad80a0', 4, 'Muito boa profissional. A sala é simples, mas isso não atrapalha em nada.', null,
          now() - interval '52 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2d49397d-7677-48b0-902e-ef489ec3a923', 'e95298aa-4acf-4b0f-ae0b-07ee93938b7f', 5, 'Atendimento humano de verdade.', null,
          now() - interval '91 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 6. Cátia Ribas — Bom Sucesso, Gravataí (17.3 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '5602da52-129a-4ec7-a42a-b51a20247242', 'authenticated', 'authenticated',
  'terapeuta06@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Cátia Ribas', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('5602da52-129a-4ec7-a42a-b51a20247242', 'terapeuta', 'Cátia Ribas')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '5602da52-129a-4ec7-a42a-b51a20247242', 'Trabalho com radiestesia e cristais, principalmente em análise de ambiente e de objetos. Atendo em Gravataí e faço avaliação à distância com foto e planta da casa.', 'Rua Dr. Barcelos, 88', 'Bom Sucesso', 'Gravataí', 'RS',
  st_setsrid(st_makepoint(-51.03653, -29.92362), 4326)::geography,
  '{"presencial","online"}', '5551995117823', null,
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '5602da52-129a-4ec7-a42a-b51a20247242', id from terapias where nome = 'Radiestesia'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '5602da52-129a-4ec7-a42a-b51a20247242', id from terapias where nome = 'Cristaloterapia'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '5602da52-129a-4ec7-a42a-b51a20247242', id from terapias where nome = 'Limpeza Energética'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 'Análise radiestésica de ambiente', null, 90, 170
  where not exists (select 1 from servicos where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and nome = 'Análise radiestésica de ambiente');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 'Sessão com cristais', null, 60, 110
  where not exists (select 1 from servicos where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and nome = 'Sessão com cristais');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 'Avaliação à distância', null, 45, 90
  where not exists (select 1 from servicos where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and nome = 'Avaliação à distância');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 2, '09:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and dia_semana = 2 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 4, '09:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and dia_semana = 4 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 6, '09:00', '16:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and dia_semana = 6 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '5602da52-129a-4ec7-a42a-b51a20247242', 0, '14:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '5602da52-129a-4ec7-a42a-b51a20247242' and dia_semana = 0 and abre = '14:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5602da52-129a-4ec7-a42a-b51a20247242', '9ec25ae2-be33-48a1-976c-2767ab5e4052', 5, 'Ela achou o ponto da casa que me incomodava sem eu falar nada. Fiquei de queixo caído.', null,
          now() - interval '16 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5602da52-129a-4ec7-a42a-b51a20247242', 'f6728243-3532-4dd0-abfa-b593d4e0d8ce', 4, 'Trabalho sério e preço justo. Demorou um pouco pra responder no WhatsApp.', null,
          now() - interval '38 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5602da52-129a-4ec7-a42a-b51a20247242', '45c4529d-9f4a-4bb0-b240-d51fc71557d1', 4, 'Gostei. Achei que ficaria mais tempo, mas o resultado veio.', null,
          now() - interval '74 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('5602da52-129a-4ec7-a42a-b51a20247242', '7abbdd57-768c-43e9-88ab-e7e55506768b', 4, 'Boa profissional, atenciosa.', null,
          now() - interval '110 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 7. Simone Baptista — Petrópolis, Porto Alegre (2.8 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'authenticated', 'authenticated',
  'terapeuta07@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Simone Baptista', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'terapeuta', 'Simone Baptista')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'Aromaterapeuta com formação clínica. Monto blends personalizados para cada pessoa e uso o Reiki como apoio. Atendo no Petrópolis, num prédio com elevador e acesso fácil.', 'Rua Veador Porto, 640 — sala 3', 'Petrópolis', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.18302, -30.03941), 4326)::geography,
  '{"presencial","online"}', '5551987554120', 'simonebaptista.aroma',
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', id from terapias where nome = 'Aromaterapia'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', id from terapias where nome = 'Reiki'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', id from terapias where nome = 'Cromoterapia'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'Consulta em aromaterapia', 'Inclui um blend personalizado', 70, 140
  where not exists (select 1 from servicos where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and nome = 'Consulta em aromaterapia');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'Sessão de Reiki', null, 50, 95
  where not exists (select 1 from servicos where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and nome = 'Sessão de Reiki');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'Acompanhamento mensal', null, 60, 120
  where not exists (select 1 from servicos where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and nome = 'Acompanhamento mensal');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 1, '09:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and dia_semana = 1 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 2, '09:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and dia_semana = 2 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 3, '09:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and dia_semana = 3 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 4, '09:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and dia_semana = 4 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 5, '09:00', '19:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and dia_semana = 5 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '65d8c37e-acd7-44bf-b6ef-35bb130e3516', 6, '10:00', '15:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '65d8c37e-acd7-44bf-b6ef-35bb130e3516' and dia_semana = 6 and abre = '10:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('65d8c37e-acd7-44bf-b6ef-35bb130e3516', '4acba4bd-d498-45a7-a861-150da152d0f1', 5, 'O blend que ela fez pra mim virou item fixo da minha rotina. Cheiro maravilhoso e me acalma mesmo.', null,
          now() - interval '5 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'c4d539b1-b5b7-449f-9ab9-7ab72a408f1e', 5, 'Ela explica a função de cada óleo, não é achismo. Gostei muito.', null,
          now() - interval '21 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('65d8c37e-acd7-44bf-b6ef-35bb130e3516', '5c176ebb-0c70-4242-bb55-683944dd6335', 4, 'Atendimento ótimo, sala um pouco pequena.', null,
          now() - interval '46 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'b26f0a6e-7e4c-412e-9f08-fc1d149afce3', 5, 'Já é a terceira vez que volto. Sempre sai melhor do que entrei.', null,
          now() - interval '66 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('65d8c37e-acd7-44bf-b6ef-35bb130e3516', 'fb01b058-6dbd-499c-89dd-40754667ede4', 4, 'Boa profissional e muito pontual.', null,
          now() - interval '102 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 8. Neusa Trindade — Sarandi, Porto Alegre (5.8 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '8df11063-b297-4ad3-be36-e42c96099826', 'authenticated', 'authenticated',
  'terapeuta08@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Neusa Trindade', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('8df11063-b297-4ad3-be36-e42c96099826', 'terapeuta', 'Neusa Trindade')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '8df11063-b297-4ad3-be36-e42c96099826', 'Atendo no Sarandi há quase vinte anos, no mesmo endereço. Faço Apometria e uso o tarô como leitura de apoio, nunca como previsão. Quem chega aqui sabe que vai ouvir a verdade com cuidado.', 'Av. Assis Brasil, 5900 — sala 208', 'Sarandi', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.12496, -29.99859), 4326)::geography,
  '{"presencial"}', '5551992048866', 'neusa.trindade.terapias',
  true, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '8df11063-b297-4ad3-be36-e42c96099826', id from terapias where nome = 'Apometria'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '8df11063-b297-4ad3-be36-e42c96099826', id from terapias where nome = 'Tarô Terapêutico'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '8df11063-b297-4ad3-be36-e42c96099826', id from terapias where nome = 'Limpeza Energética'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '8df11063-b297-4ad3-be36-e42c96099826', 'Sessão de Apometria', null, 90, 150
  where not exists (select 1 from servicos where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and nome = 'Sessão de Apometria');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '8df11063-b297-4ad3-be36-e42c96099826', 'Leitura terapêutica com tarô', null, 60, 100
  where not exists (select 1 from servicos where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and nome = 'Leitura terapêutica com tarô');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '8df11063-b297-4ad3-be36-e42c96099826', 'Apometria + leitura', null, 120, 220
  where not exists (select 1 from servicos where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and nome = 'Apometria + leitura');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '8df11063-b297-4ad3-be36-e42c96099826', 1, '08:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and dia_semana = 1 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '8df11063-b297-4ad3-be36-e42c96099826', 2, '08:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and dia_semana = 2 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '8df11063-b297-4ad3-be36-e42c96099826', 3, '08:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and dia_semana = 3 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '8df11063-b297-4ad3-be36-e42c96099826', 4, '08:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and dia_semana = 4 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '8df11063-b297-4ad3-be36-e42c96099826', 5, '08:00', '18:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and dia_semana = 5 and abre = '08:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '8df11063-b297-4ad3-be36-e42c96099826', 6, '08:00', '12:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '8df11063-b297-4ad3-be36-e42c96099826' and dia_semana = 6 and abre = '08:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('8df11063-b297-4ad3-be36-e42c96099826', '1018e62c-7cdc-4968-a844-f03c66b6d114', 5, 'Vou nela há oito anos. Nunca me deu uma resposta pronta, sempre me fez pensar.', null,
          now() - interval '4 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('8df11063-b297-4ad3-be36-e42c96099826', '3659cb4c-2d09-499d-b744-46c6f92272ac', 5, 'Chegei chorando e saí de pé. Ela é firme e acolhedora ao mesmo tempo.', null,
          now() - interval '12 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('8df11063-b297-4ad3-be36-e42c96099826', '1f71d58b-eb7d-4b1d-8d89-1d367dc695b1', 5, 'Preço muito honesto pelo tempo de sessão.', null,
          now() - interval '29 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('8df11063-b297-4ad3-be36-e42c96099826', '98a19a87-3c8d-4850-aaf5-1b1a0684f67b', 4, 'Excelente atendimento. A sala fica num prédio meio confuso, vale chegar mais cedo.', null,
          now() - interval '55 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('8df11063-b297-4ad3-be36-e42c96099826', 'cea3b9f4-b1f5-447f-bdf6-8c42ffec61a7', 5, 'É daquelas pessoas que a gente indica sem medo.', 'Gratidão, Rosa. Um abraço.',
          now() - interval '77 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('8df11063-b297-4ad3-be36-e42c96099826', 'a88d9be2-0774-4924-a043-b6e09532dc4e', 5, 'Vinte anos no mesmo lugar já diz muita coisa. Recomendo demais.', null,
          now() - interval '120 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 9. Priscila Amaral — Menino Deus, Porto Alegre (6.1 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '2bacc666-5b79-4245-b2e8-5e6c6354921d', 'authenticated', 'authenticated',
  'terapeuta09@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Priscila Amaral', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('2bacc666-5b79-4245-b2e8-5e6c6354921d', 'terapeuta', 'Priscila Amaral')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '2bacc666-5b79-4245-b2e8-5e6c6354921d', 'Facilitadora de Barras de Access, formada em 2024. Atendo no Menino Deus, em horários flexíveis, inclusive à noite para quem trabalha durante o dia. Estou começando e por isso mantenho um valor de entrada.', 'Rua José de Alencar, 220 — apto 501', 'Menino Deus', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.22395, -30.0557), 4326)::geography,
  '{"presencial","online"}', '5551994778201', 'pri.amaral.access',
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', id from terapias where nome = 'Barras de Access'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', id from terapias where nome = 'Limpeza Energética'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 'Barras de Access', null, 60, 100
  where not exists (select 1 from servicos where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and nome = 'Barras de Access');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 'Barras + limpeza energética', null, 90, 140
  where not exists (select 1 from servicos where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and nome = 'Barras + limpeza energética');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 1, '18:00', '22:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and dia_semana = 1 and abre = '18:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 2, '18:00', '22:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and dia_semana = 2 and abre = '18:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 3, '18:00', '22:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and dia_semana = 3 and abre = '18:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 4, '18:00', '22:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and dia_semana = 4 and abre = '18:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 6, '09:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and dia_semana = 6 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '2bacc666-5b79-4245-b2e8-5e6c6354921d', 0, '09:00', '13:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '2bacc666-5b79-4245-b2e8-5e6c6354921d' and dia_semana = 0 and abre = '09:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2bacc666-5b79-4245-b2e8-5e6c6354921d', '6072882e-ff47-43ea-a4bb-c8a718391cec', 5, 'Ela é nova de formação mas conduz com muita segurança. E o horário da noite salvou minha vida.', null,
          now() - interval '7 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2bacc666-5b79-4245-b2e8-5e6c6354921d', '71814af2-e1d2-4bc4-9776-bc58d62a8d51', 4, 'Gostei bastante. Ainda está montando o espaço, dá pra ver que é começo, mas o atendimento é bom.', null,
          now() - interval '25 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('2bacc666-5b79-4245-b2e8-5e6c6354921d', 'd40da6fe-a15b-405c-837a-7bb9ca123bf3', 3, 'Sessão boa, mas atrasou vinte minutos pra me atender.', 'Amanda, obrigada por avisar. Passei a deixar intervalo maior entre os horários.',
          now() - interval '60 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 10. Vera Lúcia Machado — Centro, Viamão (16.7 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '379822e3-e4d0-485a-aee1-c656e27b2e96', 'authenticated', 'authenticated',
  'terapeuta10@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Vera Lúcia Machado', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('379822e3-e4d0-485a-aee1-c656e27b2e96', 'terapeuta', 'Vera Lúcia Machado')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '379822e3-e4d0-485a-aee1-c656e27b2e96', 'Apometra e radiestesista. Atendo em Viamão e faço mesa radiônica à distância para todo o estado. Sou de falar pouco e trabalhar muito: a sessão é o centro, não a conversa em volta.', 'Rua Ary Tarrago, 130', 'Centro', 'Viamão', 'RS',
  st_setsrid(st_makepoint(-51.02763, -30.08164), 4326)::geography,
  '{"presencial","online"}', '5551996330177', 'veraluciamachado.apometria',
  true, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', id from terapias where nome = 'Apometria'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', id from terapias where nome = 'Mesa Radiônica'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', id from terapias where nome = 'Limpeza Energética'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', id from terapias where nome = 'Radiestesia'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 'Sessão de Apometria', null, 100, 170
  where not exists (select 1 from servicos where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and nome = 'Sessão de Apometria');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 'Mesa radiônica semanal', 'Acompanhamento à distância', 30, 80
  where not exists (select 1 from servicos where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and nome = 'Mesa radiônica semanal');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 'Limpeza de ambiente', null, 90, 200
  where not exists (select 1 from servicos where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and nome = 'Limpeza de ambiente');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 1, '09:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and dia_semana = 1 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 2, '09:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and dia_semana = 2 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 4, '09:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and dia_semana = 4 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 5, '09:00', '17:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and dia_semana = 5 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '379822e3-e4d0-485a-aee1-c656e27b2e96', 6, '09:00', '13:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '379822e3-e4d0-485a-aee1-c656e27b2e96' and dia_semana = 6 and abre = '09:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('379822e3-e4d0-485a-aee1-c656e27b2e96', '5d1a00e1-1527-4194-bcab-640a20a6e9b8', 5, 'Direta e competente. Não perde tempo e resolve.', null,
          now() - interval '8 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('379822e3-e4d0-485a-aee1-c656e27b2e96', 'b127907d-fb0e-43ae-be46-df046a93bf84', 5, 'Faço a mesa semanal com ela há um ano. Mudou a minha rotina.', null,
          now() - interval '27 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('379822e3-e4d0-485a-aee1-c656e27b2e96', 'bc52fc83-c93c-49aa-af82-8fe94ad2369f', 4, 'Bom atendimento. Achei o deslocamento até Viamão o único ponto ruim, mas isso é problema meu.', null,
          now() - interval '51 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('379822e3-e4d0-485a-aee1-c656e27b2e96', 'a684e95c-a6ff-496b-b718-753f3f9ecb93', 5, 'Cuidadosa e muito ética. Nunca me empurrou sessão extra.', null,
          now() - interval '83 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('379822e3-e4d0-485a-aee1-c656e27b2e96', 'cc995c4e-5131-4062-b3e4-a25c48c60d8c', 5, 'Recomendo de olhos fechados.', null,
          now() - interval '104 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 11. Elaine Kroth — Tristeza, Porto Alegre (12.9 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 'authenticated', 'authenticated',
  'terapeuta11@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Elaine Kroth', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('d7881ba6-51b6-4411-9c29-2fd8e16c99e4', 'terapeuta', 'Elaine Kroth')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 'Cromoterapeuta, atendo na Tristeza em sala compartilhada. Trabalho principalmente com quem tem dificuldade de sono e ansiedade leve, sempre como apoio a um acompanhamento de saúde, nunca no lugar dele.', 'Av. Wenceslau Escobar, 2700 — sala 9', 'Tristeza', 'Porto Alegre', 'RS',
  st_setsrid(st_makepoint(-51.25667, -30.11032), 4326)::geography,
  '{"presencial"}', '5551988220945', 'elainekroth.cromo',
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', id from terapias where nome = 'Cromoterapia'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', id from terapias where nome = 'Cristaloterapia'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 'Sessão de cromoterapia', null, 50, 85
  where not exists (select 1 from servicos where terapeuta_id = 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4' and nome = 'Sessão de cromoterapia');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 'Cromo + cristais', null, 70, 120
  where not exists (select 1 from servicos where terapeuta_id = 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4' and nome = 'Cromo + cristais');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 2, '14:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4' and dia_semana = 2 and abre = '14:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 4, '14:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4' and dia_semana = 4 and abre = '14:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4', 6, '09:00', '13:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = 'd7881ba6-51b6-4411-9c29-2fd8e16c99e4' and dia_semana = 6 and abre = '09:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('d7881ba6-51b6-4411-9c29-2fd8e16c99e4', '1b691f9f-4dc0-42a8-8e35-a9f97adb1133', 4, 'Sessão bem tranquila, gostei do jeito dela. A sala é dividida e às vezes dá pra escutar a sala do lado.', null,
          now() - interval '13 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('d7881ba6-51b6-4411-9c29-2fd8e16c99e4', '2e39b074-b873-4b91-a1ec-b6609a8cd819', 3, 'Foi ok. Esperava mais explicação sobre o que estava sendo feito.', 'Márcio, valeu o retorno. Passei a explicar o processo antes de começar.',
          now() - interval '42 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('d7881ba6-51b6-4411-9c29-2fd8e16c99e4', 'bae44e0f-626c-47a6-8bff-9570c01b5999', 5, 'Me ajudou muito no período em que eu não conseguia dormir. Preço acessível.', null,
          now() - interval '70 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('d7881ba6-51b6-4411-9c29-2fd8e16c99e4', '155ef90c-72e9-4f5b-bc21-87e0c162f8c1', 4, 'Boa profissional, honesta sobre os limites do trabalho dela. Isso vale muito.', null,
          now() - interval '99 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

-- 12. Tânia Boaventura — Centro, Alvorada (10.4 km)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '3278673d-bf43-47b2-b691-e6d973978b4b', 'authenticated', 'authenticated',
  'terapeuta12@exemplo.invalido', '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx', now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', 'Tânia Boaventura', 'papel', 'terapeuta'),
  false, '', '', '', ''
) on conflict (id) do nothing;
insert into profiles (id, papel, nome) values ('3278673d-bf43-47b2-b691-e6d973978b4b', 'terapeuta', 'Tânia Boaventura')
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;
insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  '3278673d-bf43-47b2-b691-e6d973978b4b', 'Atendo em Alvorada, perto do centro, e on-line à noite. Combino ThetaHealing com Reiki conforme o momento de cada pessoa. Tenho horário aos domingos porque muita gente só consegue nesse dia.', 'Av. Presidente Getúlio Vargas, 980', 'Centro', 'Alvorada', 'RS',
  st_setsrid(st_makepoint(-51.07526, -30.00033), 4326)::geography,
  '{"presencial","online"}', '5551991660534', 'taniaboaventura.terapias',
  false, true, false
) on conflict (user_id) do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', id from terapias where nome = 'ThetaHealing'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', id from terapias where nome = 'Reiki'
  on conflict do nothing;
insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', id from terapias where nome = 'Aromaterapia'
  on conflict do nothing;
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 'ThetaHealing', null, 80, 160
  where not exists (select 1 from servicos where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and nome = 'ThetaHealing');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 'Reiki', null, 50, 90
  where not exists (select 1 from servicos where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and nome = 'Reiki');
insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 'Sessão combinada', null, 100, 200
  where not exists (select 1 from servicos where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and nome = 'Sessão combinada');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 1, '09:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and dia_semana = 1 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 3, '09:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and dia_semana = 3 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 5, '09:00', '20:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and dia_semana = 5 and abre = '09:00');
insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select '3278673d-bf43-47b2-b691-e6d973978b4b', 0, '09:00', '16:00'
  where not exists (select 1 from horarios
                    where terapeuta_id = '3278673d-bf43-47b2-b691-e6d973978b4b' and dia_semana = 0 and abre = '09:00');
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3278673d-bf43-47b2-b691-e6d973978b4b', '53522142-51b2-4134-b78b-0a5ad6e61948', 5, 'O domingo salvou. Trabalho a semana toda e nunca conseguia encaixar terapia.', null,
          now() - interval '10 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3278673d-bf43-47b2-b691-e6d973978b4b', '6e1fd2ff-6f11-48a0-a470-66b8b58a0fb7', 4, 'Muito boa. A sala fica no segundo andar sem elevador, fica o aviso.', null,
          now() - interval '31 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3278673d-bf43-47b2-b691-e6d973978b4b', '298d7e5d-e9aa-4c01-8206-593f1df3fbc7', 5, 'Ela tem uma calma que contagia. Saí de lá outra pessoa.', null,
          now() - interval '58 days')
  on conflict (terapeuta_id, cliente_id) do nothing;
insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values ('3278673d-bf43-47b2-b691-e6d973978b4b', '5b654564-0f14-4322-b56b-e21b34db5ff3', 4, 'Bom atendimento e valor justo pra região.', null,
          now() - interval '86 days')
  on conflict (terapeuta_id, cliente_id) do nothing;

commit;

-- ============================================================================
-- CONFERÊNCIA — o que a semente deveria ter deixado
-- ============================================================================
select 'terapeutas' as coisa, count(*) as total from perfis_terapeuta
union all select 'servicos',   count(*) from servicos
union all select 'horarios',   count(*) from horarios
union all select 'avaliacoes', count(*) from avaliacoes
union all select 'clientes',   count(*) from profiles where papel = 'cliente';

-- A faixa de preço tem de ter sido preenchida PELO GATILHO, não pela semente.
-- Se vier nulo, o 03-funcoes-e-gatilhos.sql não foi rodado.
select pr.nome, p.preco_min, p.preco_max
from perfis_terapeuta p join profiles pr on pr.id = p.user_id
order by pr.nome;

-- A busca principal, do jeito que o app vai chamar (a partir de Higienópolis).
select nome, bairro, cidade, round(distancia_m::numeric/1000, 1) as km,
       nota_media, total_avaliacoes, aberta_agora
from terapeutas_proximas(-30.01382, -51.18227, 30000);

