#!/usr/bin/env python3
import argparse
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont


def parse_px(value, default=32):
    """Converte string de tamanho como '40px' ou '40' para inteiro."""
    if not value:
        return default
    try:
        return int(str(value).replace('px', '').replace('pt', '').strip())
    except:
        return default


def load_font(size):
    """Carrega a melhor fonte disponível no tamanho especificado."""
    try:
        if sys.platform == "win32":
            return ImageFont.truetype("arialbd.ttf", size)
        else:
            bold_paths = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
                "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
            ]
            for p in bold_paths:
                if os.path.exists(p):
                    return ImageFont.truetype(p, size)
    except:
        pass
    try:
        if sys.platform == "win32":
            return ImageFont.truetype("arial.ttf", size)
        else:
            plain_paths = [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            ]
            for p in plain_paths:
                if os.path.exists(p):
                    return ImageFont.truetype(p, size)
    except:
        pass
    return ImageFont.load_default()


def wrap_text(draw, text, font, max_width, margin=80):
    """Quebra o texto em linhas que cabem dentro de max_width."""
    words = text.split(' ')
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        test_line = ' '.join(current_line)
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] > max_width - margin:
            current_line.pop()
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    return lines


def draw_text_block(draw, lines, font, width, start_y, color, line_spacing=10):
    """Desenha um bloco de texto centralizado horizontalmente a partir de start_y."""
    y = start_y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        x = (width - w) / 2
        draw.text((x, y), line, fill=color, font=font)
        y += h + line_spacing
    return y  # retorna y final após o bloco


def hex_to_rgb(hex_str, default=(255, 255, 255)):
    hex_str = hex_str.lstrip('#')
    try:
        return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    except:
        return default


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', required=True, help='Dados do carrossel em JSON')
    args = parser.parse_args()

    try:
        data = json.loads(args.data)
    except Exception as e:
        print(json.dumps({"type": "error", "msg": f"Erro de JSON parse: {str(e)}"}))
        sys.exit(1)

    slides_dir = data.get('slidesDir')
    slides = data.get('slides', [])
    format_type = data.get('format', 'B')

    # Parâmetros de branding dinâmicos
    logo_text = data.get('logoText', '@FONTEOCULTA')
    logo_color_hex   = data.get('logoColor', '#ffffff')
    title_color_hex  = data.get('titleTextColor', '#ffffff')
    body_color_hex   = data.get('bodyTextColor', data.get('carouselTextColor', '#e4e4e7'))
    title_size_px = parse_px(data.get('titleTextSize', '40px'), default=40)
    body_size_px  = parse_px(data.get('bodyTextSize',  '24px'), default=24)
    logo_size_px  = parse_px(data.get('logoSize', '22px'), default=22)

    logo_color  = hex_to_rgb(logo_color_hex,  (201, 168, 76))
    title_color = hex_to_rgb(title_color_hex, (255, 255, 255))
    body_color  = hex_to_rgb(body_color_hex,  (228, 232, 231))

    logo_position = data.get('logoPosition', 'left')

    if not slides_dir:
        print(json.dumps({"type": "error", "msg": "slidesDir é obrigatório"}))
        sys.exit(1)

    os.makedirs(slides_dir, exist_ok=True)

    # Formato A: quadrado (1080x1080), Formato B: vertical (1080x1350)
    width, height = 1080, 1350 if format_type == 'B' else 1080

    # Carrega as fontes
    title_font = load_font(title_size_px)
    body_font  = load_font(body_size_px)
    logo_font  = load_font(logo_size_px)

    print(json.dumps({"type": "start", "total": len(slides), "title": data.get('title')}), flush=True)

    for i, slide in enumerate(slides, start=1):
        num = slide.get('num', i)
        title_text   = slide.get('title_text', f"Slide {num}")
        text_content = slide.get('text', '')

        # Cria imagem com fundo preto
        img = Image.new('RGB', (width, height), color=(0, 0, 0))
        draw = ImageDraw.Draw(img)

        # --- Logo e numeração posicionados dinamicamente ---
        num_text = f"{num}/{len(slides)}"
        bbox_num = draw.textbbox((0, 0), num_text, font=logo_font)
        num_w = bbox_num[2] - bbox_num[0]

        if logo_position == 'right':
            # Logo na direita superior, Numeração na esquerda superior
            bbox_logo = draw.textbbox((0, 0), logo_text, font=logo_font)
            logo_w = bbox_logo[2] - bbox_logo[0]
            draw.text((width - logo_w - 40, 40), logo_text, fill=logo_color, font=logo_font)
            draw.text((40, 40), num_text, fill=logo_color, font=logo_font)
        else:
            # Logo na esquerda superior, Numeração na direita superior (default)
            draw.text((40, 40), logo_text, fill=logo_color, font=logo_font)
            draw.text((width - num_w - 40, 40), num_text, fill=logo_color, font=logo_font)

        # --- Calcula altura total do bloco de texto para centralizar verticalmente ---
        title_lines = wrap_text(draw, title_text, title_font, width)
        body_lines  = wrap_text(draw, text_content, body_font, width) if text_content else []

        def block_height(lines, font, spacing=10):
            total = 0
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                total += (bbox[3] - bbox[1]) + spacing
            return total

        title_h = block_height(title_lines, title_font)
        body_h  = block_height(body_lines, body_font) if body_lines else 0
        gap_between = 30 if body_lines else 0  # espaço extra entre título e corpo

        total_content_h = title_h + gap_between + body_h
        start_y = (height - total_content_h) / 2

        # --- Desenha título ---
        after_title_y = draw_text_block(draw, title_lines, title_font, width, start_y, title_color, line_spacing=10)

        # --- Desenha corpo (se existir) ---
        if body_lines:
            draw_text_block(draw, body_lines, body_font, width, after_title_y + gap_between, body_color, line_spacing=8)

        filename = f"slide-{str(num).zfill(2)}.png"
        filepath = os.path.join(slides_dir, filename)
        img.save(filepath, 'PNG')

        # Cria o arquivo meta correspondente para carregar preenchido no dashboard
        meta_filename = f"slide-{str(num).zfill(2)}.meta.json"
        meta_filepath = os.path.join(slides_dir, meta_filename)
        try:
            with open(meta_filepath, 'w', encoding='utf-8') as mf:
                json.dump({
                    "title": title_text,
                    "body": text_content,
                    "layout": "text_only"
                }, mf, ensure_ascii=False, indent=2)
        except Exception:
            pass

        print(json.dumps({
            "type": "slide",
            "num": num,
            "total": len(slides),
            "estado": "PRODUÇÃO",
            "status": "ok",
            "filename": filename
        }), flush=True)

    print(json.dumps({
        "type": "done",
        "id": data.get('id', 'temp-id'),
        "slides_dir": slides_dir,
        "total_ok": len(slides)
    }), flush=True)


if __name__ == '__main__':
    main()
