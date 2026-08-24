# Documentação técnica — Mapa Holístico

Estes documentos explicam **como o código funciona e por que ele é assim** — as
decisões, os defeitos que cada regra pagou para existir, e o que ainda não foi
provado. Eles não substituem o código: apontam para ele.

**Regra de leitura:** quando este texto e o código divergirem, **o código está
certo e este texto está velho** — e isso é um defeito de documentação a corrigir
no mesmo commit que mudou o código.

| Documento | O que explica | Leia quando… |
|---|---|---|
| [01 — Arquitetura geral](01-arquitetura-geral.md) | as peças, a ordem de carga, as fontes únicas, os montadores | for tocar em qualquer coisa pela primeira vez |
| [02 — Contas e banco de dados](02-contas-e-banco-de-dados.md) | como uma conta nasce, vive e morre; RLS; as duas chaves; cada tabela e o seu porquê | for mexer no Supabase, em login, ou em qualquer dado de pessoa |
| [03 — Física e gestos](03-fisica-e-gestos.md) | molas, momento, rubber-band; as armadilhas de `pointer events` | for mexer em animação, arraste, folha ou navegação |
| [04 — Mapas e GPS](04-mapas-e-gps.md) | os dois motores de mapa, a coordenada como fonte, os seis finais de um pedido de localização | for mexer no mapa, nos pinos ou em localização |
| [05 — Conquistas e notificações](05-conquistas-e-notificacoes.md) | o catálogo espelhado, quem concede (e por quê é o banco), a política do aviso e a tela de bloqueio | for mexer em selos, avisos ou no canal nativo |
| [06 — Desempenho e responsividade](06-desempenho-e-responsividade.md) | os orçamentos com régua, os defeitos de desempenho já pagos, as larguras provadas | quando "parece lento" ou antes de adicionar peso |

## O mapa mental em 60 segundos

```
briefing (docs/)  ── o QUE construir. Fonte da verdade do produto.
        │
src/              ── o código-fonte, numerado pela ORDEM DE CARGA
        │              02-fisica → 03-dados → 03b-conquistas → 04-mapa
        │              → 04b-mapa-real → 04c-gps → 05-telas → 06-app
        ├── montar.js    ── costura src/ num único index.html
        └── publicar.js  ── gera o repositório público (com portão de varredura)
        │
banco/            ── o SQL do Supabase, numerado pela ORDEM DE EXECUÇÃO
        │              extensões → tabelas → funções/gatilhos → RLS →
        │              catálogo → semente → (limpar) → conquistas/notificações
        │              A SEMENTE É GERADA de src/03-dados.js. Nunca à mão.
        │
android/          ── WebView servindo o index.html de dentro do pacote,
        │              mais as pontes: WhatsApp, barra de status, GPS, avisos
        │
teste/            ── bancadas em navegador real + sondas de diagnóstico
```

## As três regras que tudo aqui obedece

1. **Fonte única.** As 12 terapeutas existem UMA vez (`src/03-dados.js`) e o
   banco, o mapa e as telas derivam delas. O catálogo de conquistas existe em
   dois lugares por necessidade (app e SQL) — então há uma **prova** que compara
   os dois e reprova a divergência (`banco/conferir.js`).
2. **Regra no app é sugestão; no banco é lei.** Tudo o que precisa ser verdade
   sempre (uma avaliação por pessoa, ninguém se avalia, conquista não se dá a si
   mesmo) vive em constraint, trigger ou RLS — nunca só na tela.
3. **Afirmação pede medição.** Cada promessa tem uma bancada: os fluxos
   (`bancada.js`), o GPS (`gps.js`), as conquistas (`conquistas.js`), o plano B
   sem internet (`sem-mapa-real.js`), o SQL (`banco/conferir.js`). O que não foi
   possível medir está escrito como **NÃO FOI POSSÍVEL VALIDAR** — no README.
