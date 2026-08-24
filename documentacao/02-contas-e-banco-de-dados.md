# 02 — Contas e banco de dados

Este é o documento mais importante da pasta, porque é onde mora o dado de gente
de verdade. Tudo aqui foi escrito com uma pergunta na cabeça: **"o que acontece
se alguém chamar a API na mão, sem passar pela tela?"** Se a resposta for "ele
consegue ver ou mudar o que não é dele", o desenho está errado — não importa
quão bonita seja a tela.

Os arquivos: [`banco/01` a `banco/08`](../banco/), numerados pela **ordem de
execução**. O [`banco/README.md`](../banco/README.md) tem o passo a passo de
colar no Supabase; este documento explica o **porquê** de cada peça.

---

## 1. O modelo mental: o banco é o servidor

Não há backend escrito por nós. O aplicativo fala **direto com o Postgres** do
Supabase, por HTTPS, usando uma chave que vai dentro do próprio aplicativo. Isso
parece assustador até se entender a divisão de trabalho:

| Camada | Responsabilidade |
|---|---|
| Supabase Auth | quem é a pessoa (Google, celular). Emite um token assinado |
| **RLS** (Row Level Security) | **quais linhas** aquele token pode ver e mudar |
| GRANT de coluna | **quais colunas** — RLS não sabe separar coluna |
| Constraints | o que é **sempre** verdade (uma avaliação por pessoa) |
| Gatilhos | o que acontece **sozinho** (criar perfil, conceder conquista) |
| Aplicativo | **experiência**. Tudo o que ele valida, o banco valida de novo |

A frase que resume: **regra no app é sugestão; regra no banco é lei.** Uma tela
que esconde o botão "avaliar" para quem já avaliou é gentileza. Quem impede a
segunda avaliação é o `unique (terapeuta_id, cliente_id)` em `avaliacoes`.

---

## 2. As duas chaves — e a que nunca sai

Em *Project Settings → API* o Supabase mostra duas chaves. Elas parecem iguais
e **não são**:

| Chave | Vai no app? | O que faz |
|---|---|---|
| `anon` (publishable) | **sim** | identifica o projeto. É pública por desenho: qualquer pessoa lê o JavaScript e a copia. Quem protege os dados não é o segredo dela — é a RLS |
| `service_role` (secret) | **NUNCA** | **ignora a RLS inteira**. Quem a tem lê, altera e apaga tudo, de qualquer lugar do mundo. Não entra em app, repositório, print de tela nem mensagem |

Consequência prática, e é a mais importante deste documento:

> **Tabela com RLS desligada é aberta para o mundo com a chave `anon`.**
> Não é bug nem exploit — é o comportamento normal do Postgres. Por isso o
> `04-rls.sql` começa ligando RLS em todas as tabelas e termina com uma
> consulta que **tem de voltar vazia** (Conferência 1). E por isso
> `banco/conferir.js` reprova se qualquer `create table` não tiver o seu
> `enable row level security` correspondente.

O `publicar.js` tem uma regra de varredura para a chave secreta seguida de um sinal de igual (o formato de uma atribuição em código):
se um dia alguém colar a chave secreta num arquivo do projeto, a publicação
**reprova** antes de escrever um byte.

---

## 3. Como uma conta nasce

Este é o fluxo que o briefing descrevia e que **não funcionava** como estava
escrito. O arquivo 03 dizia que `profiles` "espelha o login do Supabase Auth" —
mas nada fazia o espelho.

```
pessoa toca "Continuar com Google"
        │
        ▼
Supabase Auth cria a linha em  auth.users   (tabela DELE, não nossa)
        │
        ▼  gatilho  on_auth_user_created  →  handle_new_user()
        │
        ▼
linha criada em  profiles  (id = o mesmo uuid, papel, nome)
        │
        ▼
o app lê profiles pelo próprio token → encontra o perfil → segue
```

Sem o gatilho, o passo do meio não existe: a pessoa loga, o app procura o perfil
dela, **não acha, e trava — sem erro nenhum no caminho**. Foi a primeira coisa
acrescentada ao briefing.

