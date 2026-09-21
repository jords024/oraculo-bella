#!/usr/bin/env python3
"""Regenera apenas o slide-07 do carrossel-pastor-frequencia com prompt revisado."""

import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from dotenv import load_dotenv

load_dotenv()

from pathlib import Path

from core.util.compose_util import compose
from core.util.gen_image_openai import gen_openai as gen

OUT_DIR = Path("C:/Users/julia/Desktop/carrossel-pastor-frequencia")
PRESET  = "cinematografico_crimson"

TITLE = "PROSPERIDADE\nNÃO VEM DE PEDIR.\nVEM DE RECALIBRAR\nO SINAL."
BODY  = (
    "O coração humano gera um campo eletromagnético\n"
    "mensurável a 1,5 metro do corpo.\n"
    "Documentado pelo HeartMath Institute desde 1991.\n\n"
    "Esse campo chega ao ambiente antes de você falar,\n"
    "antes de você agir, antes de qualquer afirmação.\n\n"
    "Recalibrar merecimento não é convencer sua mente.\n"
    "É mudar o que seu campo irradia\n"
    "antes do consciente entrar em cena."
)

# Prompt revisado — sem figura humana, puramente abstrato
PROMPT = (
    "Painterly digital oil painting, cosmic sacred geometry visualization. "
    "Abstract frequency and resonance made visible — "
    "beautiful, luminous, numinous and scientifically evocative."

    "The entire frame filled with concentric rings and spiraling wave patterns "
    "radiating outward from a brilliant central point of intense amber-white light. "
    "The rings are not mechanical or digital — they are painted with organic warmth, "
    "like ripples on water rendered in luminous gold. "
    "Each successive ring transitions from bright gold at center "
    "to warm amber, then to deep teal-cyan at the outer edges. "

    "Between the rings: deep cosmic indigo-black space with scattered luminous particles "
    "being drawn inward toward the center, like iron filings pulled to a source. "
    "The overall composition suggests: frequency, resonance, calibration, field, signal — "
    "without any human figure or body."

    "At the center point: brilliant white-gold radiance, so intense it blooms outward. "
    "Secondary spiral arms of teal-cyan energy cross the primary amber rings "
    "at gentle angles, creating harmonic interference patterns of extraordinary beauty."

    "Color palette: deep cosmic indigo-black background, "
    "primary amber-gold rings, teal-cyan secondary harmonics, "
    "white-gold at convergence center, subtle crimson accents at far edges. "
    "Upper 45% compositionally open for text overlay. "
    "Rich painterly texture throughout — visible brushwork in the light itself. "
    "No text, no words, no letters, no human figures anywhere."
)

SUFFIX = (
    " TECHNICAL REQUIREMENTS: "
    "Portrait orientation strongly preferred. "
    "Absolutely NO text, letters, words or typography anywhere. "
    "No human figures, no body parts. "
    "Pure abstract cosmic visualization only."
)

print("\n  Regenerando S07 com prompt revisado...")
img = gen(PROMPT + SUFFIX)

if img:
    final = compose(img, TITLE, BODY, "dramatico", preset_name=PRESET)
    out = OUT_DIR / "slide-07.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  ✅ slide-07.jpg gerado ({len(img)//1024} KB)")
    print(f"  📁 {out.resolve()}")
else:
    print("  ❌ Falhou novamente.")
