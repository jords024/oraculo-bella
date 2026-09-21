#!/usr/bin/env python3
"""
publisher.py — Publicador Automático de Carrosseis
Roda 3x/dia (09h, 13h, 20h) via Windows Task Scheduler.
Lê o slot do horário atual no Notion → publica no Instagram → atualiza status.

USO:
    python publisher.py              → publica o slot do horário atual
    python publisher.py --horario 09h00  → força um horário específico
    python publisher.py --data 2026-04-10 --horario 13h00
    python publisher.py --dry-run    → simula sem publicar
"""
import argparse
import json
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).parent))

# ── ACESSO AO BANCO LOCAL (DASHBOARD) ─────────────────────────────────────────
DATA_FILE = Path(__file__).parent / "dashboard" / "data" / "carousels.json"

def carregar_banco():
    if not DATA_FILE.exists():
        return []
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except:
        return []

def salvar_banco(dados):
    DATA_FILE.write_text(json.dumps(dados, indent=2, ensure_ascii=False), encoding="utf-8")

def proximo_slot_local(data_str=None, horario=None):
    todos = carregar_banco()
    agora = datetime.now()

    # Se recebermos data e horario, busca exato (modo legado)
    if data_str and horario:
        for c in todos:
            if c.get("scheduledDate") == data_str and c.get("scheduledTime") == horario and c.get("status") in ["pronto", "aprovado"]:
                return c
        return None

    # Modo Cron (Busca qualquer post pendente cujo horário já passou)
    for c in todos:
        if c.get("status") in ["pronto", "aprovado"] and c.get("scheduledDate") and c.get("scheduledTime"):
            try:
                # Converter scheduledDate e scheduledTime para datetime
                # scheduledTime vem no formato HH:MM ou HHhMM
                t_str = c["scheduledTime"].replace('h', ':')
                dt_str = f"{c['scheduledDate']} {t_str}"
                dt_agendado = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")

                if agora >= dt_agendado:
                    return c
            except Exception as e:
                print(f"Erro ao parsear data de {c.get('id')}: {e}")
                pass
    return None

def atualizar_status_local(carousel_id, status):
    todos = carregar_banco()
    for c in todos:
        if c.get("id") == carousel_id:
            c["status"] = status
            if status == "publicado":
                c["publishedAt"] = datetime.now().isoformat()
            break
    salvar_banco(todos)

# ── CONFIG ────────────────────────────────────────────────────────────────────
META_TOKEN  = os.getenv("META_ACCESS_TOKEN")
IG_ACCOUNT  = os.getenv("INSTAGRAM_ACCOUNT_ID")

HORARIO_MAP = {
    "09": "09h00",
    "13": "13h00",
    "20": "20h00",
}

# ── UPLOAD IMAGEM → MINIO ─────────────────────────────────────────────────────
def upload_to_minio(img_path: Path) -> str:
    """Faz upload da imagem para MinIO e retorna a URL pública."""
    from infra.uploaders.minio_uploader import upload_image
    return upload_image(img_path)

# Aliases de compatibilidade
upload_to_b2 = upload_to_minio
upload_imgbb = upload_to_minio

