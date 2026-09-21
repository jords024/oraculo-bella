#!/usr/bin/env python3
"""
imgur_uploader.py — Upload de imagens para o Imgur (URL pública)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Faz upload anônimo de imagens JPEG/PNG para o Imgur
e retorna a URL pública — necessária para publicação via Meta API.

Uso:
    from imgur_uploader import upload_image

    url = upload_image(Path("C:/Users/julia/Desktop/carrossel-x/slide-01.jpg"))
    print(url)  # https://i.imgur.com/AbCdEfG.jpg
"""

import base64
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

IMGUR_CLIENT_ID = os.getenv("IMGUR_CLIENT_ID")
IMGUR_ENDPOINT  = "https://api.imgur.com/3/image"


def upload_image(path: Path | str) -> str:
    """
    Faz upload de uma imagem local para o Imgur.

    Args:
        path: Caminho para o arquivo de imagem (JPEG ou PNG).

    Returns:
        URL pública da imagem no Imgur (ex: 'https://i.imgur.com/AbCdEfG.jpg').

    Raises:
        ValueError: Se IMGUR_CLIENT_ID não estiver configurado no .env.
        RuntimeError: Se o upload falhar.
    """
    if not IMGUR_CLIENT_ID:
        raise ValueError(
            "IMGUR_CLIENT_ID não encontrado no .env. "
            "Adicione: IMGUR_CLIENT_ID=seu_client_id"
        )

    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {path}")

    with open(path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    headers  = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}
    payload  = {"image": image_data, "type": "base64"}

    response = requests.post(IMGUR_ENDPOINT, headers=headers, data=payload, timeout=30)

    if response.status_code != 200:
        raise RuntimeError(
            f"Imgur upload falhou: {response.status_code} — {response.text}"
        )

    data = response.json()
    if not data.get("success"):
        raise RuntimeError(f"Imgur retornou erro: {data}")

    url = data["data"]["link"]
    return url


def upload_slides(slides_dir: Path | str) -> list[str]:
    """
    Faz upload de todos os slides de um diretório em ordem.

    Args:
        slides_dir: Diretório contendo slide-01.jpg, slide-02.jpg, etc.

    Returns:
        Lista de URLs públicas na ordem correta.
    """
    slides_dir = Path(slides_dir)
    slides     = sorted(slides_dir.glob("slide-*.jpg"))

    if not slides:
        raise FileNotFoundError(f"Nenhum slide encontrado em: {slides_dir}")

    urls = []
    for slide in slides:
        print(f"  📤 Enviando {slide.name}...", end=" ", flush=True)
        url = upload_image(slide)
        print(f"✅ {url}")
        urls.append(url)

    return urls


# ── TESTE RÁPIDO ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python imgur_uploader.py <caminho_da_imagem_ou_pasta>")
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_dir():
        print(f"\n📁 Enviando slides de: {target}")
        urls = upload_slides(target)
        print(f"\n✅ {len(urls)} slides enviados:")
        for i, u in enumerate(urls, 1):
            print(f"  S{i:02d}: {u}")
    else:
        print(f"\n📤 Enviando: {target}")
        url = upload_image(target)
        print(f"✅ URL pública: {url}")
