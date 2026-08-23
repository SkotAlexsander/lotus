/* ============================================================================
   04b-mapa-real.js — o mapa de ruas de verdade (MapLibre + OpenFreeMap)

   POR QUE EXISTEM DOIS MAPAS
   --------------------------
   O `04-mapa.js` desenha um traçado urbano por código: funciona offline, não
   depende de ninguém e foi o que permitiu a Fase 0 existir. Mas ele não mostra
   a RUA da pessoa — e é exatamente isso que faz uma terapeuta olhar a tela e
   dizer "esse é o meu quarteirão".

   Este arquivo é o mapa real. Os dois têm a MESMA FORMA (`montar()` devolve o
   mesmo conjunto de funções), então o `06-app.js` usa um ou outro sem saber
   qual. Se o MapLibre não carregar — sem internet, CDN fora do ar, navegador
   antigo — o app cai no mapa desenhado e continua inteiro.

   POR QUE OpenFreeMap, E NÃO OS TILES DO PRÓPRIO OSM
   --------------------------------------------------
   A política de uso do openstreetmap.org proíbe consumo em escala de aplicação:
   os servidores deles vivem de doação e são para o mapa deles, não para o nosso.
   O OpenFreeMap serve os mesmos dados sem chave, sem cadastro e sem limite.

   ⚠️ A ATRIBUIÇÃO É OBRIGAÇÃO, NÃO ENFEITE — e é o crédito ao OpenStreetMap
   que aparece recolhido no (i) do canto. Ele vem do TileJSON que o estilo
   carrega; não se apaga nem se some com ele.
   ========================================================================= */
