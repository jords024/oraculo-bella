# SESSÃO ATUAL — Fonte Oculta / Xsquads
**Data:** 2026-04-29
**Arquivo:** lido quando o usuário perguntar "Lembra de onde paramos?"
**Como usar:** leia este arquivo inteiro antes de responder qualquer coisa.

---

## O QUE É ESSE PROJETO

Instagram @afonteoculta. Carrosséis de conteúdo com imagens geradas por IA (OpenAI gpt-image-2) + composição em Python. O pipeline completo vive em `C:/Users/julia/nano-banana-mcp`. Cada carrossel é um script `.py` que gera 10 slides JPG, salva no Desktop e registra no dashboard (Node.js em localhost:3131).

Metodologia de copy: **Método Jordânico** — 10 slides com curva dramática S1→S10 (Disrupção → CTA Fixo). Copy gerada com a skill `metodo-jordanico`. Design gerado com `prompt_builder.py` v4 + `compose_util.py`.

---

## O QUE FOI FEITO HOJE (2026-04-29)

### 1. Contexto herdado da sessão anterior
Antes desta sessão já existiam:
- `carrossel-21` → *O Dia que Você Parou de Crescer* (10 slides, status: pronto)
- `carrossel-23` → *Ganhadores de Loteria* (10 slides, status: erro-publicacao)
- `prompt_builder.py` atualizado para v4 com ZONE RULE (top 60% arte viva, bottom 40% escuro para texto)
- `compose_util.py` com preset `esoterico_minimalista` ajustado (gradient_start 0.30, gradient_max 252)
- `register_carousel.py` corrigido para usar `max(IDs)+1` em vez de `len(lista)+1`

### 2. Carrosséis criados nesta sessão
Três novos carrosséis sobre Bíblia e dinheiro foram escritos (copy completa 15/15), scriptados e gerados:

#### carrossel-24 — Jesus Nunca Disse que Dinheiro é Pecado
- **Arquivo:** `C:/Users/julia/nano-banana-mcp/carrossel-jesus-dinheiro-pecado.py`
- **Pasta de saída:** `C:/Users/julia/Desktop/carrossel-jesus-dinheiro-pecado/`
- **Praça:** ALAVANCA | **Preset:** esoterico_minimalista | **Formato:** B
- **Status no dashboard:** publicado (foi registrado automaticamente)
- **Slides:** 10/10 gerados com sucesso
- **Big Idea:** Jesus nunca condenou dinheiro — condenou o AMOR ao dinheiro (1 Tm 6:10). A culpa financeira foi instalada pela Igreja, não pelo texto sagrado.
- **S1 título:** "VOCÊ ACREDITA / QUE DINHEIRO / É PECADO."
- **S10 CTA:** "...dissolver a culpa financeira gravada no seu sistema..."

#### carrossel-25 — A Bíblia Menciona Dinheiro 2.350 Vezes
- **Arquivo:** `C:/Users/julia/nano-banana-mcp/carrossel-biblia-2350-vezes.py`
- **Pasta de saída:** `C:/Users/julia/Desktop/carrossel-biblia-2350-vezes/`
- **Praça:** MENTE | **Preset:** esoterico_minimalista | **Formato:** B
- **Status no dashboard:** pronto (aguardando publicação)
- **Slides:** 10/10 gerados com sucesso
- **Big Idea:** A Bíblia é o livro mais lido do mundo e menciona dinheiro 2.350 vezes — mais que fé, oração ou salvação. Deuteronômio 28 chama pobreza de MALDIÇÃO, não virtude.
- **S1 título:** "A BÍBLIA FALA / DE DINHEIRO / 2.350 VEZES."
- **S10 CTA:** "...remover o bloqueio espiritual com dinheiro..."

