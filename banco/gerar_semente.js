/* ============================================================================
   banco/gerar_semente.js — src/03-dados.js  ->  06-semente.sql

   POR QUE ISTO EXISTE
   -------------------
   As 12 terapeutas fictícias já existem, escritas uma vez, em `src/03-dados.js`.
   Redigitá-las em SQL criaria uma SEGUNDA verdade — e duas verdades divergem:
   muda-se o preço no protótipo, o banco de demonstração continua com o antigo, e
   a diferença só aparece quando alguém compara os dois na frente de uma cliente.

   Aqui os dados são LIDOS da fonte única e traduzidos. Mudou lá, roda isto de
   novo e o SQL acompanha.

   Uso:  node banco/gerar_semente.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');
const FONTE = path.join(RAIZ, 'src', '03-dados.js');
const SAIDA = path.join(__dirname, '06-semente.sql');

/* --------------------------------------------------- carregar a fonte única */
// `03-dados.js` é script clássico: define `const Dados` e não exporta nada.
// `new Function` dá a ele um escopo próprio e devolve o objeto.
function carregarDados() {
  const codigo = fs.readFileSync(FONTE, 'utf8');
  try {
    return new Function(codigo + '\nreturn Dados;')();
  } catch (e) {
    console.error('ERRO ao ler src/03-dados.js: ' + e.message);
    process.exit(2);
  }
}

/* --------------------------------------------------------- coordenadas reais
   O protótipo trabalha num plano cartesiano (120 px = 1 km) com a usuária no
   centro. O banco precisa de latitude e longitude de verdade, porque a busca é
   PostGIS.

   ⚠️ As coordenadas geradas preservam as DISTÂNCIAS e as direções do protótipo,
   ancoradas em Higienópolis (Porto Alegre). Elas NÃO são os endereços reais dos
   bairros citados — as pessoas são fictícias e os endereços também. Servem para
   exercitar a consulta geográfica com dados plausíveis, não para navegar. */
const ANCORA = { lat: -30.0175, lng: -51.2010 };   // Higienópolis, POA
const KM_POR_GRAU_LAT = 111.32;
const KM_POR_GRAU_LNG = KM_POR_GRAU_LAT * Math.cos((ANCORA.lat * Math.PI) / 180);

function paraLatLng(x, y, EU, pxPorKm) {
  const dxKm = (x - EU.x) / pxPorKm;
  const dyKm = (y - EU.y) / pxPorKm;          // y cresce para o SUL
  return {
    lat: +(ANCORA.lat - dyKm / KM_POR_GRAU_LAT).toFixed(6),
    lng: +(ANCORA.lng + dxKm / KM_POR_GRAU_LNG).toFixed(6),
  };
}

/* ------------------------------------------------------- UUID determinístico
   Mesma entrada, mesmo UUID, sempre. É isso que permite rodar a semente de novo
   sem duplicar ninguém (`on conflict do nothing` só funciona se o id repetir). */
function uuidDe(semente) {
  const h = crypto.createHash('md5').update('mapa-holistico:' + semente).digest('hex');
  const v = h.slice(0, 12) + '4' + h.slice(13, 16)            // versão 4
          + ((parseInt(h[16], 16) & 0x3 | 0x8).toString(16))  // variante
          + h.slice(17, 32);
  return [v.slice(0, 8), v.slice(8, 12), v.slice(12, 16), v.slice(16, 20), v.slice(20, 32)].join('-');
}

/* --------------------------------------------------------------- SQL seguro */
const txt = (v) => (v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v === null || v === undefined ? 'null' : String(v));
const arr = (lista) => `'{${lista.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(',')}}'`;

// Hash PROPOSITALMENTE inválido: nenhum destes usuários consegue logar. Eles
// existem só para a chave estrangeira de `profiles` ter em quem se apoiar.
const SENHA_INUTIL = '$2a$10$semente.de.demonstracao.sem.login.possivel.xxxxxxxx';

/* Cria um usuário de demonstração em auth.users. */
function usuarioDemo(id, email, nome, papel) {
  return `insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', ${txt(id)}, 'authenticated', 'authenticated',
  ${txt(email)}, ${txt(SENHA_INUTIL)}, now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('nome', ${txt(nome)}, 'papel', ${txt(papel)}),
  false, '', '', '', ''
) on conflict (id) do nothing;`;
}

