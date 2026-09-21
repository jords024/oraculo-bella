#!/usr/bin/env python3
"""
pipeline_haucacau.py — Pipeline completo HauCacau
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Orquestra: copywriter → revisor → canalizador visual → geração de imagem → composição

USO:
    python core/agentes/pipeline_haucacau.py
    python core/agentes/pipeline_haucacau.py --data '{"tema":"...","universo":2,"avatar":"B"}'

Saída (JSON lines para stdout):
    {"type":"start",  "total":11, "titulo":"..."}
    {"type":"slide",  "num":1, "estado":"GANCHO", "status":"gerando"}
    {"type":"slide",  "num":1, "estado":"GANCHO", "status":"ok", "file":"..."}
    {"type":"done",   "id":"hau-carrossel-46", "dir":"...", "total_ok":10}
    {"type":"error",  "msg":"..."}
"""

import argparse
import json
import os
import random
import re
import sys
import time
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

IS_WIN = sys.platform == "win32"

def _print(data: dict):
    print(json.dumps(data, ensure_ascii=False), flush=True)

def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower().strip())[:40]

def run_pipeline(tema: str, universo: int = 2, avatar: str = "A",
                 ancora: str = "", headless: bool = True):

    from core.agentes.copywriter_haucacau import gerar_copy_haucacau

    # ── 1. Gera copy ──────────────────────────────────────────────────────────
    _print({"type": "log", "msg": "Gerando copy..."})
    try:
        data = gerar_copy_haucacau(tema, universo, avatar, ancora)
    except Exception as e:
        _print({"type": "error", "msg": f"Copywriter falhou: {e}"})
        return

    titulo   = data.get("titulo_carrossel", tema)
    slides   = data.get("slides", [])
    carousel_id = f"hau-{date.today().strftime('%Y%m%d')}-{_slug(titulo)}"

    _print({"type": "start", "total": len(slides), "titulo": titulo, "id": carousel_id})

    # ── 2. Cria diretório de saída ────────────────────────────────────────────
    if IS_WIN:
        out_dir = ROOT / "carousels" / carousel_id
    else:
        out_dir = Path("/tmp") / carousel_id
    out_dir.mkdir(parents=True, exist_ok=True)

    # Salva copy JSON
    (out_dir / "copy.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # ── 3. Gera imagens e compõe slides ──────────────────────────────────────
    total_ok = 0
    for slide in slides:
        num     = slide["num"]
        estado  = slide["estado"]
        layout  = slide.get("layout", "fullbleed")
        prompt  = slide.get("prompt_imagem")

        _print({"type": "slide", "num": num, "estado": estado, "status": "gerando"})

        try:
            slide_file = compor_slide(slide, out_dir, num)
            _print({"type": "slide", "num": num, "estado": estado,
                    "status": "ok", "file": str(slide_file)})
            total_ok += 1
        except Exception as e:
            _print({"type": "slide", "num": num, "estado": estado,
                    "status": "erro", "msg": str(e)})

        time.sleep(random.uniform(1.5, 3))

    # ── 4. Registra no dashboard ──────────────────────────────────────────────
    if IS_WIN:
        try:
            _registrar(carousel_id, titulo, data, out_dir)
        except Exception as e:
            _print({"type": "log", "msg": f"Registro local falhou: {e}"})

    _print({"type": "done", "id": carousel_id, "dir": str(out_dir), "total_ok": total_ok})


def compor_slide(slide: dict, out_dir: Path, num: int) -> Path:
    """Gera a imagem e compõe o slide com Pillow."""
    from PIL import Image, ImageDraw, ImageFont

    W, H = 1080, 1350
    layout = slide.get("layout", "fullbleed")
    titulo = slide.get("titulo", "")
    corpo  = slide.get("corpo", "")

    # ── Tenta gerar imagem via IA ──────────────────────────────────────────
    img_bg = None
    prompt = slide.get("prompt_imagem")
    if prompt and layout != "text_only":
        try:
            img_bg = _gerar_imagem(prompt, W, H)
        except Exception as e:
            _print({"type": "log", "msg": f"  Imagem S{num}: {e} — usando fundo sólido"})

    # ── Cria canvas ───────────────────────────────────────────────────────
    if img_bg:
        canvas = img_bg.convert("RGBA").resize((W, H))
    else:
        # Fundo padrão HauCacau: marrom cacau quente
        canvas = Image.new("RGBA", (W, H), (59, 31, 14, 255))

    draw = ImageDraw.Draw(canvas)

    # ── Overlay gradiente ─────────────────────────────────────────────────
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    for y in range(H // 2, H):
        alpha = int(180 * (y - H // 2) / (H // 2))
        ov_draw.rectangle([(0, y), (W, y)], fill=(0, 0, 0, alpha))
    canvas = Image.alpha_composite(canvas, overlay)
    draw = ImageDraw.Draw(canvas)

    # ── Tipografia ────────────────────────────────────────────────────────
    FD = Path("C:/Windows/Fonts") if IS_WIN else Path("/usr/share/fonts/truetype")
    FONT_TITLE = _find_font(FD, ["arialbd.ttf", "DejaVuSans-Bold.ttf", "NotoSans-Bold.ttf"])
    FONT_BODY  = _find_font(FD, ["arial.ttf",   "DejaVuSans.ttf",      "NotoSans-Regular.ttf"])

    WHITE     = (255, 255, 255, 255)
    AMBER     = (196, 122, 43, 255)
    CREAM     = (245, 230, 200, 220)

    # Número do slide (topo esquerdo)
    num_font = ImageFont.truetype(str(FONT_BODY), 22) if FONT_BODY else ImageFont.load_default()
    draw.text((40, 40), f"{num:02d} / {slide.get('total', 11)}", font=num_font, fill=AMBER[:3] + (180,))

    # Título
    title_font = ImageFont.truetype(str(FONT_TITLE), 62) if FONT_TITLE else ImageFont.load_default()
    lines = titulo.split("\n") if "\n" in titulo else _wrap(titulo, 28)
    y_title = H - 520
    for line in lines[:4]:
        draw.text((60, y_title), line, font=title_font, fill=WHITE)
        y_title += 72

    # Corpo
    body_font = ImageFont.truetype(str(FONT_BODY), 30) if FONT_BODY else ImageFont.load_default()
    body_lines = []
    for par in corpo.split("\n"):
        body_lines.extend(_wrap(par.strip(), 48) or [""])
    y_body = y_title + 20
    for line in body_lines[:12]:
        draw.text((60, y_body), line, font=body_font, fill=CREAM)
        y_body += 40
        if y_body > H - 80:
            break

    # Logo / marca d'água
    draw.text((W - 180, H - 50), "HauCacau", font=num_font, fill=AMBER[:3] + (120,))

    # Salva
    out = out_dir / f"slide_{num:02d}.png"
    canvas.convert("RGB").save(str(out), "PNG", quality=95)
    return out


def _gerar_imagem(prompt: str, w: int, h: int):
    """Gera imagem via OpenAI DALL-E 3."""
    import base64
    from io import BytesIO

    from openai import OpenAI
    from PIL import Image

    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise ValueError("OPENAI_API_KEY não encontrada")

    client = OpenAI(api_key=key)
    r = client.images.generate(
        model="dall-e-3",
        prompt=f"{prompt}\n\nStyle: warm editorial photography, amber and terracotta tones, no text, Instagram 4:5 format",
        size="1024x1024",
        quality="standard",
        n=1,
    )
    item = r.data[0]
    if hasattr(item, "b64_json") and item.b64_json:
        img_data = base64.b64decode(item.b64_json)
    elif hasattr(item, "url") and item.url:
        import urllib.request
        req = urllib.request.Request(item.url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as res:
            img_data = res.read()
    else:
        raise ValueError("Formato de imagem não reconhecido na resposta da OpenAI")
    return Image.open(BytesIO(img_data))


def _wrap(text: str, width: int) -> list[str]:
    words = text.split()
    lines, current = [], ""
    for w in words:
        if len(current) + len(w) + 1 <= width:
            current += (" " if current else "") + w
        else:
            if current: lines.append(current)
            current = w
    if current: lines.append(current)
    return lines or [""]


def _find_font(fd: Path, names: list[str]):
    for name in names:
        p = fd / name
        if p.exists():
            return p
    return None


def _registrar(carousel_id: str, titulo: str, data: dict, out_dir: Path):
    """Registra o carrossel no carousels.json do dashboard."""
    carousel_file = ROOT / "dashboard" / "data" / "carousels.json"
    try:
        carousels = json.loads(carousel_file.read_text(encoding="utf-8"))
        if isinstance(carousels, dict):
            carousels = list(carousels.values())
    except Exception:
        carousels = []

    slides_data = data.get("slides", [])
    entry = {
        "id":          carousel_id,
        "projeto":     "haucacau",
        "titulo":      titulo,
        "universo":    data.get("universo", 2),
        "avatar":      data.get("avatar", "A"),
        "cta_palavra": data.get("cta_palavra", ""),
        "caption":     data.get("caption", ""),
        "status":      "gerado",
        "slides":      [
            {"num": s["num"], "estado": s["estado"],
             "titulo": s["titulo"], "arquivo": f"slide_{s['num']:02d}.png"}
            for s in slides_data
        ],
        "dir":         str(out_dir),
        "criado_em":   date.today().isoformat(),
    }
    carousels.append(entry)
    carousel_file.write_text(json.dumps(carousels, ensure_ascii=False, indent=2), encoding="utf-8")


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline HauCacau")
    parser.add_argument("--data", type=str, help="JSON com tema, universo, avatar, ancora")
    args = parser.parse_args()

    if args.data:
        params = json.loads(args.data)
        run_pipeline(
            tema=params.get("tema", ""),
            universo=int(params.get("universo", 2)),
            avatar=params.get("avatar", "A"),
            ancora=params.get("ancora", ""),
        )
    else:
        print("\n  Pipeline HauCacau")
        print("  " + "─" * 38)
        tema     = input("  Tema: ").strip()
        universo = int(input("  Universo (1-6, default 2): ").strip() or "2")
        avatar   = input("  Avatar (A/B/C/D, default A): ").strip().upper() or "A"
        ancora   = input("  Âncora (opcional): ").strip()
        run_pipeline(tema, universo, avatar, ancora)
