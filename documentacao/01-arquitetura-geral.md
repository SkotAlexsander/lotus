# 01 — Arquitetura geral

## 1. A decisão que define tudo: um arquivo HTML, sem framework

O briefing (arquivo 00) pedia "um artefato React". O protótipo é um único
`index.html`, sem React, sem bundler, sem dependência — e a razão não é gosto:

- **Ele precisa abrir com duplo clique**, sem servidor, para quem não é
  programadora testar.
- **Precisa caber num link** que se manda para uma terapeuta abrir no celular
  dela, e funcionar **offline** depois de carregado.
- **Precisa rodar dentro de um APK** servido de dentro do pacote.

React de CDN não carrega no primeiro caso nem no terceiro. O que sobrou foi o
padrão mais antigo da web — scripts clássicos, objetos globais, `innerHTML` — e
ele resolve os três. As fontes estão embutidas em base64 (114 KB) pelo mesmo
motivo: tipografia que depende de rede muda de cara conforme o sinal, e
protótipo que muda de cara não valida design.

O custo dessa escolha é assumido: não há componentes reativos, cada tela é uma
função que devolve uma string, e o estado vive num objeto. Para 16 telas e 12
terapeutas fictícias, o custo é zero. Para o produto real (Fase 1, Expo + React
Native), este código é **referência de comportamento**, não base de código.

## 2. `src/` — a numeração é a ordem de carga

São scripts clássicos: `file://` não aceita `import`/`export`, então cada arquivo
define um objeto global e o seguinte o usa. **Trocar a ordem quebra o app.**

```
00-molde.html        o esqueleto: <head>, moldura de celular, tela de abertura
01-estilo.css        design system — tokens → materiais → componentes → telas
01b-fontes.css   ⚙️  Fraunces + Nunito Sans em base64 (gerado)
01c-icone.js     ⚙️  o ícone do app embutido, para o apple-touch-icon (gerado)
02-fisica.js         Mola, Rastreador, projetar(), elastico()  — sem dependência
03-dados.js      ★   as 12 terapeutas, o catálogo, o estado, as conversões
03b-conquistas.js    o catálogo de selos e a política do aviso
04-mapa.js           o mapa DESENHADO por código + os gestos de câmera
04b-mapa-real.js     o mapa de ruas (MapLibre + OpenFreeMap), mesma interface
04c-gps.js           pedir localização, com os seis finais possíveis
05-telas.js          o HTML de cada tela. Só renderização, zero decisão
06-app.js            roteador, pilha de telas, eventos, gestos de navegação
```

★ fonte única · ⚙️ gerado por ferramenta, não editar

**Um arquivo, uma responsabilidade.** Dados ≠ visual ≠ lógica. É o que permite o
banco reaproveitar `03-dados.js` sem arrastar tela junto, e o mapa real
substituir o desenhado sem que `06-app.js` saiba qual está usando.

### Como o estado flui

```
Dados.estado  ──(leitura)──▶  Telas.xxx()  ──(string HTML)──▶  innerHTML
     ▲                                                             │
     └──────────── App.executar(acao) ◀──── click em [data-a] ◀───┘
```

Toda ação da interface é um `data-a="nome"` num botão. Um único listener de
`click` no documento lê o atributo e chama `executar(nome, elemento)` — um
`switch` de ~60 casos em `06-app.js`. Não há `onclick` inline nem listener por
botão: as telas são strings, e strings não têm closures.

Quando a ação muda estado que aparece na tela, ela chama `renderAba()` (refaz o
conteúdo da aba) ou uma atualização cirúrgica (`repintarFavoritos`,
`atualizarMapa`). A regra: **refazer a aba inteira só quando a rolagem não
importa** — favoritar de dentro do perfil não pode jogar a pessoa de volta ao
topo.

## 3. A pilha de telas

Não há roteador de URL. `App.abrir(nome)` cria o elemento da tela, empurra-o
numa pilha e anima a entrada pela direita; `App.voltar()` anima a saída e
remove. A raiz (mapa ou perfil da terapeuta) fica embaixo com as abas.

O que faz isso parecer aplicativo e não site:

- a tela de baixo **recua 26%** e escurece (`tela__veu`) enquanto a de cima
  entra — a hierarquia fica óbvia;
- a transição é uma **mola** (doc 03), não uma transição CSS: pode ser agarrada
  no meio e revertida;
- **puxar da borda esquerda** volta, e quem decide se fecha ou desiste é a
  velocidade na soltura, não a posição.

No Android, o botão VOLTAR do sistema pergunta à página (`App.voltarSePuder()`)
antes de fechar o app — e só fecha quando a página diz que não há para onde
voltar. Fechar o app no meio de um fluxo é a maior irritação de WebView mal
feito.

### As telas de baixo são isoladas — e sem `inert`, de propósito

As telas anteriores continuam no DOM (é o que permite a transição e o gesto de
voltar), mas saem da árvore de acessibilidade: sem isso, o Tab e o leitor de
tela passeiam por botões de uma tela que a pessoa não está vendo. Quem enxerga
nunca percebe; quem usa TalkBack ouve "Continuar com Google" no meio do perfil.

