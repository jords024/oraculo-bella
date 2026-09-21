#!/usr/bin/env python3
"""regen-slide.py — Regenera a imagem via Gemini e recompõe o slide.
Uso: python regen-slide.py --prompt <txt> --title <txt> --body <txt> --layout fullbleed --output <path>
"""

import os

from dotenv import load_dotenv

load_dotenv()
import argparse
import base64
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

API_KEY  = os.getenv("GEMINI_API_KEY")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
FAL_KEY = os.getenv("FAL_KEY") or os.getenv("FAL_API_KEY")

def gen_gemini_imagen3(prompt, retries=2):
    if not API_KEY: return None
    MODEL    = "imagen-3.0-generate-002"
    ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:predict"
    headers = {"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
    payload = {"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1, "aspectRatio": "3:4"}}
    data = json.dumps(payload).encode("utf-8")
    for attempt in range(retries):
        if attempt: time.sleep(3 * attempt)
        req = urllib.request.Request(ENDPOINT, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                body = json.loads(r.read())
            predictions = body.get("predictions", [])
            if predictions and "bytesBase64Encoded" in predictions[0]:
                return base64.b64decode(predictions[0]["bytesBase64Encoded"])
        except Exception as e:
            print(f"  Erro Imagen 3: {e}", file=sys.stderr)
    return None

def gen_openai(prompt, model_name="gpt-image-2", retries=2):
    if not OPENAI_KEY: return None
    try:
        from core.util.gen_image_openai import gen_openai as open_ai_gen
        quality = "low" if model_name in ["gpt-image-1-mini", "dall-e-2"] else "high"
        return open_ai_gen(prompt, retries=retries, quality=quality)
    except Exception as e:
        print(f"  Erro OpenAI Image ({model_name}): {e}", file=sys.stderr)
        return None

def gen_fal_ai(prompt, retries=2):
    if not FAL_KEY: return None
    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt,
        "image_size": "portrait_4_3"
    }
    data = json.dumps(payload).encode("utf-8")
    url = "https://queue.fal.run/fal-ai/flux/schnell"
    for attempt in range(retries):
        if attempt: time.sleep(3 * attempt)
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                res_body = json.loads(r.read())
                images = res_body.get("images", [])
                if images and "url" in images[0]:
                    with urllib.request.urlopen(images[0]["url"], timeout=60) as img_r:
                        return img_r.read()
        except Exception as e:
            print(f"  Erro Fal.ai: {e}", file=sys.stderr)
    return None

def gen(prompt, provider=None):
    active_prov = (provider or os.getenv("ACTIVE_IMAGE_PROVIDER") or "gpt-image-1").lower()
    print(f"  Usando Provedor de Imagem: {active_prov}", file=sys.stderr)

    if active_prov in ["gpt-image-1", "gpt-image-2", "openai", "dall-e-3"]:
        img = gen_openai(prompt, model_name=active_prov)
        if img: return img
    elif active_prov in ["gpt-image-1-mini", "dall-e-2", "mini"]:
        img = gen_openai(prompt, model_name="gpt-image-1-mini")
        if img: return img
    elif active_prov in ["fal-ai", "fal", "flux"]:
        img = gen_fal_ai(prompt)
        if img: return img
    elif active_prov in ["gemini-imagen", "gemini", "imagen"]:
        img = gen_gemini_imagen3(prompt)
        if img: return img

    # Fallback em cascata caso o provedor selecionado falhe
    print("  Fallback: tentando provedores secundários...", file=sys.stderr)
    return gen_openai(prompt, "gpt-image-1") or gen_openai(prompt, "gpt-image-2") or gen_gemini_imagen3(prompt) or gen_fal_ai(prompt)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--prompt",   required=True, help="Prompt de imagem")
    p.add_argument("--title",    required=True, help="Titulo do slide")
    p.add_argument("--body",     required=True, help="Corpo do slide")
    p.add_argument("--layout",   default="fullbleed", choices=["fullbleed", "dramatico", "etereo", "text_only", "card"])
    p.add_argument("--preset",   default="dramatico", help="Preset visual do slide")
    p.add_argument("--watermark", default=None, help="Texto de marca d'água / handle")
    p.add_argument("--provider", default=None, help="Provedor de imagem ativo")
    p.add_argument("--output",   required=True, help="Caminho de saida (.jpg)")
    args = p.parse_args()

    final_prompt = build_prompt(args.prompt)
    print("Gerando imagem...", file=sys.stderr)
    img_bytes = gen(final_prompt, provider=args.provider)
    if not img_bytes:
        print("FALHOU: nao foi possivel gerar a imagem", file=sys.stderr)
        sys.exit(1)

    result = compose(
        img_bytes, 
        args.title, 
        args.body, 
        layout=args.layout, 
        preset_name=args.preset or "dramatico",
        watermark_text=args.watermark
    )
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    result.save(str(out), "JPEG", quality=95)

    # Salva também a imagem limpa em raw-XX.jpg
    raw_name = out.name.replace("slide-", "raw-")
    if raw_name != out.name:
        raw_out = out.parent / raw_name
        try:
            with open(raw_out, "wb") as rf:
                rf.write(img_bytes)
        except Exception as e:
            print(f"  Erro ao salvar raw image: {e}", file=sys.stderr)

    print(f"OK: {out}")

if __name__ == "__main__":
    main()
