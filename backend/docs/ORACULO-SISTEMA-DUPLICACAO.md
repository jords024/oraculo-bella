# Oráculo de Conteúdo — Sistema de Duplicação White-Label
## Documento de Arquitetura, Onboarding e Processo de Entrega

> **Para:** Novos clientes que contratam o Sistema Oráculo
> **Versão:** 1.0 — Maio 2026
> **Autor:** Nano Banana (Engenharia de Sistemas e Processos)

---

## PARTE 1 — O QUE É O SISTEMA ORÁCULO

### Definição em uma linha

O Oráculo é uma **fábrica autônoma de conteúdo para Instagram**, movida por Inteligência Artificial, que transforma um tema em um carrossel completo de 10 slides ou em um Reel de vídeo — com copy viral, imagens cinematográficas, narração, trilha e publicação automática.

### O que ele produz

| Formato | Composição | Publicação |
|---------|-----------|------------|
| **Carrossel** | 10 slides (1080x1350px), copy Método Jordânico, imagens IA por slide | Automática via Meta API |
| **Reel de Vídeo** | 7 cenas × (voz + efeito sonoro + vídeo IA + trilha de fundo) | Manual (montagem final) |

### A inteligência por trás

O sistema não é um template. É uma cadeia de agentes de IA especializados que operam em sequência:

```
TEMA (qualquer assunto relevante ao nicho do cliente)
    ↓
[Copywriter IA]       → escreve a narrativa com arco emocional
    ↓
[Humanizer]           → transforma copy genérica em voz da marca
    ↓
[Revisor/Oráculo]     → pontua e aprova (ou reescreve) pelo critério viral
    ↓
[Canalizador Visual]  → decide layout e âncora visual por slide
    ↓
[Diretor Artístico]   → gera imagem por slide via OpenAI gpt-image-2
    ↓
[Compositor]          → monta o slide final com texto + imagem
    ↓
[Publisher]           → sobe para ImgBB e publica no Instagram via Meta API
```

Para Reels, o fluxo é paralelo por cena:

```
TEMA
    ↓
[Copywriter Reels]   → 7 falas (Método Jordânico adaptado)
    ↓
[Diretor de Cena]    → visual surreal por fala
    ↓
  Por cada cena (em paralelo):
  ├── [Voz Misteriosa]  → TTS via ElevenLabs
  ├── [Sonoplasta]      → SFX via ElevenLabs Sound
  └── [Kling Video]     → vídeo IA via fal.ai
    ↓
[Músico]             → trilha de fundo via Stable Audio (fal.ai)
```

---

## PARTE 2 — ARQUITETURA TÉCNICA (O QUE EXISTE NO SISTEMA)

### Estrutura de Pastas

```
oraculo-[cliente]/
├── core/
│   ├── agentes/                  ← Todos os agentes de IA
│   │   ├── diretor_artistico.py  ← Orquestrador do carrossel
│   │   ├── roteirista_reels.py   ← Escritor de roteiros de vídeo
│   │   ├── copywriter_reels.py   ← Narrativa do Reel
│   │   ├── diretor_de_cena.py    ← Visuais por cena
│   │   ├── voz_misteriosa.py     ← TTS ElevenLabs
│   │   ├── sonoplasta.py         ← SFX ElevenLabs
│   │   ├── musico.py             ← Trilha Stable Audio
│   │   ├── planner.py            ← Grade editorial 30 dias
│   │   └── register_carousel.py  ← Registro no dashboard
│   └── util/
│       ├── compose_util_v3.py    ← Motor de composição visual
│       └── gen_image_openai.py   ← Chamada OpenAI gpt-image-2
│
├── infra/
│   ├── uploaders/                ← Upload de imagens para CDNs
│   │   ├── minio_uploader.py     ← MinIO (principal para Meta API)
│   │   └── catbox_uploader.py    ← CatBox (gratuito)
│   ├── social/
│   │   ├── instagram_publisher.py← Pipeline completo de publicação
│   │   ├── publish_instagram.py  ← CLI do dashboard
│   │   └── notion_calendar.py    ← Integração Notion (grade editorial)
│   └── video/
│       ├── kling_pro_manager.py  ← Geração de vídeo fal.ai Kling
│       └── seedance_manager.py   ← Alternativa Seedance
│
├── processos/
│   ├── pipeline_reels.py         ← Orquestrador de Reels
│   └── reel_[nome].py            ← Cada reel específico
│
├── agents/                       ← Identidade e regras em Markdown
│   ├── canalizador-visual.md     ← Leis visuais + decisão de layout
│   ├── oraculo-revisor.md        ← Critérios de revisão viral
│   ├── humanizer.md              ← Voz da marca
│   └── visual-dna.md             ← DNA visual da marca
│
├── campanhas/
│   └── reels/[nome-do-reel]/     ← Assets organizados por cena
│       ├── cena_01/voz.mp3
│       ├── cena_01/sfx.mp3
│       ├── cena_01/video.mp4
│       └── trilha_fundo.mp3
│
├── dashboard/
│   ├── server.js                 ← API Node.js porta 3131
│   ├── public/index.html         ← Interface visual do dashboard
│   └── data/
│       ├── carousels.json        ← Banco de carrosséis
│       └── oraculo_data.json     ← 843+ posts com métricas
│
└── .env                          ← Todas as credenciais (NÃO vai para git)
```