# ── PUBLICAR CARROSSEL → INSTAGRAM GRAPH API ──────────────────────────────────
def publicar_instagram(slides_dir: str, caption: str, dry_run: bool = False) -> str:
    """
    Publica carrossel no Instagram via Graph API.
    Retorna o media_id publicado.
    """
    import urllib.parse

    d = Path(slides_dir)
    if not d.exists():
        raise FileNotFoundError(f"Pasta não encontrada: {slides_dir}")

    # Coletar slides ordenados
    slides = sorted([
        f for f in d.iterdir()
        if f.suffix.lower() in (".jpg", ".jpeg", ".png")
        and not f.name.startswith(".")
    ])

    if not slides:
        raise FileNotFoundError(f"Nenhum slide encontrado em {slides_dir}")

    print(f"    Slides encontrados: {len(slides)}")

    if dry_run:
        print(f"    [DRY RUN] Simulando upload de {len(slides)} slides")
        print(f"    [DRY RUN] Caption: {caption[:80]}...")
        return "DRY_RUN_MEDIA_ID"

    # 1. Upload cada slide para Backblaze B2 e criar container
    container_ids = []
    for i, slide in enumerate(slides, 1):
        print(f"    [{i}/{len(slides)}] Upload {slide.name}...")
        img_url = upload_to_b2(slide)

        # Criar container de imagem no Instagram
        params = urllib.parse.urlencode({
            "image_url":   img_url,
            "is_carousel_item": "true",
            "access_token": META_TOKEN,
        })
        req = urllib.request.Request(
            f"https://graph.facebook.com/v18.0/{IG_ACCOUNT}/media?{params}",
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        if "id" not in resp:
            raise RuntimeError(f"Erro ao criar container: {resp}")
        container_ids.append(resp["id"])
        time.sleep(1)

    print(f"    Containers criados: {len(container_ids)}")

    # 2. Criar container do carrossel
    params = urllib.parse.urlencode({
        "media_type":   "CAROUSEL",
        "children":     ",".join(container_ids),
        "caption":      caption,
        "access_token": META_TOKEN,
    })
    req = urllib.request.Request(
        f"https://graph.facebook.com/v18.0/{IG_ACCOUNT}/media?{params}",
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read())
    carousel_container_id = resp.get("id")
    if not carousel_container_id:
        raise RuntimeError(f"Erro ao criar carrossel: {resp}")

    print(f"    Container do carrossel: {carousel_container_id}")
    time.sleep(3)

    # 3. Publicar
    params = urllib.parse.urlencode({
        "creation_id":  carousel_container_id,
        "access_token": META_TOKEN,
    })
    req = urllib.request.Request(
        f"https://graph.facebook.com/v18.0/{IG_ACCOUNT}/media_publish?{params}",
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read())

    media_id = resp.get("id")
    if not media_id:
        raise RuntimeError(f"Erro ao publicar: {resp}")

    return str(media_id)

# ── GERAR CAPTION AUTOMÁTICA ──────────────────────────────────────────────────
def gerar_caption(props: dict) -> str:
    """Gera caption padrão se não houver uma customizada."""
    if props.get("caption"):
        return props["caption"]

    praca_emoji = {
        "MENTE":    "🧠",
        "SISTEMA":  "⚙️",
        "CORPO":    "⚡",
        "ESPÍRITO": "🌌",
        "ALAVANCA": "🚀",
    }
    emoji = praca_emoji.get(props.get("praca", ""), "✨")
    return (
        f"{emoji} Salva esse carrossel — você vai querer rever.\n\n"
        f"Siga @afonteoculta para mais conteúdos que expandem sua consciência.\n\n"
        f"#fonteoculta #consciencia #espiritualidade #desperta #frequencia"
    )

# ── EXECUTAR ──────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Publisher — Fonte Oculta")
    parser.add_argument("--horario", default=None, help="09h00 | 13h00 | 20h00")
    parser.add_argument("--data",    default=None, help="YYYY-MM-DD (padrão: hoje)")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem publicar")
    args = parser.parse_args()

    agora    = datetime.now()
    data_str = args.data or date.today().isoformat()

    # Determinar horário
    if args.horario:
        horario = args.horario
    else:
        # Se não forneceu data/horario, entra em modo Cron automático
        horario = None
        data_str = None

    print(f"\n{'='*56}")
    print("  PUBLISHER — Fonte Oculta")
    print(f"  Data: {data_str} | Horário: {horario}")
    if args.dry_run:
        print("  [DRY RUN ativado]")
    print(f"{'='*56}\n")

    # Buscar slot local (Dashboard)
    c = proximo_slot_local(data_str, horario)
    if not c:
        if horario:
            print(f"  Nenhum carrossel agendado para {data_str} às {horario}.")
        else:
            print("  Nenhum carrossel pendente e atrasado/no horário encontrado.")
        print("  Agende no dashboard local.\n")
        sys.exit(0)

    props = {
        "titulo": c.get("title", ""),
        "praca": c.get("praca", ""),
        "formato": c.get("format", ""),
        "carousel_id": c.get("id", ""),
        "slides_dir": c.get("slidesDir", ""),
        "caption": c.get("caption", ""),
    }

    print(f"  Post: {props['titulo']}")
    print(f"  Praça: {props['praca']} | Formato: {props['formato']}")
    print(f"  Carrossel: {props['carousel_id']}")
    print(f"  Slides em: {props['slides_dir']}\n")

    if not props["slides_dir"]:
        print("  ❌ Slides Dir não definido.")
        sys.exit(1)

    # Marcar como Publicando
    if not args.dry_run:
        atualizar_status_local(props["carousel_id"], "publicando")

    caption = gerar_caption(props)
    print(f"  Caption ({len(caption)} chars): {caption[:80]}...\n")

    try:
        media_id = publicar_instagram(props["slides_dir"], caption, args.dry_run)
        print(f"\n  ✅ Publicado! Media ID: {media_id}")

        if not args.dry_run:
            atualizar_status_local(props["carousel_id"], "publicado")
            print("  ✅ Banco local atualizado → Publicado")

    except Exception as e:
        print(f"\n  ❌ Erro: {e}")
        if not args.dry_run:
            atualizar_status_local(props["carousel_id"], "erro")
        sys.exit(1)

    print(f"\n{'='*56}\n")

if __name__ == "__main__":
    main()
