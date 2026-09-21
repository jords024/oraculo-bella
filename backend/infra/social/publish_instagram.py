#!/usr/bin/env python3
"""
publish_instagram.py — Publica carrosseis no Instagram via Meta Graph API oficial.

USO:
    python -X utf8 publish_instagram.py --id carrossel-04
    python -X utf8 publish_instagram.py --id carrossel-04 --caption "Caption custom"
    python -X utf8 publish_instagram.py --list
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# ── Encoding fix Windows ──────────────────────────────────────────────────────
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Adiciona o próprio diretório infra/social ao sys.path para import de instagram_publisher
SOCIAL_DIR = Path(__file__).resolve().parent
if str(SOCIAL_DIR) not in sys.path:
    sys.path.insert(0, str(SOCIAL_DIR))

from dotenv import load_dotenv

load_dotenv()

DATA_FILE = BASE_DIR / "dashboard" / "data" / "carousels.json"


# ── Dashboard helpers ─────────────────────────────────────────────────────────

def read_dashboard():
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def update_status(carousel_id: str, status: str, media_id: str = ""):
    all_c = read_dashboard()
    pub_at = datetime.now().strftime("%Y-%m-%d %H:%M")
    for c in all_c:
        if c["id"] == carousel_id:
            c["status"] = status
            if media_id:
                c["instagramMediaId"] = str(media_id)
            c["publishedAt"] = pub_at
    if DATA_FILE.exists():
        DATA_FILE.write_text(
            json.dumps(all_c, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    # Atualiza também o PostgreSQL se estiver rodando
    try:
        import psycopg2
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            if media_id:
                cur.execute(
                    "UPDATE carousels SET status = %s, instagram_media_id = %s, published_at = %s WHERE id = %s",
                    (status, str(media_id), pub_at, carousel_id)
                )
            else:
                cur.execute(
                    "UPDATE carousels SET status = %s, published_at = %s WHERE id = %s",
                    (status, pub_at, carousel_id)
                )
            conn.commit()
            cur.close()
            conn.close()
    except Exception as e:
        print(f"AVISO: Não foi possível atualizar BD PostgreSQL diretamente no publish_instagram: {e}")


def get_slides(carousel: dict, resolved_dir: Path = None) -> list[Path]:
    d = resolved_dir
    if not d or not d.exists():
        raw_dir = str(carousel.get("slidesDir", ""))
        d = Path(raw_dir)
        if not d.exists():
            cid = carousel.get("id", "")
            storage_dir = BASE_DIR / "storage" / "carousels"
            if storage_dir.exists() and cid:
                for folder in storage_dir.iterdir():
                    if folder.is_dir() and folder.name.startswith(cid):
                        d = folder
                        break

    prefix = carousel.get("slidePrefix", "slide-")
    if not d or not d.exists():
        return []
    return sorted([
        f for f in d.iterdir()
        if f.name.startswith(prefix)
        and f.suffix.lower() in (".jpg", ".jpeg", ".png")
    ])


def list_carousels():
    all_c = read_dashboard()
    print(f"\n{'─'*62}")
    print(f"  {'ID':<20} {'STATUS':<12} {'SLIDES':<8} TITULO")
    print(f"{'─'*62}")
    for c in all_c:
        slides = get_slides(c)
        status = c.get("status", "?")
        icon   = "OK" if status == "publicado" else (">" if status in ("pronto", "aprovado") else "-")
        print(f"  {c['id']:<20} [{icon}] {status:<10} {len(slides):<8} {c['title'][:34]}")
    print(f"{'─'*62}\n")


# ── Publicação via Meta Graph API ─────────────────────────────────────────────

def publish(carousel_id: str, custom_caption: str = "", stories: bool = False, scheduled_time: int = None) -> bool:
    from instagram_publisher import publicar_carrossel

    all_c    = read_dashboard()
    carousel = next((c for c in all_c if c["id"] == carousel_id), None)

    if not carousel:
        print(f"ERRO: Carrossel '{carousel_id}' nao encontrado no dashboard.")
        return False

    raw_dir = str(carousel.get("slidesDir", ""))
    slides_dir = Path(raw_dir)

    if not slides_dir.exists():
        storage_dir = BASE_DIR / "storage" / "carousels"
        if storage_dir.exists():
            for folder in storage_dir.iterdir():
                if folder.is_dir() and folder.name.startswith(carousel_id):
                    slides_dir = folder
                    break

    if not slides_dir.exists():
        print(f"ERRO: Pasta de slides nao encontrada: {slides_dir}")
        return False

    slides = get_slides(carousel, slides_dir)
    if not slides:
        print(f"ERRO: Nenhum slide encontrado em: {slides_dir}")
        return False

    caption = custom_caption or carousel.get("caption", "")
    if not caption and not stories:
        print("AVISO: Caption vazio — publicando sem caption.")

    print(f"\nCarrossel    : {carousel['title'][:55]}")
    print(f"Slides       : {len(slides)}")
    print(f"Pasta        : {slides_dir}")
    print(f"Tipo         : {'STORIES' if stories else ('AGENDAMENTO' if scheduled_time else 'FEED/CARROSSEL')}")

    try:
        if stories:
            from instagram_publisher import publicar_stories
            story_ids = publicar_stories(
                slides_dir = slides_dir,
            )
            print("\nPUBLICADO COM SUCESSO (Stories)")
            try:
                update_status(carousel_id, "publicado", ",".join(story_ids))
                print("Dashboard atualizado -> publicado (Stories)")
            except Exception as ue:
                print(f"AVISO: Nao foi possivel atualizar status local apos publicacao Stories: {ue}")
        else:
            post_id = publicar_carrossel(
                slides_dir = slides_dir,
                caption    = caption,
                scheduled_publish_time = scheduled_time
            )
            new_status = "agendado" if scheduled_time else "publicado"
            print("\nPUBLICADO COM SUCESSO" if not scheduled_time else "\nAGENDADO COM SUCESSO")
            print(f"Post ID: {post_id}")
            try:
                update_status(carousel_id, new_status, str(post_id))
                print(f"Dashboard atualizado -> {new_status} (Feed)")
            except Exception as ue:
                print(f"AVISO: Nao foi possivel atualizar status local apos publicacao: {ue}")
        return True

    except Exception as e:
        print(f"\nERRO ao publicar: {e}")
        import traceback; traceback.print_exc()
        try:
            update_status(carousel_id, "erro-publicacao")
        except Exception:
            pass
        return False


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Publica carrossel/stories no Instagram via Meta API")
    parser.add_argument("--id",       help="ID do carrossel (ex: carrossel-04)")
    parser.add_argument("--caption",  help="Caption customizado", default="")
    parser.add_argument("--stories",  action="store_true", help="Publicar como Stories em vez de Feed")
    parser.add_argument("--schedule", type=int, default=None, help="Timestamp UNIX para agendamento")
    parser.add_argument("--list",     action="store_true", help="Listar carrosseis")
    args = parser.parse_args()

    if args.list:
        list_carousels()
    elif args.id:
        ok = publish(args.id, args.caption, args.stories, args.schedule)
        sys.exit(0 if ok else 1)
    else:
        parser.print_help()
