/* ============================================================================
   ferramentas/embutir_fontes.js — traz Fraunces e Nunito Sans para dentro

   Por que existe: dentro de um APK a página roda de um endereço local. Se a
   fonte vier do Google, o app depende de internet para PARECER certo — e um
   protótipo que muda de cara conforme o sinal do celular não serve para
   validar design. Embutida, a tipografia é a mesma no avião e no wi-fi.

   Roda UMA vez (precisa de rede) e grava `src/01b-fontes.css` com as fontes
   em base64. Depois disso o protótipo inteiro fica sem nenhuma requisição
   externa. Só rode de novo se quiser trocar de fonte ou de peso.

   Uso: node ferramentas/embutir_fontes.js
   ========================================================================= */
const fs = require('fs');
const path = require('path');
const https = require('https');

// UA de navegador moderno: com UA velha o Google devolve TTF em vez de woff2,
// e o arquivo fica 4x maior.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const FAMILIAS = [
  {
    nome: 'Fraunces',
    url: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&display=swap',
  },
  {
    nome: 'Nunito Sans',
    url: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400..900&display=swap',
  },
];

function baixar(url, binario = false) {
  return new Promise((ok, falha) => {
    https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode !== 200) return falha(new Error(`${res.statusCode} em ${url}`));
      const partes = [];
      res.on('data', (d) => partes.push(d));
      res.on('end', () => ok(binario ? Buffer.concat(partes) : Buffer.concat(partes).toString('utf8')));
    }).on('error', falha);
  });
}

/* O CSS do Google vem em blocos, um por alfabeto, cada um precedido de um
   comentário com o nome. Português cabe inteiro em `latin` — puxar os outros
   só engordaria o arquivo. */
function blocoLatin(css) {
  const blocos = css.split('/*').map((b) => '/*' + b);
  const latin = blocos.find((b) => b.startsWith('/* latin */'));
  if (!latin) throw new Error('bloco `latin` não encontrado no CSS do Google');
  return latin;
}

const pegar = (bloco, re) => { const m = bloco.match(re); return m ? m[1] : null; };

(async () => {
  const saida = [
    '/* ============================================================================',
    '   01b-fontes.css — Fraunces e Nunito Sans embutidas em base64',
    '',
    '   GERADO por ferramentas/embutir_fontes.js. Não edite à mão.',
    '   Só o alfabeto latino (é o que o português usa). Fontes variáveis: um',
    '   arquivo cobre toda a faixa de peso, então não há um woff2 por peso.',
    '   ========================================================================= */',
    '',
  ];

  let total = 0;
  for (const fam of FAMILIAS) {
    process.stdout.write(`  ${fam.nome}… `);
    const css = await baixar(fam.url);
    const bloco = blocoLatin(css);

    const urlFonte = pegar(bloco, /src:\s*url\((https:\/\/[^)]+)\)/);
    const peso = pegar(bloco, /font-weight:\s*([^;]+);/) || '400';
    const estilo = pegar(bloco, /font-style:\s*([^;]+);/) || 'normal';
    const faixa = pegar(bloco, /unicode-range:\s*([^;]+);/);
    if (!urlFonte) throw new Error(`sem url de fonte em ${fam.nome}`);

    const bin = await baixar(urlFonte, true);
    total += bin.length;
    console.log(`${(bin.length / 1024).toFixed(0)} KB`);

    saida.push(`@font-face {`);
    saida.push(`  font-family: '${fam.nome}';`);
    saida.push(`  font-style: ${estilo};`);
    saida.push(`  font-weight: ${peso};`);
    saida.push(`  font-display: swap;`);
    saida.push(`  src: url(data:font/woff2;base64,${bin.toString('base64')}) format('woff2');`);
    if (faixa) saida.push(`  unicode-range: ${faixa};`);
    saida.push(`}`);
    saida.push('');
  }

  const alvo = path.join(__dirname, '..', 'src', '01b-fontes.css');
  fs.writeFileSync(alvo, saida.join('\n'), 'utf8');
  console.log(`\n  src/01b-fontes.css gravado — ${(total / 1024).toFixed(0)} KB de fonte`);
  console.log('  Agora rode: node montar.js');
})().catch((e) => { console.error('\n  FALHOU: ' + e.message); process.exit(1); });
