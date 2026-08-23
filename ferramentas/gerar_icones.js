/* ============================================================================
   ferramentas/gerar_icones.js — o ícone do app, em todos os tamanhos

   Desenha o lótus da marca sobre o gradiente violeta e rasteriza com o
   navegador (não há PIL nem ImageMagick nesta máquina; o Playwright já está
   aqui e é um rasterizador honesto).

   Sai em recursos/icones/:
     icone-48/72/96/144/192.png   mipmaps do Android (aparelho pré-26)
     icone-180.png                apple-touch-icon (Adicionar à Tela de Início)
     icone-512.png                loja / manifesto
     icone-maskable-512.png       margem maior, para máscara redonda

   Uso: node ferramentas/gerar_icones.js
   ========================================================================= */
const { chromium } = require('./achar_playwright')();
const fs = require('fs');
const path = require('path');

const SAIDA = path.join(__dirname, '..', 'recursos', 'icones');

// A mesma pétala do protótipo (05-telas.js). Se mudar lá, mude aqui.
const PETALA = 'M32 9 C25.2 19.5 23 32 25.8 44.4 C27.8 48.2 36.2 48.2 38.2 44.4 C41 32 38.8 19.5 32 9 Z';

/* `escala` = quanto do quadrado a flor ocupa. O ícone com máscara precisa de
   mais margem: a máscara redonda do Android come os cantos, e flor grande
   demais sai decapitada. */
function pagina(tamanho, escala) {
  const petala = (ang, op) =>
    `<path d="${PETALA}" transform="rotate(${ang} 32 46)" opacity="${op}"/>`;
  const flor = Math.round(tamanho * escala);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0}
    .q{width:${tamanho}px;height:${tamanho}px;display:grid;place-items:center;
       background:linear-gradient(155deg,#7B60AC 0%,#5B3E8E 48%,#432C6B 100%)}
  </style></head><body>
    <div class="q">
      <svg width="${flor}" height="${flor}" viewBox="0 0 64 64" fill="#fff">
        ${petala(-74, 0.42)}${petala(74, 0.42)}
        ${petala(-38, 0.68)}${petala(38, 0.68)}
        ${petala(0, 1)}
        <ellipse cx="32" cy="49.5" rx="14.5" ry="3.6" opacity="0.3"/>
      </svg>
    </div>
  </body></html>`;
}

const ALVOS = [
  { nome: 'icone-48.png', tam: 48, escala: 0.66 },
  { nome: 'icone-72.png', tam: 72, escala: 0.66 },
  { nome: 'icone-96.png', tam: 96, escala: 0.66 },
  { nome: 'icone-144.png', tam: 144, escala: 0.66 },
  { nome: 'icone-180.png', tam: 180, escala: 0.66 },
  { nome: 'icone-192.png', tam: 192, escala: 0.66 },
  { nome: 'icone-512.png', tam: 512, escala: 0.66 },
  { nome: 'icone-maskable-512.png', tam: 512, escala: 0.48 },
];

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const navegador = await chromium.launch();
  const p = await navegador.newPage({ deviceScaleFactor: 1 });

  for (const a of ALVOS) {
    await p.setViewportSize({ width: a.tam, height: a.tam });
    await p.setContent(pagina(a.tam, a.escala));
    const el = await p.$('.q');
    await el.screenshot({ path: path.join(SAIDA, a.nome), omitBackground: false });
    console.log(`  ${a.nome}  ${a.tam}x${a.tam}`);
  }

  await navegador.close();

  // O protótipo é arquivo único: o ícone tem de viajar DENTRO dele. Vira um
  // módulo que o 06-app.js pendura no <head> ao abrir — é o que faz o
  // "Adicionar à Tela de Início" do iPhone criar um app com cara de app, e
  // não um retângulo com a foto da página.
  const png180 = fs.readFileSync(path.join(SAIDA, 'icone-180.png'));
  const modulo = [
    '/* GERADO por ferramentas/gerar_icones.js — não edite à mão. */',
    '/* O ícone de 180 px do app, embutido. Vira o apple-touch-icon. */',
    "const ICONE_APP = 'data:image/png;base64," + png180.toString('base64') + "';",
    '',
  ].join('\n');
  fs.writeFileSync(path.join(__dirname, '..', 'src', '01c-icone.js'), modulo, 'utf8');
  console.log(`\n  recursos/icones/ pronto`);
  console.log(`  src/01c-icone.js gravado (apple-touch-icon: ${(png180.length / 1024).toFixed(0)} KB)`);
})().catch((e) => { console.error('FALHOU: ' + e.message); process.exit(1); });