### As Camadas de Configuração do Sistema

O sistema tem **três camadas** que precisam ser adaptadas para um novo cliente:

| Camada | O que é | Onde fica | Complexidade |
|--------|---------|-----------|--------------|
| **Credenciais** | Chaves de API, tokens | `.env` | Baixa — trocar valores |
| **Identidade da Marca** | Voz, visual DNA, nicho | `agents/*.md` + `CLAUDE.md` | Média — reescrever definições |
| **Método Editorial** | Arco narrativo, presets, temas | `core/agentes/diretor_artistico.py` | Alta — reconfigurar lógica |

---

## PARTE 3 — O QUE FALTA FAZER PARA DUPLICAR

### O que É configurável (trocar e pronto)

- Todas as chaves de API (`.env`)
- ID da conta do Instagram
- ID da página do Facebook
- ID da voz no ElevenLabs
- Conta no ImgBB (upload de imagens)
- Watermark (`@nomedaconta`) no compose_util
- CTA fixo (ex: "COMENTE FONTE" → "COMENTE [PALAVRA]")

### O que precisa ser REESCRITO para o novo cliente

- `agents/humanizer.md` → voz da marca do cliente
- `agents/oraculo-revisor.md` → critérios alinhados ao nicho
- `agents/canalizador-visual.md` → paleta, presets, referências visuais
- `agents/visual-dna.md` → identidade visual real
- `CLAUDE.md` → instruções operacionais do projeto
- `core/agentes/diretor_artistico.py` → PRESET_ATMOSPHERE, SLIDE_ENERGY
- `core/agentes/roteirista_reels.py` → SYSTEM_PROMPT (nicho + regras)
- `core/agentes/copywriter_reels.py` → narrativa e tom

### O que é a "alma" do sistema — precisa de ONBOARDING profundo

- O Método Jordânico adaptado para o nicho
- O produto/serviço que o CTA entrega
- A "Raiva Coletiva" do público (o que o sistema ou instituição falhou)
- As "Praças" de conteúdo (ex: MENTE / CORPO / SISTEMA / ESPÍRITO / ALAVANCA)
- O DNA visual (paleta, referências artísticas, arquétipos)

---

## PARTE 4 — ONBOARDING DO CLIENTE (O QUE PRECISAMOS DELE)

### Bloco 1 — Credenciais Técnicas (sem isso o sistema não roda)

Entregar em formulário seguro (Notion + senha, nunca por e-mail):

---

**1.1 OpenAI API Key**
- Para geração de imagens (gpt-image-2) e agentes de copy (GPT-4o)
- Criar em: https://platform.openai.com/api-keys
- Permissão necessária: `images.write`, `chat.completions`
- Custo aproximado: ~$0.04–$0.08 por imagem | ~$0.01 por roteiro
- **IMPORTANTE:** Fornecer também o limite de gasto (billing limit) configurado

