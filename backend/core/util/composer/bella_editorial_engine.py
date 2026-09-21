# coding: utf-8
"""
bella_editorial_engine.py — Engine de Composição Editorial de Luxo (Isabella Dalcin)
Tipografia Playfair Display refinada, contraste profundo e estética 35mm cinematográfica.
"""

import os
import io
import base64
import random
import requests
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from .art_director import crop_photo, clean_editorial_copy, editorial_excerpt, copy_density
from dotenv import load_dotenv

env_path = Path("backend/.env")
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

W, H = 1080, 1350
MARGIN_X = 100
MAX_CONTENT_W = W - (MARGIN_X * 2)  # 880px

COLOR_BG_PAPER = (247, 244, 238, 255)
COLOR_BG_DARK = (24, 23, 22, 255)
COLOR_TEXT_DARK = (32, 24, 18, 255)
COLOR_TEXT_LIGHT = (252, 249, 244, 255)
COLOR_TEXT_MUTED = (150, 140, 130, 255)
COLOR_ACCENT_TERRA = (184, 98, 62, 255)
COLOR_ACCENT_OLIVE = (90, 107, 72, 255)
COLOR_ACCENT_ROSE = (195, 105, 88, 255)

FONT_DIR = Path("backend/assets/fonts")

def get_editorial_font(name: str, size: int):
    candidates = {
        'serif_display': [
            FONT_DIR / 'PlayfairDisplay-Regular.ttf',
            Path('C:/Windows/Fonts/georgia.ttf'),
            Path('C:/Windows/Fonts/times.ttf')
        ],
        'serif_italic': [
            FONT_DIR / 'PlayfairDisplay-Italic.ttf',
            Path('C:/Windows/Fonts/georgiai.ttf'),
            Path('C:/Windows/Fonts/timesi.ttf')
        ],
        'serif_bold': [
            FONT_DIR / 'PlayfairDisplay-Bold.ttf',
            FONT_DIR / 'PlayfairDisplay-Regular.ttf',
            Path('C:/Windows/Fonts/georgiab.ttf'),
            Path('C:/Windows/Fonts/timesbd.ttf')
        ],
        'sans_regular': [
            FONT_DIR / 'Inter-Regular.ttf',
            Path('C:/Windows/Fonts/segoeui.ttf'),
            Path('C:/Windows/Fonts/arial.ttf')
        ],
        'sans_bold': [
            FONT_DIR / 'Inter-Bold.ttf',
            Path('C:/Windows/Fonts/segoeuib.ttf'),
            Path('C:/Windows/Fonts/arialbd.ttf')
        ],
    }

    font_paths = candidates.get(name, candidates['sans_regular'])
    for p in font_paths:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except Exception:
                pass
    return ImageFont.load_default()

def wrap_text(draw: ImageDraw.Draw, text: str, font: ImageFont.ImageFont, max_w: int) -> list:
    if not text:
        return []
    lines = []
    paragraphs = text.split('\n')
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        words = p.split(' ')
        cur_line = ''
        for w in words:
            test = cur_line + (' ' if cur_line else '') + w
            bbox = draw.textbbox((0, 0), test, font=font)
            if (bbox[2] - bbox[0]) <= max_w:
                cur_line = test
            else:
                if cur_line:
                    lines.append(cur_line)
                cur_line = w
        if cur_line:
            lines.append(cur_line)
    return lines

def create_paper_texture(bg_color=COLOR_BG_PAPER) -> Image.Image:
    img = Image.new('RGBA', (W, H), bg_color)
    noise = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    noise_draw = ImageDraw.Draw(noise)
    for _ in range(25000):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        alpha = random.randint(3, 7)
        v = random.randint(20, 60)
        noise_draw.point((x, y), fill=(v, v, v, alpha))
    return Image.alpha_composite(img, noise)

