#!/usr/bin/env python3
"""
oraculo_metrics.py — Oráculo: Métricas reais do Instagram por carrossel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Busca métricas reais via Meta Graph API e atualiza o dashboard.

Métricas por post:
  - impressions   → quantas vezes foi exibido
  - reach         → quantas contas únicas viram
  - likes         → curtidas
  - comments      → comentários
  - shares        → compartilhamentos
  - saved         → salvamentos
  - engagement    → soma de interações
  - plays         → (vídeos) reproduções

Uso:
    python oraculo_metrics.py                  # atualiza todos os publicados
    python oraculo_metrics.py --id carrossel-19  # atualiza um específico
    python oraculo_metrics.py --report           # imprime relatório no terminal
"""

import argparse
import json
import os
import sys
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
DATA_FILE    = Path("C:/Users/julia/nano-banana-mcp/dashboard/data/carousels.json")

METRICS_FIELDS = "like_count,comments_count,timestamp,media_type,media_product_type,permalink"
INSIGHTS_METRICS = "impressions,reach,saved,shares_count"


# ── Helpers ───────────────────────────────────────────────────────────────────

def read_dashboard() -> list:
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def write_dashboard(data: list):
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# ── Fetch de métricas ─────────────────────────────────────────────────────────

def fetch_media_basic(media_id: str) -> dict:
    """Busca campos básicos do post (likes, comments, permalink)."""
    r = requests.get(
        f"{BASE_URL}/{media_id}",
        params={
            "fields":       METRICS_FIELDS,
            "access_token": ACCESS_TOKEN,
        },
        timeout=15,
    )
    return r.json()


def fetch_media_insights(media_id: str) -> dict:
    """Busca insights do post (impressões, alcance, salvamentos, compartilhamentos)."""
    r = requests.get(
        f"{BASE_URL}/{media_id}/insights",
        params={
            "metric":       INSIGHTS_METRICS,
            "access_token": ACCESS_TOKEN,
        },
        timeout=15,
    )
    data = r.json()
    result = {}
    if "data" in data:
        for item in data["data"]:
            result[item["name"]] = item["values"][0]["value"] if item.get("values") else item.get("value", 0)
    return result


def fetch_all_metrics(media_id: str) -> dict:
    """Combina métricas básicas + insights em um único dict."""
    basic    = fetch_media_basic(media_id)
    insights = fetch_media_insights(media_id)

    if "error" in basic:
        return {"error": basic["error"].get("message", "Erro desconhecido")}

    return {
        "media_id":    media_id,
        "permalink":   basic.get("permalink", ""),
        "media_type":  basic.get("media_type", ""),
        "published_at": basic.get("timestamp", ""),
        "likes":       basic.get("like_count", 0),
        "comments":    basic.get("comments_count", 0),
        "impressions": insights.get("impressions", 0),
        "reach":       insights.get("reach", 0),
        "saved":       insights.get("saved", 0),
        "shares":      insights.get("shares_count", 0),
        "engagement":  (
            basic.get("like_count", 0) +
            basic.get("comments_count", 0) +
            insights.get("saved", 0) +
            insights.get("shares_count", 0)
        ),
        "updated_at":  datetime.now().strftime("%Y-%m-%d %H:%M"),
    }


# ── Atualização do dashboard ──────────────────────────────────────────────────

def update_carousel_metrics(carousel_id: str = None) -> list:
    """
    Atualiza métricas no dashboard para carrosseis publicados.
    Se carousel_id for None, atualiza todos os publicados.
    """
    all_c   = read_dashboard()
    updated = []

    targets = [c for c in all_c if c.get("status") == "publicado"]
    if carousel_id:
        targets = [c for c in targets if c["id"] == carousel_id]

    if not targets:
        print("Nenhum carrossel publicado encontrado para atualizar.")
        return []

    for c in targets:
        media_id = c.get("instagramMediaId")
        if not media_id:
            print(f"  [{c['id']}] Sem media_id — pulando.")
            continue

        print(f"  Buscando metricas: {c['id']} ({c['title'][:40]})...")
        metrics = fetch_all_metrics(media_id)

        if "error" in metrics:
            print(f"    ERRO: {metrics['error']}")
            continue

        # Salva métricas no carousel
        c["metrics"] = metrics
        updated.append(c["id"])

        print(f"    Likes: {metrics['likes']} | "
              f"Comentarios: {metrics['comments']} | "
              f"Alcance: {metrics['reach']} | "
              f"Impressoes: {metrics['impressions']} | "
              f"Salvamentos: {metrics['saved']} | "
              f"Shares: {metrics['shares']}")

    write_dashboard(all_c)
    return updated


# ── Relatório terminal ────────────────────────────────────────────────────────

def print_report():
    """Imprime relatório completo de performance no terminal."""
    all_c     = read_dashboard()
    publicados = [c for c in all_c if c.get("status") == "publicado" and c.get("metrics")]

    if not publicados:
        print("Nenhum carrossel com metricas encontrado. Rode sem --report primeiro.")
        return

    # Ordena por engajamento
    publicados.sort(key=lambda c: c["metrics"].get("engagement", 0), reverse=True)

    line = "=" * 72
    print(f"\n{line}")
    print("  ORACULO — PERFORMANCE DOS CARROSSEIS @afonteoculta")
    print(f"  Atualizado: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print(f"{line}")
    print(f"  {'TITULO':<38} {'LIKES':>6} {'COMENT':>6} {'ALCANCE':>8} {'SALV':>6} {'ENG':>6}")
    print(f"{'─'*72}")

    total_reach = total_eng = total_likes = total_comments = 0

    for c in publicados:
        m = c["metrics"]
        title = c["title"][:37]
        print(f"  {title:<38} "
              f"{m.get('likes',0):>6} "
              f"{m.get('comments',0):>6} "
              f"{m.get('reach',0):>8} "
              f"{m.get('saved',0):>6} "
              f"{m.get('engagement',0):>6}")
        total_reach    += m.get("reach", 0)
        total_eng      += m.get("engagement", 0)
        total_likes    += m.get("likes", 0)
        total_comments += m.get("comments", 0)

    print(f"{'─'*72}")
    print(f"  {'TOTAIS':<38} {total_likes:>6} {total_comments:>6} {total_reach:>8}")
    print(f"\n  Posts publicados: {len(publicados)}")
    if publicados:
        print(f"  Melhor engajamento: {publicados[0]['title'][:50]}")
        print(f"  Media de alcance: {total_reach // len(publicados):,}")
    print(f"{line}\n")


# ── API para o dashboard web ──────────────────────────────────────────────────

def get_metrics_summary() -> list:
    """Retorna lista de métricas para a API do dashboard."""
    all_c = read_dashboard()
    result = []
    for c in all_c:
        if c.get("metrics"):
            result.append({
                "id":     c["id"],
                "title":  c["title"],
                "status": c["status"],
                **c["metrics"],
            })
    return result


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Oraculo — Metricas reais do Instagram")
    parser.add_argument("--id",     help="Atualizar carrossel especifico")
    parser.add_argument("--report", action="store_true", help="Imprimir relatorio no terminal")
    args = parser.parse_args()

    if args.report:
        print_report()
    else:
        print("\nOraculo — Atualizando metricas...\n")
        updated = update_carousel_metrics(args.id)
        print(f"\n{len(updated)} carrosseis atualizados.")
        if updated:
            print_report()
