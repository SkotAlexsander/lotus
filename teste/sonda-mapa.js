/* Sonda do mapa real — mede quanto o MapLibre demora a montar os pinos e se a
   inércia dele responde a um peteleco sintético. Mede, não corrige. */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');
const ARQUIVO = 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' })).newPage();
  p.on('pageerror', (e) => console.log('ERRO JS:', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 140)); });

  await p.goto(ARQUIVO);
  await p.waitForSelector('#splash', { state: 'detached' }).catch(() => {});
  await p.click('[data-a="entrarGoogle"]'); await p.waitForTimeout(400);
  await p.click('[data-papel="cliente"]'); await p.waitForTimeout(400);
  // Sem GPS concedido, 'Permitir' faz o certo e oferece a cidade.
  await p.click('[data-a="escolherCidade"]'); await p.waitForTimeout(500);
  await p.click('[data-a="definirCidade"][data-cidade="Porto Alegre"]'); await p.waitForTimeout(1400);

  console.log('motor:', await p.evaluate(() => App.mapa && App.mapa.motor));

  const t0 = Date.now();
  for (let i = 0; i < 8; i++) {
    const n = await p.$$eval('.pin', (e) => e.length);
    const pronto = await p.evaluate(() => (App.mapa.bruto ? App.mapa.bruto.loaded() : null));
    console.log(`  ${Date.now() - t0}ms: pinos=${n} estilo-carregado=${pronto}`);
    if (n === 12) break;
    await p.waitForTimeout(1500);
  }
  console.log('marcadores do maplibre:', await p.$$eval('.maplibregl-marker', (e) => e.length));

  /* Peteleco com passos e tempo, do jeito que o MapLibre calcula velocidade */
  const centro = async () => p.evaluate(() => {
    const c = App.mapa.bruto.getCenter();
    return { lat: c.lat, lng: c.lng };
  });
  const metros = (a, b) => Math.hypot((a.lat - b.lat) * 111320, (a.lng - b.lng) * 96400).toFixed(1);

  const c0 = await centro();
  await p.mouse.move(300, 520);
  await p.mouse.down();
  for (let i = 1; i <= 8; i++) { await p.mouse.move(300 - i * 28, 520 - i * 18); await p.waitForTimeout(12); }
  await p.mouse.up();
  const c1 = await centro();
  await p.waitForTimeout(1200);
  const c2 = await centro();

  console.log('arrasto:', metros(c0, c1), 'm  |  inércia depois de soltar:', metros(c1, c2), 'm');
  await b.close();
})();
