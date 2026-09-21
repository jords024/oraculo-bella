#!/usr/bin/env python3
"""
build_vault.py — Popula o vault Obsidian "Oráculo do Conteúdo"
com todo o sistema: xquads-squads + nano-banana + skills + frameworks.

USO:
    python -X utf8 build_vault.py
"""
import json
import re
from datetime import date
from pathlib import Path

import yaml

# ── Caminhos ─────────────────────────────────────────────────────────────────
VAULT   = Path("C:/Users/julia/OneDrive/Área de Trabalho/Oráculo do conteúdo/Oráculo do conteúdo")
SQUADS  = Path("C:/Users/julia/OneDrive/Área de Trabalho/Xsquads/xquads-squads")
BANANA  = Path("C:/Users/julia/nano-banana-mcp")
PLUGINS = Path("C:/Users/julia/.claude/plugins/nano-banana")

TODAY = str(date.today())

def w(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  ✓ {path.relative_to(VAULT)}")

def read_md(p: Path) -> str:
    try: return p.read_text(encoding="utf-8")
    except: return ""

def read_yaml(p: Path) -> dict:
    try:
        return yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    except: return {}

def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9-]", "-", s.lower().strip()).strip("-")

# ─────────────────────────────────────────────────────────────────────────────
# 00 — ÍNDICE PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────
def build_index():
    print("\n[00] Índice principal...")
    w(VAULT / "00 - INÍCIO.md", f"""---
tags: [sistema, índice]
created: {TODAY}
---

# 🧠 Oráculo do Conteúdo — Segundo Cérebro

> Sistema de inteligência coletiva para @afonteoculta e Xsquads

## Navegação Principal

- [[01 - SISTEMA/Visão Geral]] — Como o sistema funciona
- [[01 - SISTEMA/Produto Principal]] — Tecnologia Sonora do Desbloqueio Neural
- [[02 - SQUADS/Índice dos Squads]] — Os 12 squads e seus agentes
- [[03 - NANO BANANA/Sistema Carrossel]] — Geração de carrosséis para Instagram
- [[04 - AGENTES/Índice dos Agentes]] — Todos os 120+ agentes
- [[05 - FRAMEWORKS/Oráculo V2]] — Framework de produção de conteúdo
- [[06 - SKILLS/Índice das Skills]] — Skills e regras do sistema

## Squads Disponíveis

| Squad | Agentes | Especialidade |
|-------|---------|---------------|
| [[02 - SQUADS/Copy Squad/Copy Squad]] | 23 | Copywriting, VSL, Email, Sales Letter |
| [[02 - SQUADS/Hormozi Squad/Hormozi Squad]] | 16 | Ofertas, Leads, Escala |
| [[02 - SQUADS/Brand Squad/Brand Squad]] | 15 | Identidade, Posicionamento, Naming |
| [[02 - SQUADS/Traffic Masters/Traffic Masters]] | 16 | Tráfego pago, Media Buy |
| [[02 - SQUADS/Advisory Board/Advisory Board]] | 11 | Estratégia, Conselho |
| [[02 - SQUADS/Storytelling/Storytelling]] | 12 | Narrativa, Pitch, Manifesto |
| [[02 - SQUADS/Movement/Movement]] | 7 | Movimento de marca, Identidade |
| [[02 - SQUADS/C-Level Squad/C-Level Squad]] | 6 | Visão executiva, Operações |
| [[02 - SQUADS/Design Squad/Design Squad]] | 8 | UX, Design System |
| [[02 - SQUADS/Data Squad/Data Squad]] | 7 | Analytics, Growth, Retenção |
| [[02 - SQUADS/Claude Code Mastery/Claude Code Mastery]] | 8 | IA, MCP, Automação |
| [[02 - SQUADS/Cybersecurity/Cybersecurity]] | 15 | Segurança, Pentest |

## Produto Central

> **Tecnologia Sonora do Desbloqueio Neural**
> Site: desbloqueio24h.online
> CTA padrão: *"Comente FONTE e eu te envio a Tecnologia Sonora..."*

## Sistema Nano Banana

> Geração de carrosséis virais via Gemini API para @afonteoculta
> Dashboard: http://localhost:3131
""")