#### carrossel-26 — A Mais Rica do Planeta te Ensinou Isso
- **Arquivo:** `C:/Users/julia/nano-banana-mcp/carrossel-igreja-mais-rica.py`
- **Pasta de saída:** `C:/Users/julia/Desktop/carrossel-igreja-mais-rica/`
- **Praça:** SISTEMA | **Preset:** cinematografico_crimson | **Formato:** B
- **Status no dashboard:** pronto (aguardando publicação)
- **Slides:** 10/10 gerados com sucesso
- **Big Idea:** O Vaticano possui €10-15 bilhões em ativos + 5.000 imóveis em Roma + banco próprio. E pregou pobreza como virtude. A doutrina de renúncia foi codificada no século IV por Agostinho — exatamente quando a Igreja era o maior proprietário de terras da Europa.
- **S1 título:** "A MAIS RICA / DO PLANETA / TE ENSINOU ISSO." ← **ESTE TÍTULO ESTÁ MARCADO PARA REESCRITA** (ver problemas abertos)
- **S10 CTA:** "...separar a sua fé genuína da doutrina de pobreza..."

---

## PROBLEMAS IDENTIFICADOS — AINDA NÃO CORRIGIDOS

Esses problemas foram diagnosticados e dissecados com o usuário. **Nenhuma correção foi aplicada ainda.** A próxima sessão começa aplicando essas correções.

---

### PROBLEMA 1 — Gradiente "esfumaçado", não preto puro

**O que o usuário viu:** o gradiente na base das imagens parece uma névoa colorida (roxa, vermelha, azulada) — não preto limpo. Na imagem de referência que ele apontou (carrossel antigo, slide de homem olhando para cima), o gradiente é preto puro e o design fica mais "limpo".

**Causa técnica no código:**
Arquivo: `C:/Users/julia/nano-banana-mcp/compose_util.py`
Função: `dark_gradient()` (linha ~392)

A fórmula atual usa `gradient_tint` de cada preset para injetar cor na base:
```python
r = min(tint[0] + int((1 - p) * 8), 32)
g = min(tint[1] + int((1 - p) * 8), 24)
b = min(tint[2] + int((1 - p) * 8), 38)
```

Os tints atuais de cada preset:
- `esoterico_minimalista` → `(8, 2, 18)` — roxa
- `cinematografico_crimson` → `(28, 4, 4)` — avermelhada
- `cinematografico` → `(2, 4, 22)` — azulada
- `manuscrito_sagrado` → `(30, 18, 2)` — âmbar
- `dramatico` → `(18, 6, 2)` — marrom quente
- `etereo_luminoso` → `(24, 10, 2)` — âmbar

**Correção acordada:**
Zerar todos os `gradient_tint` para `(0, 0, 0)` e subir `gradient_max` para `255` em todos os presets.
Resultado esperado: base absolutamente preta, gradiente limpo, texto muito mais legível.

---

### PROBLEMA 2 — Títulos menores do que deveriam ser

**O que o usuário viu:** nos prints novos, o título é menor do que no print de referência (carrossel antigo). O usuário apontou a seta para o slide do homem olhando pra cima onde o título ocupa muito mais espaço.

**Causa técnica no código:**
Arquivo: `compose_util.py`
Função: `compose_fullbleed()` — linha ~495:
```python
t_start = min(p["title_px"], 80)
```
Esse `min(..., 80)` está **capeando** os títulos em 80px mesmo quando o preset define valores maiores.

Presets afetados:
- `cinematografico_crimson` → define `title_px: 84` mas entrega 80
- `dramatico` → define `title_px: 84` mas entrega 80
- `esoterico_minimalista` → define `title_px: 72` (não afetado pelo cap, mas ainda limitado)

**Correção acordada:**
Remover o `min()` e deixar o preset controlar diretamente:
```python
# ANTES:
t_start = min(p["title_px"], 80)
# DEPOIS:
t_start = p["title_px"]
```

---

### PROBLEMA 3 — Texto colado na borda inferior

**O que o usuário viu:** o texto nos slides novos está muito perto da borda de baixo — sem respiro. Na referência, tem um padding maior.

**Causa técnica:**
`compose_fullbleed()` usa `BOTTOM_PAD = 80` (linha ~513).
`compose_dramatico()` usa `BOTTOM_PAD = 96` (linha ~570).

**Correção acordada:**
```python
# compose_fullbleed:
BOTTOM_PAD = 80  →  BOTTOM_PAD = 130
# compose_dramatico já tem 96 — verificar se também precisa subir para 120
```

