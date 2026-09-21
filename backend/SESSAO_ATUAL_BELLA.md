# SESSÃO ATUAL — Oráculo da Bella (Isabella Dalcin)
**Data:** 2026-09-16 (sessão original: 2026-08-31)
**Arquivo:** leia este inteiro antes de mexer no pipeline de carrosséis da Bella ou responder "onde paramos".
**Não confundir com:** `SESSAO_ATUAL.md` (mesma pasta) — esse é do outro cliente/pipeline deste mesmo backend multi-marca (Jords/Fonte Oculta, desatualizado desde abril/2026, caminhos antigos em `nano-banana-mcp`). Este arquivo aqui é só sobre a Bella.

---

## O QUE É ESSE PROJETO

"Oráculo da Bella" — pipeline de 13 agentes (`backend/agents/AG00` a `AG13-*.md`) que gera carrosséis de Instagram (arte + copy) para Isabella Dalcin (@isabella.dalcin, Academia Sete, método T.A.F.A). O mesmo backend (`Bella Dalcin/backend/`) também serve outras marcas (Jords/Fonte Oculta, Hau Cacau) através do mesmo motor — ver `client.json` para a config ativa e `dashboard/agentPrompts.js` para prompts genéricos por marca.

Duas formas de gerar conteúdo:
1. **Chat "Criador"** no dashboard (`http://localhost:47821`) — **desde 16/09/2026 é um pipeline de 4-5 estágios**, não mais uma chamada única de prompt. Ver `backend/dashboard/services/editorialOrchestrator.js`: Ideação (`runBigIdeaLab`) → Estratégia → Pesquisa opcional + Verificação de Fatos → Escrita → Revisão. Cada estágio combina vários prompts de `backend/agents/`: `criador.md` (master, escrita), `oraculo-v2.md` (estrategista, ideação — reescrito em 16/09), `diretor-artistico-bella-v2.md` (direção de arte), `oraculo-revisor-bella.md` (revisão, criado em 16/09 — não usa mais o `oraculo-revisor.md` genérico, que é da HauCacau). Ver `CHANGELOG.md`, seção "Sessão de 16/09/2026", para a lista completa de qual prompt entra em qual estágio — **não presuma que só um arquivo "é o prompt"**, são vários combinados por estágio.
2. **Pipeline direto** via `backend/core/criador_pipeline.py`, chamado pelo `dashboard/services/carouselQueueWorker.js` a partir de um payload JSON com os slides já escritos.

---

## O QUE FOI FEITO NESTA SESSÃO (2026-08-31)

Resumo em ordem cronológica — detalhes técnicos completos estão em `backend/CHANGELOG.md` (seção "Sessão de 31/08/2026").

1. **Biblioteca de referências visuais** — `backend/agents/visual-references/` (`index.json` + `ref-00` a `ref-05`): análise de peças de referência (trazidas pelo usuário) documentando arquétipos de composição de carrossel (capa fotográfica, gráfico puro, painel dividido, card flutuante, textura tipográfica) e um caso de anti-padrão real (card sólido sobre foto escurecida). Plugada como regra em `AG09-tradutor-bella.md` e `AG10-curador-bella.md`.

2. **Bug de repetição do motivo visual "fio/fita/corda"** — causa raiz dupla: `backend/core/util/deck_director.py` + `backend/core/util/prompt_builder.py` (regras de código hardcoded) e `backend/agents/diretor-artistico-bella-v2.md` (o modelo convergia sozinho pra essa metáfora). Corrigido nos dois lugares. **11 fotos de 4 carrosséis já gerados antes do fix foram regeneradas** (título/legenda mantidos, só a foto trocou).

3. **Bug de sobreposição de texto** (título por cima do corpo) — `backend/core/util/composer/engine.py`, função `_safe_body_y()` nova, aplicada em 5 funções de composição.

4. **Feature `RESPIRO`/`text_anchor`** — o motor de composição parou de forçar todo texto pro rodapé (piso fixo de 62-66% da altura). Agora a IA declara `RESPIRO: topo|centro|base` por slide e o motor respeita. Encadeado em `prompt-oraculo-bella.md` → `diretor-artistico-bella-v2.md` → `carouselsGenerate.js` (parser) → `criador_pipeline.py` → `engine.py` → `compose-slide.py`/`carouselsMedia.js` (fluxo manual).

5. **Infraestrutura local:**
   - `criador_pipeline.py` agora salva em `backend/storage/carousels/` (antes salvava solto em `OneDrive/Área de Trabalho`, fora do projeto).
   - `core/agentes/register_carousel.py` reescrito — antes gravava num JSON de um projeto antigo (`nano-banana-mcp`) que o dashboard atual nunca lê; carrosséis gerados localmente ficavam invisíveis na UI. Agora autentica com JWT e chama a API real (`/api/carousels`).
   - Histórico do dashboard reconstruído após uma corrupção do banco local (PGlite) que já existia antes desta sessão.
   - `.env`: `PORT=47821` (porta incomum, evita conflito com outro serviço local do usuário), `CORS_ALLOWED_ORIGINS` atualizado. `.claude/launch.json` criado.

