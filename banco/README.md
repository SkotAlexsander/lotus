# Banco de dados — Supabase + PostGIS

O banco do arquivo 03 do briefing, escrito para rodar. **Nada aqui foi executado
ainda** — não há Postgres nesta máquina. O que existe é o SQL completo, conferido
estaticamente, pronto para colar no Supabase.

---

## A ordem importa

Rode **na sequência**. Cada arquivo depende do anterior, e a numeração é a ordem
de execução, não enfeite.

| # | Arquivo | O que faz | Repetir é seguro? |
|---|---|---|---|
| 1 | `01-extensoes.sql` | PostGIS (busca por distância), unaccent, pg_trgm | sim |
| 2 | `02-tabelas.sql` | as 10 tabelas e os índices | sim |
| 3 | `03-funcoes-e-gatilhos.sql` | o que o banco faz sozinho | sim |
| 4 | `04-rls.sql` | quem pode ver e mexer em quê | sim |
| 5 | `05-catalogo.sql` | as 12 terapias | sim |
| 6 | `08-conquistas-e-notificacoes.sql` | conquistas, caixa de notificações, preferências, aparelhos — e os gatilhos que concedem | sim |
| 7 | `06-semente.sql` | 12 terapeutas + 55 clientes fictícias | sim |
| — | `07-limpar-semente.sql` | desfaz **só** a semente | — |

O `08` vem **antes** da semente de propósito: os gatilhos dele reagem a avaliações
e favoritos, então rodar a semente depois concede conquistas às clientes fictícias
— inofensivo, e útil num banco de demonstração.

Cada arquivo termina com uma **consulta de conferência**. Rode-a e compare com o
resultado esperado que está escrito ali. Se não bater, pare — não siga para o
próximo.

---

## Passo a passo (para quem não é programadora)

1. Entre em **supabase.com** e crie uma conta (o plano gratuito serve para toda a
   Fase 1).
2. **New project.** Dê um nome, escolha a região **South America (São Paulo)** —
   quanto mais perto, mais rápido o app responde — e guarde a senha do banco que
   ele pedir, num gerenciador de senhas.
3. Espere o projeto subir (uns 2 minutos).
4. No menu da esquerda: **SQL Editor → New query**.
5. Abra `01-extensoes.sql`, copie **tudo**, cole e clique em **Run**.
6. Confira o resultado com o esperado escrito no fim do arquivo.
7. Repita para o 02, 03, 04, 05, 08 e 06, **nessa ordem**.

Deu erro em algum? A mensagem do Supabase diz o arquivo e a linha. Não pule para
o próximo — os erros se acumulam e o último deixa de fazer sentido.

---

## ⚠️ As chaves: qual pode sair e qual nunca sai

Em **Project Settings → API** aparecem duas. Elas parecem iguais e **não são**.

| Chave | Pode ir para o aplicativo? | Por quê |
|---|---|---|
| `anon` / `publishable` | **Sim** | Nasceu para ficar exposta. Qualquer pessoa lê o JavaScript e a copia — isso é esperado. Quem protege os dados é a RLS, não o segredo dela. |
| `service_role` / `secret` | **NUNCA** | Ela **ignora a RLS inteira**. Quem a tem lê, altera e apaga tudo, de qualquer lugar do mundo, sem senha. Ela não entra em aplicativo, não entra em repositório, não entra em print de tela. |

Se a `service_role` vazar, **troque a chave imediatamente** no painel — e
considere que tudo o que estava no banco foi lido.

**É por isso que o `04-rls.sql` existe e termina com três conferências.** Tabela
com RLS desligada é aberta para o mundo com a chave `anon` — não é bug nem
exploit, é o comportamento normal do Postgres. Rode a Conferência 1 **sempre que
criar tabela nova**: ela tem de voltar vazia.

---

## O que eu acrescentei ao briefing, e por quê

Tudo o que veio do arquivo 03 está igual. O que é meu leva a etiqueta `ADIÇÃO`
dentro do SQL. O resumo:

**Coisas que faltavam para o app funcionar:**

- **`handle_new_user`** — o gatilho que cria a linha em `profiles` quando alguém
  se cadastra. O briefing diz que `profiles` "espelha o login", mas nada fazia o
  espelho: a pessoa logava, o app procurava o perfil e não achava. Sem isto, o
  app trava no primeiro cadastro.
- **Tabela `admins`** — o arquivo 04 fala em "só admin lê as denúncias", mas
  `profiles.papel` só aceita `cliente` ou `terapeuta`. Não havia como escrever a
  política. Tabela separada para que o app nunca consiga se autopromover.
- **Coluna `so_bairro`** — a opção "mostrar só o bairro" existe na tela (arquivo
  05) e no arquivo 04, e não tinha onde ser guardada.

**Coisas que impedem o banco de mentir:**

- **`sincronizar_faixa_preco`** — `preco_min`/`preco_max` repetem o que já está em
  `servicos`. Campo repetido sempre diverge: a terapeuta muda o valor e o mapa
  continua com o preço antigo. O gatilho recalcula a cada mudança.
