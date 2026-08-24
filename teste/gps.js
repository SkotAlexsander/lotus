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