---

## O QUE FOI FEITO NA SESSÃO DE 2026-09-16

Entre 31/08 e 16/09, o usuário (com ajuda de outro modelo) reescreveu boa parte do sistema — ver `CHANGELOG.md` seção "O que mudou entre sessões" para o mapa completo (novo orquestrador multi-estágio, novos agentes de pesquisa/fact-check, motor de composição leve, chat com histórico persistente). Esta sessão:

1. **Auditou linha por linha** essa arquitetura nova (não existia documentação dela ainda).
2. **Confirmou e corrigiu** um diagnóstico feito pelo usuário com GPT: a ideação de temas (`runBigIdeaLab`) e a etapa de estratégia usavam `prompts.strategist || prompts.master` — o prompt rico (`criador.md`) nunca participava da criação do tema, só entrava depois na escrita. Trocado `||` por concatenação.
3. **Reescreveu `oraculo-v2.md`** do zero — de um esqueleto de 5 estados fixos para uma metodologia de 12 perguntas (cena humana → ... → "por que só a Bella"), amarrada aos 5 pilares específicos de `biblia-comunicacao-bella.md`.
4. **Criou `oraculo-revisor-bella.md`** — reviewer exclusivo baseado no scorecard /15 de `AG08-guardiao-bella.md`, substituindo o `oraculo-revisor.md` genérico (contaminado com conteúdo da HauCacau) só na referência da Bella, sem tocar no arquivo original.
5. **Reforçou linguagem popular** — título/gancho precisam ser lidos em voz alta sem travar; profundidade fica nos campos de raciocínio, não no vocabulário do título.
6. Validado com chamadas reais à API (não só no papel) — ver CHANGELOG para o antes/depois.
7. **Consolidação em "Bíblia do Oráculo" (mesma sessão, mais tarde):** o usuário notou que as regras de escrita (espelho direto, frase de espalhamento, teste do comentário previsto, cadência, layout enum) tinham sido duplicadas em 5 arquivos diferentes e pediu um "cérebro central". `oraculo-v2.md` foi reescrito para SER esse central — absorveu o essencial de `biblia-comunicacao-bella.md` (que nunca era lido pelo pipeline) + todas as regras transversais antes duplicadas. `editorialOrchestrator.js` agora injeta `prompts.strategist` (= `oraculo-v2.md`) em **todos os 4 estágios** (antes só ideação/estratégia). `criador.md`/`copywriter.md`/`gancho-viral.md`/`oraculo-revisor-bella.md` foram enxugados, mantendo só o que é específico de cada um. **Regra para qualquer sessão futura: mudança de regra transversal só em `oraculo-v2.md` — nunca duplicar de novo nos outros 4.**

**Se a próxima sessão notar temas genéricos de novo:** confira primeiro se algum desses arquivos foi revertido ou se `editorialOrchestrator.js` voltou a usar `||` em vez de concatenar, ou se `oraculo-v2.md` perdeu a seção 13 (regras transversais) / deixou de ser injetado em algum dos 4 estágios.

---

## PROBLEMA CONHECIDO, AINDA NÃO RESOLVIDO

**O banco local (PGlite/WASM) não é confiável entre reinícios do processo do dashboard.** Duas vezes nesta sessão dados recentes desapareceram da tabela `carousels` — uma vez por corrupção (antes desta sessão), outra vez ao simplesmente reiniciar o servidor (linhas criadas minutos antes do restart sumiram; linhas mais antigas sobreviveram). Hipótese: escritas recentes não são flushadas em disco a tempo do processo encerrar.

**Isso NÃO afeta os arquivos de imagem** (ficam em `backend/storage/carousels/{id}/`, independentes do banco) — só a lista/status/custo mostrados no dashboard.