O isolamento é `aria-hidden="true"` + `tabindex="-1"` (guardando o valor
original em `data-tab-guardado`), aplicado por `isolarAsDeBaixo()` a cada
mudança de pilha. **`inert` faria isso numa linha e não é usado**: alternar
`inert` numa tela que está com `transform` (o recuo de 26%) e contém um rolável
corrompia o hit-test do rolável no Chromium — a tela pintava certo e nenhum
toque nela funcionava mais, de forma intermitente e sem nenhum erro. A bancada
de 71 provas falhava 1 vez em 3; sem `inert`, 0 em 7. O detalhe fino está em
`06-app.js`, no comentário de `isolarAsDeBaixo`.

Um cuidado de tempo: quando um fechamento **começa** (gesto solto ou botão
voltar), a tela de baixo é liberada imediatamente, não quando a mola para —
senão quem toca logo depois de soltar bate numa tela ainda isolada por ~400 ms.
Se a pessoa desiste no meio do gesto, o `aoParar` da mola re-isola.

## 4. Os montadores

### `montar.js` — src/ → prototipo/

Costura os arquivos na ordem e gera **dois alvos** da mesma fonte:

| Alvo | Para quê |
|---|---|
| `prototipo/index.html` | documento completo: duplo clique, GitHub Pages, APK |
| `prototipo/artifact.html` | só o corpo, para hospedagem que fornece o próprio esqueleto |

`node montar.js --check` devolve exit 1 se o montado estiver atrasado em
relação a `src/`. **`montar_apk.py` e `publicar.js` chamam isso antes de
qualquer coisa** — um APK feito sobre um `index.html` velho é a pior entrega
possível: instala, parece certo, testa a versão errada.

### `publicar.js` — projeto → repositório público

O projeto mora dentro de um repositório maior e tem coisas que não são do
produto (script que grava na Área de Trabalho desta máquina, briefing com
personas). O repositório público é **gerado**, de mão única, a partir de um
**manifesto de permissão** — lista do que vai, não do que fica: esquecer de
bloquear vaza, esquecer de permitir só falta.

Antes de escrever, um **portão** varre todo arquivo de texto por termos
proibidos (usuário do Windows, caminhos desta máquina, e-mail real, chave do
Supabase, menção à ferramenta). Achou, **reprova** e diz arquivo e linha. Na
primeira execução ele pegou 6 ocorrências — e 2 eram falso positivo, o que
levou a apertar a regra em vez de ignorar o aviso. Portão que grita sem motivo
acaba desligado.

⚠️ **Nunca editar na pasta gerada** (o clone local do repositório público). Se perde na próxima geração.

## 5. Onde cada coisa é fonte única

| Informação | Vive em | Derivam dela |
|---|---|---|
| as 12 terapeutas | `src/03-dados.js` | `banco/06-semente.sql` (gerado), os dois mapas, as telas |
| a coordenada real de cada uma | `src/03-dados.js` (`lat`, `lng`) | o plano do mapa desenhado (`paraPlano`), a semente |
| o catálogo de terapias | `src/03-dados.js` + `banco/05` | `conferir.js` compara |
| o catálogo de conquistas | `src/03b` + `banco/08` | `conferir.js` compara nome e descrição |
| o desenho do pino | `Telas.pinoHTML()` | os dois motores de mapa |
| a pétala do lótus | `05-telas.js` | ícone do app, abertura, capa do perfil |
| o ícone do app | `recursos/icones/` (gerado) | mipmaps do Android, `01c-icone.js` |

Quando algo **precisa** existir em dois lugares (app e SQL), a regra não é
"tomar cuidado" — é **uma prova que compara os dois e reprova a divergência**.

## 6. O aplicativo Android

`android/projeto/` é um projeto escrito à mão, com **um** Activity:

- `WebViewAssetLoader` serve o `index.html` em
  `https://appassets.androidplatform.net/assets/` — **origem segura**. Com
  `file://` o Android trata o armazenamento como descartável e nega
  geolocalização.
- **Pontes** (`@JavascriptInterface`): `abrirFora` (WhatsApp), `fundoClaro`
  (ícones da barra de status), `notificar` (aviso nativo, doc 05). Cada uma faz
  uma coisa e nenhuma devolve dados.
- A **área segura** (relógio, barra de gestos) é medida pelo Android e injetada
  em `--st`/`--sb`: `env(safe-area-inset-*)` só responde em parte dos WebViews
  e, quando não responde, devolve **zero**.

`montar_apk.py` **só copia e compila**. Não gera nem reescreve `.java`,
`.gradle` ou manifesto — gerador que reescreve o que foi editado à mão fica
atrasado e derruba funcionalidade em silêncio (prejuízo já pago em outro
projeto desta casa). Build `debug`: sem chave para guardar nem perder.

## 7. O que este desenho não resolve — e onde termina

- **Não há persistência.** Fechar o app apaga favoritas, avaliações e
  conquistas. É a Fase 0: nada é gravado, e o `README` diz isso a quem testa.
- **Não há backend nosso.** Na Fase 1 o app fala com o Supabase direto (doc
  02) e o "servidor" é o banco com RLS.
- **Não é React Native.** O produto real será; este código é a especificação
  viva do comportamento — os gestos, as regras, os textos — não a base a
  evoluir.
