#!/usr/bin/env python3
"""
Teste — S1 do Carrossel #01: Afirmação Positiva É Golpe
Gera apenas o primeiro slide para aprovação visual.

Pipeline correto:
  SlideData → _generate_slide → compose_util_v3 + gen_image_openai (gpt-image-2)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from dotenv import load_dotenv

load_dotenv()

from pathlib import Path

from core.agentes.diretor_artistico import SlideData, _generate_slide

OUT = Path("C:/Users/julia/nano-banana-mcp/carousels/afirmacao-positiva")
OUT.mkdir(parents=True, exist_ok=True)

# ── SLIDE 01 — DISRUPÇÃO ──────────────────────────────────────────────────────
slide = SlideData(
    num    = 1,
    estado = "DISRUPÇÃO",
    title  = "AFIRMAÇÃO POSITIVA\nÉ O MAIOR GOLPE\nDO DESENVOLVIMENTO PESSOAL.",
    body   = "Seu corpo não acredita na sua boca.\nNunca acreditou.",
    prompt = (
        "A lone human silhouette standing before a tall glowing mirror in darkness. "
        "From the figure's lips: radiant golden words rising upward, luminous and alive. "
        "But in the mirror — the words never arrive. "
        "They dissolve mid-air into deep indigo smoke before touching the glass. "
        "The mirror reflects only silence, no trace of the golden words. "
        "The disconnect made visible: what is spoken and what the body receives are two different things. "
        "Deep indigo and electric gold as dominant colors. "
        "Dark atmospheric background with painterly oil texture, rich and alive. "
        "The scene feels like witnessing a private truth — the lie rendered visible."
    ),
    cover  = True,
)

print("\n  Gerando S1 — Afirmação Positiva...")
success = _generate_slide(slide, preset_name="revelacao", out_dir=OUT)

if success:
    print(f"\n  ✓ Salvo em: {OUT / 'slide-01.jpg'}")
else:
    print("\n  FALHOU — verifique os logs acima")