---

### PROBLEMA 4 — Gancho fraco no carrossel-26

**O que o usuário disse:** *"A mais rica do planeta te ensinou isso não traduz nada — quem é a mais rica?"*

**Diagnóstico:**
O título atual não tem sujeito nomeado + não cria paradoxo de traição. "A mais rica" pode ser qualquer empresa. "Te ensinou isso" não diz o quê. Sem confronto, sem aversão, sem nome para direcionar a raiva.

Padrão que funciona nos carrosséis da conta:
- Sujeito específico (VATICANO, PASTOR, JESUS)
- Paradoxo ou contradição direta
- Consequência para o leitor nomeada

**Propostas de título discutidas (nenhuma escolhida ainda):**
1. "O VATICANO VALE €15 BILHÕES. E TE ENSINOU A SER POBRE."
2. "ELES ACUMULARAM. TE ENSINARAM QUE DINHEIRO É PECADO."
3. "A MAIS RICA DO PLANETA PREGOU POBREZA — PRA VOCÊ."
4. "O VATICANO TEM BANCO PRÓPRIO. VOCÊ TEM CULPA FINANCEIRA."

**O que precisa acontecer:** usuário escolhe o título (ou aprova uma proposta) → reescreve S1 do `carrossel-igreja-mais-rica.py` → regenera apenas o slide 01.

---

### PROBLEMA 5 — Traços (—) no corpo dos slides parecem copy de GPT

**O que o usuário disse:** traços em mid-sentence sinalizam template de IA para quem já viu muito conteúdo gerado.

**Solução:** revisão editorial das copies dos 3 carrosséis novos (24, 25, 26). Sem mudança de código — só reescrever as frases que usam — como muleta sintática para frases independentes e diretas.

**Slides que têm traços identificados nos scripts:**
- Vários corpos de slides usam construções tipo "É X — não Y" que devem virar "É X. Não Y."
- Revisar todos os `body` dos 3 scripts antes de regenerar.

---

## ESTADO ATUAL DO DASHBOARD

```
carrossel-02  publicado   — O que você chama de rezar...
carrossel-03  publicado   — Sua glândula pineal...
carrossel-04  pronto      — Einstein descreveu o campo unificado...
carrossel-05  pronto      — Você não está atraindo o que quer...
carrossel-06  pronto      — A Cabala foi escrita 3.000 anos antes...
carrossel-07  pronto      — Neville Goddard ensinava que...
carrossel-08  pronto      — Suas memórias não são arquivos...
carrossel-09  publicado   — O que a Igreja chama de Deus distante...
carrossel-10  pronto      — Jesus Ensinou Reencarnação...
carrossel-11  pronto      — A oração que Jesus ensinou...
carrossel-12  pronto      — Físicos provaram que a pobreza é uma frequência
carrossel-13  erro-pub    — A indústria do desenvolvimento pessoal...
carrossel-14  pronto      — Afirmação Positiva é o Maior Golpe...
carrossel-15  pronto      — A Indústria Musical Mudou a Frequência...
carrossel-16  publicado   — Seus Ancestrais te Deixaram Herança...
carrossel-17  pronto      — O Cogumelo e a Consciência Censurada
carrossel-19  pronto      — O Pastor, o Cirurgião e a Doutrina...
carrossel-20  pronto      — O Sal do Escravo
carrossel-21  pronto      — O Dia que Você Parou de Crescer      ← aguarda regeneração pós-fix
carrossel-22  publicado   — O Dinheiro que Foge
carrossel-23  erro-pub    — Ganhadores de Loteria                ← aguarda verificação
carrossel-24  publicado   — Jesus Nunca Disse que Dinheiro é Pecado  ← criado hoje
carrossel-25  pronto      — A Bíblia Menciona Dinheiro 2.350 Vezes   ← criado hoje
carrossel-26  pronto      — A Mais Rica do Planeta te Ensinou Isso   ← criado hoje, gancho a reescrever
```

IDs faltando: 01, 18 (deletados ou nunca criados — normal).

---

## ARQUIVOS IMPORTANTES E O QUE CADA UM FAZ

