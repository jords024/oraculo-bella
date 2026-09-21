#!/usr/bin/env python3
"""Teste visual: regenera S1 de Ganhadores de Loteria com novo prompt_builder v4."""

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
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from pathlib import Path

from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MODEL      = "gpt-image-2"
ENDPOINT   = "https://api.openai.com/v1/images/generations"
OUT_DIR    = Path("C:/Users/julia/Desktop/carrossel-ganhadores-loteria")

slide = {
    "layout": "fullbleed",
    "title": "VOCÊ QUER\nTER DINHEIRO.\nE EXPULSA ELE.",
    "body": (
        "70% das pessoas que ganham na loteria voltam ao mesmo nível em 12 meses.\n\n"
        "Não porque gastaram errado.\n\n"
        "Porque o corpo trata o dinheiro como ameaça — e devolve tudo "
        "antes da cabeça perceber."
    ),
    "prompt": (
        "A man desperately reaching forward with both hands — "
        "golden banknotes and coins disintegrating into luminous dust "
        "at the moment of contact, money evaporating before it can be held. "
        "Real working hands, veins visible, face showing stunned recognition. "
        "Deep electric gold accent light against absolute black void. "
        "The banknotes dissolve upward and outward into darkness. "
        "Upper frame: rich gold explosion. Lower 40%: deep shadow, near-black."
    ),
}


def gen(prompt: str, retries: int = 3) -> bytes | None:
    payload = json.dumps({
        "model": MODEL, "prompt": prompt,
        "n": 1, "size": "1024x1536", "output_format": "jpeg",
    }).encode()
    for attempt in range(retries):
        if attempt:
            time.sleep(15 * attempt)
        req = urllib.request.Request(ENDPOINT, data=payload,
            headers={"Authorization": f"Bearer {OPENAI_KEY}",
                     "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                body = json.loads(r.read())
            b64 = body.get("data", [{}])[0].get("b64_json")
            if b64:
                return base64.b64decode(b64)
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:200]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


print("\nGerando slide de teste com prompt_builder v4...")
img = gen(build_prompt(slide["prompt"]))
if img:
    final = compose(img, slide["title"], slide["body"], slide["layout"])
    out = OUT_DIR / "slide-01-teste-v4.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"OK: {out}")
else:
    print("FALHOU")
