#!/usr/bin/env python3
"""
instagram_publisher.py — Publicador de Carrosseis no Instagram
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline completo:
  1. Upload dos slides para MinIO (URLs públicas)
  2. Criação de containers individuais na Meta API
  3. Criação do container de carrossel
  4. Publicação do carrossel no Instagram

Uso simples:
    from instagram_publisher import publicar_carrossel

    publicar_carrossel(
        slides_dir = Path("C:/Users/julia/Desktop/carrossel-x"),
        caption    = "Caption completo do post...",
    )
"""

import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

load_dotenv()

# ── Encoding fix para terminal Windows ────────────────────────────────────────
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Credenciais ───────────────────────────────────────────────────────────────
ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
IG_USER_ID   = os.getenv("INSTAGRAM_ACCOUNT_ID")
API_VERSION  = "v25.0"
BASE_URL     = f"https://graph.facebook.com/{API_VERSION}"


# ══════════════════════════════════════════════════════════════════════════════
# ETAPA 1 — Upload para MinIO
# ══════════════════════════════════════════════════════════════════════════════

def _upload_slides(slides_dir: Path) -> list[str]:
    """Faz upload dos slides e retorna lista de URLs públicas."""
    from publisher import upload_to_b2
    slides = sorted(Path(slides_dir).glob("slide-*.jpg"))
    urls = []
    print("\n[1/3] Enviando slides para MinIO (Servidor oficial de imagens para a Meta API)...")
    for slide in slides:
        print(f"      {slide.name}...", end=" ", flush=True)
        url = upload_to_b2(slide)
        urls.append(url)
        print("OK")
    print(f"      {len(urls)} slides enviados.\n")
    return urls


# ══════════════════════════════════════════════════════════════════════════════
# ETAPA 2 — Criação de containers individuais
# ══════════════════════════════════════════════════════════════════════════════

def _criar_container_imagem(image_url: str, is_carousel_item: bool = True) -> str:
    """
    Cria um container de imagem individual na Meta API.
    Retorna o container ID.
    """
    endpoint = f"{BASE_URL}/{IG_USER_ID}/media"
    payload = {
        "image_url":         image_url,
        "is_carousel_item":  is_carousel_item,
        "access_token":      ACCESS_TOKEN,
    }
    r = requests.post(endpoint, data=payload, timeout=30)
    data = r.json()

    if "id" not in data:
        raise RuntimeError(f"Erro ao criar container de imagem: {data}")

    return data["id"]


def _criar_containers_individuais(urls: list[str]) -> list[str]:
    """Cria containers para cada slide. Retorna lista de container IDs."""
    print("[2/3] Criando containers individuais na Meta API...")
    container_ids = []

    for i, url in enumerate(urls, 1):
        print(f"      Slide {i:02d}...", end=" ", flush=True)
        cid = _criar_container_imagem(url)
        container_ids.append(cid)
        print(f"OK ({cid})")
        time.sleep(1)  # respeita rate limit

    print(f"      {len(container_ids)} containers criados.\n")
    return container_ids


# ══════════════════════════════════════════════════════════════════════════════
# ETAPA 3 — Container de carrossel
# ══════════════════════════════════════════════════════════════════════════════

def _criar_container_carrossel(container_ids: list[str], caption: str, scheduled_publish_time: int = None) -> str:
    """
    Cria o container do carrossel com todos os itens.
    Retorna o carousel container ID.
    """
    endpoint = f"{BASE_URL}/{IG_USER_ID}/media"
    payload = {
        "media_type":    "CAROUSEL",
        "children":      ",".join(container_ids),
        "caption":       caption,
        "access_token":  ACCESS_TOKEN,
    }
    if scheduled_publish_time:
        payload["scheduled_publish_time"] = scheduled_publish_time

    r = requests.post(endpoint, data=payload, timeout=30)
    data = r.json()

    if "id" not in data:
        raise RuntimeError(f"Erro ao criar container de carrossel: {data}")

    return data["id"]


# ══════════════════════════════════════════════════════════════════════════════
# ETAPA 4 — Publicação
# ══════════════════════════════════════════════════════════════════════════════

def _verificar_status_container(container_id: str, tentativas: int = 10) -> bool:
    """
    Aguarda o container ficar pronto para publicação.
    Retorna True se pronto, False se timeout.
    """
    endpoint = f"{BASE_URL}/{container_id}"
    for i in range(tentativas):
        r = requests.get(
            endpoint,
            params={"fields": "status_code", "access_token": ACCESS_TOKEN},
            timeout=15,
        )
        status = r.json().get("status_code", "")
        if status == "FINISHED":
            return True
        elif status == "ERROR":
            raise RuntimeError(f"Container com erro: {r.json()}")
        print(f"      Status: {status} — aguardando... ({i+1}/{tentativas})")
        time.sleep(5)
    return False


