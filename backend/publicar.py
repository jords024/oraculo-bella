#!/usr/bin/env python3
"""
publicar.py — Publicador Unificado — Fonte Oculta
Lê o dashboard (carousels.json) e publica no Instagram.

Tenta Meta Graph API primeiro. Se token expirado → usa instagrapi.

USO:
    python publicar.py --id carrossel-18       # publica específico
    python publicar.py --auto                  # publica próximo 'pronto'
    python publicar.py --list                  # lista + status das credenciais
    python publicar.py --id carrossel-18 --dry-run  # simula sem publicar
    python publicar.py --renovar-token         # instruções para renovar token Meta
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ── Credenciais ────────────────────────────────────────────────────────────────
META_TOKEN  = os.getenv("META_ACCESS_TOKEN", "")
IG_ACCOUNT  = os.getenv("INSTAGRAM_ACCOUNT_ID", "")
IG_USER     = os.getenv("INSTAGRAM_USERNAME", "")
IG_PASS     = os.getenv("INSTAGRAM_PASSWORD", "")

DATA_FILE    = Path("C:/Users/julia/nano-banana-mcp/dashboard/data/carousels.json")
SESSION_FILE = Path("C:/Users/julia/nano-banana-mcp/.instagram_session.json")
GRAPH_V      = "v19.0"

# ── Dashboard ──────────────────────────────────────────────────────────────────
def read_db() -> list:
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []

def write_db(data: list):
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

def update_status(carousel_id: str, slides_dir: str, status: str, media_id: str = ""):
    data = read_db()
    for c in data:
        if c["id"] == carousel_id and c.get("slidesDir") == slides_dir:
            c["status"]      = status
            c["publishedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M")
            if media_id:
                c["instagramMediaId"] = media_id
    write_db(data)

def get_slides(carousel: dict) -> list:
    d      = Path(carousel.get("slidesDir", ""))
    prefix = carousel.get("slidePrefix", "slide-")
    if not d.exists():
        return []
    return sorted([
        f for f in d.iterdir()
        if f.name.startswith(prefix)
        and f.suffix.lower() in (".jpg", ".jpeg", ".png")
    ])

# ── Verificação de credenciais ─────────────────────────────────────────────────
def verificar_meta() -> bool:
    """Verifica se o META_ACCESS_TOKEN é válido."""
    if not META_TOKEN or not IG_ACCOUNT:
        return False
    try:
        url = (
            f"https://graph.facebook.com/{GRAPH_V}/{IG_ACCOUNT}"
            f"?fields=id,username&access_token={META_TOKEN}"
        )
        with urllib.request.urlopen(url, timeout=10) as r:
            resp = json.loads(r.read())
        return "id" in resp
    except Exception:
        return False

def verificar_sessao() -> bool:
    """Verifica se a sessão instagrapi existe."""
    return SESSION_FILE.exists()

# ── MinIO Upload ──────────────────────────────────────────────────────────────
def upload_to_minio(img_path: Path) -> str:
    """Faz upload para o MinIO e retorna URL pública."""
    from infra.uploaders.minio_uploader import upload_image
    return upload_image(img_path)

# Aliases de compatibilidade
upload_to_b2 = upload_to_minio
upload_imgbb = upload_to_minio

# ── Meta Graph API ─────────────────────────────────────────────────────────────
def publicar_meta_api(slides: list, caption: str, dry_run: bool = False) -> str:
    """Publica via Meta Graph API oficial. Retorna media_id."""
    if dry_run:
        print(f"    [DRY RUN] Meta API — {len(slides)} slides")
        for i, s in enumerate(slides, 1):
            print(f"      [{i}] {s.name}")
        return "DRY_RUN_META"

    # Passo 1: Upload + container filho para cada slide
    container_ids = []
    for i, slide in enumerate(slides, 1):
        print(f"    [{i}/{len(slides)}] Upload {slide.name}...")
        url_img = upload_to_b2(slide)

        params = urllib.parse.urlencode({
            "image_url":        url_img,
            "is_carousel_item": "true",
            "access_token":     META_TOKEN,
        })
        req = urllib.request.Request(
            f"https://graph.facebook.com/{GRAPH_V}/{IG_ACCOUNT}/media?{params}",
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        if "id" not in resp:
            raise RuntimeError(f"Container filho falhou slide {i}: {resp}")
        container_ids.append(resp["id"])
        time.sleep(2)

    print(f"    Containers criados: {len(container_ids)}")

    # Passo 2: Container do carrossel
    params = urllib.parse.urlencode({
        "media_type":   "CAROUSEL",
        "children":     ",".join(container_ids),
        "caption":      caption,
        "access_token": META_TOKEN,
    })
    req = urllib.request.Request(
        f"https://graph.facebook.com/{GRAPH_V}/{IG_ACCOUNT}/media?{params}",
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read())
    carousel_cid = resp.get("id")
    if not carousel_cid:
        raise RuntimeError(f"Container carrossel falhou: {resp}")

    time.sleep(5)  # Aguarda processamento

    # Passo 3: Publicar
    params = urllib.parse.urlencode({
        "creation_id":  carousel_cid,
        "access_token": META_TOKEN,
    })
    req = urllib.request.Request(
        f"https://graph.facebook.com/{GRAPH_V}/{IG_ACCOUNT}/media_publish?{params}",
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read())

    media_id = resp.get("id")
    if not media_id:
        raise RuntimeError(f"Publicação falhou: {resp}")
    return str(media_id)

# ── instagrapi (fallback) ──────────────────────────────────────────────────────
def publicar_instagrapi(slides: list, caption: str) -> str:
    """Publica via instagrapi (login com user/senha). Fallback quando Meta expirado."""
    from instagrapi import Client
    from instagrapi.exceptions import TwoFactorRequired

    cl = Client()
    cl.delay_range = [2, 5]

    # Tenta carregar sessão existente
    if SESSION_FILE.exists():
        try:
            cl.load_settings(SESSION_FILE)
            cl.login(IG_USER, IG_PASS)
            print("    Sessao instagrapi restaurada")
        except Exception:
            cl = Client()
            cl.delay_range = [2, 5]

    if not cl.user_id:
        try:
            cl.login(IG_USER, IG_PASS)
            cl.dump_settings(SESSION_FILE)
        except TwoFactorRequired:
            raise RuntimeError(
                "2FA necessário!\n"
                "  Execute: python instagram_login.py\n"
                "  (só precisa fazer isso UMA VEZ)"
            )

    print(f"    Enviando {len(slides)} slides via instagrapi...")
    if len(slides) == 1:
        media = cl.photo_upload(slides[0], caption=caption)
    else:
        media = cl.album_upload(slides, caption=caption)

    cl.dump_settings(SESSION_FILE)
    return str(media.pk)

# ── Publicação unificada ───────────────────────────────────────────────────────
def publicar(carousel: dict, dry_run: bool = False, forcar_metodo: str = "") -> bool:
    """
    Publica um carousel.
    forcar_metodo: 'meta' | 'instagrapi' | '' (automático)
    """
    slides  = get_slides(carousel)
    caption = carousel.get("caption", "")
    cid     = carousel["id"]
    sdir    = carousel["slidesDir"]

    if not slides:
        print(f"  ❌ Nenhum slide encontrado em: {sdir}")
        return False

    # Limita a 10 (limite do Instagram)
    if len(slides) > 10:
        print(f"  ⚠️  {len(slides)} slides → usando primeiros 10 (limite IG)")
        slides = slides[:10]

    print(f"\n{'='*60}")
    print(f"  Publicando: {carousel['title'][:50]}")
    print(f"  ID: {cid}  |  Slides: {len(slides)}")
    print(f"{'='*60}\n")

    meta_ok = verificar_meta()
    metodo  = forcar_metodo or ("meta" if meta_ok else "instagrapi")

    print(f"  Método: {metodo.upper()} {'✅' if meta_ok else '(Meta expirado — usando fallback)'}\n")

    try:
        if metodo == "meta":
            media_id = publicar_meta_api(slides, caption, dry_run)
        else:
            if dry_run:
                print(f"  [DRY RUN] Instagrapi — {len(slides)} slides simulados")
                for i, s in enumerate(slides, 1):
                    print(f"    [{i}] {s.name}")
                return True
            media_id = publicar_instagrapi(slides, caption)

        print("\n  ✅ Publicado com sucesso!")
        print(f"  Media ID: {media_id}")
        print(f"  @afonteoculta · {len(slides)} slides")

        if not dry_run:
            update_status(cid, sdir, "publicado", media_id)
            print("  Dashboard → publicado ✅")

        print(f"{'='*60}\n")
        return True

    except Exception as e:
        print(f"\n  ❌ Erro ao publicar: {e}")
        if not dry_run:
            update_status(cid, sdir, "erro-publicacao")
        return False

# ── Comandos CLI ───────────────────────────────────────────────────────────────
def cmd_list():
    data = read_db()
    meta_ok    = verificar_meta()
    sessao_ok  = verificar_sessao()

    print(f"\n{'─'*68}")
    print(f"  {'ID':<16} {'STATUS':<12} {'SLIDES':<8} TITULO")
    print(f"{'─'*68}")
    for c in data:
        slides = get_slides(c)
        s      = c.get("status", "?")
        icon   = "✅" if s == "publicado" else ("📝" if s == "pronto" else "❌")
        pub_at = f" [{c['publishedAt']}]" if s == "publicado" and c.get("publishedAt") else ""
        print(f"  {c['id']:<16} {icon} {s:<10} {len(slides):<8} {c['title'][:38]}{pub_at}")
    print(f"{'─'*68}")
    print("\n  CREDENCIAIS:")
    print(f"    Meta Graph API : {'✅ Token válido' if meta_ok else '❌ Expirado — ver python publicar.py --renovar-token'}")
    print(f"    instagrapi     : {'✅ Sessão salva' if sessao_ok else '⚠️  Execute: python instagram_login.py'}")
    print(f"    Método atual   : {'Meta API' if meta_ok else 'instagrapi (fallback)'}")
    print()

def cmd_renovar_token():
    print("""
