/* ============================================================================
   ferramentas/geocodificar_bairros.js — onde ficam de verdade os bairros

   POR QUE EXISTE
   --------------
   As 12 terapeutas fictícias foram posicionadas num plano cartesiano inventado,
   quando não havia mapa de ruas. Com o mapa real, o bairro ESCRITO no perfil
   passou a não bater com o lugar onde o pino cai — "Centro Histórico" pousando
   na Cidade Baixa. Ninguém via isso no mapa desenhado; no mapa real é a primeira
   coisa que uma terapeuta da região percebe, e derruba a confiança na tela toda.

   Este script pergunta ao Nominatim (o geocodificador do OpenStreetMap) onde
   cada bairro fica, e imprime as coordenadas para entrarem em `src/03-dados.js`.

   ⚠️ POLÍTICA DE USO do Nominatim, respeitada aqui:
     · no máximo 1 consulta por segundo  → há uma pausa de 1,1 s entre elas
     · User-Agent que identifique a aplicação → enviado abaixo
     · não usar para volume  → são 13 consultas, uma única vez

   Roda UMA vez. O resultado é copiado para dentro de src/03-dados.js, e o
   Nominatim nunca mais é chamado — nem pelo app, nem pela bancada.

   Uso: node ferramentas/geocodificar_bairros.js
   ========================================================================== */
const https = require('https');

const UA = 'MapaHolistico-prototipo/0.1 (https://github.com/SkotAlexsander/lotus)';

const LUGARES = [
  { chave: 'EU',  busca: 'Higienópolis, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't1',  busca: 'Centro Histórico, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't2',  busca: 'Bom Fim, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't3',  busca: 'Vila Betânia, Cachoeirinha, Rio Grande do Sul, Brasil' },
  { chave: 't4',  busca: 'Moinhos de Vento, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't5',  busca: 'Marechal Rondon, Canoas, Rio Grande do Sul, Brasil' },
  { chave: 't6',  busca: 'Bom Sucesso, Gravataí, Rio Grande do Sul, Brasil' },
  { chave: 't7',  busca: 'Petrópolis, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't8',  busca: 'Sarandi, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't9',  busca: 'Menino Deus, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't10', busca: 'Centro, Viamão, Rio Grande do Sul, Brasil' },
  { chave: 't11', busca: 'Tristeza, Porto Alegre, Rio Grande do Sul, Brasil' },
  { chave: 't12', busca: 'Centro, Alvorada, Rio Grande do Sul, Brasil' },
];

function consultar(texto) {
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q='
            + encodeURIComponent(texto);
  return new Promise((ok, falha) => {
    https.get(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR' } }, (res) => {
      const partes = [];
      res.on('data', (d) => partes.push(d));
      res.on('end', () => {
        try { ok(JSON.parse(Buffer.concat(partes).toString('utf8'))); }
        catch (e) { falha(new Error('resposta ilegível: ' + e.message)); }
      });
    }).on('error', falha);
  });
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('\n  Perguntando ao Nominatim (1 consulta por segundo, como manda a política)\n');
  const achados = {};
  for (const l of LUGARES) {
    const r = await consultar(l.busca);
    if (!r || !r.length) {
      console.log(`  ${l.chave.padEnd(4)} NÃO ENCONTRADO — ${l.busca}`);
    } else {
      const lat = +Number(r[0].lat).toFixed(5);
      const lng = +Number(r[0].lon).toFixed(5);
      achados[l.chave] = { lat, lng };
      console.log(`  ${l.chave.padEnd(4)} ${String(lat).padEnd(10)} ${String(lng).padEnd(10)} ${r[0].display_name.slice(0, 60)}`);
    }
    await dormir(1100);
  }

  console.log('\n  ---- para colar em src/03-dados.js ----\n');
  for (const [k, v] of Object.entries(achados)) {
    console.log(`  ${k}: lat: ${v.lat}, lng: ${v.lng},`);
  }

  // distância de cada uma até a usuária, para conferir se ficou plausível
  const EU = achados.EU;
  if (EU) {
    console.log('\n  ---- distância até Higienópolis ----');
    for (const [k, v] of Object.entries(achados)) {
      if (k === 'EU') continue;
      const dLat = (v.lat - EU.lat) * 111.32;
      const dLng = (v.lng - EU.lng) * 111.32 * Math.cos(EU.lat * Math.PI / 180);
      console.log(`  ${k.padEnd(4)} ${Math.hypot(dLat, dLng).toFixed(1)} km`);
    }
  }
})().catch((e) => { console.error('FALHOU: ' + e.message); process.exit(1); });
