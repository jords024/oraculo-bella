#!/usr/bin/env python3
"""Regenera apenas S3 do carrossel-ganhadores-loteria com prompt refinado."""

import os

from dotenv import load_dotenv

load_dotenv()
import base64
import json
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MODEL      = "gpt-image-2"
ENDPOINT   = "https://api.openai.com/v1/images/generations"
OUT_DIR    = Path("C:/Users/julia/Desktop/carrossel-ganhadores-loteria")

slide = {
    "num": "03",
    "layout": "fullbleed",
    "title": "A UNIVERSIDADE\nMEDIU O QUE\nVOCÊ SENTE.",
    "body": (
        "Em 1978, pesquisadores de Massachusetts rastrearam "
        "ganhadores de loteria por dois anos.\n\n"
        "Em 12 meses, 70% voltaram ao mesmo patamar de antes.\n\n"
        "O dinheiro não mudou nada. Porque não mudou o lugar de dentro "
        "onde o dinheiro é permitido ficar."
    ),
    # PROMPT REVISADO: hierarquia visual clara
    # Zona superior: o espetáculo visual
    # Zona inferior (40%+): escuridão profunda para o texto respirar
    "prompt": (
        "A single luminous golden arc rising from the lower center of the frame "
        "to a radiant peak at the top, then curving back down to land precisely "
        "at the same starting point. "
        "The arc is the sole focal point — thick, glowing, alive with electric gold. "
        "Along the descending slope of the arc, two or three human figures visible, "
        "seated and counting coins — small against the vast arc, not competing with it. "
        "Upper background: deep cosmic black with a single distant star cluster on one side only — subtle, not dominant. "
        "The lower 45% of the frame fades into absolute deep black void — "
        "no grid lines, no galaxies, no visual elements — pure darkness where the text will live. "
        "Color palette: electric gold arc on absolute black. One accent only. "
        "The image reads as: a mathematical truth suspended in darkness."
    ),
}


def gen(prompt: str, retries: int = 4) -> bytes | None:
    payload = json.dumps({
        "model":         MODEL,
        "prompt":        prompt,
        "n":             1,
        "size":          "1024x1536",
        "output_format": "jpeg",
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 15 * attempt
            print(f"  Aguardando {wait}s...")
            time.sleep(wait)
        req = urllib.request.Request(
            ENDPOINT, data=payload,
            headers={"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                body = json.loads(r.read())
            b64 = body.get("data", [{}])[0].get("b64_json") or \
                  body.get("data", [{}])[0].get("url")
            if b64 and not b64.startswith("http"):
                return base64.b64decode(b64)
            if b64 and b64.startswith("http"):
                with urllib.request.urlopen(b64, timeout=60) as r2:
                    return r2.read()
            print(f"  Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:300]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


print(f"\n{'='*60}")
print("  Regenerando S03 — Ganhadores de Loteria (prompt refinado)")
print(f"{'='*60}\n")

img = gen(build_prompt(slide["prompt"]))
if not img:
    print("FALHOU")
else:
    final = compose(img, slide["title"], slide["body"], slide["layout"])
    out = OUT_DIR / "slide-03-a-universidade.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"OK: {out.name}")

print(f"{'='*60}\n")