**1.2 Meta Access Token (Instagram + Facebook)**
- Token de Sistema (System User Token) — NÃO expira
- Criar em: https://business.facebook.com → Configurações → Usuários do Sistema
- Permissões obrigatórias:
  - `instagram_content_publish`
  - `instagram_manage_insights`
  - `pages_read_engagement`
- Fornecer também:
  - `INSTAGRAM_ACCOUNT_ID` (ID numérico da conta profissional)
  - `FACEBOOK_PAGE_ID` (ID numérico da página vinculada)
- Como encontrar o INSTAGRAM_ACCOUNT_ID: Graph API Explorer → `me/accounts`

**1.3 ImgBB API Key**
- Para hospedar imagens temporariamente (exigido pela Meta API para carrosséis)
- Criar em: https://api.imgbb.com
- Gratuito até 32MB/imagem | sem limite de uploads

**1.4 ElevenLabs API Key** *(apenas se for produzir Reels)*
- Para TTS (narração) e Sound Generation (efeitos sonoros)
- Criar em: https://elevenlabs.io → Profile → API Key
- Fornecer também:
  - `VOICE_ID` — ID da voz preferida (ou escolhemos juntos no setup)
- Plano recomendado: Creator ($22/mês) para volume médio

**1.5 fal.ai API Key** *(apenas se for produzir Reels com vídeo IA)*
- Para geração de vídeos (Kling Pro v1.6) e trilha musical (Stable Audio)
- Criar em: https://fal.ai/dashboard → API Keys
- Créditos: cada vídeo de 5s custa ~$0.28–$0.35

**1.6 Notion Integration Token** *(opcional — grade editorial)*
- Para planejamento editorial automático de 30 dias
- Criar em: https://www.notion.so/my-integrations
- Fornecer também: `NOTION_DATABASE_ID` do calendário editorial

---

### Bloco 2 — Identidade da Marca (a alma do sistema)

Este bloco determina o QUE o sistema fala e COMO ele fala. Sem isso, o sistema funciona mas não tem identidade.

**2.1 Informações Básicas**

```
Nome da marca/conta:
Instagram (handle):
Nicho principal (ex: saúde, finanças, espiritualidade, negócios):
Sub-nicho (mais específico):
Produto/serviço principal que o conteúdo promove:
Como o produto é entregue (DM, link bio, checkout):
Palavra-chave do CTA (o que o seguidor comenta para receber):
```

**2.2 O Público — Quem é o Seguidor**

```
Idade média:
Gênero predominante:
Maior dor ou frustração do público (1 frase):
Maior desejo ou sonho do público (1 frase):
Crença limitante que ele carrega sobre o tema:
O que ele já tentou e não funcionou:
Como ele descreveria seu problema para um amigo (linguagem real, informal):
```

**2.3 O Inimigo — O Sistema que Falhou**

O conteúdo mais viral nomeia um inimigo legítimo (não uma pessoa, mas um sistema, instituição ou crença).

```
Qual sistema ou estrutura manteve seu público no problema?
(ex: educação financeira tradicional, medicina convencional, religião dogmática)

Existe algum dado ou fato verificável que prova essa falha?
(ex: pesquisa, estatística, decisão governamental, ano específico)

Como você nomeia esse antagonista no seu conteúdo normalmente?
```

**2.4 As Praças de Conteúdo**

As Praças são os 5 eixos temáticos que o sistema rotaciona semanalmente.

```
Praça 1 (equivalente a MENTE):     _______________
Praça 2 (equivalente a CORPO):     _______________
Praça 3 (equivalente a SISTEMA):   _______________
Praça 4 (equivalente a ESPÍRITO):  _______________
Praça 5 (equivalente a ALAVANCA):  _______________

(Pode usar exatamente essas ou renomear para o nicho do cliente)
```

**2.5 Voz da Marca**

```
Como você descreveria o tom da sua comunicação? (3 adjetivos):
Exemplo de texto que você escreveu e gostou muito:
Exemplo de texto de outro criador que tem o tom que você quer:
O que você NUNCA diria na sua comunicação:
Você prefere linguagem mais:  [ ] Técnica/científica  [ ] Espiritual  [ ] Mista
```

