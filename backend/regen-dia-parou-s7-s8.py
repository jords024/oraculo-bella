#!/usr/bin/env python3
"""Regenera apenas S7 e S8 do carrossel-dia-parou-crescer."""

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
OUT_DIR    = Path("C:/Users/julia/Desktop/carrossel-dia-parou-crescer")

slides = [
  {
    "num": "07",
    "layout": "fullbleed",
    "title": "DÁ PRA\nATUALIZAR\nA DECISÃO.",
    "body": (
        "A conclusão foi gravada em frequência theta.\n\n"
        "Pra sobrescrever, você precisa acessar a mesma frequência — "
        "não com força de vontade, não com análise, "
        "não com mais sessões de terapia.\n\n"
        "Com um protocolo que opera no nível onde a decisão foi tomada.\n\n"
        "Quando a gravação original muda, o teto some."
    ),
    "prompt": (
        "The childhood recording scene from earlier being reprocessed in real time — "
        "the original memory visible in sepia and muted tones on one side. "
        "Overlaid on top, radiant golden light actively rewriting the recording: "
        "new luminous neural pathways burning bright gold "
        "where the old scarcity pathways were etched. "
        "The child in the scene visibly releasing the weight of a decision she carried alone. "
        "Not erasing the past — updating the file. "
        "A human figure witnessing the transformation with profound relief. "
        "Electric gold and deep violet. The original recording changing."
    ),
  },
  {
    "num": "08",
    "layout": "fullbleed",
    "title": "VOCÊ NÃO\nTRAVOU.\nFOI PROTEGIDO.",
    "body": (
        "O sistema que gravou o limite não é um inimigo.\n\n"
        "É uma criança que fez o melhor que podia com o que tinha.\n\n"
        "Agora você pode fazer o que ela não conseguia: "
        "avisar que mudou. Que é seguro ir além.\n\n"
        "Comente FONTE se você sente que existe um teto invisível "
        "— e nunca soube de onde ele veio."
    ),
    "prompt": (
        "An adult and a small child standing face to face — not in conflict "
        "but in full mutual recognition and release. "
        "The child reaching upward, the adult reaching downward, "
        "their hands meeting in the center in a gesture of reconciliation. "
        "Between them: a field of golden light where the old limit used to be, "
        "now completely dissolved. "
        "The child releasing the adult with love and visible relief. "
        "Both figures luminous and expanded. "
        "Sacred geometry forming between their joined hands. "
        "Deep violet background with electric gold and iridescent magenta. "
        "Sacred and deeply human."
    ),
  },
]


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
            print(f"  Aguardando {wait}s antes da tentativa {attempt+1}...")
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
print("  Regenerando S07 e S08 — dia-parou-crescer")
print(f"{'='*60}\n")

ok = 0
for s in slides:
    print(f"[S{s['num']}] {s['title'].splitlines()[0]}...")
    img = gen(build_prompt(s["prompt"]))
    if not img:
        print("  FALHOU\n")
        continue
    final = compose(img, s["title"], s["body"], s["layout"])
    slug  = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
    out   = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1
    if ok < len(slides):
        time.sleep(5)

print(f"{'='*60}")
print(f"  CONCLUIDO: {ok}/2 slides regenerados")
print(f"{'='*60}\n")
