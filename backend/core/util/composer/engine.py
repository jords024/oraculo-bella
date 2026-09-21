"""
Engine Principal de Composição: Executa Layouts (Fullbleed, Dramático, Etéreo, Text-Only, Card).
"""

from io import BytesIO
from PIL import Image, ImageDraw
from .art_director import crop_photo, clean_editorial_copy

from .presets import (
    W, H,
    MARGIN_L,
    MAX_TW_L,
    DEFAULT_PRESET,
    get_preset
)
from .effects import (
    dark_gradient,
    add_vignette,
    fill_edges_black,
    add_film_grain,
    _watermarks,
    make_cosmic_bg,
    draw_top_header,
    draw_pill_badge,
    draw_accent_dot,
    draw_framed_photo
)
from .text_renderer import (
    fit_title_size,
    line_px_height,
    wrap_markup_lines,
    render_title,
    render_markup_block
)
from .bella_editorial_engine import (
    render_slide_1_cover,
    render_slide_2_paper,
    render_slide_3_card,
    render_slide_4_sunlight,
    render_slide_5_dark,
    create_paper_texture,
    COLOR_ACCENT_TERRA
)
from .bella_sequence_engine import render_editorial_sequence


def _anchor_y_min(anchor, h_fraction_top, h_fraction_center, h_fraction_base):
    """Traduz o RESPIRO planejado pela IA (topo/centro/base) num piso vertical
    para o título, em vez do piso fixo de rodapé usado antes. `anchor` já vem
    normalizado ('topo'/'centro'/'base') ou None para manter o comportamento
    padrão (rodapé)."""
    if anchor == "topo":
        return h_fraction_top
    if anchor == "centro":
        return h_fraction_center
    return h_fraction_base


def _safe_body_y(body_y, rendered_title_y_end, gap, fallback_min):
    """Garante que o corpo nunca comece por cima do título renderizado.

    Um `body_y` explícito (vindo do editor manual ou de um valor salvo
    anteriormente) é respeitado apenas se já deixar espaço suficiente após o
    título de verdade. Título com mais linhas do que o autor previu — por
    exemplo, uma copy gerada por IA mais longa do que a posição fixa
    considerava — não deve mais resultar em texto sobreposto.
    """
    min_safe_y = rendered_title_y_end + gap
    if body_y is not None and str(body_y).strip() != "":
        return max(int(body_y), min_safe_y)
    return max(fallback_min, min_safe_y)


