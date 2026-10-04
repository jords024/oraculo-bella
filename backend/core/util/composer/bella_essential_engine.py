"""Bella Essencial — composição simples, sem improviso visual.

Uma imagem forte conduz a emoção. A tipografia, sempre renderizada pelo
sistema, organiza a leitura em três famílias: capa, desenvolvimento e pausa.
"""

from io import BytesIO
import re

from PIL import Image, ImageDraw, ImageFont

from .presets import W, H, F_BOLD, F_REGULAR, F_SERIF, F_SERIF_IT
from .art_director import crop_photo, clean_editorial_copy, editorial_excerpt, rgba_to_hex


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


def _family_of(path):
    """Nomeia a família (serif = Playfair Display, sans = Inter) para o editor web."""
    return "serif" if path in (F_SERIF, F_SERIF_IT) else "sans"


def _report_block(report, role, x, y, width, height, font, path, color, align, content):
    """`font` é o objeto Pillow já carregado (para ler o tamanho real após o auto-fit);
    `path` é a constante de arquivo (F_BOLD/F_REGULAR/F_SERIF/F_SERIF_IT) usada para escolhê-lo."""
    if report is None:
        return
    weight = {"title": 600, "body": 400, "watermark": 500}.get(role, 400)
    report.append({
        "role": role, "x": int(x), "y": int(y), "width": int(width), "height": int(height),
        "fontSize": int(getattr(font, "size", 36)),
        "fontFamily": _family_of(path), "fontWeight": weight, "fontStyle": "normal",
        "color": rgba_to_hex(color), "align": align, "content": content,
    })


def _report_shape(report, name, x, y, width, height, fill, opacity=1, radius=0, blur=0):
    if report is None:
        return
    report.append({
        "role": "shape", "name": name, "x": x, "y": y, "width": width, "height": height,
        "rotation": 0, "opacity": opacity, "locked": False, "visible": True,
        "fill": fill, "radius": radius, "blur": blur, "stroke": "", "strokeWidth": 0,
    })


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


def _body_with_turn(draw, body, x, y, width, *, centered=True, color=CREAM, start=36, report=None):
    """A primeira frase explica; a última recebe ênfase quando há uma virada."""
    y0 = y
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
    # As duas frases (explicação + virada em negrito) viram um único bloco editável
    # no relatório — o destaque em negrito automático não é reconstruído no editor.
    _report_block(report, "body", x, y0, width, max(1, y - y0), ff, F_REGULAR, color, align, body)
    return y


def _cover(img_bytes, title, body, closing=False, report=None):
    canvas = _photo(img_bytes, (W, H), (0.56, 0.44))
    veil = Image.new("RGBA", (W, H), (24, 30, 24, 72 if not closing else 92))
    canvas = Image.alpha_composite(canvas, veil)
    draw = ImageDraw.Draw(canvas)
    _brand(draw, True)
    _report_shape(report, "Atmosfera mineral", 0, 0, W, H, "#181e18", .28 if not closing else .36)
    _report_block(report, "watermark", MX, 42, 320, 24, _font(F_REGULAR, 16), F_REGULAR, (236, 229, 218, 255), "left", "@ISABELLA.DALCIN")

    text_y = 725 if closing else 190
    title_start = 76 if closing else 82
    title_width = 760
    # Capa trava em 3 linhas (contrato do Oráculo): 4 linhas em fonte grande
    # cobria boa parte da foto e enfeava a composição.
    tf, tl = _fit(draw, title, F_SERIF, title_start, 46, title_width, 3)
    y = _draw_lines(draw, tl, tf, 72, text_y, CREAM, width=title_width, align="left", leading=1.0)
    _report_block(report, "title", 72, text_y, title_width, max(1, y - text_y), tf, F_SERIF, CREAM, "left", title)
    body_y = max(930, y + 70) if not closing else min(1080, y + 46)
    _body_with_turn(draw, body, 78, body_y, 650, centered=False, color=CREAM, start=31, report=report)
    return canvas


