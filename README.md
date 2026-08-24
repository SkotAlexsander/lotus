# 🪷 Mapa Holístico

Um mapa vivo das terapias holísticas. Você abre, permite a localização, e vê quem
atende **perto de você** — com valores claros, horário de atendimento e avaliação
de quem já foi.

**[▶ Abrir o protótipo](https://skotalexsander.github.io/lotus/)** — roda no
navegador, sem instalar nada e sem internet depois de carregar.

- **iPhone:** abra o endereço acima no **Safari** → Compartilhar → *Adicionar à
  Tela de Início*. Abre em tela cheia, com ícone próprio.
- **Android:** dá para fazer o mesmo pelo Chrome, ou instalar o aplicativo:
  **[baixar o APK](https://github.com/SkotAlexsander/lotus/releases/latest/download/mapa-holistico.apk)**
  (o Android vai avisar que é de fonte desconhecida — é o esperado para aplicativo
  que não veio da Play Store). Ele pede localização e avisos **quando precisa**,
  nunca na abertura; internet só para o mapa de ruas.

<p align="center">
  <img src="capturas/mapa.png" width="30%" alt="O mapa de ruas reais com as terapeutas da região">
  <img src="capturas/card.png" width="30%" alt="Card resumido ao tocar num pino, sobre o bairro de verdade">
  <img src="capturas/perfil.png" width="30%" alt="Perfil completo da terapeuta">
</p>

<p align="center"><sub>Capturas do aplicativo Android rodando num Pixel 6. Sem internet
(e sem cache), o mapa de ruas dá lugar a um traçado desenhado por código e o app
continua inteiro — <a href="capturas/plano-b.png">é este aqui</a>.</sub></p>

---

## O problema

Quem procura Apometria, Reiki ou ThetaHealing hoje depende de indicação de amiga ou
de perfil perdido no Instagram. Não existe um lugar que responda a pergunta simples:
**quem atende perto de mim, quanto custa, é confiável, e está atendendo agora?**

Do outro lado, terapeuta recém-formada não tem como ser encontrada nem como
construir reputação.

## Os dois lados

**Quem procura** vê o mapa da própria região, filtra por tipo de terapia, preço e
avaliação, toca num pino, lê o perfil inteiro — serviços com valor, horários com
selo de *aberta agora*, avaliações com resposta da terapeuta — e chama no WhatsApp.

**Quem atende** monta o perfil em seis passos, marca no mapa onde atende (podendo
mostrar só o bairro), define serviços e valores, horários, e passa a aparecer para
as clientes da região. Responde avaliações e acompanha um painel simples.

---

## Estado: protótipo navegável

Isto é a **Fase 0**: o app inteiro navegável, com **dados fictícios**, para validar
telas e fluxo antes de escrever o produto final. Nada é real — as 12 terapeutas são
ficção, nada sai do aparelho e nada fica gravado.

| | |
|---|---|
| 16 telas | os dois lados completos, do cadastro ao painel |
| 1 arquivo | HTML auto-contido — fontes embutidas, sem framework |
| Mapa real | ruas de verdade com MapLibre + [OpenFreeMap](https://openfreemap.org) — sem chave, sem cadastro |
| GPS | localização do aparelho, com o raio de precisão desenhado em metros |
| Plano B | sem internet ele cai num mapa desenhado por código e continua inteiro |
| Conquistas | 7 selos que marcam a jornada real — no produto, quem concede é o banco, por gatilho |
| Avisos | notificação nativa na **tela de bloqueio**, com política: silêncio à noite, no máximo 3 por sessão |
| 101 provas | em navegador real: fluxos (70), GPS (13), conquistas (12), plano B (6) — com orçamentos de desempenho e 5 larguras |
| Android | APK instalável, provado em emulador — inclusive o aviso no bloqueio |
| Banco | SQL completo para Supabase + PostGIS: 15 tabelas, RLS em todas, gatilhos que concedem |
| Documentação | [7 documentos](documentacao/00-INDICE.md) explicando como o código funciona e por quê |

---

## Como foi feito

Um único arquivo HTML, sem framework e sem dependência externa. A razão é prática:
o protótipo precisa abrir com duplo clique, funcionar sem internet e caber num link
que se manda para uma terapeuta testar no celular dela.

**O ponto azul não mente.** A localização vem do aparelho, e o círculo em volta
é o raio de precisão que o GPS informou — convertido de metros para pixels a cada
zoom. Desenhar só o ponto afirmaria uma certeza que o aparelho não tem, e num app
cuja pergunta é "quem está perto de mim", 30 m e 2 km dão respostas diferentes.
Negar a permissão não trava nada: existe o modo cidade, e a tela explica por quê.

**Dois mapas, a mesma forma.** O de ruas reais (MapLibre + OpenFreeMap) e um
desenhado por código. Os dois expõem as mesmas funções, então o aplicativo usa um
ou outro sem saber qual — e se o mapa real não carregar, o desenhado assume e
nada quebra. Há uma prova só para isso: `node teste/sem-mapa-real.js` bloqueia o
MapLibre na rede e verifica que o app continua de pé.

**As conquistas são concedidas por quem não pode ser enganado.** No protótipo
os selos vivem em memória; no banco, ninguém tem permissão de escrever em
`conquistas_usuario` — só os gatilhos, disparados pelo fato em si (a avaliação
publicada, o perfil no ar). Um selo que o aplicativo pudesse se dar não valeria
nada. E o aviso sabe calar: às 23h a conquista aparece na tela, mas a
notificação espera o dia começar.

**A física do movimento é levada a sério.** Nada de transição de duração fixa: cada
gesto é uma mola interrompível, que parte do valor que está na tela, herda a
velocidade do dedo e projeta o momento para onde ele estava mandando a coisa. É o
que faz o mapa, a folha e o gesto de voltar responderem como objeto e não como
página.

```
src/                  onde se edita — a numeração é a ORDEM DE CARGA
  00-molde.html         esqueleto e tela de abertura
  01-estilo.css         design system: tokens → materiais → componentes
  02-fisica.js          molas, momento, rubber-band, rastreio de velocidade
  03-dados.js           as 12 terapeutas — fonte única, usada também pelo banco
  03b-conquistas.js     o catálogo de selos e a política do aviso
  04-mapa.js            traçado urbano por código + gestos do mapa
  04b-mapa-real.js      o mapa de ruas (MapLibre), mesma interface
  04c-gps.js            pedir localização, com os seis finais possíveis
  05-telas.js           o HTML de cada tela
  06-app.js             roteador, eventos, navegação

montar.js             src/ → index.html
banco/                o SQL do Supabase (ver banco/README.md)
android/              projeto Android escrito à mão
documentacao/         como o código funciona, e por quê — comece pelo 00-INDICE
teste/                as bancadas: fluxos, GPS, conquistas, plano B
```

### Rodar

```bash
node montar.js                # src/ → index.html
node teste/bancada.js         # 70 provas de fluxo e orçamentos (precisa de Playwright)
node teste/gps.js             # 13 do GPS: permitiu perto, permitiu longe, negou
node teste/conquistas.js      # 12 das conquistas e da política do aviso
node teste/sem-mapa-real.js   # 6 do plano B: bloqueia o mapa real e confere
node banco/conferir.js        # 12 provas estáticas do SQL
python android/montar_apk.py  # compila o APK (precisa de Android SDK + JDK 17–23)
```

---

## O que ainda não é real

| Hoje | No MVP |
|---|---|
| Login aceita qualquer coisa | Supabase Auth: Google e código por celular |
| Ninguém está cadastrado de verdade | terapeutas reais, verificadas |
| Mapa sem endereço clicável | geocodificação do endereço digitado |
| 12 terapeutas num arquivo JS | Postgres + PostGIS, busca por raio |
| Favoritas e avaliações somem ao recarregar | gravadas no banco, com RLS |

O SQL do banco já está escrito e conferido em [`banco/`](banco/) — inclusive as
políticas de acesso linha a linha, a função de busca por proximidade e o
mascaramento de endereço de quem escolhe mostrar só o bairro.

---

## Licença

MIT — veja [LICENSE](LICENSE).

As terapeutas, avaliações, endereços e telefones deste protótipo são **fictícios**.
Qualquer semelhança é coincidência.
