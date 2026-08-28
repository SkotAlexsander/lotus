/* ============================================================================
   banco/conferir.js — prova estática do SQL

   O QUE ELE PROVA E O QUE NÃO PROVA
   ---------------------------------
   NÃO PROVA que o SQL roda: não há Postgres nesta máquina. Só o Supabase dirá.

   PROVA o que dá para provar sem banco, e que é justamente onde o erro costuma
   estar num SQL gerado:

     1. toda coluna usada na semente EXISTE no esquema;
     2. toda tabela usada na semente EXISTE no esquema;
     3. o catálogo de terapias do SQL BATE com o do protótipo;
     4. nenhum comando ficou com aspas simples desbalanceadas
        (é o defeito clássico de SQL gerado: um apóstrofo não escapado
         transforma o resto do arquivo em texto e o erro aparece 300 linhas
         adiante, apontando para o lugar errado);
     5. o esquema liga RLS em TODA tabela que ele cria — a omissão mais cara
        possível num projeto Supabase.

   Uso:  node banco/conferir.js       (exit 0 = passou · 1 = falhou)
   ========================================================================== */
const fs = require('fs');
const path = require('path');

const AQUI = __dirname;
const RAIZ = path.join(AQUI, '..');

const ler = (n) => fs.readFileSync(path.join(AQUI, n), 'utf8');

