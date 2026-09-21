#!/usr/bin/env python3
"""
testar_openai.py — Teste completo do GPT Image 1 integrado ao compose_util
Gera 1 slide de amostra com layout fullbleed e salva na Desktop.

COMO USAR:
    python -X utf8 testar_openai.py
    python -X utf8 testar_openai.py --modelo dall-e-3
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from dotenv import load_dotenv

load_dotenv()

import argparse
from pathlib import Path

from core.util.compose_util import compose
from core.util.gen_image_openai import MODEL as DEFAULT_MODEL
from core.util.gen_image_openai import gen_openai, verificar_key

parser = argparse.ArgumentParser()
parser.add_argument("--modelo", default=DEFAULT_MODEL, choices=["gpt-image-1", "dall-e-3"])
args = parser.parse_args()

# Override model se necessário
import gen_image_openai as _g

_g.MODEL = args.modelo

print(f"\n{'='*60}")
print(f"  TESTE — OpenAI {args.modelo}")
print(f"{'='*60}\n")

# ── 1. Verificar key ───────────────────────────────────────────────────────────
print("  [1/3] Verificando API key...")
if not os.getenv("OPENAI_API_KEY"):
    print("  ❌ OPENAI_API_KEY não encontrada no .env")
    print("  Adicione: OPENAI_API_KEY=sk-proj-...")
    sys.exit(1)

key_ok = verificar_key()
if not key_ok:
    print("  ❌ Key inválida ou sem acesso a image generation")
    sys.exit(1)

print("  ✅ Key válida\n")

# ── 2. Gerar imagem ────────────────────────────────────────────────────────────
PROMPT = (
    "Painterly digital oil painting, mystical cinematic realism. "
    "A luminous ancient temple floating in deep cosmic space — "
    "Baroque architectural details rendered with extraordinary painterly texture, "
    "rich crimson and amber light emanating from within the temple windows and archways. "
    "Deep cosmic purple-blue background with subtle star-field. "
    "Dramatic perspective from below looking upward. "
    "Rich atmospheric depth, visible brushstroke quality throughout. "
    "Lower 35% of frame fades to deep shadow for text overlay. "
    "No text, no letters, no words."
)

TITLE = "VOCÊ NUNCA\nDUVIDOU DE DEUS."
BODY  = "Duvidou da versão de Deus\nque alguém construiu para você."

print(f"  [2/3] Gerando imagem com {args.modelo}...")
img_bytes = gen_openai(PROMPT)

if not img_bytes:
    print("  ❌ Falha na geração da imagem")
    sys.exit(1)

print(f"  ✅ Imagem gerada ({len(img_bytes)/1024:.0f} KB)\n")

# ── 3. Compor slide ────────────────────────────────────────────────────────────
print("  [3/3] Compondo slide com cinematografico_crimson...")
final = compose(img_bytes, TITLE, BODY, "fullbleed", preset_name="cinematografico_crimson")

out = Path("C:/Users/julia/Desktop/teste_openai_slide.jpg")
final.save(str(out), "JPEG", quality=95)

print("  ✅ Slide composto e salvo!")
print(f"  📁 {out.resolve()}")
print(f"\n{'='*60}")
print(f"  GPT {args.modelo.upper()} está funcionando!")
print("  Agora pode usar nos carrosseis com:")
print("  from core.util.gen_image_openai import gen_openai as gen")
print(f"{'='*60}\n")