# ─────────────────────────────────────────────────────────────────────────────
# 01 — SISTEMA
# ─────────────────────────────────────────────────────────────────────────────
def build_sistema():
    print("\n[01] Sistema...")

    w(VAULT / "01 - SISTEMA/Visão Geral.md", f"""---
tags: [sistema, arquitetura]
created: {TODAY}
---

# Visão Geral do Sistema

## Arquitetura

O sistema é composto por três camadas:

```
CAMADA 1 — SQUADS (xquads-squads)
  12 squads · 120+ agentes · 150+ tasks · 24 workflows
  Especialistas em copy, brand, tráfego, storytelling...

CAMADA 2 — NANO BANANA (nano-banana-mcp)
  Geração de carrosséis via Gemini API
  Dashboard visual em http://localhost:3131
  Registro automático + publicação Instagram

CAMADA 3 — SKILLS & FRAMEWORKS
  Oráculo do Conteúdo V2
  CTA Framework (desbloqueio24h.online)
  Regras de produção e distribuição
```

## Como Claude Code se conecta

- **Skills ativas**: `carousel-publish`, `cta-framework`
- **MCP Obsidian**: conexão bidirecional com este vault
- **Plugin nano-banana**: skill ativa em toda sessão

## Fluxo de Produção de Conteúdo

```
1. Escolher tema (DEUS / DINHEIRO / RELACIONAMENTOS)
2. Aplicar Oráculo V2 → gerar copy 10 slides
3. Rodar carrossel-NOME.py → Gemini gera imagens
4. Dashboard registra automaticamente
5. Revisar no dashboard (http://localhost:3131)
6. Publicar via Instagram ou baixar ZIP
```
""")

    w(VAULT / "01 - SISTEMA/Produto Principal.md", f"""---
tags: [produto, cta, desbloqueio-neural]
created: {TODAY}
---

# Tecnologia Sonora do Desbloqueio Neural

## Informações

- **Produto**: Tecnologia Sonora do Desbloqueio Neural
- **Site**: desbloqueio24h.online
- **CTA keyword**: `FONTE`

## CTA Padrão por Pilar

### DEUS / Expansão / Cristico / Energético
```
TÍTULO: COMENTE\nFONTE
CORPO : E eu te envio a Tecnologia Sonora capaz de expandir sua consciência
        e reconectar você com o campo usando o Desbloqueio Neural
```

### DINHEIRO / Frequência / Abundância
```
TÍTULO: COMENTE\nFONTE
CORPO : E eu te envio a Tecnologia Sonora capaz de reprogramar sua frequência
        e destravar abundância usando o Desbloqueio Neural
```

### RELACIONAMENTOS / Vínculos / Padrões
```
TÍTULO: COMENTE\nFONTE
CORPO : E eu te envio a Tecnologia Sonora capaz de limpar os padrões
        que te impedem de amar e ser amado usando o Desbloqueio Neural
```

### GENÉRICO
```
TÍTULO: COMENTE\nFONTE
CORPO : E eu te envio a Tecnologia Sonora capaz de elevar sua vibração
        usando o Desbloqueio Neural
```

## Regra de Ouro

> Nunca prometer entregar conteúdo do carrossel.
> O FONTE sempre entrega o **produto**, não o tema.

## Anti-padrões (nunca usar)

- ❌ "te mando o material sobre reencarnação"
- ❌ "te envio as passagens da Bíblia"
- ❌ "te mando o guia completo"

Ver [[06 - SKILLS/CTA Framework]] para regras completas.
""")

# ─────────────────────────────────────────────────────────────────────────────
# 02 — SQUADS
# ─────────────────────────────────────────────────────────────────────────────
SQUAD_INFO = {
    "advisory-board":    ("Advisory Board",    "11 pensadores estratégicos — Munger, Naval, Dalio, Sinek..."),
    "brand-squad":       ("Brand Squad",       "15 especialistas em marca — Aaker, Ogilvy, Neumeier..."),
    "c-level-squad":     ("C-Level Squad",     "6 executivos C-level — CMO, CTO, COO, CIO, CFO..."),
    "claude-code-mastery":("Claude Code Mastery","8 especialistas em IA, MCP, hooks, automação"),
    "copy-squad":        ("Copy Squad",        "23 copywriters lendários — Ogilvy, Halbert, Kennedy, Schwartz..."),
    "cybersecurity":     ("Cybersecurity",     "15 especialistas em segurança ofensiva e defensiva"),
    "data-squad":        ("Data Squad",        "7 especialistas em analytics, growth e retenção"),
    "design-squad":      ("Design Squad",      "8 especialistas em UX, design system e produto"),
    "hormozi-squad":     ("Hormozi Squad",     "16 especialistas em ofertas, leads e escala — método Hormozi"),
    "movement":          ("Movement",          "7 arquitetos de movimento de marca e identidade"),
    "storytelling":      ("Storytelling",      "12 especialistas em narrativa — Campbell, Harmon, Duarte..."),
    "traffic-masters":   ("Traffic Masters",   "16 especialistas em tráfego pago e media buying"),
}

