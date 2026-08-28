/* ============================================================================
   03-dados.js — dados fictícios e estado em memória
   Nada aqui é real. Nenhuma pessoa, telefone ou endereço abaixo existe.
   O modelo de campos espelha o arquivo 03 do briefing (tabelas do Supabase),
   para que a Fase 1 troque só a origem dos dados, não o formato.
   ========================================================================= */
const Dados = (() => {

  /* ---------------------------------------------------- mundo do mapa */
  // Plano cartesiano em pixels. 120 px = 1 km. O mundo inteiro tem ~28 km.
  const MUNDO = { largura: 4400, altura: 4400, pxPorKm: 120 };
  /* A posição de quem está olhando. Começa fictícia (a âncora dos dados de
     demonstração) e é SUBSTITUÍDA pelo GPS quando a pessoa permite.
     `origem` existe para a tela nunca precisar adivinhar de onde veio o ponto
     azul — e para nunca dizer "você está aqui" sobre um lugar inventado. */
  const EU = { x: 2000, y: 2100, lat: -30.01382, lng: -51.18227,
               bairro: 'Higienópolis', cidade: 'Porto Alegre', uf: 'RS',
               origem: 'ficticia', precisao: null };

  /* --------------------------------------------- catálogo de terapias */
  // No app real esta lista é uma tabela controlada pelo admin (arquivo 03),
  // justamente para não virar bagunça com nomes duplicados.
  const TERAPIAS = [
    'Apometria', 'Reiki', 'ThetaHealing', 'Barras de Access',
    'Radiestesia', 'Cromoterapia', 'Aromaterapia', 'Cristaloterapia',
    'Constelação Familiar', 'Mesa Radiônica', 'Tarô Terapêutico', 'Limpeza Energética',
  ];

  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  /* Horários usados com frequência, para não repetir o mesmo bloco 12 vezes */
  const h = (dia, abre, fecha) => ({ dia, abre, fecha });

  /* ---------------------------------------------------- as terapeutas */
  const TERAPEUTAS = [
    {
      id: 't1', nome: 'Rosane Albuquerque', tom: 268,
      bairro: 'Centro Histórico', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Rua dos Andradas, 1200 — sala 43',
      lat: -30.0325, lng: -51.23033, verificada: true, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551999120043', instagram: 'rosane.apometria',
      terapias: ['Apometria', 'Limpeza Energética', 'Mesa Radiônica'],
      bio: 'Trabalho com Apometria há onze anos, num consultório no centro, com hora marcada e sem pressa. Atendo quem chega cansado da rotina e também quem já vem acompanhando um processo há tempo. A primeira conversa é sem custo, para a gente ver se faz sentido seguir junto.',
      servicos: [
        { nome: 'Sessão de Apometria', duracao: 90, valor: 180, descricao: 'Primeira sessão inclui anamnese completa' },
        { nome: 'Limpeza energética do ambiente', duracao: 60, valor: 150, descricao: 'Casa ou local de trabalho' },
        { nome: 'Mesa radiônica (à distância)', duracao: 45, valor: 120 },
      ],
      // Para o almoço — duas faixas no mesmo dia. É o caso comum de quem
      // atende em consultório, e exercita a grade de horários de ponta a
      // ponta: assistente, perfil, "aberta agora" e a semente do banco.
      horarios: [
        h(1, '09:00', '12:00'), h(1, '13:30', '18:00'),
        h(2, '09:00', '12:00'), h(2, '13:30', '18:00'),
        h(3, '09:00', '12:00'), h(3, '13:30', '18:00'),
        h(4, '09:00', '12:00'), h(4, '13:30', '20:00'),
        h(5, '09:00', '17:00'), h(6, '09:00', '13:00'),
      ],
      avaliacoes: [
        { autor: 'Cláudia M.', nota: 5, dias: 6, texto: 'Saí leve de um jeito que não sei explicar direito. A Rosane escuta de verdade antes de começar, isso fez muita diferença pra mim.' , resposta: 'Que bom te receber, Cláudia. Fico à disposição.' },
        { autor: 'Juliana T.', nota: 5, dias: 19, texto: 'Consultório tranquilo, ela é pontual e explica cada etapa. Já indiquei pra duas amigas.' },
        { autor: 'Marcelo P.', nota: 4, dias: 41, texto: 'Atendimento muito bom. Só achei o horário da tarde difícil de conseguir, tive que esperar duas semanas.', resposta: 'Obrigada pelo retorno, Marcelo. Abri mais horários nas quintas à noite.' },
        { autor: 'Ana Paula S.', nota: 5, dias: 68, texto: 'Fiz três sessões e voltei a dormir. Vale cada centavo.' },
        { autor: 'Rita C.', nota: 5, dias: 95, texto: 'Profissional séria, sem promessa milagrosa. É o que eu procurava.' },
      ],
    },
    {
      id: 't2', nome: 'Marina Corrêa', tom: 305,
      bairro: 'Bom Fim', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Rua Fernandes Vieira, 380 — casa 2',
      lat: -30.0334, lng: -51.21172, verificada: false, ativa: true,
      atendimento: ['presencial'],
      whatsapp: '5551998451207', instagram: 'marinacorrea.reiki',
      terapias: ['Reiki', 'Cromoterapia', 'Aromaterapia'],
      bio: 'Reikiana desde 2018, formada nos três níveis. Atendo numa casa antiga do Bom Fim, com jardim. Gosto de combinar o Reiki com cromoterapia quando a pessoa está num período de muita agitação.',
      servicos: [
        { nome: 'Sessão de Reiki', duracao: 50, valor: 90 },
        { nome: 'Reiki com cromoterapia', duracao: 70, valor: 130 },
        { nome: 'Pacote 4 sessões', duracao: 50, valor: 320, descricao: 'Válido por 60 dias' },
      ],
      horarios: [h(1, '14:00', '20:00'), h(2, '14:00', '20:00'), h(3, '10:00', '20:00'), h(4, '14:00', '20:00'), h(5, '10:00', '18:00')],
      avaliacoes: [
        { autor: 'Fernanda L.', nota: 5, dias: 3, texto: 'O espaço é lindo e muito calmo. Ela recebe com chá, parece visita de amiga.' },
        { autor: 'Bruna R.', nota: 5, dias: 22, texto: 'Fazia tempo que eu não relaxava assim. Voltei na semana seguinte.' },
        { autor: 'Camila V.', nota: 4, dias: 33, texto: 'Ótima sessão. O único detalhe é que não tem estacionamento perto, precisei rodar um pouco.' },
        { autor: 'Patrícia G.', nota: 5, dias: 57, texto: 'A cromoterapia junto foi uma surpresa boa. Recomendo.' },
        { autor: 'Letícia F.', nota: 4, dias: 80, texto: 'Gostei bastante, só senti a sessão um pouco curta pro valor.' , resposta: 'Obrigada, Letícia! Criei a opção de 70 minutos justamente por isso.' },
      ],
    },
    {
      id: 't3', nome: 'Lúcia Fontoura', tom: 282,
      bairro: 'Vila Betânia', cidade: 'Cachoeirinha', uf: 'RS',
      endereco: 'Av. Flores da Cunha, 2400 — sala 12',
      lat: -29.94934, lng: -51.08989, verificada: true, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551997330288', instagram: 'lucia.fontoura.apometria',
      terapias: ['Apometria', 'Mesa Radiônica', 'Limpeza Energética'],
      bio: 'Formada em Apometria pela linha do Dr. Lacerda e sigo estudando todo ano. Atendo em Cachoeirinha e também on-line para quem mora longe. Trabalho com agenda enxuta porque prefiro poucos atendimentos bem feitos por semana.',
      servicos: [
        { nome: 'Sessão de Apometria', duracao: 120, valor: 220, descricao: 'Sessão longa, com retorno incluído' },
        { nome: 'Apometria on-line', duracao: 90, valor: 180 },
        { nome: 'Mesa radiônica', duracao: 60, valor: 150 },
      ],
      horarios: [
        h(2, '08:00', '11:30'), h(2, '13:00', '17:00'),
        h(3, '08:00', '11:30'), h(3, '13:00', '17:00'),
        h(4, '08:00', '17:00'), h(5, '08:00', '12:00'), h(6, '08:00', '12:00'),
      ],
      avaliacoes: [
        { autor: 'Sandra B.', nota: 5, dias: 11, texto: 'A sessão de duas horas parece muito, mas passa voando. Ela é extremamente cuidadosa.' },
        { autor: 'Elisandra K.', nota: 5, dias: 26, texto: 'Fiz on-line de Santa Maria e funcionou igual. Não achei que fosse dar certo à distância.' },
        { autor: 'Vera M.', nota: 5, dias: 44, texto: 'Melhor atendimento que já tive na região. Sem enrolação, sem venda de pacote.' },
        { autor: 'Douglas A.', nota: 5, dias: 72, texto: 'Achei por indicação e virei cliente fixo. Vale a viagem.' },
      ],
    },
    {
      id: 't4', nome: 'Bianca Nunes', tom: 322,
      bairro: 'Moinhos de Vento', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Rua Padre Chagas, 90 — conjunto 704',
      lat: -30.02407, lng: -51.20542, verificada: true, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551991887744', instagram: 'biancanunes.theta',
      terapias: ['ThetaHealing', 'Barras de Access', 'Constelação Familiar'],
      bio: 'Facilitadora de ThetaHealing e Barras de Access, com consultório nos Moinhos. Meu trabalho é bem direcionado a crenças que travam decisões — carreira, dinheiro, relacionamento. Também conduzo constelação em grupo uma vez por mês.',
      servicos: [
        { nome: 'ThetaHealing individual', duracao: 90, valor: 260 },
        { nome: 'Barras de Access', duracao: 60, valor: 180 },
        { nome: 'Constelação em grupo', duracao: 180, valor: 200, descricao: 'Um sábado por mês, vagas limitadas' },
      ],
      horarios: [h(1, '08:30', '19:00'), h(2, '08:30', '19:00'), h(3, '08:30', '19:00'), h(4, '08:30', '19:00'), h(5, '08:30', '16:00')],
      avaliacoes: [
        { autor: 'Renata C.', nota: 5, dias: 2, texto: 'Fui por causa de uma decisão de carreira que estava travada há meses. Saí com clareza.' },
        { autor: 'Tatiane O.', nota: 4, dias: 14, texto: 'Muito boa, e o consultório é impecável. O valor pesa um pouco, mas a sessão é longa.' },
        { autor: 'Aline S.', nota: 3, dias: 30, texto: 'A técnica é boa mas achei o atendimento um pouco corrido no dia, ela estava atrasada.', resposta: 'Aline, peço desculpa por aquele dia. Reduzi o número de horários seguidos para não acontecer de novo.' },
        { autor: 'Michele D.', nota: 5, dias: 48, texto: 'A constelação em grupo foi das experiências mais fortes que já vivi.' },
        { autor: 'Karina P.', nota: 5, dias: 63, texto: 'Já tinha feito Barras antes e a diferença de condução é enorme. Ela conduz muito bem.' },
        { autor: 'Simara L.', nota: 4, dias: 88, texto: 'Bom atendimento, ambiente agradável. Voltarei.' },
      ],
    },
    {
      id: 't5', nome: 'Denise Wachholz', tom: 258,
      bairro: 'Marechal Rondon', cidade: 'Canoas', uf: 'RS',
      endereco: 'Rua Ipiranga, 515',
      lat: -29.92233, lng: -51.16301, verificada: false, ativa: true,
      atendimento: ['presencial'],
      whatsapp: '5551996204411', instagram: 'denise.constelacao',
      terapias: ['Constelação Familiar', 'Apometria'],
      bio: 'Constelo há sete anos e trago a Apometria quando o caso pede uma limpeza antes do trabalho sistêmico. Atendo em Canoas, em sala própria, sempre com hora marcada.',
      servicos: [
        { nome: 'Constelação individual', duracao: 90, valor: 190 },
        { nome: 'Sessão de Apometria', duracao: 80, valor: 160 },
      ],
      horarios: [h(1, '13:00', '19:00'), h(3, '13:00', '19:00'), h(5, '13:00', '19:00'), h(6, '09:00', '14:00')],
      avaliacoes: [
        { autor: 'Cristiane H.', nota: 5, dias: 9, texto: 'A Denise tem uma leitura muito precisa. Em uma sessão entendi coisa que anos de conversa não resolveram.' },
        { autor: 'Rodrigo N.', nota: 5, dias: 35, texto: 'Fui cético e saí impressionado. Recomendo.' },
        { autor: 'Ivana F.', nota: 4, dias: 52, texto: 'Muito boa profissional. A sala é simples, mas isso não atrapalha em nada.' },
        { autor: 'Sônia R.', nota: 5, dias: 91, texto: 'Atendimento humano de verdade.' },
      ],
    },
    {
      id: 't6', nome: 'Cátia Ribas', tom: 214,
      bairro: 'Bom Sucesso', cidade: 'Gravataí', uf: 'RS',
      endereco: 'Rua Dr. Barcelos, 88',
      lat: -29.92362, lng: -51.03653, verificada: false, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551995117823', instagram: null,
      terapias: ['Radiestesia', 'Cristaloterapia', 'Limpeza Energética'],
      bio: 'Trabalho com radiestesia e cristais, principalmente em análise de ambiente e de objetos. Atendo em Gravataí e faço avaliação à distância com foto e planta da casa.',
      servicos: [
        { nome: 'Análise radiestésica de ambiente', duracao: 90, valor: 170 },
        { nome: 'Sessão com cristais', duracao: 60, valor: 110 },
        { nome: 'Avaliação à distância', duracao: 45, valor: 90 },
      ],
      horarios: [h(2, '09:00', '18:00'), h(4, '09:00', '18:00'), h(6, '09:00', '16:00'), h(0, '14:00', '18:00')],
      avaliacoes: [
        { autor: 'Josiane M.', nota: 5, dias: 16, texto: 'Ela achou o ponto da casa que me incomodava sem eu falar nada. Fiquei de queixo caído.' },
        { autor: 'Paulo R.', nota: 4, dias: 38, texto: 'Trabalho sério e preço justo. Demorou um pouco pra responder no WhatsApp.' },
        { autor: 'Neusa T.', nota: 4, dias: 74, texto: 'Gostei. Achei que ficaria mais tempo, mas o resultado veio.' },
        { autor: 'Adriana Q.', nota: 4, dias: 110, texto: 'Boa profissional, atenciosa.' },
      ],
    },
    {
      id: 't7', nome: 'Simone Baptista', tom: 340,
      bairro: 'Petrópolis', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Rua Veador Porto, 640 — sala 3',
      lat: -30.03941, lng: -51.18302, verificada: false, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551987554120', instagram: 'simonebaptista.aroma',
      terapias: ['Aromaterapia', 'Reiki', 'Cromoterapia'],
      bio: 'Aromaterapeuta com formação clínica. Monto blends personalizados para cada pessoa e uso o Reiki como apoio. Atendo no Petrópolis, num prédio com elevador e acesso fácil.',
      servicos: [
        { nome: 'Consulta em aromaterapia', duracao: 70, valor: 140, descricao: 'Inclui um blend personalizado' },
        { nome: 'Sessão de Reiki', duracao: 50, valor: 95 },
        { nome: 'Acompanhamento mensal', duracao: 60, valor: 120 },
      ],
      horarios: [h(1, '09:00', '19:00'), h(2, '09:00', '19:00'), h(3, '09:00', '19:00'), h(4, '09:00', '19:00'), h(5, '09:00', '19:00'), h(6, '10:00', '15:00')],
      avaliacoes: [
        { autor: 'Roberta A.', nota: 5, dias: 5, texto: 'O blend que ela fez pra mim virou item fixo da minha rotina. Cheiro maravilhoso e me acalma mesmo.' },
        { autor: 'Vanessa C.', nota: 5, dias: 21, texto: 'Ela explica a função de cada óleo, não é achismo. Gostei muito.' },
        { autor: 'Márcia B.', nota: 4, dias: 46, texto: 'Atendimento ótimo, sala um pouco pequena.' },
        { autor: 'Luana E.', nota: 5, dias: 66, texto: 'Já é a terceira vez que volto. Sempre sai melhor do que entrei.' },
        { autor: 'Gisele W.', nota: 4, dias: 102, texto: 'Boa profissional e muito pontual.' },
      ],
    },
    {
      id: 't8', nome: 'Neusa Trindade', tom: 292,
      bairro: 'Sarandi', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Av. Assis Brasil, 5900 — sala 208',
      lat: -29.99859, lng: -51.12496, verificada: true, ativa: true,
      atendimento: ['presencial'],
      whatsapp: '5551992048866', instagram: 'neusa.trindade.terapias',
      terapias: ['Apometria', 'Tarô Terapêutico', 'Limpeza Energética'],
      bio: 'Atendo no Sarandi há quase vinte anos, no mesmo endereço. Faço Apometria e uso o tarô como leitura de apoio, nunca como previsão. Quem chega aqui sabe que vai ouvir a verdade com cuidado.',
      servicos: [
        { nome: 'Sessão de Apometria', duracao: 90, valor: 150 },
        { nome: 'Leitura terapêutica com tarô', duracao: 60, valor: 100 },
        { nome: 'Apometria + leitura', duracao: 120, valor: 220 },
      ],
      horarios: [h(1, '08:00', '18:00'), h(2, '08:00', '18:00'), h(3, '08:00', '18:00'), h(4, '08:00', '18:00'), h(5, '08:00', '18:00'), h(6, '08:00', '12:00')],
      avaliacoes: [
        { autor: 'Marlene S.', nota: 5, dias: 4, texto: 'Vou nela há oito anos. Nunca me deu uma resposta pronta, sempre me fez pensar.' },
        { autor: 'Jéssica P.', nota: 5, dias: 12, texto: 'Chegei chorando e saí de pé. Ela é firme e acolhedora ao mesmo tempo.' },
        { autor: 'Eliane G.', nota: 5, dias: 29, texto: 'Preço muito honesto pelo tempo de sessão.' },
        { autor: 'Cleber M.', nota: 4, dias: 55, texto: 'Excelente atendimento. A sala fica num prédio meio confuso, vale chegar mais cedo.' },
        { autor: 'Rosa H.', nota: 5, dias: 77, texto: 'É daquelas pessoas que a gente indica sem medo.', resposta: 'Gratidão, Rosa. Um abraço.' },
        { autor: 'Fabiana R.', nota: 5, dias: 120, texto: 'Vinte anos no mesmo lugar já diz muita coisa. Recomendo demais.' },
      ],
    },
    {
      id: 't9', nome: 'Priscila Amaral', tom: 12,
      bairro: 'Menino Deus', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Rua José de Alencar, 220 — apto 501',
      lat: -30.0557, lng: -51.22395, verificada: false, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551994778201', instagram: 'pri.amaral.access',
      terapias: ['Barras de Access', 'Limpeza Energética'],
      bio: 'Facilitadora de Barras de Access, formada em 2024. Atendo no Menino Deus, em horários flexíveis, inclusive à noite para quem trabalha durante o dia. Estou começando e por isso mantenho um valor de entrada.',
      servicos: [
        { nome: 'Barras de Access', duracao: 60, valor: 100 },
        { nome: 'Barras + limpeza energética', duracao: 90, valor: 140 },
      ],
      horarios: [h(1, '18:00', '22:00'), h(2, '18:00', '22:00'), h(3, '18:00', '22:00'), h(4, '18:00', '22:00'), h(6, '09:00', '17:00'), h(0, '09:00', '13:00')],
      avaliacoes: [
        { autor: 'Débora L.', nota: 5, dias: 7, texto: 'Ela é nova de formação mas conduz com muita segurança. E o horário da noite salvou minha vida.' },
        { autor: 'Tais M.', nota: 4, dias: 25, texto: 'Gostei bastante. Ainda está montando o espaço, dá pra ver que é começo, mas o atendimento é bom.' },
        { autor: 'Amanda F.', nota: 3, dias: 60, texto: 'Sessão boa, mas atrasou vinte minutos pra me atender.', resposta: 'Amanda, obrigada por avisar. Passei a deixar intervalo maior entre os horários.' },
      ],
    },
    {
      id: 't10', nome: 'Vera Lúcia Machado', tom: 275,
      bairro: 'Centro', cidade: 'Viamão', uf: 'RS',
      endereco: 'Rua Ary Tarrago, 130',
      lat: -30.08164, lng: -51.02763, verificada: true, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551996330177', instagram: 'veraluciamachado.apometria',
      terapias: ['Apometria', 'Mesa Radiônica', 'Limpeza Energética', 'Radiestesia'],
      bio: 'Apometra e radiestesista. Atendo em Viamão e faço mesa radiônica à distância para todo o estado. Sou de falar pouco e trabalhar muito: a sessão é o centro, não a conversa em volta.',
      servicos: [
        { nome: 'Sessão de Apometria', duracao: 100, valor: 170 },
        { nome: 'Mesa radiônica semanal', duracao: 30, valor: 80, descricao: 'Acompanhamento à distância' },
        { nome: 'Limpeza de ambiente', duracao: 90, valor: 200 },
      ],
      horarios: [h(1, '09:00', '17:00'), h(2, '09:00', '17:00'), h(4, '09:00', '17:00'), h(5, '09:00', '17:00'), h(6, '09:00', '13:00')],
      avaliacoes: [
        { autor: 'Ivete C.', nota: 5, dias: 8, texto: 'Direta e competente. Não perde tempo e resolve.' },
        { autor: 'Silvana B.', nota: 5, dias: 27, texto: 'Faço a mesa semanal com ela há um ano. Mudou a minha rotina.' },
        { autor: 'Jorge A.', nota: 4, dias: 51, texto: 'Bom atendimento. Achei o deslocamento até Viamão o único ponto ruim, mas isso é problema meu.' },
        { autor: 'Terezinha O.', nota: 5, dias: 83, texto: 'Cuidadosa e muito ética. Nunca me empurrou sessão extra.' },
        { autor: 'Nadia S.', nota: 5, dias: 104, texto: 'Recomendo de olhos fechados.' },
      ],
    },
    {
      id: 't11', nome: 'Elaine Kroth', tom: 190,
      bairro: 'Tristeza', cidade: 'Porto Alegre', uf: 'RS',
      endereco: 'Av. Wenceslau Escobar, 2700 — sala 9',
      lat: -30.11032, lng: -51.25667, verificada: false, ativa: true,
      atendimento: ['presencial'],
      whatsapp: '5551988220945', instagram: 'elainekroth.cromo',
      terapias: ['Cromoterapia', 'Cristaloterapia'],
      bio: 'Cromoterapeuta, atendo na Tristeza em sala compartilhada. Trabalho principalmente com quem tem dificuldade de sono e ansiedade leve, sempre como apoio a um acompanhamento de saúde, nunca no lugar dele.',
      servicos: [
        { nome: 'Sessão de cromoterapia', duracao: 50, valor: 85 },
        { nome: 'Cromo + cristais', duracao: 70, valor: 120 },
      ],
      horarios: [h(2, '14:00', '20:00'), h(4, '14:00', '20:00'), h(6, '09:00', '13:00')],
      avaliacoes: [
        { autor: 'Carla D.', nota: 4, dias: 13, texto: 'Sessão bem tranquila, gostei do jeito dela. A sala é dividida e às vezes dá pra escutar a sala do lado.' },
        { autor: 'Márcio V.', nota: 3, dias: 42, texto: 'Foi ok. Esperava mais explicação sobre o que estava sendo feito.', resposta: 'Márcio, valeu o retorno. Passei a explicar o processo antes de começar.' },
        { autor: 'Beatriz N.', nota: 5, dias: 70, texto: 'Me ajudou muito no período em que eu não conseguia dormir. Preço acessível.' },
        { autor: 'Helena F.', nota: 4, dias: 99, texto: 'Boa profissional, honesta sobre os limites do trabalho dela. Isso vale muito.' },
      ],
    },
    {
      id: 't12', nome: 'Tânia Boaventura', tom: 330,
      bairro: 'Centro', cidade: 'Alvorada', uf: 'RS',
      endereco: 'Av. Presidente Getúlio Vargas, 980',
      lat: -30.00033, lng: -51.07526, verificada: false, ativa: true,
      atendimento: ['presencial', 'online'],
      whatsapp: '5551991660534', instagram: 'taniaboaventura.terapias',
      terapias: ['ThetaHealing', 'Reiki', 'Aromaterapia'],
      bio: 'Atendo em Alvorada, perto do centro, e on-line à noite. Combino ThetaHealing com Reiki conforme o momento de cada pessoa. Tenho horário aos domingos porque muita gente só consegue nesse dia.',
      servicos: [
        { nome: 'ThetaHealing', duracao: 80, valor: 160 },
        { nome: 'Reiki', duracao: 50, valor: 90 },
        { nome: 'Sessão combinada', duracao: 100, valor: 200 },
      ],
      horarios: [h(1, '09:00', '20:00'), h(3, '09:00', '20:00'), h(5, '09:00', '20:00'), h(0, '09:00', '16:00')],
      avaliacoes: [
        { autor: 'Luciana M.', nota: 5, dias: 10, texto: 'O domingo salvou. Trabalho a semana toda e nunca conseguia encaixar terapia.' },
        { autor: 'Kelly S.', nota: 4, dias: 31, texto: 'Muito boa. A sala fica no segundo andar sem elevador, fica o aviso.' },
        { autor: 'Raquel P.', nota: 5, dias: 58, texto: 'Ela tem uma calma que contagia. Saí de lá outra pessoa.' },
        { autor: 'Diego T.', nota: 4, dias: 86, texto: 'Bom atendimento e valor justo pra região.' },
      ],
    },
  ];

  /* ------------------------------- do plano cartesiano para o mundo real
     O protótipo nasceu num plano (120 px = 1 km) porque não havia mapa de
     verdade. Com mapa real o que vale é latitude e longitude — e as duas vistas
     têm de concordar, senão o mesmo pino cai numa esquina no mapa desenhado e
     noutra no mapa real, e ninguém percebe até alguém comparar.

     Por isso a conversão mora AQUI, uma vez só, e é usada pelo mapa desenhado,
     pelo mapa real e pelo gerador da semente do banco.

     ⚠️ As coordenadas preservam DISTÂNCIA e direção, ancoradas em Higienópolis.
     Não são os endereços reais dos bairros citados — as pessoas são fictícias e
     os endereços também. */
  const ANCORA = { lat: -30.01382, lng: -51.18227 };   // Higienópolis, Porto Alegre
  const KM_POR_GRAU_LAT = 111.32;
  const KM_POR_GRAU_LNG = KM_POR_GRAU_LAT * Math.cos((ANCORA.lat * Math.PI) / 180);

  function paraLatLng(x, y) {
    return {
      lat: +(ANCORA.lat - ((y - EU.y) / MUNDO.pxPorKm) / KM_POR_GRAU_LAT).toFixed(6),
      lng: +(ANCORA.lng + ((x - EU.x) / MUNDO.pxPorKm) / KM_POR_GRAU_LNG).toFixed(6),
    };
  }

  /* Distância real em km. No plano dava para usar Pitágoras; sobre a esfera,
     não — e a diferença aparece justamente nas terapeutas mais longe, que são
     as que o filtro de distância vai cortar. */
  function distanciaEntre(a, b) {
    const R = 6371;
    const rad = (g) => (g * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2
            + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function paraPlano(lat, lng) {
    return {
      x: EU.x + (lng - ANCORA.lng) * KM_POR_GRAU_LNG * MUNDO.pxPorKm,
      y: EU.y - (lat - ANCORA.lat) * KM_POR_GRAU_LAT * MUNDO.pxPorKm,
    };
  }


  /* ------------------------------------------- derivados (nunca à mão) */
  // Nota média, total de avaliações e faixa de preço são CALCULADOS, como manda
  // o arquivo 03 ("nota média sempre calculada, nunca editável à mão").
  TERAPEUTAS.forEach((t) => {
    const notas = t.avaliacoes.map((a) => a.nota);
    t.total = notas.length;
    t.nota = notas.length ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10 : 0;
    const valores = t.servicos.map((s) => s.valor);
    t.precoMin = Math.min(...valores);
    t.precoMax = Math.max(...valores);
    // A coordenada REAL é o que está escrito; o plano do mapa desenhado é
    // derivado dela. Era o contrário até o mapa de ruas entrar — e aí o bairro
    // escrito deixou de bater com o lugar onde o pino caía.
    Object.assign(t, paraPlano(t.lat, t.lng));
    t.distanciaKm = Math.round(distanciaEntre(EU, t) * 10) / 10;
    t.iniciais = t.nome.split(' ').filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join('');
  });

  /* --------------------------------------------- mudar de onde se olha
     Trocar a posição NÃO é só mover o ponto azul: toda distância exibida, e a
     ordem da lista, saem dela. Recalcular aqui, num lugar só, é o que impede a
     tela de mostrar "2,9 km" para quem está a 400 km. */
  function recalcularDistancias() {
    TERAPEUTAS.forEach((t) => {
      t.distanciaKm = Math.round(distanciaEntre(EU, t) * 10) / 10;
    });
  }

  const POSICAO_FICTICIA = { lat: -30.01382, lng: -51.18227,
                             bairro: 'Higienópolis', cidade: 'Porto Alegre' };

  function definirPosicao({ lat, lng, precisao = null, origem = 'gps', bairro, cidade }) {
    EU.lat = lat;
    EU.lng = lng;
    EU.precisao = precisao;
    EU.origem = origem;
    if (bairro !== undefined) EU.bairro = bairro;
    if (cidade !== undefined) EU.cidade = cidade;
    Object.assign(EU, paraPlano(lat, lng));   // o mapa desenhado vive no plano
    recalcularDistancias();
  }

  function restaurarPosicaoFicticia() {
    definirPosicao({ ...POSICAO_FICTICIA, origem: 'ficticia', precisao: null });
  }


  /* --------------------------------------------------- estado do app */
  // Tudo em memória. Nada é gravado — nem localStorage, como pede o briefing.
  const estado = {
    papel: null,              // 'cliente' | 'terapeuta'
    entrouPor: null,          // 'google' | 'celular'
    nomeUsuario: 'Você',
    celular: '',
    localizacao: null,        // 'concedida' | 'cidade' | null
    cidadeEscolhida: null,
    favoritos: new Set(),
    minhasAvaliacoes: {},     // { terapeutaId: {nota, texto, dias} }
    denuncias: [],
    aba: 'mapa',              // aba ativa do cliente
    modo: 'mapa',             // 'mapa' | 'lista'
    busca: '',
    filtros: { terapias: new Set(), precoMax: null, notaMin: null, abertaAgora: false, online: false, presencial: false, distanciaMax: null },
    // Perfil que a terapeuta monta no assistente
    perfil: {
      nome: '', bio: '', foto: null, tom: 268,
      endereco: '', bairro: '', cidade: 'Porto Alegre', uf: 'RS',
      x: EU.x, y: EU.y, lat: EU.lat, lng: EU.lng,
      terapias: new Set(), servicos: [], horarios: [],
      whatsapp: '', instagram: '', atendimento: new Set(['presencial']),
      visivel: true,
    },
    passo: 0,
    // Relógio da demonstração: permite testar "aberta agora" em qualquer horário
    relogio: null,            // null = hora real | {dia, hora, minuto}

    // Avaliações que a TERAPEUTA recebeu — para exercitar o fluxo de resposta
    avaliacoesRecebidas: [
      { autor: 'Carolina M.', nota: 5, dias: 2, texto: 'Atendimento maravilhoso, saí muito mais leve. Já quero marcar a próxima.', resposta: null },
      { autor: 'Jaqueline P.', nota: 4, dias: 9, texto: 'Gostei bastante da sessão. Só achei difícil achar o endereço na primeira vez.', resposta: null },
      { autor: 'Márcia T.', nota: 5, dias: 24, texto: 'Profissional atenciosa e pontual. Recomendo para quem está começando.', resposta: 'Obrigada, Márcia! Fico feliz que tenha sido bom. Até a próxima.' },
    ],

    // Números do painel da terapeuta (fictícios, só para mostrar o formato)
    metricas: {
      visualizacoes: 148, cliques: 23, nota: 4.7, favoritos: 12,
      semana: [12, 19, 26, 31, 22, 24, 14],
    },
  };

  /* ---------------------------------------------------------- horário */
  function agora() {
    if (estado.relogio) {
      const d = new Date();
      d.setHours(estado.relogio.hora, estado.relogio.minuto, 0, 0);
      // desloca o dia da semana sem mudar o resto
      const delta = estado.relogio.dia - d.getDay();
      d.setDate(d.getDate() + delta);
      return d;
    }
    return new Date();
  }

  const emMinutos = (hhmm) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    return hh * 60 + mm;
  };

  /* "Aberta agora" é calculado no app comparando o relógio com a tabela de
     horários do dia — exatamente como descreve o arquivo 02. */
  function estaAberta(terapeuta, quando = agora()) {
    const dia = quando.getDay();
    const min = quando.getHours() * 60 + quando.getMinutes();
    return terapeuta.horarios.some((h) => h.dia === dia && min >= emMinutos(h.abre) && min < emMinutos(h.fecha));
  }

  /* Se está fechada, quando abre de novo? Serve para escrever a verdade
     ("abre amanhã às 9h") em vez de só dizer "fechada". */
  function proximaAbertura(terapeuta, quando = agora()) {
    const diaHoje = quando.getDay();
    const min = quando.getHours() * 60 + quando.getMinutes();
    for (let i = 0; i < 8; i++) {
      const dia = (diaHoje + i) % 7;
      const doDia = terapeuta.horarios.filter((h) => h.dia === dia).sort((a, b) => emMinutos(a.abre) - emMinutos(b.abre));
      for (const h of doDia) {
        if (i > 0 || emMinutos(h.abre) > min) {
          return { emDias: i, dia, abre: h.abre };
        }
      }
    }
    return null;
  }

  function horariosPorDia(terapeuta) {
    return DIAS.map((_, dia) => ({
      dia,
      faixas: terapeuta.horarios.filter((h) => h.dia === dia).sort((a, b) => emMinutos(a.abre) - emMinutos(b.abre)),
    }));
  }

  /* ----------------------------------------------------------- filtro */
  function listar() {
    const f = estado.filtros;
    const busca = estado.busca.trim().toLowerCase();
    return TERAPEUTAS
      .filter((t) => t.ativa)
      .filter((t) => {
        if (busca) {
          const alvo = (t.nome + ' ' + t.terapias.join(' ') + ' ' + t.bairro + ' ' + t.cidade).toLowerCase();
          if (!alvo.includes(busca)) return false;
        }
        if (f.terapias.size && !t.terapias.some((x) => f.terapias.has(x))) return false;
        if (f.precoMax && t.precoMin > f.precoMax) return false;
        if (f.notaMin && t.nota < f.notaMin) return false;
        if (f.abertaAgora && !estaAberta(t)) return false;
        if (f.online && !t.atendimento.includes('online')) return false;
        if (f.presencial && !t.atendimento.includes('presencial')) return false;
        // A distância muda quando o GPS liga — o corte usa a distância VIVA,
        // recalculada em recalcularDistancias(), não a do momento do filtro.
        if (f.distanciaMax && t.distanciaKm > f.distanciaMax) return false;
        return true;
      })
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }

  function filtrosAtivos() {
    const f = estado.filtros;
    return f.terapias.size + (f.precoMax ? 1 : 0) + (f.notaMin ? 1 : 0) + (f.abertaAgora ? 1 : 0) + (f.online ? 1 : 0) + (f.presencial ? 1 : 0) + (f.distanciaMax ? 1 : 0);
  }

  const porId = (id) => TERAPEUTAS.find((t) => t.id === id);

  /* -------------------------------------------------------- formatação */
  const brl = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  function distancia(km) {
    if (km < 1) return Math.round(km * 1000 / 50) * 50 + ' m';
    return km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' km';
  }

  function haQuanto(dias) {
    if (dias === 0) return 'hoje';
    if (dias === 1) return 'ontem';
    if (dias < 7) return `há ${dias} dias`;
    if (dias < 14) return 'há 1 semana';
    if (dias < 30) return `há ${Math.floor(dias / 7)} semanas`;
    if (dias < 60) return 'há 1 mês';
    return `há ${Math.floor(dias / 30)} meses`;
  }

  function duracao(min) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  }

  /* Link do WhatsApp igual ao do app real (arquivo 02) */
  function linkZap(terapeuta) {
    const texto = encodeURIComponent(`Olá, ${terapeuta.nome.split(' ')[0]}! Encontrei o seu perfil no app e gostaria de saber sobre um horário.`);
    return `https://wa.me/${terapeuta.whatsapp}?text=${texto}`;
  }

  /* Distribuição de notas (5→1) para o gráfico de barras do perfil */
  function distribuicao(terapeuta) {
    const d = [0, 0, 0, 0, 0];
    terapeuta.avaliacoes.forEach((a) => { d[5 - a.nota]++; });
    return d;
  }

  return {
    MUNDO, EU, TERAPIAS, DIAS, DIAS_CURTO, TERAPEUTAS, estado,
    ANCORA, paraLatLng, paraPlano, distanciaEntre,
    definirPosicao, restaurarPosicaoFicticia, recalcularDistancias, POSICAO_FICTICIA,
    agora, estaAberta, proximaAbertura, horariosPorDia, emMinutos,
    listar, filtrosAtivos, porId, distribuicao,
    brl, distancia, haQuanto, duracao, linkZap,
  };
})();
