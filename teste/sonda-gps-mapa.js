/* Sonda: com GPS concedido, o mapa desenha? Mede rede e console, não afirma. */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const http = require('http');
const path = require('path');
const fs = require('fs');

const PAGINA = fs.readFileSync(path.join(__dirname, '..', 'prototipo', 'index.html'));

(async () => {
  const s = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); r.end(PAGINA); });
  await new Promise((ok) => s.listen(0, '127.0.0.1', ok));
  const URL = `http://127.0.0.1:${s.address().port}/`;
  console.log('servindo em', URL);

  const b = await chromium.launch();
  const ctx = await b.newContext({
    ...devices['iPhone 13'], locale: 'pt-BR',
    permissions: ['geolocation'],
    geolocation: { latitude: -29.9490, longitude: -51.0900, accuracy: 25 },
  });
  const p = await ctx.newPage();
  p.on('console', (m) => console.log(`  [${m.type()}]`, m.text().slice(0, 150)));
  p.on('pageerror', (e) => console.log('  ERRO JS:', e.message.slice(0, 200)));
  p.on('requestfailed', (r) => console.log('  FALHOU:', r.url().slice(0, 90), '·', (r.failure() || {}).errorText));

  await p.goto(URL);
  await p.waitForSelector('#splash', { state: 'detached' }).catch(() => {});
  await p.click('[data-a="entrarGoogle"]'); await p.waitForTimeout(400);
  await p.click('[data-papel="cliente"]'); await p.waitForTimeout(400);
  console.log('\n-- toca em Permitir --');
  await p.click('[data-a="permitirLocal"]');

  for (const t of [1500, 3000, 5000, 8000]) {
    await p.waitForTimeout(t === 1500 ? 1500 : 2000);
    const r = await p.evaluate(() => ({
      motor: App.mapa ? App.mapa.motor : null,
      carregou: App.mapa && App.mapa.bruto ? App.mapa.bruto.loaded() : null,
      estilo: App.mapa && App.mapa.bruto ? App.mapa.bruto.isStyleLoaded() : null,
      pinos: document.querySelectorAll('.pin').length,
      canvas: (() => { const c = document.querySelector('.maplibregl-canvas'); return c ? c.width + 'x' + c.height : 'sem canvas'; })(),
      origem: Dados.EU.origem,
    }));
    console.log(`  ${t}ms:`, JSON.stringify(r));
  }

  await p.screenshot({ path: path.join(__dirname, 'fotos', 'sonda-gps-mapa.png') });
  await b.close(); s.close();
})();
