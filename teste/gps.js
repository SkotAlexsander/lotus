/* ============================================================================
   teste/gps.js — o ponto azul diz a verdade?

   O GPS tem seis finais possíveis (ver src/04c-gps.js) e o costume é programar
   só o feliz. Aqui os três que decidem se o app é honesto são provados de
   verdade, com o navegador concedendo, negando e mentindo a posição:

     1. PERMITIU e está perto     → posição real, distâncias RECALCULADAS
     2. PERMITIU e está longe     → o app AVISA que os dados são de outra região
     3. NEGOU                     → o app continua, oferecendo o modo cidade

   A prova nº 1 é a que pega o defeito mais caro: mover o ponto azul e esquecer
   de recalcular as distâncias faz o app dizer "2,9 km" para quem está a 800.

   ⚠️ Precisa de https ou localhost: `navigator.geolocation` não existe em
   `file://`. Por isso este teste serve a página de um servidor local.

   Uso: node teste/gps.js        (exit 0 = passou)
   ========================================================================= */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const http = require('http');
const path = require('path');
const fs = require('fs');

const PAGINA = fs.readFileSync(path.join(__dirname, '..', 'prototipo', 'index.html'));
const FOTOS = path.join(__dirname, 'fotos');

const falhas = [];
function checa(ok, nome, detalhe = '') {
  if (!ok) falhas.push(nome + (detalhe ? ' — ' + detalhe : ''));
  console.log(`${ok ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

/* localhost conta como contexto seguro — é o que destrava a API de localização
   sem precisar de certificado. */
function servir() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(PAGINA);
    });
    s.listen(0, '127.0.0.1', () => ok({ servidor: s, porta: s.address().port }));
  });
}

async function atePermitir(p) {
  await p.waitForSelector('#splash', { state: 'detached', timeout: 10000 }).catch(() => {});
  await p.click('[data-a="entrarGoogle"]'); await p.waitForTimeout(400);
  await p.click('[data-papel="cliente"]'); await p.waitForTimeout(400);
}

(async () => {
  if (!fs.existsSync(FOTOS)) fs.mkdirSync(FOTOS, { recursive: true });
  const { servidor, porta } = await servir();
  const URL = `http://127.0.0.1:${porta}/`;
  const navegador = await chromium.launch();

  /* ---------------------------------------------- 1. permitiu, e está perto */
  console.log('\n— permitiu, e está perto dos dados —');
  {
    const ctx = await navegador.newContext({
      ...devices['iPhone 13'], locale: 'pt-BR',
      permissions: ['geolocation'],
      geolocation: { latitude: -29.9490, longitude: -51.0900, accuracy: 25 },  // Cachoeirinha
    });
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', (e) => erros.push(e.message));

    await p.goto(URL);
    await atePermitir(p);

    const antes = await p.evaluate(() => ({
      origem: Dados.EU.origem,
      lucia: Dados.porId('t3').distanciaKm,     // Cachoeirinha
      rosane: Dados.porId('t1').distanciaKm,    // Centro Histórico
    }));

    await p.click('[data-a="permitirLocal"]');
    await p.waitForFunction(() => Dados.EU.origem === 'gps', null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(2500);

    const depois = await p.evaluate(() => ({
      origem: Dados.EU.origem,
      lat: +Dados.EU.lat.toFixed(3),
      precisao: Dados.EU.precisao,
      lucia: Dados.porId('t3').distanciaKm,
      rosane: Dados.porId('t1').distanciaKm,
      primeira: Dados.listar()[0].nome,
    }));

    checa(depois.origem === 'gps', 'a posição passou a vir do aparelho', depois.origem);
    checa(Math.abs(depois.lat - (-29.949)) < 0.01, 'o ponto azul foi para onde o GPS disse', `lat ${depois.lat}`);
    checa(depois.precisao === 25, 'a precisão informada é guardada', `±${depois.precisao} m`);

    /* O coração da prova: de Cachoeirinha, a Lúcia (que atende LÁ) tem de ficar
       perto e a Rosane (Centro Histórico) longe — o inverso do ponto fictício. */
    checa(depois.lucia < antes.lucia && depois.rosane > antes.rosane,
      'as distâncias foram RECALCULADAS a partir da posição real',
      `Lúcia ${antes.lucia}→${depois.lucia} km · Rosane ${antes.rosane}→${depois.rosane} km`);
    checa(depois.primeira === 'Lúcia Fontoura',
      'a lista reordena: a mais perto agora é quem atende no bairro', depois.primeira);

    /* O ponto azul fica PREGADO NO CHÃO em qualquer zoom. O marcador do
       MapLibre parte da posição-base do elemento: com `position: relative` ele
       entrava no FLUXO do contêiner e cada marcador era empurrado pelo
       anterior — o ponto azul ficou 122px abaixo do lugar, constante em px de
       TELA, então ao dar zoom a rua embaixo dele trocava. Esta prova compara
       o pixel do marcador com a projeção matemática em dois zooms. */
    if (await p.evaluate(() => !!(App.mapa && App.mapa.instancia))) {
      // O marcador só nasce quando o ESTILO do mapa termina de carregar —
      // medir antes disso é medir o nada (foi o primeiro erro desta prova).
      const montou = await p.waitForFunction(
        () => document.querySelector('.eu') && document.querySelector('.pin[data-id="t1"]'),
        null, { timeout: 15000 }).then(() => true).catch(() => false);
      checa(montou, 'o ponto azul e os pinos montaram no mapa real');
      const desvioEm = async (z) => {
        if (!montou) return { eu: 999, pino: 999 };
        await p.evaluate((zz) => App.mapa.instancia.setZoom(zz), z);
        await p.waitForTimeout(420);
        return p.evaluate(() => {
          const inst = App.mapa.instancia;
          const cv = inst.getCanvas().getBoundingClientRect();
          const pt = inst.project([Dados.EU.lng, Dados.EU.lat]);
          const eu = document.querySelector('.eu').getBoundingClientRect();
          const t1 = Dados.porId('t1');
          const pin = document.querySelector('.pin[data-id="t1"]').getBoundingClientRect();
          const pp = inst.project([t1.lng, t1.lat]);
          return {
            eu: Math.hypot(eu.x + eu.width / 2 - pt.x - cv.x, eu.y + eu.height / 2 - pt.y - cv.y),
            pino: Math.hypot(pin.x + pin.width / 2 - pp.x - cv.x, pin.y + pin.height - pp.y - cv.y),
          };
        });
      };
      const perto = await desvioEm(16);
      const longe = await desvioEm(12.5);
      checa(perto.eu < 2 && longe.eu < 2,
        'o ponto azul não se move ao dar zoom (pregado na projeção)',
        `desvio ${perto.eu.toFixed(1)}px @16 · ${longe.eu.toFixed(1)}px @12.5`);
      checa(perto.pino < 2 && longe.pino < 2,
        'os pinos também ficam pregados no lugar',
        `desvio ${perto.pino.toFixed(1)}px @16 · ${longe.pino.toFixed(1)}px @12.5`);
    }

    checa(erros.length === 0, 'nenhum erro de JavaScript', erros.slice(0, 2).join(' | '));

    /* ⚠️ Fotografar antes do estilo baixar rende um retângulo cinza — e foi
       exatamente o que aconteceu na primeira versão: a foto sugeria mapa
       quebrado enquanto todas as provas passavam. Espera-se o FATO. */
    await p.waitForFunction(() => App.mapa && App.mapa.bruto && App.mapa.bruto.isStyleLoaded(),
                            null, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(FOTOS, '23-gps-perto.png') });
    await ctx.close();
  }

  /* ------------------------------------------- 2. permitiu, mas está longe */
  console.log('\n— permitiu, mas está longe dos dados —');
  {
    const ctx = await navegador.newContext({
      ...devices['iPhone 13'], locale: 'pt-BR',
      permissions: ['geolocation'],
      geolocation: { latitude: -8.0476, longitude: -34.8770, accuracy: 30 },   // Recife
    });
    const p = await ctx.newPage();
    await p.goto(URL);
    await atePermitir(p);
    await p.click('[data-a="permitirLocal"]');
    await p.waitForFunction(() => Dados.EU.origem === 'gps', null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(2200);

    const avisou = await p.evaluate(() => document.body.innerText.includes('longe das terapeutas'));
    checa(avisou, 'o app AVISA que os dados de teste estão em outra região');

    const temSaida = await p.isVisible('[data-ok]');
    checa(temSaida, 'e oferece ver a região de teste em vez de um mapa vazio');

    await p.screenshot({ path: path.join(FOTOS, '24-gps-longe.png') });
    if (temSaida) {
      await p.click('[data-ok]');
      await p.waitForTimeout(1200);
      const voltou = await p.evaluate(() => Dados.EU.origem);
      checa(voltou === 'ficticia', 'aceitar leva de volta à região de teste', voltou);
    }
    await ctx.close();
  }

  /* ------------------------------------------------------------ 3. negou */
  console.log('\n— negou a localização —');
  {
    const ctx = await navegador.newContext({
      ...devices['iPhone 13'], locale: 'pt-BR',
      permissions: [],                       // sem geolocation = negado
    });
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', (e) => erros.push(e.message));
    await p.goto(URL);
    await atePermitir(p);
    await p.click('[data-a="permitirLocal"]');
    await p.waitForTimeout(4000);

    /* ⚠️ Antes esta prova lia o AVISO flutuante — que some em 2,6 s. Ela
       falhava por timing, e o defeito que apontava era do teste. Ao investigar
       apareceu um defeito de verdade: quem negava caía na tela de cidade sem
       saber POR QUÊ. Agora a explicação FICA na tela, e é ela que se lê. */
    const explicou = await p.evaluate(() => document.body.innerText.includes('não permitiu'));
    checa(explicou, 'a explicação FICA na tela, não some com o aviso');

    const naCidade = await p.isVisible('[data-a="definirCidade"]');
    checa(naCidade, 'e leva para a escolha de cidade — o app continua');
    checa(erros.length === 0, 'negar não quebra nada', erros.slice(0, 2).join(' | '));

    await p.screenshot({ path: path.join(FOTOS, '25-gps-negado.png') });
    await ctx.close();
  }

  await navegador.close();
  servidor.close();

  console.log(`\n${'='.repeat(58)}`);
  console.log(falhas.length ? `  ${falhas.length} FALHA(S)` : '  o GPS diz a verdade');
  console.log('='.repeat(58));
  falhas.forEach((f) => console.log('  FALHA: ' + f));
  process.exit(falhas.length ? 1 : 0);
})();