def build_squads():
    print("\n[02] Squads...")

    # Índice geral
    squad_links = "\n".join([
        f"- [[02 - SQUADS/{info[0]}/{info[0]}]] — {info[1]}"
        for folder, info in SQUAD_INFO.items()
    ])
    w(VAULT / "02 - SQUADS/Índice dos Squads.md", f"""---
tags: [squads, índice]
created: {TODAY}
---

# Índice dos Squads

{squad_links}

## Como usar um Squad

1. Escolha o squad adequado para a tarefa
2. Consulte a nota do squad para ver os agentes disponíveis
3. Use a routing matrix para escolher o agente certo
4. Invoke o agente com a task desejada

## Routing Rápido

| Precisa de... | Use este Squad |
|---------------|---------------|
| Copy, headline, VSL, email | [[02 - SQUADS/Copy Squad/Copy Squad]] |
| Oferta, pricing, leads | [[02 - SQUADS/Hormozi Squad/Hormozi Squad]] |
| Nome, identidade, posicionamento | [[02 - SQUADS/Brand Squad/Brand Squad]] |
| Tráfego, anúncios, media buy | [[02 - SQUADS/Traffic Masters/Traffic Masters]] |
| Narrativa, pitch, manifesto | [[02 - SQUADS/Storytelling/Storytelling]] |
| Decisão estratégica, conselho | [[02 - SQUADS/Advisory Board/Advisory Board]] |
| Movimento de marca | [[02 - SQUADS/Movement/Movement]] |
| Analytics, growth | [[02 - SQUADS/Data Squad/Data Squad]] |
| Design, UX | [[02 - SQUADS/Design Squad/Design Squad]] |
| Automação, IA, Claude Code | [[02 - SQUADS/Claude Code Mastery/Claude Code Mastery]] |
| Segurança | [[02 - SQUADS/Cybersecurity/Cybersecurity]] |
| Visão executiva | [[02 - SQUADS/C-Level Squad/C-Level Squad]] |
""")

    # Cada squad
    for folder_name, (display_name, desc) in SQUAD_INFO.items():
        squad_path = SQUADS / folder_name
        if not squad_path.exists():
            continue

        # Lê agentes
        agents_dir = squad_path / "agents"
        agents = []
        if agents_dir.exists():
            for f in sorted(agents_dir.glob("*.md")):
                agents.append(f.stem)

        # Lê tasks
        tasks_dir = squad_path / "tasks"
        tasks = []
        if tasks_dir.exists():
            for f in sorted(tasks_dir.glob("*.md")):
                tasks.append(f.stem)

        # Lê workflows
        wf_dir = squad_path / "workflows"
        workflows = []
        if wf_dir.exists():
            for f in sorted(wf_dir.glob("*.yaml")):
                workflows.append(f.stem)

        # Lê README se existir
        readme = ""
        readme_path = squad_path / "README.md"
        if readme_path.exists():
            readme_content = read_md(readme_path)
            # Extrai só o primeiro parágrafo relevante
            lines = [l for l in readme_content.split("\n") if l.strip() and not l.startswith("#")]
            readme = lines[0] if lines else ""

        agent_links = "\n".join([f"- [[04 - AGENTES/{display_name}/{a}]]" for a in agents])
        task_list   = "\n".join([f"- `{t}`" for t in tasks])
        wf_list     = "\n".join([f"- `{w}`" for w in workflows])

        w(VAULT / f"02 - SQUADS/{display_name}/{display_name}.md", f"""---
tags: [squad, {slug(display_name)}]
created: {TODAY}
agentes: {len(agents)}
tasks: {len(tasks)}
---

# {display_name}

> {desc}

{readme}

## Agentes ({len(agents)})

{agent_links or "- (nenhum encontrado)"}

## Tasks Disponíveis ({len(tasks)})

{task_list or "- (nenhuma encontrada)"}

## Workflows ({len(workflows)})

{wf_list or "- (nenhum encontrado)"}

## Como Ativar

```
Squad: {folder_name}
Pasta: xquads-squads/{folder_name}/
```

---
*← [[02 - SQUADS/Índice dos Squads]]*
""")

        # Cria notas individuais dos agentes
        if agents_dir.exists():
            for agent_file in agents_dir.glob("*.md"):
                agent_name = agent_file.stem
                content = read_md(agent_file)

                # Extrai descrição do frontmatter ou primeiras linhas
                desc_agent = ""
                lines = content.split("\n")
                for line in lines:
                    if line.startswith("description:"):
                        desc_agent = line.replace("description:", "").strip().strip('"')
                        break

                w(VAULT / f"04 - AGENTES/{display_name}/{agent_name}.md", f"""---
tags: [agente, {slug(display_name)}, {slug(agent_name)}]
squad: {display_name}
created: {TODAY}
---

# {agent_name.replace("-", " ").title()}

**Squad:** [[02 - SQUADS/{display_name}/{display_name}]]

{desc_agent}

## Conteúdo Original

{content}

---
*← [[04 - AGENTES/Índice dos Agentes]] · [[02 - SQUADS/{display_name}/{display_name}]]*
""")