**Recomendação para a próxima sessão:** se o usuário reportar "carrossel sumiu da lista", primeiro checar se a pasta de arquivos ainda existe em disco (quase sempre existe) antes de assumir perda de dado real. Considerar migrar para Postgres de verdade — as variáveis já existem em `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), só falta um Postgres rodando (local ou hospedado) para o `initDb()` em `dashboard/db.js` parar de cair no fallback PGlite.

---

## ARQUIVOS IMPORTANTES E O QUE CADA UM FAZ

```
Bella Dalcin/
├── backend/
│   ├── CHANGELOG.md                         ← log técnico detalhado, "ponte de estado" do projeto inteiro
│   ├── SESSAO_ATUAL_BELLA.md                ← ESTE ARQUIVO
│   ├── .env                                  ← PORT=47821, credenciais dashboard, chaves de API
│   ├── client.json                           ← config da marca ativa (Bella)
│   │
│   ├── agents/
│   │   ├── criador.md                       ← prompt MASTER de arquitetura/arco de escrita — usado em todos os estágios do orquestrador
│   │   ├── oraculo-v2.md                    ← BÍBLIA DO ORÁCULO — documento central (identidade/avatar/voz/vocabulário + regras transversais de escrita), injetado em TODOS os 4 estágios
│   │   ├── biblia-comunicacao-bella.md      ← dossiê estratégico completo original; essência textual já absorvida em `oraculo-v2.md`, mas continua existindo (prompt-templates de imagem etc.)
│   │   ├── oraculo-revisor-bella.md         ← reviewer exclusivo da Bella (scorecard /15), criado em 16/09
│   │   ├── oraculo-revisor.md               ← NÃO é da Bella — conteúdo HauCacau, não editar pensando na Bella
│   │   ├── pesquisador-bella.md / verificador-fatos-bella.md ← agentes de pesquisa/fact-check (novos, usados quando research_mode=required)
│   │   ├── prompt-oraculo-bella.md          ← template de formato de saída dos slides (TÍTULO/CORPO/CENA/RESPIRO/VISUAL)
│   │   ├── diretor-artistico-bella-v2.md    ← prompt-mestre de direção de arte (o "Plano-Mestre de Arte")
│   │   ├── AG00 a AG13-*.md                 ← os 13 agentes especializados (documentação/instrução histórica; AG03/04/05 foram reescritos e são consistentes com o `criador.md` novo)
│   │   └── visual-references/               ← biblioteca de referências de composição (index.json + ref-00 a ref-05)
│   │
│   ├── core/
│   │   ├── criador_pipeline.py              ← runner que pega um payload de slides e gera as imagens finais
│   │   ├── agentes/register_carousel.py     ← registra o carrossel gerado localmente no dashboard (via API + JWT)
│   │   └── util/
│   │       ├── deck_director.py             ← escolhe tema/motivo material/direção de arte do carrossel (código determinístico)
│   │       ├── prompt_builder.py            ← monta o prompt final de imagem por slide
│   │       ├── visual_reference_registry.py ← seleciona referência visual por afinidade (novo, opera sobre `agents/visual-references/`)
│   │       └── composer/
│   │           ├── engine.py                ← motor de composição de texto sobre a imagem (compose_fullbleed, dramatico, etereo, etc.)
│   │           └── bella_essential_engine.py ← motor leve novo, formato de 5 lâminas
│   │
│   ├── dashboard/
│   │   ├── server.js                        ← Node/Express, porta definida em .env (PORT=47821)
│   │   ├── db.js                            ← conecta em Postgres real se disponível, senão cai em PGlite embarcado
│   │   ├── services/
│   │   │   ├── editorialOrchestrator.js     ← NOVO — o pipeline de 4-5 estágios do chat Criador (ideação/estratégia/pesquisa/escrita/revisão)
│   │   │   ├── visualReferenceService.js    ← lê `agents/visual-references/` pro contexto do prompt de arte
│   │   │   └── carouselQueueWorker.js       ← consome a fila e chama criador_pipeline.py
│   │   └── routes/
│   │       ├── creatorChats.js              ← NOVO — histórico de conversas persistente por usuário (tabela creator_chats)
│   │       └── carousels/
│   │           ├── carouselsGenerate.js     ← monta o objeto `prompts` do orquestrador (linha ~682) + parser do texto → payload de slides
│   │           └── carouselsMedia.js        ← recompose manual de um slide
│   │
│   └── storage/carousels/                   ← ONDE OS CARROSSÉIS SÃO SALVOS (arquivos .jpg + .meta.json)
│
└── .claude/launch.json                       ← config pra `npm --prefix backend run dashboard` no preview
```

---

## COMO SUBIR O DASHBOARD

```bash
npm --prefix backend run dashboard
# abre em http://localhost:47821
```

Login: usuário e senha estão em `backend/.env` (`DASHBOARD_USER` / `DASHBOARD_PASS`). Não existe senha padrão no código: sem essas variáveis o acesso de super admin fica desligado.

---

## DECISÕES DE DESIGN ATUAIS (Bella)

- Layout principal: `bella_sequence_XX` (motor `bella_sequence_engine.py`) para carrosséis gerados via preset `bella_editorial_luxo`; `fullbleed`/`dramatico`/`etereo` para os demais.
- Motivo material do carrossel: escolhido por pool aleatório (hash) por categoria temática, nunca fio/fita/corda como padrão (ver item 2 acima).
- Posicionamento de texto: segue `RESPIRO` declarado pela IA por slide (topo/centro/base), não mais sempre no rodapé.
- Capa (S1): nunca card sólido sobre foto escurecida; nunca mulher-padrão obrigatória — variar entre foto-com-presença-humana, gráfico puro, ou ambiente/detalhe sem pessoa.
- CTA fixo: "COMENTE BELLA".
- Vocabulário proibido e regras de voz: ver `backend/agents/biblia-comunicacao-bella.md`.

---

*Atualizado ao final da sessão de 2026-09-16 (sessão original: 2026-08-31).*
