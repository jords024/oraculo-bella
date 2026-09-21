#!/usr/bin/env python3
"""
carrossel-template.py — Template base para novos carrosseis.

COMO USAR:
1. Copie este arquivo: cp carrossel-template.py carrossel-TEMA.py
2. Preencha as variaveis de CONFIGURACAO abaixo
3. Preencha o array `slides` com title, body, layout e prompt de cada slide
4. Execute: python -X utf8 carrossel-TEMA.py
5. O carrossel sera registrado automaticamente no Dashboard ao terminar.
"""

import os

from dotenv import load_dotenv

load_dotenv()
import base64
import json
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

# ── CONFIGURACAO — preencha antes de rodar ─────────────────────────────────
API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-TEMA")   # <-- pasta de saida
TEMA          = "Nome do Tema"                                   # <-- nome legivel
TEMA_SLUG     = "slug-do-tema"                                   # <-- id sem espacos
FORMATO       = "B"                                              # <-- A, B, C ou D
CAPTION       = "Caption completa do post para o Instagram."     # <-- caption
REVISOR_SCORE = "15/15"                                          # <-- score do oraculo
NOTAS         = "Formato B. Mecanismo: Xxxxx."                   # <-- notas tecnicas

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
# layout: "fullbleed" = imagem de fundo | "card" = imagem em moldura
# prompt: escreva apenas a descrição específica — sem "No text", "Portrait 4:5", etc.
#         o prompt_builder adiciona prefixo e sufixo de estilo automaticamente.
slides = [
  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA — cria paradoxo ou confronto insolúvel
  {
    "num": "01",
    "estado": "DISRUPÇÃO",        # estado emocional da partitura
    "layout": "fullbleed",
    "title": "TÍTULO DO SLIDE 01\nEM CAIXA ALTA\nCOM QUEBRAS DE LINHA",
    "body": "1-2 frases. Espaço é tensão. Não resolve nada aqui.",
    "prompt": (
        "A human figure standing at the edge of a vast dark abyss, "
        "a single ray of golden light cuts through from above. "
        "Deep black, gold light."
    ),
  },
  # ── S2 — DESCIDA ── tensão BAIXA — validação, o avatar não estava errado
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "TÍTULO DO SLIDE 02\nEM CAIXA ALTA",
    "body": "Validação específica. Não é conforto genérico. É: você percebeu algo real.",
    "prompt": (
        "Close-up of a human hand reaching toward a glowing golden orb. "
        "Electromagnetic field radiating outward. "
        "Deep black background, amber and gold tones."
    ),
  },
  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA — raiva direcionada + evidência específica
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "TÍTULO DO SLIDE 03",
    "body": "Nomeia o responsável com dado verificável: nome, instituição, ano ou número.",
    "prompt": (
        "Visual concept: naming the invisible system. "
        "An institutional structure dissolving into dark particles. "
        "Deep black, cold amber light from above."
    ),
  },
  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL — mecanismo verificável, desce um nível
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "card",
    "title": "TÍTULO DO SLIDE 04",
    "body": "O mecanismo real. Ciência nomeada. Não descreve — expõe o como e o por quê.",
    "prompt": (
        "Scientific visualization: mechanism exposed. "
        "Neural pathways or quantum field structure, dark background."
    ),
  },
  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda — cumplicidade interna do avatar
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "TÍTULO DO SLIDE 05",
    "body": "A frase mais difícil de escrever e de ler. O avatar faz algo para manter o padrão ativo sem perceber.",
    "prompt": (
        "Visual concept: internal complicity. "
        "A figure facing away, surrounded by invisible chains made of light. "
        "Total darkness, single cold light."
    ),
  },
  # ── S6 — ESPELHO ── tensão RECONHECIMENTO — o avatar se vê, sem saída ainda
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "TÍTULO DO SLIDE 06",
    "body": "Segunda pessoa. 'Você já...' ou 'Existe uma parte de você que...' — reconhecimento doloroso.",
    "prompt": (
        "A lone silhouette reflected in still dark water. "
        "Two identical figures — one above, one below. "
        "Total darkness, amber reflection only."
    ),
  },
  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA — saída existe, tem nome e mecanismo
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "card",
    "title": "TÍTULO DO SLIDE 07",
    "body": "A saída não é genérica. Tem nome. Tem mecanismo. Não é 'você pode mudar' — é como especificamente.",
    "prompt": (
        "A figure ascending from darkness toward a narrow shaft of warm golden light. "
        "80% of frame pure black. The light is a door, not a flood."
    ),
  },
  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA ──────────────────────────────
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "TÍTULO DO SLIDE 08\nSÍNTESE PURA",
    "body": "Síntese em 1-2 frases. O que o corpo/campo/sistema aprendeu. Sem CTA. Sem produto.",
    "prompt": (
        "A human figure — upper body, face tilted upward — "
        "in the posture of earned stillness. Not ecstasy. "
        "The quiet dignity of a decision carried through. "
        "Single accent color: warm gold descending from above. "
        "Dense engraving texture. Lower 30% fades to shadow."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto ─────────────────────────────
  # Ver agents/cta-desbloqueio-neural.md para template por pilar
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "EXISTE UMA\nFREQUÊNCIA\nPARA ISSO.",
    "body": (
        "Existe uma frequência sonora capaz de [resultado específico do pilar].\n\n"
        "Quem pratica relata que [transformação que parecia impossível] se dissolve em horas.\n\n"
        "Não é meditação. Não é afirmação. É protocolo."
    ),
    "prompt": (
        "A human figure seen from behind, standing at the threshold of "
        "a narrow beam of warm golden light descending from above into absolute darkness. "
        "The posture is open — shoulders released, arms slightly away from body. "
        "Single accent color: vivid gold — the beam only. "
        "Everything else: absolute monochromatic black, dense cross-hatching engraving. "
        "Lower 30% fades to shadow. The image says: the door exists. You are standing at it."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ─────────────────────────────────────────────────
  # NUNCA alterar título nem estrutura do corpo. Ver agents/cta-desbloqueio-neural.md
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de [resultado específico do pilar] "
        "usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A radiant column of pure golden light descending from top to bottom of frame "
        "in absolute darkness. The light has weight and temperature. "
        "At the threshold: barely-visible outline of a human figure dissolved into the gold. "
        "Single accent color: vivid gold — the entire central pillar. "
        "Everything surrounding: absolute monochromatic black, dense cross-hatching engraving. "
        "Faint sacred geometry lines in very faint gold in the surrounding darkness. "
        "Lower 30% fades to shadow. Clean, minimal, powerful. Just the threshold."
    ),
  },
]