# ─────────────────────────────────────────────────────────────────────────────
# 03 — NANO BANANA
# ─────────────────────────────────────────────────────────────────────────────
def build_nano_banana():
    print("\n[03] Nano Banana...")

    w(VAULT / "03 - NANO BANANA/Sistema Carrossel.md", f"""---
tags: [nano-banana, carrossel, instagram, sistema]
created: {TODAY}
---

# Sistema Nano Banana — Carrosséis para @afonteoculta

## O que é

Sistema de geração automática de carrosséis virais para Instagram usando Gemini API (gemini-2.0-flash-preview-image-generation), composição de slides com PIL e publicação via instagrapi.

## Arquitetura

```
C:/Users/julia/nano-banana-mcp/
├── carrossel-*.py         → scripts de geração (Gemini API)
├── compose_util.py        → motor de composição (PIL)
├── prompt_builder.py      → Visual Style Guide
├── register_carousel.py   → registro automático no dashboard
├── publish_instagram.py   → publicação no Instagram
├── open-dashboard.py      → inicia servidor e abre browser
└── dashboard/
    ├── server.js          → Express (porta 3131)
    ├── data/carousels.json
    └── public/index.html
```

## Slides — Dimensões e Layout

- **Resolução**: 1080 × 1350px (formato 4:5 Instagram)
- **Layout fullbleed**: imagem de fundo + gradiente escuro + texto
- **Layout card**: canvas escuro + imagem em moldura + texto abaixo
- **Fontes**: Franklin Gothic Pro-Heavy (título) + Inter (corpo)

## Visual Style Guide

```
PREFIX: "Dark cinematic mystical illustration. Single dominant focal point.
         Minimalist composition. Deep black background."

SUFFIX: "Absolutely no text, words, letters. Abstract and symbolic visual
         language only. Photorealistic dark digital art, high contrast,
         dramatic directional lighting."

PALETA:
  Preto absoluto   → fundo
  Dourado/Âmbar    → verdade, alma, consciência
  Azul-gelo        → poder institucional, ciência
  Branco puro      → revelação
```

## Dashboard

- URL: http://localhost:3131
- Iniciar: `python -X utf8 open-dashboard.py`
- Funções: visualizar slides, editar texto inline, baixar ZIP, publicar Instagram

## Carrosséis Gerados

Ver [[03 - NANO BANANA/Carrosséis Gerados]]

## Temas Ativos

- [[03 - NANO BANANA/Temas/DEUS]]
- [[03 - NANO BANANA/Temas/DINHEIRO]]
- [[03 - NANO BANANA/Temas/RELACIONAMENTOS]]
""")

    # Lê o carousels.json e gera notas
    carousels_json = BANANA / "dashboard/data/carousels.json"
    if carousels_json.exists():
        carousels = json.loads(carousels_json.read_text(encoding="utf-8"))
        rows = "\n".join([
            f"| [[03 - NANO BANANA/Carrosséis/{c['id']}]] | {c.get('theme','')} | {c.get('totalSlides',0)} | {c.get('status','')} | {c.get('createdAt','')} |"
            for c in carousels
        ])
        w(VAULT / "03 - NANO BANANA/Carrosséis Gerados.md", f"""---
tags: [carrosséis, nano-banana]
created: {TODAY}
---

# Carrosséis Gerados

| ID | Tema | Slides | Status | Data |
|----|------|--------|--------|------|
{rows}

*Atualizado automaticamente pelo build_vault.py*
""")
        # Nota individual por carrossel
        for c in carousels:
            w(VAULT / f"03 - NANO BANANA/Carrosséis/{c['id']}.md", f"""---
tags: [carrossel, {c.get('theme','')}, {c.get('status','')}]
id: {c['id']}
tema: {c.get('theme','')}
formato: {c.get('format','')}
status: {c.get('status','')}
slides: {c.get('totalSlides',0)}
created: {c.get('createdAt',TODAY)}
---

# {c.get('title', c['id'])}

**ID:** {c['id']}
**Tema:** {c.get('theme','')}
**Formato:** {c.get('format','')}
**Status:** {c.get('status','')}
**Slides:** {c.get('totalSlides',0)}
**Pasta:** `{c.get('slidesDir','')}`

## Caption

{c.get('caption','*(sem caption)*')}

## Notas

{c.get('notes','*(sem notas)*')}

---
*← [[03 - NANO BANANA/Carrosséis Gerados]]*
""")

    # Temas
    for tema, conteudo in [
        ("DEUS", "Expansão de consciência, metafísica, cristico, energético, dimensões, reencarnação, campo quântico"),
        ("DINHEIRO", "Frequência, abundância, reprogramação financeira, mentalidade, manifestação"),
        ("RELACIONAMENTOS", "Vínculos, padrões kármicos, amor, feridas emocionais, atração"),
    ]:
        w(VAULT / f"03 - NANO BANANA/Temas/{tema}.md", f"""---
tags: [tema, {slug(tema)}, nano-banana]
created: {TODAY}
---

# Tema: {tema}

## Escopo

{conteudo}

## CTA Padrão

Ver [[01 - SISTEMA/Produto Principal]] para a variação correta deste pilar.

## Ângulos Ativos

*(adicione ângulos aqui conforme são desenvolvidos)*

## Carrosséis deste Tema

*(backlinks automáticos do Obsidian)*
""")

