# 05 — Conquistas e notificações

## 1. O que é uma conquista aqui

Não é pontinho de joguinho. Cada selo marca um passo **real** da jornada que o
app existe para provocar:

| Selo | Quem | O fato |
|---|---|---|
| Primeiros passos | cliente | abriu o mapa da região |
| Exploradora | cliente | visitou 5 perfis |
| Colecionadora | cliente | guardou 3 favoritas |
| Primeiro contato | cliente | chamou uma terapeuta no WhatsApp |
| Voz que ajuda | cliente | publicou a primeira avaliação |
| Perfil no ar | terapeuta | publicou o perfil profissional |
| Diálogo aberto | terapeuta | respondeu a uma avaliação |

Cada um deles é uma **métrica de sucesso do MVP** (arquivo 01, §7) vista pelo
lado da pessoa: contato pelo WhatsApp é conversão; avaliação publicada é prova
social; perfil no ar é oferta. O sistema de conquistas é a métrica devolvida a
quem a produziu.

A tela mostra **todas** as do papel — feitas e por fazer. Esconder as
bloqueadas transformaria o sistema num mistério; mostrá-las é o convite.

## 2. O catálogo existe em dois lugares — e há uma prova para isso

| Onde | Por quê |
|---|---|
| `src/03b-conquistas.js` | o protótipo precisa mostrar os selos sem banco |
| `banco/08-conquistas-e-notificacoes.sql` | o produto real concede pelo banco |

Duas listas da mesma coisa **separam com o tempo**. Por isso `banco/conferir.js`
compara as duas — **id, nome e descrição** — e reprova a divergência. Um selo
com texto diferente no app e no banco é o defeito que ninguém reporta, só
estranha.

## 3. Quem concede — e por que é o banco

No protótipo, `Conquistas.registrar(evento)` concede em memória. No produto,
**ninguém tem permissão de INSERT em `conquistas_usuario`**:

```sql
-- 08: só a leitura é liberada
create policy "cada um ve as proprias conquistas" on conquistas_usuario
  for select to authenticated using (auth.uid() = user_id);
-- (sem política de INSERT/UPDATE/DELETE: RLS nega o que não foi liberado)
```

Quem escreve é `conceder_conquista(pessoa, slug)`, `security definer`, chamada
por **gatilhos** quando o fato acontece: a avaliação foi publicada
(`trg_apos_avaliacao`), a resposta foi escrita (`trg_apos_resposta`), o terceiro
favorito entrou (`trg_apos_favorito`), o perfil foi criado
(`trg_apos_perfil_terapeuta`).

Se o aplicativo pudesse escrever "conquistei X", qualquer pessoa com a chave
`anon` escreveria também — e um selo que se dá a si mesmo não vale nada.

### As três que o banco não vê

Abrir o mapa, ver 5 perfis, tocar no WhatsApp acontecem **no aparelho** e não
deixam rastro no banco — **de propósito**: registrar cada tela vista seria
coletar mais do que o app precisa (minimização, arquivo 04). Para elas existe
`conceder_conquista_de_uso(slug)`, que o app chama e que **só aceita esses três
slugs** — qualquer outro levanta exceção. São selos de uso, não de fato
verificável, e o código admite isso em vez de fingir o contrário.

### Idempotência

`conceder_conquista` usa `insert ... on conflict do nothing returning true`: o
`returning` só devolve linha quando **inseriu**. É o que separa a primeira vez
das repetições sem uma segunda consulta — e o que permite chamá-la de vários
gatilhos sem medo de duplicar nem re-notificar.

## 4. A política do aviso — "inteligente" começa em saber calar

Notificação que interrompe à toa ensina a pessoa a desligar todas — e aí morre
o canal inteiro. A política, em `03b-conquistas.js`, é pequena e **testável**:

| Regra | Como |
|---|---|
| **Silêncio à noite** (21h–8h) | a conquista aparece na tela na hora; o aviso de sistema espera. Ninguém acorda por um selo |
| **No máximo 3 avisos por sessão** | do quarto em diante, só a tela. Rajada de conquistas é uma notificação, não cinco |
| **Nunca duas vezes** | conceder é idempotente; re-conquistar não existe |

A janela de silêncio cruza a meia-noite, então o teste é *"fora do intervalo
permitido"*, não *"dentro de [início, fim]"* — o erro clássico:

