/* ============================================================================
   teste/aparelho-aviso.js — dispara uma conquista DENTRO do APK

   Fala com a página que roda no aparelho pelo inspetor do WebView (CDP), que
   só existe em build de depuração. Pré-requisitos, feitos por fora:

     adb install -r app-debug.apk
     adb shell pm grant <pacote> android.permission.POST_NOTIFICATIONS
     adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>

   O que ele faz: põe o relógio simulado num horário de DIA (a política cala à
   noite), concede uma conquista pelo caminho real (`Conquistas.registrar`) e
   devolve o que a página fez. Quem tira a foto da tela de bloqueio é o adb,
   depois. Este script só prova que o aviso foi PEDIDO ao Android.
   ========================================================================= */
/* O Playwright não consegue gerir contexto num WebView de Android
   ("Browser context management is not supported"). Então é CDP cru: pega o
   endereço WebSocket da página em /json e manda `Runtime.evaluate`. O Node 22+
   tem WebSocket nativo — nenhuma dependência. */
const EXPR = `(() => {
  const antes = { ponte: typeof PonteAndroid, notificar: typeof (window.PonteAndroid || {}).notificar };
  Dados.estado.relogio = { dia: 3, hora: 10, minuto: 0 };
  const politica = Conquistas.avisoPermitido();
  Conquistas.registrar('contato');
  return JSON.stringify({ antes, politica, tem: Conquistas.tem('primeiro-contato'), hora: Dados.agora().getHours() });
})()`;

async function paginas() {
  const r = await fetch('http://127.0.0.1:9222/json');
  return r.json();
}

function avaliar(wsUrl, expressao) {
  return new Promise((ok, falha) => {
    const ws = new WebSocket(wsUrl);
    const t = setTimeout(() => { ws.close(); falha(new Error('sem resposta do inspetor em 10 s')); }, 10000);
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
    ws.onerror = (e) => { clearTimeout(t); falha(new Error('websocket: ' + (e.message || 'erro'))); };
  });
}

(async () => {
  const lista = await paginas();
  const pag = lista.find((x) => /appassets\.androidplatform\.net/.test(x.url || '')) || lista[0];
  if (!pag || !pag.webSocketDebuggerUrl) { console.error('nenhuma página no inspetor'); process.exit(2); }
  console.log('página:', pag.url);

  const r = JSON.parse(await avaliar(pag.webSocketDebuggerUrl, EXPR));
  console.log(JSON.stringify(r, null, 2));

  const ok = r.antes.notificar === 'function' && r.politica.pode && r.tem;
  console.log(ok ? '\n  a página pediu o aviso ao Android' : '\n  FALHA: o aviso não foi pedido');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FALHOU:', e.message); process.exit(2); });