def _development(img_bytes, title, body, variant=0, report=None):
    # Desenvolvimento editorial assimétrico. A versão anterior criava sempre
    # o mesmo sanduíche (título central / foto / texto central), apagando a
    # tensão visual específica da cena. Agora a fotografia, a copy e a matéria
    # ocupam zonas diferentes e são reportadas como camadas reais ao Estúdio.
    if variant:
        bg = CACAO
        canvas = Image.new("RGBA", (W, H), bg)
        draw = ImageDraw.Draw(canvas)
        _brand(draw, True)
        if report is not None:
            report.append({"role": "canvas_background", "color": rgba_to_hex(bg)})
        _report_block(report, "watermark", MX, 42, 320, 24, _font(F_REGULAR, 16), F_REGULAR, (236, 229, 218, 255), "left", "@ISABELLA.DALCIN")

        photo_x, photo_y, photo_w, photo_h = 56, 230, 570, 820
        canvas.alpha_composite(_rounded_photo(img_bytes, (photo_w, photo_h), 34, (0.48, 0.43)), (photo_x, photo_y))
        if report is not None:
            report.append({
                "role": "image", "name": "Cena editorial", "x": photo_x, "y": photo_y,
                "width": photo_w, "height": photo_h, "sourceRole": "raw", "fit": "cover",
                "focusX": 48, "focusY": 43, "radius": 34, "aspectLocked": True,
            })
        draw = ImageDraw.Draw(canvas)
        draw.rectangle((612, 190, 620, 350), fill=TERRA)
        _report_shape(report, "Traço terracota", 612, 190, 8, 160, "#b8623e", .95, 4, 0)
        tf, tl = _fit(draw, title, F_SERIF, 72, 44, 410, 5)
        title_y = 174
        title_end = _draw_lines(draw, tl, tf, 650, title_y, CREAM, width=390, align="left", leading=.98)
        _report_block(report, "title", 650, title_y, 390, max(1, title_end - title_y), tf, F_SERIF, CREAM, "left", title)
        _body_with_turn(draw, body, 650, max(720, title_end + 82), 350, centered=False, color=MUTED, start=31, report=report)
        return canvas

    bg = CREAM
    canvas = Image.new("RGBA", (W, H), bg)
    draw = ImageDraw.Draw(canvas)
    _brand(draw, False)
    if report is not None:
        report.append({"role": "canvas_background", "color": rgba_to_hex(bg)})
    _report_block(report, "watermark", MX, 42, 320, 24, _font(F_REGULAR, 16), F_REGULAR, (64, 54, 48, 255), "left", "@ISABELLA.DALCIN")

    # A cena rompe o eixo central e deixa um campo editorial verdadeiro para a copy.
    photo_x, photo_y, photo_w, photo_h = 548, 356, 430, 650
    canvas.alpha_composite(_rounded_photo(img_bytes, (photo_w, photo_h), 30, (0.55, 0.43)), (photo_x, photo_y))
    if report is not None:
        report.append({
            "role": "image", "name": "Cena editorial", "x": photo_x, "y": photo_y,
            "width": photo_w, "height": photo_h, "sourceRole": "raw", "fit": "cover",
            "focusX": 55, "focusY": 43, "radius": 30, "aspectLocked": True,
        })
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((74, 720, 82, 884), fill=TERRA)
    _report_shape(report, "Traço terracota", 74, 720, 8, 164, "#b8623e", .95, 4, 0)
    tf, tl = _fit(draw, title, F_SERIF, 70, 40, 460, 5)
    title_y = 126
    title_end = _draw_lines(draw, tl, tf, 74, title_y, INK, width=630, align="left", leading=.96)
    _report_block(report, "title", 74, title_y, 460, max(1, title_end - title_y), tf, F_SERIF, INK, "left", title)
    _body_with_turn(draw, body, 108, 720, 350, centered=False, color=INK, start=29, report=report)
    return canvas


def _pause(title, body, report=None):
    canvas = Image.new("RGBA", (W, H), CREAM)
    draw = ImageDraw.Draw(canvas)
    _brand(draw, False)
    # Esta lâmina é fundo sólido, não foto — o editor precisa saber disso para não
    # colocar a imagem crua (irrelevante aqui) como camada de fundo.
    if report is not None:
        report.append({"role": "canvas_background", "color": rgba_to_hex(CREAM)})
    _report_block(report, "watermark", MX, 42, 320, 24, _font(F_REGULAR, 16), F_REGULAR, (64, 54, 48, 255), "left", "@ISABELLA.DALCIN")

    tf, tl = _fit(draw, title, F_SERIF, 94, 56, W - 170, 4)
    y = _draw_lines(draw, tl, tf, 85, 230, INK, width=W - 170, align="center", leading=.98)
    _report_block(report, "title", 85, 230, W - 170, max(1, y - 230), tf, F_SERIF, INK, "center", title)
    draw.rectangle((450, y + 42, 630, y + 47), fill=TERRA)
    excerpt = editorial_excerpt(body, 38)
    bf, bl = _fit(draw, excerpt, F_REGULAR, 36, 28, 760, 6)
    body_y = y + 102
    _draw_lines(draw, bl, bf, 160, body_y, INK, width=760, align="center", leading=1.24)
    _report_block(report, "body", 160, body_y, 760, max(1, len(bl) * int(getattr(bf, "size", 36) * 1.24)), bf, F_REGULAR, INK, "center", excerpt)
    return canvas


def render_bella_essential(img_bytes, title, body, slide_no, preset=None, report=None):
    """Renderiza uma sequência curta; durações maiores repetem o ritmo, não a cena."""
    n = max(1, int(slide_no))
    title = clean_editorial_copy(title)
    body = clean_editorial_copy(body)
    if n == 1:
        canvas = _cover(img_bytes, title, body, report=report)
    elif n == 4:
        canvas = _pause(title, body, report=report)
    elif n == 5:
        canvas = _cover(img_bytes, title, body, closing=True, report=report)
    else:
        canvas = _development(img_bytes, title, body, variant=n % 2, report=report)
    return canvas.convert("RGB")