def compose_fullbleed(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None, text_anchor=None):
    """Layout fullbleed: imagem full + gradiente + texto centralizado embaixo."""
    p = preset
    bg = crop_photo(Image.open(BytesIO(img_bytes)), (W, H))
    bg = fill_edges_black(bg)
    bg = dark_gradient(bg, p)
    if p.get("vignette"):
        bg = add_vignette(bg)
    if p.get("film_grain"):
        bg = add_film_grain(bg)

    draw = ImageDraw.Draw(bg)
    _watermarks(draw, p["watermark_color"], pos=watermark_pos, x=watermark_x, y=watermark_y, text=watermark_text)

    t_start = min(p["title_px"], 80)
    t_min = p["title_min_px"]
    b_sz = p["body_px"]
    gap = 22

    t_sz = fit_title_size(draw, title, t_start, t_min, align="center")

    def calc_heights(ts, bs):
        lht = line_px_height(draw, ts) * 1.18
        lhb = line_px_height(draw, bs) * 1.55
        nt = sum(len(wrap_markup_lines(draw, ln, ts, MAX_TW_L)) or 1
                 for ln in title.split("\n"))
        nb = sum(len(wrap_markup_lines(draw, ln, bs, MAX_TW_L)) or 1
                 for ln in body.split("\n"))
        return int(nt * lht), int(nb * lhb)

    th, bh = calc_heights(t_sz, b_sz)

    BOTTOM_PAD = 80
    TOP_PAD = 150
    Y_MIN = _anchor_y_min(text_anchor, TOP_PAD, int(H * 0.38), int(H * 0.62))
    custom_y = int(title_y) if (title_y is not None and str(title_y).strip() != "") else None
    effective_y_min = custom_y if (custom_y is not None and custom_y < Y_MIN) else Y_MIN
    MAX_TEXT_H = H - effective_y_min - BOTTOM_PAD

    while (th + bh + gap) > MAX_TEXT_H and b_sz > p["body_min_px"]:
        b_sz -= 1
        _, bh = calc_heights(t_sz, b_sz)
    while (th + bh + gap) > MAX_TEXT_H and t_sz > t_min:
        t_sz -= 2
        th, bh = calc_heights(t_sz, b_sz)

    if title_y is not None and str(title_y).strip() != "":
        y = int(title_y)
    elif text_anchor == "topo":
        y = TOP_PAD
    elif text_anchor == "centro":
        y = max(TOP_PAD, (H - th - bh - gap) // 2)
    else:
        y_raw = H - th - bh - gap - BOTTOM_PAD
        y = max(y_raw, Y_MIN)

    rendered_title_y_end = render_title(draw, title, t_sz, MARGIN_L, y, p["title_color"],
                                        ls=1.18, align="center")
    body_fallback = rendered_title_y_end + gap if text_anchor in ("topo", "centro") else 980
    final_body_y = _safe_body_y(body_y, rendered_title_y_end, gap, body_fallback)
    render_markup_block(draw, body, b_sz, MARGIN_L, final_body_y, p,
                        ls=1.55, align="center")
    return bg.convert("RGB")

def compose_dramatico(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None, text_anchor=None):
    """
    Layout DRAMÁTICO:
    Imagem full + grain + gradiente extra-longo + texto ESQUERDA + fontes grandes.
    """
    p = preset
    bg = crop_photo(Image.open(BytesIO(img_bytes)), (W, H))
    bg = fill_edges_black(bg)
    bg = dark_gradient(bg, p)
    if p.get("vignette"):
        bg = add_vignette(bg, strength=0.30)
    if p.get("film_grain"):
        bg = add_film_grain(bg, intensity=16)

    draw = ImageDraw.Draw(bg)
    _watermarks(draw, p["watermark_color"], pos=watermark_pos, x=watermark_x, y=watermark_y, text=watermark_text)

    t_sz = fit_title_size(draw, title, p["title_px"], p["title_min_px"], align="left")
    b_sz = p["body_px"]
    gap = 26

    def calc_heights_d(ts, bs):
        lht = line_px_height(draw, ts) * 1.18
        lhb = line_px_height(draw, bs) * 1.58
        nt = sum(len(wrap_markup_lines(draw, ln, ts, MAX_TW_L)) or 1
                 for ln in title.split("\n"))
        nb = sum(len(wrap_markup_lines(draw, ln, bs, MAX_TW_L)) or 1
                 for ln in body.split("\n"))
        return int(nt * lht), int(nb * lhb)

    th, bh = calc_heights_d(t_sz, b_sz)

    BOTTOM_PAD = 96
    TOP_PAD = 150
    Y_MIN = _anchor_y_min(text_anchor, TOP_PAD, int(H * 0.40), int(H * 0.66))
    custom_y = int(title_y) if (title_y is not None and str(title_y).strip() != "") else None
    effective_y_min = custom_y if (custom_y is not None and custom_y < Y_MIN) else Y_MIN
    MAX_TEXT_H = H - effective_y_min - BOTTOM_PAD

    while (th + bh + gap) > MAX_TEXT_H and b_sz > p["body_min_px"]:
        b_sz -= 1
        _, bh = calc_heights_d(t_sz, b_sz)
    while (th + bh + gap) > MAX_TEXT_H and t_sz > p["title_min_px"]:
        t_sz -= 2
        th, bh = calc_heights_d(t_sz, b_sz)

    if title_y is not None and str(title_y).strip() != "":
        y = int(title_y)
    elif text_anchor == "topo":
        y = TOP_PAD
    elif text_anchor == "centro":
        y = max(TOP_PAD, (H - th - bh - gap) // 2)
    else:
        y_raw = H - th - bh - gap - BOTTOM_PAD
        y = max(y_raw, Y_MIN)

    rendered_title_y_end = render_title(draw, title, t_sz, MARGIN_L, y, p["title_color"],
                                        ls=1.18, align="left")
    body_fallback = rendered_title_y_end + gap if text_anchor in ("topo", "centro") else 970
    final_body_y = _safe_body_y(body_y, rendered_title_y_end, gap, body_fallback)
    render_markup_block(draw, body, b_sz, MARGIN_L, final_body_y, p,
                        ls=1.58, align="left")
    return bg.convert("RGB")

def compose_etereo(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None, text_anchor=None):
    """
    Layout ETÉREO LUMINOSO:
    Imagem quente + gradiente suave + texto ESQUERDA + itálico no body.
    """
    p = preset
    bg = crop_photo(Image.open(BytesIO(img_bytes)), (W, H))
    bg = fill_edges_black(bg)
    bg = dark_gradient(bg, p)
    if p.get("vignette"):
        bg = add_vignette(bg, strength=0.45)

    draw = ImageDraw.Draw(bg)
    _watermarks(draw, p["watermark_color"], pos=watermark_pos, x=watermark_x, y=watermark_y, text=watermark_text)

    t_sz = fit_title_size(draw, title, p["title_px"], p["title_min_px"], align="left")
    b_sz = p["body_px"]

    lh_t = line_px_height(draw, t_sz) * 1.20
    lh_b = line_px_height(draw, b_sz) * 1.60
    n_t = sum(len(wrap_markup_lines(draw, ln, t_sz, MAX_TW_L)) or 1
              for ln in title.split("\n"))
    n_b = sum(len(wrap_markup_lines(draw, ln, b_sz, MAX_TW_L)) or 1
              for ln in body.split("\n"))
    th = int(n_t * lh_t)
    bh = int(n_b * lh_b)
    gap = 28
    if title_y is not None and str(title_y).strip() != "":
        y = int(title_y)
    elif text_anchor == "topo":
        y = 150
    elif text_anchor == "centro":
        y = max(150, (H - th - bh - gap) // 2)
    else:
        y = H - th - bh - gap - 90

    rendered_title_y_end = render_title(draw, title, t_sz, MARGIN_L, y, p["title_color"],
                                        ls=1.20, align="left")
    body_fallback = rendered_title_y_end + gap if text_anchor in ("topo", "centro") else 1030
    final_body_y = _safe_body_y(body_y, rendered_title_y_end, gap, body_fallback)
    render_markup_block(draw, body, b_sz, MARGIN_L, final_body_y, p,
                        ls=1.60, align="left")
    return bg.convert("RGB")

def compose_text_only(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None):
    """
    Layout TEXTO PESADO — quando há muito texto, sem imagem real.
    """
    p = preset
    bg = make_cosmic_bg(p, img_bytes)
    if p.get("vignette"):
        bg = add_vignette(bg, strength=0.35)

    draw = ImageDraw.Draw(bg)
    _watermarks(draw, p["watermark_color"], pos=watermark_pos, x=watermark_x, y=watermark_y, text=watermark_text)

    bar_x = MARGIN_L
    bar_y1 = int(H * 0.30)
    bar_y2 = bar_y1 + 56
    draw.rectangle([bar_x, bar_y1, bar_x + 4, bar_y2], fill=(180, 40, 40, 230))

    t_sz = min(p["title_px"] + 6, 88)
    t_min = p["title_min_px"]
    b_sz = p["body_px"]

    t_sz = fit_title_size(draw, title, t_sz, t_min, align="left")

    PAD_TOP = int(title_y) if title_y is not None and str(title_y).strip() != "" else int(H * 0.34)
    x0 = MARGIN_L
    y = float(PAD_TOP)

    if title.strip():
        y = render_title(draw, title, t_sz, x0, y, p["title_color"],
                         ls=1.18, align="left")
        y += line_px_height(draw, t_sz) * 0.9

    if body_y is not None and str(body_y).strip() != "":
        y = float(body_y)

    paragraphs = body.split("\n\n")
    for i, para in enumerate(paragraphs):
        para = para.strip()
        if not para:
            continue
        y = render_markup_block(draw, para, b_sz, x0, y, p,
                                ls=1.60, align="left")
        if i < len(paragraphs) - 1:
            y += line_px_height(draw, b_sz) * 0.85

    return bg.convert("RGB")

def compose_card(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None):
    """Layout card: imagem arredondada no topo + texto embaixo."""
    p = preset
    canvas = Image.new("RGBA", (W, H), p["card_bg"])
    if p.get("vignette"):
        canvas = add_vignette(canvas, strength=0.25)

    draw = ImageDraw.Draw(canvas)
    _watermarks(draw, p["watermark_color"], pos=watermark_pos, x=watermark_x, y=watermark_y, text=watermark_text)

    cw, ch, cx, cy = 940, 556, (W - 940) // 2, 126
    card = crop_photo(Image.open(BytesIO(img_bytes)), (cw, ch))
    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw, ch], radius=16, fill=255)
    card.putalpha(mask)
    draw.rounded_rectangle([cx-2, cy-2, cx+cw+2, cy+ch+2],
                           radius=18, outline=p["card_border"], width=2)
    canvas.paste(card, (cx, cy), card)

    ty = cy + ch + 36
    custom_y = int(title_y) if (title_y is not None and str(title_y).strip() != "") else None
    avail = H - (custom_y if custom_y is not None else ty) - 52
    t_sz = fit_title_size(draw, title, p["title_px"], p["title_min_px"], align="center")
    b_sz = p["body_px"]

    lh_t = line_px_height(draw, t_sz) * 1.18
    lh_b = line_px_height(draw, b_sz) * 1.55
    n_t = sum(len(wrap_markup_lines(draw, ln, t_sz, MAX_TW_L)) or 1
              for ln in title.split("\n"))
    n_b = sum(len(wrap_markup_lines(draw, ln, b_sz, MAX_TW_L)) or 1
              for ln in body.split("\n"))
    th = int(n_t * lh_t)
    bh = int(n_b * lh_b)
    gap = 20

    while th + gap + bh > avail and b_sz > p["body_min_px"]:
        b_sz -= 1
        lh_b = line_px_height(draw, b_sz) * 1.55
        bh = int(n_b * lh_b)

    y = float(title_y) if title_y is not None and str(title_y).strip() != "" else float(ty)
    rendered_title_y_end = render_title(draw, title, t_sz, MARGIN_L, y, p["title_color"],
                                        ls=1.18, align="center")
    final_body_y = _safe_body_y(body_y, rendered_title_y_end, gap, rendered_title_y_end + gap)
    render_markup_block(draw, body, b_sz, MARGIN_L, final_body_y, p,
                        ls=1.55, align="center")
    return canvas.convert("RGB")

def _get_header_mark(watermark_text, preset):
    if watermark_text and str(watermark_text).strip():
        return str(watermark_text).strip()
    try:
        branding_path = Path(__file__).parent.parent.parent.parent / "dashboard" / "data" / "branding.json"
        if branding_path.exists():
            with open(branding_path, encoding="utf-8") as f:
                data = json.load(f)
                mark = data.get("logoText")
                if mark and str(mark).strip():
                    return str(mark).strip()
    except Exception:
        pass
    if preset.get("font_family") == "serif":
        return "@ISABELLA.DALCIN"
    return "BRANDS DECODED®"

def compose_brands_cover(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None):
    """
    Layout BRANDS COVER:
    Hero image + Top Header metadata + Pill Badge + Bold Condensed / Serif Title + Subtext.
    """
    p = preset
    bg_color = p.get("bg", (13, 13, 13, 255))
    if img_bytes:
        bg = crop_photo(Image.open(BytesIO(img_bytes)), (W, H))
        bg = dark_gradient(bg, p)
    else:
        bg = Image.new("RGBA", (W, H), bg_color)

    draw = ImageDraw.Draw(bg)
    header_mark = _get_header_mark(watermark_text, p)
    draw_top_header(draw, left_text=header_mark, right_text="ACADEMIA SETE" if p.get("font_family") == "serif" else "EDIÇÃO", color=p.get("watermark_color", (255, 255, 255, 200)))

    # Pill badge (ex: [T.A.F.A], [ESTUDO DE CASO] ou [AUTORAL])
    badge_tag = "T.A.F.A" if p.get("font_family") == "serif" else ("AUTORAL" if "autoral" in p.get("font_family", "") else "ESTUDO DE CASO")
    clean_body = body
    if "[" in body and "]" in body:
        import re
        m = re.search(r"\[(.*?)\]", body)
        if m:
            badge_tag = m.group(1)
            clean_body = re.sub(r"\[.*?\]", "", body).strip()

    t_start = p.get("title_px", 84)
    t_min = p.get("title_min_px", 40)
    ff = p.get("font_family", "condensed")
    
    t_sz = fit_title_size(draw, title, t_start, t_min, align="left", font_family=ff)
    lh_t = line_px_height(draw, t_sz, font_family=ff) * 1.15
    n_t = sum(len(wrap_markup_lines(draw, ln, t_sz, MAX_TW_L, font_family=ff)) or 1 for ln in title.split("\n"))
    th = int(n_t * lh_t)

    b_sz = p.get("body_px", 36)
    lh_b = line_px_height(draw, b_sz, font_family=ff) * 1.50
    n_b = sum(len(wrap_markup_lines(draw, ln, b_sz, MAX_TW_L, font_family=ff)) or 1 for ln in clean_body.split("\n")) if clean_body else 0
    bh = int(n_b * lh_b)

    BOTTOM_PAD = 100
    y_default = H - th - bh - 60 - BOTTOM_PAD
    y_title = int(title_y) if (title_y is not None and str(title_y).strip() != "") else max(int(H * 0.58), y_default)

    # Desenha Badge antes do título
    badge_y = y_title - 54
    draw_pill_badge(draw, badge_tag, MARGIN_L, badge_y, bg_color=p.get("badge_bg", (255, 51, 0, 255)), text_color=p.get("badge_text", (255, 255, 255, 255)))

    # Desenha Título
    y_end = render_title(draw, title, t_sz, MARGIN_L, y_title, p.get("title_color", (255, 255, 255, 255)), ls=1.15, align="left", font_family=ff)

    # Desenha subtext/corpo se houver
    if clean_body and clean_body.strip():
        final_body_y = _safe_body_y(body_y, y_end, 20, y_end + 20)
        render_markup_block(draw, clean_body, b_sz, MARGIN_L, final_body_y, p, ls=1.50, align="left", font_family=ff)

    # Ponto de destaque
    draw_accent_dot(draw, W - MARGIN_L - 10, y_end - 10, radius=8, color=p.get("accent_color", (255, 51, 0, 255)))

    return bg.convert("RGB")

def compose_brands_split(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None):
    """
    Layout BRANDS SPLIT (Bloco Sólido + Foto Central + Bloco Inferior).
    """
    p = preset
    canvas_bg = p.get("bg", (13, 13, 13, 255))
    canvas = Image.new("RGBA", (W, H), canvas_bg)
    draw = ImageDraw.Draw(canvas)

    header_mark = _get_header_mark(watermark_text, p)
    draw_top_header(draw, left_text=header_mark, right_text="", color=p.get("watermark_color", (255, 255, 255, 200)), y=46)

    ff = p.get("font_family", "condensed")

    # 1. Bloco superior de Título (Banner sólido)
    top_box_y = 96
    top_box_h = 360
    accent_bg = p.get("accent_color", (255, 51, 0, 255))
    draw.rectangle([0, top_box_y, W, top_box_y + top_box_h], fill=accent_bg)

    t_sz = fit_title_size(draw, title, p.get("title_px", 76), p.get("title_min_px", 36), align="left", max_w=W - (MARGIN_L * 2), font_family=ff)
    y_t = int(title_y) if (title_y is not None and str(title_y).strip() != "") else (top_box_y + 36)
    render_title(draw, title, t_sz, MARGIN_L, y_t, (255, 255, 255, 255), ls=1.15, align="left", max_w=W - (MARGIN_L * 2), font_family=ff, shadow=False)

    # 2. Foto central emoldurada
    photo_w, photo_h = 912, 480
    photo_x = (W - photo_w) // 2
    photo_y = top_box_y + top_box_h + 32

    if img_bytes:
        draw_framed_photo(canvas, img_bytes, (photo_x, photo_y, photo_w, photo_h), radius=16, border_color=(255, 255, 255, 40), border_width=1)
    else:
        draw.rounded_rectangle([photo_x, photo_y, photo_x + photo_w, photo_y + photo_h], radius=16, fill=(24, 24, 27, 255))

    # 3. Bloco inferior
    bot_y = photo_y + photo_h + 36
    y_b = int(body_y) if (body_y is not None and str(body_y).strip() != "") else bot_y
    b_sz = p.get("body_px", 34)

    draw_accent_dot(draw, MARGIN_L - 20, y_b + 12, radius=5, color=p.get("accent_color", (255, 51, 0, 255)))
    render_markup_block(draw, body, b_sz, MARGIN_L, y_b, p, ls=1.52, align="left", max_w=W - (MARGIN_L * 2), font_family=ff)

    return canvas.convert("RGB")

def compose_brands_editorial(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None):
    """
    Layout BRANDS EDITORIAL (Ponto Vermelho + Título Display + Foto Emoldurada + Corpo).
    """
    p = preset
    canvas_bg = p.get("bg", (13, 13, 13, 255))
    canvas = Image.new("RGBA", (W, H), canvas_bg)
    draw = ImageDraw.Draw(canvas)

    header_mark = _get_header_mark(watermark_text, p)
    draw_top_header(draw, left_text=header_mark, right_text="", color=p.get("watermark_color", (255, 255, 255, 200)), y=46)

    ff = p.get("font_family", "serif")

    # 1. Ponto indicador e Título
    y_top = 110
    draw_accent_dot(draw, MARGIN_L, y_top + 14, radius=6, color=p.get("accent_color", (255, 51, 0, 255)))

    t_sz = fit_title_size(draw, title, p.get("title_px", 72), p.get("title_min_px", 36), align="left", max_w=W - (MARGIN_L * 2) - 30, font_family=ff)
    y_t = int(title_y) if (title_y is not None and str(title_y).strip() != "") else y_top
    y_end = render_title(draw, title, t_sz, MARGIN_L + 24, y_t, p.get("title_color", (255, 255, 255, 255)), ls=1.20, align="left", max_w=W - (MARGIN_L * 2) - 30, font_family=ff)

    # 2. Foto emoldurada
    photo_y = max(y_end + 32, 420)
    photo_w = 912
    photo_h = 440
    photo_x = (W - photo_w) // 2

    if img_bytes:
        draw_framed_photo(canvas, img_bytes, (photo_x, int(photo_y), photo_w, photo_h), radius=14, border_color=(255, 255, 255, 30), border_width=1)

    # 3. Bloco inferior de leitura
    y_b = int(body_y) if (body_y is not None and str(body_y).strip() != "") else (photo_y + photo_h + 36)
    b_sz = p.get("body_px", 34)
    render_markup_block(draw, body, b_sz, MARGIN_L, y_b, p, ls=1.55, align="left", max_w=W - (MARGIN_L * 2), font_family="sans")

    return canvas.convert("RGB")

def compose_brands_outro(img_bytes, title, body, preset: dict, title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None, watermark_text=None):
    """
    Layout BRANDS OUTRO (Slide Final / Disclaimer & CTA).
    """
    p = preset.copy()
    p["body_color"] = (240, 235, 228, 255)
    p["title_color"] = (255, 255, 255, 255)
    p["bold_color"] = p.get("accent_color", (255, 255, 255, 255))

    if img_bytes:
        bg = crop_photo(Image.open(BytesIO(img_bytes)), (W, H))
        dark = Image.new("RGBA", (W, H), (0, 0, 0, 180))
        bg = Image.alpha_composite(bg, dark)
    else:
        bg_dark = (30, 20, 15, 255) if p.get("font_family") == "serif" else (13, 13, 13, 255)
        bg = Image.new("RGBA", (W, H), bg_dark)

    draw = ImageDraw.Draw(bg)
    header_mark = _get_header_mark(watermark_text, p)
    draw_top_header(draw, left_text=header_mark, right_text="ACADEMIA SETE" if p.get("font_family") == "serif" else "", color=p.get("watermark_color", (255, 255, 255, 200)), y=46)

    # 1. Pill Badge
    badge_label = "T.A.F.A — ACADEMIA SETE" if p.get("font_family") == "serif" else "POST PRODUZIDO COM IA"
    badge_y = int(title_y) if (title_y is not None and str(title_y).strip() != "") else int(H * 0.52)
    draw_pill_badge(draw, badge_label, MARGIN_L, badge_y, bg_color=p.get("badge_bg", (255, 51, 0, 255)), text_color=p.get("badge_text", (255, 255, 255, 255)), font_size=20)

    # 2. Título / Declaração
    ff = p.get("font_family", "condensed")
    out_title = title if title.strip() else "Produzido com ajuda de Inteligência Artificial."
    t_sz = fit_title_size(draw, out_title, 64, 36, align="left", font_family=ff)
    y_t = badge_y + 60
    y_end = render_title(draw, out_title, t_sz, MARGIN_L, y_t, (255, 255, 255, 255), ls=1.18, align="left", font_family=ff)

    # 3. Corpo / Citação e CTA
    out_body = body if body.strip() else "Siga para mais análises e estudos de caso."
    y_b = int(body_y) if (body_y is not None and str(body_y).strip() != "") else (y_end + 28)
    render_markup_block(draw, out_body, p.get("body_px", 34), MARGIN_L, y_b, p, ls=1.55, align="left", font_family="sans")

    return bg.convert("RGB")

def compose(img_bytes, title, body, layout="fullbleed", preset_name=DEFAULT_PRESET,
            title_y=None, body_y=None, watermark_pos="top_left", watermark_x=None, watermark_y=None,
            title_px=None, body_px=None, watermark_text=None, deck_direction=None, text_anchor=None):
    """
    Ponto de entrada público do composer.
    """
    title = clean_editorial_copy(title)
    body = clean_editorial_copy(body)
    p = get_preset(preset_name).copy()
    p["_deck_direction"] = deck_direction or {}
    text_anchor = str(text_anchor).strip().lower() if text_anchor else None
    if text_anchor not in ("topo", "centro", "base"):
        text_anchor = None

    if title_px is not None and str(title_px).strip() != "":
        p["title_px"] = int(title_px)
    if body_px is not None and str(body_px).strip() != "":
        p["body_px"] = int(body_px)

    if layout.startswith("bella_sequence_"):
        try:
            slide_no = int(layout.rsplit("_", 1)[1])
        except (TypeError, ValueError):
            slide_no = 1
        return render_editorial_sequence(img_bytes, title, body, slide_no, p)

    if layout.startswith("bella_essential_"):
        from .bella_essential_engine import render_bella_essential
        try:
            slide_no = int(layout.rsplit("_", 1)[1])
        except (TypeError, ValueError):
            slide_no = 1
        return render_bella_essential(img_bytes, title, body, slide_no, p)

    if layout in ("bella_editorial_cover", "bella_cover"):
        return render_editorial_sequence(img_bytes, title, body, 1, p)

    if layout in ("bella_editorial_paper", "bella_paper"):
        return render_editorial_sequence(img_bytes, title, body, 2, p)

    if layout in ("bella_editorial_card", "bella_card"):
        return render_editorial_sequence(img_bytes, title, body, 3, p)

    if layout in ("bella_editorial_sunlight", "bella_sunlight"):
        return render_editorial_sequence(img_bytes, title, body, 5, p)

    if layout in ("bella_editorial_dark", "bella_dark"):
        return render_editorial_sequence(img_bytes, title, body, 8, p)

    if layout == "brands_cover":
        return compose_brands_cover(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text)
    if layout == "brands_split":
        return compose_brands_split(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text)
    if layout == "brands_editorial":
        return compose_brands_editorial(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text)
    if layout == "brands_outro":
        return compose_brands_outro(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text)

    if layout == "dramatico":
        return compose_dramatico(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text, text_anchor)
    if layout == "etereo":
        return compose_etereo(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text, text_anchor)
    if layout == "text_only":
        return compose_text_only(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text)
    if layout == "card":
        return compose_card(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text)

    return compose_fullbleed(img_bytes, title, body, p, title_y, body_y, watermark_pos, watermark_x, watermark_y, watermark_text, text_anchor)