# ── Engine ────────────────────────────────────────────────────────────────────
def gen(prompt: str, retries: int = 4):
    """Chama o Gemini com o prompt final (já processado pelo prompt_builder)."""
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            time.sleep(12 * attempt)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = json.loads(r.read())
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            ip = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if ip:
                return base64.b64decode(ip["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:150]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:120]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── Execução ──────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Carrossel — {TEMA}")
print(f"  Formato: {FORMATO} | Slides: {len(slides)} | Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print(f"{'='*60}\n")

ok = 0
for i, s in enumerate(slides):
    print(f"[{s['num']}/{len(slides):02d}] {s['layout'].upper()} — {s['title'].splitlines()[0][:50]}...")

    # Visual Style Guide aplicado automaticamente
    prompt_final = build_prompt(s["prompt"])

    img = gen(prompt_final)
    if not img:
        print("  FALHOU\n")
        continue

    final = compose(img, s["title"], s["body"], s["layout"])

    slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
    out  = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1

    if i < len(slides) - 1:
        time.sleep(4)

print(f"{'='*60}")
print(f"  CONCLUIDO: {ok}/{len(slides)} slides")
print(f"{'='*60}\n")

# ── Registro automatico no Dashboard (sempre) ─────────────────────────────
register(
    title         = TEMA,
    theme         = TEMA_SLUG,
    format        = FORMATO,
    slides_dir    = str(OUT_DIR),
    caption       = CAPTION,
    revisor_score = REVISOR_SCORE,
    notes         = NOTAS,
)
