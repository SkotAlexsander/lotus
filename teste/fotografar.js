/* Fotos avulsas: a abertura (que some sozinha) e o palco no desktop. */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');
const ARQUIVO = 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');
const FOTOS = path.join(__dirname, 'fotos');

(async () => {
  const b = await chromium.launch();

  const p1 = await (await b.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' })).newPage();
  await p1.goto(ARQUIVO);
  await p1.waitForTimeout(950);                       // pega a abertura ainda em cena
  await p1.screenshot({ path: path.join(FOTOS, '00-abertura.png') });

  const p2 = await (await b.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR' })).newPage();
  await p2.goto(ARQUIVO);
  await p2.waitForSelector('#splash', { state: 'detached' });
  await p2.waitForTimeout(400);
  await p2.screenshot({ path: path.join(FOTOS, '20-desktop.png') });

  await b.close();
  console.log('fotos avulsas prontas');
})();
