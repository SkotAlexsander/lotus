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
      /* ⚠️ ABSOLUTE, nunca relative: o translate do MapLibre parte da POSIÇÃO
         BASE do elemento. `relative` deixa o marcador no FLUXO do contêiner —
         cada um empurrado pelo anterior — e o desvio soma: o 1º pino caía
         certo por sorte, o 2º ficava 46px à direita, o 3º 92px, e o ponto
         azul 122px abaixo. Constante em px de TELA: ao dar zoom, a rua
         embaixo do marcador trocava. Medido pino a pino contra project(). */
      el2.style.position = 'absolute';
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
      eu.style.position = 'absolute';   // mesma regra dos pinos: base na origem
      eu.style.margin = '0';
      eu.innerHTML = '<div class="eu__halo"></div><div class="eu__nucleo"></div>';
      marcadorEu = new maplibregl.Marker({ element: eu, anchor: 'center' })
        .setLngLat([Dados.EU.lng, Dados.EU.lat])
        .addTo(mapa);

      /* O CÍRCULO DE PRECISÃO é medido, não decorativo.

         O GPS não devolve um ponto, devolve um ponto E um raio. Desenhar só o
         ponto afirma uma certeza que o aparelho não tem — e num app cuja
         pergunta é "quem está perto de mim", 30 m e 2 km mudam a resposta.

         O raio vem em METROS e o mapa desenha em PIXELS, e a conversão depende
         do zoom e da latitude:  px = m · 2^zoom / (156543,03 · cos(lat)).

         ⚠️ Escrever essa conta direto (`['*', raio, ['^', 2, ['zoom']]]`) o
         MapLibre RECUSA: "zoom" só pode ser a entrada de um `interpolate` ou
         `step` de topo. A forma aceita é um `interpolate` exponencial de base
         2 entre os zooms extremos — que dá exatamente 2^zoom, escrito do jeito
         que o motor entende. */
      mapa.addSource('precisao', { type: 'geojson', data: pontoPrecisao() });
      mapa.addLayer({
        id: 'precisao',
        type: 'circle',
        source: 'precisao',
        paint: {
          'circle-color': '#2C7BE5',
          'circle-opacity': 0.10,
          'circle-stroke-color': '#2C7BE5',
          'circle-stroke-opacity': 0.28,
          'circle-stroke-width': 1,
          'circle-radius': raioEmPixels(),
        },
      }, mapa.getStyle().layers[mapa.getStyle().layers.length - 1].id);
      atualizarPrecisao();
    }

    let marcadorEu = null;

    /* O raio, em pixels, para cada zoom.

       Como existe UM ponto só, a conta cabe em JavaScript e a camada recebe
       números puros — em vez de ler o raio de dentro do dado
       (`['get','porPixel']`). Menos expressão, menos superfície para errar.

       ⚠️ NOTA sobre um aviso do console que NÃO é nosso: aparece repetido um
       "Expected value to be of type number, but found null". Eu quase reescrevi
       esta camada por causa dele. `teste/sonda-estilo-puro.js` sobe o MapLibre
       com o estilo positron SEM UMA LINHA do projeto e o aviso aparece igual:
       ele vem do estilo do OpenFreeMap. Antes de consertar um aviso, descobrir
       de quem ele é — senão conserta-se o que não está quebrado. */
    function raioEmPixels() {
      const m = Dados.EU.precisao || 0;
      const metrosPorPixelNoZoom0 = 156543.03392 * Math.cos((Dados.EU.lat * Math.PI) / 180);
      const base = m > 0 ? m / metrosPorPixelNoZoom0 : 0;
      return ['interpolate', ['exponential', 2], ['zoom'],
              0, base, 22, base * 4194304];      // 2^22
    }

    function pontoPrecisao() {
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Dados.EU.lng, Dados.EU.lat] },
        properties: {},
      };
    }

    function atualizarPrecisao() {
      const f = mapa.getSource('precisao');
      if (!f) return;
      f.setData(pontoPrecisao());
      if (mapa.getLayer('precisao')) {
        mapa.setPaintProperty('precisao', 'circle-radius', raioEmPixels());
      }
    }

    /* Chamado quando o GPS reporta um passo novo. */
    function atualizarEu() {
      if (marcadorEu) marcadorEu.setLngLat([Dados.EU.lng, Dados.EU.lat]);
      atualizarPrecisao();
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
      atualizarEu,
      selecionar,
      definirOffsetBaixo: (v) => { offsetBaixo = v; },
      definirOffsetTopo: (v) => { offsetTopo = v; },
      ajustarZoom: (fator) => mapa.easeTo({ zoom: mapa.getZoom() + (fator > 1 ? 1 : -1) }),
      destruir: () => { try { mapa.remove(); } catch (_) {} },
      get zoom() { return mapa.getZoom(); },
      // Exposta para a BANCADA: é o que permite comparar o pixel do ponto azul
      // com a projeção matemática do lat/lng em cada zoom. O app não a usa.
      get instancia() { return mapa; },
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
      const pinoEl = pino.firstElementChild;
      pinoEl.style.position = 'absolute';   // única no contêiner: certa "por sorte" — blindada
      pinoEl.style.margin = '0';
      new maplibregl.Marker({ element: pinoEl, anchor: 'bottom' })
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
