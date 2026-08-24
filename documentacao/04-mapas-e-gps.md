# 04 — Mapas e GPS

## 1. Dois motores, a mesma forma

Há dois mapas no app e o `06-app.js` **não sabe qual está usando**:

| Motor | Arquivo | Quando |
|---|---|---|
| **real** | `04b-mapa-real.js` — MapLibre + OpenFreeMap | sempre que o MapLibre carregou |
| **desenhado** | `04-mapa.js` — traçado urbano gerado por código | sem internet, CDN fora, navegador antigo |

Os dois devolvem o mesmo objeto de `montar()`:

```js
{ motor, centralizar(lat, lng, nivel, animado), atualizarPins(), selecionar(id),
  atualizarEu(), definirOffsetTopo(v), definirOffsetBaixo(v), ajustarZoom(f),
  destruir(), zoom }
```

`nivel` é semântico — `'regiao'` ou `'pessoa'` — porque as escalas dos dois
motores não têm nada a ver (0,28–2,0 contra 0–22). O app diz "mostra a região";
cada motor traduz para o seu número.

A escolha acontece em `montarMapa()`:

```js
mapaCtrl = MapaReal.disponivel()
  ? MapaReal.montar(el, opcoes)
  : Mapa.montar(el, { ...opcoes, zoom: Mapa.ZOOM_INICIAL });
```

E a promessa "sem internet o app continua inteiro" tem prova própria:
`teste/sem-mapa-real.js` **bloqueia** o MapLibre e os tiles na rede e confere
que o app sobe com o motor desenhado, 12 pinos, folha abrindo, zero erro de
JavaScript. Promessa sem medição é frase de README.

## 2. Por que OpenFreeMap, e não Google nem os tiles do OSM

- **Google Maps**: o crédito de US$ 200/mês acabou em março de 2025. Hoje são
  cotas por SKU, exige cartão cadastrado e **não tem teto de gasto por padrão**.
  Num site público a chave fica exposta (só dá para restringir por domínio).