╔══════════════════════════════════════════════════════════════╗
║       COMO RENOVAR O TOKEN META GRAPH API                    ║
╚══════════════════════════════════════════════════════════════╝

OPÇÃO 1 — Token de Usuário (60 dias):
  1. Acesse: https://developers.facebook.com/tools/explorer/
  2. Selecione seu App (Fonte Oculta)
  3. Clique "Generate Access Token"
  4. Marque as permissões:
       ✓ instagram_content_publish
       ✓ instagram_basic
       ✓ pages_show_list
       ✓ pages_read_engagement
  5. Copie o token gerado
  6. Para extender para 60 dias, acesse:
     https://developers.facebook.com/tools/accesstoken/
  7. Cole no .env:
       META_ACCESS_TOKEN=<novo_token>

OPÇÃO 2 — System User (nunca expira) [RECOMENDADO]:
  1. Acesse: https://business.facebook.com/settings/system-users
  2. Crie um System User (Admin)
  3. Clique "Generate New Token"
  4. Selecione seu App + permissões acima
  5. Copie o token e cole no .env

OPÇÃO 3 — Usar instagrapi enquanto renova Meta:
  Execute: python instagram_login.py
  (faz login uma vez, salva sessão, publicações futuras são automáticas)
""")

def cmd_auto(dry_run: bool) -> bool:
    """Publica o próximo carousel com status 'pronto'."""
    data   = read_db()
    prontos = [c for c in data if c.get("status") == "pronto" and get_slides(c)]
    if not prontos:
        print("  Nenhum carousel 'pronto' com slides disponíveis. Nada a publicar.")
        return True
    carousel = prontos[0]
    print(f"  Auto-selecionado: {carousel['id']} — {carousel['title'][:50]}")
    return publicar(carousel, dry_run)

# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Publicador Fonte Oculta — Meta API + instagrapi fallback"
    )
    parser.add_argument("--id",            help="ID do carrossel (ex: carrossel-18)")
    parser.add_argument("--auto",          action="store_true", help="Publica próximo pronto")
    parser.add_argument("--list",          action="store_true", help="Lista carrosseis + status")
    parser.add_argument("--dry-run",       action="store_true", help="Simula sem publicar")
    parser.add_argument("--renovar-token", action="store_true", help="Instruções renovação token")
    parser.add_argument("--metodo",        choices=["meta", "instagrapi"], default="",
                        help="Forçar método específico")
    args = parser.parse_args()

    if args.renovar_token:
        cmd_renovar_token()
    elif args.list:
        cmd_list()
    elif args.auto:
        ok = cmd_auto(args.dry_run)
        sys.exit(0 if ok else 1)
    elif args.id:
        data = read_db()
        # Busca por ID + slides existentes (resolve conflitos de ID duplicado)
        carousel = None
        for c in data:
            if c["id"] == args.id and get_slides(c):
                carousel = c
                break
        if not carousel:
            print(f"  ❌ Carrossel '{args.id}' não encontrado ou sem slides.")
            sys.exit(1)
        ok = publicar(carousel, args.dry_run, forcar_metodo=args.metodo)
        sys.exit(0 if ok else 1)
    else:
        cmd_list()