---

### Bloco 3 — DNA Visual

**3.1 Referências Visuais**

```
Conta(s) do Instagram com visual que você admira (até 3 links):
Paleta de cores da marca (hex ou descrição):
Preset emocional preferido:
  [ ] Esotérico/Místico (violeta, dourado)
  [ ] Científico/Cinematográfico (azul elétrico, teal)
  [ ] Dramático/Confronto (vermelho, preto)
  [ ] Sagrado/Espiritual (âmbar, ouro)
  [ ] Misto (descrever):
Fonte do logotipo/watermark (nome ou arquivo):
Nome/handle para o watermark em cada slide:
```

**3.2 Referências Artísticas** *(opcional, mas poderoso)*

```
Estilo visual de referência para as imagens:
  [ ] Gravura/Engraving (Gustave Doré)
  [ ] Anatomia Sagrada (Alex Grey)
  [ ] Cinematográfico Moderno
  [ ] Fotorrealista Místico
  [ ] Pintura a Óleo (Van Gogh, Caravaggio)
  [ ] Outro: _______________

Tem alguma imagem específica que representa o que você quer? (link ou arquivo):
```

---

### Bloco 4 — Produto e Funil

```
Nome do produto principal:
O que ele transforma na vida do cliente:
Como ele funciona (mecanismo único em 2-3 frases):
Preço ou acesso:
Onde fica (link, DM, checkout):
Qual a objeção principal do público antes de comprar:
Qual resultado o cliente relata após usar:
```

---

## PARTE 5 — PROCESSO DE DUPLICAÇÃO (PASSO A PASSO)

### Fase 1 — Setup (Dia 1) — 2-4 horas

```
[ ] Criar repositório git privado do cliente
[ ] Copiar estrutura base do Oráculo
[ ] Criar arquivo .env com template
[ ] Preencher .env com credenciais do cliente (Bloco 1 do onboarding)
[ ] Testar conexão: python testar_openai.py
[ ] Testar conexão: python testar_meta.py
[ ] Subir dashboard: node dashboard/server.js → http://localhost:3131
[ ] Confirmar que dashboard abre e mostra "0 carrosséis"
```

### Fase 2 — Configuração de Identidade (Dia 1-2) — 4-6 horas

```
[ ] Reescrever agents/humanizer.md com voz da marca (Bloco 2.5)
[ ] Reescrever agents/visual-dna.md com DNA visual (Bloco 3)
[ ] Reescrever agents/oraculo-revisor.md com nicho e critérios
[ ] Adaptar agents/canalizador-visual.md:
    - Praças → nomes do cliente
    - Tabela de cor × emoção → paleta do cliente
[ ] Atualizar core/agentes/diretor_artistico.py:
    - PRESET_ATMOSPHERE → descrição do estilo do cliente
    - SLIDE_ENERGY → energia por estado emocional no nicho
    - watermark → @conta_do_cliente
[ ] Atualizar core/agentes/roteirista_reels.py:
    - SYSTEM_PROMPT → nicho + regras de identidade visual
[ ] Atualizar CLAUDE.md com novo contexto do projeto
```

### Fase 3 — Calibração Narrativa (Dia 2-3) — 3-5 horas

```
[ ] Definir as 5 Praças de conteúdo com o cliente
[ ] Mapear 10 temas iniciais (2 por Praça)
[ ] Rodar 1 carrossel de teste com tema de baixo risco
[ ] Revisar copy → calibrar Humanizer se necessário
[ ] Revisar imagens → ajustar prompts de SLIDE_ENERGY se necessário
[ ] Documentar ajustes no CLAUDE.md do projeto
[ ] Aprovação do cliente no carrossel de teste
```

### Fase 4 — Teste de Publicação (Dia 3) — 1-2 horas

```
[ ] Publicar carrossel de teste como RASCUNHO (não publicar ainda)
[ ] Verificar se ImgBB recebeu as imagens corretamente
[ ] Verificar se Meta API criou os containers
[ ] Confirmar que o status FINISHED aparece
[ ] Publicar em conta de teste ou perfil real com aprovação
[ ] Confirmar publicação no Instagram
```

