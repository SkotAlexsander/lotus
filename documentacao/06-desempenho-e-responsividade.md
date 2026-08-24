# 06 — Desempenho e responsividade

"Parece lento" não é diagnóstico. Este documento registra **os números com
régua** que o app tem de respeitar, os defeitos de desempenho já pagos, e as
larguras em que ele foi provado.

## 1. Os orçamentos — e onde são cobrados

Cada um é uma prova em `teste/bancada.js`. Estourou, é regressão — e o commit
que estourou é o culpado, não "o app foi ficando lento".

| Orçamento | Limite | Medido | Por quê esse limite |
|---|---|---|---|
| voltar ao mapa e ter os 12 pinos de volta | 3 s | **531 ms** | trocar de aba destrói o MapLibre (§3); voltar reconstrói. Com o cache de tiles quente tem de ser imperceptível |
| aplicar um filtro | 120 ms | **0,2 ms** | é o gesto mais repetido do app; tem de ser imediato |
| o arquivo único | 500 KB | **419 KB** | fontes embutidas já custam 114; crescer sem notar é como "vai ficando lento" |
| primeiro quadro no aparelho | — | **2,7 s** | WebView aquecido, Pixel 6 emulado. Sem régua ainda: só uma medição |

Os três primeiros rodam a cada `node teste/bancada.js`. O quarto é medição de
emulador (`adb logcat` → `Displayed ...MainActivity: +2s692ms`) e ainda não
virou asserção — falta um aparelho físico para saber que número é honesto.

## 2. Os defeitos de desempenho já pagos

### O GPS re-renderizava a lista a cada pulso

`watchPosition` pode disparar a cada segundo. A primeira versão de
`seguirPosicao()` chamava `renderAba()` a cada pulso — **a lista inteira,
refeita**, com a rolagem voltando ao topo, parada num semáforo. Hoje há uma
régua de **25 m**: abaixo disso só o ponto azul se move (um marcador; custo
quase zero); acima, recalcula distâncias e reordena. Doc 04, §5.

### Recriar os 12 marcadores a cada tecla

No mapa real, o filtro **não destrói e recria** os marcadores — só muda
opacidade e `pointer-events` dos que saíram da busca. Recriar faria os 12 pinos
piscarem a cada letra digitada na barra de busca. É o motivo dos 0,2 ms.

### Favoritar refazia a tela

`alternarFavorito()` repinta **só os corações daquele id** e o contador da aba.
Reconstruir a tela perderia a rolagem do perfil e a posição do mapa.

### A abertura de 61 segundos que não existia

No primeiro teste em emulador o app levou 61 s até o primeiro quadro. Era o
**WebView do emulador subindo a frio** (40 s só para iniciar o Chromium numa AVD
recém-criada), não o app. Aquecido, 2,7 s. Medir na primeira execução mede o
emulador — a régua de "desconfie do medidor primeiro" vale para desempenho como
para tudo.

## 3. Decisões com custo assumido

**Destruir o mapa ao sair da aba.** O MapLibre segura contexto de GPU e
ouvintes. Sair da aba sem `destruir()` deixaria um mapa invisível vivo, gastando
bateria, e outro nasceria na volta. O custo é reconstruir ao voltar — e é por
isso que existe o orçamento de 3 s (medido: 531 ms).

**Telas como strings + `innerHTML`.** Sem diff de árvore, cada `renderAba()`
refaz o conteúdo da aba. Para 16 telas e 12 terapeutas, é barato e simples. O
que **não** se faz é chamar `renderAba()` de dentro de um gesto contínuo — daí
as atualizações cirúrgicas acima.

**Fontes embutidas (114 KB).** Custam bytes no primeiro carregamento e ganham
tipografia estável offline e no APK. Trocar por Google Fonts economizaria
114 KB e faria o app mudar de cara conforme o sinal.

## 4. Responsividade — as larguras provadas

A bancada abre o app em cinco contextos e mede **rolagem horizontal** (o
`scrollWidth` do app e de cada contêiner não pode passar do `clientWidth`) e
**área de toque** (nenhum botão visível menor que 36 px):

| Contexto | O que prova |
|---|---|
| iPhone 13 (390 px, touch) | o caso principal — os dois fluxos inteiros |
| 320 px | celular antigo; onde chip e botão costumam estourar |
| tablet 768 × 1024 (touch) | a moldura de "palco" no meio do caminho |
| desktop 1440 px | o palco com a moldura de celular centrada; a legenda não corta |
| `prefers-reduced-motion` | nada quebra sem as molas |

E em **aparelho**: Pixel 6 emulado, 1080 × 2400, com a área segura (relógio e
barra de gestos) **medida pelo Android** e injetada em `--st`/`--sb` —
`env(safe-area-inset-*)` não responde em todo WebView, e quando não responde
devolve zero: o cabeçalho ficaria embaixo do relógio e ninguém perceberia no
emulador.

Duas regras de CSS que sustentam isso:

- **`[hidden] { display: none !important }`** no reset — sem isso qualquer
  classe com `display` vence o atributo e o "escondido" aparece.
- **`100vh` antes de `100dvh`** — WebView antigo não conhece `dvh`; sem o plano
  B a altura vira `auto` e o layout desaba.

## 5. Contraste e legibilidade — medidos, não estimados

A bancada calcula o contraste **no navegador**, a partir das cores computadas:

| Par | Mínimo | Medido |
|---|---|---|
| texto principal / fundo | 4.5 | 14.23 |
| texto secundário / fundo | 4.5 | **4.70** |
| botão violeta (branco sobre violeta) | 4.5 | 8.32 |
| rótulo de aba inativa | 4.5 | 4.98 |

O 4.70 é a única divergência do briefing: o arquivo 05 pedia `#7A7290`, que dá
**4.28** — reprova em AA na mesma página em que exige AA. Adotado `#736C86`; a
olho nu é o mesmo cinza-lavanda.

## 6. Como medir de novo

```bash
node teste/bancada.js              # os orçamentos entram no bloco "— desempenho —"
node teste/bancada.js --url https://skotalexsander.github.io/lotus/   # no ar
node teste/sonda-mapa.js           # tempo até os pinos e inércia do MapLibre
adb logcat -d | grep "Displayed io.github.skotalexsander"             # primeiro quadro no aparelho
```

Quando um número piorar: **desconfiar do medidor primeiro** (mouse sintético
lento, cache frio, emulador engasgado), depois do commit.

⚠️ **NÃO FOI POSSÍVEL VALIDAR:** desempenho em aparelho físico de entrada
(4 GB, Android 10), que é o celular de boa parte do público-alvo. O emulador
Pixel 6 é otimista. Fica como primeira medição a fazer com um aparelho na mão.