- **`proteger_avaliacao`** — a terapeuta pode responder (RF16), e responder é um
  `UPDATE` na linha. Como a RLS libera a **linha inteira**, sem esta trava quem
  recebeu 2 estrelas poderia transformá-las em 5 e reescrever o texto.
- **`esta_aberta`** — o mesmo cálculo do app, agora no banco, para o filtro
  "aberta agora" poder rodar no servidor na Fase 2.

**Correções na função do mapa (`terapeutas_proximas`):**

1. **Privacidade:** quem marcou "só o bairro" tem a posição arredondada para uma
   grade de ~330 m **antes de sair do banco**. Mascarar só na tela não adianta —
   a posição exata já teria viajado pela rede.
2. **`group by` pelas chaves primárias**, não por `nome, foto_url`. Do jeito
   original funciona por acidente; quebra no dia em que alguém acrescentar uma
   coluna ao `select`.
3. A função devolve `bairro` e `aberta_agora`, que o card do mapa precisa e que
   não estavam no retorno.

**Uma view, `terapeutas_publicas`:** é o que o app deve ler no lugar da tabela.
RLS filtra **linha**, não **coluna** — sem a view, quem lê `perfis_terapeuta`
recebe o endereço completo de quem pediu para mostrar só o bairro.

---

## A semente é gerada, não digitada

`06-semente.sql` **não se edita à mão**. Ele é gerado a partir de
`src/03-dados.js`, que é onde as 12 terapeutas fictícias existem uma única vez.

```bash
node banco/gerar_semente.js   # src/03-dados.js -> 06-semente.sql
node banco/conferir.js        # 12 provas estáticas
```

Digitar os dados de novo em SQL criaria uma segunda verdade — e duas verdades
divergem: muda-se o preço no protótipo, o banco continua com o antigo, e a
diferença só aparece na frente de uma cliente.

**Sobre as coordenadas:** o protótipo trabalha num plano (120 px = 1 km) e o banco
precisa de latitude e longitude de verdade. O gerador converte preservando as
**distâncias e direções**, ancorado em Higienópolis. ⚠️ Elas **não** são os
endereços reais dos bairros citados — as pessoas são fictícias e os endereços
também. Servem para exercitar a busca geográfica com dados plausíveis.

---

## O que `conferir.js` prova — e o que não prova

```
node banco/conferir.js
```

**Não prova que o SQL roda.** Não há Postgres aqui; só o Supabase dirá.

**Prova** o que dá para provar sem banco, que é onde o erro costuma estar num SQL
gerado:

1. toda coluna usada na semente existe no esquema;
2. toda tabela usada na semente existe no esquema;
3. o catálogo de terapias do SQL bate com o do protótipo;
4. nenhum comando ficou com aspas desbalanceadas — o defeito clássico de SQL
   gerado, em que um apóstrofo não escapado vira texto e o erro aparece 300
   linhas adiante, apontando o lugar errado;
5. o esquema liga RLS em **toda** tabela que cria;
6. toda tabela com RLS tem ao menos uma política (RLS ligada e sem política =
   ninguém lê nada, e o app quebra sem erro no banco);
7. a semente está em dia com `src/03-dados.js`;
8. o catálogo de **conquistas** do SQL bate com o do app — id, nome e descrição.

A explicação longa de cada decisão está em
[`documentacao/02-contas-e-banco-de-dados.md`](../documentacao/02-contas-e-banco-de-dados.md).

---

## ⚠️ NÃO FOI POSSÍVEL VALIDAR

- **Nada disto rodou num Postgres.** O SQL foi escrito com cuidado e conferido
  estaticamente, mas erro de execução só aparece no Supabase.
- **Um erro já foi pego na escrita** e vale como aviso do que o conferidor não
  alcança: `unaccent()` não é `IMMUTABLE` e o Postgres **recusa** função assim
  dentro de índice. Sem o invólucro `f_unaccent` do `01-extensoes.sql`, o
  `02-tabelas.sql` falharia na criação dos índices de busca. Se apareceram
  outros erros dessa natureza, eles vão aparecer no primeiro `Run`.
- A inserção direta em `auth.users` (na semente) é aceita pelo Postgres, mas é
  um caminho de demonstração: o Supabase espera que usuários nasçam do cadastro.
  Se o painel de Authentication mostrar algo estranho nesses usuários, é isso.

---

## O que ainda falta no banco (por fase)

| Fase | O que entra |
|---|---|
| 2 | filtros dentro da `terapeutas_proximas` (terapia, preço, nota, aberta agora); lista de palavras moderadas virando tabela |
| 3 | tabelas de agendamento e de notificação; contadores do painel (visualizações, cliques no WhatsApp) |
| 4 | fila de verificação com upload de documento; Storage com políticas próprias |

E, fora do SQL: **limite de ações por minuto** nas rotas de avaliação e denúncia
(arquivo 04, item 5) — isso é Edge Function, não banco.