O gatilho, em [`03-funcoes-e-gatilhos.sql`](../banco/03-funcoes-e-gatilhos.sql):

```sql
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer          -- roda com poder de dono: no momento do cadastro
set search_path = public  -- a pessoa ainda NÃO tem permissão de escrever
as $$
begin
  insert into public.profiles (id, papel, nome, telefone)
  values (
    new.id,
    case when new.raw_user_meta_data->>'papel' = 'terapeuta'
         then 'terapeuta' else 'cliente' end,   -- normalizado À FORÇA
    coalesce(nullif(trim(new.raw_user_meta_data->>'nome'), ''),
             nullif(trim(new.raw_user_meta_data->>'full_name'), ''),  -- vem do Google
             nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
             'Pessoa'),
    new.phone
  )
  on conflict (id) do nothing;   -- reexecução não pode quebrar o cadastro
  return new;
end;
$$;
```

Três decisões nele que valem explicação:

- **`security definer`**: o gatilho roda no instante do cadastro, quando o
  usuário ainda não tem nenhuma política liberando escrita em `profiles`. Sem
  definer, o insert falharia por permissão.
- **O papel é normalizado à força** (`case ... else 'cliente'`). Erro dentro
  deste gatilho **reprova o cadastro inteiro** — um `papel` inválido vindo do
  cliente bateria no CHECK e ninguém mais conseguiria criar conta. Não se confia
  em nada que veio da tela.
- **`on conflict do nothing`**: se o gatilho for disparado duas vezes (acontece
  em migração, em reprocessamento), a segunda não explode.

### Onde o papel é conferido de verdade

A tela pergunta "quero encontrar / sou terapeuta". Essa resposta vai para
`profiles.papel`. Mas quem **usa** o papel para decidir algo é o banco:

```sql
-- 04-rls.sql — só quem tem papel 'terapeuta' cria perfil profissional
create policy "criar o proprio perfil" on perfis_terapeuta
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from profiles p
                where p.id = auth.uid() and p.papel = 'terapeuta')
  );
```

Quem chamar a API direto com papel `cliente` e tentar criar um perfil de
terapeuta recebe **erro de política**, não uma linha nova.

---

## 4. As tabelas, e por que cada uma existe

### O núcleo (arquivo 03 do briefing, transcrito em [`02-tabelas.sql`](../banco/02-tabelas.sql))

| Tabela | O que guarda | A regra que carrega |
|---|---|---|
| `profiles` | uma linha por pessoa logada | `papel` só aceita `cliente`/`terapeuta`; o telefone é da pessoa (grant de coluna, §5) |
| `terapias` | o catálogo (12 itens) | controlado pelo admin — evita "Apometria", "apometria" e "Apometria Quântica" como três coisas |
| `perfis_terapeuta` | a vitrine profissional | `localizacao geography(point)` com índice GiST — é o coração da busca; `verificada` **não pode** ser escrita pela própria terapeuta |
| `terapeuta_terapias` | N:N com o catálogo | — |
| `servicos` | nome, duração, valor | `valor >= 0` |
| `horarios` | dia da semana + faixa | `fecha > abre`; `dia_semana` 0–6 com **0 = domingo** (mesma convenção do JS) |
| `avaliacoes` | nota + comentário + resposta | **`unique (terapeuta_id, cliente_id)`** e **`terapeuta_id <> cliente_id`** — as duas travas anti-fraude do arquivo 04 são constraints, não código |
| `favoritos` | quem guardou quem | só a dona vê (nem a terapeuta favoritada) |
| `denuncias` | fila de moderação | autora cria, **só admin lê** — se a terapeuta pudesse ler, denunciar deixaria de ser seguro |

### As três peças que faltavam no briefing