### Fase 5 — Grade Editorial (Dia 4-5) — 2-3 horas

```
[ ] Configurar Notion (se cliente optou pela integração)
[ ] Rodar python core/agentes/planner.py --dry-run
[ ] Revisar grade dos próximos 30 dias com cliente
[ ] Confirmar planner.py gerando corretamente
[ ] Gerar 5-7 carrosséis prontos para a semana 1
[ ] Organizar no dashboard com status "pronto"
```

### Fase 6 — Entrega e Treinamento (Dia 5-7)

```
[ ] Gravação de vídeo: como rodar o dashboard
[ ] Gravação de vídeo: como gerar um carrossel novo
[ ] Gravação de vídeo: como publicar pelo dashboard
[ ] Documentação: README específico do cliente
[ ] Acesso ao repositório entregue (GitHub privado ou pasta Drive)
[ ] Sessão de handover ao vivo (1h)
[ ] Canal de suporte (WhatsApp ou Slack)
```

---

## PARTE 6 — TEMPLATE DE .ENV (MODELO COMPLETO)

```env
# ── OpenAI ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-...

# ── Meta / Instagram Graph API ───────────────────────────────────────────────
META_ACCESS_TOKEN=EAAxxxxxx...    # System User Token (não expira)
INSTAGRAM_ACCOUNT_ID=17841xxxxxxxx
FACEBOOK_PAGE_ID=5829xxxxxxxx

# ── ElevenLabs (voz + SFX para Reels) ────────────────────────────────────────
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=CwhRBWXzGAHq8TQ4Fs17   # ID da voz no ElevenLabs

# ── fal.ai (vídeo Kling + trilha Stable Audio para Reels) ────────────────────
FAL_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ── Notion (grade editorial — opcional) ──────────────────────────────────────
NOTION_TOKEN=secret_xxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Gemini (legado — não usar para novos projetos) ───────────────────────────
GEMINI_API_KEY=AIzaSy...
```

---

## PARTE 7 — CUSTO MENSAL ESTIMADO POR CLIENTE

| Serviço | Uso estimado | Custo/mês |
|---------|-------------|-----------|
| OpenAI gpt-image-2 | 90 imagens (3 carrosséis/semana × 10 slides) | ~$6–8 |
| OpenAI GPT-4o | 90 roteiros de copy | ~$2–4 |
| ImgBB | Ilimitado gratuito | $0 |
| Meta API | Gratuito | $0 |
| ElevenLabs (Reels) | ~200 cenas/mês | ~$22 (plano Creator) |
| fal.ai (Reels) | ~30 vídeos/mês (7 cenas cada) | ~$60–90 |
| Notion | Plano gratuito ou Plus | $0–10 |
| **TOTAL (só carrosséis)** | | **~$8–12/mês** |
| **TOTAL (carrosséis + reels)** | | **~$90–120/mês** |

> Estes são custos de API, não incluem a mensalidade do sistema.

---

## PARTE 8 — O QUE DIFERENCIA UMA INSTALAÇÃO DA OUTRA

Cada instalação do Oráculo é **única** nos seguintes pontos:

| Componente | Fonte Oculta (@afonteoculta) | Exemplo: Saúde Funcional |
|------------|------------------------------|--------------------------|
| Nicho | Espiritualidade, epigenética | Medicina integrativa |
| Praças | MENTE / CORPO / SISTEMA / ESPÍRITO / ALAVANCA | INTESTINO / HORMÔNIOS / ESTRESSE / SONO / ENERGIA |
| Produto CTA | Tecnologia Sonora / Desbloqueio Neural | Protocolo de Detox / Consulta |
| Palavra CTA | "COMENTE FONTE" | "COMENTE SAÚDE" |
| Paleta | Violeta, dourado, teal | Verde, âmbar, branco |
| Preset Visual | Esotérico/Místico | Científico/Natural |
| Humanizer | Voz iniciática, densa, âncora científica | Voz clínica-empática, acessível |
| Revisor | Critérios espirituais virais | Critérios saúde educacional |
| Referências visuais | Van Gogh, Alex Grey, Doré | Andreas Gursky, fotografia clínica |

