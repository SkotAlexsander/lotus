/* ============================================================================
   montar.js — costura src/ num arquivo único

   Editar é SEMPRE em src/. Este script gera dois arquivos a partir da mesma
   fonte, porque eles vão para lugares com regras diferentes:

     prototipo/index.html     documento completo — abre com duplo clique
     prototipo/artifact.html  só o conteúdo do <body>, sem <html>/<head> — para
                              hospedagem que fornece o próprio esqueleto de página

   A numeração dos arquivos em src/ é a ORDEM DE CARGA, não enfeite:
   física → dados → mapa → telas → app. Trocar a ordem quebra o protótipo,
   porque são scripts clássicos (sem import/export) e cada um usa o anterior.

   Uso:
     node montar.js            monta
     node montar.js --check    só confere se o montado está em dia (exit 1 se não)
   ========================================================================= */
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const SRC = path.join(RAIZ, 'src');
const SAIDA = path.join(RAIZ, 'prototipo');

const ORDEM_JS = ['01c-icone.js', '02-fisica.js', '03-dados.js', '04-mapa.js', '05-telas.js', '06-app.js'];

function ler(nome) {
  const p = path.join(SRC, nome);
  if (!fs.existsSync(p)) {
    console.error(`ERRO: falta o arquivo src/${nome}`);
    process.exit(2);
  }
  return fs.readFileSync(p, 'utf8');
}

function montar() {
  const molde = ler('00-molde.html');
  // As fontes embutidas vêm antes do estilo: @font-face tem de existir antes
  // de alguém pedir a família. Geradas por ferramentas/embutir_fontes.js.
  const css = ler('01b-fontes.css') + '\n\n' + ler('01-estilo.css');

  const js = ORDEM_JS.map((n) => {
    const faixa = '/* ' + '='.repeat(74) + '\n   ' + n + '\n   ' + '='.repeat(74) + ' */';
    return faixa + '\n' + ler(n);
  }).join('\n\n');

  if (!molde.includes('/* <<<CSS>>> */')) { console.error('ERRO: o molde perdeu o marcador <<<CSS>>>'); process.exit(2); }
  if (!molde.includes('/* <<<JS>>> */'))  { console.error('ERRO: o molde perdeu o marcador <<<JS>>>');  process.exit(2); }

  // replace com função evita que $& e $1 dentro do CSS/JS sejam interpretados
  const corpo = molde
    .replace('/* <<<CSS>>> */', () => css.trim())
    .replace('/* <<<JS>>> */', () => js.trim());

  // Divide o molde na primeira <main>: o que vem antes é cabeça, o resto é corpo
  const corte = corpo.indexOf('<main');
  if (corte < 0) { console.error('ERRO: o molde não tem <main>'); process.exit(2); }
  const cabeca = corpo.slice(0, corte).trim();
  const resto = corpo.slice(corte).trim();

  const pagina = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
<meta name="theme-color" content="#5B3E8E">
<meta name="description" content="Protótipo navegável do app que mostra terapeutas holísticas e apometras perto de você.">
${cabeca}
</head>
<body>
${resto}
</body>
</html>
`;

  return { pagina, corpo: corpo.trim() + '\n' };
}

function gravarSeMudou(arquivo, conteudo) {
  const antes = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, 'utf8') : null;
  if (antes === conteudo) return false;
  fs.writeFileSync(arquivo, conteudo, 'utf8');
  return true;
}

const { pagina, corpo } = montar();
const alvoPagina = path.join(SAIDA, 'index.html');
const alvoArtifact = path.join(SAIDA, 'artifact.html');

if (process.argv.includes('--check')) {
  const okA = fs.existsSync(alvoPagina) && fs.readFileSync(alvoPagina, 'utf8') === pagina;
  const okB = fs.existsSync(alvoArtifact) && fs.readFileSync(alvoArtifact, 'utf8') === corpo;
  if (okA && okB) { console.log('OK — o montado está em dia com src/.'); process.exit(0); }
  console.error('DESATUALIZADO — src/ mudou e o montado não. Rode: node montar.js');
  process.exit(1);
}

if (!fs.existsSync(SAIDA)) fs.mkdirSync(SAIDA, { recursive: true });
const m1 = gravarSeMudou(alvoPagina, pagina);
const m2 = gravarSeMudou(alvoArtifact, corpo);

const kb = (s) => (Buffer.byteLength(s, 'utf8') / 1024).toFixed(0) + ' KB';
console.log(`prototipo/index.html     ${kb(pagina)}   ${m1 ? 'atualizado' : 'sem mudança'}`);
console.log(`prototipo/artifact.html  ${kb(corpo)}   ${m2 ? 'atualizado' : 'sem mudança'}`);
