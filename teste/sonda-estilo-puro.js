/* ============================================================================
   teste/sonda-estilo-puro.js — o aviso é meu ou do estilo?

   O console repetia "Expected value to be of type number, but found null".
   Antes de reescrever código por causa dele, é preciso saber de QUEM ele é:
   aqui o MapLibre e o estilo do OpenFreeMap sobem sozinhos, sem uma linha do
   projeto. Se o aviso aparecer assim, ele nunca foi nosso.

   Uso: node teste/sonda-estilo-puro.js
   ========================================================================= */
const { chromium } = require('../ferramentas/achar_playwright')();
const http = require('http');

const PAGINA = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.css">
<script src="https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.js"></script>
<style>html,body,#m{margin:0;height:100%}</style></head>
<body><div id="m"></div><script>
new maplibregl.Map({ container:'m',
  style:'https://tiles.openfreemap.org/styles/positron',
  center:[-51.09,-29.949], zoom:12.1 });
</script></body></html>`;

(async () => {
  const s = http.createServer((q, r) => {
    r.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    r.end(PAGINA);
  });
  await new Promise((ok) => s.listen(0, '127.0.0.1', ok));

  const b = await chromium.launch();
  const p = await b.newPage();
  let avisos = 0;
  const outros = [];
  p.on('console', (m) => {
    if (/type number/.test(m.text())) avisos++;
    else if (m.type() === 'error') outros.push(m.text().slice(0, 120));
  });

  await p.goto(`http://127.0.0.1:${s.address().port}/`);
  await p.waitForTimeout(9000);

  console.log(`\n  MapLibre 5.6.1 + estilo positron, SEM uma linha do projeto:`);
  console.log(`    avisos "type number": ${avisos}`);
  console.log(`    erros: ${outros.length ? outros.join(' | ') : 'nenhum'}`);
  console.log(avisos > 0
    ? '\n  >>> O aviso vem do ESTILO/biblioteca, não do nosso código.\n'
    : '\n  >>> O estilo puro é limpo — o aviso é NOSSO.\n');

  await b.close();
  s.close();
})();
