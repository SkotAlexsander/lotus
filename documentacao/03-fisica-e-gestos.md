# 03 — Física e gestos

Tudo o que se move neste app se move por **mola**, não por transição de duração
fixa. Este documento explica o porquê, o que cada peça de `02-fisica.js` faz, e
as três armadilhas de `pointer events` que custaram uma tarde cada.

## 1. Por que mola, e não `transition: 300ms`

Uma transição CSS tem começo, fim e duração. Se a pessoa toca na folha no meio
da animação de fechar, a transição **precisa terminar** antes de obedecer. O
dedo espera. É isso que faz uma interface "parecer computador".

Uma mola não tem duração. Ela tem um **alvo** e uma **velocidade atual**, e a
cada quadro se aproxima do alvo. Trocar o alvo no meio do caminho não reinicia
nada: a velocidade continua, a curva se dobra. É o que permite:

- **agarrar no meio do voo**: a folha fechando pode ser pega e reaberta sem
  salto;
- **herdar a velocidade do dedo**: soltar rápido lança; soltar devagar assenta;
- **reverter sem "parede"**: puxar da borda, desistir, empurrar de volta — uma
  curva só.

A referência é o *Designing Fluid Interfaces* (Apple, WWDC 2018), e os
parâmetros usam o vocabulário de lá, não o da física:

| Parâmetro | O que é | Valores usados |
|---|---|---|
| `amortecimento` | 1.0 assenta sem passar do ponto; 0.8 dá um leve repique | 1.0 no que a pessoa não empurrou; ~0.82 em gaveta e arremesso |
| `resposta` | quão rápido chega ao alvo, em segundos. **Não é duração** | 0.3 (folha), 0.42 (telas), 0.45 (câmera do mapa) |

Regra que sai disso: **overshoot só onde houve momento**. Um menu que apenas
apareceu não repica; uma folha que a pessoa arremessou, sim.

## 2. `02-fisica.js` — as quatro peças

### `Mola`

```js
const m = new Fisica.Mola({ amortecimento: 1, resposta: 0.4,
                            aoAtualizar: (v) => el.style.transform = `translateY(${v}px)` });
m.para(0);                      // anima até 0 — a partir de onde estiver
m.fixa(120);                    // o dedo assumiu: para de integrar, só reflete
m.para(0, { velocidade: -900 }); // soltou: herda a velocidade do dedo (px/s)
m.congela();                    // interrompido: fica onde está
```

Detalhe de implementação que evita um defeito invisível: a integração é feita em
**subpassos de 1/240 s**. Com `dt` grande (aba trocada, celular travando), o
integrador de Euler explode e a mola "voa" para fora da tela. Dividir o quadro em
pedaços curtos mantém a mola estável em qualquer caso.

Um único `requestAnimationFrame` serve todas as molas (`inscrever`). Mais
barato, e garante que todas avancem com o **mesmo** `dt` — sem isso, X e Y
desandam.

### `Rastreador` — a velocidade de verdade

A velocidade entre os dois últimos eventos é ruído: um `dt` de 2 ms vira
3000 px/s. O rastreador guarda uma janela de ~90 ms de amostras e devolve a
média — o número que o dedo realmente tinha ao soltar.

### `projetar()` — para onde o dedo estava mandando

```js
projetar(v, taxa = 0.998) = (v / 1000) * taxa / (1 - taxa)
```

É a decaída exponencial da rolagem do iOS (a fórmula de livro, `v²/2a`, não é a
que a Apple usa). Serve para decidir o **alvo** antes de animar: a folha vai
para o encaixe mais próximo do lugar **projetado**, não do lugar onde o dedo
soltou. É o que faz um peteleco parecer um arremesso.

### `elastico()` — a borda que resiste

```js
elastico(excesso, dimensao, c = 0.55) = (excesso · dimensao · c) / (dimensao + c · |excesso|)
```

Passou do limite? O elemento continua seguindo o dedo, cada vez menos. Parar
seco lê como "travou"; resistir progressivamente lê como "responde, mas acabou".
Usado na borda do mapa desenhado, no topo da folha e ao puxar a tela além do
fechado.

## 3. Onde cada gesto usa o quê

