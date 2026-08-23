/* ============================================================================
   04-mapa.js — o mapa estilizado e os gestos
   O traçado é gerado por código (sem API de mapas, como pede a Fase 0), num
   estilo claro e dessaturado para o pin violeta saltar aos olhos.
   Os gestos seguem a cartilha da Apple: rastreio 1:1, entrega de velocidade na
   soltura, projeção do momento e resistência elástica na borda.
   ========================================================================= */
const Mapa = (() => {

  /* -------------------------------------------- gerador determinístico */
  // Mesma semente = mesmo mapa, sempre. Um mapa que muda a cada abertura
  // destrói a memória espacial de quem está testando.
  function semente(s) {
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Os rótulos de bairro do mapa desenhado saem dos PRÓPRIOS DADOS.

     Antes eram uma lista à parte, com coordenadas cravadas no plano. Quando as
     terapeutas ganharam coordenada real, a lista ficou apontando para o lugar
     errado — e como é só decoração, ninguém teria percebido. Derivar da fonte
     única resolve isso de uma vez: mudou a terapeuta de bairro, o rótulo segue. */
  function bairrosDoMapa() {
    const vistos = new Map();
    const por = (nome, lat, lng) => { if (nome && !vistos.has(nome)) vistos.set(nome, { nome, lat, lng }); };
    por(Dados.EU.bairro, Dados.EU.lat, Dados.EU.lng);
    Dados.TERAPEUTAS.forEach((t) => {
      // Em cidade da região metropolitana o nome útil é o da CIDADE, não o do
      // bairro: "Vila Betânia" não localiza ninguém; "Cachoeirinha", sim.
      const nome = t.cidade === Dados.EU.cidade ? t.bairro : t.cidade;
      por(nome, t.lat, t.lng);
    });
    return Array.from(vistos.values());
  }

  /* ------------------------------------------------------ desenho do mapa */
  // `sufixo` existe porque a mesma malha aparece em vários lugares ao mesmo
  // tempo (mapa grande + mini-mapas). Sem ele, dois <mask> teriam o mesmo id.
  function gerarSVG(sufixo = '') {
    const { largura: L, altura: A } = Dados.MUNDO;
    const r = semente(20260823);
    const p = [];
    const idMascara = 'terraFirme' + sufixo;

    p.push(`<svg class="mapa__svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}" aria-hidden="true">`);

    /* A água (o Guaíba a oeste, e um trecho de arroio a nordeste) */
    const margem = [];
    for (let y = -40; y <= A + 40; y += 120) {
      const x = 430 + Math.sin(y / 520) * 210 + Math.sin(y / 170) * 55 + r() * 40;
      margem.push(`${Math.round(x)},${y}`);
    }
    const guaiba = `M -60,-40 L ${margem.join(' L ')} L -60,${A + 40} Z`;

    const arroio = [];
    for (let t = 0; t <= 1.001; t += 0.05) {
      arroio.push(`${Math.round(2050 + t * 1400)},${Math.round(560 - Math.sin(t * 5.2) * 130 - t * 120)}`);
    }

    p.push(`<defs>
      <mask id="${idMascara}">
        <rect width="${L}" height="${A}" fill="#fff"/>
        <path d="${guaiba}" fill="#000"/>
        <polyline points="${arroio.join(' ')}" fill="none" stroke="#000" stroke-width="46" stroke-linecap="round"/>
      </mask>
    </defs>`);

    p.push(`<rect width="${L}" height="${A}" fill="var(--mapa-solo)"/>`);
    p.push(`<path d="${guaiba}" fill="var(--mapa-agua)"/>`);
    p.push(`<polyline points="${arroio.join(' ')}" fill="none" stroke="var(--mapa-agua)" stroke-width="42" stroke-linecap="round"/>`);

    /* Parques e praças */
    const parques = [
      { x: 1780, y: 2140, w: 300, h: 210 },   // Parcão
      { x: 1520, y: 2430, w: 380, h: 260 },   // Redenção-ish
      { x: 2260, y: 1520, w: 240, h: 180 },
      { x: 1420, y: 1180, w: 260, h: 300 },
      { x: 2640, y: 900, w: 320, h: 220 },
      { x: 2860, y: 2260, w: 280, h: 340 },
      { x: 1880, y: 620, w: 220, h: 190 },
    ];
    parques.forEach((q) => {
      p.push(`<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" rx="${34 + r() * 26}" fill="var(--mapa-parque)" mask="url(#${idMascara})"/>`);
    });

    /* Quadras — um leve contraste sobre o solo dá textura de cidade */
    let ruasV = [], ruasH = [];
    for (let x = 120; x < L; x += 62 + r() * 66) ruasV.push(Math.round(x));
    for (let y = 90; y < A; y += 58 + r() * 70) ruasH.push(Math.round(y));

    const quadras = [];
    for (let i = 0; i < ruasV.length - 1; i++) {
      for (let j = 0; j < ruasH.length - 1; j++) {
        if (r() > 0.44) continue;
        const x0 = ruasV[i] + 6, y0 = ruasH[j] + 6;
        const w = ruasV[i + 1] - ruasV[i] - 12, hh = ruasH[j + 1] - ruasH[j] - 12;
        if (w < 16 || hh < 16) continue;
        quadras.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${hh}" rx="3"/>`);
      }
    }
    p.push(`<g fill="var(--mapa-quadra)" mask="url(#${idMascara})">${quadras.join('')}</g>`);

    /* Malha viária: ruas finas, avenidas grossas, três diagonais */
    const ruas = [], vias = [];
    ruasV.forEach((x, i) => ((i % 5 === 2) ? vias : ruas).push(`M ${x} -30 L ${x} ${A + 30}`));
    ruasH.forEach((y, i) => ((i % 5 === 4) ? vias : ruas).push(`M -30 ${y} L ${L + 30} ${y}`));
    vias.push(`M 700 3400 L 1750 1700 L 1900 -40`);          // uma "Assis Brasil"
    vias.push(`M 520 2600 L 3400 1180`);                      // radial leste
    vias.push(`M 1180 -40 L 2500 1500 L 3400 2050`);          // radial nordeste

    p.push(`<g mask="url(#${idMascara})" fill="none" stroke-linecap="round">`);
    p.push(`<g stroke="var(--mapa-rua)" stroke-width="7">${ruas.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    p.push(`<g stroke="var(--mapa-via)" stroke-width="15">${vias.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    p.push(`</g>`);

    /* Duas pontes cruzando a água, para o traçado não parecer cortado */
    p.push(`<g stroke="var(--mapa-via)" stroke-width="13" stroke-linecap="round">
      <path d="M 250 2180 L 760 2140"/>
      <path d="M 180 1180 L 700 1230"/>
    </g>`);

    p.push(`</svg>`);
    return p.join('');
  }

  function rotulos() {
    return bairrosDoMapa().map((b) => {
      const p = Dados.paraPlano(b.lat, b.lng);
      return `<span class="mapa__rotulo" style="left:${Math.round(p.x)}px;top:${Math.round(p.y) - 34}px">${b.nome}</span>`;
    }).join('');
  }

  /* ------------------------------------------------------------ gestos */
  // 120 px = 1 km. Em z=1 a tela mostraria 3,2 km — perto demais para um mapa
  // cuja graça é ver QUEM ESTÁ NA REGIÃO. Em z=0,45 a tela cobre ~7 km, que é
  // a distância que alguém aceita percorrer para uma sessão.
  const ZOOM_MIN = 0.28, ZOOM_MAX = 2.0, ZOOM_INICIAL = 0.45;

  /* Níveis semânticos, os mesmos nomes do mapa real. O app fala em "região" e
     "pessoa"; cada motor traduz para a sua escala — aqui 0,28–2,0, lá 0–22. */
  const NIVEL = { regiao: 0.45, pessoa: 0.62 };

  function montar(el, op = {}) {
    const mundo = el.querySelector('.mapa__mundo');
    const { largura: L, altura: A } = Dados.MUNDO;

    // Estado da câmera. tx/ty são a translação em pixels de tela; z, a escala.
    let z = op.zoom ?? 1;
    let tx = 0, ty = 0;
    // Área realmente visível: o que sobra entre a busca/chips em cima e a
    // folha embaixo. Centralizar na tela inteira joga o pino atrás dos chips.
    let offsetBaixo = op.offsetBaixo || 0;
    let offsetTopo = op.offsetTopo || 0;

    const molaX = new Fisica.Mola({ amortecimento: 1, resposta: 0.45, aoAtualizar: (v) => { tx = v; pintar(); } });
    const molaY = new Fisica.Mola({ amortecimento: 1, resposta: 0.45, aoAtualizar: (v) => { ty = v; pintar(); } });
    const molaZ = new Fisica.Mola({ amortecimento: 1, resposta: 0.4, valor: z, aoAtualizar: (v) => { z = v; pintar(); } });

    function tela() { return { w: el.clientWidth, h: el.clientHeight }; }

    // Até onde a câmera pode ir sem descolar o mundo da tela
    function limites(zz = z) {
      const { w, h } = tela();
      return {
        minX: Math.min(0, w - L * zz), maxX: 0,
        minY: Math.min(0, h - A * zz), maxY: 0,
      };
    }

    function pintar() {
      mundo.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;
      mundo.style.setProperty('--z', z);
      if (op.aoMover) op.aoMover();
    }

    /* Onde, na tela, está um ponto do mundo? Serve para o card apontar o pin. */
    function paraTela(x, y) { return { x: x * z + tx, y: y * z + ty }; }

    /* Coloca um ponto do PLANO no centro da área visível (descontando a folha) */
    function centralizarPlano(x, y, zAlvo = z, animado = true) {
      const { w, h } = tela();
      const zz = Fisica.limitar(zAlvo, ZOOM_MIN, ZOOM_MAX);
      const alvoX = w / 2 - x * zz;
      const alvoY = offsetTopo + (h - offsetTopo - offsetBaixo) / 2 - y * zz;
      const lim = limites(zz);
      const fx = Fisica.limitar(alvoX, lim.minX, lim.maxX);
      const fy = Fisica.limitar(alvoY, lim.minY, lim.maxY);

      if (!animado || Fisica.menosMovimento()) {
        molaX.fixa(fx); molaY.fixa(fy); molaZ.fixa(zz); pintar();
        return;
      }
      molaX.para(fx); molaY.para(fy); molaZ.para(zz);
    }

    /* A interface que o app usa é a MESMA do mapa real: coordenada de verdade e
       nível com nome. Quem converte para o plano é este motor, aqui dentro. */
    function centralizar(lat, lng, nivel = 'regiao', animado = true) {
      const p = Dados.paraPlano(lat, lng);
      centralizarPlano(p.x, p.y, Math.max(z, NIVEL[nivel] || NIVEL.regiao), animado);
    }

    /* Os pinos do mapa desenhado vivem dentro do mundo; refazer o bloco inteiro
       é barato porque são 12 elementos, e mantém filtro e horário em dia. */
    function atualizarPins() {
      const caixa = el.querySelector('#pins');
      if (caixa) caixa.innerHTML = Telas.pinsHTML();
    }

    function selecionar(id) {
      el.querySelectorAll('.pin').forEach((p) => { p.dataset.sel = (p.dataset.id === id ? '1' : '0'); });
    }

    function definirOffsetBaixo(v) { offsetBaixo = v; }
    function definirOffsetTopo(v) { offsetTopo = v; }

    /* ------------------------------------------------- rastreio do toque */
    const dedos = new Map();
    const rastro = new Fisica.Rastreador(90);
    let arrastando = false, movimentou = false;
    let iniX = 0, iniY = 0, baseTx = 0, baseTy = 0;
    let pinca = null;
    let ultimoToque = { t: 0, x: 0, y: 0 };
    // Com o ponteiro capturado, TODOS os eventos seguintes (inclusive o
    // pointerup) chegam com target = elemento que capturou. Guardar quem foi
    // tocado no pointerdown é a única forma de saber se o dedo caiu num pino.
    let alvoInicial = null;

    function pontoMedio() {
      const ps = Array.from(dedos.values());
      if (ps.length === 1) return { x: ps[0].x, y: ps[0].y, d: 0 };
      const dx = ps[1].x - ps[0].x, dy = ps[1].y - ps[0].y;
      return { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2, d: Math.hypot(dx, dy) };
    }

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      el.setPointerCapture(e.pointerId);
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (dedos.size === 1) alvoInicial = e.target;

      // Interromper no meio do voo: a câmera passa a obedecer o dedo a partir
      // do valor que está NA TELA — não do alvo. Sem isso há um salto visível.
      molaX.congela(); molaY.congela(); molaZ.congela();

      if (dedos.size === 1) {
        arrastando = true; movimentou = false;
        iniX = e.clientX; iniY = e.clientY;
        baseTx = tx; baseTy = ty;
        rastro.limpar(); rastro.anota(tx, ty);
        el.classList.add('arrastando');
      } else if (dedos.size === 2) {
        const m = pontoMedio();
        pinca = { d0: m.d, z0: z, x0: m.x, y0: m.y, tx0: tx, ty0: ty };
        movimentou = true;
      }
    });

    el.addEventListener('pointermove', (e) => {
      if (!dedos.has(e.pointerId)) return;
      dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (dedos.size >= 2 && pinca) {
        const m = pontoMedio();
        if (pinca.d0 > 0) {
          const bruto = pinca.z0 * (m.d / pinca.d0);
          const zz = Fisica.limitar(bruto, ZOOM_MIN * 0.8, ZOOM_MAX * 1.15);
          const cx = el.getBoundingClientRect().left;
          const cy = el.getBoundingClientRect().top;
          // Mantém sob os dedos o mesmo ponto do mundo que estava lá no início
          const mundoX = (pinca.x0 - cx - pinca.tx0) / pinca.z0;
          const mundoY = (pinca.y0 - cy - pinca.ty0) / pinca.z0;
          z = zz;
          tx = (m.x - cx) - mundoX * zz;
          ty = (m.y - cy) - mundoY * zz;
          amaciarBordas();
          pintar();
        }
        return;
      }

      if (!arrastando) return;
      const dx = e.clientX - iniX, dy = e.clientY - iniY;
      // Histerese: só vira arraste depois de ~8px, senão todo toque some
      if (!movimentou && Math.hypot(dx, dy) < 8) return;
      movimentou = true;

      tx = baseTx + dx;
      ty = baseTy + dy;
      amaciarBordas();
      rastro.anota(tx, ty);
      pintar();
    });

    /* Fora do limite, o mundo continua seguindo o dedo — só que cada vez
       menos. Parar seco leria como travamento. */
    function amaciarBordas() {
      const lim = limites();
      const { w, h } = tela();
      tx = Fisica.limitarElastico(tx, lim.minX, lim.maxX, w);
      ty = Fisica.limitarElastico(ty, lim.minY, lim.maxY, h);
    }

    function soltar(e) {
      if (!dedos.has(e.pointerId)) return;
      dedos.delete(e.pointerId);

      if (dedos.size === 1 && pinca) {
        // Saiu um dedo da pinça: reancora o arraste no que sobrou, sem pulo
        const ps = Array.from(dedos.values())[0];
        pinca = null;
        arrastando = true; movimentou = true;
        iniX = ps.x; iniY = ps.y; baseTx = tx; baseTy = ty;
        rastro.limpar(); rastro.anota(tx, ty);
        return;
      }
      if (dedos.size > 0) return;

      el.classList.remove('arrastando');
      pinca = null;

      if (!movimentou && arrastando) {
        arrastando = false;
        tratarToque(e);
        return;
      }
      arrastando = false;
      assentar();
    }

    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);

    /* Soltou: a câmera continua na velocidade exata do dedo, projeta onde iria
       parar e assenta lá. É a costura entre arrastar e animar. */
    function assentar() {
      const v = rastro.velocidade();
      const lim = limites();
      const destinoX = Fisica.limitar(tx + Fisica.projetar(v.x, 0.994), lim.minX, lim.maxX);
      const destinoY = Fisica.limitar(ty + Fisica.projetar(v.y, 0.994), lim.minY, lim.maxY);
      const zz = Fisica.limitar(z, ZOOM_MIN, ZOOM_MAX);

      const foraDoLimite = tx < lim.minX || tx > lim.maxX || ty < lim.minY || ty > lim.maxY;
      const cfg = foraDoLimite
        ? { amortecimento: 1, resposta: 0.36 }              // volta seca, sem repique
        : { amortecimento: 0.86, resposta: 0.55 };          // arremesso: leve inércia

      molaX.para(destinoX, { velocidade: v.x, ...cfg });
      molaY.para(destinoY, { velocidade: v.y, ...cfg });
      if (zz !== z) molaZ.para(zz, { amortecimento: 1, resposta: 0.3 });
    }

    function tratarToque(e) {
      const agora = performance.now();
      const perto = Math.hypot(e.clientX - ultimoToque.x, e.clientY - ultimoToque.y) < 34;
      const rapido = agora - ultimoToque.t < 300;
      ultimoToque = { t: agora, x: e.clientX, y: e.clientY };

      if (perto && rapido) { ampliarNoPonto(e.clientX, e.clientY, 1.7); return; }

      const pin = alvoInicial && alvoInicial.closest ? alvoInicial.closest('.pin') : null;
      if (pin && op.aoTocarPin) { op.aoTocarPin(pin.dataset.id); return; }
      if (op.aoTocarFundo) op.aoTocarFundo();
    }

    function ampliarNoPonto(clienteX, clienteY, fator) {
      const cx = el.getBoundingClientRect().left, cy = el.getBoundingClientRect().top;
      const px = clienteX - cx, py = clienteY - cy;
      const zz = Fisica.limitar(z * fator, ZOOM_MIN, ZOOM_MAX);
      const mundoX = (px - tx) / z, mundoY = (py - ty) / z;
      const lim = limites(zz);
      molaX.para(Fisica.limitar(px - mundoX * zz, lim.minX, lim.maxX), { amortecimento: 1, resposta: 0.42 });
      molaY.para(Fisica.limitar(py - mundoY * zz, lim.minY, lim.maxY), { amortecimento: 1, resposta: 0.42 });
      molaZ.para(zz, { amortecimento: 1, resposta: 0.42 });
    }

    /* Roda do mouse — no desktop é o gesto natural de zoom */
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      molaX.congela(); molaY.congela(); molaZ.congela();
      const cx = el.getBoundingClientRect().left, cy = el.getBoundingClientRect().top;
      const px = e.clientX - cx, py = e.clientY - cy;
      const zz = Fisica.limitar(z * Math.exp(-e.deltaY * 0.0016), ZOOM_MIN, ZOOM_MAX);
      const mundoX = (px - tx) / z, mundoY = (py - ty) / z;
      z = zz;
      tx = px - mundoX * zz; ty = py - mundoY * zz;
      const lim = limites();
      tx = Fisica.limitar(tx, lim.minX, lim.maxX);
      ty = Fisica.limitar(ty, lim.minY, lim.maxY);
      pintar();
    }, { passive: false });

    function ajustarZoom(fator) {
      const { w, h } = tela();
      ampliarNoPonto(el.getBoundingClientRect().left + w / 2, el.getBoundingClientRect().top + offsetTopo + (h - offsetTopo - offsetBaixo) / 2, fator);
    }

    return { motor: 'desenhado', centralizar, centralizarPlano, paraTela, atualizarPins, selecionar,
             definirOffsetBaixo, definirOffsetTopo, ajustarZoom, pintar, destruir() {},
             get zoom() { return z; } };
  }

  return { gerarSVG, rotulos, montar, bairrosDoMapa, ZOOM_INICIAL, NIVEL };
})();