# ─────────────────────────────────────────────────────────────────────────────
# 04 — ÍNDICE DE AGENTES
# ─────────────────────────────────────────────────────────────────────────────
def build_agentes_index():
    print("\n[04] Índice de agentes...")
    rows = "\n".join([
        f"| [[04 - AGENTES/{info[0]}/|{info[0]}]] | {info[1]} |"
        for _, info in SQUAD_INFO.items()
    ])
    w(VAULT / "04 - AGENTES/Índice dos Agentes.md", f"""---
tags: [agentes, índice]
created: {TODAY}
---

# Índice dos Agentes

| Squad | Especialidade |
|-------|---------------|
{rows}

## Agentes de Destaque

### Copy
- [[04 - AGENTES/Copy Squad/david-ogilvy]] — O pai da publicidade moderna
- [[04 - AGENTES/Copy Squad/gary-halbert]] — The Prince of Print
- [[04 - AGENTES/Copy Squad/eugene-schwartz]] — Breakthrough Advertising
- [[04 - AGENTES/Copy Squad/dan-kennedy]] — No B.S. Marketing
- [[04 - AGENTES/Copy Squad/claude-hopkins]] — Scientific Advertising

### Estratégia
- [[04 - AGENTES/Advisory Board/ray-dalio]] — Princípios e tomada de decisão
- [[04 - AGENTES/Advisory Board/naval-ravikant]] — Leverage e wealth creation
- [[04 - AGENTES/Advisory Board/charlie-munger]] — Mental models

### Hormozi
- [[04 - AGENTES/Hormozi Squad/hormozi-offers]] — Grand Slam Offers
- [[04 - AGENTES/Hormozi Squad/hormozi-hooks]] — Hooks e atenção
- [[04 - AGENTES/Hormozi Squad/hormozi-leads]] — Lead generation
""")

