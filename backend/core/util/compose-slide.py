#!/usr/bin/env python3
"""compose-slide.py — CLI para recompor um slide com novo texto.
Uso: python compose-slide.py --image <path> --title <txt> --body <txt> --layout fullbleed --output <path>
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from core.util.compose_util import compose


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--image",  required=True, help="Caminho para a imagem base (jpg/png)")
    p.add_argument("--title",  required=True, help="Titulo do slide (use \\n para quebra de linha)")
    p.add_argument("--body",   required=True, help="Corpo do slide")
    p.add_argument("--layout", default="fullbleed", choices=["fullbleed", "card", "dramatico", "etereo", "text_only", "brands_cover", "brands_split", "brands_editorial", "brands_outro"])
    p.add_argument("--preset", default="revelacao", help="Nome do preset visual (brands_decoded_principal, brands_decoded_autoral, manuscrito_sagrado, cinematografico, etc.)")
    p.add_argument("--output", required=True, help="Caminho de saida (.jpg)")
    p.add_argument("--title_y", type=str, default=None)
    p.add_argument("--body_y", type=str, default=None)
    p.add_argument("--watermark_pos", default="top_left", choices=["top_left", "top_right", "bottom_left", "bottom_right", "hidden"])
    p.add_argument("--watermark_x", type=str, default=None)
    p.add_argument("--watermark_y", type=str, default=None)
    p.add_argument("--watermark_text", type=str, default=None)
    p.add_argument("--title_px", type=str, default=None)
    p.add_argument("--body_px", type=str, default=None)
    p.add_argument("--text_anchor", type=str, default=None)
    args = p.parse_args()

    # Detectar se é slide de capa (S1) a partir do nome do arquivo
    cover = False
    filename = Path(args.output).name.lower()
    if "slide-01" in filename or "slide-1." in filename:
        cover = True

    # Trata strings vazias/none do CLI
    ty = int(args.title_y) if args.title_y is not None and args.title_y.strip() != "" else None
    by = int(args.body_y) if args.body_y is not None and args.body_y.strip() != "" else None
    wx = int(args.watermark_x) if args.watermark_x is not None and args.watermark_x.strip() != "" else None
    wy = int(args.watermark_y) if args.watermark_y is not None and args.watermark_y.strip() != "" else None
    t_px = int(args.title_px) if args.title_px is not None and args.title_px.strip() != "" else None
    b_px = int(args.body_px) if args.body_px is not None and args.body_px.strip() != "" else None
    w_txt = args.watermark_text if args.watermark_text is not None and args.watermark_text.strip() != "" else None
    anchor = args.text_anchor if args.text_anchor is not None and args.text_anchor.strip() != "" else None

    img_bytes = Path(args.image).read_bytes() if args.layout != "text_only" else None
    result = compose(
        img_bytes=img_bytes,
        title=args.title,
        body=args.body,
        layout=args.layout,
        preset_name=args.preset,
        title_y=ty,
        body_y=by,
        watermark_pos=args.watermark_pos,
        watermark_x=wx,
        watermark_y=wy,
        title_px=t_px,
        body_px=b_px,
        watermark_text=w_txt,
        text_anchor=anchor
    )
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    result.save(str(out), "JPEG", quality=95)
    print(f"OK: {out}")

if __name__ == "__main__":
    main()
