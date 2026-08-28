/* ============================================================================
   06-app.js — roteador, estado e gestos da navegação
   Só lógica. O HTML vem do 05-telas.js, os dados do 03-dados.js e o movimento
   do 02-fisica.js.
   ========================================================================= */
const App = (() => {
  const E = Dados.estado;
  let app, pilhaEl, folha, mapaCtrl = null, bordaVoltar;

  /* A pilha de telas. O primeiro item é a raiz (mapa ou perfil da terapeuta). */
  const pilha = [];
  let transicao = null;

  /* ====================================================== construção */
  function construir(nome, p = {}) {
    switch (nome) {
      case 'entrar':      return Telas.entrar();
      case 'telefone':    return Telas.telefone();
      case 'codigo':      return Telas.codigo();
      case 'papel':       return Telas.papel();
      case 'localizacao': return Telas.localizacao();
      case 'cidades':     return Telas.cidades(p.motivo);
      case 'raiz':        return Telas.raizCliente();
      case 'raizT':       return Telas.raizTerapeuta();
      case 'perfil':      return Telas.perfil(Dados.porId(p.id));
      case 'avaliar':     return Telas.avaliar(Dados.porId(p.id));
      case 'assistente':  return Telas.assistente();
      case 'denunciar':   return Telas.denunciar(p.alvo);
      case 'responder':   return Telas.responder(p.i);
      default:            return '<div class="tela"></div>';
    }
  }

  function elementoDe(html) {
    const d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }

  /* ================================================ pilha de navegação */
  function largura() { return app.clientWidth; }

  function abrir(nome, params = {}) {
    const el = elementoDe(construir(nome, params));
    const veu = document.createElement('div');
    veu.className = 'tela__veu';

    const anterior = pilha[pilha.length - 1];
    el.style.transform = `translate3d(${largura()}px,0,0)`;
    el.classList.add('tela--empilhada');
    pilhaEl.appendChild(el);
    if (anterior) anterior.el.appendChild(veu);

    const item = { nome, params, el, veu: anterior ? veu : null, anterior };
    pilha.push(item);
    aoMudarPilha();
    depoisDeMontar(nome, params, el);

    animarPara(1, { velocidade: 0 });
    return item;
  }

  function voltar() {
    if (pilha.length <= 1) return;
    animarPara(0, { velocidade: 0 });
  }

  /* Aplica o progresso da transição: 0 = tela de cima fora, 1 = no lugar.
     A tela de baixo recua um pouco e escurece — a hierarquia fica óbvia. */
  function aplicarProgresso(p) {
    const item = pilha[pilha.length - 1];
    if (!item) return;
    const W = largura();
    item.el.style.transform = `translate3d(${(1 - p) * W}px,0,0)`;
    if (item.anterior) {
      item.anterior.el.style.transform = `translate3d(${-p * W * 0.26}px,0,0)`;
      if (item.veu) item.veu.style.opacity = String(p * 0.17);
    }
  }

  function animarPara(alvo, { velocidade = 0 } = {}) {
    const item = pilha[pilha.length - 1];
    if (!item) return;
    // Fechando: a tela de baixo vai virar a ativa. Libera JÁ, uma vez — quem
    // solta o gesto e toca em seguida não pode bater numa tela ainda isolada.
    // Se a pessoa desistir (a mola termina em 1), o aoParar re-isola.
    if (alvo === 0 && item.anterior) liberar(item.anterior.el);
    if (!transicao) {
      transicao = new Fisica.Mola({
        amortecimento: 1, resposta: 0.42, epsilonX: 0.002, epsilonV: 0.02,
        aoAtualizar: (v) => aplicarProgresso(v),
        // Terminou em 0: a tela de cima saiu. Terminou em 1: a pessoa desistiu
        // de voltar, e o isolamento tem de ser recalculado (a de baixo volta a
        // ser inerte).
        aoParar: (v) => { if (v === 0) desmontarTopo(); else aoMudarPilha(); },
      });
    }
    if (Fisica.menosMovimento()) {
      transicao.fixa(alvo);
      aplicarProgresso(alvo);
      if (alvo === 0) desmontarTopo();
      return;
    }
    // A velocidade da mola é em progresso/s: converte px/s dividindo pela largura
    transicao.para(alvo, { velocidade: velocidade / largura() });
  }

  // Todo mini-mapa da tela devolve seu contexto WebGL antes de o DOM sumir
  function soltarMinis(el) {
    el.querySelectorAll('.minimapa').forEach((c) => {
      if (c._mini && c._mini.remove) { try { c._mini.remove(); } catch (e) { /* já caiu */ } }
      c._mini = null;
    });
  }

  function desmontarTopo() {
    const item = pilha.pop();
    if (!item) return;
    soltarMinis(item.el);
    item.el.remove();
    if (item.veu) item.veu.remove();
    if (item.anterior) item.anterior.el.style.transform = '';
    aoMudarPilha();
    // Se voltou para a raiz do mapa, o mapa continua vivo — não remontar.
  }

  function aoMudarPilha() {
    bordaVoltar.hidden = pilha.length <= 1;
    isolarAsDeBaixo();
  }

  /* Só a tela do topo é operável. As de baixo continuam no DOM — é o que
     permite a transição e o gesto de voltar — mas precisam sair da árvore de
     acessibilidade: sem isto, o Tab e o leitor de tela passeiam por botões de
     uma tela que a pessoa não está vendo. Quem enxerga e usa o dedo nunca
     percebe; quem usa TalkBack ouve "Continuar com Google" no meio do perfil.

     ⚠️ De propósito, isto NÃO usa `inert`. `inert` reconstrói o estado de
     camadas do Chromium, e alterná-lo numa tela que está com transform (o
     recuo de 26%) e contém um rolável composto deixava o hit-test do rolável
     APONTANDO PARA O LUGAR ERRADO — a tela pintava certo e nenhum toque nela
     funcionava mais, de forma intermitente e sem erro nenhum. `aria-hidden` +
     `tabindex` fazem o mesmo isolamento sem tocar em camada de pintura. */
  function liberar(el) {
    el.removeAttribute('aria-hidden');
    el.querySelectorAll('[data-tab-guardado]').forEach((x) => {
      const v = x.getAttribute('data-tab-guardado');
      if (v) x.setAttribute('tabindex', v); else x.removeAttribute('tabindex');
      x.removeAttribute('data-tab-guardado');
    });
  }
  function isolar(el) {
    el.setAttribute('aria-hidden', 'true');
    el.querySelectorAll('button, a[href], input, select, textarea, [tabindex]').forEach((x) => {
      if (x.hasAttribute('data-tab-guardado')) return;
      x.setAttribute('data-tab-guardado', x.getAttribute('tabindex') || '');
      x.setAttribute('tabindex', '-1');
    });
  }
  function isolarAsDeBaixo() {
    pilha.forEach((item, i) => {
      (i === pilha.length - 1 ? liberar : isolar)(item.el);
    });
  }

  /* Troca a raiz inteira (ex.: cliente → terapeuta), com dissolução curta */
  function trocarRaiz(nome) {
    pilha.slice().reverse().forEach((it) => { soltarMinis(it.el); it.el.remove(); if (it.veu) it.veu.remove(); });
    pilha.length = 0;
    const el = elementoDe(construir(nome));
    pilhaEl.appendChild(el);
    pilha.push({ nome, params: {}, el, veu: null, anterior: null });
    aoMudarPilha();
    depoisDeMontar(nome, {}, el);
  }

  /* ------------------------------------- gesto de voltar pela borda */
  // A tela de baixo aparece conforme o dedo puxa. Pode ser revertido no meio
  // do caminho: quem decide é a VELOCIDADE na soltura, não a posição.
  function ligarBordaVoltar() {
    const rastro = new Fisica.Rastreador(90);
    let ativo = false, x0 = 0, p0 = 1;

    bordaVoltar.addEventListener('pointerdown', (e) => {
      if (pilha.length <= 1) return;
      bordaVoltar.setPointerCapture(e.pointerId);
      ativo = true; x0 = e.clientX; p0 = 1;
      if (transicao) { transicao.congela(); p0 = transicao.valor; }
      rastro.limpar(); rastro.anota(e.clientX, 0);
    });

    bordaVoltar.addEventListener('pointermove', (e) => {
      if (!ativo) return;
      const W = largura();
      let p = p0 - (e.clientX - x0) / W;
      // Puxar para além do fechado resiste; empurrar de volta trava em 1
      if (p < 0) p = -Fisica.elastico(-p, 1, 0.4);
      p = Math.min(p, 1);
      if (transicao) transicao.fixa(p);
      aplicarProgresso(p);
      rastro.anota(e.clientX, 0);
    });

    const fim = (e) => {
      if (!ativo) return;
      ativo = false;
      const v = rastro.velocidade().x;               // px/s, positivo = indo para a direita
      const p = transicao ? transicao.valor : 1;
      const projetado = p - Fisica.projetar(v, 0.99) / largura();
      const fechar = projetado < 0.5;
      animarPara(fechar ? 0 : 1, { velocidade: -v });
    };
    bordaVoltar.addEventListener('pointerup', fim);
    bordaVoltar.addEventListener('pointercancel', fim);
  }

  /* ============================================== depois de montar tela */
  function depoisDeMontar(nome, params, el) {
    if (nome === 'raiz' || nome === 'raizT') { renderAba(); return; }
    if (nome === 'perfil') { montarMinimapas(el); return; }
    if (nome === 'assistente') { montarMinimapas(el); return; }
    if (nome === 'codigo') { ligarCodigo(el); return; }
  }

  /* ---------------------------------------------------- abas (raiz) */
  function renderAba() {
    const raiz = pilha[0];
    if (!raiz) return;
    const cx = raiz.el.querySelector('#conteudoAba');
    if (!cx) return;

    const eraMapa = !!cx.querySelector('#mapa');
    let html;
    if (E.papel === 'terapeuta') {
      html = E.aba === 'meuPerfil' ? Telas.abaMeuPerfil()
        : E.aba === 'avaliacoesT' ? Telas.abaAvaliacoesT()
        : Telas.abaPainel();
    } else {
      html = E.aba === 'mapa' ? (E.modo === 'mapa' ? Telas.abaMapa() : Telas.abaLista())
        : E.aba === 'favoritas' ? Telas.abaFavoritas()
        : Telas.abaConta();
    }

    cx.innerHTML = html;
    // Dissolução curta ao trocar de aba: elas são irmãs, não empilhadas.
    if (!Fisica.menosMovimento()) {
      cx.animate([{ opacity: 0.4, transform: 'scale(0.994)' }, { opacity: 1, transform: 'none' }],
        { duration: 200, easing: 'cubic-bezier(.22,.61,.36,1)' });
    }

    // Atualiza a barra de abas (contador de favoritas muda)
    const nav = raiz.el.querySelector('.abas');
    if (nav) nav.outerHTML = E.papel === 'terapeuta' ? Telas.barraAbasTerapeuta() : Telas.barraAbas();

    if (cx.querySelector('#mapa')) montarMapa();
    else {
      // O MapLibre segura contexto de GPU e ouvintes: sair da aba sem descartar
      // deixa um mapa invisível vivo, e outro nasce na volta.
      if (mapaCtrl && mapaCtrl.destruir) mapaCtrl.destruir();
      if (pararDeSeguir) { pararDeSeguir(); pararDeSeguir = null; }
      mapaCtrl = null; folha = null;
      // O estado da folha morre junto — senão, na volta ao mapa, o 1º pino
      // abre sem animação e a folha mede altura de elemento escondido (0).
      folhaAberta = false; tipoFolha = null; idFolha = null; molaFolha = null;
    }
    if (E.aba === 'meuPerfil' || E.aba === 'mapa') montarMinimapas(cx);

    // Status bar clara sobre a capa violeta não existe aqui; mantém escura
    if (eraMapa && !cx.querySelector('#mapa')) { /* nada a fazer */ }
  }

  function trocarAba(aba) {
    if (E.aba === aba) return;
    E.aba = aba;
    if (aba === 'mapa') E.modo = 'mapa';
    renderAba();
  }

  /* ------------------------------------------------------ o mapa */
  // Quanto o mapa perde em cima para a busca e os chips (medido, não chutado)
  function alturaTopoMapa() {
    const t = document.querySelector('.mapa__topo');
    return t ? t.getBoundingClientRect().height + 10 : 130;
  }

  function montarMapa() {
    const el = document.getElementById('mapa');
    if (!el) return;
    folha = document.getElementById('folha');

    /* Dois motores, a mesma forma. O real mostra a RUA da pessoa — é o que faz
       uma terapeuta reconhecer o próprio quarteirão. O desenhado é o plano B
       honesto: sem internet, com o CDN fora do ar ou em navegador antigo, o app
       continua inteiro em vez de mostrar um retângulo cinza. */
    const opcoes = {
      offsetBaixo: 96,
      offsetTopo: alturaTopoMapa(),
      aoTocarPin: (id) => selecionarPin(id),
      aoTocarFundo: () => fecharFolha(),
    };
    mapaCtrl = MapaReal.disponivel()
      ? MapaReal.montar(el, opcoes)
      : Mapa.montar(el, { ...opcoes, zoom: Mapa.ZOOM_INICIAL });

    mapaCtrl.centralizar(Dados.EU.lat, Dados.EU.lng, 'regiao', false);
    ligarFolha();
    if (E.localizacao === 'concedida' && Dados.EU.origem === 'gps') seguirPosicao();
    Conquistas.registrar('mapa-aberto');
  }

  function selecionarPin(id, animar = true) {
    const t = Dados.porId(id);
    if (!t) return;
    if (mapaCtrl) mapaCtrl.selecionar(id);
    abrirFolha(Telas.folhaResumo(t), { tipo: 'resumo', id });
    if (animar && mapaCtrl) {
      // Sobe o ponto para a metade de cima: a folha vai ocupar a de baixo
      mapaCtrl.definirOffsetBaixo(alturaFolha() + 40);
      mapaCtrl.centralizar(t.lat, t.lng, 'pessoa');
    }
  }

  /* ---------------------------------------------------- a folha */
  let molaFolha = null, alturaAtual = 0, folhaAberta = false, tipoFolha = null, idFolha = null;

  function alturaFolha() { return folha ? folha.offsetHeight : 0; }

  function abrirFolha(html, meta = {}) {
    if (!folha) return;
    tipoFolha = meta.tipo; idFolha = meta.id;
    folha.querySelector('#folhaConteudo').innerHTML = html;
    folha.hidden = false;
    // Mede depois de pintar o conteúdo — a altura muda a cada card
    alturaAtual = folha.offsetHeight;

    if (!molaFolha) {
      molaFolha = new Fisica.Mola({
        amortecimento: 0.82, resposta: 0.3,     // valores da Apple para gaveta
        valor: alturaAtual,
        aoAtualizar: (v) => {
          folha.style.transform = `translate3d(0,${v}px,0)`;
          // Os botões flutuantes acompanham a folha em vez de sumir atrás dela
          const fl = document.getElementById('flutuantes');
          if (fl) fl.style.transform = `translate3d(0,${Math.min(0, v - alturaAtual)}px,0)`;
        },
        aoParar: (v) => {
          if (v >= alturaAtual - 1) {
            folha.hidden = true; folhaAberta = false;
            const fl = document.getElementById('flutuantes');
            if (fl) fl.style.transform = '';
          }
        },
      });
    }
    if (!folhaAberta) molaFolha.fixa(alturaAtual);
    folhaAberta = true;
    if (Fisica.menosMovimento()) { molaFolha.fixa(0); return; }
    molaFolha.para(0, { amortecimento: 0.82, resposta: 0.3 });
  }

  function fecharFolha() {
    if (!folha || !folhaAberta) return;
    if (mapaCtrl) { mapaCtrl.selecionar(null); mapaCtrl.definirOffsetBaixo(96); }
    if (Fisica.menosMovimento()) { molaFolha.fixa(alturaAtual); folha.hidden = true; folhaAberta = false; return; }
    molaFolha.para(alturaAtual, { amortecimento: 1, resposta: 0.3 });
  }

  /* Arraste da folha: segue o dedo 1:1, resiste para cima, e na soltura
     decide pela projeção do momento — não pela posição onde soltou. */
  function ligarFolha() {
    if (!folha || folha.dataset.ligada) return;
    folha.dataset.ligada = '1';
    const rastro = new Fisica.Rastreador(90);
    let arrastando = false, y0 = 0, base = 0, moveu = false;
    let naAlca = false, caixaRolavel = null;

    // O conteúdo rola por dentro quando é comprido (a lista de filtros).
    // Nesse caso o arraste da folha só vale a partir do TOPO da rolagem —
    // senão puxar a lista para baixo fecharia a folha sem querer.
    function rolavel() {
      const c = folha.querySelector('.folha__conteudo');
      return c && c.scrollHeight > c.clientHeight + 1 ? c : null;
    }

    folha.addEventListener('pointerdown', (e) => {
      if (e.target.closest('input, textarea, select')) return;
      // NÃO capturar aqui. Com o ponteiro capturado, o clique seguinte é
      // entregue a quem capturou — e nada dentro da folha responderia ao toque.
      // A captura só entra quando o gesto vira arraste de verdade.
      arrastando = true; moveu = false;
      naAlca = !!e.target.closest('.folha__alca');
      caixaRolavel = rolavel();
      y0 = e.clientY;
      base = molaFolha ? molaFolha.valor : 0;
      if (molaFolha) molaFolha.congela();
      rastro.limpar(); rastro.anota(0, base);
    });

    folha.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      const dy = e.clientY - y0;
      if (!moveu && Math.abs(dy) < 8) return;
      if (!moveu) {
        if (caixaRolavel && !naAlca) {
          // Só assume o gesto se for para baixo E a lista já estiver no topo
          if (dy < 0 || caixaRolavel.scrollTop > 0) { arrastando = false; return; }
        }
        moveu = true;
        // Agora sim: virou arraste, e o dedo pode sair da folha sem perder o fio
        try { folha.setPointerCapture(e.pointerId); } catch (_) {}
      }
      let v = base + dy;
      if (v < 0) v = -Fisica.elastico(-v, alturaAtual || 300);   // resiste para cima
      molaFolha.fixa(v);
      rastro.anota(0, v);
    });

    const fim = (e) => {
      if (!arrastando) return;
      arrastando = false;
      if (!moveu) return;                       // foi um toque; o clique cuida

      const v = rastro.velocidade().y;
      const atual = molaFolha.valor;
      const projetado = atual + Fisica.projetar(v, 0.99);

      // Empurrar a folha para cima abre o perfil inteiro — o gesto aponta
      // para onde a coisa vai dar (a folha "cresce" na direção do dedo).
      if (projetado < -70 && tipoFolha === 'resumo' && idFolha) {
        molaFolha.para(0, { velocidade: v, amortecimento: 1, resposta: 0.3 });
        abrirPerfil(idFolha);
        return;
      }
      const destino = Fisica.encaixeMaisProximo([0, alturaAtual], projetado);
      if (destino === alturaAtual) {
        if (mapaCtrl) { mapaCtrl.selecionar(null); mapaCtrl.definirOffsetBaixo(96); }
      }
      molaFolha.para(destino, { velocidade: v, amortecimento: destino === 0 ? 0.82 : 1, resposta: 0.3 });
    };
    folha.addEventListener('pointerup', fim);
    folha.addEventListener('pointercancel', fim);
  }

  /* -------------------------------------------------- mini-mapas */
  // O mesmo traçado do mapa grande, recortado num quadro pequeno.
  function montarMinimapas(raiz) {
    raiz.querySelectorAll('.minimapa').forEach((cx) => {
      if (cx.dataset.pronto) return;
      cx.dataset.pronto = '1';
      const x = Number(cx.dataset.x), y = Number(cx.dataset.y);
      const lat = Number(cx.dataset.lat), lng = Number(cx.dataset.lng);

      /* Com mapa real disponível, o mini-mapa também é real — senão o perfil
         mostraria uma rua desenhada enquanto a tela anterior mostrava a rua de
         verdade, e a diferença faria a pessoa duvidar das duas. */
      if (MapaReal.disponivel() && Number.isFinite(lat) && Number.isFinite(lng)) {
        let instancia = null;
        if (cx.dataset.arrastavel) {
          // Pino FIXO no centro, mapa se movendo por baixo: acertar um alvo
          // parado é mais fácil que arrastar um alvo.
          const mira = document.createElement('div');
          mira.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);z-index:3;pointer-events:none';
          mira.innerHTML = Telas.pinoSimplesHTML();
          cx.appendChild(mira);
          instancia = MapaReal.montarMini(cx, lat, lng, {
            arrastavel: true,
            aoMover: (la, ln) => {
              E.perfil.lat = la; E.perfil.lng = ln;
              const plano = Dados.paraPlano(la, ln);      // o desenhado precisa do plano
              E.perfil.x = plano.x; E.perfil.y = plano.y;
            },
          });
        } else {
          instancia = MapaReal.montarMini(cx, lat, lng);
        }
        /* Guardada no próprio nó para o desmonte achar: cada mini é um
           contexto WebGL, e o navegador só dá ~16 — sem `remove()`, abrir
           perfis em sequência derruba o contexto mais antigo (o mapa
           principal apaga sem erro nenhum). */
        cx._mini = instancia;
        return;
      }

      const z = 1.5;
      const w = cx.clientWidth || 340, h = cx.clientHeight || 160;
      const sufixo = 'm' + Math.random().toString(36).slice(2, 7);
      cx.innerHTML = `
        <div class="mapa__mundo" style="--z:${z};width:${Dados.MUNDO.largura}px;height:${Dados.MUNDO.altura}px;
             transform:translate3d(${w / 2 - x * z}px,${h / 2 - y * z}px,0) scale(${z})">
          ${Mapa.gerarSVG(sufixo)}
        </div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);pointer-events:none">
          <svg viewBox="0 0 46 56" width="34" height="41" aria-hidden="true">
            <path d="M23 55C23 55 43 36.5 43 21.5 43 10.2 34.05 1 23 1S3 10.2 3 21.5C3 36.5 23 55 23 55Z" fill="var(--violeta)"/>
            <circle cx="23" cy="21" r="9" fill="#fff"/>
          </svg>
        </div>`;

      if (cx.dataset.arrastavel) ligarMinimapaArrastavel(cx, z, w, h);
    });
  }

  /* No passo do endereço, a terapeuta arrasta o mapa para acertar o pino. */
  function ligarMinimapaArrastavel(cx, z, w, h) {
    const mundo = cx.querySelector('.mapa__mundo');
    let tx = w / 2 - Number(cx.dataset.x) * z, ty = h / 2 - Number(cx.dataset.y) * z;
    let arrastando = false, ix = 0, iy = 0, bx = 0, by = 0;
    cx.style.touchAction = 'none';
    cx.style.cursor = 'grab';

    cx.addEventListener('pointerdown', (e) => {
      cx.setPointerCapture(e.pointerId);
      arrastando = true; ix = e.clientX; iy = e.clientY; bx = tx; by = ty;
      cx.style.cursor = 'grabbing';
    });
    cx.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      tx = bx + (e.clientX - ix); ty = by + (e.clientY - iy);
      mundo.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${z})`;
    });
    const fim = () => {
      if (!arrastando) return;
      arrastando = false; cx.style.cursor = 'grab';
      E.perfil.x = (w / 2 - tx) / z;
      E.perfil.y = (h / 2 - ty) / z;
      // O motor REAL grava lat/lng e deriva o plano; este (desenhado) tem de
      // fazer o mesmo ao contrário — senão o endereço diverge entre motores e
      // a Fase 1 salvaria a coordenada velha.
      const geo = Dados.paraLatLng(E.perfil.x, E.perfil.y);
      E.perfil.lat = geo.lat; E.perfil.lng = geo.lng;
    };
    cx.addEventListener('pointerup', fim);
    cx.addEventListener('pointercancel', fim);
  }

  /* ================================================= avisos e diálogos */
  let torradaAtiva = null;
  function avisar(texto, icone = 'check') {
    if (torradaAtiva) torradaAtiva.remove();
    const el = elementoDe(`<div class="torrada" role="status">${Telas.ic(icone, 19)}<span>${Telas.esc(texto)}</span></div>`);
    app.appendChild(el);
    torradaAtiva = el;
    if (!Fisica.menosMovimento()) {
      el.animate([{ opacity: 0, transform: 'translateY(16px) scale(0.96)' }, { opacity: 1, transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)' });
    }
    setTimeout(() => {
      if (el !== torradaAtiva) return;
      const a = el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 220, easing: 'ease-in' });
      a.onfinish = () => { el.remove(); if (torradaAtiva === el) torradaAtiva = null; };
    }, 2600);
  }

  function perguntar(titulo, texto, rotuloOk, aoConfirmar, perigo = false) {
    const el = elementoDe(`<div class="cortina">
      <div class="dialogo">
        <h3 class="d3 equilibra">${Telas.esc(titulo)}</h3>
        <p class="corpo dim mt8 equilibra">${Telas.esc(texto)}</p>
        <div class="mt24 empilhado" style="gap:8px">
          <button class="btn btn--bloco ${perigo ? '' : ''}" data-ok="1" ${perigo ? 'style="--btn-bg:var(--alerta)"' : ''}>${Telas.esc(rotuloOk)}</button>
          <button class="btn btn--bloco btn--fantasma" data-cancelar="1">Cancelar</button>
        </div>
      </div>
    </div>`);
    app.appendChild(el);
    const cx = el.querySelector('.dialogo');
    if (!Fisica.menosMovimento()) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
      // Materializa: escala e opacidade juntas, como um objeto chegando
      cx.animate([{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }],
        { duration: 320, easing: 'cubic-bezier(.2,.95,.3,1)' });
    }
    el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-ok]')) { el.remove(); aoConfirmar(); }
      else if (ev.target.closest('[data-cancelar]') || ev.target === el) el.remove();
    });
  }

  /* ==================================================== ações do app */
  function abrirPerfil(id) {
    fecharFolha();
    abrir('perfil', { id });
    Conquistas.registrar('perfil-visto', { id });
  }

  function alternarFavorito(id) {
    if (E.favoritos.has(id)) { E.favoritos.delete(id); avisar('Removida das favoritas', 'coracao'); }
    else { E.favoritos.add(id); avisar('Salva nas favoritas', 'coracao'); Conquistas.registrar('favoritou'); }
    repintarFavoritos(id);
    // Na PRÓPRIA aba Favoritas o cartão tem de sair/entrar da lista na hora —
    // só repintar corações deixava três indicadores divergindo na mesma tela
    // (badge da aba, "1 salva" do cabeçalho e a lista).
    if (E.aba === 'favoritas' && pilha.length === 1) renderAba();
  }

  // Repinta só os corações daquele id — nada de reconstruir a tela inteira,
  // que perderia a rolagem e a posição do mapa.
  function repintarFavoritos(id) {
    const fav = E.favoritos.has(id);
    document.querySelectorAll(`[data-a="favoritar"][data-id="${id}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', String(fav));
      b.setAttribute('aria-label', fav ? 'Remover das favoritas' : 'Favoritar');
      b.style.color = fav ? 'var(--alerta)' : (b.closest('.rodape-fixo') ? 'var(--texto)' : 'var(--texto-3)');
      const s = b.querySelector('svg');
      if (s) s.setAttribute('fill', fav ? 'currentColor' : 'none');
    });
    const raiz = pilha[0];
    const nav = raiz && raiz.el.querySelector('.abas');
    if (nav && E.papel !== 'terapeuta') nav.outerHTML = Telas.barraAbas();
  }

  function atualizarMapa() {
    if (mapaCtrl && mapaCtrl.atualizarPins) {
      mapaCtrl.atualizarPins();
      // O motor desenhado reconstrói os pinos por innerHTML e perde o anel de
      // seleção; o real preserva. Igualar por cima custa uma chamada.
      if (folhaAberta && idFolha && mapaCtrl.selecionar) mapaCtrl.selecionar(idFolha);
    }
    const chips = document.getElementById('chips');
    if (chips) chips.outerHTML = Telas.chipsFiltro();
    const conta = document.getElementById('contaFiltro');
    if (conta) conta.textContent = Dados.listar().length;
    // Modo lista: repinta SÓ o miolo dos resultados — redesenhar a aba inteira
    // destruía o campo de busca no meio da digitação (foco caía, teclado fechava)
    if (E.modo === 'lista') {
      const rl = document.getElementById('resultadosLista');
      if (rl) rl.innerHTML = Telas.resultadosLista(); else renderAba();
    }
    if (tipoFolha === 'filtros' && folhaAberta) {
      // A folha de filtros se remede sozinha ao mudar de tamanho
      const alt = folha.offsetHeight;
      if (alt !== alturaAtual) alturaAtual = alt;
    }
  }

  /* =============================================== localização de verdade */
  /*
     Pedir GPS não é um sim/não: é uma espera que pode acabar de seis jeitos
     (ver src/04c-gps.js). Cada um precisa de uma tela — e a pior resposta
     possível é o botão ficar mudo enquanto o aparelho procura satélite.
  */
  let pararDeSeguir = null;

  function pedirLocalizacao(botao) {
    if (!Gps.disponivel()) {
      // Não prometer o que o navegador não oferece. Explica e abre o caminho
      // sem GPS, em vez de deixar a pessoa tocando num botão que nunca responde.
      avisar(Gps.motivoIndisponivel(), 'info');
      setTimeout(() => abrir('cidades', { motivo: Gps.motivoIndisponivel() }), 900);
      return;
    }

    const original = botao ? botao.innerHTML : '';
    if (botao) {
      botao.disabled = true;
      botao.innerHTML = `${Telas.ic('mira', 20)} Procurando você…`;
    }
    const restaurar = () => { if (botao) { botao.disabled = false; botao.innerHTML = original; } };

    Gps.pedir({
      aoObter: (pos) => {
        restaurar();
        Dados.definirPosicao({ lat: pos.lat, lng: pos.lng, precisao: pos.precisao,
                               origem: 'gps', bairro: 'Sua localização', cidade: '' });
        E.localizacao = 'concedida';
        trocarRaiz('raiz');

        /* Quem está longe da Grande Porto Alegre veria o mapa da própria rua e
           ZERO terapeutas — e concluiria que o app está quebrado. Está certo:
           as 12 são ficção e moram aqui. Dizer isso é melhor que deixar deduzir. */
        const d = Gps.longeDosDados(pos.lat, pos.lng);
        if (d.longe) {
          setTimeout(() => perguntar(
            'Você está longe das terapeutas de teste',
            `Este protótipo tem 12 terapeutas fictícias, todas na Grande Porto Alegre — `
            + `a ${d.km} km de você. Quer ver o mapa de lá para conhecer o app?`,
            'Ver a região de teste',
            () => { Dados.restaurarPosicaoFicticia(); E.localizacao = 'cidade'; renderAba();
                    if (mapaCtrl) { mapaCtrl.atualizarEu(); mapaCtrl.atualizarPins();
                                    mapaCtrl.centralizar(Dados.EU.lat, Dados.EU.lng, 'regiao', false); } }
          ), 700);
          return;
        }

        avisar(pos.imprecisa
          ? `Localização aproximada (±${pos.precisao} m). Perto de uma janela melhora.`
          : 'Prontinho — este é o seu mapa', 'local');

        seguirPosicao();
        nomearLugar(pos.lat, pos.lng);
      },
      aoFalhar: (erro) => {
        restaurar();
        avisar(erro.mensagem, 'info');
        // Negou ou falhou: o app CONTINUA. O modo cidade existe para isto.
        setTimeout(() => abrir('cidades', { motivo: erro.mensagem }), 1100);
      },
    });
  }

  /* O ponto azul acompanha quem anda. O observador é parado ao sair do mapa —
     esquecido, ele consome bateria com o app em outra tela. */
  function seguirPosicao() {
    if (pararDeSeguir) pararDeSeguir();

    /* ⚠️ DESEMPENHO — a lição desta função: `watchPosition` pode pulsar a cada
       segundo, e a primeira versão re-renderizava a LISTA INTEIRA a cada pulso.
       Parada num semáforo, com o GPS oscilando 3 m para lá e para cá, a pessoa
       veria a rolagem saltar e os cartões piscarem — trabalho de tela inteira
       para uma mudança que não muda nada.

       A régua: só vale recalcular quando o passo MUDA alguma resposta. 25 m
       não trocam a ordem de ninguém num raio de quilômetros; o ponto azul, esse
       sim, acompanha cada pulso — mover um marcador custa quase nada. */
    let ultima = { lat: Dados.EU.lat, lng: Dados.EU.lng };
    pararDeSeguir = Gps.acompanhar((pos) => {
      const andou = Dados.distanciaEntre(ultima, pos) * 1000;   // em metros

      if (andou < 25) {
        // Passo pequeno: move o ponto azul e o círculo de precisão, só.
        Dados.EU.lat = pos.lat; Dados.EU.lng = pos.lng; Dados.EU.precisao = pos.precisao;
        Object.assign(Dados.EU, Dados.paraPlano(pos.lat, pos.lng));
        if (mapaCtrl && mapaCtrl.atualizarEu) mapaCtrl.atualizarEu();
        return;
      }

      ultima = { lat: pos.lat, lng: pos.lng };
      Dados.definirPosicao({ lat: pos.lat, lng: pos.lng, precisao: pos.precisao, origem: 'gps' });
      if (mapaCtrl && mapaCtrl.atualizarEu) mapaCtrl.atualizarEu();
      if (E.modo === 'lista') renderAba();     // a ordem pode ter mudado; agora vale
    });
  }

  /* Enfeite honesto: troca dois números por "Petrópolis, Porto Alegre" na tela
     da conta. Falha em silêncio — não pode segurar nada. */
  function nomearLugar(lat, lng) {
    Gps.ondeEstou(lat, lng, (lugar) => {
      if (!lugar.bairro && !lugar.cidade) return;
      Dados.EU.bairro = lugar.bairro || 'Sua localização';
      Dados.EU.cidade = lugar.cidade || '';
      if (E.aba === 'conta') renderAba();
    });
  }

  /* ---------------------------------------------- tela do código SMS */
  function ligarCodigo(el) {
    const campos = Array.from(el.querySelectorAll('.digito'));
    const btn = el.querySelector('#btnCodigo');
    campos.forEach((c, i) => {
      c.addEventListener('input', () => {
        c.value = c.value.replace(/\D/g, '').slice(0, 1);
        if (c.value && campos[i + 1]) campos[i + 1].focus();
        btn.disabled = campos.some((x) => !x.value);
      });
      c.addEventListener('keydown', (ev) => {
        if (ev.key === 'Backspace' && !c.value && campos[i - 1]) campos[i - 1].focus();
      });
    });
    setTimeout(() => campos[0] && campos[0].focus(), 380);

    let s = 30;
    const rot = el.querySelector('#reenvio');
    const timer = setInterval(() => {
      s--;
      if (s <= 0) { clearInterval(timer); rot.innerHTML = '<b style="color:var(--violeta)">Reenviar código</b>'; return; }
      rot.innerHTML = `Reenviar em <b class="tab-num">${s}</b>s`;
    }, 1000);
  }

  /* ================================================ eventos globais */
  // Resposta no toque, não na soltura: a marca de "pressionado" entra em
  // pointerdown e sai em pointerup/cancel. Esperar o clique parece morto.
  function ligarPressao() {
    const alvos = '.btn, .redondo, .chip, .aba, .opcao, .cartao-escolha, .seletor-estrelas button';
    document.addEventListener('pointerdown', (e) => {
      const el = e.target.closest(alvos);
      if (el) el.classList.add('pressionado');
    }, true);
    const solta = () => document.querySelectorAll('.pressionado').forEach((el) => el.classList.remove('pressionado'));
    document.addEventListener('pointerup', solta, true);
    document.addEventListener('pointercancel', solta, true);
    // Sair do elemento com o dedo ainda pressionado cancela — dá para desistir
    document.addEventListener('pointermove', (e) => {
      const p = document.querySelector('.pressionado');
      if (p && !p.contains(document.elementFromPoint(e.clientX, e.clientY))) p.classList.remove('pressionado');
    }, { passive: true });
  }

  function ligarAcoes() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-a]');
      if (!el) return;
      const a = el.dataset.a;
      if (el.tagName === 'A') e.preventDefault();
      executar(a, el, e);
    });

    document.addEventListener('input', (e) => {
      const el = e.target;
      if (el.id === 'campoBusca') {
        E.busca = el.value;
        // Redesenhar a barra inteira tiraria o foco do campo no meio da digitação
        const x = document.querySelector('[data-a="limparBusca"]');
        if (x) x.hidden = !el.value;
        atualizarMapa();
        return;
      }
      if (el.id === 'campoComentario') return;
      if (el.dataset.campo) { E.perfil[el.dataset.campo] = el.value; return; }
      if (el.id === 'demoHora') {
        const [hh, mm] = el.value.split(':').map(Number);
        E.relogio = { ...(E.relogio || { dia: new Date().getDay() }), hora: hh || 0, minuto: mm || 0 };
        avisarRelogio(); return;
      }
    });
    document.addEventListener('change', (e) => {
      if (e.target.id === 'demoDia') {
        E.relogio = { ...(E.relogio || { hora: 10, minuto: 0 }), dia: Number(e.target.value) };
        avisarRelogio();
      }
      /* Endereça a faixa pelo ÍNDICE, não pelo dia: desde que um dia pode ter
         mais de uma faixa (quem para para o almoço), procurar pelo dia acha
         sempre a primeira e a segunda nunca seria editável. */
      if (e.target.dataset.a === 'horaAbre' || e.target.dataset.a === 'horaFecha') {
        const h = E.perfil.horarios[Number(e.target.dataset.ix)];
        // Campo de hora LIMPO devolve '' — gravar isso criaria uma faixa
        // "às" que nunca abre. Devolve o valor que estava.
        if (h && e.target.value) h[e.target.dataset.a === 'horaAbre' ? 'abre' : 'fecha'] = e.target.value;
        else if (h) e.target.value = h[e.target.dataset.a === 'horaAbre' ? 'abre' : 'fecha'];
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (folhaAberta) fecharFolha(); else voltar(); }
      /* Cartões são <article role="button"> — e role="button" NÃO ganha o
         click sintético que um <button> de verdade ganha. Sem isto, Enter e
         espaço num cartão focado não abrem nada. */
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"]:not(button)')) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  function avisarRelogio() {
    atualizarMapa();
    const raiz = pilha[0];
    if (raiz && E.aba === 'conta') { /* a tela de conta não precisa repintar */ }
  }

  /* ------------------------------------------------------- as ações */
  function executar(a, el) {
    const id = el.dataset.id;
    const P = E.perfil;

    switch (a) {
      /* --- entrada --- */
      case 'entrarGoogle':
        E.entrouPor = 'google'; E.nomeUsuario = 'Você';
        abrir('papel'); break;
      case 'entrarCelular':
        E.entrouPor = 'celular'; abrir('telefone'); break;
      case 'enviarCodigo': {
        const c = document.getElementById('campoTel');
        E.celular = (c && c.value.trim()) || '(51) 9 9999-0000';
        abrir('codigo'); break;
      }
      case 'confirmarCodigo': abrir('papel'); break;

      case 'escolherPapel':
        E.papel = el.dataset.papel;
        if (E.papel === 'cliente') { E.aba = 'mapa'; abrir('localizacao'); }
        else { E.aba = 'meuPerfil'; E.passo = 0; abrir('assistente'); }
        break;

      case 'permitirLocal': pedirLocalizacao(el); break;
      case 'escolherCidade': abrir('cidades'); break;
      case 'definirCidade':
        E.localizacao = 'cidade'; E.cidadeEscolhida = el.dataset.cidade;
        Dados.restaurarPosicaoFicticia();
        trocarRaiz('raiz');
        avisar(`Mostrando terapeutas de ${el.dataset.cidade}`, 'local');
        break;

      /* --- navegação --- */
      case 'voltar': voltar(); break;
      case 'aba': trocarAba(el.dataset.aba); break;
      case 'modoLista': E.modo = 'lista'; renderAba(); break;
      case 'modoMapa': E.modo = 'mapa'; renderAba(); break;
      case 'recentrar':
        if (mapaCtrl) mapaCtrl.centralizar(Dados.EU.lat, Dados.EU.lng, 'regiao');
        break;

      /* --- cliente --- */
      case 'abrirPerfil': abrirPerfil(id); break;
      case 'favoritar': alternarFavorito(id); break;
      case 'whatsapp': {
        const t = Dados.porId(id);
        if (!t) break;
        avisar(`Abrindo o WhatsApp de ${t.nome.split(' ')[0]}…`, 'zap');
        abrirFora(Dados.linkZap(t));
        Conquistas.registrar('contato');
        break;
      }
      /* O Instagram é o RF09 junto com o WhatsApp — e para a persona 2 (que
         hoje divulga SÓ por lá) é onde ela mostra o trabalho. Vai pelo mesmo
         caminho de saída do app: no Android, a ponte nativa; no navegador,
         aba nova. O app do Instagram captura este endereço quando instalado. */
      case 'instagram': {
        const t = Dados.porId(id);
        if (!t) break;
        avisar(`Abrindo o Instagram de ${t.nome.split(' ')[0]}…`, 'instagram');
        abrirFora('https://instagram.com/' + t.instagram);
        break;
      }
      case 'avaliar': abrir('avaliar', { id }); break;
      case 'nota': {
        const n = Number(el.dataset.n);
        el.closest('.seletor-estrelas').querySelectorAll('button').forEach((b, i) => {
          b.dataset.on = (i < n ? 1 : 0);
          b.setAttribute('aria-pressed', String(i < n));
        });
        const rot = document.getElementById('rotuloNota');
        if (rot) rot.textContent = ['', 'Não recomendo', 'Deixou a desejar', 'Foi bom', 'Muito bom', 'Excelente'][n];
        const btn = document.getElementById('btnAvaliar');
        if (btn) { btn.disabled = false; btn.dataset.nota = n; }
        break;
      }
      case 'enviarAvaliacao': {
        const btn = document.getElementById('btnAvaliar');
        const marcadas = document.querySelectorAll('.seletor-estrelas button[data-on="1"]').length;
        const nota = Number(btn.dataset.nota) || marcadas;
        const texto = (document.getElementById('campoComentario') || {}).value || '';
        if (!nota) return;
        E.minhasAvaliacoes[id] = { nota, texto: texto.trim(), dias: 0 };
        aplicarAvaliacao(id);
        Conquistas.registrar('avaliou');
        recarregarAbaixo();
        voltar();
        setTimeout(() => avisar('Gratidão por compartilhar! Sua avaliação ajuda outras pessoas a se cuidarem.'), 220);
        break;
      }
      case 'apagarAvaliacao':
        perguntar('Apagar a sua avaliação?', 'Ela sai do perfil na hora e não dá para desfazer.', 'Apagar', () => {
          removerAvaliacao(id);
          delete E.minhasAvaliacoes[id];
          recarregarAbaixo();
          voltar();
          setTimeout(() => avisar('Avaliação apagada', 'lixo'), 220);
        }, true);
        break;

      /* --- filtros --- */
      case 'abrirFiltros': abrirFolha(Telas.filtros(), { tipo: 'filtros' }); break;
      case 'fecharFolha': fecharFolha(); break;
      case 'filtroAberta': E.filtros.abertaAgora = !E.filtros.abertaAgora; recarregarFiltros(); break;
      case 'filtroOnline':  E.filtros.online = !E.filtros.online; recarregarFiltros(); break;
      case 'filtroPresencial': E.filtros.presencial = !E.filtros.presencial; recarregarFiltros(); break;
      case 'filtroDistancia': {
        const km = Number(el.dataset.km);
        E.filtros.distanciaMax = E.filtros.distanciaMax === km ? null : km;
        recarregarFiltros(); break;
      }
      case 'filtroNota':    E.filtros.notaMin = E.filtros.notaMin === 4 ? null : 4; recarregarFiltros(); break;
      case 'filtroNotaValor': {
        const n = Number(el.dataset.nota);
        E.filtros.notaMin = E.filtros.notaMin === n ? null : n; recarregarFiltros(); break;
      }
      case 'filtroPreco': {
        const p = Number(el.dataset.preco);
        E.filtros.precoMax = E.filtros.precoMax === p ? null : p; recarregarFiltros(); break;
      }
      case 'filtroTerapia': {
        const x = el.dataset.terapia;
        E.filtros.terapias.has(x) ? E.filtros.terapias.delete(x) : E.filtros.terapias.add(x);
        recarregarFiltros(); break;
      }
      case 'limparFiltros':
        E.filtros = { terapias: new Set(), precoMax: null, notaMin: null, abertaAgora: false, online: false, presencial: false, distanciaMax: null };
        E.busca = '';
        // O campo visível também — senão o texto antigo fica na tela enquanto
        // os pinos já mostram tudo (mesmas duas linhas do case limparBusca)
        { const c = document.getElementById('campoBusca'); if (c) c.value = ''; }
        { const x = document.querySelector('[data-a="limparBusca"]'); if (x) x.hidden = true; }
        recarregarFiltros(); break;
      case 'limparBusca': {
        E.busca = '';
        const c = document.getElementById('campoBusca'); if (c) c.value = '';
        atualizarMapa(); break;
      }

      /* --- denúncia --- */
      case 'denunciar': abrir('denunciar', { alvo: Dados.porId(id).nome }); break;
      case 'denunciarAvaliacao': abrir('denunciar', { alvo: `Avaliação de ${el.dataset.autor}` }); break;
      case 'motivoDenuncia':
        el.closest('.rolar').querySelectorAll('[data-a="motivoDenuncia"]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        el.setAttribute('aria-pressed', 'true');
        document.getElementById('btnDenuncia').disabled = false;
        break;
      case 'enviarDenuncia':
        voltar();
        setTimeout(() => avisar('Denúncia enviada. Analisamos em até 48 horas.', 'escudo'), 220);
        break;

      /* --- conta --- */
      case 'verTermos': case 'verPrivacidade':
        avisar('No app real, abre o documento completo.', 'info'); break;
      case 'alternarLocal':
        if (E.localizacao === 'concedida') {
          if (pararDeSeguir) { pararDeSeguir(); pararDeSeguir = null; }
          Dados.restaurarPosicaoFicticia();
          E.localizacao = 'cidade';
          if (!E.cidadeEscolhida) E.cidadeEscolhida = Dados.EU.cidade;
          renderAba();
          avisar('Localização desligada — usando a cidade', 'local');
        } else {
          // Religar é pedir de novo ao aparelho, não trocar uma variável:
          // o navegador pode ter tido a permissão revogada desde então.
          pedirLocalizacao(el);
        }
        break;
      case 'exportar': avisar('Enviaremos a cópia dos seus dados por e-mail.', 'saida'); break;
      case 'excluirConta':
        perguntar('Excluir a sua conta?', 'Apaga o seu cadastro, favoritas e avaliações. Não dá para recuperar.', 'Excluir tudo', () => {
          reiniciar();
        }, true);
        break;
      case 'virarTerapeuta':
        E.papel = 'terapeuta'; E.aba = 'meuPerfil'; E.passo = 0;
        trocarRaiz('raizT'); abrir('assistente'); break;
      case 'recomecar': reiniciar(); break;
      case 'alternarRelogio':
        if (E.relogio) E.relogio = null;
        else { const d = Dados.agora(); E.relogio = { dia: d.getDay(), hora: d.getHours(), minuto: d.getMinutes() }; }
        renderAba(); break;

      /* --- terapeuta: assistente --- */
      case 'passoAnterior':
        if (E.passo === 0) { voltar(); break; }
        E.passo--; recarregarAssistente(); break;
      case 'proximoPasso': {
        const erro = validarPasso(E.passo);
        if (erro) { avisar(erro, 'info'); break; }
        if (E.passo === 6) {
          P.visivel = true;
          E.aba = 'meuPerfil';
          Conquistas.registrar('perfil-publicado');
          trocarRaiz('raizT');
          setTimeout(() => avisar('Perfil publicado! Você já aparece no mapa.', 'check'), 260);
          break;
        }
        E.passo++; recarregarAssistente(); break;
      }
      case 'trocarCor': P.tom = (P.tom + 47) % 360; recarregarPasso(); break;
      case 'perfilTerapia': {
        const x = el.dataset.terapia;
        P.terapias.has(x) ? P.terapias.delete(x) : P.terapias.add(x);
        el.setAttribute('aria-pressed', String(P.terapias.has(x))); break;
      }
      case 'perfilAtendimento': {
        const x = el.dataset.tipo;
        if (P.atendimento.has(x) && P.atendimento.size > 1) P.atendimento.delete(x);
        else P.atendimento.add(x);
        el.setAttribute('aria-pressed', String(P.atendimento.has(x)));
        // A prévia diz na hora o que o perfil vai mostrar (híbrido/on-line/presencial)
        const previa = document.getElementById('previaModalidade');
        if (previa) previa.innerHTML = `No seu perfil vai aparecer: <b>${Dados.modalidade(P).titulo}</b>.`;
        break;
      }

      /* --- terapeuta: fotos do espaço e do trabalho (Fase 0: cartões de
         exemplo — o que se valida é o fluxo de montar a vitrine) --- */
      case 'maisFoto': {
        const tipo = el.dataset.tipo;
        const lista = P.fotos[tipo];
        if (lista.length >= 6) { avisar('Seis fotos por seção é o limite — escolha as melhores.', 'info'); break; }
        const legendas = tipo === 'local'
          ? ['Sala de atendimento', 'Recepção', 'Cantinho do chá', 'Entrada', 'Ambiente', 'Jardim']
          : ['Sessão em andamento', 'Mesa montada', 'Materiais de trabalho', 'Cristais', 'Antes da sessão', 'Detalhe'];
        lista.push({ tom: (P.tom + lista.length * 47) % 360, legenda: legendas[lista.length % legendas.length] });
        recarregarPasso(); break;
      }
      case 'tiraFoto':
        P.fotos[el.dataset.tipo].splice(Number(el.dataset.ix), 1);
        recarregarPasso(); break;
      case 'adicionarServico': {
        const nome = (document.getElementById('svNome') || {}).value || '';
        const dur = Number((document.getElementById('svDur') || {}).value) || 60;
        const val = Number((document.getElementById('svValor') || {}).value) || 0;
        if (!nome.trim()) { avisar('Dê um nome ao serviço.', 'info'); break; }
        if (!val) { avisar('Informe o valor do serviço.', 'info'); break; }
        P.servicos.push({ nome: nome.trim(), duracao: dur, valor: val });
        recarregarPasso(); break;
      }
      case 'removerServico': P.servicos.splice(Number(el.dataset.i), 1); recarregarPasso(); break;
      case 'alternarDia': {
        const dia = Number(el.dataset.dia);
        const tem = P.horarios.some((x) => x.dia === dia);
        if (tem) P.horarios = P.horarios.filter((x) => x.dia !== dia);
        else P.horarios.push({ dia, abre: '09:00', fecha: '18:00' });
        recarregarPasso(); break;
      }
      /* Segunda faixa no mesmo dia. Começa DEPOIS da última que já existe —
         quem para o almoço fecha 12h e volta 13h30, então propor 09:00 de novo
         obrigaria a corrigir os dois campos toda vez. */
      case 'maisFaixa': {
        const dia = Number(el.dataset.dia);
        const doDia = P.horarios.filter((x) => x.dia === dia);
        const ultima = doDia[doDia.length - 1];
        const somar = (hhmm, minutos) => {
          const [h, m] = hhmm.split(':').map(Number);
          const t = Math.min(23 * 60 + 59, h * 60 + m + minutos);
          return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
        };
        const abre = ultima ? somar(ultima.fecha, 90) : '13:30';
        // Sem espaço no dia, a faixa nasceria "23:59 às 23:59" — morta e muda
        if (abre >= '23:00') { avisar('O dia não tem mais espaço para outra faixa.', 'info'); break; }
        P.horarios.push({ dia, abre, fecha: somar(abre, 4 * 60) });
        recarregarPasso(); break;
      }
      case 'tirarFaixa':
        P.horarios.splice(Number(el.dataset.ix), 1);
        recarregarPasso(); break;

      case 'alternarSoBairro':
        P.soBairro = !P.soBairro;
        el.setAttribute('aria-checked', String(P.soBairro)); break;

      /* --- terapeuta: perfil --- */
      case 'alternarVisivel':
        P.visivel = !P.visivel;
        renderAba();
        avisar(P.visivel ? 'Você voltou para o mapa' : 'Perfil fora do mapa', P.visivel ? 'olho' : 'cadeado');
        break;
      case 'editarPerfil': E.passo = 0; abrir('assistente'); break;
      case 'pedirVerificacao':
        avisar('No app real, aqui você envia documento e certificado.', 'escudo'); break;
      case 'responder': abrir('responder', { i: Number(el.dataset.i) }); break;
      case 'enviarResposta': {
        const txt = (document.getElementById('campoResposta') || {}).value || '';
        if (!txt.trim()) { avisar('Escreva a sua resposta.', 'info'); break; }
        E.avaliacoesRecebidas[Number(el.dataset.i)].resposta = txt.trim();
        Conquistas.registrar('respondeu');
        voltar();
        setTimeout(() => { renderAba(); avisar('Resposta publicada'); }, 220);
        break;
      }
      default: break;
    }
  }

  /* -------------------------------------------------------- apoios */
  function recarregarFiltros() {
    const item = pilha[pilha.length - 1];
    if (tipoFolha === 'filtros' && folhaAberta) {
      folha.querySelector('#folhaConteudo').innerHTML = Telas.filtros();
      const alt = folha.offsetHeight;
      alturaAtual = alt;
    }
    atualizarMapa();
  }

  /* Reconstrói a tela IMEDIATAMENTE ABAIXO do topo da pilha. É o que faz o
     perfil já mostrar a avaliação recém-publicada quando a pessoa volta. */
  function recarregarAbaixo() {
    const abaixo = pilha[pilha.length - 2];
    const topo = pilha[pilha.length - 1];
    if (!abaixo) return;
    const rolagem = (abaixo.el.querySelector('.rolar') || {}).scrollTop || 0;
    const novo = elementoDe(construir(abaixo.nome, abaixo.params));
    novo.className = abaixo.el.className;
    novo.style.transform = abaixo.el.style.transform;
    abaixo.el.replaceWith(novo);
    abaixo.el = novo;
    if (topo && topo.veu) novo.appendChild(topo.veu);
    depoisDeMontar(abaixo.nome, abaixo.params, novo);
    const r = novo.querySelector('.rolar');
    if (r) r.scrollTop = rolagem;
  }

  function recarregarAssistente() {
    const item = pilha[pilha.length - 1];
    if (!item || item.nome !== 'assistente') return;
    const novo = elementoDe(Telas.assistente());
    novo.style.transform = item.el.style.transform;
    novo.className = item.el.className;   // preserva tela--empilhada (a sombra da borda)
    item.el.replaceWith(novo);
    item.el = novo;
    if (!Fisica.menosMovimento()) {
      novo.querySelector('#corpoPasso').animate(
        [{ opacity: 0, transform: 'translateX(14px)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(.22,.61,.36,1)' });
    }
    montarMinimapas(novo);
  }

  function recarregarPasso() {
    const cx = document.getElementById('corpoPasso');
    if (!cx) return;
    cx.innerHTML = Telas.passo(E.passo);
    montarMinimapas(cx);
  }

  function validarPasso(n) {
    const P = E.perfil;
    if (n === 0 && !P.nome.trim()) return 'Escreva o seu nome de atendimento.';
    if (n === 1 && !P.bairro.trim()) return 'Informe ao menos o bairro.';
    if (n === 2 && P.terapias.size === 0) return 'Marque pelo menos uma terapia.';
    if (n === 3 && P.servicos.length === 0) return 'Cadastre pelo menos um serviço com valor.';
    // n === 4 (Seu espaço) não valida nada: foto é convite, não obrigação.
    if (n === 5 && P.horarios.length === 0) return 'Marque pelo menos um dia de atendimento.';
    if (n === 6 && !P.whatsapp.trim()) return 'O WhatsApp é obrigatório — é por ele que a cliente te chama.';
    return null;
  }

  /* A avaliação da pessoa entra na lista da terapeuta e recalcula a nota,
     igual ao app real: a média nunca é escrita à mão. */
  function aplicarAvaliacao(id) {
    const t = Dados.porId(id);
    const minha = E.minhasAvaliacoes[id];
    removerAvaliacao(id, false);
    t.avaliacoes.unshift({ autor: E.nomeUsuario === 'Você' ? 'Você' : E.nomeUsuario, nota: minha.nota, dias: 0, texto: minha.texto, minha: true });
    recalcular(t);
  }
  function removerAvaliacao(id, recalc = true) {
    const t = Dados.porId(id);
    t.avaliacoes = t.avaliacoes.filter((a) => !a.minha);
    if (recalc) recalcular(t);
  }
  function recalcular(t) {
    const notas = t.avaliacoes.map((a) => a.nota);
    t.total = notas.length;
    t.nota = notas.length ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10 : 0;
    atualizarMapa();
  }

  /* Dentro do app Android, `window.open` não abre nada: o WebView não tem
     janela para abrir. Quem sabe conversar com o WhatsApp do celular é o
     Android, e ele expõe uma ponte de uma função só. No navegador, aba nova. */
  /* Diz ao app Android se o fundo sob a barra de status esta claro. No
     navegador nao existe ponte e a chamada simplesmente nao acontece. */
  function fundoClaro(claro) {
    if (window.PonteAndroid && typeof PonteAndroid.fundoClaro === 'function') {
      try { PonteAndroid.fundoClaro(claro); } catch (_) {}
    }
  }

  function abrirFora(url) {
    if (window.PonteAndroid && typeof PonteAndroid.abrirFora === 'function') {
      PonteAndroid.abrirFora(url);
      return;
    }
    window.open(url, '_blank', 'noopener');
  }

  /* O botão VOLTAR do Android pergunta isto antes de fechar o app. Devolve
     true se havia para onde voltar — fechar no meio de um fluxo é a maior
     irritação de app feito em WebView. */
  function voltarSePuder() {
    if (folhaAberta) { fecharFolha(); return true; }
    if (pilha.length > 1) { voltar(); return true; }
    return false;
  }

  function reiniciar() { window.location.reload(); }

  /* ==================================================== inicialização */
  /* Publicado como Artifact, a página não tem <head> nosso — e o iPhone lê o
     <head> no instante do "Adicionar à Tela de Início". Por isso as tags são
     penduradas por código: assim valem no arquivo local E no link. */
  function prepararCabeca() {
    const por = (sel, criar) => { if (!document.querySelector(sel)) document.head.appendChild(criar()); };

    // Sem viewport o celular renderiza como desktop e a moldura sai errada
    por('meta[name="viewport"]', () => {
      const m = document.createElement('meta');
      m.name = 'viewport';
      m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      return m;
    });

    // Abre em tela cheia, sem a barra do Safari, quando salvo na tela de início
    [['apple-mobile-web-app-capable', 'yes'],
     ['mobile-web-app-capable', 'yes'],
     ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
     ['apple-mobile-web-app-title', 'Mapa Holístico'],
     ['theme-color', '#5B3E8E']].forEach(([nome, valor]) => {
      por(`meta[name="${nome}"]`, () => {
        const m = document.createElement('meta');
        m.name = nome; m.content = valor;
        return m;
      });
    });

    // O ícone do atalho. Sem ele o iPhone usa uma miniatura da página.
    if (typeof ICONE_APP === 'string') {
      por('link[rel="apple-touch-icon"]', () => {
        const l = document.createElement('link');
        l.rel = 'apple-touch-icon'; l.href = ICONE_APP;
        return l;
      });
      por('link[rel="icon"]', () => {
        const l = document.createElement('link');
        l.rel = 'icon'; l.type = 'image/png'; l.href = ICONE_APP;
        return l;
      });
    }
  }

  function iniciar() {
    prepararCabeca();

    /* A conquista aparece na TELA sempre. O aviso de SISTEMA — o que toca e
       acende o bloqueio — passa pela política: silêncio à noite e no máximo
       3 por sessão. "Inteligente" é isso: o canal continuar valendo algo. */
    Conquistas.definirReacao((c, politica) => {
      setTimeout(() => avisar(`Conquista: ${c.nome} 🏆`, c.icone), 600);
      if (politica.pode && window.PonteAndroid && typeof PonteAndroid.notificar === 'function') {
        try { PonteAndroid.notificar('Conquista: ' + c.nome, c.descricao); } catch (_) {}
      }
    });

    app = document.getElementById('app');
    pilhaEl = document.getElementById('pilha');
    bordaVoltar = document.getElementById('bordaVoltar');

    ligarPressao();
    ligarAcoes();
    ligarBordaVoltar();
    relogioDaStatusBar();

    abrir('entrar');
    aplicarProgresso(1);
    if (transicao) transicao.fixa(1);

    // A abertura sai de cena revelando a tela de entrada por baixo
    const splash = document.getElementById('splash');
    // Enquanto a abertura violeta esta na tela, a barra de status precisa de
    // icone CLARO; depois, o app e creme e o icone tem de virar escuro.
    fundoClaro(false);
    const sair = () => {
      fundoClaro(true);
      if (Fisica.menosMovimento()) { splash.remove(); return; }
      const a = splash.animate(
        [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.06)' }],
        { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)' });
      a.onfinish = () => splash.remove();
    };
    // 1900 e não 1500: o desabrochar termina ~940ms e o título ~1100ms —
    // sair a 1500 cortava o momento no meio. Movimento reduzido não espera
    // nada disso: o `sair` remove na hora.
    setTimeout(sair, Fisica.menosMovimento() ? 900 : 1900);

    if (!Fisica.menosMovimento()) {
      /* A flor DESABROCHA em vez de o bloco inteiro surgir de uma vez.
         Coreografia com ordem de leitura: pétala do meio → pares de fora →
         base → título → subtítulo. Cada pétala nasce fechada (rotação 0, por
         cima da central) e gira até o ângulo dela — o ângulo final vem do
         próprio atributo `transform`, então mudar o desenho não quebra a
         animação. Ao terminar, o CSS devolve o controle ao atributo: mesmo
         valor, nenhum salto. */
      const suave = 'cubic-bezier(.2,.9,.3,1)';
      /* As pétalas giram pelo ATRIBUTO `rotate(a 32 46)` — o mesmo espaço de
         unidades do desenho. Girar por CSS transform aqui quebrava: o
         transform-origin em px não era lido em unidades do viewBox e as
         pétalas varriam para fora do quadro, viravam fragmentos cortados
         (medido em foto na bancada, aos 520ms). */
      const saidaCubica = (t) => 1 - Math.pow(1 - t, 3);
      splash.querySelectorAll('.lotus path').forEach((petala) => {
        const m = /rotate\((-?\d+(?:\.\d+)?)/.exec(petala.getAttribute('transform') || '');
        const alvo = m ? Number(m[1]) : 0;
        const opacidade = Number(petala.getAttribute('opacity') || 1);
        const atraso = Math.abs(alvo) * 3.2, dur = 700;
        petala.style.opacity = '0';
        const inicio = performance.now() + atraso;
        const quadro = (agora) => {
          const t = Math.min(1, Math.max(0, (agora - inicio) / dur));
          const e = saidaCubica(t);
          petala.setAttribute('transform', `rotate(${alvo * e} 32 46)`);
          petala.style.opacity = String(opacidade * Math.min(1, e * 1.6));
          if (t < 1) requestAnimationFrame(quadro);
          else { petala.style.opacity = ''; }   // o atributo volta a mandar
        };
        requestAnimationFrame(quadro);
      });
      const base = splash.querySelector('.lotus ellipse');
      if (base) base.animate([{ opacity: 0 }, { opacity: 0.3 }],
        { duration: 500, delay: 420, easing: 'ease-out', fill: 'backwards' });

      const surgir = (sel, atraso) => {
        const el = splash.querySelector(sel);
        if (el) el.animate(
          [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
          { duration: 600, delay: atraso, easing: suave, fill: 'backwards' });
      };
      surgir('h1', 380);
      surgir('p', 500);

      splash.querySelector('.splash__aura').animate(
        [{ transform: 'scale(0.7)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1 }],
        { duration: 1600, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    }
  }

  function relogioDaStatusBar() {
    const el = document.getElementById('horaStatus');
    if (!el) return;
    const pintar = () => {
      const d = Dados.agora();
      el.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };
    pintar();
    setInterval(pintar, 20000);
  }

  // `mapa` fica exposto para a bancada conseguir trazer um pino para a área
  // visível antes de tocá-lo — que é o que a pessoa faz arrastando.
  return { iniciar, abrir, voltar, voltarSePuder, avisar, renderAba, trocarAba, abrirFora, get mapa() { return mapaCtrl; } };
})();

/* `const App` vive no escopo do script, NAO em `window`. Quem chama de fora
   (o app Android, uma bancada) precisa de um nome estavel — este. */
window.App = App;
window.Dados = Dados;

document.addEventListener('DOMContentLoaded', App.iniciar);
