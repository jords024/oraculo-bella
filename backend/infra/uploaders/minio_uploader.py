#!/usr/bin/env python3
"""
minio_uploader.py — Upload de imagens para MinIO (URL pública)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Faz upload de slides JPEG para o bucket público do MinIO
e retorna URLs públicas — necessárias para publicação via Meta API.

Uso:
    from minio_uploader import upload_image, upload_slides

    url  = upload_image(Path("slide-01.jpg"))
    urls = upload_slides(Path("C:/Users/julia/Desktop/carrossel-x"))
"""

import os
import sys
import uuid
from pathlib import Path

import boto3
from botocore.client import Config
from dotenv import load_dotenv

# Fix Windows terminal encoding
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

load_dotenv()

B2_KEY_ID          = os.getenv("B2_KEY_ID")
B2_APPLICATION_KEY  = os.getenv("B2_APPLICATION_KEY")
B2_BUCKET_NAME      = os.getenv("B2_BUCKET_NAME")
B2_ENDPOINT         = os.getenv("B2_ENDPOINT")

MINIO_ENDPOINT      = os.getenv("MINIO_ENDPOINT")
MINIO_ROOT_USER     = os.getenv("MINIO_ROOT_USER")
MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD")
MINIO_BUCKET        = os.getenv("MINIO_BUCKET", "oraculo-bucket")
MINIO_PUBLIC_URL    = os.getenv("MINIO_PUBLIC_URL") or MINIO_ENDPOINT


def _get_region(endpoint: str) -> str:
    if os.getenv("B2_REGION") or os.getenv("MINIO_REGION") or os.getenv("AWS_REGION"):
        return os.getenv("B2_REGION") or os.getenv("MINIO_REGION") or os.getenv("AWS_REGION")
    import re
    m = re.search(r"s3[.-]([a-z0-9-]+)\.backblazeb2\.com", endpoint, re.IGNORECASE)
    if m:
        return m.group(1)
    aws_m = re.search(r"s3[.-]([a-z0-9-]+)\.amazonaws\.com", endpoint, re.IGNORECASE)
    if aws_m:
        return aws_m.group(1)
    return "us-east-1"


def _normalize_endpoint(endpoint: str) -> str:
    if not endpoint:
        return "http://localhost:9000"
    ep = endpoint.strip()
    if not ep.startswith("http://") and not ep.startswith("https://"):
        if any(h in ep for h in ["localhost", "minio", "127.0.0.1", ":9000"]):
            ep = f"http://{ep}"
        else:
            ep = f"https://{ep}"
    elif ep.startswith("http://") and any(cloud in ep for cloud in ["backblazeb2.com", "amazonaws.com", "r2.cloudflarestorage.com"]):
        ep = ep.replace("http://", "https://")
    return ep.rstrip("/")


def _client():
    """Cria cliente boto3 apontando para B2 ou MinIO."""
    if B2_KEY_ID and B2_APPLICATION_KEY:
        endpoint = _normalize_endpoint(B2_ENDPOINT or "https://s3.us-west-004.backblazeb2.com")
        region = _get_region(endpoint)
        return boto3.client(
            "s3",
            region_name         = region,
            endpoint_url        = endpoint,
            aws_access_key_id   = B2_KEY_ID,
            aws_secret_access_key = B2_APPLICATION_KEY,
            config              = Config(signature_version="s3v4"),
        )
    endpoint = _normalize_endpoint(MINIO_ENDPOINT or "http://localhost:9000")
    return boto3.client(
        "s3",
        region_name         = "us-east-1",
        endpoint_url        = endpoint,
        aws_access_key_id   = MINIO_ROOT_USER or "oraculo_admin",
        aws_secret_access_key = MINIO_ROOT_PASSWORD or "oraculo_secret_123",
        config              = Config(signature_version="s3v4"),
    )


def upload_image(path: Path | str, key: str = None) -> str:
    """
    Faz upload de uma imagem para o Backblaze B2 ou MinIO.
    Returns:
        URL pública da imagem
    """
    use_b2 = bool(B2_KEY_ID and B2_APPLICATION_KEY and B2_BUCKET_NAME)
    bucket = B2_BUCKET_NAME if use_b2 else MINIO_BUCKET

    if not use_b2 and not all([MINIO_ENDPOINT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD, MINIO_BUCKET]):
        raise ValueError(
            "Credenciais MinIO ou B2 não encontradas no .env. "
            "Verifique: B2_KEY_ID / B2_APPLICATION_KEY ou MINIO_ENDPOINT"
        )

    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {path}")

    if key is None:
        prefix = uuid.uuid4().hex[:8]
        key    = f"{prefix}-{path.name}"

    client = _client()
    with open(path, "rb") as f:
        client.put_object(
            Bucket      = bucket,
            Key         = key,
            Body        = f,
            ContentType = "image/jpeg",
        )

    import urllib.parse
    safe_key = urllib.parse.quote(key)
    if use_b2:
        endpoint = (B2_ENDPOINT or "https://s3.us-west-004.backblazeb2.com").rstrip("/")
        url = f"{endpoint}/{bucket}/{safe_key}"
    else:
        base_url = MINIO_PUBLIC_URL.rstrip("/")
        url = f"{base_url}/{bucket}/{safe_key}"
    return url


def upload_slides(slides_dir: Path | str, prefix: str = None) -> list[str]:
    """
    Faz upload de todos os slides de um diretório em ordem.

    Args:
        slides_dir: Diretório contendo slide-01.jpg, slide-02.jpg, etc.
        prefix:     Prefixo único para agrupar os slides no bucket.
                    Se None, gera automaticamente.

    Returns:
        Lista de URLs públicas na ordem correta (slide-01 a slide-10).
    """
    slides_dir = Path(slides_dir)
    slides     = sorted(slides_dir.glob("slide-*.jpg"))

    if not slides:
        raise FileNotFoundError(f"Nenhum slide encontrado em: {slides_dir}")

    if prefix is None:
        prefix = uuid.uuid4().hex[:8]

    urls = []
    print(f"\n  📤 Enviando {len(slides)} slides para o MinIO...")
    for slide in slides:
        key = f"{prefix}/{slide.name}"
        print(f"     {slide.name}...", end=" ", flush=True)
        url = upload_image(slide, key=key)
        print("✅")
        urls.append(url)

    print(f"  ✅ Upload completo — prefixo: {prefix}\n")
    return urls


# ── TESTE RÁPIDO ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Uso: python minio_uploader.py <imagem_ou_pasta>")
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_dir():
        urls = upload_slides(target)
        print("URLs geradas:")
        for i, u in enumerate(urls, 1):
            print(f"  S{i:02d}: {u}")
    else:
        url = upload_image(target)
        print(f"✅ URL pública: {url}")
