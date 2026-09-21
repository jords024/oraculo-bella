#!/usr/bin/env python3
"""
regen_slide01.py
Regenera o slide 01 de carrossel-frequencia-corpo com prompt cinematográfico otimizado.
Design Squad optimized prompt — Fonte Oculta visual identity.
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

# ── PROMPT CINEMATOGRÁFICO OTIMIZADO — Design Squad ───────────────────────────
# Diretrizes: 85-90% escuridão absoluta, silhueta no terço inferior,
# campo toroidal dourado, coluna de luz única descendo de cima,
# grain pesado, anamorphic feel, sem texto, sem rosto, sem símbolos
PROMPT = (
    "Extreme wide shot, anamorphic lens, ultra cinematic. "
    "A lone human silhouette — tiny, standing — positioned in the lower third of frame, "
    "slightly off-center to the left. "
    "The figure is pure shadow, no face, no detail, no text. "
    "From the chest area, a toroidal electromagnetic field radiates outward — "
    "concentric rings of amber and deep gold frequency expanding horizontally "
    "across the full width of the frame, dissolving into darkness at the edges. "
    "A single narrow column of warm white-gold light descends from the top of frame "
    "down onto the silhouette, like a shaft of divine illumination. "
    "Everything else: absolute deep black — 85 to 90 percent of the frame is pure darkness. "
    "The electromagnetic rings glow faintly, almost bioluminescent, amber to gold gradient. "
    "Heavy 35mm film grain overlay. Anamorphic lens flare on the light column, subtle. "
    "Cinematic color grade: deep black crush, warm amber midtones, no cool tones. "
    "Shot on IMAX film, Christopher Nolan visual language. "
    "Interstellar + Inception visual aesthetic. Hans Zimmer score visualized. "
    "Vertical portrait orientation, 4:5 ratio, 1080x1350px. "
    "No text, no symbols, no equations, no logos, no recognizable faces. "
    "Photorealistic. Breathtaking scale. The darkness is the subject."
)

TITLE = "O dinheiro não obedece ao trabalho.\nEle obedece à frequência\ndo corpo que o carrega."
BODY  = (
    "Essa frequência foi gravada no seu sistema nervoso\n"
    "antes de você ter palavras para descrevê-la.\n"
    "Ela opera agora. Antes de qualquer decisão sua."
)

def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 12 * attempt
            print(f"  aguardando {wait}s antes de retry...")
            time.sleep(wait)
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
            print(f"  Sem imagem: {json.dumps(body)[:300]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:200]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


print("\n" + "="*62)
print("  REGEN SLIDE 01 — Frequência do Corpo")
print("  Design Squad Optimized | Nano Banana 2")
print("="*62 + "\n")

print("Gerando imagem de fundo cinematográfica...")
img = gen(PROMPT)

if not img:
    print("FALHOU — sem imagem retornada")
    sys.exit(1)

# Salvar raw primeiro para inspeção
raw_out = OUT_DIR / "slide-01-raw-v3.jpg"
with open(str(raw_out), "wb") as f:
    f.write(img)
print(f"  Raw salvo → {raw_out.name}")

# Compor com tipografia
print("Compondo tipografia dramatico...")
final = compose(img, TITLE, BODY, layout="dramatico", preset_name="dramatico")

out = OUT_DIR / "slide-01-v3.jpg"
final.save(str(out), "JPEG", quality=96)
print(f"\n  CONCLUÍDO → {out}")
print("="*62 + "\n")
