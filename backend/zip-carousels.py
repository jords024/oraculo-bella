#!/usr/bin/env python3
"""
zip-carousels.py — Empacota slides de um ou mais carrosséis em um arquivo ZIP.
Uso: python zip-carousels.py --data '[{...}]' --output caminho/saida.zip
"""
import argparse
import json
import os
import re
import sys
import zipfile


def sanitize(name: str, max_len: int = 40) -> str:
    """Remove caracteres inválidos para nome de pasta no ZIP."""
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', name)
    name = name.strip('. ')
    return name[:max_len] or "carrossel"

def main():
    parser = argparse.ArgumentParser(description="Cria ZIP de carrosséis Fonte Oculta")
    parser.add_argument("--data",   required=True, help="JSON com lista de carrosséis")
    parser.add_argument("--output", required=True, help="Caminho do arquivo ZIP de saída")
    args = parser.parse_args()

    try:
        carousels = json.loads(args.data)
    except json.JSONDecodeError as e:
        print(f"ERRO: JSON inválido — {e}", file=sys.stderr)
        sys.exit(1)

    total_added = 0
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    with zipfile.ZipFile(args.output, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for c in carousels:
            folder   = sanitize(c.get("title") or c.get("id") or "carrossel")
            slides_dir = c.get("slidesDir", "")
            slides   = c.get("slides", [])

            if not slides_dir or not os.path.isdir(slides_dir):
                print(f"AVISO: pasta não encontrada para '{folder}' — {slides_dir}", file=sys.stderr)
                continue

            for slide in slides:
                img_path = os.path.join(slides_dir, slide)
                if os.path.exists(img_path):
                    arcname = f"{folder}/{slide}"
                    zf.write(img_path, arcname)
                    total_added += 1
                else:
                    print(f"AVISO: imagem não encontrada — {img_path}", file=sys.stderr)

    if total_added == 0:
        print("ERRO: nenhuma imagem foi encontrada para zipar", file=sys.stderr)
        sys.exit(1)

    size_kb = os.path.getsize(args.output) // 1024
    print(f"OK:{total_added} slides:{size_kb}KB")

if __name__ == "__main__":
    main()
