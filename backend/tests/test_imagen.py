#!/usr/bin/env python3
"""
test_imagen.py — Teste de geração de imagens com o Imagen 3 (Google AI Studio)
"""

import base64
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "imagen-3.0-generate-002"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:predict"

def test_gen(prompt: str) -> bytes | None:
    headers = {
        "x-goog-api-key": API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "instances": [
            {
                "prompt": prompt
            }
        ],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "3:4"  # Tamanho vertical ideal para carrossel (Instagram)
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=data, headers=headers)

    try:
        print(f"Enviando requisição ao Imagen 3 ({MODEL})...")
        with urllib.request.urlopen(req, timeout=120) as r:
            body = json.loads(r.read())

        predictions = body.get("predictions", [])
        if not predictions:
            print("Nenhuma predição retornada:", body)
            return None

        b64_str = predictions[0].get("bytesBase64Encoded")
        if not b64_str:
            print("Bytes base64 não encontrados na resposta:", predictions[0])
            return None

        return base64.b64decode(b64_str)

    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"Erro geral: {e}")

    return None

if __name__ == "__main__":
    prompt = "A majestic glowing golden key floating in deep cosmic space, mystical atmosphere, absolute black background."
    img = test_gen(prompt)
    if img:
        out = Path("C:/Users/julia/Desktop/test_imagen_3.jpg")
        out.write_bytes(img)
        print("IMAGEM GERADA COM SUCESSO! Salva em:", out)
    else:
        print("FALHA ao gerar imagem com o Imagen 3.")
