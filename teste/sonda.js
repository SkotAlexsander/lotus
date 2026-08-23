/* Sonda de diagnóstico — mede o que a bancada acusou, sem corrigir nada ainda. */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');
const ARQUIVO = 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' })).newPage();
  p.on('pageerror', (e) => console.log('ERRO JS:', e.message));
  await p.goto(ARQUIVO);
  await p.waitForSelector('#splash', { state: 'detached' });
  await p.click('[data-a="entrarGoogle"]'); await p.waitForTimeout(400);
  await p.click('[data-papel="cliente"]'); await p.waitForTimeout(400);
  await p.click('[data-a="permitirLocal"]'); await p.waitForTimeout(900);

  await p.evaluate(() => { const t = Dados.porId('t1'); App.mapa.centralizar(t.x, t.y, 1.2, false); });
  await p.waitForTimeout(250);

  // o que chega no pointerup do mapa quando se toca num pino
  await p.evaluate(() => {
    window.__log = [];
    document.getElementById('mapa').addEventListener('pointerup', (e) => {
      window.__log.push('mapa pointerup target=' + (e.target.className || e.target.tagName));
    }, true);
    document.addEventListener('click', (e) => {
      window.__log.push('click target=' + (e.target.className || e.target.tagName));
    }, true);
  });

  await p.click('.pin[data-id="t1"]');
  await p.waitForTimeout(800);
  console.log('\n--- eventos ao tocar o pino ---');
  console.log((await p.evaluate(() => window.__log)).join('\n'));

  console.log('\n--- medidas da folha ---');
  console.log(await p.evaluate(() => {
    const f = document.getElementById('folha');
    const c = document.getElementById('folhaConteudo');
    const r = f.getBoundingClientRect();
    const cs = getComputedStyle(f);
    return {
      folhaRect: { top: Math.round(r.top), altura: Math.round(r.height), bottom: Math.round(r.bottom) },
      offsetHeight: f.offsetHeight,
      scrollHeight: f.scrollHeight,
      transform: f.style.transform,
      conteudoAltura: c.getBoundingClientRect().height,
      conteudoScroll: c.scrollHeight,
      cssBottom: cs.bottom, cssPosition: cs.position, cssDisplay: cs.display,
      janela: window.innerHeight,
      pai: f.parentElement.className + ' pos=' + getComputedStyle(f.parentElement).position,
    };
  }));

  console.log('\n--- clique num chip DENTRO da folha ---');
  await p.click('[data-a="abrirFiltros"]'); await p.waitForTimeout(700);
  await p.evaluate(() => { window.__log2 = []; document.addEventListener('click', (e) => window.__log2.push('click=' + (e.target.dataset.a || e.target.className)), true); });
  await p.click('#folha [data-a="filtroTerapia"][data-terapia="Apometria"]');
  await p.waitForTimeout(500);
  console.log('eventos:', await p.evaluate(() => window.__log2));
  console.log('filtro no estado:', await p.evaluate(() => Array.from(Dados.estado.filtros.terapias)));
  console.log('pinos ativos:', await p.$$eval('.pin', (e) => e.filter((x) => x.style.pointerEvents !== 'none').length));

  await b.close();
})();
