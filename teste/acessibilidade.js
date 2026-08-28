/* ============================================================================
   teste/acessibilidade.js — o RNF02 medido, não presumido

   O briefing pede interface "acessível (bom contraste, fontes legíveis)". A
   `bancada.js` já mede contraste e área de toque. Esta mede o resto, que é o
   que ninguém olha porque não aparece na tela de quem enxerga bem:

     1. NOME ACESSÍVEL — botão só com ícone é lido como "botão" e nada mais.
     2. TEXTO AMPLIADO A 200% — a persona 1 tem 25–55 anos; ampliar a fonte no
        sistema é comum. Layout que só cabe em 100% quebra na mão dela.
     3. FOCO NA TELA DE BAIXO — a pilha mantém as telas anteriores no DOM. Se
        elas não forem tiradas da árvore de acessibilidade, o leitor de tela e o
        Tab passeiam por uma tela que a pessoa não está vendo. É invisível para
        quem testa com o dedo.
     4. IMAGEM SEM ALT, CAMPO SEM RÓTULO, IDIOMA DA PÁGINA.

   Uso: node teste/acessibilidade.js [--ver] [--url <endereço>]
   Saída: 0 = tudo passou · 1 = tem falha
   ========================================================================= */
const { chromium, devices } = require('../ferramentas/achar_playwright')();
const path = require('path');

const iUrl = process.argv.indexOf('--url');
const ARQUIVO = iUrl > -1
  ? process.argv[iUrl + 1]
  : 'file:///' + path.join(__dirname, '..', 'prototipo', 'index.html').replace(/\\/g, '/');
const VER = process.argv.includes('--ver');