const MapaReal = (() => {

  // `positron` é o estilo claro e dessaturado — é o que o arquivo 05 do briefing
  // pede: "mapa em tom claro e dessaturado, para os pins violeta saltarem".
  const ESTILO = 'https://tiles.openfreemap.org/styles/positron';

  /* ⚠️ O crédito NÃO é escrito aqui, e isso foi corrigido depois de ver a tela:
     o JSON do estilo vem com `attribution` nulo, mas o TileJSON que ele carrega
     em seguida TRAZ o crédito — e o MapLibre o mostra sozinho. Escrever o meu
     por cima resultava em "OpenFreeMap · OpenStreetMap | OpenFreeMap ©
     OpenMapTiles from OpenStreetMap", duas vezes a mesma coisa, ocupando meia
     tela de celular.

     Ler o JSON do estilo não bastava para saber disso. Foi preciso olhar. */

  /* Níveis semânticos, não números soltos. O mapa desenhado e o real usam
     escalas completamente diferentes (0,28–2,4 contra 0–22); o app fala em
     "região" e "pessoa" e cada motor traduz para a sua. */
  const NIVEL = { regiao: 12.1, pessoa: 14.6 };

  const disponivel = () => typeof maplibregl !== 'undefined';

  function montar(el, op = {}) {
    let offsetTopo = op.offsetTopo || 0;
    let offsetBaixo = op.offsetBaixo || 0;

    const mapa = new maplibregl.Map({
      container: el,
      style: ESTILO,
      center: [Dados.EU.lng, Dados.EU.lat],
      zoom: NIVEL.regiao,
      attributionControl: false,       // a nossa entra abaixo, com o crédito certo
      dragRotate: false,               // girar o mapa desorienta e não serve a nada aqui
      pitchWithRotate: false,
      touchPitch: false,
      maxZoom: 18,
      minZoom: 9,
    });

    mapa.touchZoomRotate.disableRotation();
    // `compact` deixa o crédito recolhido num (i) — ele continua a um toque de
    // distância, como a licença exige, sem comer a tela.
    mapa.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    /* ------------------------------------------------------------- pinos */
    const marcadores = new Map();   // id -> maplibregl.Marker

    function criarPino(t) {
      const caixa = document.createElement('div');
      caixa.innerHTML = Telas.pinoHTML(t);
      const el2 = caixa.firstElementChild;
      // O pino do mapa real não contra-escala: o MapLibre já mantém o marcador
      // do mesmo tamanho em qualquer zoom.
      el2.style.setProperty('--z', '1');
      el2.style.position = 'relative';
      el2.style.margin = '0';
      el2.addEventListener('click', (e) => {
        e.stopPropagation();           // senão o toque também conta como "fundo"
        if (op.aoTocarPin) op.aoTocarPin(t.id);
      });
      return el2;
    }

    function montarPinos() {
      Dados.TERAPEUTAS.filter((t) => t.ativa).forEach((t) => {
        const el2 = criarPino(t);
        const m = new maplibregl.Marker({ element: el2, anchor: 'bottom' })
          .setLngLat([t.lng, t.lat])
          .addTo(mapa);
        marcadores.set(t.id, { marcador: m, el: el2 });
      });

      // "você está aqui"
      const eu = document.createElement('div');
      eu.className = 'eu';
      eu.style.setProperty('--z', '1');
      eu.style.position = 'relative';
      eu.style.margin = '0';
      eu.innerHTML = '<div class="eu__halo"></div><div class="eu__nucleo"></div>';
      new maplibregl.Marker({ element: eu, anchor: 'center' })
        .setLngLat([Dados.EU.lng, Dados.EU.lat])
        .addTo(mapa);
    }

    /* O filtro não destrói e recria marcador: só apaga o que saiu da busca.
       Recriar faria os 12 pinos piscarem a cada tecla digitada na busca. */
    function atualizarPins() {
      const visiveis = new Set(Dados.listar().map((t) => t.id));
      for (const [id, m] of marcadores) {
        const dentro = visiveis.has(id);
        m.el.style.opacity = dentro ? '' : '0.22';
        m.el.style.pointerEvents = dentro ? '' : 'none';
        const t = Dados.porId(id);
        m.el.classList.toggle('pin--fechada', !Dados.estaAberta(t));
      }
    }

    function selecionar(id) {
      for (const [outro, m] of marcadores) m.el.dataset.sel = (outro === id ? '1' : '0');
    }

    /* ---------------------------------------------------------- câmera */
    function centralizar(lat, lng, nivel = 'regiao', animado = true) {
      const opcoes = {
        center: [lng, lat],
        zoom: Math.max(mapa.getZoom(), NIVEL[nivel] || NIVEL.regiao),
        // O `padding` é o que impede o pino de parar embaixo da folha ou atrás
        // dos chips: o MapLibre centraliza na área ÚTIL, não na tela inteira.
        padding: { top: offsetTopo, bottom: offsetBaixo, left: 0, right: 0 },
      };
      if (!animado || Fisica.menosMovimento()) mapa.jumpTo(opcoes);
      else mapa.easeTo({ ...opcoes, duration: 650, easing: (t) => 1 - Math.pow(1 - t, 3) });
    }

    mapa.on('click', () => { if (op.aoTocarFundo) op.aoTocarFundo(); });
    mapa.on('load', () => { montarPinos(); atualizarPins(); if (op.aoCarregar) op.aoCarregar(); });

    // ⚠️ O contêiner nasce com tamanho zero enquanto a aba está sendo montada.
    // Sem este `resize` o mapa fica um quadrado cinza e nada acusa o motivo.
    setTimeout(() => mapa.resize(), 60);

    return {
      motor: 'real',
      centralizar,
      atualizarPins,
      selecionar,
      definirOffsetBaixo: (v) => { offsetBaixo = v; },
      definirOffsetTopo: (v) => { offsetTopo = v; },
      ajustarZoom: (fator) => mapa.easeTo({ zoom: mapa.getZoom() + (fator > 1 ? 1 : -1) }),
      destruir: () => { try { mapa.remove(); } catch (_) {} },
      get zoom() { return mapa.getZoom(); },
      get bruto() { return mapa; },
    };
  }

  /* ------------------------------------------------- mini-mapa (perfil) */
  /* Um quadro pequeno, sem controle e sem interação, mostrando onde a pessoa
     atende. Se `arrastavel`, vira o passo do endereço do assistente: aí ela
     move o mapa e o pino do centro marca o ponto. */
  function montarMini(el, lat, lng, op = {}) {
    const mapa = new maplibregl.Map({
      container: el,
      style: ESTILO,
      center: [lng, lat],
      zoom: op.arrastavel ? 15 : 15.5,
      attributionControl: false,
      interactive: !!op.arrastavel,
      dragRotate: false,
    });
    mapa.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    if (!op.arrastavel) {
      const pino = document.createElement('div');
      pino.innerHTML = Telas.pinoSimplesHTML();
      new maplibregl.Marker({ element: pino.firstElementChild, anchor: 'bottom' })
        .setLngLat([lng, lat]).addTo(mapa);
    } else if (op.aoMover) {
      // No modo arrastável o pino fica FIXO no centro da moldura (desenhado por
      // cima pelo HTML) e quem se move é o mapa — é assim que todo aplicativo
      // faz, porque acertar um alvo parado é mais fácil que arrastar um alvo.
      mapa.on('moveend', () => { const c = mapa.getCenter(); op.aoMover(c.lat, c.lng); });
    }

    setTimeout(() => mapa.resize(), 60);
    return mapa;
  }

  return { disponivel, montar, montarMini, ESTILO, NIVEL };
})();
