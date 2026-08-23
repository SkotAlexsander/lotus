/* ============================================================================
   teste/sem-mapa-real.js — o plano B existe mesmo?

   O app promete: sem internet, com o CDN fora do ar ou em navegador antigo, ele
   cai no mapa desenhado por código e continua inteiro. Promessa que não é
   medida é só uma frase bonita no README.

   Aqui o MapLibre é BLOQUEADO na rede, de propósito, e o app tem de:
     · subir com o motor `desenhado`
     · mostrar os 12 pinos
     · abrir a folha ao tocar num pino
     · não soltar erro nenhum no console

   Uso: node teste/sem-mapa-real.js      (exit 0 = o plano B funciona)
   ========================================================================= */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');
const fs = require('fs');

const ARQUIVO = 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');
const FOTOS = path.join(__dirname, 'fotos');

const falhas = [];
function checa(ok, nome, detalhe = '') {
  if (!ok) falhas.push(nome);
  console.log(`${ok ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

(async () => {
  if (!fs.existsSync(FOTOS)) fs.mkdirSync(FOTOS, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' });

  // O bloqueio é o teste: nada de maplibre, nada de tiles.
  let bloqueados = 0;
  await ctx.route('**/*', (rota) => {
    const u = rota.request().url();
    if (/maplibre|openfreemap|tiles\./i.test(u)) { bloqueados++; return rota.abort(); }
    return rota.continue();
  });

  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });

  await p.goto(ARQUIVO);
  await p.waitForSelector('#splash', { state: 'detached', timeout: 10000 }).catch(() => {});
  await p.click('[data-a="entrarGoogle"]'); await p.waitForTimeout(400);
  await p.click('[data-papel="cliente"]'); await p.waitForTimeout(400);
  await p.click('[data-a="permitirLocal"]', { timeout: 8000 }); await p.waitForTimeout(1200);

  console.log(`\n  (${bloqueados} requisições de mapa bloqueadas)\n`);

  const motor = await p.evaluate(() => (App.mapa ? App.mapa.motor : 'nenhum'));
  checa(motor === 'desenhado', 'caiu no mapa desenhado', motor);

  const nPins = await p.$$eval('.pin', (e) => e.length);
  checa(nPins === 12, 'os 12 pinos continuam no mapa', `achei ${nPins}`);

  const temSvg = await p.$$eval('.mapa__svg', (e) => e.length);
  checa(temSvg === 1, 'o traçado desenhado está lá');

  await p.evaluate(() => { const t = Dados.porId('t1'); App.mapa.centralizar(t.lat, t.lng, 'pessoa', false); });
  await p.waitForTimeout(300);
  await p.click('.pin[data-id="t1"]');
  await p.waitForTimeout(700);
  checa(await p.isVisible('#folha'), 'tocar no pino abre a folha');

  await p.screenshot({ path: path.join(FOTOS, '22-sem-mapa-real.png') });
  /* As requisições bloqueadas geram "Failed to load resource" — é ESTE teste
     causando, não um defeito. O que não pode aparecer é erro de JavaScript:
     seria o app tropeçando na ausência do mapa em vez de contorná-la. */
  const deVerdade = erros.filter((e) => !/Failed to load resource|ERR_FAILED|ERR_BLOCKED/i.test(e));
  checa(deVerdade.length === 0, 'nenhum erro de JavaScript ao faltar o mapa', deVerdade.slice(0, 3).join(' | '));

  await b.close();
  console.log(`\n  ${falhas.length ? falhas.length + ' FALHA(S)' : 'o plano B funciona'}\n`);
  process.exit(falhas.length ? 1 : 0);
})();