const falhas = [];
const passou = [];
function checa(ok, nome, detalhe = '') {
  (ok ? passou : falhas).push(nome + (detalhe ? ' — ' + detalhe : ''));
  console.log(`${ok ? 'ok  ' : 'FALHA'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

/* ------------------------------------------------ 1. esquema: tabelas/colunas */
function lerEsquema(sql) {
  const tabelas = {};
  const re = /create table if not exists\s+(\w+)\s*\(([\s\S]*?)\n\);/gi;
  let m;
  while ((m = re.exec(sql))) {
    const nome = m[1];
    const corpo = m[2];
    const cols = [];
    corpo.split('\n').forEach((linha) => {
      const l = linha.trim();
      if (!l || l.startsWith('--')) return;
      // Ignora as linhas que declaram restrição em vez de coluna
      if (/^(primary key|unique|check|constraint|foreign key)\b/i.test(l)) return;
      const c = l.match(/^([a-z_][a-z0-9_]*)\s+/i);
      if (c) cols.push(c[1].toLowerCase());
    });
    tabelas[nome.toLowerCase()] = cols;
  }
  return tabelas;
}

// O esquema vive em DOIS arquivos: o núcleo (02) e as conquistas/notificações
// (08). Ler só o primeiro faria toda tabela nova passar sem conferência.
const esquemaSql = ler('02-tabelas.sql') + ler('08-conquistas-e-notificacoes.sql');
const esquema = lerEsquema(esquemaSql);
checa(Object.keys(esquema).length === 16,
  'o esquema declara as 16 tabelas',
  Object.keys(esquema).join(', '));

/* ------------------------------------------- 2. semente: tabelas e colunas */
const semente = ler('06-semente.sql');
const usos = [];
const reIns = /insert into\s+([\w.]+)\s*\(([^)]*)\)/gi;
let m;
while ((m = reIns.exec(semente))) {
  usos.push({
    tabela: m[1].toLowerCase(),
    colunas: m[2].split(',').map((c) => c.trim().toLowerCase()).filter(Boolean),
  });
}
checa(usos.length > 0, 'a semente tem comandos de inserção', `${usos.length} inserts`);

const tabelasDesconhecidas = new Set();
const colunasDesconhecidas = new Set();
for (const u of usos) {
  // `auth.users` é do Supabase, não do nosso esquema: fora do alcance daqui.
  if (u.tabela.startsWith('auth.')) continue;
  if (!esquema[u.tabela]) { tabelasDesconhecidas.add(u.tabela); continue; }
  for (const c of u.colunas) {
    if (!esquema[u.tabela].includes(c)) colunasDesconhecidas.add(`${u.tabela}.${c}`);
  }
}
checa(tabelasDesconhecidas.size === 0,
  'a semente só usa tabelas que o esquema cria', [...tabelasDesconhecidas].join(', '));
checa(colunasDesconhecidas.size === 0,
  'a semente só usa colunas que existem', [...colunasDesconhecidas].join(', '));

/* --------------------------------- 3. catálogo do SQL x catálogo do protótipo */
const catalogo = ler('05-catalogo.sql');
const doSql = [...catalogo.matchAll(/\('([^']+)'\)/g)].map((x) => x[1]);
const codigoDados = fs.readFileSync(path.join(RAIZ, 'src', '03-dados.js'), 'utf8');
const Dados = new Function(codigoDados + '\nreturn Dados;')();
const doApp = Dados.TERAPIAS;

const soNoSql = doSql.filter((x) => !doApp.includes(x));
const soNoApp = doApp.filter((x) => !doSql.includes(x));
checa(soNoSql.length === 0 && soNoApp.length === 0,
  'o catálogo do banco bate com o do protótipo',
  [...soNoSql.map((x) => 'só no SQL: ' + x), ...soNoApp.map((x) => 'só no app: ' + x)].join(' | '));

/* ------------- 3b. catálogo de CONQUISTAS: o do app x o do banco */
/* Mesmo problema do catálogo de terapias: duas listas da mesma coisa separam
   com o tempo. Compara id, nome E descrição — um selo com texto diferente no
   app e no banco é defeito que ninguém reporta, só estranha. */
{
  const codigoConq = fs.readFileSync(path.join(RAIZ, 'src', '03b-conquistas.js'), 'utf8');
  const prefixo = 'const Dados = { agora: () => new Date(), estado: { papel: null, favoritos: new Set() } };';
  const Conq = new Function(prefixo + codigoConq + ';return Conquistas;')();
  const sql08 = ler('08-conquistas-e-notificacoes.sql');
  // Só o bloco do INSERT do catálogo — solto no arquivo, o padrão ('a','b','c')
  // também casa com CHECKs e jsonb, e a prova reprovaria por pescar fora.
  const blocoIns = (sql08.match(/insert into conquistas[\s\S]*?on conflict/i) || [''])[0];
  const doBanco = [...blocoIns.matchAll(/\('([a-z-]+)',\s*'([^']+)',\s*'([^']+)'/g)]
    .map((m) => ({ id: m[1], nome: m[2], descricao: m[3] }));

  const problemas = [];
  for (const c of Conq.CATALOGO) {
    const b = doBanco.find((x) => x.id === c.id);
    if (!b) { problemas.push('só no app: ' + c.id); continue; }
    if (b.nome !== c.nome) problemas.push(`${c.id}: nome difere ("${c.nome}" x "${b.nome}")`);
    if (b.descricao !== c.descricao) problemas.push(`${c.id}: descrição difere`);
  }
  for (const b of doBanco) {
    if (!Conq.CATALOGO.find((x) => x.id === b.id)) problemas.push('só no banco: ' + b.id);
  }
  checa(problemas.length === 0,
    'o catálogo de conquistas do banco bate com o do app',
    problemas.slice(0, 4).join(' | '));
}

/* ------------------------- 4. aspas simples balanceadas em cada comando */
// Em SQL o apóstrofo escapa dobrado (''). Trocar os '' por nada e contar o que
// sobra: número ímpar = string aberta.
function aspasQuebradas(sql, nomeArquivo) {
  const semComentario = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
  const semEscape = semComentario.replace(/''/g, '');
  const total = (semEscape.match(/'/g) || []).length;
  return total % 2 === 0 ? null : `${nomeArquivo}: número ímpar de aspas (${total})`;
}
const arquivosSql = fs.readdirSync(AQUI).filter((f) => f.endsWith('.sql')).sort();
const quebrados = arquivosSql.map((f) => aspasQuebradas(ler(f), f)).filter(Boolean);
checa(quebrados.length === 0, 'aspas simples balanceadas em todos os .sql', quebrados.join(' | '));

/* ----------------------------------------- 5. RLS ligada em toda tabela */
const rls = ler('04-rls.sql') + ler('08-conquistas-e-notificacoes.sql');
const comRls = new Set(
  [...rls.matchAll(/alter table\s+(\w+)\s+enable row level security/gi)].map((x) => x[1].toLowerCase())
);
const semRls = Object.keys(esquema).filter((t) => !comRls.has(t));
checa(semRls.length === 0,
  'RLS é ligada em TODA tabela do esquema',
  semRls.length ? 'sem RLS: ' + semRls.join(', ') : `${comRls.size} tabelas`);

/* --------------------------- 6. toda tabela com RLS ganha ao menos 1 política */
const comPolitica = new Set(
  [...rls.matchAll(/create policy\s+"[^"]+"\s+on\s+(\w+)/gi)].map((x) => x[1].toLowerCase())
);
const semPolitica = [...comRls].filter((t) => !comPolitica.has(t));
checa(semPolitica.length === 0,
  'toda tabela com RLS tem ao menos uma política',
  semPolitica.length ? 'RLS ligada e ninguém lê: ' + semPolitica.join(', ') : '');

/* ------------------------------ 7. a ordem dos arquivos é a ordem de execução */
const esperados = ['01-extensoes.sql', '02-tabelas.sql', '03-funcoes-e-gatilhos.sql',
                   '04-rls.sql', '05-catalogo.sql', '06-semente.sql', '07-limpar-semente.sql',
                   '08-conquistas-e-notificacoes.sql'];
checa(esperados.length === 8, 'os 8 arquivos da sequência são conhecidos');
const faltando = esperados.filter((f) => !arquivosSql.includes(f));
checa(faltando.length === 0, 'os 7 arquivos da sequência existem', faltando.join(', '));

/* -------------------------------------- 8. a semente está em dia com a fonte */
const antes = semente;
const { execFileSync } = require('child_process');
try {
  execFileSync(process.execPath, [path.join(AQUI, 'gerar_semente.js')], { stdio: 'pipe' });
  const depois = ler('06-semente.sql');
  checa(antes === depois, 'a semente está em dia com src/03-dados.js',
    antes === depois ? '' : 'src/03-dados.js mudou — rode: node banco/gerar_semente.js');
} catch (e) {
  checa(false, 'o gerador da semente roda', e.message.split('\n')[0]);
}

/* ------------------------------------------------------------------ fim */
console.log(`\n${'='.repeat(58)}`);
console.log(`  ${passou.length} provas passaram · ${falhas.length} falharam`);
console.log(`  ⚠️  Isto NÃO prova que o SQL roda. Só o Supabase dirá.`);
console.log('='.repeat(58));
process.exit(falhas.length ? 1 : 0);
