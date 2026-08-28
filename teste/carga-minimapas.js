/* ============================================================================
   teste/carga-minimapas.js — o vazamento de WebGL sob CARGA de verdade

   Cada mini-mapa do perfil é um contexto WebGL, e o navegador dá ~16 por
   página. Antes do conserto (soltarMinis no desmonte da pilha), abrir perfis
   em sequência estourava o limite e o CONTEXTO MAIS ANTIGO — o mapa
   principal — era derrubado sem nenhum erro: o mapa simplesmente apagava.

   Esta bancada abre e fecha 20 perfis e prova três coisas:
     1. o número de canvases no documento não cresce com o uso;
     2. o mapa principal continua com o contexto VIVO (desenha de verdade);
     3. nenhum erro de console no caminho.

   Uso: node teste/carga-minimapas.js
   Saída: 0 = passou · 1 = falhou
   ========================================================================= */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');

const ARQUIVO = 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');
const VOLTAS = 20;

const falhas = [];
function checa(cond, nome, detalhe = '') {
  (cond ? [] : falhas).push(nome);
  console.log(`${cond ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', (e) => erros.push('pageerror: ' + e.message));

  await p.goto(ARQUIVO);
  await p.waitForSelector('#splash', { state: 'detached', timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(200);
  const clicar = async (s, ms = 420) => { await p.click(s, { timeout: 5000 }); await p.waitForTimeout(ms); };

  await clicar('[data-a="entrarCelular"]');
  await p.fill('#campoTel', '(51) 9 8877-6655');
  await clicar('[data-a="enviarCodigo"]');
  const dig = await p.$$('.digito');
  for (let i = 0; i < dig.length; i++) await dig[i].fill(String(i + 1));
  await clicar('#btnCodigo');
  await clicar('[data-papel="cliente"]');
  await clicar('[data-a="escolherCidade"]', 600);
  await clicar('[data-a="definirCidade"][data-cidade="Porto Alegre"]', 1100);
  await p.waitForFunction(() => document.querySelectorAll('.pin').length === 12, null, { timeout: 20000 }).catch(() => {});

  const canvasesAntes = await p.$$eval('canvas', (e) => e.length);

  /* Abre e fecha perfis alternando as 12 terapeutas. Cada abertura monta um
     mini-mapa (contexto novo); cada volta TEM de devolvê-lo. */
  for (let i = 0; i < VOLTAS; i++) {
    const id = 't' + ((i % 12) + 1);
    await p.evaluate((tid) => {
      const t = Dados.porId(tid);
      App.mapa.centralizar(t.lat, t.lng, 'pessoa', false);
    }, id);
    await p.waitForTimeout(200);
    await p.click(`.pin[data-id="${id}"]`, { timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(350);
    const abriu = await p.evaluate(() => {
      const b = document.querySelector('[data-a="abrirPerfil"]');
      if (b) { b.click(); return true; }
      return false;
    });
    await p.waitForTimeout(650);
    if (!abriu) { checa(false, `volta ${i + 1}: o perfil não abriu`); break; }
    await p.evaluate(() => App.voltarSePuder());
    await p.waitForTimeout(600);
    const telasAgora = await p.$$eval('.tela', (e) => e.map((t) => (t.dataset.tela || t.className) + (t.hidden ? ' HIDDEN' : '') + '@' + Math.round(t.getBoundingClientRect().x)));
    if (telasAgora.length > 1) console.log(`      volta ${i + 1} (${id}): ${telasAgora.join(' | ')}`);
  }

  // A última mola precisa PARAR (o desmonte acontece no aoParar dela) —
  // medir por tempo fixo era flakiness da própria bancada.
  await p.waitForFunction(() => document.querySelectorAll('.tela').length === 1, null, { timeout: 4000 }).catch(() => {});
  const depois = await p.evaluate(() => ({
    canvases: document.querySelectorAll('canvas').length,
    telas: document.querySelectorAll('.tela').length,
  }));
  checa(depois.telas === 1, 'a pilha voltou à raiz depois das 20 voltas', `${depois.telas} tela(s)`);
  checa(depois.canvases <= canvasesAntes + 1,
    'os canvases não se acumulam com o uso',
    `antes ${canvasesAntes}, depois das ${VOLTAS} voltas ${depois.canvases}`);

  /* O mapa principal segue VIVO? Ler um pixel do canvas com contexto perdido
     devolve tudo zero — mas MapLibre não expõe preserveDrawingBuffer, então a
     prova honesta é perguntar ao próprio contexto e exercitar o mapa. */
  const vivo = await p.evaluate(() => new Promise((res) => {
    const cv = document.querySelector('#mapa canvas');
    if (!cv) return res({ existe: false });
    const gl = cv.getContext('webgl2') || cv.getContext('webgl');
    const perdido = gl ? gl.isContextLost() : null;
    // Exercita: recentrar dispara render; se o contexto caiu, o MapLibre emite erro
    try { App.mapa.centralizar(-30.0325, -51.23033, 'pessoa', false); } catch (e) { return res({ existe: true, perdido, erroAoMover: e.message }); }
    setTimeout(() => res({ existe: true, perdido }), 400);
  }));
  checa(vivo.existe && vivo.perdido === false && !vivo.erroAoMover,
    'o mapa principal continua com o contexto WebGL vivo', JSON.stringify(vivo));

  const errosReais = erros.filter((e) => !/WebGL warning|GPU stall/i.test(e));
  checa(errosReais.length === 0, 'nenhum erro de console nas 20 voltas', errosReais.slice(0, 2).join(' | '));

  console.log(falhas.length ? `\n  ${falhas.length} FALHARAM` : '\n  o vazamento está morto: 20 voltas e o mapa segue vivo');
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch((e) => { console.error('A BANCADA QUEBROU:', e.message); process.exit(2); });
