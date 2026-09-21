"""Bella Essencial — composição simples, sem improviso visual.

Uma imagem forte conduz a emoção. A tipografia, sempre renderizada pelo
sistema, organiza a leitura em três famílias: capa, desenvolvimento e pausa.
"""

from io import BytesIO
import re

from PIL import Image, ImageDraw, ImageFont

from .presets import W, H, F_BOLD, F_REGULAR, F_SERIF, F_SERIF_IT
from .art_director import crop_photo, clean_editorial_copy, editorial_excerpt


CHARCOAL = (17, 16, 15, 255)
CACAO = (42, 31, 27, 255)
CREAM = (247, 242, 233, 255)
INK = (42, 36, 32, 255)
TERRA = (184, 98, 62, 255)
MUTED = (214, 205, 194, 255)
MX = 74


def _font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except Exception:
        return ImageFont.load_default()


def _fit(draw, text, path, start, minimum, width, max_lines):
    text = clean_editorial_copy(text)
    last_lines = [text]
    for size in range(start, minimum - 1, -2):
        font = _font(path, size)
        lines, current = [], ""
        for word in text.split():
            trial = f"{current} {word}".strip()
            if draw.textbbox((0, 0), trial, font=font)[2] <= width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        last_lines = lines
        if len(lines) <= max_lines:
            return font, lines
    return _font(path, minimum), last_lines[:max_lines]


def _draw_lines(draw, lines, font, x, y, color, *, width=None, align="left", leading=1.12):
    line_h = int(getattr(font, "size", 36) * leading)
    for line in lines:
        tw = draw.textbbox((0, 0), line, font=font)[2]
        px = x
        if align == "center":
            px = x + ((width or 0) - tw) // 2
        draw.text((px, y), line, font=font, fill=color)
        y += line_h
    return y


def _photo(img_bytes, size, focus=(0.5, 0.45)):
    if not img_bytes:
        return Image.new("RGBA", size, CACAO)
    return crop_photo(Image.open(BytesIO(img_bytes)), size, focus=focus).convert("RGBA")


def _tonal_dissolve(canvas, color, start_y, end_y):
    """Integra fotografia e base editorial sem criar uma mancha sob a copy."""
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    span = max(1, end_y - start_y)
    for y in range(start_y, end_y + 1):
        progress = (y - start_y) / span
        alpha = int(255 * (progress ** 1.65))
        draw.line((0, y, W, y), fill=(*color[:3], alpha))
    canvas.alpha_composite(overlay)


def _rounded_photo(img_bytes, size, radius=26, focus=(0.5, 0.45)):
    photo = _photo(img_bytes, size, focus)
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    photo.putalpha(mask)
    return photo


def _brand(draw, light=True):
    color = (236, 229, 218, 150) if light else (64, 54, 48, 145)
    draw.text((MX, 42), "@ISABELLA.DALCIN", font=_font(F_REGULAR, 16), fill=color)


def _sentences(text):
    parts = [part.strip() for part in re.split(r"(?<=[.!?])\s+", clean_editorial_copy(text)) if part.strip()]
    return parts or [""]


def _body_with_turn(draw, body, x, y, width, *, centered=True, color=CREAM, start=36):
    """A primeira frase explica; a última recebe ênfase quando há uma virada."""
    parts = _sentences(editorial_excerpt(body, 40))
    align = "center" if centered else "left"
    first = " ".join(parts[:-1]) if len(parts) > 1 else parts[0]
    turn = parts[-1] if len(parts) > 1 else ""
    ff, fl = _fit(draw, first, F_REGULAR, start, 27, width, 5)
    y = _draw_lines(draw, fl, ff, x, y, color, width=width, align=align, leading=1.22)
    if turn:
        y += 10
        tf, tl = _fit(draw, turn, F_BOLD, start, 27, width, 3)
        y = _draw_lines(draw, tl, tf, x, y, color, width=width, align=align, leading=1.16)
    return y


def _cover(img_bytes, title, body, closing=False):
    canvas = Image.new("RGBA", (W, H), CHARCOAL)
    photo_h = 835 if closing else 940
    canvas.alpha_composite(_photo(img_bytes, (W, photo_h), (0.5, 0.44)), (0, 0))
    if closing:
        _tonal_dissolve(canvas, CHARCOAL, 690, 835)
    else:
        _tonal_dissolve(canvas, CHARCOAL, 790, 940)
    draw = ImageDraw.Draw(canvas)
    _brand(draw, True)

    text_y = 840 if closing else 925
    title_start = 66 if closing else 64
    tf, tl = _fit(draw, title, F_BOLD, title_start, 43, W - 150, 3)
    y = _draw_lines(draw, tl, tf, 75, text_y, CREAM, width=W - 150, align="center", leading=1.06)
    y += 20
    _body_with_turn(draw, body, 92, y, W - 184, centered=True, color=CREAM, start=34)
    return canvas


def _development(img_bytes, title, body, variant=0):
    bg = CACAO if variant else CHARCOAL
    canvas = Image.new("RGBA", (W, H), bg)
    draw = ImageDraw.Draw(canvas)
    _brand(draw, True)

    tf, tl = _fit(draw, title, F_BOLD, 54, 38, W - 170, 2)
    _draw_lines(draw, tl, tf, 85, 92, CREAM, width=W - 170, align="center", leading=1.05)

    image_y = 218
    canvas.alpha_composite(_rounded_photo(img_bytes, (920, 535), 28, (0.5, 0.44)), (80, image_y))
    draw = ImageDraw.Draw(canvas)
    _body_with_turn(draw, body, 92, 810, W - 184, centered=True, color=CREAM, start=36)
    return canvas


def _pause(title, body):
    canvas = Image.new("RGBA", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)
    _brand(draw, False)

    tf, tl = _fit(draw, title, F_SERIF, 94, 56, W - 170, 4)
    y = _draw_lines(draw, tl, tf, 85, 230, INK, width=W - 170, align="center", leading=.98)
    draw.rectangle((450, y + 42, 630, y + 47), fill=TERRA)
    bf, bl = _fit(draw, editorial_excerpt(body, 38), F_REGULAR, 36, 28, 760, 6)
    _draw_lines(draw, bl, bf, 160, y + 102, INK, width=760, align="center", leading=1.24)
    return canvas


def render_bella_essential(img_bytes, title, body, slide_no, preset=None):
    """Renderiza uma sequência curta; durações maiores repetem o ritmo, não a cena."""
    n = max(1, int(slide_no))
    title = clean_editorial_copy(title)
    body = clean_editorial_copy(body)
    if n == 1:
        canvas = _cover(img_bytes, title, body)
    elif n == 4:
        canvas = _pause(title, body)
    elif n == 5:
        canvas = _cover(img_bytes, title, body, closing=True)
    else:
        canvas = _development(img_bytes, title, body, variant=n % 2)
    return canvas.convert("RGB")
