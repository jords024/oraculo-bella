#!/usr/bin/env python3
"""
gerar_capa.py
Gera a capa do carrossel "Frequência do Corpo" com abordagem
de ilustração narrativa conceitual — conceito literalmente visível na imagem.
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

from core.util.compose_util import compose

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-3.1-flash-image-preview"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR = Path("C:/Users/julia/Desktop/carrossel-frequencia-corpo")
OUT_DIR.mkdir(parents=True, exist_ok=True)

TITLE = "O dinheiro não obedece ao trabalho.\nEle obedece à frequência\ndo corpo que o carrega."
BODY  = (
    "Essa frequência foi gravada no seu sistema nervoso\n"
    "antes de você ter palavras para descrevê-la.\n"
    "Ela opera agora. Antes de qualquer decisão sua."
)

# ── CONCEITO ──────────────────────────────────────────────────────────────────
# Argumento: frequência precede e determina resultado. Esforço não.
# Metáfora visual: figura central em repouso com campo expandindo e atraindo.
# Ao redor: figuras que se esforçam, cuja energia se dispersa sem retorno.
# O contraste dos dois estados É o argumento — legível sem texto.

PROMPT = (
    "Rich conceptual digital art, cinematic painterly illustration. "
    "Deep black and cosmic space background, galaxies and stars faint in the distance. "

    # Figura central — o argumento principal
    "At the center of the composition: a human figure standing upright, eyes closed, arms open slightly at sides. "
    "The figure is at complete rest — no strain, no effort, no reaching. "
    "From the figure's chest and solar plexus: concentric electromagnetic frequency rings expanding outward "
    "in all directions — amber-gold, luminous, precise, like ripples in water but electromagnetic. "
    "These frequency rings visibly curve and redirect streams of fine golden light particles "
    "flowing through the surrounding space — drawing them toward the figure effortlessly. "
    "A column of golden cosmic light descends from above onto the figure's crown — "
    "as if the universe recognizes and responds to the frequency being transmitted. "
    "Subtle sacred geometry (Flower of Life) faintly visible overlaid on the figure's chest — "
    "the body as cosmic architecture. "

    # Figuras laterais — o contraste
    "In the lower left: a dark human silhouette bent forward, arms extended, straining. "
    "From this figure: dark crimson-amber particles dissipate outward and upward — energy leaving, not returning. "
    "In the lower right: another dark silhouette, also straining, head down, shoulders tense. "
    "Same energy dissipation — effort going nowhere. "
    "These figures are darker, smaller, less defined than the central figure. "
    "They are the contrast, not the subject. "

    # Atmosfera e acabamento
    "Color language: central figure — warm amber gold, luminous. "
    "Effort figures — deep crimson, dim. "
    "Incoming energy streams — bright gold. Cosmic background — deep black, rich. "
    "The upper 60% of the image is rich cosmic space with the central figure emerging into it. "
    "The lower 35% transitions to darker space where the contrast figures reside — "
    "leaving room for text overlay at the bottom. "
    "Multiple conceptual layers visible simultaneously. "
    "Cinematic depth of field, dramatic lighting. "
    "Photorealistic painterly style, high detail, rich texture. "
    "Vertical portrait, 4:5 ratio, 1080x1350px. "
    "No text, no readable symbols, no watermarks, no logos."
)


def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 15 * attempt
            print(f"  aguardando {wait}s...")
            time.sleep(wait)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body_resp = json.loads(r.read())
            parts = body_resp.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            ip = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if ip:
                return base64.b64decode(ip["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body_resp)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


print("\n" + "="*62)
print("  CAPA — Frequência do Corpo")
print("  Ilustração Narrativa Conceitual | Nano Banana 2")
print("="*62 + "\n")

# Gera 2 variações da capa para escolher
for v in ["A", "B"]:
    print(f"[Variação {v}] Gerando...")
    img = gen(PROMPT)

    if not img:
        print("  FALHOU\n")
        continue

    # Raw
    raw = OUT_DIR / f"capa-raw-{v}.jpg"
    with open(str(raw), "wb") as f:
        f.write(img)

    # Composta
    final = compose(img, TITLE, BODY, layout="dramatico", preset_name="dramatico")
    out = OUT_DIR / f"capa-{v}.jpg"
    final.save(str(out), "JPEG", quality=96)
    print(f"  OK → {out.name}\n")

    if v == "A":
        time.sleep(5)

print("="*62)
print("  Capas geradas em:")
print(f"  {OUT_DIR}/capa-A.jpg")
print(f"  {OUT_DIR}/capa-B.jpg")
print("="*62 + "\n")