```
C:/Users/julia/nano-banana-mcp/
│
├── compose_util.py          ← Motor de composição. Layouts + presets + gradiente.
│                               PRECISA DE CORREÇÕES (ver problemas 1, 2, 3)
│
├── prompt_builder.py        ← Envolve o prompt visual com DNA Fonte Oculta (v4)
│                               ZONE RULE: arte top 60%, escuro bottom 40%
│
├── register_carousel.py     ← Registra carrossel no dashboard (carousels.json)
│                               USA max(IDs)+1 — nunca len(lista)+1
│
├── carrossel-jesus-dinheiro-pecado.py   ← carrossel-24 (10 slides)
├── carrossel-biblia-2350-vezes.py       ← carrossel-25 (10 slides)
├── carrossel-igreja-mais-rica.py        ← carrossel-26 (10 slides, gancho a reescrever)
├── carrossel-ganhadores-loteria.py      ← carrossel-23 (10 slides)
├── carrossel-dia-parou-crescer.py       ← carrossel-21 (10 slides)
│
├── dashboard/
│   ├── server.js            ← Node.js localhost:3131
│   └── data/carousels.json  ← fonte de verdade do dashboard
│
└── SESSAO_ATUAL.md          ← ESTE ARQUIVO
```

---

## PRÓXIMA SESSÃO — ORDEM DE EXECUÇÃO

Quando o usuário perguntar "Lembra de onde paramos?", a ordem lógica é:

### Passo 1 — Corrigir compose_util.py (3 mudanças)
1. `gradient_tint = (0, 0, 0)` em TODOS os 6 presets + `gradient_max = 255`
2. Remover `min(p["title_px"], 80)` → usar `p["title_px"]` diretamente
3. `BOTTOM_PAD = 80` → `BOTTOM_PAD = 130` no `compose_fullbleed`

### Passo 2 — Criar slide de teste
Rodar `teste-visual-s1.py` (ou criar um rápido) com o novo compose_util para validar que:
- Gradiente está preto puro na base
- Título está maior
- Padding inferior está respeitando

### Passo 3 — Reescrever S1 do carrossel-26
Usuário escolhe o título do carrossel-26 entre as propostas (ou aprova nova).
Atualizar `carrossel-igreja-mais-rica.py` com o novo título/copy do S1.

### Passo 4 — Revisão editorial dos 3 carrosséis
Remover todos os traços (—) usados como muleta sintática nos corpos dos slides 24, 25, 26.

### Passo 5 — Regenerar os 3 carrosséis
Rodar os 3 scripts em background:
```
python -X utf8 carrossel-jesus-dinheiro-pecado.py
python -X utf8 carrossel-biblia-2350-vezes.py
python -X utf8 carrossel-igreja-mais-rica.py
```
Os slides existentes serão sobrescritos com o design corrigido.

---

## DECISÕES DE DESIGN PERMANENTES (não mudam entre sessões)

- **Layout:** sempre `fullbleed` — `card` está depreciado
- **Texto:** sempre alinhado à ESQUERDA
- **Watermark:** único `@afonteoculta` no canto superior esquerdo
- **Modelo de imagem:** OpenAI `gpt-image-2` — size `1024x1536`, `output_format: jpeg`
- **Composição:** `compose_util.py` (NUNCA usar compose_util_v3.py)
- **Prompts:** em inglês, sempre passados por `build_prompt()` do `prompt_builder.py`
- **Figuras humanas:** obrigatórias nos slides de imagem
- **S10:** INTOCÁVEL — título sempre "COMENTE\nFONTE", corpo sempre "E eu te envio a Tecnologia Sonora capaz de..."

---

## COMANDOS ÚTEIS PARA LEMBRAR

```bash
# Rodar dashboard
cd C:/Users/julia/nano-banana-mcp/dashboard && node server.js

# Rodar carrossel
python -X utf8 carrossel-[slug].py

# Verificar IDs no dashboard
python -X utf8 -c "import json; data=json.load(open('dashboard/data/carousels.json',encoding='utf-8')); [print(c['id'],'|',c['status'],'|',c['title'][:50]) for c in data]"
```

---

*Atualizado ao final da sessão de 2026-04-29.*