| Peça | Sem ela |
|---|---|
| gatilho `handle_new_user` | criar conta não cria perfil; o app trava no primeiro login |
| tabela `admins` | o arquivo 04 pede "só admin lê denúncias", mas `papel` só aceita cliente/terapeuta — a política não tinha como ser escrita |
| coluna `so_bairro` | a opção "mostrar só o bairro" existe na tela e no arquivo 04, e não tinha onde ser guardada |

`admins` é tabela separada, e não um terceiro valor no `check` de `papel`, por um
motivo: **assim o app nunca consegue se autopromover** mexendo no próprio
perfil. Admin entra pelo painel do Supabase, nunca pela API — não há política de
INSERT em `admins`, e RLS nega o que não foi explicitamente liberado.

### Conquistas e notificações ([`08-conquistas-e-notificacoes.sql`](../banco/08-conquistas-e-notificacoes.sql))

| Tabela | O que guarda | A regra que carrega |
|---|---|---|
| `conquistas` | o catálogo (7 selos) | espelha `src/03b-conquistas.js`; `conferir.js` compara os dois |
| `conquistas_usuario` | quem conquistou o quê | **ninguém tem INSERT** — só os gatilhos escrevem (§6) |
| `notificacoes` | a caixa de entrada | a pessoa só pode alterar `lida_em` (grant de coluna) |
| `preferencias_notificacao` | silêncio por pessoa | 21h–8h por padrão, mas é dela |
| `aparelhos` | token de push por aparelho | pronto para a Fase 3 sem mexer em estrutura |

---

## 5. Linha × coluna: os dois filtros que o Supabase exige

Este é o erro mais fácil de cometer, e ele aparece duas vezes no projeto.

**RLS decide QUAIS LINHAS. Só isso.** Uma política de UPDATE que libera a linha
da avaliação para a terapeuta (para ela responder) libera **a linha inteira** —
nota, comentário, autora. Sem mais nada, quem recebeu 2 estrelas poderia
transformá-las em 5.

Os dois remédios, usados conforme o caso:

**Grant de coluna** — quando a restrição é fixa:

```sql
-- 04-rls.sql: o telefone é da pessoa e de mais ninguém
revoke all on profiles from anon, authenticated;
grant select (id, papel, nome, foto_url, criado_em) on profiles to authenticated;
grant update (nome, foto_url, telefone)             on profiles to authenticated;

-- 08: da notificação, a pessoa só marca como lida
revoke update on notificacoes from authenticated;
grant  update (lida_em) on notificacoes to authenticated;

-- o selo de confiança não é um botão que a própria terapeuta aperta
revoke update (verificada) on perfis_terapeuta from authenticated;
```

**Gatilho de proteção** — quando a regra depende de **quem** está mexendo:

```sql
-- 03-funcoes-e-gatilhos.sql, §5b
create or replace function proteger_avaliacao() returns trigger ... as $$
begin
  if auth.uid() = old.cliente_id then                 -- a autora
    if new.resposta is distinct from old.resposta then
      raise exception 'A resposta é da terapeuta, não de quem avaliou.';
    end if;
    return new;
  end if;
  -- qualquer outra pessoa (a terapeuta avaliada) só toca a resposta
  if new.nota is distinct from old.nota
     or new.comentario is distinct from old.comentario
     or new.cliente_id is distinct from old.cliente_id then
    raise exception 'Só a autora pode alterar a nota e o comentário.';
  end if;
  return new;
end; $$;
```

A política "terapeuta responde a avaliação" no `04-rls.sql` carrega o aviso
explícito: *"esta política sozinha deixaria a terapeuta reescrever a nota; quem
impede é o gatilho. Sem ele, esta política é um buraco."*

---

## 6. O que o banco faz sozinho

Tudo o que precisa ser verdade **sempre** não pode depender de o aplicativo
lembrar de fazer.