O **código** é o mesmo. A **alma** é completamente diferente.

---

## PARTE 9 — CHECKLIST DE QUALIDADE ANTES DA ENTREGA

### Técnico
- [ ] `.env` preenchido e testado (todas as APIs respondendo)
- [ ] Dashboard abre em `http://localhost:3131`
- [ ] Geração de 1 carrossel completo (10 slides) sem erro
- [ ] Publicação de 1 carrossel no Instagram com sucesso
- [ ] Reel de 1 tema gerado (se incluído no escopo)

### Identidade
- [ ] Humanizer validado pelo cliente ("soa como eu falo")
- [ ] Visual DNA aprovado ("parece com o que imaginei")
- [ ] 1 carrossel gerado e aprovado pelo cliente antes da entrega
- [ ] CTA funcionando (palavra certa, produto certo)

### Documentação
- [ ] `CLAUDE.md` atualizado com contexto do cliente
- [ ] `README-CLIENTE.md` com instruções operacionais simples
- [ ] Vídeo de uso gravado (dashboard + geração + publicação)
- [ ] Canal de suporte aberto

---

## PARTE 10 — FORMULÁRIO DE ONBOARDING (ENVIAR AO CLIENTE)

> Use isso como base para um Typeform, Notion Form ou Google Forms.

**Título:** "Onboarding Oráculo — [Nome do Cliente]"

**Seção 1 — Credenciais Técnicas**
- OpenAI API Key
- Meta System User Token
- Instagram Account ID
- Facebook Page ID
- ImgBB API Key
- ElevenLabs API Key + Voice ID *(se Reels)*
- fal.ai API Key *(se Reels)*
- Notion Token + Database ID *(se grade editorial)*

**Seção 2 — Identidade da Marca**
- Nome da conta/marca
- Handle do Instagram
- Nicho principal
- Sub-nicho específico
- Produto/serviço principal
- Palavra do CTA
- Como o produto é entregue

**Seção 3 — O Público**
- Maior dor em 1 frase
- Maior desejo em 1 frase
- Crença limitante
- O que já tentou e falhou
- Linguagem real do público (como ele descreve o problema)

**Seção 4 — Voz e Visual**
- 3 adjetivos que definem o tom da marca
- Exemplo de texto que você escreveu e amou
- Referência de outro criador (link)
- Paleta de cores (hex ou descrição)
- 3 contas do Instagram com visual de referência
- Estilo visual preferido (lista de opções)

**Seção 5 — Produto e Funil**
- Nome do produto
- O que ele transforma
- Como funciona (mecanismo)
- Preço ou como acessar
- Principal objeção do público
- Resultado que clientes relatam

---

## NOTAS FINAIS PARA O ENGENHEIRO DE INSTALAÇÃO

1. **Nunca commitar o `.env`** — está no `.gitignore`. Entregar via canal seguro.
2. **Meta Token** — verificar se é System User Token (não expira) ou User Token (expira em 60 dias). Usuários novos na Meta frequentemente geram o token errado.
3. **Instagram Account ID** — é diferente do ID numérico do perfil público. Buscar via `GET /me/accounts` na Graph API Explorer.
4. **ElevenLabs Voice ID** — o cliente pode não ter a voz certa. Testar 3-5 vozes antes de definir, especialmente para o nicho.
5. **fal.ai balance** — verificar créditos antes de rodar pipelines de Reels. Cada vídeo de 5s custa ~$0.28-0.35. Um pipeline completo (7 cenas) custa ~$2-2.5.
6. **ImgBB** — imagens expiram após 6 meses. Para publicações antigas, usar B2 (Backblaze) como backup permanente.
7. **Windows encoding** — todos os scripts têm `sys.stdout.reconfigure(encoding="utf-8")`. Se rodar em Linux/Mac, remover ou deixar como está (não quebra).
8. **Dashboard path** — o `server.js` usa caminhos relativos para a pasta `data/`. Ao instalar em nova máquina, conferir se o working directory está correto ao iniciar.

---

*Documento criado em Maio/2026 — Nano Banana Engenharia*
*Versão do sistema: Oráculo v2.0 (carrosséis + reels + dashboard + planejador)*