def _publicar_container(carousel_id: str) -> str:
    """Publica o container de carrossel. Retorna o post ID."""
    endpoint = f"{BASE_URL}/{IG_USER_ID}/media_publish"
    payload = {
        "creation_id":  carousel_id,
        "access_token": ACCESS_TOKEN,
    }
    r = requests.post(endpoint, data=payload, timeout=30)
    data = r.json()

    if "id" not in data:
        raise RuntimeError(f"Erro ao publicar carrossel: {data}")

    return data["id"]


# ══════════════════════════════════════════════════════════════════════════════
# API PÚBLICA
# ══════════════════════════════════════════════════════════════════════════════

def publicar_carrossel(
    slides_dir: Path | str,
    caption:    str,
    max_slides: int = 10,
    scheduled_publish_time: int = None,
) -> str:
    """
    Pipeline completo: upload → containers → carrossel → publicação (ou agendamento).

    Args:
        slides_dir: Pasta com slide-01.jpg a slide-10.jpg
        caption:    Caption completo do post (com hashtags, etc.)
        max_slides: Máximo de slides a usar (padrão 10 — limite da API)
        scheduled_publish_time: Timestamp UNIX para agendamento (entre 15 min e 75 dias)

    Returns:
        Post ID / Container ID do carrossel no Instagram.
    """
    if not ACCESS_TOKEN or not IG_USER_ID:
        raise ValueError(
            "META_ACCESS_TOKEN ou INSTAGRAM_ACCOUNT_ID não encontrados no .env"
        )

    slides_dir = Path(slides_dir)
    line = "=" * 60
    print(f"\n{line}")
    print("  INSTAGRAM PUBLISHER — Fonte Oculta")
    print(f"  Pasta: {slides_dir.name}")
    print(f"{line}")

    # 1. Upload
    urls = _upload_slides(slides_dir)
    urls = urls[:max_slides]

    # 2. Containers individuais
    container_ids = _criar_containers_individuais(urls)

    # 3. Container de carrossel
    print("[3/3] Criando container do carrossel...")
    carousel_id = _criar_container_carrossel(container_ids, caption, scheduled_publish_time=scheduled_publish_time)
    print(f"      Carousel container ID: {carousel_id}\n")

    # 4. Aguarda ficar pronto
    print("      Verificando status do container...")
    pronto = _verificar_status_container(carousel_id)
    if not pronto:
        raise RuntimeError("Timeout: container não ficou pronto a tempo.")

    # 5. Publica imediatamente ou confirma agendamento nativo do Instagram
    if scheduled_publish_time:
        print(f"\n  Carrossel AGENDADO com sucesso para o timestamp {scheduled_publish_time}!")
        post_id = carousel_id
    else:
        print("\n  Publicando no Instagram...")
        post_id = _publicar_container(carousel_id)

    print(f"\n{line}")
    print(f"  {'AGENDADO' if scheduled_publish_time else 'PUBLICADO'} COM SUCESSO!")
    print(f"  ID: {post_id}")
    print("  @afonteoculta — instagram.com/afonteoculta")
    print(f"{line}\n")

    return post_id


