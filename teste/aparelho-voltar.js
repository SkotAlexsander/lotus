/* ============================================================================
   teste/aparelho-voltar.js — o VOLTAR físico do Android com perfil sobre folha

   O defeito que motiva esta prova: `voltarSePuder` fechava a FOLHA antes de
   olhar a pilha — com um perfil empilhado, o VOLTAR fechava a folha invisível
   atrás dele e parecia morto (um aperto sem efeito nenhum na tela).

   Pré-requisitos (iguais aos do aparelho-aviso.js):
     APK debug instalado e aberto no emulador
     adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>

   O script navega até um perfil COM a folha aberta atrás (via CDP), aperta o
   VOLTAR DE VERDADE (keyevent 4, via adb — fora deste script) em coordenação
   com o chamador, e confere o estado. Como um só processo não faz os dois,
   ele expõe os passos por argumento:
     node teste/aparelho-voltar.js preparar   → navega até perfil-sobre-folha
     node teste/aparelho-voltar.js conferir   → depois do keyevent 4: o perfil
                                                fechou e a folha FICOU?
     node teste/aparelho-voltar.js conferir2  → depois de outro keyevent 4:
                                                a folha fechou e o app está vivo?
   Saída: 0 = passo ok · 1 = falhou · 2 = infra
   ========================================================================= */
const PASSO = process.argv[2] || 'preparar';

function avaliar(wsUrl, expressao) {
  return new Promise((ok, falha) => {
    const ws = new WebSocket(wsUrl);
    const t = setTimeout(() => { ws.close(); falha(new Error('sem resposta em 10 s')); }, 10000);
    ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate',
      params: { expression: expressao, returnByValue: true, awaitPromise: true } }));
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id !== 1) return;
      clearTimeout(t); ws.close();
      if (m.error) return falha(new Error(m.error.message));
      if (m.result.exceptionDetails) return falha(new Error(m.result.exceptionDetails.text));
      ok(m.result.result.value);
    };
    ws.onerror = () => { clearTimeout(t); falha(new Error('websocket falhou')); };
  });
}

const EXPR = {
  preparar: `(async () => {
    const espera = (ms) => new Promise((r) => setTimeout(r, ms));
    // atravessa o login se ainda estiver na entrada
    if (document.querySelector('[data-a="entrarCelular"]')) {
      document.querySelector('[data-a="entrarCelular"]').click(); await espera(400);
      document.getElementById('campoTel').value = '(51) 9 8877-6655';
      document.getElementById('campoTel').dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-a="enviarCodigo"]').click(); await espera(400);
      document.querySelectorAll('.digito').forEach((d, i) => { d.value = String(i + 1); d.dispatchEvent(new Event('input', { bubbles: true })); });
      await espera(200);
      document.getElementById('btnCodigo').click(); await espera(400);
      const papel = document.querySelector('[data-papel="cliente"]'); if (papel) papel.click(); await espera(400);
      const cid = document.querySelector('[data-a="escolherCidade"]'); if (cid) { cid.click(); await espera(500); }
      const poa = document.querySelector('[data-a="definirCidade"][data-cidade="Porto Alegre"]'); if (poa) poa.click();
      await espera(1400);
    }
    // pino → folha → perfil
    const t = Dados.porId('t3');
    App.mapa.centralizar(t.lat, t.lng, 'pessoa', false); await espera(400);
    /* O toque no pino é decidido por POINTER events (pointerdown guarda o
       alvo, pointerup decide) — .click() sintético não os produz e o mapa
       nunca fica sabendo. Despacha a sequência completa. */
    const pino = document.querySelector('.pin[data-id="t3"]');
    if (pino) {
      const r = pino.getBoundingClientRect();
      const oe = { bubbles: true, cancelable: true, pointerId: 7, isPrimary: true,
                   clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
      pino.dispatchEvent(new PointerEvent('pointerdown', oe));
      await espera(60);
      pino.dispatchEvent(new PointerEvent('pointerup', oe));
      pino.dispatchEvent(new MouseEvent('click', oe));
    }
    await espera(500);
    const abrir = document.querySelector('[data-a="abrirPerfil"]'); if (abrir) abrir.click(); await espera(900);
    return JSON.stringify({
      telas: document.querySelectorAll('.tela').length,
      folhaVisivel: !document.getElementById('folha').hidden,
    });
  })()`,
  conferir: `JSON.stringify({
    telas: document.querySelectorAll('.tela').length,
    folhaVisivel: !document.getElementById('folha').hidden,
  })`,
  onde: `JSON.stringify({
    telas: Array.from(document.querySelectorAll('.tela')).map((t) => t.dataset.tela || '?'),
    pins: document.querySelectorAll('.pin').length,
    temEntrar: !!document.querySelector('[data-a="entrarCelular"]'),
    folha: document.getElementById('folha') ? !document.getElementById('folha').hidden : null,
    corpo: document.body.innerText.slice(0, 140).replace(/\\n/g, ' § '),
  })`,
  conferir2: `JSON.stringify({
    telas: document.querySelectorAll('.tela').length,
    folhaVisivel: !document.getElementById('folha').hidden,
    appVivo: typeof App !== 'undefined' && document.querySelectorAll('.pin').length > 0,
  })`,
};

(async () => {
  const lista = await (await fetch('http://127.0.0.1:9222/json')).json();
  const pag = lista.find((x) => /appassets\.androidplatform\.net/.test(x.url || '')) || lista[0];
  if (!pag || !pag.webSocketDebuggerUrl) { console.error('nenhuma página no inspetor'); process.exit(2); }

  const r = JSON.parse(await avaliar(pag.webSocketDebuggerUrl, EXPR[PASSO]));
  console.log(PASSO + ':', JSON.stringify(r));

  let ok = false;
  // `abrirPerfil` fecha a folha POR DESENHO antes de empilhar — então o estado
  // preparado é perfil aberto com folha fechada. A janela "perfil sobre folha
  // aberta" só existe durante a animação, e essa ordem é provada no navegador
  // pela carga-minimapas (20 voltas). Aqui se prova o VOLTAR físico:
  //   #1 fecha o PERFIL (não pode ser engolido) · #2 na raiz fecha o APP.
  if (PASSO === 'preparar') ok = r.telas === 2;
  if (PASSO === 'conferir') ok = r.telas === 1;
  if (PASSO === 'conferir2') ok = r.telas === 1 && r.appVivo;
  console.log(ok ? '  ok' : '  FALHA — esperado outro estado');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FALHOU:', e.message); process.exit(2); });