| Gesto | Arquivo | Como |
|---|---|---|
| Arrastar o mapa desenhado | `04-mapa.js` | rastreio 1:1 com histerese de 8 px; `elastico` nas bordas; ao soltar, `projetar` + molas X e Y **independentes** (uma mola sobre a distância desanda quando os eixos têm velocidades diferentes) |
| Pinça | `04-mapa.js` | mantém sob os dedos o mesmo ponto do mundo que estava lá no início; tirar um dedo reancora sem pulo |
| Folha (bottom sheet) | `06-app.js` `ligarFolha` | 1:1; `elastico` para cima; na soltura, encaixe mais próximo do projetado; empurrar forte para cima **abre o perfil** — o gesto aponta para onde a coisa vai dar |
| Voltar pela borda | `06-app.js` `ligarBordaVoltar` | 1:1; a decisão fechar/desistir é pelo **sinal da velocidade projetada**, não pela posição |
| Transição de tela | `06-app.js` `animarPara` | uma mola em "progresso" (0–1); velocidade em px/s convertida dividindo pela largura |
| Toque | `ligarPressao` | classe `.pressionado` entra no `pointerdown`, sai no `pointerup` — resposta no toque, não na soltura; sair com o dedo pressionado cancela |

Preferências do sistema são respeitadas em todos: `prefers-reduced-motion`
troca mola por dissolução curta (`Fisica.menosMovimento()`);
`prefers-reduced-transparency` deixa o vidro opaco.

## 4. As três armadilhas de `pointer events`

Cada uma passou pela leitura e só a medição pegou. Nenhuma gerava erro no
console.

### `setPointerCapture` no `pointerdown` mata o clique dos filhos

Com o ponteiro capturado, o `click` **e** o `pointerup` seguintes são entregues
a **quem capturou**, não ao elemento tocado. Capturar cedo "para não perder o
gesto" tornou **todo o conteúdo da folha inerte** — nenhum botão respondia, e o
toque no pino não achava o pino.

Dois consertos, conforme o caso:

- **folha**: capturar **só quando o gesto passa do limiar** de 8 px e vira
  arraste (`ligarFolha`);
- **mapa**: a captura continua imediata (o arraste precisa dela), mas o alvo do
  `pointerdown` é guardado em `alvoInicial` — é ele que diz se o dedo caiu num
  pino.

### `[hidden]` perde para `display: flex`

`.folha { display: flex }` vence o `[hidden] { display: none }` do navegador —
classe ganha de atributo. **A folha nunca esteve escondida**: ficava como uma
tira de 18 px no rodapé, e o app parecia funcionar. O conserto foi na categoria,
não no caso: `[hidden] { display: none !important }` no reset. Meia hora depois
o mesmo problema tentou aparecer noutro botão e já nasceu morto.

### `const App` não existe em `window`

Só `var` e declaração de função viram propriedade de `window`. O Android
perguntava `window.App && App.voltarSePuder()` → `undefined` → sempre "não" →
o botão VOLTAR fechava o app. E a bancada de navegador **não pegava** porque ela
chama `App.mapa` direto, sem `window.` — referência nua resolve pelo escopo do
script. O mesmo nome, duas formas de pedir, uma funciona. Hoje o `06-app.js`
publica `window.App = App` explicitamente, e o Java pergunta por `typeof App`.

## 5. A prova do movimento — e o que ela não prova

`teste/bancada.js` mede o arrasto do mapa (**190 px**, determinístico) e, no
motor desenhado, a inércia depois de soltar (**> 20 px** sozinho). Essa prova
foi instável duas vezes, e a segunda ensinou mais: medir o arrasto **depois de
soltar** corria contra a mola do momento, que começa no instante da soltura —
190 px ou 34 px conforme quem chegasse primeiro. Medir arrasto exige parar antes
de soltar; parar mata o momento. **Não cabem no mesmo gesto** — viraram dois.

No mapa **real**, a inércia é do MapLibre, e foi medido (`teste/sonda-mapa.js`)
que ela **não responde a mouse sintético**: arrasto de 4111 m, inércia de 0 m.
Afirmar ali que "o momento funciona" mediria a fidelidade do Playwright, não o
app. A prova que fica no motor real é a que é nossa: `centralizar` leva o mapa
até a terapeuta (erro 0 m).

⚠️ **NÃO FOI POSSÍVEL VALIDAR** a fluidez real das molas em aparelho físico —
só em emulador, onde o toque é sintético. É o teste que só o dedo de alguém faz.
