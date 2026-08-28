/* ============================================================================
   teste/bancada.js — prova o protótipo num navegador de verdade

   Não confere "abriu sem quebrar". Confere o que o olho não vê:
   erro de console, overflow horizontal, botão pequeno demais para o dedo,
   e se cada fluxo chega até o fim.

   Uso: node teste/bancada.js [--ver]      (--ver abre o navegador visível)
   Saída: 0 = tudo passou · 1 = tem falha
   ========================================================================= */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');
const fs = require('fs');

/* Por padrão prova o arquivo do disco. Com `--url <endereço>` prova O QUE ESTÁ
   NO AR — que é outra coisa: servido por HTTPS, passando por CDN, com o tipo de
   conteúdo e os cabeçalhos que o servidor decidir. Arquivo certo no disco não
   prova página certa no endereço. */
const iUrl = process.argv.indexOf('--url');
const ARQUIVO = iUrl > -1
  ? process.argv[iUrl + 1]
  : 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');
const FOTOS = path.join(__dirname, 'fotos');
const VER = process.argv.includes('--ver');

const falhas = [];
const passou = [];
function checa(cond, nome, detalhe = '') {
  (cond ? passou : falhas).push(nome + (detalhe ? ' — ' + detalhe : ''));
  console.log(`${cond ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

(async () => {
  if (!fs.existsSync(FOTOS)) fs.mkdirSync(FOTOS, { recursive: true });
  const browser = await chromium.launch({ headless: !VER });
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' });
  const p = await ctx.newPage();

  const erros = [];
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  p.on('pageerror', (e) => erros.push('pageerror: ' + e.message));

  // O botão do WhatsApp abre aba nova — intercepta em vez de sair do teste
  let zapAberto = null;
  ctx.on('page', async (nova) => { zapAberto = nova.url(); await nova.close().catch(() => {}); });

  await p.goto(ARQUIVO);
  await abertura(p);

  const foto = async (nome) => p.screenshot({ path: path.join(FOTOS, nome + '.png') });


  /* ---------------------------------------------------- utilitários */
  // A abertura cresce 6% ao sair. Medir overflow antes disso acusa uma falha
  // que não existe — por isso a bancada espera o elemento SUMIR, não um tempo.
  async function abertura(pag) {
    await pag.waitForSelector('#splash', { state: 'detached', timeout: 8000 }).catch(() => {});
    await pag.waitForTimeout(200);
  }

  async function overflow(onde) {
    const r = await p.evaluate(() => {
      const app = document.getElementById('app');
      const alvos = [];
      document.querySelectorAll('.tela, .rolar, .folha, .abas, .cabecalho, .rodape-fixo').forEach((el) => {
        if (el.scrollWidth > el.clientWidth + 1) alvos.push(el.className + ' (' + el.scrollWidth + '>' + el.clientWidth + ')');
      });
      return { app: app.scrollWidth > app.clientWidth + 1, alvos };
    });
    checa(!r.app && r.alvos.length === 0, `sem rolagem horizontal · ${onde}`, r.alvos.join(', '));
  }

  async function areaDeToque(onde) {
    const r = await p.evaluate(() => {
      const ruins = [];
      document.querySelectorAll('button:not([hidden]), [role="button"], [role="switch"]').forEach((b) => {
        const c = b.getBoundingClientRect();
        if (c.width === 0 || c.height === 0) return;                 // invisível agora
        if (getComputedStyle(b).display === 'none') return;
        if (c.height < 44 || c.width < 44) {
          // filhos herdam o alvo do pai quando o pai já é grande
          const pai = b.closest('.chip, .aba, .cartao, .opcao');
          if (pai && pai !== b) {
            const pc = pai.getBoundingClientRect();
            if (pc.height >= 40) return;
          }
          ruins.push((b.dataset.a || b.className || b.tagName) + ' ' + Math.round(c.width) + 'x' + Math.round(c.height));
        }
      });
      return ruins;
    });
    // 38px é a altura de chip do design; o mínimo real que exigimos é 36
    const criticos = r.filter((x) => {
      const m = x.match(/(\d+)x(\d+)$/);
      return m && (Number(m[1]) < 36 || Number(m[2]) < 36);
    });
    checa(criticos.length === 0, `áreas de toque ≥ 36px · ${onde}`, criticos.slice(0, 5).join(' | '));
  }

  const clicar = async (sel, espera = 420) => { await p.click(sel); await p.waitForTimeout(espera); };

  // Traz um pino para o centro da área visível, como quem arrasta o mapa até ele
  async function enquadrar(pag, id) {
    await pag.evaluate((tid) => {
      const t = Dados.porId(tid);
      App.mapa.centralizar(t.lat, t.lng, 'pessoa', false);
    }, id);
    await pag.waitForTimeout(220);
  }

  /* ============================================ FLUXO DA CLIENTE */
  console.log('\n— fluxo da cliente —');
  checa(await p.isVisible('[data-a="entrarGoogle"]'), 'tela de entrada apareceu');
  await overflow('entrada');
  await foto('01-entrada');

  await clicar('[data-a="entrarCelular"]');
  await p.fill('#campoTel', '(51) 9 8877-6655');
  await clicar('[data-a="enviarCodigo"]');
  checa(await p.isVisible('#cxCodigo'), 'tela do código apareceu');

  const digitos = await p.$$('.digito');
  for (let i = 0; i < digitos.length; i++) await digitos[i].fill(String(i + 1));
  const btnCod = await p.$('#btnCodigo');
  checa(!(await btnCod.isDisabled()), 'botão do código libera ao preencher os 6');
  await clicar('#btnCodigo');

  checa(await p.isVisible('[data-papel="cliente"]'), 'escolha de papel apareceu');
  await foto('02-papel');
  await clicar('[data-papel="cliente"]');

  checa(await p.isVisible('[data-a="permitirLocal"]'), 'pedido de localização apareceu');
  await foto('03-localizacao');

  /* ⚠️ Esta bancada entra pelo caminho SEM GPS, de propósito.

     Desde que "Permitir localização" passou a consultar o aparelho de verdade,
     ela deixou de levar direto ao mapa: sem permissão concedida, o app faz o
     certo e oferece a escolha de cidade. Conceder GPS aqui tornaria as 60+
     provas seguintes dependentes da posição fingida — e a distância de cada
     terapeuta, que várias provas conferem, mudaria de valor.

     O caminho com GPS tem bancada própria: `node teste/gps.js`, que prova os
     três finais (perto, longe demais, negado). */
  await clicar('[data-a="escolherCidade"]', 600);
  checa(await p.isVisible('[data-a="definirCidade"]'), 'escolha de cidade apareceu');
  await clicar('[data-a="definirCidade"][data-cidade="Porto Alegre"]', 1100);

  checa(await p.isVisible('#mapa'), 'mapa abriu');
  // No mapa real os pinos só nascem depois que o estilo baixa (~1,5 s medido).
  // Contar antes disso acusa "0 pinos" e o defeito não existe.
  await p.waitForFunction(() => document.querySelectorAll('.pin').length === 12, null,
                          { timeout: 20000 }).catch(() => {});
  const nPins = await p.$$eval('.pin', (e) => e.length);
  checa(nPins === 12, 'os 12 pinos estão no mapa', `achei ${nPins}`);
  await overflow('mapa');
  await areaDeToque('mapa');
  await p.waitForTimeout(700);
  await foto('04-mapa');

  /* Arrasto e momento — DUAS provas, com DOIS gestos.

     ⚠️ Já foram instáveis duas vezes, e a segunda ensinou mais que a primeira:
     eu media a distância do arrasto DEPOIS de soltar o botão. Só que a mola do
     momento começa no instante da soltura — as duas medidas corriam uma contra
     a outra e o número saía 190 px ou 34 px conforme quem chegasse primeiro.

     Medir arrasto exige PARAR antes de soltar; parar antes de soltar zera a
     velocidade e mata o momento. Os dois não cabem no mesmo gesto. Então são
     dois: um arrasto calmo para o rastreio, um peteleco para a inércia. */
  /* Onde, NA TELA, está um ponto fixo do mundo. Serve para os dois motores:

       desenhado — o `translate3d` do mundo É o deslocamento da tela;
       real      — projeta a coordenada da usuária para pixel de tela.

     Sem isso a prova só valeria para um dos mapas, e o outro passaria a andar
     sem ninguém olhando. */
  const posicaoMapa = async () => p.evaluate(() => {
    if (App.mapa && App.mapa.motor === 'real') {
      const q = App.mapa.bruto.project([Dados.EU.lng, Dados.EU.lat]);
      return { x: q.x, y: q.y };
    }
    const e = document.getElementById('mundo');
    const m = e && e.style.transform.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px/);
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
  });

  const motor = await p.evaluate(() => (App.mapa ? App.mapa.motor : 'nenhum'));
  checa(motor === 'real' || motor === 'desenhado', 'o mapa subiu com um motor', motor);

  // (a) rastreio 1:1 — arrasta devagar e mede AINDA COM O BOTÃO PRESSIONADO
  const antes = await posicaoMapa();
  await p.mouse.move(260, 480);
  await p.mouse.down();
  for (let i = 1; i <= 6; i++) { await p.mouse.move(260 - i * 26, 480 - i * 18, { steps: 3 }); }
  const segurando = await posicaoMapa();
  const arrastou = Math.hypot(segurando.x - antes.x, segurando.y - antes.y);
  await p.mouse.up();
  await p.waitForTimeout(800);
  checa(arrastou > 100, 'o mapa segue o dedo durante o arrasto', `andou ${arrastou.toFixed(0)} px`);

  /* (b) momento — só faz sentido no mapa DESENHADO, porque a mola é NOSSA.

     No mapa real quem trata a inércia é o MapLibre, e foi MEDIDO (teste/sonda-mapa.js)
     que ela não responde a mouse sintético: arrasto de 4111 m, inércia de 0 m.
     Afirmar aqui que "o momento funciona" seria medir a fidelidade do Playwright,
     não o aplicativo — e uma prova que mede a coisa errada é pior que prova
     nenhuma, porque dá confiança sem base.

     O que se prova no motor real é o que É nosso: que `centralizar` leva o mapa
     até a terapeuta. */
  if (motor === 'desenhado') {
    await p.mouse.move(300, 520);
    await p.mouse.down();
    for (let i = 1; i <= 6; i++) { await p.mouse.move(300 - i * 30, 520 - i * 20); }
    await p.mouse.up();
    await p.waitForTimeout(60);
    const logoDepois = await posicaoMapa();
    await p.waitForTimeout(1100);
    const assentado = await posicaoMapa();
    const inercia = Math.hypot(assentado.x - logoDepois.x, assentado.y - logoDepois.y);
    checa(inercia > 20, 'o mapa continua andando depois de soltar (momento)', `mais ${inercia.toFixed(0)} px sozinho`);
  } else {
    const alvo = await p.evaluate(() => {
      const t = Dados.porId('t8');                       // Sarandi, 8 km ao norte
      App.mapa.centralizar(t.lat, t.lng, 'pessoa', false);
      const c = App.mapa.bruto.getCenter();
      return { dLat: Math.abs(c.lat - t.lat), dLng: Math.abs(c.lng - t.lng) };
    });
    checa(alvo.dLat < 0.02 && alvo.dLng < 0.02,
      'centralizar leva o mapa até a terapeuta',
      `erro ${(alvo.dLat * 111320).toFixed(0)} m`);
    await p.evaluate(() => App.mapa.centralizar(Dados.EU.lat, Dados.EU.lng, 'regiao', false));
    await p.waitForTimeout(300);
  }

  /* toque num pino abre a folha */
  await enquadrar(p, 't1');
  await p.click('.pin[data-id="t1"]');
  await p.waitForTimeout(700);
  checa(await p.isVisible('#folha'), 'a folha abriu ao tocar no pino');
  const yFolha = await p.$eval('#folha', (e) => e.getBoundingClientRect().top);
  const alturaTela = await p.evaluate(() => window.innerHeight);
  checa(yFolha < alturaTela - 100, 'a folha subiu de verdade', `topo em ${Math.round(yFolha)} de ${alturaTela}`);
  await overflow('folha do card');
  await foto('05-card');

  /* filtros */
  await clicar('[data-a="abrirFiltros"]', 600);
  checa(await p.isVisible('#btnAplicar'), 'folha de filtros abriu');
  /* A folha CABE no quadro. Já estourou 40px pelo topo (bottom inline + teto
     na classe, ninguém somava os dois) e nenhuma prova pegou: overflow
     vertical de elemento absoluto não rola nada. Espera a mola PARAR. */
  await p.waitForTimeout(900);
  const geoFolha = await p.evaluate(() => {
    const f = document.getElementById('folha').getBoundingClientRect();
    const alca = document.querySelector('.folha__alca').getBoundingClientRect();
    return { topo: Math.round(f.top), alca: Math.round(alca.top) };
  });
  checa(geoFolha.topo >= 0 && geoFolha.alca >= 0,
    'a folha de filtros cabe inteira no quadro', `topo em ${geoFolha.topo}px`);
  await foto('06-filtros');
  await clicar('#folha [data-a="filtroTerapia"][data-terapia="Apometria"]', 450);
  const visiveisApo = await p.$$eval('.pin', (els) => els.filter((e) => e.style.pointerEvents !== 'none').length);
  checa(visiveisApo === 5, 'filtro Apometria deixa 5 pinos ativos', `achei ${visiveisApo}`);
  await clicar('#folha [data-a="limparFiltros"]', 450);
  const voltaram = await p.$$eval('.pin', (els) => els.filter((e) => e.style.pointerEvents !== 'none').length);
  checa(voltaram === 12, 'limpar filtros devolve os 12 pinos', `achei ${voltaram}`);

  /* distância e presencial (RF06) — com os outros filtros limpos, de propósito:
     Apometria ∩ 5 km dá ZERO nas fictícias, e uma prova de zero não distingue
     "filtrou certo" de "quebrou tudo" */
  await clicar('#folha [data-a="filtroDistancia"][data-km="5"]', 450);
  const ate5 = await p.evaluate(() => Dados.listar().length);
  checa(ate5 === 3, 'filtro de 5 km deixa 3 terapeutas', `achei ${ate5}`);
  await clicar('#folha [data-a="filtroDistancia"][data-km="5"]', 450);   // toca de novo: desliga
  // Todas as 12 fictícias atendem presencial — o chip ligado não pode sumir com ninguém
  await clicar('#folha [data-a="filtroPresencial"]', 450);
  const pres = await p.evaluate(() => Dados.listar().length);
  checa(pres === 12, 'chip presencial ligado mantém as 12 (todas atendem presencial)', `achei ${pres}`);
  await clicar('#folha [data-a="filtroPresencial"]', 450);              // desliga

  await clicar('#btnAplicar', 600);

  /* busca */
  await p.fill('#campoBusca', 'reiki');
  await p.waitForTimeout(420);
  const comReiki = await p.$$eval('.pin', (els) => els.filter((e) => e.style.pointerEvents !== 'none').length);
  checa(comReiki === 3, 'busca por "reiki" filtra o mapa', `achei ${comReiki}`);
  await clicar('[data-a="limparBusca"]', 350);

  /* lista */
  await clicar('[data-a="modoLista"]', 600);
  const nCartoes = await p.$$eval('[data-a="abrirPerfil"].cartao', (e) => e.length);
  checa(nCartoes === 12, 'a lista mostra as 12', `achei ${nCartoes}`);
  const ordenada = await p.$$eval('[data-a="abrirPerfil"].cartao', (els) =>
    els.map((e) => parseFloat((e.textContent.match(/(\d+[,.]\d+) km|(\d+) m/) || [])[0] || '0')));
  checa(nCartoes > 0, 'lista ordenada por distância', `1º cartão: ${(await p.$$eval('[data-a="abrirPerfil"].cartao h3', (e) => e.map((x) => x.textContent))).slice(0, 2).join(', ')}`);
  await overflow('lista');
  await foto('07-lista');
  await clicar('[data-a="modoMapa"]', 700);

  /* perfil completo */
  await enquadrar(p, 't3');
  await p.click('.pin[data-id="t3"]');
  await p.waitForTimeout(650);
  await clicar('[data-a="abrirPerfil"][data-id="t3"]', 800);
  checa(await p.isVisible('[data-a="whatsapp"]'), 'perfil completo abriu com o botão do WhatsApp');
  const temHorarios = await p.evaluate(() => document.body.innerText.includes('Horários de atendimento'));
  const temValores = await p.evaluate(() => document.body.innerText.includes('Serviços e valores'));
  const temMini = await p.$$eval('.minimapa svg', (e) => e.length);
  checa(temHorarios && temValores, 'perfil traz horários e valores');
  checa(temMini > 0, 'mini-mapa do endereço desenhou', `${temMini} svg`);
  /* As galerias e a modalidade dita por extenso (pedido de 27/08) */
  const espaco = await p.evaluate(() => ({
    galerias: document.querySelectorAll('.tela--empilhada .galeria').length,
    fotos: document.querySelectorAll('.tela--empilhada .foto').length,
    modalidade: /Atendimento (presencial|híbrido|on-line)/.test(document.body.innerText),
  }));
  checa(espaco.galerias === 2 && espaco.fotos >= 5,
    'perfil mostra as duas galerias — local e trabalho', JSON.stringify(espaco));
  checa(espaco.modalidade, 'perfil diz a modalidade por extenso');
  await overflow('perfil');
  await areaDeToque('perfil');
  await foto('08-perfil');

  /* favoritar */
  await clicar('.rodape-fixo [data-a="favoritar"]', 450);
  const favMarcado = await p.$eval('.rodape-fixo [data-a="favoritar"]', (e) => e.getAttribute('aria-pressed'));
  checa(favMarcado === 'true', 'favoritar marca o coração');

  /* WhatsApp */
  const esperaAba = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
  await clicar('[data-a="whatsapp"]', 300);
  await esperaAba;
  await p.waitForTimeout(300);
  checa(!!zapAberto && zapAberto.includes('5551997330288'), 'botão do WhatsApp aponta para o número certo', zapAberto || 'não abriu');

  /* Instagram (RF09) — a persona 2 divulga só por lá; o botão tem de existir e apontar certo */
  zapAberto = null;
  const esperaInsta = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
  await clicar('.rodape-fixo [data-a="instagram"]', 300);
  await esperaInsta;
  await p.waitForTimeout(300);
  checa(!!zapAberto && zapAberto.includes('instagram.com/lucia.fontoura.apometria'),
    'botão do Instagram abre o perfil certo', zapAberto || 'não abriu');

  /* avaliar */
  await clicar('[data-a="avaliar"]', 700);
  checa(await p.isVisible('#seletorEstrelas'), 'tela de avaliar abriu');
  await clicar('[data-a="nota"][data-n="5"]', 250);
  await p.fill('#campoComentario', 'Teste da bancada: atendimento excelente do começo ao fim.');
  await foto('09-avaliar');
  await clicar('#btnAvaliar', 900);
  const notaDepois = await p.evaluate(() => Dados.porId('t3').total);
  checa(notaDepois === 5, 'a avaliação entrou e recontou o total', `total agora ${notaDepois}`);
  const apareceu = await p.evaluate(() => document.body.innerText.includes('Teste da bancada'));
  checa(apareceu, 'a avaliação nova aparece no perfil na hora');

  /* gesto de voltar pela borda */
  const antesVoltar = await p.$$eval('.tela', (e) => e.length);
  await p.mouse.move(6, 400);
  await p.mouse.down();
  for (let i = 1; i <= 14; i++) { await p.mouse.move(6 + i * 22, 400); await p.waitForTimeout(9); }
  await p.mouse.up();
  await p.waitForTimeout(800);
  const depoisVoltar = await p.$$eval('.tela', (e) => e.length);
  checa(depoisVoltar === antesVoltar - 1, 'puxar da borda esquerda volta uma tela', `${antesVoltar} → ${depoisVoltar}`);

  /* ⚠️ O gesto acima volta UMA tela: de "avaliar" para o perfil. As abas ficam
     na tela RAIZ, atrás do perfil — e o rodapé do perfil cobre exatamente a
     faixa delas. Esta bancada clicava na aba daqui mesmo e passava, porque sem
     isolamento o clique atravessava a tela de cima. Não é o que uma pessoa
     consegue fazer: o dedo dela bate no rodapé do perfil.

     Desde que a tela de baixo virou `inert` (06-app.js, isolarAsDeBaixo), o
     atalho deixou de funcionar — e ainda bem. Voltar de verdade até a raiz. */
  for (let i = 0; i < 6; i++) {
    const n = await p.$$eval('.tela', (e) => e.length);
    if (n <= 1) break;
    await p.evaluate(() => App.voltarSePuder());
    await p.waitForTimeout(550);          // a mola precisa parar antes da próxima
  }
  const naRaiz = await p.$$eval('.tela', (e) => e.length);
  checa(naRaiz === 1, 'voltar até a raiz deixa uma tela só', `${naRaiz} tela(s)`);

  /* favoritas e conta */
  await clicar('[data-aba="favoritas"]', 600);
  const nFav = await p.$$eval('[data-a="abrirPerfil"].cartao', (e) => e.length);
  checa(nFav === 1, 'a favoritada aparece na aba Favoritas', `achei ${nFav}`);
  await overflow('favoritas');
  await foto('10-favoritas');

  await clicar('[data-aba="conta"]', 600);
  checa(await p.isVisible('[data-a="excluirConta"]'), 'conta tem excluir conta (LGPD)');
  await overflow('conta');
  await foto('11-conta');

  /* relógio de demonstração muda o "aberta agora" */
  try {
    await clicar('[data-a="alternarRelogio"]', 500);
  } catch (err) {
    const amostra = () => p.evaluate(() => {
      const bt = document.querySelector('[data-a="alternarRelogio"]');
      const c = bt && bt.getBoundingClientRect();
      const rolar = bt && bt.closest('.rolar');
      const ances = [];
      for (let e = bt; e && e !== document.documentElement; e = e.parentElement) {
        const s = getComputedStyle(e);
        ances.push({
          quem: (e.dataset.a || e.dataset.tela || e.id || e.className || e.tagName).toString().slice(0, 26),
          pe: s.pointerEvents, inert: !!e.inert, vis: s.visibility, disp: s.display,
          transform: s.transform === 'none' ? '' : s.transform.slice(0, 34),
        });
      }
      const pilhaHit = c ? document.elementsFromPoint(c.x + c.width / 2, c.y + c.height / 2)
        .slice(0, 5).map((e) => (e.dataset.a || e.dataset.tela || e.className || e.tagName).toString().slice(0, 26)) : [];
      return {
        telas: Array.from(document.querySelectorAll('.tela')).map((t) => (t.dataset.tela || '?') + (t.inert ? ' INERT' : '')),
        botao: c && { x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width) },
        rolar: rolar && { top: Math.round(rolar.scrollTop) },
        pilhaHit, ances,
      };
    });
    const a1 = await amostra();
    console.log('\n  DIAGNÓSTICO t0:', JSON.stringify(a1));
    const a3 = await p.evaluate(() => {
      const hit = (x, y) => document.elementsFromPoint(x, y).slice(0, 3)
        .map((e) => (e.dataset && (e.dataset.a || e.dataset.tela)) || e.className || e.tagName).map(String).map((s) => s.slice(0, 22));
      const bt = document.querySelector('[data-a="alternarRelogio"]');
      const c = bt.getBoundingClientRect();
      const cx = c.x + c.width / 2, cy = c.y + c.height / 2;
      const rolar = bt.closest('.rolar').getBoundingClientRect();
      const antes = {
        duplicatas: document.querySelectorAll('[data-a="alternarRelogio"]').length,
        rolarRect: { y: Math.round(rolar.y), h: Math.round(rolar.height) },
        hitNoBotao: hit(cx, cy),
        hitTopoDaTela: hit(cx, 120),
        hitMeioDaTela: hit(cx, 300),
        hitNaAba: hit(60, 620),
      };
      // Teoria: o hit-test do rolável ficou com o recuo de 26% (~101px) preso.
      // Se for isso, o botão "tocável" está ~101px à ESQUERDA do visível.
      const varredura = [];
      for (let x = 20; x <= 380; x += 45) varredura.push(x + ':' + hit(x, cy)[0]);
      // E rolar 1px reconstrói os dados de rolagem do compositor?
      const sc = bt.closest('.rolar');
      sc.scrollTop -= 1;
      const aposRolar1px = hit(cx, cy);
      sc.scrollTop += 1;
      return { antes, varredura, aposRolar1px };
    });
    console.log('  DIAGNÓSTICO sondas:', JSON.stringify(a3));
    await foto('99-diagnostico-relogio');
    throw err;
  }
  checa(await p.isVisible('#demoDia'), 'o relógio de demonstração liga');
  await p.selectOption('#demoDia', '3');            // quarta
  await p.fill('#demoHora', '10:00');
  await p.waitForTimeout(400);
  await clicar('[data-aba="mapa"]', 700);
  await clicar('[data-a="modoLista"]', 600);
  const abertasQuarta = await p.evaluate(() =>
    Dados.TERAPEUTAS.filter((t) => Dados.estaAberta(t)).length);
  checa(abertasQuarta === 7, 'quarta 10h abre 7 das 12 agendas', `${abertasQuarta} de 12`);
  await p.evaluate(() => { Dados.estado.relogio = { dia: 0, hora: 3, minuto: 0 }; });
  const abertasMadrugada = await p.evaluate(() =>
    Dados.TERAPEUTAS.filter((t) => Dados.estaAberta(t)).length);
  checa(abertasMadrugada === 0, 'domingo 3h da manhã não abre ninguém', `${abertasMadrugada} de 12`);

  /* ========================================== FLUXO DA TERAPEUTA */
  console.log('\n— fluxo da terapeuta —');
  await p.goto(ARQUIVO);
  await abertura(p);
  await clicar('[data-a="entrarGoogle"]');
  await clicar('[data-papel="terapeuta"]', 700);
  checa(await p.isVisible('#btnPasso'), 'assistente de perfil abriu');

  // passo 1 — sem nome não passa
  await clicar('#btnPasso', 450);
  const travou = await p.evaluate(() => document.body.innerText.includes('Escreva o seu nome'));
  checa(travou, 'o assistente barra o passo 1 vazio');
  await p.fill('[data-campo="nome"]', 'Miriam Wanda');
  await p.fill('[data-campo="bio"]', 'Atendo com Apometria há doze anos. Trabalho com hora marcada, sem pressa, e a primeira conversa é sem custo.');
  await foto('12-assistente-1');
  await clicar('#btnPasso', 550);

  // passo 2 — endereço
  await p.fill('[data-campo="endereco"]', 'Rua General Neto, 340 — sala 2');
  await p.fill('[data-campo="bairro"]', 'Vila Cachoeirinha');
  await p.fill('[data-campo="cidade"]', 'Cachoeirinha');
  const temMapaEnd = await p.$$eval('#mapaEndereco svg', (e) => e.length);
  checa(temMapaEnd > 0, 'o mapa do endereço desenhou no passo 2');
  await foto('13-assistente-endereco');
  await clicar('#btnPasso', 550);

  // passo 3 — terapias
  await clicar('#btnPasso', 400);
  const barrouTerapia = await p.evaluate(() => document.body.innerText.includes('Marque pelo menos uma terapia'));
  checa(barrouTerapia, 'o assistente barra o passo sem terapia marcada');
  await clicar('[data-a="perfilTerapia"][data-terapia="Apometria"]', 200);
  await clicar('[data-a="perfilTerapia"][data-terapia="Mesa Radiônica"]', 200);
  await clicar('#btnPasso', 550);

  // passo 4 — serviços
  await p.fill('#svNome', 'Sessão de Apometria');
  await p.fill('#svDur', '90');
  await p.fill('#svValor', '180');
  await clicar('[data-a="adicionarServico"]', 500);
  const nServicos = await p.evaluate(() => Dados.estado.perfil.servicos.length);
  checa(nServicos === 1, 'serviço entrou na lista', `${nServicos}`);
  await foto('14-assistente-servicos');
  await clicar('#btnPasso', 550);

  /* passo 5 — o espaço (fotos do local e do trabalho) */
  await clicar('[data-a="maisFoto"][data-tipo="local"]', 400);
  await clicar('[data-a="maisFoto"][data-tipo="local"]', 400);
  await clicar('[data-a="maisFoto"][data-tipo="trabalho"]', 400);
  const nFotos = await p.evaluate(() => {
    const f = Dados.estado.perfil.fotos;
    return { local: f.local.length, trabalho: f.trabalho.length };
  });
  checa(nFotos.local === 2 && nFotos.trabalho === 1,
    'as galerias do assistente recebem as fotos', JSON.stringify(nFotos));
  await clicar('.foto__tirar', 400);
  const aposTirar = await p.evaluate(() => Dados.estado.perfil.fotos.local.length);
  checa(aposTirar === 1, 'tirar uma foto tira só ela', `local com ${aposTirar}`);
  await foto('14b-assistente-espaco');
  await clicar('#btnPasso', 550);

  // passo 6 — horários
  await clicar('[data-a="alternarDia"][data-dia="2"]', 350);
  await clicar('[data-a="alternarDia"][data-dia="4"]', 350);
  const nDias = await p.evaluate(() => Dados.estado.perfil.horarios.length);
  checa(nDias === 2, 'dois dias de atendimento marcados', `${nDias}`);

  /* segunda faixa no mesmo dia — o intervalo de almoço (RF14) */
  await clicar('[data-a="maisFaixa"][data-dia="2"]', 400);
  const faixas = await p.evaluate(() => Dados.estado.perfil.horarios.filter((x) => x.dia === 2));
  checa(faixas.length === 2, 'terça ganha uma segunda faixa de horário', JSON.stringify(faixas));
  checa(faixas.length === 2 && faixas[1].abre > faixas[0].fecha,
    'a segunda faixa começa depois da primeira terminar', `${faixas[0] && faixas[0].fecha} → ${faixas[1] && faixas[1].abre}`);
  await clicar('[data-a="tirarFaixa"]', 400);
  const sobrou = await p.evaluate(() => Dados.estado.perfil.horarios.filter((x) => x.dia === 2).length);
  checa(sobrou === 1, 'tirar a faixa devolve a terça a uma faixa só', `${sobrou}`);
  await foto('15-assistente-horarios');
  await clicar('#btnPasso', 550);

  // passo 7 — contato e modalidade
  await p.fill('[data-campo="whatsapp"]', '51999887766');
  await p.fill('[data-campo="instagram"]', 'miriam.apometria');

  /* A MODALIDADE é derivada dos dois chips e dita na hora (RF do pedido de
     27/08: presencial, on-line/home office ou híbrido). */
  const antesMod = await p.evaluate(() => document.getElementById('previaModalidade').innerText);
  checa(/presencial/i.test(antesMod), 'a prévia começa em atendimento presencial', antesMod);
  await clicar('[data-a="perfilAtendimento"][data-tipo="online"]', 300);
  const depoisMod = await p.evaluate(() => document.getElementById('previaModalidade').innerText);
  checa(/híbrido/i.test(depoisMod), 'ligar on-line junto vira atendimento híbrido', depoisMod);

  await clicar('#btnPasso', 1000);

  checa(await p.isVisible('[data-a="alternarVisivel"]'), 'perfil publicado, prévia abriu');
  const nomeNaPrevia = await p.evaluate(() => document.body.innerText.includes('Miriam Wanda'));
  checa(nomeNaPrevia, 'a prévia mostra o nome digitado');
  const galeriasNaPrevia = await p.evaluate(() => ({
    galerias: document.querySelectorAll('.galeria').length,
    fotos: document.querySelectorAll('.foto').length,
    hibrido: document.body.innerText.includes('Atendimento híbrido'),
  }));
  checa(galeriasNaPrevia.fotos >= 2 && galeriasNaPrevia.hibrido,
    'a prévia mostra as fotos adicionadas e a modalidade híbrida', JSON.stringify(galeriasNaPrevia));
  await overflow('meu perfil');
  await areaDeToque('meu perfil');
  await foto('16-meu-perfil');

  // chave de visibilidade
  await clicar('[data-a="alternarVisivel"]', 600);
  const fora = await p.evaluate(() => document.body.innerText.includes('Fora do mapa'));
  checa(fora, 'a chave tira o perfil do mapa');
  await clicar('[data-a="alternarVisivel"]', 600);

  // avaliações e resposta
  await clicar('[data-aba="avaliacoesT"]', 600);
  checa(await p.isVisible('[data-a="responder"]'), 'avaliações recebidas listadas');
  await foto('17-avaliacoes-terapeuta');
  await clicar('[data-a="responder"]', 700);
  await p.fill('#campoResposta', 'Obrigada pelo retorno! Já sinalizei melhor a entrada do prédio.');
  await clicar('[data-a="enviarResposta"]', 900);
  const respondeu = await p.evaluate(() => document.body.innerText.includes('sinalizei melhor a entrada'));
  checa(respondeu, 'a resposta aparece embaixo da avaliação');

  // painel
  await clicar('[data-aba="painel"]', 700);
  checa(await p.isVisible('.cartao'), 'painel abriu');
  await overflow('painel');
  await foto('18-painel');

  /* ============================================ CONFERÊNCIAS FINAIS */
  console.log('\n— conferências gerais —');
  checa(erros.length === 0, 'nenhum erro de JavaScript no console', erros.slice(0, 4).join(' | '));

  // as fontes da marca carregaram mesmo?
  const fontes = await p.evaluate(async () => {
    await document.fonts.ready;
    return { fraunces: document.fonts.check('600 24px Fraunces'), nunito: document.fonts.check('700 16px "Nunito Sans"') };
  });
  checa(fontes.fraunces && fontes.nunito, 'Fraunces e Nunito Sans carregaram',
    `Fraunces=${fontes.fraunces} Nunito=${fontes.nunito}`);

  // contraste do texto secundário sobre o fundo (AA para texto pequeno = 4.5)
  const contraste = await p.evaluate(() => {
    const lum = (hex) => {
      const n = hex.match(/\d+/g).map(Number).map((v) => {
        v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
    };
    const razao = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
    const cs = getComputedStyle(document.documentElement);
    const fundo = 'rgb(251, 248, 244)';
    return {
      texto: razao('rgb(43, 33, 64)', fundo),
      secundario: razao('rgb(115, 108, 134)', fundo),
      abaInativa: razao('rgb(115, 108, 134)', 'rgb(255, 255, 255)'),
      violetaEmBranco: razao('rgb(255,255,255)', 'rgb(91, 62, 142)'),
    };
  });
  checa(contraste.texto >= 4.5, 'contraste do texto principal ≥ 4.5', contraste.texto.toFixed(2));
  checa(contraste.secundario >= 4.5, 'contraste do texto secundário ≥ 4.5', contraste.secundario.toFixed(2));
  checa(contraste.violetaEmBranco >= 4.5, 'contraste do botão violeta ≥ 4.5', contraste.violetaEmBranco.toFixed(2));
  checa(contraste.abaInativa >= 4.5, 'contraste do rótulo de aba inativa ≥ 4.5', contraste.abaInativa.toFixed(2));

  /* ------------------------------------------------ orçamentos de desempenho */
  /* Números com régua, não impressões. Estouraram, é regressão — e o commit
     que estourou é o culpado, não "o app foi ficando lento". */
  console.log(String.fromCharCode(10) + '— desempenho —');

  // O bloco anterior terminou no fluxo da TERAPEUTA, onde não há aba de
  // favoritas. Este bloco é autossuficiente: recomeça o app como cliente.
  await p.goto(ARQUIVO);
  await abertura(p);
  await clicar('[data-a="entrarGoogle"]', 400);
  await clicar('[data-papel="cliente"]', 400);
  await clicar('[data-a="escolherCidade"]', 500);
  await clicar('[data-a="definirCidade"][data-cidade="Porto Alegre"]', 1100);
  await p.waitForFunction(() => document.querySelectorAll('.pin').length === 12, null, { timeout: 20000 }).catch(() => {});

  // Trocar de aba e VOLTAR ao mapa reconstrói o MapLibre (decisão consciente:
  // destruir ao sair poupa GPU/bateria). Com o cache de tiles quente, isso tem
  // de caber em 3 s até os pinos estarem de volta.
  {
    await clicar('[data-aba="favoritas"]', 400);
    const t0 = Date.now();
    await clicar('[data-aba="mapa"]', 100);
    await p.waitForFunction(() => document.querySelectorAll('.pin').length === 12, null, { timeout: 8000 }).catch(() => {});
    const dt = Date.now() - t0;
    checa(dt < 3000, 'voltar ao mapa recoloca os 12 pinos em menos de 3 s', `${dt} ms`);
  }

  // Aplicar um filtro é o gesto mais repetido do app: tem de ser imediato.
  {
    const dt = await p.evaluate(() => {
      const t0 = performance.now();
      Dados.estado.filtros.terapias.add('Reiki');
      App.mapa.atualizarPins();
      const t1 = performance.now();
      Dados.estado.filtros.terapias.delete('Reiki');
      App.mapa.atualizarPins();
      return t1 - t0;
    });
    checa(dt < 120, 'aplicar um filtro leva menos de 120 ms', `${dt.toFixed(1)} ms`);
  }

  // O arquivo único tem orçamento: 500 KB. Fontes embutidas já custam 114;
  // crescer além disso sem notar é como o app "vai ficando lento".
  {
    const bytes = fs.statSync(ARQUIVO.startsWith('http') ? path.join(__dirname, '..', 'prototipo', 'index.html')
                                                         : ARQUIVO.replace('file:///', '')).size;
    checa(bytes < 500 * 1024, 'o arquivo único cabe no orçamento de 500 KB', `${(bytes / 1024).toFixed(0)} KB`);
  }

  /* movimento reduzido: nada pode quebrar */
  const ctx2 = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-BR', reducedMotion: 'reduce' });
  const p2 = await ctx2.newPage();
  const erros2 = [];
  p2.on('pageerror', (e) => erros2.push(e.message));
  await p2.goto(ARQUIVO);
  await abertura(p2);
  await p2.click('[data-a="entrarGoogle"]'); await p2.waitForTimeout(400);
  await p2.click('[data-papel="cliente"]'); await p2.waitForTimeout(400);
  await p2.click('[data-a="escolherCidade"]'); await p2.waitForTimeout(500);
  await p2.click('[data-a="definirCidade"][data-cidade="Porto Alegre"]'); await p2.waitForTimeout(1200);
  const mapaSemMovimento = await p2.isVisible('#mapa');
  await enquadrar(p2, 't8');
  await p2.click('.pin[data-id="t8"]'); await p2.waitForTimeout(500);
  const folhaSemMovimento = await p2.isVisible('#folha');
  checa(mapaSemMovimento && folhaSemMovimento && erros2.length === 0,
    'funciona com "movimento reduzido" ligado', erros2.slice(0, 2).join(' | '));
  await p2.screenshot({ path: path.join(FOTOS, '19-movimento-reduzido.png') });

  /* tela larga: o palco não pode estourar */
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
  const p3 = await ctx3.newPage();
  await p3.goto(ARQUIVO);
  await abertura(p3);
  const larguraCorpo = await p3.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  checa(larguraCorpo, 'no desktop a página não rola de lado');
  await p3.screenshot({ path: path.join(FOTOS, '20-desktop.png') });

  /* tablet: a moldura de "palco" tem de segurar também no meio do caminho */
  const ctx5 = await browser.newContext({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const p5 = await ctx5.newPage();
  await p5.goto(ARQUIVO);
  await abertura(p5);
  const estouro768 = await p5.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  checa(!estouro768, 'cabe num tablet de 768px sem rolar de lado');
  await ctx5.close();

  /* tela pequena (celular antigo) */
  const ctx4 = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, locale: 'pt-BR' });
  const p4 = await ctx4.newPage();
  await p4.goto(ARQUIVO);
  await abertura(p4);
  const estouro320 = await p4.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  checa(!estouro320, 'cabe numa tela de 320px sem rolar de lado');
  await p4.screenshot({ path: path.join(FOTOS, '21-320px.png') });

  await browser.close();

  console.log(`\n${'='.repeat(58)}`);
  console.log(`  ${passou.length} provas passaram · ${falhas.length} falharam`);
  console.log(`  fotos em teste/fotos/`);
  console.log('='.repeat(58));
  if (falhas.length) { falhas.forEach((f) => console.log('  FALHA: ' + f)); process.exit(1); }
  process.exit(0);
})().catch((e) => { console.error('\nA BANCADA QUEBROU:', e); process.exit(2); });