def _convert_and_upload_stories(slides_dir: Path) -> list[str]:
    """
    Converte os slides de 1080x1350 para o formato de Story 1080x1920
    (com fundo desfocado e escurecido) e faz upload para ImgBB.
    """
    from PIL import Image, ImageEnhance, ImageFilter

    from publisher import upload_to_b2

    # Localizar slides
    slides = sorted(Path(slides_dir).glob("slide-*.jpg"))
    if not slides:
        # Se não achar slide-*.jpg, tenta *.jpg, ignorando raw e stories
        slides = sorted([
            f for f in Path(slides_dir).iterdir()
            if f.suffix.lower() in (".jpg", ".jpeg", ".png")
            and not f.name.startswith("raw-")
            and not f.name.startswith("story-")
        ])

    stories_dir = Path(slides_dir) / "stories"
    stories_dir.mkdir(exist_ok=True)

    urls = []
    print("\n[1/2] Convertendo slides para Story (1080x1920) e enviando...")
    for slide in slides:
        story_file = stories_dir / f"story-{slide.name}"

        # Converte apenas se não existir
        if not story_file.exists():
            print(f"      Processando {slide.name} -> 1080x1920...", end=" ", flush=True)
            try:
                card = Image.open(slide).convert("RGBA")
                cw, ch = card.size # 1080, 1350

                # Proporções
                sw, sh = 1080, 1920

                # 1. Redimensionar para cobrir fundo
                bg_w = int(sh * (cw / ch)) # 1920 * 0.8 = 1536
                bg_h = sh
                bg = card.resize((bg_w, bg_h), Image.LANCZOS)

                # Cortar laterais
                left = (bg_w - sw) // 2
                bg = bg.crop((left, 0, left + sw, sh))

                # 2. Desfoque gaussiano
                bg = bg.filter(ImageFilter.GaussianBlur(radius=45))

                # 3. Escurecer o fundo
                enhancer = ImageEnhance.Brightness(bg)
                bg = enhancer.enhance(0.40)

                # 4. Colar o card original centralizado verticalmente
                y_offset = (sh - ch) // 2
                bg.paste(card, (0, y_offset), card)

                # Salvar
                bg.convert("RGB").save(story_file, "JPEG", quality=95)
                print("OK")
            except Exception as e:
                print(f"FALHA na conversão: {e}")
                story_file = slide # fallback
        else:
            print(f"      Usando Story em cache: {story_file.name}")

        # Upload
        print(f"      Enviando {story_file.name} para Backblaze B2...", end=" ", flush=True)
        url = upload_to_b2(story_file)
        urls.append(url)
        print("OK")

    print(f"      {len(urls)} Stories prontos e enviados.\n")
    return urls


def publicar_stories(
    slides_dir: Path | str,
    max_slides: int = 10,
) -> list[str]:
    """
    Publica os slides individuais como stories sequenciais no Instagram via Meta API.
    Retorna a lista de story IDs publicados.
    """
    if not ACCESS_TOKEN or not IG_USER_ID:
        raise ValueError(
            "META_ACCESS_TOKEN ou INSTAGRAM_ACCOUNT_ID não encontrados no .env"
        )

    slides_dir = Path(slides_dir)
    line = "=" * 60
    print(f"\n{line}")
    print("  INSTAGRAM STORIES PUBLISHER — Fonte Oculta")
    print(f"  Pasta: {slides_dir.name}")
    print(f"{line}")

    # 1. Converte slides para 1080x1920 e faz upload
    urls = _convert_and_upload_stories(slides_dir)
    urls = urls[:max_slides]

    story_ids = []
    print("[2/2] Criando containers de story e publicando na Meta API...")
    for i, url in enumerate(urls, 1):
        print(f"      [{i}/{len(urls)}] Enviando slide {i:02d} como Story...", end=" ", flush=True)

        # Cria container de story
        endpoint = f"{BASE_URL}/{IG_USER_ID}/media"
        payload = {
            "image_url":     url,
            "media_type":    "STORIES",
            "access_token":  ACCESS_TOKEN,
        }
        r = requests.post(endpoint, data=payload, timeout=30)
        data = r.json()
        if "id" not in data:
            raise RuntimeError(f"Erro ao criar container de story para o slide {i}: {data}")

        container_id = data["id"]
        print(f"OK ({container_id})")

        # Verifica status
        print(f"      Aguardando processamento do container {container_id}...")
        pronto = _verificar_status_container(container_id)
        if not pronto:
            raise RuntimeError(f"Timeout: container do slide {i} não ficou pronto.")

        # Publica
        print("      Publicando...", end=" ", flush=True)
        pub_endpoint = f"{BASE_URL}/{IG_USER_ID}/media_publish"
        pub_payload = {
            "creation_id":  container_id,
            "access_token": ACCESS_TOKEN,
        }
        pub_r = requests.post(pub_endpoint, data=pub_payload, timeout=30)
        pub_data = pub_r.json()
        if "id" not in pub_data:
            raise RuntimeError(f"Erro ao publicar story para o slide {i}: {pub_data}")

        story_id = pub_data["id"]
        story_ids.append(story_id)
        print(f"OK (Story ID: {story_id})")
        time.sleep(2)  # respeita rate limit e ordem cronológica

    print(f"\n{line}")
    print(f"  {len(story_ids)} STORIES PUBLICADOS COM SUCESSO!")
    print("  @afonteoculta — instagram.com/afonteoculta")
    print(f"{line}\n")

    return story_ids


# ── TESTE RÁPIDO ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Uso: python instagram_publisher.py <pasta_slides> <caption>")
        print('Ex:  python instagram_publisher.py "C:/Desktop/carrossel-x" "Caption aqui..."')
        sys.exit(1)

    pasta   = Path(sys.argv[1])
    caption = sys.argv[2]

    post_id = publicar_carrossel(slides_dir=pasta, caption=caption)
    print(f"Post publicado: {post_id}")