/* ============================================================================ */
function gerar() {
  const D = carregarDados();
  const L = [];
  const p = (s) => L.push(s);

  p(`-- ============================================================================
-- 06 — SEMENTE DE DEMONSTRAÇÃO  (ARQUIVO GERADO — NÃO EDITE À MÃO)
--
-- Gerado por banco/gerar_semente.js a partir de src/03-dados.js, que é a fonte
-- única das 12 terapeutas fictícias. Editar aqui é criar uma segunda verdade.
--
-- ⚠️ ISTO É PARA UM BANCO DE DEMONSTRAÇÃO. NÃO RODE EM PRODUÇÃO.
--
--    Ele insere usuários direto em auth.users — coisa que o Supabase espera que
--    seja feita pelo cadastro, não por SQL. Funciona para dar sustentação às
--    chaves estrangeiras (nenhum destes usuários consegue logar: a senha é um
--    hash inválido de propósito), mas não é o caminho de um banco real.
--
-- Nenhuma pessoa, telefone ou endereço abaixo existe.
-- Para desfazer: rode 07-limpar-semente.sql.
-- ============================================================================

begin;
`);

  /* ---------------------------------------------- clientes que avaliaram */
  const autores = new Map();
  D.TERAPEUTAS.forEach((t) => t.avaliacoes.forEach((a) => {
    if (!autores.has(a.autor)) autores.set(a.autor, uuidDe('cliente:' + a.autor));
  }));

  p(`-- ------------------------------------------------------------------------
-- ${autores.size} clientes fictícias (as autoras das avaliações)
-- ------------------------------------------------------------------------`);
  let i = 0;
  for (const [nome, id] of autores) {
    i++;
    p(usuarioDemo(id, `cliente${String(i).padStart(2, '0')}@exemplo.invalido`, nome, 'cliente'));
    p(`insert into profiles (id, papel, nome) values (${txt(id)}, 'cliente', ${txt(nome)})
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;`);
  }

  /* ------------------------------------------------------- as terapeutas */
  p(`
-- ------------------------------------------------------------------------
-- ${D.TERAPEUTAS.length} terapeutas fictícias
-- ------------------------------------------------------------------------`);

  D.TERAPEUTAS.forEach((t, n) => {
    const id = uuidDe('terapeuta:' + t.id);
    const { lat, lng } = paraLatLng(t.x, t.y, D.EU, D.MUNDO.pxPorKm);

    p(`
-- ${n + 1}. ${t.nome} — ${t.bairro}, ${t.cidade} (${t.distanciaKm} km)`);
    p(usuarioDemo(id, `terapeuta${String(n + 1).padStart(2, '0')}@exemplo.invalido`, t.nome, 'terapeuta'));
    p(`insert into profiles (id, papel, nome) values (${txt(id)}, 'terapeuta', ${txt(t.nome)})
  on conflict (id) do update set papel = excluded.papel, nome = excluded.nome;`);

    p(`insert into perfis_terapeuta (
  user_id, bio, endereco, bairro, cidade, uf, localizacao,
  atendimento, whatsapp, instagram, verificada, ativa, so_bairro
) values (
  ${txt(id)}, ${txt(t.bio)}, ${txt(t.endereco)}, ${txt(t.bairro)}, ${txt(t.cidade)}, ${txt(t.uf)},
  st_setsrid(st_makepoint(${lng}, ${lat}), 4326)::geography,
  ${arr(t.atendimento)}, ${txt(t.whatsapp)}, ${txt(t.instagram)},
  ${t.verificada}, ${t.ativa}, false
) on conflict (user_id) do nothing;`);
    // preco_min/preco_max ficam de fora de propósito: o gatilho
    // `sincronizar_faixa_preco` os calcula quando os serviços entrarem.

    t.terapias.forEach((nomeTerapia) => {
      p(`insert into terapeuta_terapias (terapeuta_id, terapia_id)
  select ${txt(id)}, id from terapias where nome = ${txt(nomeTerapia)}
  on conflict do nothing;`);
    });

    t.servicos.forEach((s) => {
      p(`insert into servicos (terapeuta_id, nome, descricao, duracao_min, valor)
  select ${txt(id)}, ${txt(s.nome)}, ${txt(s.descricao)}, ${num(s.duracao)}, ${num(s.valor)}
  where not exists (select 1 from servicos where terapeuta_id = ${txt(id)} and nome = ${txt(s.nome)});`);
    });

    t.horarios.forEach((h) => {
      p(`insert into horarios (terapeuta_id, dia_semana, abre, fecha)
  select ${txt(id)}, ${h.dia}, ${txt(h.abre)}, ${txt(h.fecha)}
  where not exists (select 1 from horarios
                    where terapeuta_id = ${txt(id)} and dia_semana = ${h.dia} and abre = ${txt(h.abre)});`);
    });

    t.avaliacoes.forEach((a) => {
      const cli = autores.get(a.autor);
      p(`insert into avaliacoes (terapeuta_id, cliente_id, nota, comentario, resposta, criado_em)
  values (${txt(id)}, ${txt(cli)}, ${a.nota}, ${txt(a.texto)}, ${txt(a.resposta || null)},
          now() - interval '${a.dias} days')
  on conflict (terapeuta_id, cliente_id) do nothing;`);
    });
  });

  p(`
commit;

-- ============================================================================
-- CONFERÊNCIA — o que a semente deveria ter deixado
-- ============================================================================
select 'terapeutas' as coisa, count(*) as total from perfis_terapeuta
union all select 'servicos',   count(*) from servicos
union all select 'horarios',   count(*) from horarios
union all select 'avaliacoes', count(*) from avaliacoes
union all select 'clientes',   count(*) from profiles where papel = 'cliente';

-- A faixa de preço tem de ter sido preenchida PELO GATILHO, não pela semente.
-- Se vier nulo, o 03-funcoes-e-gatilhos.sql não foi rodado.
select pr.nome, p.preco_min, p.preco_max
from perfis_terapeuta p join profiles pr on pr.id = p.user_id
order by pr.nome;

-- A busca principal, do jeito que o app vai chamar (a partir de Higienópolis).
select nome, bairro, cidade, round(distancia_m::numeric/1000, 1) as km,
       nota_media, total_avaliacoes, aberta_agora
from terapeutas_proximas(${ANCORA.lat}, ${ANCORA.lng}, 30000);
`);

  fs.writeFileSync(SAIDA, L.join('\n') + '\n', 'utf8');

  const linhas = L.join('\n').split('\n').length;
  console.log(`  06-semente.sql gerado`);
  console.log(`  ${D.TERAPEUTAS.length} terapeutas · ${autores.size} clientes · ${linhas} linhas`);
  console.log(`  âncora: ${ANCORA.lat}, ${ANCORA.lng} (Higienópolis, POA)`);
}

gerar();