# ─────────────────────────────────────────────────────────────────────────────
# 05 — FRAMEWORKS
# ─────────────────────────────────────────────────────────────────────────────
def build_frameworks():
    print("\n[05] Frameworks...")

    w(VAULT / "05 - FRAMEWORKS/Oráculo V2.md", f"""---
tags: [framework, oráculo, copy, carrossel]
created: {TODAY}
---

# Oráculo do Conteúdo V2

## O que é

Framework de produção de carrosséis virais para @afonteoculta. Combina neurociência da persuasão, curva dramática e estratégia de bolha.

## Formatos

| Formato | Nome | Estrutura |
|---------|------|-----------|
| A | Revelação | Tese → Tradução científica → Impacto |
| B | Contradição | Demolição de crença → Reconstrução → Nova identidade |
| C | Mapa | Estrutura por etapas → Revelação progressiva |
| D | Narrativa | História real → Virada → Verdade universal |

## Curva Dramática

```
⚡ CHOQUE    → Slide 1: Hook que quebra padrão
🔥 AGITAÇÃO  → Slides 2-4: Aprofunda a ferida/contradição
💡 INSIGHT   → Slides 5-7: Revela a verdade oculta
🔓 LIBERTAÇÃO → Slides 8-9: Nova identidade, expansão
🚪 PORTAL    → Slide 10: CTA — entrega para o produto
```

## 9 Mecanismos de Hook

1. **Dissonância Cognitiva** — afirmação que contradiz crença forte
2. **Reconhecimento Cirúrgico** — "você está aqui e sente isso"
3. **Violação de Autoridade** — o especialista estava errado
4. **Conhecimento Suprimido** — "isso foi escondido de você"
5. **Custo Silencioso** — o preço invisível que você paga
6. **Inversão de Identidade** — você não é o que pensa ser
7. **Escala Inesperada** — o tamanho real do problema/oportunidade
8. **Contradição Interna** — a crença que se destrói sozinha
9. **Portal Abrupto** — entra direto no meio da ação

## Estratégia de Bolha

- **Bolha A**: mainstream, já sabe que tem o problema
- **Bolha B**: nicho, sabe mais, quer ir além
- Conteúdo viral atravessa bolhas — começa em A, termina em B

## Regras

- Slide 10 sempre: `COMENTE FONTE` + produto (ver [[06 - SKILLS/CTA Framework]])
- Slide 9: prepara emocionalmente para o CTA
- Nunca resolver o problema no carrossel — o produto resolve

## Links Relacionados

- [[06 - SKILLS/CTA Framework]]
- [[03 - NANO BANANA/Sistema Carrossel]]
- [[01 - SISTEMA/Produto Principal]]
""")

    w(VAULT / "05 - FRAMEWORKS/Método Jordânico.md", f"""---
tags: [framework, copy, método, persuasão]
created: {TODAY}
---

# Método Jordânico — Arqueologia do Prospect

## Conceito

Antes de escrever uma linha de copy, faça a arqueologia do prospect:
- Onde ele está agora (dor atual)?
- Onde quer estar (desejo)?
- O que já tentou (frustrações)?
- O que acredita que é o problema (crença falsa)?
- O que realmente é o problema (verdade oculta)?

## Big Idea

Toda peça de copy precisa de uma **Big Idea** — uma ideia única que:
- É contraintuitiva
- É verificável
- Muda a visão de mundo
- Conecta ao desejo profundo

## Slippery Slide

O texto deve puxar o leitor para baixo como um escorregador:
- Cada linha justifica a próxima
- Nenhum ponto de parada confortável
- O leitor não consegue parar de ler

## Aplicação nos Carrosséis

- Slide 1 = Big Idea (gancho)
- Slides 2-4 = Arqueologia da dor
- Slides 5-7 = Revelação + prova
- Slides 8-9 = Nova identidade
- Slide 10 = Exit via produto

Ver [[05 - FRAMEWORKS/Oráculo V2]]
""")