```js
function emSilencio(agora = Dados.agora()) {
  const h = agora.getHours();
  return h >= SILENCIO.inicio || h < SILENCIO.fim;   // 21→8, cruzando a meia-noite
}
```

A hora vem de `Dados.agora()` — o **mesmo relógio** que o resto do app usa, e
que a tela de conta consegue simular. É por isso que `teste/conquistas.js` prova
a regra de verdade: põe o relógio em quarta 23h, conquista, e confere que a
ponte com o Android **não recebeu nada**; põe em 9h, e confere que recebeu.

No banco, a preferência é da pessoa (`preferencias_notificacao`: horário de
silêncio por usuária), não cravada no aplicativo.

## 5. A caixa de entrada

`notificacoes` é a fonte; o push (Fase 3) só **avisa que há algo lá**. Assim o
aviso sobrevive ao celular desligado: quem perdeu a notificação encontra a
caixa. A pessoa lê as suas e só pode alterar `lida_em` — grant de coluna, porque
RLS libera a linha e sem o grant ela reescreveria o texto do aviso.

O índice parcial `where lida_em is null` responde "quantas não lidas?" sem
varrer as lidas, que só acumulam.

## 6. A tela de bloqueio — o que é nativo e por quê

O WebView **não tem** a Notification API da web (lição já paga em outro projeto
desta casa). O aviso que toca e acende a tela de bloqueio é **nativo**, criado
pela ponte:

```
página: Conquistas.definirReacao((c, politica) => {
          avisar(...)                                  // a torrada, sempre
          if (politica.pode) PonteAndroid.notificar(...)   // o sistema, se a política deixar
        })
        │
        ▼
MainActivity.Ponte.notificar(titulo, corpo)
        │  tem POST_NOTIFICATIONS?  não → pede, guarda o aviso, mostra ao conceder
        ▼
NotificationChannel "conquistas"  →  NotificationManager.notify()
```

Três decisões no canal, cada uma com consequência visível:

- **`setLockscreenVisibility(VISIBILITY_PUBLIC)`** — o conteúdo aparece no
  bloqueio. É deliberado e é seguro **aqui**: os avisos são conquistas, nunca
  dado sensível. Num aviso "a terapeuta respondeu você" a decisão teria de ser
  revista — conteúdo de saúde na tela de bloqueio é vazamento para quem olhar
  por cima do ombro.
- **`IMPORTANCE_DEFAULT`**, não `HIGH` — toca som mas não invade a tela
  (*heads-up*). Conquista não é urgência; aviso que invade ensina a desligar o
  canal.
- **Tocar abre o app** (`PendingIntent`). Aviso que não leva a lugar nenhum é
  beco.

A permissão `POST_NOTIFICATIONS` é obrigatória a partir do Android 13 e é
pedida em **tempo de execução**, no momento do primeiro aviso — não na
abertura do app, quando a pessoa ainda não sabe para que serve. Negou? O aviso
morre em silêncio; a conquista continua na tela. A permissão nega o **canal**,
não o fato.

### E no navegador?

Só a torrada. No Android Chrome, `new Notification()` é proibido (precisa de
Service Worker), e o iPhone exige o app instalado na tela de início. Não há
Service Worker neste protótipo, e fingir que há seria mentir por omissão. No
produto real (Fase 3), o push vem do servidor e usa `aparelhos.token_push`.

## 7. O que está provado

| Prova | Onde |
|---|---|
| cada fato concede o selo certo; nunca duas vezes | `teste/conquistas.js` |
| às 23h a ponte não recebe; às 9h recebe; máximo 3 por sessão | `teste/conquistas.js`, com o relógio simulado e uma `PonteAndroid` falsa que anota o que chega |
| o catálogo do app == o do banco (id, nome, descrição) | `banco/conferir.js` |
| o aviso nativo aparece **na tela de bloqueio** | emulador Pixel 6 / Android 16 — captura em `teste/fotos-aparelho/` |

⚠️ **NÃO FOI POSSÍVEL VALIDAR:** os gatilhos do banco (nunca rodou num
Postgres); o pedido de permissão em aparelho físico; e o comportamento em
fabricantes que matam apps em segundo plano (Xiaomi, Samsung com otimização
agressiva) — o aviso aqui é disparado com o app **aberto**, então não depende
disso, mas o push da Fase 3 vai depender.
