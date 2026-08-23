/* ============================================================================
   ferramentas/achar_playwright.js — onde está o navegador de teste

   Existe porque o caminho do Playwright estava CRAVADO em quatro arquivos,
   apontando três pastas acima — o que só é verdade enquanto este projeto morar
   dentro do repositório que o instalou. Clonado sozinho, tudo quebrava.

   Caminho cravado em código é a mesma armadilha que já quase mandou um caminho
   pessoal para um repositório público neste ambiente. A regra que ficou:
   caminho de ferramenta se PROCURA, não se crava.

   Procura nesta ordem:
     1. a variável de ambiente PLAYWRIGHT_DIR
     2. node_modules do próprio projeto
     3. node_modules de um repositório que hospede este projeto
     4. a resolução normal do Node
   ========================================================================== */
const fs = require('fs');
const path = require('path');

module.exports = function acharPlaywright() {
  const candidatos = [];

  if (process.env.PLAYWRIGHT_DIR) candidatos.push(process.env.PLAYWRIGHT_DIR);
  candidatos.push(path.join(__dirname, '..', 'node_modules', 'playwright'));
  candidatos.push(path.join(__dirname, '..', '..', '..', 'node_modules', 'playwright'));

  for (const c of candidatos) {
    if (fs.existsSync(c)) return require(c);
  }

  try {
    return require('playwright');
  } catch (_) { /* cai no aviso abaixo */ }

  console.error(
    '\n  ERRO: não encontrei o Playwright.\n' +
    '  Instale com:  npm i -D playwright && npx playwright install chromium\n' +
    '  Ou aponte a pasta:  set PLAYWRIGHT_DIR=C:\\caminho\\node_modules\\playwright\n'
  );
  process.exit(2);
};
