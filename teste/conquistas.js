/* ============================================================================
   teste/conquistas.js — os selos contam a verdade, e o aviso sabe calar?

   O que se prova aqui, em navegador real:

     1. cada conquista dispara pelo FATO certo (contato, avaliação, favoritas,
        perfis vistos, perfil publicado, resposta) — e aparece na tela
     2. NUNCA duas vezes: repetir o fato não re-conquista nem re-avisa
     3. a POLÍTICA do aviso: às 23h o aviso de sistema cala (mas a tela
        mostra); de dia, no máximo 3 por sessão
     4. a ponte com o Android recebe exatamente o que a política liberou —
        provado com uma PonteAndroid falsa que anota o que chega

   O relógio simulado é o mesmo da tela de conta (Dados.estado.relogio), então
   a regra de silêncio é testada de verdade, não por fé.

   Uso: node teste/conquistas.js       (exit 0 = passou)
   ========================================================================= */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');
const fs = require('fs');

const ARQUIVO = 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');
const FOTOS = path.join(__dirname, 'fotos');

const falhas = [];
function checa(ok, nome, detalhe = '') {
  if (!ok) falhas.push(nome + (detalhe ? ' — ' + detalhe : ''));
  console.log(`${ok ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

(async () => {
  if (!fs.existsSync(FOTOS)) fs.mkdirSync(FOTOS, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));

  // O WhatsApp abre aba nova; fecha para o teste seguir.
  ctx.on('page', async (nova) => { await nova.close().catch(() => {}); });

  await p.goto(ARQUIVO);
  await p.waitForSelector('#splash', { state: 'detached', timeout: 10000 }).catch(() => {});

  /* A ponte falsa: anota cada aviso que o app tentar mandar ao "Android".
     É o que permite afirmar "a política segurou" em vez de supor. */
  await p.evaluate(() => {
    window.__avisos = [];
    window.PonteAndroid = {
      notificar: (t, c) => window.__avisos.push({ t, c }),
      abrirFora: () => {},
      fundoClaro: () => {},
    };
  });

  await p.click('[data-a="entrarGoogle"]'); await p.waitForTimeout(400);
  await p.click('[data-papel="cliente"]'); await p.waitForTimeout(400);
  await p.click('[data-a="escolherCidade"]'); await p.waitForTimeout(500);

  /* Relógio simulado em QUARTA 10h — dia claro, fora do silêncio. */
  await p.evaluate(() => { Dados.estado.relogio = { dia: 3, hora: 10, minuto: 0 }; });

  await p.click('[data-a="definirCidade"][data-cidade="Porto Alegre"]'); await p.waitForTimeout(1400);
  await p.waitForFunction(() => document.querySelectorAll('.pin').length === 12, null, { timeout: 20000 }).catch(() => {});

  /* ---------------------------------------------- 1. os fatos concedem */
  console.log('\n— os fatos concedem —');

  const tem = (id) => p.evaluate((x) => Conquistas.tem(x), id);

  checa(await tem('primeiros-passos'), 'abrir o mapa concede "Primeiros passos"');

  // 3 favoritas → colecionadora
  await p.evaluate(() => { ['t1', 't2', 't4'].forEach((id) => { Dados.estado.favoritos.add(id); Conquistas.registrar('favoritou'); }); });
  checa(await tem('colecionadora'), '3 favoritas concedem "Colecionadora"');

  // 5 perfis vistos → exploradora
  await p.evaluate(() => { ['t1', 't2', 't4', 't7', 't8'].forEach((id) => Conquistas.registrar('perfil-visto', { id })); });
  checa(await tem('exploradora'), '5 perfis vistos concedem "Exploradora"');

  // contato e avaliação, pelo caminho de verdade dos eventos
  await p.evaluate(() => { Conquistas.registrar('contato'); Conquistas.registrar('avaliou'); });
  checa(await tem('primeiro-contato') && await tem('primeira-avaliacao'),
    'contato e avaliação concedem os seus selos');

  /* ------------------------------------------------- 2. nunca duas vezes */
  console.log('\n— nunca duas vezes —');
  const antes = await p.evaluate(() => window.__avisos.length);
  await p.evaluate(() => { Conquistas.registrar('contato'); Conquistas.registrar('avaliou'); });
  const depois = await p.evaluate(() => window.__avisos.length);
  checa(antes === depois, 'repetir o fato não re-avisa', `${antes} → ${depois}`);

  /* ------------------------------------- 3. a política: limite por sessão */
  console.log('\n— a política do aviso —');
  // Foram 5 conquistas de dia; a ponte deve ter recebido NO MÁXIMO 3.
  const recebidos = await p.evaluate(() => window.__avisos.length);
  checa(recebidos === 3, 'a ponte recebeu só o limite da sessão (3)', `recebeu ${recebidos}`);

  // A TELA, porém, mostra as 5 — o limite é do aviso, não do fato.
  await p.click('[data-aba="conta"]'); await p.waitForTimeout(700);
  /* ⚠️ `.micro` aplica text-transform: uppercase, e `innerText` devolve o texto
     COMO RENDERIZADO — "CONQUISTAS · 5 DE 5". Um regex sensível a caixa acusou
     "seção ausente" com a seção na tela. O /i não é estética: é ler o que o
     navegador realmente mostra. */
  const naTela = await p.evaluate(() => document.body.innerText.match(/Conquistas · (\d) de/i));
  checa(!!naTela && naTela[1] === '5', 'a tela mostra as 5 de 5', naTela ? naTela[0] : 'seção ausente');
  await p.screenshot({ path: path.join(FOTOS, '26-conquistas.png') });

  /* -------------------------------------------- 4. o silêncio da noite */
  console.log('\n— o silêncio da noite —');
  const cala = await p.evaluate(() => {
    Dados.estado.relogio = { dia: 3, hora: 23, minuto: 0 };
    return Conquistas.avisoPermitido();
  });
  checa(cala.pode === false && cala.motivo === 'silencio',
    'às 23h o aviso de sistema cala', JSON.stringify(cala));

  const manha = await p.evaluate(() => {
    Dados.estado.relogio = { dia: 4, hora: 9, minuto: 0 };
    Conquistas._zerar();                       // sessão nova para o limite
    return Conquistas.avisoPermitido();
  });
  checa(manha.pode === true, 'às 9h da manhã o aviso pode', JSON.stringify(manha));

  /* --------------------------------------- 5. o lado da terapeuta */
  console.log('\n— o lado da terapeuta —');
  await p.evaluate(() => {
    Dados.estado.papel = 'terapeuta';
    Conquistas.registrar('perfil-publicado');
    Conquistas.registrar('respondeu');
  });
  checa(await tem('perfil-no-ar') && await tem('primeira-resposta'),
    'publicar o perfil e responder concedem os selos da terapeuta');

  checa(erros.length === 0, 'nenhum erro de JavaScript', erros.slice(0, 3).join(' | '));

  await b.close();
  console.log(`\n${'='.repeat(58)}`);
  console.log(falhas.length ? `  ${falhas.length} FALHA(S)` : '  os selos contam a verdade, e o aviso sabe calar');
  console.log('='.repeat(58));
  falhas.forEach((f) => console.log('  FALHA: ' + f));
  process.exit(falhas.length ? 1 : 0);
})();