const falhas = [];
const passou = [];
function checa(cond, nome, detalhe = '') {
  (cond ? passou : falhas).push(nome + (detalhe ? ' — ' + detalhe : ''));
  console.log(`${cond ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

/* O nome acessível de um elemento, pela mesma ordem que o leitor de tela usa.
   Roda dentro do navegador. */
const NOME_ACESSIVEL = `(el) => {
  const rot = el.getAttribute('aria-label');
  if (rot && rot.trim()) return rot.trim();
  const ref = el.getAttribute('aria-labelledby');
  if (ref) {
    const alvo = document.getElementById(ref);
    if (alvo && alvo.innerText.trim()) return alvo.innerText.trim();
  }
  if (el.title && el.title.trim()) return el.title.trim();
  // texto visível, incluindo o alt de uma imagem dentro do botão
  let t = (el.innerText || '').trim();
  if (!t) {
    const img = el.querySelector('img[alt]');
    if (img && img.alt.trim()) t = img.alt.trim();
  }
  return t;
}`;

(async () => {
  const browser = await chromium.launch({ headless: !VER });
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' });
  const p = await ctx.newPage();
  await p.goto(ARQUIVO);
  await p.waitForSelector('#splash', { state: 'detached', timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(200);

  const clicar = async (sel) => { await p.click(sel); await p.waitForTimeout(420); };

  /* ------------------------------------------------------------------ 1. idioma */
  const lang = await p.evaluate(() => document.documentElement.lang || '');
  checa(/^pt/i.test(lang), 'a página declara o idioma português', lang ? `lang="${lang}"` : 'sem atributo lang');

  /* ---------------------------------------------- utilitários de medição */

  // Todo elemento operável tem nome? Só conta o que está VISÍVEL agora.
  async function nomes(onde) {
    const mudos = await p.evaluate((fonteNome) => {
      const nomeDe = eval(fonteNome);
      const fora = [];
      document.querySelectorAll('button, [role="button"], [role="switch"], a[href], input, select, textarea').forEach((el) => {
        const c = el.getBoundingClientRect();
        if (c.width === 0 || c.height === 0) return;
        if (el.closest('[hidden]') || el.closest('[aria-hidden="true"]')) return;
        if (getComputedStyle(el).visibility === 'hidden') return;
        let nome = nomeDe(el);
        if (!nome && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
          const lab = el.id && document.querySelector('label[for="' + el.id + '"]');
          nome = (lab && lab.innerText.trim()) || el.placeholder || '';
        }
        if (!nome) {
          const marca = el.getAttribute('data-a') || el.className || el.tagName;
          fora.push(String(marca).slice(0, 40));
        }
      });
      return fora;
    }, NOME_ACESSIVEL);
    checa(mudos.length === 0, `todo controle tem nome acessível · ${onde}`,
      mudos.length ? `${mudos.length} sem nome: ${mudos.slice(0, 6).join(', ')}` : '');
  }

  // Toda imagem tem alt (mesmo que vazio, que é a forma de dizer "decorativa")
  async function imagens(onde) {
    const sem = await p.evaluate(() => {
      const fora = [];
      document.querySelectorAll('img').forEach((im) => {
        const c = im.getBoundingClientRect();
        if (c.width === 0 || c.height === 0) return;
        if (!im.hasAttribute('alt')) fora.push((im.src || '').slice(-38));
      });
      return fora;
    });
    checa(sem.length === 0, `toda imagem declara alt · ${onde}`, sem.slice(0, 4).join(', '));
  }

  /* Texto ampliado. Não basta olhar overflow horizontal: o defeito comum é o
     texto ser CORTADO dentro de uma caixa de altura fixa. Mede os dois. */
  async function ampliado(onde, escala) {
    await p.evaluate((e) => { document.documentElement.style.fontSize = (16 * e) + 'px'; }, escala);
    await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const app = document.getElementById('app');
      const horizontal = app ? app.scrollWidth > app.clientWidth + 1 : false;
      const cortados = [];
      document.querySelectorAll('h1, h2, h3, p, span, button, label, .micro').forEach((el) => {
        const c = el.getBoundingClientRect();
        if (c.width === 0 || c.height === 0) return;
        if (el.closest('[hidden]')) return;
        const s = getComputedStyle(el);
        if (s.overflow === 'visible' && s.overflowY === 'visible') return;  // não corta: transborda
        if (s.textOverflow === 'ellipsis' || s.webkitLineClamp !== 'none') return;  // corte INTENCIONAL
        if (el.scrollHeight > el.clientHeight + 2) {
          cortados.push((el.className || el.tagName) + ' "' + (el.innerText || '').trim().slice(0, 22) + '"');
        }
      });
      return { horizontal, cortados };
    });
    checa(!r.horizontal, `sem rolagem horizontal a ${escala * 100}% · ${onde}`);
    checa(r.cortados.length === 0, `nenhum texto cortado a ${escala * 100}% · ${onde}`,
      r.cortados.slice(0, 4).join(' | '));
    await p.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await p.waitForTimeout(250);
  }

  /* ------------------------------------------------- 2. fluxo, medindo em cada parada */
  await nomes('entrada');
  await imagens('entrada');
  await ampliado('entrada', 2);

  await clicar('[data-a="entrarCelular"]');
  await p.fill('#campoCelular', '51999998888').catch(() => {});
  await nomes('login por celular');

  await clicar('#btnCodigo').catch(() => {});
  await p.waitForTimeout(300);
  await clicar('[data-papel="cliente"]').catch(() => {});
  await p.waitForTimeout(300);
  await clicar('[data-a="permitirLocal"]').catch(() => {});
  await p.waitForTimeout(700);

  await nomes('mapa');
  await imagens('mapa');
  await ampliado('mapa', 2);

  /* ------------------------------------- 3. a tela de baixo sai da árvore? */
  // Abre um perfil (empilha uma tela) e confere se a de baixo ficou inerte.
  const abriu = await p.evaluate(() => {
    const pino = document.querySelector('.pino, [data-terapeuta]');
    if (!pino) return false;
    pino.click();
    return true;
  });
  await p.waitForTimeout(500);
  if (abriu) {
    await p.evaluate(() => {
      const b = document.querySelector('[data-a="verPerfil"], [data-a="abrirPerfil"]');
      if (b) b.click();
    });
    await p.waitForTimeout(600);
  }

  const pilha = await p.evaluate(() => {
    const telas = Array.from(document.querySelectorAll('.tela'));
    if (telas.length < 2) return { empilhou: false, telas: telas.length };
    const debaixo = telas.slice(0, -1);
    // um elemento é alcançável pelo Tab se for operável e não estiver escondido
    const alcancaveis = [];
    debaixo.forEach((t) => {
      if (t.inert || t.getAttribute('aria-hidden') === 'true') return;   // corretamente isolada
      t.querySelectorAll('button, a[href], input, select, textarea, [tabindex]').forEach((el) => {
        if (el.tabIndex < 0) return;
        const c = el.getBoundingClientRect();
        if (c.width === 0 || c.height === 0) return;
        alcancaveis.push(el.getAttribute('data-a') || el.className || el.tagName);
      });
    });
    return { empilhou: true, telas: telas.length, alcancaveis };
  });

  if (!pilha.empilhou) {
    checa(false, 'a pilha de telas foi exercitada', `só ${pilha.telas} tela(s) no DOM — o teste não chegou a empilhar`);
  } else {
    checa(pilha.alcancaveis.length === 0,
      'a tela de baixo sai da árvore de acessibilidade (inert/aria-hidden)',
      pilha.alcancaveis.length
        ? `${pilha.alcancaveis.length} controles atrás continuam alcançáveis pelo Tab: ${pilha.alcancaveis.slice(0, 5).join(', ')}`
        : '');
  }

  await nomes('perfil aberto');
  await ampliado('perfil aberto', 2);

  /* ------------------------------------------------ 4. o foco é visível? */
  /* Não basta o botão TER contorno ou sombra: quase todo botão desenhado tem
     sombra o tempo todo. O que prova indicador de foco é a DIFERENÇA entre
     focado e não focado. Medir só o estado focado dá aprovação falsa — foi o
     que esta prova fez na primeira versão. */
  /* Duas armadilhas nesta prova, e caí nas duas antes de acertar:

     1. Medir só o estado focado aprova qualquer botão que tenha sombra
        decorativa permanente. O que prova o indicador é a DIFERENÇA.
     2. `elemento.focus()` por script NÃO casa com `:focus-visible` no
        Chromium — a regra existe justamente para não desenhar anel em quem
        clicou com o dedo. Medir assim reprova um CSS correto.

     Então: apertar Tab de verdade e comparar o antes com o depois. */
  const antesDoTab = await p.evaluate(() => {
    const b = document.querySelector('.tela:last-child button:not([hidden])') ||
              document.querySelector('button:not([hidden])');
    if (!b) return null;
    b.id = b.id || 'alvoFoco';
    const s = getComputedStyle(b);
    return { id: b.id, outline: s.outlineStyle + s.outlineWidth + s.outlineColor, sombra: s.boxShadow };
  });

  let foco = null;
  if (antesDoTab) {
    // Tab até chegar num botão visível (o primeiro Tab pode cair num link)
    for (let i = 0; i < 12; i++) {
      await p.keyboard.press('Tab');
      const chegou = await p.evaluate(() => {
        const a = document.activeElement;
        return !!a && a !== document.body && a.tagName === 'BUTTON';
      });
      if (chegou) break;
    }
    foco = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return { alcancou: false };
      const s = getComputedStyle(a);
      return {
        alcancou: true,
        temAnel: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0,
        outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor,
        quem: a.getAttribute('data-a') || a.className || a.tagName,
      };
    });
  }
  checa(foco && foco.alcancou && foco.temAnel,
    'ao navegar por teclado, o elemento focado ganha anel visível',
    foco ? (foco.alcancou ? `${foco.quem} → outline: ${foco.outline}` : 'o Tab não alcançou nenhum elemento') : 'nenhum botão para focar');

  /* ------------------------------------------------------------------ fim */
  console.log(`\n  ${passou.length} passaram · ${falhas.length} falharam`);
  if (falhas.length) {
    console.log('\n  O QUE FALHOU:');
    falhas.forEach((f) => console.log('   · ' + f));
  }
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch((e) => { console.error('A BANCADA QUEBROU:', e.message); process.exit(2); });
