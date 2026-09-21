#!/usr/bin/env python3
"""
oraculo_completo.py — Oráculo Completo: TODOS os posts do @afonteoculta
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Puxa todos os posts publicados no Instagram via Meta Graph API,
incluindo métricas completas de cada um.

Métricas coletadas por post:
  - likes, comments           → campos básicos do media
  - impressions, reach        → insights
  - saved, shares             → insights
  - engagement                → soma das 4 interações acima

Saída: dashboard/data/oraculo_data.json

Uso:
    python oraculo_completo.py           # sincroniza todos os posts
    python oraculo_completo.py --report  # imprime relatório no terminal
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
IG_USER_ID   = os.getenv("INSTAGRAM_ACCOUNT_ID")
API_VERSION  = "v25.0"
BASE_URL     = f"https://graph.facebook.com/{API_VERSION}"

ORACULO_FILE = Path("C:/Users/julia/nano-banana-mcp/dashboard/data/oraculo_data.json")
ORACULO_FILE.parent.mkdir(parents=True, exist_ok=True)


# ── Helpers ────────────────────────────────────────────────────────────────────

def read_oraculo() -> dict:
    try:
        return json.loads(ORACULO_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {"posts": [], "last_sync": None, "total_posts": 0}

def write_oraculo(data: dict):
    ORACULO_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ── Fetch de posts ─────────────────────────────────────────────────────────────

def fetch_all_media(limit_per_page: int = 50) -> list[dict]:
    """
    Retorna lista de todos os posts do @afonteoculta via paginação.
    Campos básicos: id, caption, media_type, timestamp, permalink, like_count, comments_count
    """
    posts = []
    url = f"{BASE_URL}/{IG_USER_ID}/media"
    params = {
        "fields":       "id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count",
        "limit":        limit_per_page,
        "access_token": ACCESS_TOKEN,
    }

    page = 1
    while url:
        print(f"  Buscando pagina {page}...", end=" ", flush=True)
        r = requests.get(url, params=params if page == 1 else None, timeout=20)
        data = r.json()

        if "error" in data:
            print(f"\n  ERRO na API: {data['error'].get('message', data['error'])}")
            break

        batch = data.get("data", [])
        posts.extend(batch)
        print(f"{len(batch)} posts")

        # Paginacao
        next_url = data.get("paging", {}).get("next")
        url = next_url
        params = None  # next_url ja tem os params embutidos
        page += 1

        if next_url:
            time.sleep(0.5)  # respeita rate limit

    return posts


def _parse_insights_response(data: dict) -> dict:
    result = {}
    if "data" in data:
        for item in data["data"]:
            name = item["name"]
            if "value" in item:
                result[name] = item["value"]
            elif item.get("values"):
                result[name] = item["values"][0].get("value", 0)
    return result


def fetch_insights(media_id: str, debug: bool = False) -> dict:
    """
    Busca insights de um post. Faz dois requests:
    1. Métricas principais (funcionam para todos os tipos)
    2. follows separado (só funciona para Reels — ignora erro silenciosamente)
    """
    # Request 1: métricas principais
    r = requests.get(
        f"{BASE_URL}/{media_id}/insights",
        params={
            "metric":       "reach,saved,total_interactions,shares",
            "access_token": ACCESS_TOKEN,
        },
        timeout=15,
    )
    data = r.json()
    if debug:
        print(f"\n    [DEBUG insights] {data}")
    if "error" in data:
        return {}
    result = _parse_insights_response(data)

    # Request 2: follows (só Reels suportam — ignora erro silenciosamente)
    r2 = requests.get(
        f"{BASE_URL}/{media_id}/insights",
        params={
            "metric":       "follows",
            "access_token": ACCESS_TOKEN,
        },
        timeout=15,
    )
    data2 = r2.json()
    if "error" not in data2:
        result.update(_parse_insights_response(data2))

    return result


def enrich_post(post: dict) -> dict:
    """Combina campos basicos + insights em um registro completo."""
    media_id = post["id"]
    insights = fetch_insights(media_id)

    likes              = post.get("like_count", 0) or 0
    comments           = post.get("comments_count", 0) or 0
    saved              = insights.get("saved", 0) or 0
    shares             = insights.get("shares", 0) or 0
    reach              = insights.get("reach", 0) or 0
    follows            = insights.get("follows", 0) or 0
    total_interactions = insights.get("total_interactions", 0) or 0
    engagement         = likes + comments + saved + shares

    # Caption: primeiros 120 chars
    caption_raw = post.get("caption", "") or ""
    caption_short = caption_raw[:120] + ("..." if len(caption_raw) > 120 else "")

    return {
        "media_id":      media_id,
        "permalink":     post.get("permalink", ""),
        "media_type":    post.get("media_type", ""),
        "product_type":  post.get("media_product_type", ""),
        "published_at":  post.get("timestamp", ""),
        "caption":       caption_short,
        "caption_full":  caption_raw,
        "likes":              likes,
        "comments":           comments,
        "reach":              reach,
        "saved":              saved,
        "shares":             shares,
        "follows":            follows,
        "total_interactions": total_interactions,
        "engagement":         engagement,
        "updated_at":    datetime.now().strftime("%Y-%m-%d %H:%M"),
    }


# ── Sincronizacao principal ────────────────────────────────────────────────────

def sincronizar(verbose: bool = True) -> dict:
    """
    Puxa todos os posts do Instagram, enriquece com insights,
    salva em oraculo_data.json.
    Retorna o dict salvo.
    """
    if not ACCESS_TOKEN or not IG_USER_ID:
        raise ValueError("META_ACCESS_TOKEN ou INSTAGRAM_ACCOUNT_ID nao encontrados no .env")

    line = "=" * 62
    if verbose:
        print(f"\n{line}")
        print("  ORACULO COMPLETO — @afonteoculta")
        print("  Sincronizando todos os posts...")
        print(f"{line}\n")

    # 1. Busca todos os media IDs
    raw_posts = fetch_all_media()
    if verbose:
        print(f"\n  Total de posts encontrados: {len(raw_posts)}\n")
        print("  Buscando insights (1 post por vez)...")

    # 2. Enriquece com insights
    enriched = []
    errors = 0
    for i, post in enumerate(raw_posts, 1):
        if verbose:
            print(f"  [{i:02d}/{len(raw_posts)}] {post['id']} {post.get('timestamp','')[:10]}...", end=" ", flush=True)
        try:
            ep = enrich_post(post)
            enriched.append(ep)
            if verbose:
                print(f"likes={ep['likes']} comments={ep['comments']} saved={ep['saved']} reach={ep['reach']}")
        except Exception as e:
            errors += 1
            if verbose:
                print(f"ERRO: {e}")
        time.sleep(0.3)  # rate limit gentil

    # 3. Ordena por engajamento decrescente
    enriched.sort(key=lambda p: p["engagement"], reverse=True)

    # 4. Calcula totais
    total_likes       = sum(p["likes"] for p in enriched)
    total_comments    = sum(p["comments"] for p in enriched)
    total_saved       = sum(p["saved"] for p in enriched)
    total_shares      = sum(p["shares"] for p in enriched)
    total_reach       = sum(p["reach"] for p in enriched)
    total_follows     = sum(p["follows"] for p in enriched)
    total_engagement  = sum(p["engagement"] for p in enriched)

    oraculo = {
        "last_sync":          datetime.now().strftime("%Y-%m-%d %H:%M"),
        "total_posts":        len(enriched),
        "errors":             errors,
        "totals": {
            "likes":          total_likes,
            "comments":       total_comments,
            "saved":          total_saved,
            "shares":         total_shares,
            "reach":          total_reach,
            "follows":        total_follows,
            "engagement":     total_engagement,
        },
        "posts": enriched,
    }

    write_oraculo(oraculo)

    if verbose:
        print(f"\n{line}")
        print("  SYNC CONCLUIDO")
        print(f"  Posts: {len(enriched)} | Erros: {errors}")
        print(f"  Likes totais:       {total_likes:>10,}")
        print(f"  Comentarios totais: {total_comments:>10,}")
        print(f"  Salvamentos totais: {total_saved:>10,}")
        print(f"  Shares totais:      {total_shares:>10,}")
        print(f"  Alcance total:      {total_reach:>10,}")
        print(f"  Seguidores ganhos:  {total_follows:>10,}")
        print(f"  Salvo em: {ORACULO_FILE}")
        print(f"{line}\n")

    return oraculo


# ── Relatorio terminal ─────────────────────────────────────────────────────────

def print_report():
    data = read_oraculo()
    posts = data.get("posts", [])

    if not posts:
        print("Nenhum dado encontrado. Rode primeiro sem --report.")
        return

    line = "=" * 80
    print(f"\n{line}")
    print(f"  ORACULO — @afonteoculta | Ultima sync: {data.get('last_sync','—')}")
    print(f"  Total de posts: {data.get('total_posts', 0)}")
    print(f"{line}")
    print(f"  {'CAPTION':<38} {'LIKES':>6} {'COMT':>5} {'SALV':>5} {'SHAR':>5} {'ALCNC':>7} {'ENG':>6}")
    print(f"{'─'*80}")

    for p in posts[:25]:  # top 25
        caption = (p.get("caption","") or "")[:37]
        print(
            f"  {caption:<38} "
            f"{p.get('likes',0):>6} "
            f"{p.get('comments',0):>5} "
            f"{p.get('saved',0):>5} "
            f"{p.get('shares',0):>5} "
            f"{p.get('reach',0):>7,} "
            f"{p.get('engagement',0):>6}"
        )

    t = data.get("totals", {})
    print(f"{'─'*80}")
    print(f"  {'TOTAIS':<38} {t.get('likes',0):>6} {t.get('comments',0):>5} "
          f"{t.get('saved',0):>5} {t.get('shares',0):>5} {t.get('reach',0):>7,}")
    print(f"{line}\n")


# ── CLI ────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Oraculo Completo — todos os posts do Instagram")
    parser.add_argument("--report", action="store_true", help="Mostra relatorio sem sincronizar")
    args = parser.parse_args()

    if args.report:
        print_report()
    else:
        sincronizar()
        print_report()
