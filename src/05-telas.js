/* ============================================================================
   05-telas.js — o HTML de cada tela e de cada peça reaproveitada
   Só renderização. Quem decide o que mostrar é o 06-app.js; quem guarda o
   que mostrar é o 03-dados.js.
   ========================================================================= */
const Telas = (() => {

  /* Texto que veio de campo digitado nunca entra cru no HTML. */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------ ícones */
  // Traço fino e arredondado (Lucide), como pede o arquivo 05.
  const T = { fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const svg = (d, tam = 24, extra = '') =>
    `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra} aria-hidden="true">${d}</svg>`;

  const ICONES = {
    busca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    lista: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    mapa: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>',
    coracao: '<path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/>',
    usuario: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    setaEsq: '<path d="m14.5 5-6.2 7 6.2 7"/>',
    setaDir: '<path d="m9.5 5 6.2 7-6.2 7"/>',
    setaBaixo: '<path d="m5 9.5 7 6.2 7-6.2"/>',
    fechar: '<path d="m6 6 12 12M18 6 6 18"/>',
    local: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    relogio: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.4V12l3 1.8"/>',
    zap: '<path d="M4 20l1.3-3.9A7.7 7.7 0 1 1 8.2 19L4 20Z"/><path d="M9 10.4c.3 1.2 1.1 2.3 2.2 3 .8.5 1.7.8 2.4.7l.9-1.4 1.7 1-.8 1.4c-.7.6-1.9.6-3.1.1a8.4 8.4 0 0 1-4.4-4.6c-.4-1.1-.3-2.1.2-2.7l1.4-.8 1 1.7-1.5.9Z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4.6"/><circle cx="12" cy="12" r="3.4"/><circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" stroke="none"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    menos: '<path d="M5 12h14"/>',
    lixo: '<path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7M6.5 7l.8 12.1A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>',
    lapis: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m15 7 2.9 2.9"/>',
    bandeira: '<path d="M5.5 21V4.5h10L14 8l1.5 3.5h-10"/>',
    google: '',
    celular: '<rect x="6.5" y="3" width="11" height="18" rx="2.6"/><path d="M11 18h2"/>',
    escudo: '<path d="M12 3.5 5.5 6v5.5c0 4 2.7 7.4 6.5 9 3.8-1.6 6.5-5 6.5-9V6L12 3.5Z"/><path d="m9.4 11.8 1.9 1.9 3.6-3.6"/>',
    olho: '<path d="M2.8 12S6.5 6.2 12 6.2 21.2 12 21.2 12 17.5 17.8 12 17.8 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    grafico: '<path d="M4 20V10M10 20V5M16 20v-7M22 20H2"/>',
    mira: '<circle cx="12" cy="12" r="6.4"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M12 2.2v2.6M12 19.2v2.6M21.8 12h-2.6M4.8 12H2.2"/>',
    dinheiro: '<path d="M12 4v16"/><path d="M15.6 7.6A3 3 0 0 0 13 6h-1.6a2.6 2.6 0 0 0 0 5.2h1.2a2.7 2.7 0 0 1 0 5.4H11a3 3 0 0 1-2.6-1.5"/>',
    calendario: '<rect x="3.8" y="5.2" width="16.4" height="15" rx="2.6"/><path d="M3.8 9.8h16.4M8.5 3.5v3.4M15.5 3.5v3.4"/>',
    saida: '<path d="M14 8V5.5A1.5 1.5 0 0 0 12.5 4h-6A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20h6a1.5 1.5 0 0 0 1.5-1.5V16"/><path d="M10 12h9m0 0-2.8-2.8M19 12l-2.8 2.8"/>',
    info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.2M12 7.9v.2"/>',
    cadeado: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.4"/><path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5"/>',
    servico: '<path d="M6 4.5h12M6 12h12M6 19.5h12"/>',
    casa: '<path d="m4 10.5 8-6.2 8 6.2V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z"/>',
  };

  const ic = (nome, tam = 24, extra = '') => svg(ICONES[nome] || '', tam, extra);

  /* Logo do Google, em cor — precisa das quatro cores para ser reconhecível */
  const logoGoogle = `<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.34-.17-1.97H12v3.73h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.98-4.3 2.98-7.28Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.6A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.82V7.48H3.06a10 10 0 0 0 0 9.02l3.34-2.6Z"/>
    <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.98 14.7 2 12 2A10 10 0 0 0 3.06 7.48l3.34 2.6C7.2 7.72 9.4 5.96 12 5.96Z"/>
  </svg>`;

  /* Flor de lótus — o símbolo da marca (arquivo 05).
     Cinco pétalas separadas por ângulo e por opacidade: em bloco único elas
     se fundem e o desenho vira uma gota. */
  const PETALA = 'M32 9 C25.2 19.5 23 32 25.8 44.4 C27.8 48.2 36.2 48.2 38.2 44.4 C41 32 38.8 19.5 32 9 Z';
  function lotus(tam = 76, cor = '#fff') {
    const petala = (ang, op) => `<path d="${PETALA}" transform="rotate(${ang} 32 46)" opacity="${op}"/>`;
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 64 64" fill="${cor}" aria-hidden="true">
      ${petala(-74, 0.42)}${petala(74, 0.42)}
      ${petala(-38, 0.68)}${petala(38, 0.68)}
      ${petala(0, 1)}
      <ellipse cx="32" cy="49.5" rx="14.5" ry="3.6" opacity="0.3"/>
    </svg>`;
  }

  /* ----------------------------------------------------------- avatar */
  // Sem foto real: um monograma sobre gradiente próprio de cada pessoa.
  // Determinístico — a mesma terapeuta tem sempre a mesma cor.
  function avatar(t, tam = 56) {
    const h = t.tom ?? 268;
    const id = `g${t.id || 'x'}${tam}`;
    return `<div class="avatar" style="width:${tam}px;height:${tam}px">
      <svg viewBox="0 0 100 100" width="${tam}" height="${tam}" aria-hidden="true">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${h} 46% 78%)"/>
          <stop offset="100%" stop-color="hsl(${(h + 26) % 360} 40% 60%)"/>
        </linearGradient></defs>
        <rect width="100" height="100" fill="url(#${id})"/>
        <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
              font-family="Fraunces, Georgia, serif" font-size="${tam > 70 ? 36 : 38}" font-weight="600"
              fill="rgba(255,255,255,0.94)" letter-spacing="0.5">${esc(t.iniciais || '?')}</text>
      </svg>
    </div>`;
  }

  /* ---------------------------------------------------------- estrelas */
  const estrelaCheia = '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" fill="currentColor" stroke="none"/>';
  const estrelaMeia = `<defs><linearGradient id="meia"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs>
    <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" fill="url(#meia)" stroke="currentColor" stroke-width="1.4"/>`;
  const estrelaVazia = '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9L12 3.6Z" fill="none" stroke="currentColor" stroke-width="1.4"/>';

  function estrelas(nota, grande = false) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += svg(nota >= i ? estrelaCheia : (nota >= i - 0.5 ? estrelaMeia : estrelaVazia), grande ? 21 : 15);
    }
    return `<span class="estrelas${grande ? ' estrelas--g' : ''}" role="img" aria-label="${nota} de 5 estrelas">${s}</span>`;
  }

  /* -------------------------------------------------- peças reutilizadas */
  /* "Bom Fim, Porto Alegre · 1,4 km" vira "Bom Fim · 1,4 km" quando a cidade
     é a mesma de quem está olhando — a cidade só informa quando é OUTRA. */
  function ondeFica(t) {
    const cidade = t.cidade !== Dados.EU.cidade ? ', ' + esc(t.cidade) : '';
    return `${esc(t.bairro)}${cidade} · ${Dados.distancia(t.distanciaKm)}`;
  }

  function selo(t) {
    const aberta = Dados.estaAberta(t);
    if (aberta) return `<span class="etiqueta etiqueta--aberta">${ic('relogio', 13)} Aberta agora</span>`;
    const prox = Dados.proximaAbertura(t);
    const quando = !prox ? 'Sem horário cadastrado'
      : prox.emDias === 0 ? `Abre hoje às ${prox.abre}`
      : prox.emDias === 1 ? `Abre amanhã às ${prox.abre}`
      : `Abre ${Dados.DIAS[prox.dia].toLowerCase()} às ${prox.abre}`;
    return `<span class="etiqueta etiqueta--fechada">${ic('relogio', 13)} ${quando}</span>`;
  }

  function cabecalho(titulo, op = {}) {
    return `<header class="cabecalho ${op.vidro ? 'cabecalho--vidro' : ''}">
      <div class="cabecalho__linha">
        ${op.semVoltar ? '' : `<button class="redondo redondo--nu" data-a="voltar" aria-label="Voltar">${ic('setaEsq', 22)}</button>`}
        <div class="cabecalho__titulo"><h2 class="d3">${esc(titulo)}</h2>${op.sub ? `<p class="pequeno dim">${esc(op.sub)}</p>` : ''}</div>
        ${op.acao || ''}
      </div>
      ${op.extra || ''}
    </header>`;
  }

  /* Cartão de terapeuta usado na lista, nas favoritas e na busca */
  function cartaoTerapeuta(t) {
    const fav = Dados.estado.favoritos.has(t.id);
    return `<article class="cartao mb12" data-a="abrirPerfil" data-id="${t.id}" role="button" tabindex="0">
      <div class="linha" style="align-items:flex-start">
        ${avatar(t, 60)}
        <div class="cresce">
          <div class="entre" style="align-items:flex-start">
            <div class="cresce">
              <h3 class="t1">${esc(t.nome)}${t.verificada ? ` <span class="so-leitor">(verificada)</span>` : ''}</h3>
              <p class="pequeno dim">${ondeFica(t)}</p>
            </div>
            <button class="redondo redondo--nu" data-a="favoritar" data-id="${t.id}" aria-label="${fav ? 'Remover das favoritas' : 'Favoritar'}" aria-pressed="${fav}" style="width:36px;height:36px;color:${fav ? 'var(--alerta)' : 'var(--texto-3)'}">
              ${svg(ICONES.coracao, 21, fav ? 'fill="currentColor"' : '')}
            </button>
          </div>
          <div class="linha gap6 mt4">
            ${estrelas(t.nota)}
            <span class="pequeno tab-num"><b>${t.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</b> <span class="dim">(${t.total})</span></span>
            ${t.verificada ? `<span class="etiqueta etiqueta--verificada" style="padding:2px 8px;font-size:0.72rem">${ic('escudo', 12)} Verificada</span>` : ''}
          </div>
        </div>
      </div>
      <div class="enrola mt12">
        ${t.terapias.slice(0, 3).map((x) => `<span class="etiqueta">${esc(x)}</span>`).join('')}
      </div>
      <div class="entre mt12">
        ${selo(t)}
        <span class="pequeno tab-num"><b>${Dados.brl(t.precoMin)}</b><span class="dim"> a ${Dados.brl(t.precoMax)}</span></span>
      </div>
    </article>`;
  }

  /* ==========================================================================
     FLUXO COMUM
     ====================================================================== */

  function entrar() {
    return `<div class="tela" data-tela="entrar">
      <div class="entrada">
        <div class="entrada__meio">
          <div class="lotus" style="color:var(--violeta)">${lotus(88, 'currentColor')}</div>
          <h1 class="d1 equilibra">Que bom ter você aqui 💜</h1>
          <p class="corpo dim mt12 equilibra" style="max-width:30ch;margin-inline:auto">Entre para ver as terapeutas que atendem perto de você.</p>
          <div class="mt24" style="text-align:left">
            <button class="btn btn--bloco btn--contorno mb12" data-a="entrarGoogle">${logoGoogle} Continuar com Google</button>
            <button class="btn btn--bloco btn--secundario" data-a="entrarCelular">${ic('celular', 21)} Continuar com celular</button>
          </div>
        </div>
        <p class="pequeno dim centro entrada__rodape" style="line-height:1.6">
          Ao continuar, você concorda com os
          <a href="#" data-a="verTermos"><b>Termos de uso</b></a> e a
          <a href="#" data-a="verPrivacidade"><b>Política de privacidade</b></a>.
          O app é para maiores de 18 anos.
        </p>
      </div>
    </div>`;
  }

  function codigo() {
    const num = Dados.estado.celular || '(51) 9 9999-0000';
    return `<div class="tela" data-tela="codigo">
      ${cabecalho('', { })}
      <div class="rolar pl pr">
        <h1 class="d2 equilibra">Digite o código</h1>
        <p class="corpo dim mt8">Enviamos um código de 6 dígitos por WhatsApp para <b>${esc(num)}</b>.</p>
        <div class="linha gap6 mt24" style="justify-content:space-between" id="cxCodigo">
          ${[0, 1, 2, 3, 4, 5].map((i) => `
            <input class="digito" inputmode="numeric" maxlength="1" aria-label="Dígito ${i + 1}" data-i="${i}"
              style="width:46px;height:58px;text-align:center;font-size:1.5rem;font-weight:800;background:#fff;border-radius:14px;box-shadow:inset 0 0 0 1.5px var(--linha)">
          `).join('')}
        </div>
        <p class="pequeno dim centro mt16" id="reenvio">Reenviar em <b class="tab-num">30</b>s</p>
        <p class="pequeno centro mt24" style="color:var(--violeta)">Protótipo: qualquer código de 6 dígitos entra.</p>
      </div>
      <div class="rodape-fixo">
        <button class="btn btn--bloco" data-a="confirmarCodigo" disabled id="btnCodigo">Confirmar</button>
      </div>
    </div>`;
  }

  function telefone() {
    return `<div class="tela" data-tela="telefone">
      ${cabecalho('')}
      <div class="rolar pl pr">
        <h1 class="d2 equilibra">Qual é o seu celular?</h1>
        <p class="corpo dim mt8 mb24">Vamos mandar um código para confirmar que é você. Sem senha para decorar.</p>
        <label class="campo">
          <span class="campo__rot">Número com DDD</span>
          <span class="campo__cx">
            <span class="dim" style="font-weight:800">+55</span>
            <input id="campoTel" inputmode="numeric" placeholder="(51) 9 9999-0000" autocomplete="tel">
          </span>
        </label>
      </div>
      <div class="rodape-fixo">
        <button class="btn btn--bloco" data-a="enviarCodigo">Enviar código</button>
      </div>
    </div>`;
  }

  function papel() {
    return `<div class="tela" data-tela="papel">
      <div class="rolar" style="padding: calc(var(--topo) + 26px) 22px 0">
        <h1 class="d2 equilibra">Como você vai usar o app?</h1>
        <p class="corpo dim mt8 mb24">Dá para mudar depois nas configurações da conta.</p>

        <button class="cartao-escolha mb12" data-a="escolherPapel" data-papel="cliente">
          <div class="linha">
            <div style="width:52px;height:52px;border-radius:16px;background:var(--violeta-fundo);color:var(--violeta);display:grid;place-items:center;flex:none">${ic('busca', 26)}</div>
            <div class="cresce">
              <h3 class="t1">Quero encontrar terapeutas</h3>
              <p class="pequeno dim mt4">Ver quem atende perto de mim, comparar valores e falar direto no WhatsApp.</p>
            </div>
          </div>
        </button>

        <button class="cartao-escolha" data-a="escolherPapel" data-papel="terapeuta">
          <div class="linha">
            <div style="width:52px;height:52px;border-radius:16px;background:var(--dourado-fundo);color:#8A6C25;display:grid;place-items:center;flex:none">${ic('local', 26)}</div>
            <div class="cresce">
              <h3 class="t1">Sou terapeuta e quero atender</h3>
              <p class="pequeno dim mt4">Montar meu perfil, aparecer no mapa da minha região e receber clientes.</p>
            </div>
          </div>
        </button>
      </div>
    </div>`;
  }

  function localizacao() {
    return `<div class="tela" data-tela="localizacao">
      <div class="rolar" style="padding: calc(var(--topo) + 20px) 26px 0; text-align:center">
        <div style="margin:14px auto 0;width:150px;height:150px;border-radius:50%;background:var(--violeta-fundo);display:grid;place-items:center;color:var(--violeta)">
          ${ic('local', 68)}
        </div>
        <h1 class="d2 mt24 equilibra">Onde você está?</h1>
        <p class="corpo dim mt12 equilibra" style="max-width:32ch;margin-inline:auto">
          Para mostrar as terapeutas pertinho de você, precisamos da sua localização.
          Ela não fica salva — usamos só para montar o seu mapa.
        </p>
        <div class="cartao cartao--plano mt24" style="text-align:left">
          <div class="linha" style="align-items:flex-start">
            <span style="color:var(--sucesso);flex:none">${ic('cadeado', 20)}</span>
            <p class="pequeno dim">Sua posição é usada só na hora da busca e nunca é gravada no nosso banco de dados. Você pode desligar isso quando quiser.</p>
          </div>
        </div>
      </div>
      <div class="rodape-fixo" style="flex-direction:column;align-items:stretch">
        <button class="btn btn--bloco" data-a="permitirLocal">Permitir localização</button>
        <button class="btn btn--bloco btn--fantasma" data-a="escolherCidade">Agora não, escolher cidade</button>
      </div>
    </div>`;
  }

  function cidades() {
    const lista = ['Porto Alegre', 'Canoas', 'Cachoeirinha', 'Gravataí', 'Viamão', 'Alvorada', 'São Leopoldo', 'Novo Hamburgo'];
    return `<div class="tela" data-tela="cidades">
      ${cabecalho('Escolher cidade', { sub: 'Sem localização, tudo funciona igual' })}
      <div class="rolar pl pr">
        ${lista.map((c) => `
          <button class="cartao cartao--plano mb8" style="width:100%;text-align:left" data-a="definirCidade" data-cidade="${c}">
            <div class="entre">
              <span class="t2">${c}</span>
              <span class="dim2">${ic('setaDir', 18)}</span>
            </div>
          </button>`).join('')}
      </div>
    </div>`;
  }

  /* ==========================================================================
     LADO DA CLIENTE
     ====================================================================== */

  function raizCliente() {
    return `<div class="tela tela--raiz" data-tela="raiz">
      <div class="raiz__conteudo" id="conteudoAba"></div>
      ${barraAbas()}
    </div>`;
  }

  function barraAbas() {
    const a = Dados.estado.aba;
    const favs = Dados.estado.favoritos.size;
    const item = (id, nome, icone, conta) => `
      <button class="aba" data-a="aba" data-aba="${id}" aria-selected="${a === id}" role="tab">
        ${ic(icone, 24)}
        <span>${nome}</span>
        ${conta ? `<span class="aba__conta">${conta}</span>` : ''}
      </button>`;
    return `<nav class="abas" role="tablist">
      ${item('mapa', 'Mapa', 'mapa')}
      ${item('favoritas', 'Favoritas', 'coracao', favs)}
      ${item('conta', 'Minha conta', 'usuario')}
    </nav>`;
  }

  /* --- aba mapa ---------------------------------------------------------- */
  function abaMapa() {
    return `
      <div class="mapa" id="mapa">
        <div class="mapa__mundo" id="mundo" style="--z:1;width:${Dados.MUNDO.largura}px;height:${Dados.MUNDO.altura}px">
          ${Mapa.gerarSVG()}
          ${Mapa.rotulos()}
          <div id="pins">${pinsHTML()}</div>
          <div class="eu" style="left:${Dados.EU.x}px;top:${Dados.EU.y}px">
            <div class="eu__halo"></div><div class="eu__nucleo"></div>
          </div>
        </div>
      </div>
      <div class="mapa__topo">
        ${barraBusca()}
        ${chipsFiltro()}
      </div>
      <div class="flutuantes flutuantes--dir" id="flutuantes">
        <button class="redondo redondo--vidro" data-a="recentrar" aria-label="Centralizar em mim">${ic('mira', 21)}</button>
        <button class="redondo redondo--vidro" data-a="modoLista" aria-label="Ver em lista">${ic('lista', 21)}</button>
      </div>
      <div class="folha" id="folha" hidden aria-live="polite" style="bottom:calc(var(--altura-tab) + var(--base))">
        <div class="folha__alca" id="alca"><i></i></div>
        <div class="folha__conteudo" id="folhaConteudo"></div>
      </div>`;
  }

  function pinsHTML() {
    const visiveis = new Set(Dados.listar().map((t) => t.id));
    return Dados.TERAPEUTAS.filter((t) => t.ativa).map((t) => {
      const aberta = Dados.estaAberta(t);
      const fora = !visiveis.has(t.id);
      return `<button class="pin ${aberta ? '' : 'pin--fechada'}" data-id="${t.id}" data-sel="0"
        style="left:${t.x}px;top:${t.y}px;${fora ? 'opacity:.22;pointer-events:none' : ''}"
        aria-label="${esc(t.nome)}, nota ${t.nota}">
        <span class="pin__anel"></span>
        <svg class="pin__corpo" viewBox="0 0 46 56" width="46" height="56" aria-hidden="true">
          <path class="pin__forma" d="M23 55C23 55 43 36.5 43 21.5 43 10.2 34.05 1 23 1S3 10.2 3 21.5C3 36.5 23 55 23 55Z" fill="var(--violeta)"/>
          <circle cx="23" cy="21" r="12.5" fill="#fff"/>
          <text x="23" y="21.6" text-anchor="middle" dominant-baseline="central"
                font-family="Nunito Sans, sans-serif" font-size="12" font-weight="900"
                fill="var(--violeta-escuro)" letter-spacing="-0.4">${t.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</text>
        </svg>
      </button>`;
    }).join('');
  }

  function barraBusca() {
    return `<div class="busca">
      <span class="dim2">${ic('busca', 20)}</span>
      <input id="campoBusca" placeholder="Buscar terapeuta ou terapia" value="${esc(Dados.estado.busca)}" aria-label="Buscar">
      <button class="redondo redondo--nu" data-a="limparBusca" style="width:30px;height:30px" aria-label="Limpar busca" ${Dados.estado.busca ? '' : 'hidden'}>${ic('fechar', 17)}</button>
    </div>`;
  }

  function chipsFiltro() {
    const f = Dados.estado.filtros;
    const n = Dados.filtrosAtivos();
    const chip = (rot, acao, ligado, extra = '') =>
      `<button class="chip" data-a="${acao}" ${extra} aria-pressed="${ligado}">${rot}</button>`;
    return `<div class="chips" id="chips">
      ${chip(`${ic('filtro', 16)} Filtros${n ? `<span class="chip__conta">${n}</span>` : ''}`, 'abrirFiltros', n > 0)}
      ${chip('Aberta agora', 'filtroAberta', f.abertaAgora)}
      ${chip('Apometria', 'filtroTerapia', f.terapias.has('Apometria'), 'data-terapia="Apometria"')}
      ${chip('Reiki', 'filtroTerapia', f.terapias.has('Reiki'), 'data-terapia="Reiki"')}
      ${chip('⭐ 4 ou mais', 'filtroNota', f.notaMin === 4)}
      ${chip('On-line', 'filtroOnline', f.online)}
      ${chip('ThetaHealing', 'filtroTerapia', f.terapias.has('ThetaHealing'), 'data-terapia="ThetaHealing"')}
      ${chip('Barras de Access', 'filtroTerapia', f.terapias.has('Barras de Access'), 'data-terapia="Barras de Access"')}
    </div>`;
  }

  /* --- card resumido (conteúdo da folha) --------------------------------- */
  function folhaResumo(t) {
    const fav = Dados.estado.favoritos.has(t.id);
    return `<div style="padding: 4px 18px 20px">
      <div class="linha" style="align-items:flex-start">
        ${avatar(t, 62)}
        <div class="cresce">
          <div class="entre" style="align-items:flex-start">
            <div class="cresce">
              <h3 class="d3">${esc(t.nome)}</h3>
              <p class="pequeno dim">${ondeFica(t)}</p>
            </div>
            <button class="redondo redondo--nu" data-a="favoritar" data-id="${t.id}" aria-pressed="${fav}"
              aria-label="${fav ? 'Remover das favoritas' : 'Favoritar'}"
              style="color:${fav ? 'var(--alerta)' : 'var(--texto-3)'}">
              ${svg(ICONES.coracao, 23, fav ? 'fill="currentColor"' : '')}
            </button>
          </div>
          <div class="linha gap6 mt4">
            ${estrelas(t.nota)}
            <span class="pequeno tab-num"><b>${t.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</b> <span class="dim">(${t.total} avaliações)</span></span>
          </div>
        </div>
      </div>

      <div class="enrola mt12">
        ${t.terapias.map((x) => `<span class="etiqueta">${esc(x)}</span>`).join('')}
        ${t.atendimento.includes('online') ? `<span class="etiqueta etiqueta--online">On-line</span>` : ''}
      </div>

      <div class="entre mt12">
        ${selo(t)}
        <span class="pequeno tab-num"><b>${Dados.brl(t.precoMin)}</b><span class="dim"> a ${Dados.brl(t.precoMax)}</span></span>
      </div>

      <button class="btn btn--bloco mt16" data-a="abrirPerfil" data-id="${t.id}">Ver perfil</button>
    </div>`;
  }

  /* --- perfil completo --------------------------------------------------- */
  function perfil(t) {
    const fav = Dados.estado.favoritos.has(t.id);
    const minha = Dados.estado.minhasAvaliacoes[t.id];
    const dist = Dados.distribuicao(t);
    const hoje = Dados.agora().getDay();

    return `<div class="tela" data-tela="perfil">
      <div class="rolar" id="rolarPerfil">
        <!-- capa -->
        <div style="position:relative;height:198px;overflow:hidden;background:linear-gradient(150deg, hsl(${t.tom} 44% 72%), hsl(${(t.tom + 28) % 360} 38% 52%))">
          <div style="position:absolute;inset:0;background:radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,.35), transparent 60%)"></div>
          <div style="position:absolute;right:-26px;top:-18px;opacity:.16;pointer-events:none">${lotus(190)}</div>
          <div class="linha" style="position:absolute;top:calc(var(--topo) + 2px);left:14px;right:14px;justify-content:space-between">
            <button class="redondo redondo--vidro" data-a="voltar" aria-label="Voltar">${ic('setaEsq', 22)}</button>
            <div class="linha gap6">
              <button class="redondo redondo--vidro" data-a="denunciar" data-id="${t.id}" aria-label="Denunciar perfil">${ic('bandeira', 20)}</button>
              <button class="redondo redondo--vidro" data-a="favoritar" data-id="${t.id}" aria-pressed="${fav}"
                aria-label="${fav ? 'Remover das favoritas' : 'Favoritar'}" style="color:${fav ? 'var(--alerta)' : 'var(--texto)'}">
                ${svg(ICONES.coracao, 22, fav ? 'fill="currentColor"' : '')}
              </button>
            </div>
          </div>
          <div style="position:absolute;left:18px;bottom:-34px">
            <div style="border-radius:50%;padding:4px;background:var(--fundo)">${avatar(t, 88)}</div>
          </div>
        </div>

        <div style="padding:44px 18px 0">
          <div class="linha gap6" style="flex-wrap:wrap">
            <h1 class="d2">${esc(t.nome)}</h1>
            ${t.verificada ? `<span class="etiqueta etiqueta--verificada">${ic('escudo', 14)} Verificada</span>` : ''}
          </div>
          <p class="pequeno dim mt4">${esc(t.bairro)}, ${esc(t.cidade)} — ${t.uf} · a ${Dados.distancia(t.distanciaKm)} de você</p>

          <div class="linha gap6 mt12">
            ${estrelas(t.nota, true)}
            <span class="t1 tab-num">${t.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span>
            <span class="pequeno dim">· ${t.total} avaliações</span>
          </div>

          <div class="linha gap6 mt12">${selo(t)}${t.atendimento.includes('online') ? `<span class="etiqueta etiqueta--online">Atende on-line</span>` : ''}</div>

          <p class="corpo mt16">${esc(t.bio)}</p>

          <div class="enrola mt16">${t.terapias.map((x) => `<span class="etiqueta">${esc(x)}</span>`).join('')}</div>
        </div>

        <div class="divisor mt24"></div>

        <!-- serviços e valores -->
        <section class="secao">
          <div class="secao__titulo"><h2 class="d3">Serviços e valores</h2></div>
          ${t.servicos.map((s) => `
            <div class="entre" style="padding:11px 0;border-bottom:1px solid var(--linha);align-items:flex-start">
              <div class="cresce">
                <p class="t2">${esc(s.nome)}</p>
                <p class="pequeno dim">${Dados.duracao(s.duracao)}${s.descricao ? ' · ' + esc(s.descricao) : ''}</p>
              </div>
              <span class="t2 tab-num" style="white-space:nowrap">${Dados.brl(s.valor)}</span>
            </div>`).join('')}
        </section>

        <!-- horários -->
        <section class="secao">
          <div class="secao__titulo"><h2 class="d3">Horários de atendimento</h2></div>
          ${Dados.horariosPorDia(t).map((d) => `
            <div class="entre" style="padding:8px 0;${d.dia === hoje ? 'font-weight:800;color:var(--violeta-escuro)' : ''}">
              <span class="corpo">${Dados.DIAS[d.dia]}${d.dia === hoje ? ' <span class="micro" style="color:var(--violeta)">hoje</span>' : ''}</span>
              <span class="corpo tab-num ${d.faixas.length ? '' : 'dim2'}">${d.faixas.length ? d.faixas.map((f) => `${f.abre} às ${f.fecha}`).join(' · ') : 'Fechada'}</span>
            </div>`).join('')}
        </section>

        <!-- endereço -->
        <section class="secao">
          <div class="secao__titulo"><h2 class="d3">Onde ela atende</h2></div>
          <div class="cartao" style="padding:0;overflow:hidden">
            <div class="minimapa" data-x="${t.x}" data-y="${t.y}" style="height:160px;position:relative;overflow:hidden;background:var(--mapa-solo)"></div>
            <div style="padding:14px">
              <p class="t2">${esc(t.endereco)}</p>
              <p class="pequeno dim mt4">${esc(t.bairro)}, ${esc(t.cidade)} — ${t.uf}</p>
            </div>
          </div>
        </section>

        <!-- avaliações -->
        <section class="secao">
          <div class="secao__titulo">
            <h2 class="d3">Avaliações</h2>
            <button class="btn btn--fantasma btn--pequeno" data-a="avaliar" data-id="${t.id}">${minha ? 'Editar a minha' : 'Avaliar'}</button>
          </div>

          <div class="linha mb16" style="align-items:center;gap:18px">
            <div style="text-align:center;flex:none">
              <div class="d1 tab-num" style="line-height:1">${t.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</div>
              ${estrelas(t.nota)}
              <p class="pequeno dim mt4">${t.total} avaliações</p>
            </div>
            <div class="cresce">
              ${dist.map((q, i) => `
                <div class="linha gap6" style="margin-bottom:4px">
                  <span class="pequeno dim tab-num" style="width:10px">${5 - i}</span>
                  <span class="barra-nota"><i style="width:${t.total ? (q / t.total) * 100 : 0}%"></i></span>
                  <span class="pequeno dim tab-num" style="width:18px;text-align:right">${q}</span>
                </div>`).join('')}
            </div>
          </div>

          ${minha ? `
            <div class="cartao" style="background:var(--violeta-08);box-shadow:none;margin-bottom:12px">
              <div class="entre mb8">
                <span class="micro" style="color:var(--violeta)">Sua avaliação</span>
                <button class="btn btn--fantasma btn--pequeno" data-a="avaliar" data-id="${t.id}" style="min-height:26px;padding:0 6px">Editar</button>
              </div>
              ${estrelas(minha.nota)}
              ${minha.texto ? `<p class="corpo mt8">${esc(minha.texto)}</p>` : ''}
            </div>` : ''}

          ${t.avaliacoes.map((a) => `
            <div class="avaliacao">
              <div class="entre">
                <div class="linha gap6">
                  ${avatar({ id: 'a' + esc(a.autor), tom: (a.autor.charCodeAt(0) * 7) % 360, iniciais: a.autor[0] }, 34)}
                  <div>
                    <p class="t2">${esc(a.autor)}</p>
                    <div class="linha gap6">${estrelas(a.nota)}<span class="pequeno dim">${Dados.haQuanto(a.dias)}</span></div>
                  </div>
                </div>
                <button class="redondo redondo--nu" data-a="denunciarAvaliacao" data-autor="${esc(a.autor)}" style="color:var(--texto-3)" aria-label="Denunciar avaliação">${ic('bandeira', 17)}</button>
              </div>
              <p class="corpo mt8">${esc(a.texto)}</p>
              ${a.resposta ? `<div class="resposta"><p class="micro" style="color:var(--violeta)">Resposta de ${esc(t.nome.split(' ')[0])}</p><p class="pequeno mt4">${esc(a.resposta)}</p></div>` : ''}
            </div>`).join('')}
        </section>

        <div style="height:26px"></div>
      </div>

      <!-- rodapé fixo: a ação principal está sempre ao alcance do polegar -->
      <div class="rodape-fixo">
        <button class="redondo" data-a="favoritar" data-id="${t.id}" aria-pressed="${fav}"
          aria-label="${fav ? 'Remover das favoritas' : 'Favoritar'}"
          style="width:52px;height:52px;border-radius:var(--r-m);box-shadow:inset 0 0 0 1.5px var(--linha-forte);color:${fav ? 'var(--alerta)' : 'var(--texto)'}">
          ${svg(ICONES.coracao, 23, fav ? 'fill="currentColor"' : '')}
        </button>
        <button class="btn btn--zap cresce" data-a="whatsapp" data-id="${t.id}">${ic('zap', 21)} Chamar no WhatsApp</button>
      </div>
    </div>`;
  }

  /* --- avaliar ----------------------------------------------------------- */
  function avaliar(t) {
    const minha = Dados.estado.minhasAvaliacoes[t.id] || { nota: 0, texto: '' };
    return `<div class="tela" data-tela="avaliar">
      ${cabecalho('Avaliar', { sub: t.nome })}
      <div class="rolar pl pr">
        <div class="cartao centro">
          <p class="corpo dim mb16">Como foi o seu atendimento?</p>
          <div class="seletor-estrelas" id="seletorEstrelas">
            ${[1, 2, 3, 4, 5].map((n) => `<button data-a="nota" data-n="${n}" data-on="${minha.nota >= n ? 1 : 0}" aria-label="${n} estrelas">${svg(estrelaCheia, 40)}</button>`).join('')}
          </div>
          <p class="t2 mt12" id="rotuloNota">${['Toque para dar sua nota', 'Não recomendo', 'Deixou a desejar', 'Foi bom', 'Muito bom', 'Excelente'][minha.nota]}</p>
        </div>

        <label class="campo mt16">
          <span class="campo__rot">Comentário (opcional)</span>
          <span class="campo__cx" style="align-items:flex-start">
            <textarea id="campoComentario" rows="5" maxlength="1000" placeholder="Conte como foi: o acolhimento, o ambiente, o resultado. Isso ajuda muita gente a escolher.">${esc(minha.texto)}</textarea>
          </span>
          <span class="campo__ajuda">Sua avaliação fica pública com o seu primeiro nome. Ofensas e dados pessoais são removidos pela moderação.</span>
        </label>
      </div>
      <div class="rodape-fixo" style="flex-direction:column;align-items:stretch">
        <button class="btn btn--bloco" data-a="enviarAvaliacao" data-id="${t.id}" ${minha.nota ? '' : 'disabled'} id="btnAvaliar">Publicar avaliação</button>
        ${minha.nota ? `<button class="btn btn--bloco btn--fantasma" data-a="apagarAvaliacao" data-id="${t.id}" style="color:var(--alerta)">Apagar minha avaliação</button>` : ''}
      </div>
    </div>`;
  }

  /* --- lista ------------------------------------------------------------- */
  function abaLista() {
    const r = Dados.listar();
    return `
      <div class="cabecalho cabecalho--vidro" style="padding-bottom:8px">
        ${barraBusca()}
        ${chipsFiltro()}
      </div>
      <div class="rolar" style="padding:14px 18px calc(var(--altura-tab) + var(--base) + 14px)">
        <p class="pequeno dim mb12">${r.length === 1 ? '1 terapeuta encontrada' : `${r.length} terapeutas encontradas`} · da mais perto para a mais longe</p>
        ${r.length ? r.map(cartaoTerapeuta).join('') : vazioBusca()}
      </div>
      <div class="flutuantes flutuantes--dir" style="bottom:calc(var(--altura-tab) + var(--base) + 14px)">
        <button class="redondo redondo--vidro" data-a="modoMapa" aria-label="Ver no mapa">${ic('mapa', 21)}</button>
      </div>`;
  }

  function vazioBusca() {
    return `<div class="vazio">
      <span class="dim2">${ic('busca', 52)}</span>
      <h3 class="t1 equilibra">Ainda não encontramos terapeutas nessa região</h3>
      <p class="corpo dim mt8 equilibra">Tente ampliar a distância, tirar um filtro ou buscar atendimentos on-line.</p>
      <button class="btn btn--secundario mt16" data-a="limparFiltros">Limpar filtros</button>
    </div>`;
  }

  /* --- favoritas --------------------------------------------------------- */
  function abaFavoritas() {
    const ids = Array.from(Dados.estado.favoritos);
    const lista = ids.map(Dados.porId).filter(Boolean).sort((a, b) => a.distanciaKm - b.distanciaKm);
    return `
      ${cabecalho('Favoritas', { semVoltar: true, sub: lista.length ? `${lista.length} salva${lista.length > 1 ? 's' : ''}` : '' })}
      <div class="rolar" style="padding:6px 18px calc(var(--altura-tab) + var(--base) + 14px)">
        ${lista.length ? lista.map(cartaoTerapeuta).join('') : `
          <div class="vazio">
            <span class="dim2">${ic('coracao', 52)}</span>
            <h3 class="t1 equilibra">Nenhuma favorita ainda</h3>
            <p class="corpo dim mt8 equilibra">Toque no coração no perfil de uma terapeuta para guardá-la aqui.</p>
            <button class="btn btn--secundario mt16" data-a="aba" data-aba="mapa">Ir para o mapa</button>
          </div>`}
      </div>`;
  }

  /* --- minha conta ------------------------------------------------------- */
  function abaConta() {
    const e = Dados.estado;
    const rel = e.relogio;
    const linha = (icone, titulo, sub, acao, cor) => `
      <button class="entre" style="width:100%;padding:14px 0;text-align:left;border-bottom:1px solid var(--linha)" ${acao ? `data-a="${acao}"` : ''}>
        <span class="linha">
          <span style="color:${cor || 'var(--violeta)'};flex:none">${ic(icone, 21)}</span>
          <span><span class="t2" style="display:block;${cor ? `color:${cor}` : ''}">${titulo}</span>${sub ? `<span class="pequeno dim">${sub}</span>` : ''}</span>
        </span>
        <span class="dim2">${ic('setaDir', 17)}</span>
      </button>`;

    return `
      ${cabecalho('Minha conta', { semVoltar: true })}
      <div class="rolar" style="padding:6px 18px calc(var(--altura-tab) + var(--base) + 14px)">
        <div class="cartao">
          <div class="linha">
            ${avatar({ id: 'eu', tom: 268, iniciais: 'V' }, 56)}
            <div class="cresce">
              <p class="t1">${esc(e.nomeUsuario)}</p>
              <p class="pequeno dim">${e.entrouPor === 'google' ? 'Entrou com o Google' : `Celular ${esc(e.celular || '')}`}</p>
              <p class="pequeno dim">${e.localizacao === 'concedida' ? `${Dados.EU.bairro}, ${Dados.EU.cidade}` : `Cidade: ${esc(e.cidadeEscolhida || '—')}`}</p>
            </div>
          </div>
        </div>

        <h3 class="micro dim mt24 mb8">Privacidade</h3>
        <div class="cartao" style="padding:0 16px">
          ${linha('local', 'Localização', e.localizacao === 'concedida' ? 'Usada só na busca, nunca gravada' : 'Desligada — usando cidade', 'alternarLocal')}
          ${linha('saida', 'Exportar meus dados', 'Receber uma cópia em e-mail', 'exportar')}
          ${linha('lixo', 'Excluir minha conta', 'Apaga tudo, sem volta', 'excluirConta', 'var(--alerta)')}
        </div>

        <h3 class="micro dim mt24 mb8">Conta</h3>
        <div class="cartao" style="padding:0 16px">
          ${linha('usuario', 'Virar terapeuta', 'Montar meu perfil profissional', 'virarTerapeuta')}
          ${linha('info', 'Termos e privacidade', '', 'verTermos')}
        </div>

        <h3 class="micro dim mt24 mb8">Protótipo</h3>
        <div class="cartao">
          <p class="pequeno dim mb12">Isto não existirá no app real. Serve para testar o selo <b>“Aberta agora”</b> em qualquer dia e hora, sem esperar.</p>
          <div class="entre mb12">
            <span class="t2">Simular data e hora</span>
            <button class="chave" role="switch" aria-checked="${!!rel}" data-a="alternarRelogio" aria-label="Simular data e hora"></button>
          </div>
          ${rel ? `
            <label class="campo" style="margin-bottom:8px">
              <span class="campo__rot">Dia da semana</span>
              <span class="campo__cx"><select id="demoDia" style="flex:1;padding:14px 0;font-size:1rem;font-weight:700;background:none">
                ${Dados.DIAS.map((d, i) => `<option value="${i}" ${rel.dia === i ? 'selected' : ''}>${d}</option>`).join('')}
              </select></span>
            </label>
            <label class="campo" style="margin-bottom:0">
              <span class="campo__rot">Hora</span>
              <span class="campo__cx"><input id="demoHora" type="time" value="${String(rel.hora).padStart(2, '0')}:${String(rel.minuto).padStart(2, '0')}" style="flex:1;padding:14px 0;font-size:1rem;font-weight:700"></span>
            </label>` : ''}
        </div>

        <button class="btn btn--bloco btn--fantasma mt16" data-a="recomecar">Recomeçar o protótipo</button>
      </div>`;
  }

  /* --- filtros (folha) --------------------------------------------------- */
  function filtros() {
    const f = Dados.estado.filtros;
    const precos = [100, 150, 200, 300];
    const notas = [3, 3.5, 4, 4.5];
    return `<div style="padding:2px 18px 18px">
      <div class="entre mb16">
        <h2 class="d3">Filtros</h2>
        <button class="btn btn--fantasma btn--pequeno" data-a="limparFiltros">Limpar tudo</button>
      </div>

      <h3 class="micro dim mb8">Tipo de terapia</h3>
      <div class="enrola mb24">
        ${Dados.TERAPIAS.map((x) => `
          <button class="chip" data-a="filtroTerapia" data-terapia="${esc(x)}" aria-pressed="${f.terapias.has(x)}">${esc(x)}</button>`).join('')}
      </div>

      <h3 class="micro dim mb8">Valor até</h3>
      <div class="enrola mb24">
        ${precos.map((p) => `<button class="chip" data-a="filtroPreco" data-preco="${p}" aria-pressed="${f.precoMax === p}">${Dados.brl(p)}</button>`).join('')}
      </div>

      <h3 class="micro dim mb8">Avaliação mínima</h3>
      <div class="enrola mb24">
        ${notas.map((n) => `<button class="chip" data-a="filtroNotaValor" data-nota="${n}" aria-pressed="${f.notaMin === n}">⭐ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}+</button>`).join('')}
      </div>

      <h3 class="micro dim mb8">Atendimento</h3>
      <div class="enrola mb24">
        <button class="chip" data-a="filtroAberta" aria-pressed="${f.abertaAgora}">Aberta agora</button>
        <button class="chip" data-a="filtroOnline" aria-pressed="${f.online}">Atende on-line</button>
      </div>

      <div class="folha__rodape">
        <button class="btn btn--bloco" data-a="fecharFolha" id="btnAplicar">Ver <b id="contaFiltro">${Dados.listar().length}</b> terapeutas</button>
      </div>
    </div>`;
  }

  /* --- denunciar --------------------------------------------------------- */
  function denunciar(alvo) {
    const motivos = ['Informação falsa ou enganosa', 'Perfil não é de terapeuta', 'Conteúdo ofensivo', 'Promete cura de doença', 'Outro motivo'];
    return `<div class="tela" data-tela="denunciar">
      ${cabecalho('Denunciar', { sub: alvo })}
      <div class="rolar pl pr">
        <p class="corpo dim mb16">Sua denúncia é anônima. Nossa equipe analisa em até 48 horas e o conteúdo pode sair do ar enquanto isso.</p>
        ${motivos.map((m) => `
          <button class="opcao mb8" style="width:100%" data-a="motivoDenuncia" data-motivo="${esc(m)}">
            <span class="opcao__marca">${ic('check', 14)}</span>
            <span class="cresce">${esc(m)}</span>
          </button>`).join('')}
      </div>
      <div class="rodape-fixo">
        <button class="btn btn--bloco" data-a="enviarDenuncia" disabled id="btnDenuncia">Enviar denúncia</button>
      </div>
    </div>`;
  }

  /* ==========================================================================
     LADO DA TERAPEUTA
     ====================================================================== */

  const PASSOS = ['Sobre você', 'Endereço', 'Terapias', 'Serviços', 'Horários', 'Contato'];

  function assistente() {
    const p = Dados.estado.passo;
    return `<div class="tela" data-tela="assistente">
      <header class="cabecalho">
        <div class="cabecalho__linha">
          <button class="redondo redondo--nu" data-a="passoAnterior" aria-label="Voltar">${ic('setaEsq', 22)}</button>
          <div class="cabecalho__titulo">
            <p class="micro dim">Passo ${p + 1} de 6</p>
            <h2 class="d3">${PASSOS[p]}</h2>
          </div>
        </div>
      </header>
      <div class="progresso mb16">${PASSOS.map((_, i) => `<i data-on="${i <= p ? 1 : 0}"></i>`).join('')}</div>
      <div class="rolar pl pr" id="corpoPasso">${passo(p)}</div>
      <div class="rodape-fixo">
        <button class="btn btn--bloco" data-a="proximoPasso" id="btnPasso">${p === 5 ? 'Publicar meu perfil' : 'Continuar'}</button>
      </div>
    </div>`;
  }

  function passo(n) {
    const P = Dados.estado.perfil;
    if (n === 0) return `
      <p class="corpo dim mb24">Estas informações aparecem no topo do seu perfil, do jeito que a cliente vai ver.</p>
      <div class="centro mb24">
        <div style="display:inline-block;position:relative">
          ${avatar({ id: 'novo', tom: P.tom, iniciais: (P.nome || '?').split(' ').filter((x) => x.length > 2).slice(0, 2).map((x) => x[0]).join('') || '?' }, 96)}
          <button class="redondo" data-a="trocarCor" style="position:absolute;right:-4px;bottom:-4px;width:38px;height:38px;color:var(--violeta)" aria-label="Trocar cor da foto">${ic('lapis', 18)}</button>
        </div>
        <p class="pequeno dim mt8">No app real, aqui entra a sua foto.</p>
      </div>
      <label class="campo">
        <span class="campo__rot">Nome de atendimento</span>
        <span class="campo__cx"><input data-campo="nome" value="${esc(P.nome)}" placeholder="Como as clientes te chamam"></span>
      </label>
      <label class="campo">
        <span class="campo__rot">Sua apresentação</span>
        <span class="campo__cx" style="align-items:flex-start"><textarea data-campo="bio" rows="6" maxlength="600" placeholder="Conte a sua formação, há quanto tempo atende e como é uma sessão com você.">${esc(P.bio)}</textarea></span>
        <span class="campo__ajuda">Fale como você falaria com uma cliente na primeira conversa.</span>
      </label>`;

    if (n === 1) return `
      <p class="corpo dim mb16">Digite o endereço e confira o pino no mapa. Você pode arrastá-lo para ajustar.</p>
      <label class="campo">
        <span class="campo__rot">Endereço de atendimento</span>
        <span class="campo__cx"><input data-campo="endereco" value="${esc(P.endereco)}" placeholder="Rua, número e complemento"></span>
      </label>
      <div class="grade-2 mb16">
        <label class="campo" style="margin:0">
          <span class="campo__rot">Bairro</span>
          <span class="campo__cx"><input data-campo="bairro" value="${esc(P.bairro)}" placeholder="Bairro"></span>
        </label>
        <label class="campo" style="margin:0">
          <span class="campo__rot">Cidade</span>
          <span class="campo__cx"><input data-campo="cidade" value="${esc(P.cidade)}" placeholder="Cidade"></span>
        </label>
      </div>
      <div class="cartao" style="padding:0;overflow:hidden">
        <div class="minimapa" id="mapaEndereco" data-arrastavel="1" data-x="${P.x}" data-y="${P.y}" style="height:210px;position:relative;overflow:hidden;background:var(--mapa-solo)"></div>
        <div style="padding:12px 14px">
          <p class="pequeno dim">${ic('info', 14)} Arraste o mapa para posicionar o pino no ponto certo.</p>
        </div>
      </div>
      <div class="cartao cartao--plano mt12">
        <div class="entre">
          <div class="cresce">
            <p class="t2">Mostrar só o bairro</p>
            <p class="pequeno dim mt4">A cliente vê a região e o mapa aproximado, mas não o número da rua.</p>
          </div>
          <button class="chave" role="switch" aria-checked="${!!P.soBairro}" data-a="alternarSoBairro"></button>
        </div>
      </div>
      <div class="cartao cartao--plano mt12" style="background:var(--dourado-fundo);border:0">
        <p class="pequeno" style="color:#7C6221">${ic('info', 14)} Estas informações ficarão <b>visíveis para as clientes</b> no seu perfil público.</p>
      </div>`;

    if (n === 2) return `
      <p class="corpo dim mb16">Marque tudo o que você realiza. Isso define em quais buscas você aparece.</p>
      <div class="enrola">
        ${Dados.TERAPIAS.map((x) => `
          <button class="chip" data-a="perfilTerapia" data-terapia="${esc(x)}" aria-pressed="${P.terapias.has(x)}">${esc(x)}</button>`).join('')}
      </div>
      <p class="pequeno dim mt16">Não achou a sua? Escreva para a gente que incluímos no catálogo.</p>`;

    if (n === 3) return `
      <p class="corpo dim mb16">Valores claros são o que mais faz a cliente entrar em contato. Você pode mudar quando quiser.</p>
      ${P.servicos.map((s, i) => `
        <div class="cartao mb8">
          <div class="entre">
            <div class="cresce">
              <p class="t2">${esc(s.nome)}</p>
              <p class="pequeno dim">${Dados.duracao(s.duracao)} · ${Dados.brl(s.valor)}</p>
            </div>
            <button class="redondo redondo--nu" data-a="removerServico" data-i="${i}" style="color:var(--alerta)" aria-label="Remover">${ic('lixo', 19)}</button>
          </div>
        </div>`).join('')}
      <div class="cartao cartao--plano">
        <p class="micro dim mb8">Novo serviço</p>
        <label class="campo" style="margin-bottom:8px">
          <span class="campo__cx"><input id="svNome" placeholder="Nome (ex.: Sessão de Apometria)"></span>
        </label>
        <div class="grade-2 mb12">
          <span class="campo__cx"><input id="svDur" inputmode="numeric" placeholder="Minutos"></span>
          <span class="campo__cx"><span class="dim" style="font-weight:800">R$</span><input id="svValor" inputmode="numeric" placeholder="Valor"></span>
        </div>
        <button class="btn btn--secundario btn--bloco btn--pequeno" data-a="adicionarServico">${ic('mais', 18)} Adicionar serviço</button>
      </div>`;

    if (n === 4) return `
      <p class="corpo dim mb16">Marque os dias e as faixas em que você atende. É isso que liga o selo <b>“Aberta agora”</b> no seu perfil.</p>
      ${Dados.DIAS.map((d, i) => {
        const faixas = P.horarios.filter((h) => h.dia === i);
        return `<div class="cartao mb8">
          <div class="entre">
            <span class="t2">${d}</span>
            <button class="chave" role="switch" aria-checked="${faixas.length > 0}" data-a="alternarDia" data-dia="${i}" aria-label="Atender ${d}"></button>
          </div>
          ${faixas.length ? `
            <div class="linha gap6 mt12">
              <span class="campo__cx" style="min-height:44px"><input type="time" value="${faixas[0].abre}" data-a="horaAbre" data-dia="${i}" style="flex:1;padding:10px 0"></span>
              <span class="dim">às</span>
              <span class="campo__cx" style="min-height:44px"><input type="time" value="${faixas[0].fecha}" data-a="horaFecha" data-dia="${i}" style="flex:1;padding:10px 0"></span>
            </div>` : ''}
        </div>`;
      }).join('')}`;

    return `
      <p class="corpo dim mb16">É por aqui que a cliente vai falar com você. O WhatsApp é obrigatório porque é o botão principal do seu perfil.</p>
      <label class="campo">
        <span class="campo__rot">WhatsApp (com DDD)</span>
        <span class="campo__cx"><span class="dim" style="font-weight:800">+55</span><input data-campo="whatsapp" inputmode="numeric" value="${esc(P.whatsapp)}" placeholder="(51) 9 9999-0000"></span>
      </label>
      <label class="campo">
        <span class="campo__rot">Instagram (opcional)</span>
        <span class="campo__cx"><span class="dim" style="font-weight:800">@</span><input data-campo="instagram" value="${esc(P.instagram)}" placeholder="seu.perfil"></span>
      </label>
      <h3 class="micro dim mt24 mb8">Como você atende</h3>
      <div class="enrola mb24">
        <button class="chip" data-a="perfilAtendimento" data-tipo="presencial" aria-pressed="${P.atendimento.has('presencial')}">Presencial</button>
        <button class="chip" data-a="perfilAtendimento" data-tipo="online" aria-pressed="${P.atendimento.has('online')}">On-line</button>
      </div>
      <div class="cartao cartao--plano" style="background:var(--sucesso-fundo);border:0">
        <p class="pequeno" style="color:#37624E">${ic('escudo', 14)} Depois de publicar, você pode pedir o <b>selo de Verificada</b> enviando seu documento e o certificado de formação.</p>
      </div>`;
  }

  /* --- raiz da terapeuta ------------------------------------------------- */
  function raizTerapeuta() {
    return `<div class="tela tela--raiz" data-tela="raizT">
      <div class="raiz__conteudo" id="conteudoAba"></div>
      ${barraAbasTerapeuta()}
    </div>`;
  }

  function barraAbasTerapeuta() {
    const a = Dados.estado.aba;
    const item = (id, nome, icone) => `
      <button class="aba" data-a="aba" data-aba="${id}" aria-selected="${a === id}" role="tab">${ic(icone, 24)}<span>${nome}</span></button>`;
    return `<nav class="abas" role="tablist">
      ${item('meuPerfil', 'Meu perfil', 'usuario')}
      ${item('avaliacoesT', 'Avaliações', 'coracao')}
      ${item('painel', 'Painel', 'grafico')}
    </nav>`;
  }

  /* Monta um objeto no formato de terapeuta a partir do perfil digitado,
     para reaproveitar exatamente a mesma tela que a cliente vê. */
  function perfilComoTerapeuta() {
    const P = Dados.estado.perfil;
    const nome = P.nome || 'Seu nome';
    const t = {
      id: 'eu', nome, tom: P.tom, iniciais: nome.split(' ').filter((x) => x.length > 2).slice(0, 2).map((x) => x[0]).join('') || '?',
      bairro: P.bairro || '—', cidade: P.cidade || '—', uf: P.uf, endereco: P.soBairro ? `${P.bairro || '—'} (endereço só para clientes confirmadas)` : (P.endereco || '—'),
      x: P.x, y: P.y, verificada: false, ativa: P.visivel,
      atendimento: Array.from(P.atendimento), whatsapp: P.whatsapp.replace(/\D/g, '') || '5551999999999', instagram: P.instagram || null,
      terapias: Array.from(P.terapias), bio: P.bio || 'Sua apresentação aparece aqui.',
      servicos: P.servicos.length ? P.servicos : [{ nome: 'Nenhum serviço cadastrado', duracao: 60, valor: 0 }],
      horarios: P.horarios, avaliacoes: [],
    };
    t.total = 0; t.nota = 0;
    const valores = t.servicos.map((s) => s.valor);
    t.precoMin = Math.min(...valores); t.precoMax = Math.max(...valores);
    t.distanciaKm = 0;
    return t;
  }

  function abaMeuPerfil() {
    const P = Dados.estado.perfil;
    const t = perfilComoTerapeuta();
    return `
      ${cabecalho('Meu perfil', { semVoltar: true, sub: 'Assim as clientes te veem', acao: `<button class="btn btn--secundario btn--pequeno" data-a="editarPerfil">${ic('lapis', 17)} Editar</button>` })}
      <div class="rolar" style="padding:0 0 calc(var(--altura-tab) + var(--base) + 14px)">
        <div class="pl pr">
          <div class="cartao" style="background:${P.visivel ? 'var(--sucesso-fundo)' : 'var(--alerta-fundo)'};box-shadow:none">
            <div class="entre">
              <div class="cresce">
                <p class="t2" style="color:${P.visivel ? '#37624E' : '#9A4C31'}">${P.visivel ? 'Visível no mapa' : 'Fora do mapa'}</p>
                <p class="pequeno mt4" style="color:${P.visivel ? '#37624E' : '#9A4C31'};opacity:.85">${P.visivel ? 'As clientes da sua região estão te vendo agora.' : 'Ninguém te encontra enquanto isso estiver desligado. Use nas férias.'}</p>
              </div>
              <button class="chave" role="switch" aria-checked="${P.visivel}" data-a="alternarVisivel" aria-label="Visível no mapa"></button>
            </div>
          </div>
        </div>

        <div class="secao">
          <div class="cartao">
            <div class="linha">
              ${avatar(t, 64)}
              <div class="cresce">
                <h2 class="d3">${esc(t.nome)}</h2>
                <p class="pequeno dim">${esc(t.bairro)}, ${esc(t.cidade)}</p>
                <div class="linha gap6 mt4">${selo(t)}</div>
              </div>
            </div>
            <p class="corpo mt12">${esc(t.bio)}</p>
            <div class="enrola mt12">${t.terapias.map((x) => `<span class="etiqueta">${esc(x)}</span>`).join('') || '<span class="pequeno dim2">Nenhuma terapia marcada</span>'}</div>
          </div>
        </div>

        <section class="secao" style="padding-top:0">
          <div class="secao__titulo"><h2 class="d3">Serviços e valores</h2></div>
          <div class="cartao">
            ${t.servicos.map((s) => `
              <div class="entre" style="padding:9px 0">
                <div class="cresce"><p class="t2">${esc(s.nome)}</p><p class="pequeno dim">${Dados.duracao(s.duracao)}</p></div>
                <span class="t2 tab-num">${Dados.brl(s.valor)}</span>
              </div>`).join('')}
          </div>
        </section>

        <section class="secao" style="padding-top:0">
          <div class="secao__titulo"><h2 class="d3">Horários</h2></div>
          <div class="cartao">
            ${Dados.horariosPorDia(t).map((d) => `
              <div class="entre" style="padding:6px 0">
                <span class="corpo">${Dados.DIAS[d.dia]}</span>
                <span class="corpo tab-num ${d.faixas.length ? '' : 'dim2'}">${d.faixas.length ? d.faixas.map((f) => `${f.abre} às ${f.fecha}`).join(' · ') : 'Fechada'}</span>
              </div>`).join('')}
          </div>
        </section>

        <div class="pl pr">
          <div class="cartao cartao--plano" style="background:var(--dourado-fundo);border:0">
            <p class="t2 mb8" style="color:#7C6221">${ic('escudo', 17)} Pedir o selo de Verificada</p>
            <p class="pequeno" style="color:#7C6221;opacity:.9">Envie um documento com foto e o certificado da sua formação. A análise leva até 5 dias úteis.</p>
            <button class="btn btn--bloco btn--pequeno mt12" style="--btn-bg:#C9A24B" data-a="pedirVerificacao">Enviar documentos</button>
          </div>
        </div>
      </div>`;
  }

  function abaAvaliacoesT() {
    // Avaliações fictícias recebidas, para exercitar o fluxo de resposta
    const recebidas = Dados.estado.avaliacoesRecebidas;
    return `
      ${cabecalho('Minhas avaliações', { semVoltar: true, sub: `${recebidas.length} recebidas` })}
      <div class="rolar" style="padding:6px 18px calc(var(--altura-tab) + var(--base) + 14px)">
        ${recebidas.map((a, i) => `
          <div class="cartao mb12">
            <div class="linha gap6">
              ${avatar({ id: 'r' + i, tom: (a.autor.charCodeAt(0) * 11) % 360, iniciais: a.autor[0] }, 38)}
              <div class="cresce">
                <p class="t2">${esc(a.autor)}</p>
                <div class="linha gap6">${estrelas(a.nota)}<span class="pequeno dim">${Dados.haQuanto(a.dias)}</span></div>
              </div>
            </div>
            <p class="corpo mt8">${esc(a.texto)}</p>
            ${a.resposta
              ? `<div class="resposta"><p class="micro" style="color:var(--violeta)">Sua resposta</p><p class="pequeno mt4">${esc(a.resposta)}</p></div>`
              : `<button class="btn btn--secundario btn--pequeno btn--bloco mt12" data-a="responder" data-i="${i}">Responder</button>`}
          </div>`).join('')}
      </div>`;
  }

  function responder(i) {
    const a = Dados.estado.avaliacoesRecebidas[i];
    return `<div class="tela" data-tela="responder">
      ${cabecalho('Responder', { sub: a.autor })}
      <div class="rolar pl pr">
        <div class="cartao mb16">
          <div class="linha gap6">${estrelas(a.nota)}<span class="pequeno dim">${Dados.haQuanto(a.dias)}</span></div>
          <p class="corpo mt8">${esc(a.texto)}</p>
        </div>
        <label class="campo">
          <span class="campo__rot">Sua resposta</span>
          <span class="campo__cx" style="align-items:flex-start"><textarea id="campoResposta" rows="5" maxlength="600" placeholder="Responda com calma. A resposta fica pública, abaixo da avaliação."></textarea></span>
          <span class="campo__ajuda">Uma resposta educada a uma crítica costuma convencer mais que dez elogios.</span>
        </label>
      </div>
      <div class="rodape-fixo">
        <button class="btn btn--bloco" data-a="enviarResposta" data-i="${i}">Publicar resposta</button>
      </div>
    </div>`;
  }

  function abaPainel() {
    const d = Dados.estado.metricas;
    const max = Math.max(...d.semana);
    const bloco = (rot, valor, delta, icone) => `
      <div class="cartao">
        <div class="linha gap6" style="color:var(--violeta)">${ic(icone, 19)}<span class="micro dim">${rot}</span></div>
        <p class="d2 tab-num mt4">${valor}</p>
        ${delta ? `<p class="pequeno" style="color:var(--sucesso)">${delta}</p>` : ''}
      </div>`;
    return `
      ${cabecalho('Painel', { semVoltar: true, sub: 'Últimos 7 dias' })}
      <div class="rolar" style="padding:6px 18px calc(var(--altura-tab) + var(--base) + 14px)">
        <div class="grade-2 mb12">
          ${bloco('Visualizações', d.visualizacoes, '+18% na semana', 'olho')}
          ${bloco('Cliques no zap', d.cliques, '+7% na semana', 'zap')}
        </div>
        <div class="grade-2 mb16">
          ${bloco('Nota média', d.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 }), '', 'grafico')}
          ${bloco('Favoritada por', d.favoritos, '', 'coracao')}
        </div>

        <div class="cartao">
          <p class="micro dim mb16">Visualizações por dia</p>
          <div class="linha" style="align-items:flex-end;gap:8px;height:118px">
            ${d.semana.map((v, i) => `
              <div class="cresce" style="text-align:center">
                <div style="height:${Math.round((v / max) * 96)}px;background:linear-gradient(180deg, var(--violeta-claro), var(--violeta));border-radius:6px 6px 3px 3px"></div>
                <span class="micro dim" style="font-size:0.64rem">${Dados.DIAS_CURTO[i]}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="cartao cartao--plano mt16">
          <p class="pequeno dim">${ic('info', 14)} No app real esses números vêm de eventos gravados no banco. Aqui são fictícios, só para mostrar o formato.</p>
        </div>
      </div>`;
  }

  return {
    esc, ic, svg, ICONES, avatar, estrelas, lotus, cabecalho, cartaoTerapeuta, selo, ondeFica, pinsHTML,
    entrar, telefone, codigo, papel, localizacao, cidades,
    raizCliente, abaMapa, abaLista, abaFavoritas, abaConta, barraAbas,
    folhaResumo, perfil, avaliar, filtros, denunciar, barraBusca, chipsFiltro, vazioBusca,
    raizTerapeuta, barraAbasTerapeuta, assistente, passo, abaMeuPerfil, abaAvaliacoesT,
    abaPainel, responder, perfilComoTerapeuta, PASSOS,
  };
})();
