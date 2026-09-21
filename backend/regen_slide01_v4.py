#!/usr/bin/env python3
"""
regen_slide01_v4.py
Gera 3 variações cinematográficas do slide 01 usando o DNA Visual v2.
Seleciona automaticamente a mais escura (maior proporção de pixels escuros).
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

import numpy as np

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from io import BytesIO
from pathlib import Path

from PIL import Image

from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt_cinematic

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

# ── 3 VARIAÇÕES CINEMATOGRÁFICAS ──────────────────────────────────────────────
# Mesma identidade visual, variando: posição do sujeito, ângulo da luz, campo

VARIATIONS = [
    {
        "id": "A",
        "archetype": "campo_frequencia",
        "subject_position": "lower-left, 20% from left edge",
        "darkness_ratio": 88,
        "light_angle": 72,
        "light_width": "narrow",
        "field_description": (
            "three ultra-thin concentric toroidal rings, amber-gold (RGB 255, 168, 72), "
            "expanding horizontally from the figure's chest, "
            "fading from 40% to 0% opacity at the horizontal edges of frame"
        ),
        "concept": (
            "The heart's electromagnetic field radiates before any decision. "
            "Money follows frequency, not effort."
        ),
    },
    {
        "id": "B",
        "archetype": "silhueta_vazio",
        "subject_position": "lower-center, slightly right of center",
        "darkness_ratio": 90,
        "light_angle": 65,
        "light_width": "very narrow single shaft",
        "field_description": (
            "an almost invisible toroidal aura, single ring, "
            "amber translucent (15% opacity), radius 180px around the figure"
        ),
        "concept": (
            "Alone in the dark, the body transmits a signal no one can see "
            "but everyone feels."
        ),
    },
    {
        "id": "C",
        "archetype": "escuridao_personagem",
        "subject_position": "lower-left quadrant, at 25% from left and 82% from top",
        "darkness_ratio": 92,
        "light_angle": 78,
        "light_width": "hairline thin, blade of light",
        "field_description": (
            "barely perceptible frequency rings, gold, 8% opacity, "
            "two concentric ovals expanding outward, almost invisible"
        ),
        "concept": (
            "The darkness is the subject. The light is the exception. "
            "Frequency calibrated before words existed."
        ),
    },
]


def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 15 * attempt
            print(f"    aguardando {wait}s...")
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
            print(f"    Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"    HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"    Erro: {e}")
    return None


def darkness_score(img_bytes: bytes) -> float:
    """Calcula proporção de pixels escuros (luminância < 30). Quanto maior, melhor."""
    img = Image.open(BytesIO(img_bytes)).convert("L")
    arr = np.array(img)
    dark_pixels = np.sum(arr < 30)
    return dark_pixels / arr.size


# ── EXECUÇÃO ──────────────────────────────────────────────────────────────────
print("\n" + "="*62)
print("  REGEN SLIDE 01 — DNA Visual v2 — 3 Variações")
print("  Nano Banana 2 | Gramática Cinematográfica")
print("="*62 + "\n")

results = []

for v in VARIATIONS:
    print(f"[Variação {v['id']}] Gerando...")
    prompt = build_prompt_cinematic(
        archetype        = v["archetype"],
        subject_position = v["subject_position"],
        darkness_ratio   = v["darkness_ratio"],
        light_angle      = v["light_angle"],
        light_width      = v["light_width"],
        field_description= v["field_description"],
        concept          = v["concept"],
    )

    print(f"  Prompt ({len(prompt)} chars):")
    print(f"  {prompt[:120]}...")

    img = gen(prompt)
    if not img:
        print(f"  FALHOU — pulando variação {v['id']}\n")
        continue

    score = darkness_score(img)
    print(f"  Score de escuridão: {score:.1%}")

    # Salvar raw
    raw_path = OUT_DIR / f"slide-01-raw-v4{v['id']}.jpg"
    with open(str(raw_path), "wb") as f:
        f.write(img)

    # Compor com tipografia
    final = compose(img, TITLE, BODY, layout="dramatico", preset_name="dramatico")
    out_path = OUT_DIR / f"slide-01-v4{v['id']}.jpg"
    final.save(str(out_path), "JPEG", quality=96)

    results.append({"id": v["id"], "score": score, "path": out_path, "img": img})
    print(f"  Salvo → {out_path.name}\n")

    if v != VARIATIONS[-1]:
        time.sleep(5)

if not results:
    print("Nenhuma variação gerada.")
    sys.exit(1)

# Selecionar a melhor (maior darkness score)
best = max(results, key=lambda x: x["score"])
final_best = compose(best["img"], TITLE, BODY, layout="dramatico", preset_name="dramatico")
final_path = OUT_DIR / "slide-01-v4-FINAL.jpg"
final_best.save(str(final_path), "JPEG", quality=96)

print("="*62)
print(f"  CONCLUÍDO — {len(results)}/3 variações geradas")
print(f"  Melhor variação: {best['id']} (escuridão: {best['score']:.1%})")
print(f"  Final → {final_path.name}")
print("="*62 + "\n")
print("Variações disponíveis para comparação:")
for r in sorted(results, key=lambda x: x["score"], reverse=True):
    print(f"  {r['id']}: {r['score']:.1%} escuridão → slide-01-v4{r['id']}.jpg")