| Gatilho | Dispara em | Faz |
|---|---|---|
| `on_auth_user_created` | cadastro | cria `profiles` (§3) |
| `trg_faixa_preco` | insert/update/delete em `servicos` | recalcula `preco_min`/`preco_max` — campo repetido **sempre** diverge; assim a repetição deixa de ser risco |
| `trg_moderar_avaliacao` | insert/update de comentário | palavra suspeita → `status = 'pendente'`. **Não bloqueia**: bloquear ensina a driblar |
| `trg_proteger_avaliacao` | update em `avaliacoes` | §5 |
| `trg_apos_avaliacao` | avaliação publicada | concede `primeira-avaliacao` à autora **e** avisa a terapeuta na caixa |
| `trg_apos_resposta` | resposta escrita | concede `primeira-resposta` e avisa a autora |
| `trg_apos_favorito` | 3º favorito | concede `colecionadora` |
| `trg_apos_perfil_terapeuta` | perfil criado | concede `perfil-no-ar` |

Um detalhe de `sincronizar_faixa_preco` que já custou tempo em outros projetos:
em gatilho de DELETE **o registro `new` não existe** — tocar em `new.qualquer`
levanta `record new is not assigned yet`. Por isso o desvio explícito por
`tg_op`.

### Por que a conquista é concedida pelo banco

Se o aplicativo escrevesse "conquistei X" na tabela, qualquer pessoa com a chave
`anon` escreveria também — e um selo que se dá a si mesmo não vale nada. Em
`conquistas_usuario` **não há política de INSERT para ninguém**. Quem concede é
`conceder_conquista()`, `security definer`, chamada pelos gatilhos acima quando
o **fato** acontece.

As três conquistas que acontecem no aparelho (abrir o mapa, ver 5 perfis, tocar
no WhatsApp) não deixam rastro no banco **de propósito** — registrar cada tela
vista seria coletar mais do que o app precisa (minimização, arquivo 04). Para
elas existe `conceder_conquista_de_uso(slug)`, que **só aceita esses três slugs**
e levanta exceção para qualquer outro. São selos de uso, não de fato verificável,
e o código diz isso.

---

## 7. A busca principal: "quem está perto de mim"

```sql
create or replace function terapeutas_proximas(lat, lng, raio_m default 30000)
returns table (...)
language sql stable as $$
  select ...,
    -- privacidade: quem marcou "só o bairro" tem a posição ARREDONDADA
    -- para uma grade de ~330 m ANTES de sair do banco
    case when p.so_bairro
         then round(st_y(p.localizacao::geometry)::numeric / 0.003) * 0.003
         else st_y(p.localizacao::geometry)::numeric end,
    ...
    esta_aberta(p.user_id),
    st_distance(p.localizacao, st_makepoint(lng, lat)::geography)
  from perfis_terapeuta p
  join profiles pr on pr.id = p.user_id
  left join avaliacoes a on a.terapeuta_id = p.user_id
  where p.ativa
    and st_dwithin(p.localizacao, st_makepoint(lng, lat)::geography, raio_m)
  group by p.user_id, pr.id
  order by distancia_m;
$$;
```

Três correções em relação ao briefing, todas assinaladas no arquivo:

1. **Mascarar só na tela não adianta.** A posição exata já teria viajado pela
   rede; quem olhar a resposta da API vê o endereço de casa dela. A grade de
   ~330 m é aplicada **na origem**.
2. **`group by` pelas chaves primárias**, não por `nome, foto_url`. Agrupar por
   nome funciona por acidente enquanto ninguém acrescenta coluna ao `select`; no
   dia em que acrescentar, o erro aparece longe dali.
3. **A posição da cliente chega por parâmetro e não é gravada em lugar nenhum**
   — nem em log. É a regra de ouro do arquivo 03 e a minimização do 04.

`st_dwithin` usa o índice GiST em `localizacao`; sem ele, cada abertura do mapa
leria a tabela inteira.

E a **view** `terapeutas_publicas` existe pelo motivo do §5: RLS filtra linha,
não coluna. Sem a view, quem lê `perfis_terapeuta` recebe o `endereco` completo
de quem pediu para mostrar só o bairro. **`security_invoker = on`** nela é
obrigatório — sem isso a view roda com os poderes de quem a criou e vira um
buraco por onde se lê tudo. É o erro de view mais comum no Supabase.

