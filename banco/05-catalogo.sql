-- ============================================================================
-- 05 — CATÁLOGO DE TERAPIAS
--
-- A lista do arquivo 03. `on conflict do nothing` para poder rodar de novo sem
-- duplicar — o catálogo é a mesma lista que o protótipo usa em src/03-dados.js.
--
-- ⚠️ Se acrescentar terapia aqui, acrescente TAMBÉM em src/03-dados.js. As duas
-- listas precisam bater; hoje isso é conferido por `conferir.js`.
-- ============================================================================

insert into terapias (nome) values
  ('Apometria'),
  ('Reiki'),
  ('ThetaHealing'),
  ('Barras de Access'),
  ('Radiestesia'),
  ('Cromoterapia'),
  ('Aromaterapia'),
  ('Cristaloterapia'),
  ('Constelação Familiar'),
  ('Mesa Radiônica'),
  ('Tarô Terapêutico'),
  ('Limpeza Energética')
on conflict (nome) do nothing;

-- Conferência — esperado: 12
select count(*) as total_terapias from terapias;
