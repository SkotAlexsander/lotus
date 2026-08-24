/* ============================================================================
   04c-gps.js — onde a pessoa está DE VERDADE

   Até aqui o ponto azul era ficção: "Permitir localização" só centralizava o
   mapa num ponto cravado em Higienópolis e o aparelho nunca era consultado.
   Servia enquanto o mapa também era desenhado. Com ruas reais, um ponto azul
   que mente é pior que ponto azul nenhum.

   OS ESTADOS QUE A REALIDADE IMPÕE
   --------------------------------
   Pedir localização não tem duas respostas (sim/não), tem seis — e cada uma
   precisa de uma tela diferente:

     1. o navegador nem oferece      → contexto inseguro, ou aparelho velho
     2. a pessoa nega                → tem de haver caminho sem GPS
     3. a pessoa ignora o aviso      → fica pendurado; daí o `timeout`
     4. o aparelho não consegue      → GPS desligado, dentro de prédio
     5. consegue, mas impreciso      → 2 km de raio não é "onde você está"
     6. consegue e é preciso         → o único caso que costuma ser programado

   ⚠️ CONTEXTO SEGURO É OBRIGATÓRIO. `navigator.geolocation` só existe em https
   ou localhost. Abrir o `index.html` com duplo clique (`file://`) NÃO dá GPS —
   e isso não é defeito, é o navegador protegendo quem abre um arquivo qualquer.
   Por isso `disponivel()` confere `isSecureContext` antes de prometer.
   ========================================================================= */
const Gps = (() => {

  /* Precisão pior que isto não é localização, é bairro. O aviso ao usuário
     muda: dizer "você está aqui" com 3 km de erro é mentir com confiança. */
  const PRECISAO_RUIM_M = 1500;

  /* Os dados de demonstração vivem na Grande Porto Alegre. Quem estiver mais
     longe que isto veria um mapa vazio e concluiria que o app não funciona —
     quando o que falta é terapeuta cadastrada, não localização. */
  const LONGE_DEMAIS_KM = 60;

  function disponivel() {
    return typeof navigator !== 'undefined'
        && 'geolocation' in navigator
        && (window.isSecureContext || location.protocol === 'https:');
  }

  /* Por que não dá para prometer GPS aqui: a razão, em português, para caber
     na tela sem virar "erro 2". */
  function motivoIndisponivel() {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return 'Este navegador não oferece localização.';
    }
    if (location.protocol === 'file:') {
      return 'Abrindo o arquivo direto do computador, o navegador bloqueia a localização. '
           + 'Pelo endereço na internet ela funciona.';
    }
    return 'A localização não está disponível aqui.';
  }

  /* ------------------------------------------------------------- pedir */
  /*
     `enableHighAccuracy` liga o GPS do aparelho em vez de só a rede. Custa
     bateria e tempo — e é a diferença entre "seu bairro" e "sua rua", que é
     justamente o que este app precisa.

     `maximumAge: 60000` aceita uma posição de até um minuto atrás: quem acabou
     de abrir o mapa de outro app já tem uma leitura boa, e reusá-la evita
     segurar a pessoa esperando o satélite.
  */
  function pedir({ aoObter, aoFalhar, tempoLimite = 12000 }) {
    if (!disponivel()) {
      aoFalhar({ tipo: 'indisponivel', mensagem: motivoIndisponivel() });
      return;
    }

    let respondeu = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (respondeu) return;
        respondeu = true;
        aoObter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: Math.round(pos.coords.accuracy || 0),
          imprecisa: (pos.coords.accuracy || 0) > PRECISAO_RUIM_M,
        });
      },
      (erro) => {
        if (respondeu) return;
        respondeu = true;
        // Os códigos são 1, 2 e 3. Ninguém entende "erro 2" — cada um vira frase.
        const mapa = {
          1: { tipo: 'negado', mensagem: 'Você não permitiu o acesso à localização.' },
          2: { tipo: 'falhou', mensagem: 'O aparelho não conseguiu obter a localização agora. '
                                       + 'Perto de uma janela ou ao ar livre costuma resolver.' },
          3: { tipo: 'demorou', mensagem: 'A localização está demorando demais para responder.' },
        };
        aoFalhar(mapa[erro && erro.code] || { tipo: 'falhou', mensagem: 'Não deu para obter a localização.' });
      },
      { enableHighAccuracy: true, timeout: tempoLimite, maximumAge: 60000 }
    );
  }

  /* --------------------------------------------------- acompanhar o passo */
  /* Quem anda com o app aberto espera o ponto azul acompanhar. `watchPosition`
     faz isso — e devolve uma função de PARAR, que tem de ser chamada ao sair do
     mapa: um observador esquecido é bateria consumida com a tela em outra aba. */
  function acompanhar(aoMover) {
    if (!disponivel()) return () => {};
    const id = navigator.geolocation.watchPosition(
      (pos) => aoMover({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        precisao: Math.round(pos.coords.accuracy || 0),
        imprecisa: (pos.coords.accuracy || 0) > PRECISAO_RUIM_M,
      }),
      () => {},                                   // falha em observação é silêncio
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );
    return () => { try { navigator.geolocation.clearWatch(id); } catch (_) {} };
  }

  /* ------------------------------------------------ longe dos dados? */
  /* Uma pessoa em Recife abriria o app, veria o mapa da rua dela e ZERO
     terapeutas — e concluiria que está quebrado. Está certo: as 12 são ficção
     e moram na Grande Porto Alegre. Dizer isso é melhor que deixar deduzir. */
  function longeDosDados(lat, lng) {
    const d = Dados.distanciaEntre({ lat, lng }, Dados.ANCORA);
    return { longe: d > LONGE_DEMAIS_KM, km: Math.round(d) };
  }

  /* ----------------------------------------- que lugar é este? (opcional) */
  /* Só para escrever "Petrópolis, Porto Alegre" em vez de dois números na tela
     da conta. Falha em silêncio de propósito: é enfeite, não pode segurar nada.

     Uma consulta por vez, com identificação — a política do Nominatim é a mesma
     do geocodificador de bairros. */
  function ondeEstou(lat, lng, aoSaber) {
    const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14'
              + `&lat=${lat}&lon=${lng}`;
    fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || !d.address) return;
        const a = d.address;
        aoSaber({
          bairro: a.suburb || a.neighbourhood || a.city_district || a.town || a.village || '',
          cidade: a.city || a.town || a.municipality || a.county || '',
        });
      })
      .catch(() => {});
  }

  return { disponivel, motivoIndisponivel, pedir, acompanhar, longeDosDados, ondeEstou, PRECISAO_RUIM_M };
})();
