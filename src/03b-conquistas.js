/* ============================================================================
   03b-conquistas.js — o sistema de conquistas, e a política dos avisos

   O QUE É UMA CONQUISTA AQUI
   --------------------------
   Não é pontinho de joguinho. Cada selo marca um passo REAL da jornada que o
   app existe para provocar: abrir o mapa, comparar perfis, guardar favoritas,
   fazer o primeiro contato, devolver uma avaliação para a próxima pessoa.
   Para a terapeuta: pôr o perfil no ar e responder a quem a avaliou.

   O catálogo daqui ESPELHA o do banco (banco/08-conquistas-e-notificacoes.sql)
   — mesmo id, mesmo nome, mesma descrição. O conferidor (`banco/conferir.js`)
   compara os dois e reprova se divergirem: duas listas da mesma coisa separam
   com o tempo, e um selo com nome diferente no app e no banco é o tipo de
   defeito que ninguém reporta, só estranha.

   No protótipo tudo vive em memória (regra da Fase 0: nada é gravado). No
   produto real quem CONCEDE é o banco, por gatilho — o app só lê. Ver a
   explicação longa em documentacao/05-conquistas-e-notificacoes.md.

   A POLÍTICA DO AVISO — "inteligente" começa em saber calar
   ---------------------------------------------------------
   Notificação que interrompe à toa ensina a pessoa a desligar todas — e aí
   morre o canal inteiro. As regras, todas testáveis:

     1. SILÊNCIO À NOITE (21h–8h): conquista às 23h é mostrada na tela na
        hora, mas o aviso de sistema espera o dia começar. Ninguém precisa
        acordar por um selo.
     2. NO MÁXIMO 3 AVISOS DE SISTEMA POR SESSÃO: do quarto em diante, só a
        tela. Sequência de conquistas em rajada é uma notificação, não cinco.
     3. NUNCA DUAS VEZES: conceder é idempotente; re-conquistar não existe.

   A hora vem de `Dados.agora()` — o mesmo relógio que o resto do app, o que
   torna a política testável com o relógio simulado da tela de conta.
   ========================================================================= */
const Conquistas = (() => {

  /* -------------------------------------------------------- o catálogo */
  // `icone` usa os nomes do conjunto de ícones das telas (05-telas.js).
  const CATALOGO = [
    { id: 'primeiros-passos',   nome: 'Primeiros passos', descricao: 'Abriu o mapa da sua região pela primeira vez', icone: 'mapa',    papel: 'cliente',   ordem: 1 },
    { id: 'exploradora',        nome: 'Exploradora',      descricao: 'Visitou 5 perfis de terapeutas',               icone: 'busca',   papel: 'cliente',   ordem: 2 },
    { id: 'colecionadora',      nome: 'Colecionadora',    descricao: 'Guardou 3 terapeutas nas favoritas',           icone: 'coracao', papel: 'cliente',   ordem: 3 },
    { id: 'primeiro-contato',   nome: 'Primeiro contato', descricao: 'Chamou uma terapeuta no WhatsApp',             icone: 'zap',     papel: 'cliente',   ordem: 4 },
    { id: 'primeira-avaliacao', nome: 'Voz que ajuda',    descricao: 'Publicou a sua primeira avaliação',            icone: 'estrela', papel: 'cliente',   ordem: 5 },
    { id: 'perfil-no-ar',       nome: 'Perfil no ar',     descricao: 'Publicou o seu perfil profissional',           icone: 'local',   papel: 'terapeuta', ordem: 6 },
    { id: 'primeira-resposta',  nome: 'Diálogo aberto',   descricao: 'Respondeu a uma avaliação recebida',           icone: 'lapis',   papel: 'terapeuta', ordem: 7 },
  ];

  /* ------------------------------------------------------------ estado */
  const conquistadas = new Map();          // id -> Date (memória; Fase 0)
  const perfisVistos = new Set();          // para 'exploradora'
  let avisosNaSessao = 0;                  // regra 2
  const AVISOS_POR_SESSAO = 3;
  let aoConquistar = null;                 // o app pendura a reação aqui

  const SILENCIO = { inicio: 21, fim: 8 }; // regra 1 — horas cheias

  /* --------------------------------------------------------- consultas */
  const porPapel = (papel) => CATALOGO.filter((c) => c.papel === papel);
  const tem = (id) => conquistadas.has(id);
  const total = (papel) => porPapel(papel).length;
  const feitas = (papel) => porPapel(papel).filter((c) => tem(c.id)).length;

  /* A janela de silêncio cruza a meia-noite (21→8), então o teste é "fora do
     intervalo permitido", não "dentro de [início, fim]" — o erro clássico. */
  function emSilencio(agora = Dados.agora()) {
    const h = agora.getHours();
    return h >= SILENCIO.inicio || h < SILENCIO.fim;
  }

  /* O aviso de SISTEMA pode sair agora? (a tela mostra sempre; isto decide
     só a notificação que interrompe.) */
  function avisoPermitido() {
    if (emSilencio()) return { pode: false, motivo: 'silencio' };
    if (avisosNaSessao >= AVISOS_POR_SESSAO) return { pode: false, motivo: 'limite' };
    return { pode: true };
  }

  /* ---------------------------------------------------------- conceder */
  function conceder(id) {
    if (conquistadas.has(id)) return false;          // regra 3: nunca duas vezes
    const c = CATALOGO.find((x) => x.id === id);
    if (!c) return false;

    conquistadas.set(id, Dados.agora());

    const politica = avisoPermitido();
    if (politica.pode) avisosNaSessao++;
    if (aoConquistar) aoConquistar(c, politica);
    return true;
  }

  /* ------------------------------------------------ os fatos que contam */
  /* Uma porta só: o app relata O QUE ACONTECEU e este módulo decide o que
     isso vale. Espalhar `conceder('x')` pelos casos do roteador acoplaria
     cada tela ao catálogo. */
  function registrar(evento, dados = {}) {
    switch (evento) {
      case 'mapa-aberto':
        if (Dados.estado.papel === 'cliente') conceder('primeiros-passos');
        break;
      case 'perfil-visto':
        perfisVistos.add(dados.id);
        if (perfisVistos.size >= 5) conceder('exploradora');
        break;
      case 'favoritou':
        if (Dados.estado.favoritos.size >= 3) conceder('colecionadora');
        break;
      case 'contato':
        conceder('primeiro-contato');
        break;
      case 'avaliou':
        conceder('primeira-avaliacao');
        break;
      case 'perfil-publicado':
        conceder('perfil-no-ar');
        break;
      case 'respondeu':
        conceder('primeira-resposta');
        break;
      default: break;
    }
  }

  return {
    CATALOGO, registrar, tem, total, feitas, porPapel,
    emSilencio, avisoPermitido,
    definirReacao(fn) { aoConquistar = fn; },
    // exposto para a bancada montar cenários; não é usado pelo app
    _zerar() { conquistadas.clear(); perfisVistos.clear(); avisosNaSessao = 0; },
  };
})();