---

## 8. Como uma conta morre (LGPD)

Na tela: *Minha conta → Excluir minha conta*, com diálogo de confirmação. No
banco, a política:

```sql
create policy "excluir a propria conta" on profiles
  for delete to authenticated using (auth.uid() = id);
```

E o que faz o resto acontecer é o `on delete cascade` em cada tabela que aponta
para `profiles` — perfil profissional, serviços, horários, avaliações,
favoritos, conquistas, notificações, aparelhos. Apagar a linha em `profiles`
apaga tudo. `07-limpar-semente.sql` termina com uma conferência que **prova o
cascade**: se sobrar linha em `perfis_terapeuta` depois de apagar os usuários
de demonstração, o cascade não está no lugar — e excluir conta deixaria rastro.

Detalhe do arquivo 04 que ainda **não** está implementado: avaliações de uma
conta excluída deveriam ser **anonimizadas** ("Cliente do app") em vez de
sumir. Hoje somem pelo cascade. É decisão de produto (a terapeuta perde a
avaliação); está registrado como pendência da Fase 2.

---

## 9. A semente: gerada, nunca digitada

`06-semente.sql` **não se edita**. Ele é gerado por `banco/gerar_semente.js` a
partir de `src/03-dados.js`, que é onde as 12 terapeutas existem uma única vez.
Redigitar em SQL criaria uma segunda verdade — muda-se o preço no protótipo, o
banco continua com o antigo, e a diferença aparece na frente de uma cliente.

Dois pontos de honestidade sobre ela:

- **Insere direto em `auth.users`**, coisa que o Supabase espera que seja feita
  pelo cadastro. Funciona para as chaves estrangeiras terem em quem se apoiar;
  nenhum desses usuários consegue logar (o hash de senha é inválido de
  propósito). É caminho de **demonstração**, não de produção.
- Todo usuário da semente tem e-mail `@exemplo.invalido` — domínio reservado
  (RFC 2606) que nenhuma pessoa real pode ter. É o que `07-limpar-semente.sql`
  usa para apagar só a ficção.

---

## 10. O que `conferir.js` prova — e o que não prova

```
node banco/conferir.js
```

**Não prova que o SQL roda.** Não há Postgres nesta máquina; só o Supabase dirá.

**Prova** as 12 coisas que dá para provar sem banco, e que são onde o erro
costuma estar num SQL escrito à mão: toda coluna e tabela da semente existe no
esquema (02 + 08); os dois catálogos (terapias e conquistas) batem com o app,
**nome e descrição incluídos**; nenhum `.sql` tem aspas desbalanceadas (o
defeito clássico em que um apóstrofo não escapado vira texto e o erro aparece
300 linhas adiante); **toda tabela tem RLS ligada** e ao menos uma política; a
semente está em dia com a fonte.

Um erro já foi pego **na escrita**, e serve de aviso do que o conferidor não
alcança: `unaccent()` não é `IMMUTABLE`, e o Postgres recusa função assim
dentro de índice. Sem o invólucro `f_unaccent` do `01-extensoes.sql`, o
`02-tabelas.sql` falharia no primeiro `Run`. Erros dessa natureza aparecem no
Supabase, não aqui.

---

## ⚠️ NÃO FOI POSSÍVEL VALIDAR

- **Nenhum destes arquivos rodou num Postgres.** O passo seguinte é criar o
  projeto no Supabase (conta do dono, região São Paulo) e executar os 8 na
  ordem, conferindo cada resultado esperado.
- O fluxo real de login (Google OAuth, OTP por celular) **não foi exercitado** —
  o protótipo aceita qualquer coisa. `handle_new_user` foi escrito contra a
  estrutura documentada de `auth.users` e `raw_user_meta_data`, não contra um
  cadastro de verdade.
- Limite de ações por minuto (arquivo 04, item 5) é Edge Function, não banco —
  e não existe ainda.