- **Tiles do próprio openstreetmap.org**: a [política de uso](https://operations.osmfoundation.org/policies/tiles/)
  proíbe consumo em escala de aplicação — os servidores vivem de doação.
- **[OpenFreeMap](https://openfreemap.org)**: os mesmos dados do OSM, servidos
  sem chave, sem cadastro e sem limite. Estilo `positron` — claro e
  dessaturado, exatamente o que o arquivo 05 do briefing pede para os pinos
  violeta saltarem.

O MapLibre vem do CDN com **versão fixa** (`5.6.1`) e `defer`: apontar para "a
mais nova" faz o app quebrar sozinho no dia em que a biblioteca mudar. A 6.5.0
foi testada e o caminho `/dist/maplibre-gl.js` não existe nela.

**A atribuição é obrigação de licença.** Foi conferido que o JSON do estilo
vem com `attribution: null`, mas o TileJSON que ele carrega **traz** o crédito e
o MapLibre o mostra sozinho. A primeira versão escrevia o crédito por cima e o
resultado era *"OpenFreeMap · OpenStreetMap | OpenFreeMap © OpenMapTiles from
OpenStreetMap"* — duas vezes, meia tela. Ler o JSON não bastava; foi preciso
olhar. Hoje é o `AttributionControl` compacto, recolhido num (i).

## 3. A coordenada é a fonte; o plano é derivado

O protótipo nasceu num plano cartesiano (120 px = 1 km) porque não havia mapa
de ruas. Com o mapa real entrou o problema que ninguém via: **o bairro escrito
no perfil não batia com o lugar onde o pino caía** — "Centro Histórico"
pousando na Cidade Baixa. Uma terapeuta da região perceberia na hora, e a
confiança na tela inteira iria junto.

A correção foi **inverter a arquitetura**, em `03-dados.js`:

```js
// ANTES: x/y escritos, lat/lng calculado — o bairro era ficção
// AGORA: lat/lng escritos, x/y calculado — o plano segue a realidade
Object.assign(t, paraPlano(t.lat, t.lng));
t.distanciaKm = Math.round(distanciaEntre(EU, t) * 10) / 10;   // haversine
```

As 12 coordenadas vieram do **Nominatim** (o geocodificador do OSM) pelo bairro
escrito — `ferramentas/geocodificar_bairros.js`, que respeita a política deles
(1 consulta/segundo, User-Agent identificado) e rodou **uma vez**. O resultado
foi copiado para `03-dados.js`; o app nunca chama o Nominatim.

⚠️ As coordenadas são o **centroide do bairro**, não um endereço. As pessoas são
fictícias e os endereços também. Servem para exercitar a busca geográfica com
dados plausíveis, não para navegar até lá.

A distância passou a ser **haversine**, não Pitágoras no plano — a diferença
aparece justamente nas terapeutas mais longe, que são as que o filtro de
distância vai cortar. Os rótulos de bairro do mapa desenhado **saem dos próprios
dados** (`bairrosDoMapa()`): antes eram uma lista à parte, cravada no plano
antigo, e ficou apontando para o lugar errado sem ninguém notar — decoração
errada é o defeito que ninguém reporta.

## 4. GPS — os seis finais de um pedido

`04c-gps.js` existe porque "pedir localização" não tem duas respostas. Tem seis,
e cada uma precisa de uma tela:

| # | O que aconteceu | O que o app faz |
|---|---|---|
| 1 | o navegador nem oferece (contexto inseguro, aparelho velho) | explica o motivo em português e oferece a cidade |
| 2 | a pessoa nega | modo cidade, sem drama — é um direito, e a tela diz por quê |
| 3 | a pessoa ignora o aviso | `timeout` de 12 s; sem ele fica pendurado para sempre |
| 4 | o aparelho não consegue (GPS desligado, dentro de prédio) | avisa e oferece a cidade |
| 5 | consegue, **mas impreciso** (> 1500 m) | mostra o círculo, avisa que a precisão é ruim |
| 6 | consegue e é preciso | o único caso que costuma ser programado |

Mais um que a demonstração impõe: **longe demais** (> 60 km de Porto Alegre).
Os dados vivem na Grande POA; quem estiver em São Paulo veria um mapa vazio e
concluiria que o app não funciona — quando o que falta é terapeuta cadastrada.
A tela diz isso.

⚠️ **Contexto seguro é obrigatório.** `navigator.geolocation` só existe em
`https` ou `localhost`. Abrir o `index.html` com duplo clique (`file://`) **não
dá GPS** — e isso é o navegador protegendo quem abre um arquivo qualquer, não
defeito. `Gps.disponivel()` confere `isSecureContext` antes de prometer, e é por
isso que o app está no GitHub Pages (HTTPS) e o APK serve por
`appassets.androidplatform.net` (origem segura).

### O ponto azul não mente

A posição obtida vem com `precisao` em metros. O círculo em volta do ponto é
esse raio, **convertido de metros para pixels a cada zoom**. Desenhar só o
ponto afirmaria uma certeza que o aparelho não tem — e num app cuja pergunta é
"quem está perto de mim", 30 m e 2 km dão respostas diferentes.

### No Android

O WebView pede a permissão ao sistema por
`onGeolocationPermissionsShowPrompt` → `requestPermissions(ACCESS_FINE_LOCATION)`
→ `onRequestPermissionsResult` responde ao WebView. O manifesto declara as duas
(`FINE` e `COARSE`) com `hardware.location required=false`: tablet sem GPS
instala e usa o modo cidade.

## 5. Acompanhar a posição sem derrubar a tela

`watchPosition` pode pulsar a cada segundo. A primeira versão re-renderizava a
**lista inteira** a cada pulso — parada num semáforo, com o GPS oscilando 3 m
para lá e para cá, a pessoa veria a rolagem saltar e os cartões piscarem.

A régua em `seguirPosicao()`: só vale recalcular quando o passo **muda alguma
resposta**. 25 m não trocam a ordem de ninguém num raio de quilômetros; o ponto
azul, esse sim, acompanha cada pulso — mover um marcador custa quase nada.

```js
const andou = Dados.distanciaEntre(ultima, pos) * 1000;   // metros
if (andou < 25) { /* move só o ponto azul */ return; }
/* passo real: recalcula distâncias e, se estiver na lista, reordena */
```

## 6. As provas

| Bancada | O que mede |
|---|---|
| `teste/bancada.js` | 12 pinos no motor ativo; arrasto 1:1; `centralizar` chega (erro 0 m); filtros; tempo de volta ao mapa |
| `teste/gps.js` | permissão concedida perto (ponto azul + círculo), concedida longe (aviso), negada (modo cidade) — com posição simulada pelo navegador |
| `teste/sem-mapa-real.js` | o plano B com o MapLibre bloqueado |
| `teste/sonda-mapa.js` | diagnóstico: tempo até os pinos (~1,5 s, depois do estilo baixar), e a inércia do MapLibre sob mouse sintético (0 m — por isso não é asserida) |

⚠️ **NÃO FOI POSSÍVEL VALIDAR:** GPS de verdade em aparelho físico (emulador
usa posição injetada), pinça com dois dedos reais, e o comportamento com o
sinal de satélite fraco em rua estreita.