def draw_header_footer(draw: ImageDraw.Draw, is_dark=False, header_text='ISABELLA DALCIN', footer_text='ACADEMIA SETE · MÉTODO T.A.F.A'):
    font_h = get_editorial_font('sans_regular', 22)
    font_f = get_editorial_font('serif_italic', 21)
    color_h = (220, 215, 208, 230) if is_dark else (125, 115, 105, 240)
    color_f = (220, 215, 208, 230) if is_dark else (135, 125, 115, 240)

    bbox_h = draw.textbbox((0, 0), header_text, font=font_h)
    w_h = bbox_h[2] - bbox_h[0]
    draw.text(((W - w_h) // 2, 60), header_text, font=font_h, fill=color_h)

    bbox_f = draw.textbbox((0, 0), footer_text, font=font_f)
    w_f = bbox_f[2] - bbox_f[0]
    draw.text(((W - w_f) // 2, H - 75), footer_text, font=font_f, fill=color_f)

def add_cinematic_scrim(canvas: Image.Image) -> Image.Image:
    """Aplica um gradiente de alto contraste editorial no topo e base da foto analógica."""
    scrim = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    scrim_draw = ImageDraw.Draw(scrim)
    
    # Scrim superior escuro profundo (0 a 460px)
    for y in range(460):
        factor = 1.0 - (y / 460.0)
        a = int(240 * (factor ** 1.1))
        scrim_draw.line([(0, y), (W, y)], fill=(12, 10, 8, a))
        
    # Scrim inferior escuro profundo (H - 460 a H)
    for y in range(H - 460, H):
        factor = (y - (H - 460)) / 460.0
        a = int(245 * (factor ** 1.1))
        scrim_draw.line([(0, y), (W, y)], fill=(12, 10, 8, a))
        
    return Image.alpha_composite(canvas, scrim)

def render_slide_1_cover(bg_image: Image.Image, title_top: str, title_accent: str, footer_text='ACADEMIA SETE · MÉTODO T.A.F.A') -> Image.Image:
    """
    SLIDE 1 — CAPA EDITORIAL DE LUXO:
    Foto analógica 35mm com zona escura de leitura superior e inferior, Playfair Display nítido e respiro central.
    """
    canvas = crop_photo(bg_image, (W, H), focus=(0.5, 0.40))
    canvas = add_cinematic_scrim(canvas)
    draw = ImageDraw.Draw(canvas)
    
    draw_header_footer(draw, is_dark=True, header_text='ISABELLA DALCIN', footer_text=footer_text)

    # 1. Título Superior (Playfair Display)
    density = copy_density(title_top, title_accent)
    font_size_top = 72 if density == 'airy' else (62 if density == 'balanced' else 52)
    font_top = get_editorial_font('serif_display', font_size_top)
    clean_top = clean_editorial_copy(title_top)
    title_max_w = 790
    lines_top = wrap_text(draw, clean_top, font_top, max_w=title_max_w)
    
    while len(lines_top) > 3 and font_size_top > 40:
        font_size_top -= 4
        font_top = get_editorial_font('serif_display', font_size_top)
        lines_top = wrap_text(draw, clean_top, font_top, max_w=title_max_w)

    y_cursor = 170
    line_h = int(font_size_top * 1.25)
    for line in lines_top:
        draw.text((MARGIN_X + 1, y_cursor + 1), line, font=font_top, fill=(0, 0, 0, 210))
        draw.text((MARGIN_X, y_cursor), line, font=font_top, fill=COLOR_TEXT_LIGHT)
        y_cursor += line_h

    # 2. Destaque Inferior (Playfair Itálico)
    clean_accent = editorial_excerpt(title_accent, 34)
    if clean_accent:
        font_size_acc = 44 if density != 'dense' else 36
        font_acc = get_editorial_font('serif_italic', font_size_acc)
        lines_acc = wrap_text(draw, clean_accent, font_acc, max_w=760)
        
        while len(lines_acc) > 3 and font_size_acc > 36:
            font_size_acc -= 4
            font_acc = get_editorial_font('serif_italic', font_size_acc)
            lines_acc = wrap_text(draw, clean_accent, font_acc, max_w=760)

        acc_line_h = int(font_size_acc * 1.26)
        total_acc_h = len(lines_acc) * acc_line_h
        y_accent = H - 135 - total_acc_h

        for line in lines_acc:
            draw.text((MARGIN_X + 1, y_accent + 1), line, font=font_acc, fill=(0, 0, 0, 210))
            draw.text((MARGIN_X, y_accent), line, font=font_acc, fill=COLOR_TEXT_LIGHT)
            y_accent += acc_line_h

    return canvas.convert('RGB')

def render_slide_2_paper(body_paragraphs: list, punchline_top: str, punchline_accent: str) -> Image.Image:
    canvas = create_paper_texture(COLOR_BG_PAPER)
    draw = ImageDraw.Draw(canvas)
    draw_header_footer(draw, is_dark=False, header_text='ISABELLA DALCIN')

    font_body = get_editorial_font('sans_regular', 34)
    y_cursor = 220
    body_line_h = 52

    for para in body_paragraphs:
        clean_p = para.replace('_', '').replace('*', '').strip()
        if not clean_p:
            continue
        lines = wrap_text(draw, clean_p, font_body, max_w=MAX_CONTENT_W)
        for l in lines:
            draw.text((MARGIN_X, y_cursor), l, font=font_body, fill=COLOR_TEXT_DARK)
            y_cursor += body_line_h
        y_cursor += 36

    punch_text = f"{punchline_top} {punchline_accent}".strip()
    if punch_text:
        y_cursor += 20
        font_punch_size = 52
        font_punch = get_editorial_font('serif_display', font_punch_size)
        punch_lines = wrap_text(draw, punch_text, font_punch, max_w=MAX_CONTENT_W)
        
        while len(punch_lines) > 3 and font_punch_size > 36:
            font_punch_size -= 4
            font_punch = get_editorial_font('serif_display', font_punch_size)
            punch_lines = wrap_text(draw, punch_text, font_punch, max_w=MAX_CONTENT_W)

        p_line_h = int(font_punch_size * 1.25)
        for pl in punch_lines:
            draw.text((MARGIN_X, y_cursor), pl, font=font_punch, fill=COLOR_TEXT_DARK)
            y_cursor += p_line_h

    return canvas.convert('RGB')

def render_slide_3_card(bg_image: Image.Image, card_title: str, bullet_points: list, card_color=COLOR_ACCENT_TERRA) -> Image.Image:
    canvas = crop_photo(bg_image, (W, H), focus=(0.5, 0.42))
    
    card_w = 900
    card_h = 820
    card_x = (W - card_w) // 2
    card_y = (H - card_h) // 2 - 10
    radius = 24

    card_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card_layer)
    c_draw.rounded_rectangle([card_x - 4, card_y + 8, card_x + card_w + 4, card_y + card_h + 16], radius=radius, fill=(10, 8, 6, 90))
    c_draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=radius, fill=card_color)

    canvas = Image.alpha_composite(canvas, card_layer)
    draw = ImageDraw.Draw(canvas)
    draw_header_footer(draw, is_dark=True, header_text='ISABELLA DALCIN')

    font_title_size = 46
    font_title = get_editorial_font('serif_display', font_title_size)
    clean_title = clean_editorial_copy(card_title)
    title_lines = wrap_text(draw, clean_title, font_title, max_w=card_w - 90)
    
    while len(title_lines) > 2 and font_title_size > 36:
        font_title_size -= 4
        font_title = get_editorial_font('serif_display', font_title_size)
        title_lines = wrap_text(draw, clean_title, font_title, max_w=card_w - 90)

    y_cur = card_y + 55
    t_line_h = int(font_title_size * 1.22)
    for tl in title_lines:
        bbox = draw.textbbox((0, 0), tl, font=font_title)
        w_tl = bbox[2] - bbox[0]
        draw.text(((W - w_tl) // 2, y_cur), tl, font=font_title, fill=COLOR_TEXT_LIGHT)
        y_cur += t_line_h

    y_cur += 20
    draw.line([(card_x + 80, y_cur), (card_x + card_w - 80, y_cur)], fill=(255, 255, 255, 60), width=1)
    y_cur += 35

    font_bullet = get_editorial_font('sans_regular', 29)
    bullet_line_h = 42

    for i, bp in enumerate(bullet_points[:4]):
        clean_bp = clean_editorial_copy(bp).lstrip('›-•* 0123456789.').strip()
        if not clean_bp:
            continue

        icon_cx = card_x + 60
        icon_cy = y_cur + 16
        draw.ellipse([icon_cx - 12, icon_cy - 12, icon_cx + 12, icon_cy + 12], fill=(255, 255, 255, 45), outline=(255, 255, 255, 120), width=1)
        draw.ellipse([icon_cx - 4, icon_cy - 4, icon_cx + 4, icon_cy + 4], fill=COLOR_TEXT_LIGHT)

        text_max_w = card_w - 150
        bp_lines = wrap_text(draw, clean_bp, font_bullet, max_w=text_max_w)
        text_y = y_cur
        for bl in bp_lines:
            draw.text((card_x + 95, text_y), bl, font=font_bullet, fill=COLOR_TEXT_LIGHT)
            text_y += bullet_line_h
        y_cur = text_y + 22

    return canvas.convert('RGB')

def render_slide_4_sunlight(bg_image: Image.Image, title_serif: str, body_paragraphs: list) -> Image.Image:
    canvas = crop_photo(bg_image, (W, H), focus=(0.5, 0.38))
    canvas = add_cinematic_scrim(canvas)
    draw = ImageDraw.Draw(canvas)
    draw_header_footer(draw, is_dark=True, header_text='ISABELLA DALCIN')

    density = copy_density(title_serif, ' '.join(body_paragraphs))
    title_size = 62 if density == 'airy' else (54 if density == 'balanced' else 46)
    body_size = 31 if density != 'dense' else 27
    font_title = get_editorial_font('serif_display', title_size)
    font_body = get_editorial_font('sans_regular', body_size)

    clean_title = clean_editorial_copy(title_serif)
    title_lines = wrap_text(draw, clean_title, font_title, max_w=MAX_CONTENT_W)
    
    y_cur = 200
    for tl in title_lines:
        bbox = draw.textbbox((0, 0), tl, font=font_title)
        w_tl = bbox[2] - bbox[0]
        draw.text(((W - w_tl) // 2, y_cur), tl, font=font_title, fill=COLOR_TEXT_LIGHT)
        y_cur += int(title_size * 1.22)

    y_cur += 25
    draw.line([(W // 2, y_cur), (W // 2, y_cur + 40)], fill=(255, 255, 255, 120), width=2)
    y_cur += 70

    clean_body = editorial_excerpt(' '.join(body_paragraphs), 44)
    for para in [clean_body]:
        clean_p = clean_editorial_copy(para)
        lines = wrap_text(draw, clean_p, font_body, max_w=MAX_CONTENT_W)
        for l in lines:
            bbox = draw.textbbox((0, 0), l, font=font_body)
            w_l = bbox[2] - bbox[0]
            draw.text(((W - w_l) // 2, y_cur), l, font=font_body, fill=COLOR_TEXT_LIGHT)
            y_cur += int(body_size * 1.5)
        y_cur += 28

    return canvas.convert('RGB')

def render_slide_5_dark(intro_text: str, big_quote: str) -> Image.Image:
    canvas = create_paper_texture(COLOR_BG_DARK)
    draw = ImageDraw.Draw(canvas)
    draw_header_footer(draw, is_dark=True, header_text='ISABELLA DALCIN')

    font_intro = get_editorial_font('sans_regular', 34)
    font_quote = get_editorial_font('serif_display', 54)

    clean_intro = clean_editorial_copy(intro_text)
    intro_lines = wrap_text(draw, clean_intro, font_intro, max_w=MAX_CONTENT_W)
    y_cur = 260
    for l in intro_lines:
        bbox = draw.textbbox((0, 0), l, font=font_intro)
        w_l = bbox[2] - bbox[0]
        draw.text(((W - w_l) // 2, y_cur), l, font=font_intro, fill=(205, 195, 185, 255))
        y_cur += 52

    y_cur += 50
    clean_quote = editorial_excerpt(big_quote, 44)
    quote_lines = wrap_text(draw, clean_quote, font_quote, max_w=MAX_CONTENT_W)
    for ql in quote_lines:
        bbox = draw.textbbox((0, 0), ql, font=font_quote)
        w_ql = bbox[2] - bbox[0]
        draw.text(((W - w_ql) // 2, y_cur), ql, font=font_quote, fill=COLOR_TEXT_LIGHT)
        y_cur += 74

    return canvas.convert('RGB')