# ─────────────────────────────────────────────────────────────────────────────
# 06 — SKILLS
# ─────────────────────────────────────────────────────────────────────────────
def build_skills():
    print("\n[06] Skills...")

    w(VAULT / "06 - SKILLS/Índice das Skills.md", f"""---
tags: [skills, sistema, claude-code]
created: {TODAY}
---

# Índice das Skills

Skills instaladas no plugin `nano-banana` em Claude Code.

## Skills Ativas

| Skill | Quando Ativa | Arquivo |
|-------|-------------|---------|
| [[06 - SKILLS/CTA Framework]] | Slide 10, CTAs, copy, desbloqueio neural | `cta-framework/SKILL.md` |
| [[06 - SKILLS/Carousel Publish]] | Gerar carrossel, criar slides, novo carrossel | `carousel-publish/SKILL.md` |

## Localização

```
C:/Users/julia/.claude/plugins/nano-banana/
├── .claude-plugin/plugin.json
└── skills/
    ├── cta-framework/
    │   ├── SKILL.md
    │   └── references/cta-variations.md
    └── carousel-publish/
        └── SKILL.md
```
""")

    # CTA Framework skill
    skill_cta = PLUGINS / "skills/cta-framework/SKILL.md"
    cta_content = read_md(skill_cta) if skill_cta.exists() else ""
    w(VAULT / "06 - SKILLS/CTA Framework.md", f"""---
tags: [skill, cta, comente-fonte, desbloqueio-neural]
created: {TODAY}
---

# Skill: CTA Framework

> Regra central: slide 10 de todo carrossel sempre aponta para o produto real.

## Regra de Ouro

**Nunca** prometer entregar conteúdo do carrossel.
**Sempre** apontar para: Tecnologia Sonora do Desbloqueio Neural (desbloqueio24h.online)

## Estrutura Fixa Slide 10

```
TÍTULO : COMENTE\nFONTE
CORPO  : [variação por pilar]
LAYOUT : fullbleed
```

## Variações

### DEUS / Expansão
```
E eu te envio a Tecnologia Sonora capaz de expandir sua consciência
e reconectar você com o campo usando o Desbloqueio Neural
```

### DINHEIRO / Frequência
```
E eu te envio a Tecnologia Sonora capaz de reprogramar sua frequência
e destravar abundância usando o Desbloqueio Neural
```

### RELACIONAMENTOS
```
E eu te envio a Tecnologia Sonora capaz de limpar os padrões
que te impedem de amar e ser amado usando o Desbloqueio Neural
```

### GENÉRICO
```
E eu te envio a Tecnologia Sonora capaz de elevar sua vibração
usando o Desbloqueio Neural
```

## Anti-padrões

| ❌ Errado | ✅ Certo |
|-----------|----------|
| "te mando o material sobre X" | Tecnologia Sonora |
| "te envio o guia completo" | Tecnologia Sonora |
| "Comente para saber mais" | + produto específico |

---
Ver também: [[01 - SISTEMA/Produto Principal]] · [[05 - FRAMEWORKS/Oráculo V2]]
""")

    # Carousel Publish skill
    skill_cp = PLUGINS / "skills/carousel-publish/SKILL.md"
    w(VAULT / "06 - SKILLS/Carousel Publish.md", f"""---
tags: [skill, carrossel, dashboard, nano-banana]
created: {TODAY}
---

# Skill: Carousel Publish

Ativa automaticamente após qualquer geração de carrossel.

## Workflow Automático

1. **Gera** slides com Gemini API
2. **Registra** no `carousels.json` via `register_carousel.py`
3. **Verifica** se dashboard está na porta 3131
4. **Abre** `http://localhost:3131`
5. **Confirma** ID, slides e status

## Comandos

```bash
# Gerar carrossel
python -X utf8 carrossel-NOME.py

# Abrir dashboard
python -X utf8 open-dashboard.py

# Publicar no Instagram
python -X utf8 publish_instagram.py --id carrossel-XX
```

## Dashboard

- URL: http://localhost:3131
- Editar texto inline: clique no slide → ✎ Editar → clique na zona
- Baixar: botão ↓ na thumbnail
- Publicar: botão 📱 Instagram

---
Ver também: [[03 - NANO BANANA/Sistema Carrossel]]
""")

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  BUILD VAULT — Oráculo do Conteúdo")
    print("=" * 60)
    print(f"  Vault: {VAULT}")

    build_index()
    build_sistema()
    build_squads()
    build_agentes_index()
    build_frameworks()
    build_skills()

    print("\n" + "=" * 60)
    print("  CONCLUÍDO — Abra o Obsidian para ver o vault populado")
    print("=" * 60)
