"""Bella Tipográfico — sistema editorial de tipografia em vozes.

Em vez de templates fixos (foto + faixa escura), cada lâmina é montada por um
arquétipo que mistura vozes tipográficas na mesma frase (sans leve, serifa
monumental, itálico, sans ultrapesada), caixas de destaque, fragmentos de
citação, objetos de medida e escalada de escala — a gramática das referências
da Bella. O texto é sempre renderizado pelo sistema (acentos e edição
posterior preservados) e cada linha vira camada editável no Estúdio.

Marcação aceita no TÍTULO/CORPO: **conceito** (voz monumental), *itálico*.
"""

import base64
import hashlib
import re
from io import BytesIO

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageStat

from .art_director import crop_photo, rgba_to_hex
from .presets import W, H
from ..fonts import ASSETS_FONT_DIR

INTER = str(ASSETS_FONT_DIR / "Inter-Regular.ttf")
INTER_BOLD = str(ASSETS_FONT_DIR / "Inter-Bold.ttf")
SERIF = str(ASSETS_FONT_DIR / "PlayfairDisplay-Regular.ttf")
SERIF_IT = str(ASSETS_FONT_DIR / "PlayfairDisplay-Italic.ttf")
OSWALD = str(ASSETS_FONT_DIR / "Oswald-Bold.ttf")

MARGIN = 88

# voz -> (arquivo, tracking em em, engrossamento em em, entrelinha, família web, peso web, estilo web)
VOICES = {
    "light": (INTER, -0.012, 0.0, 1.14, "sans", 400, "normal"),
    "semi": (INTER_BOLD, -0.012, 0.0, 1.12, "sans", 700, "normal"),
    "display": (SERIF, -0.042, 0.0, 0.9, "serif", 400, "normal"),
    "italic": (SERIF_IT, -0.04, 0.0, 0.9, "serif", 400, "italic"),
    "heavy": (INTER_BOLD, -0.03, 0.02, 0.9, "sans", 800, "normal"),
    "cap": (OSWALD, 0.1, 0.0, 1.1, "condensed", 700, "normal"),
}

PALETTES = {
    "papel": dict(bg=(244, 238, 226), ink=(38, 33, 29), accent=(184, 98, 62), paper=(253, 250, 244)),
    "musgo": dict(bg=(233, 228, 214), ink=(30, 56, 45), accent=(198, 94, 36), paper=(251, 248, 240)),
    "areia": dict(bg=(226, 214, 196), ink=(46, 34, 28), accent=(160, 70, 40), paper=(248, 242, 232)),
    "cacau": dict(bg=(37, 28, 24), ink=(246, 239, 227), accent=(214, 124, 80), paper=(60, 47, 41)),
    "foto": dict(bg=(30, 26, 22), ink=(250, 246, 238), accent=(222, 128, 84), paper=(250, 246, 238)),
}

_font_cache = {}


def _font(path, size):
    key = (path, int(size))
    if key not in _font_cache:
        try:
            _font_cache[key] = ImageFont.truetype(path, int(size))
        except Exception:
            _font_cache[key] = ImageFont.load_default()
    return _font_cache[key]


def _rgb(color):
    return tuple(int(c) for c in color[:3])


def _alpha(color, a):
    return (*_rgb(color), int(a))


# ── Marcação ───────────────────────────────────────────────────────────────────

def clean_copy(value):
    """Limpa marcas técnicas preservando a marcação de ênfase (**conceito**, *itálico*)."""
    text = str(value or "").replace("\\n", "\n")
    text = re.sub(r"\[\[(.+?)\]\]", r"**\1**", text, flags=re.S)
    text = re.sub(r"__|`", "", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    return re.sub(r"[ \t]+", " ", text).strip()


def parse_voices(text):
    """Retorna lista de (palavra, estilo) com estilo em {'pl','em','it'}; quebra de linha vira ('', 'br')."""
    tokens = []
    for em, it, plain in re.findall(r"\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)", text or "", flags=re.S):
        if em:
            style, chunk = "em", em
        elif it:
            style, chunk = "it", it
        else:
            style, chunk = "pl", plain
        glue = bool(tokens) and style == "pl" and chunk[:1] not in ("", " ", "\n", "\t")
        for line_idx, part in enumerate(chunk.split("\n")):
            if line_idx:
                tokens.append(("", "br"))
            for word_idx, word in enumerate(part.split()):
                if glue and word_idx == 0 and line_idx == 0 and tokens[-1][1] != "br":
                    tokens[-1] = (tokens[-1][0] + word, tokens[-1][1])
                else:
                    tokens.append((word, style))
    return tokens


def strip_markup(text):
    return re.sub(r"\*+|\[\[|\]\]", "", text or "").strip()


def auto_markup(text):
    """Quando o roteiro não marca ênfase, escolhe uma palavra-conceito e fecha em itálico."""
    if "*" in (text or ""):
        return text
    words = text.split()
    if len(words) < 3:
        return text
    last = words[-1]
    core_last = last.rstrip(".,;:!?…")
    tail = last[len(core_last):]
    candidates = [(len(re.sub(r"\W", "", w)), i) for i, w in enumerate(words[:-1]) if len(re.sub(r"\W", "", w)) >= 7]
    if candidates:
        _, idx = max(candidates)
        words[idx] = f"**{words[idx]}**"
    words[-1] = f"*{core_last}*{tail}"
    return " ".join(words)


def sentence_lines(text):
    """Uma frase por linha: o corpo respira como nas referências."""
    parts = [p.strip() for p in re.split(r"(?<=[.!?…])\s+|\n+", text or "") if p.strip()]
    return "\n".join(parts)


# ── Fluxo de linhas ────────────────────────────────────────────────────────────

class Line:
    def __init__(self, runs):
        self.runs = runs
        self.width = 0.0
        self.pitch = 0.0


def _adv(text, voice, size):
    path, tracking = VOICES[voice][0], VOICES[voice][1]
    return _font(path, size).getlength(text) + tracking * size * len(text)


def _space(voice, size):
    return _font(VOICES[voice][0], size).getlength(" ") * 0.9


def _measure_line(line):
    width = 0.0
    for i, run in enumerate(line.runs):
        width += _adv(run["word"], run["voice"], run["size"])
        if i < len(line.runs) - 1:
            width += _space(run["voice"], run["size"])
    line.width = width
    line.pitch = max(r["size"] * VOICES[r["voice"]][3] for r in line.runs)
    return line


def build_lines(tokens, plan, max_w, scale=1.0, em_own_line=True):
    """plan: {'pl': (voz, tamanho), 'em': (...), 'it': (...)}."""
    lines, current = [], []

    def flush():
        nonlocal current
        if current:
            lines.append(_measure_line(Line(current)))
            current = []

    def make(word, style):
        voice, size = plan[style]
        return {"word": word, "voice": voice, "size": size * scale, "style": style}

    for word, style in tokens:
        if style == "br":
            flush()
            continue
        if style != "pl" and em_own_line:
            flush()
            lines.append(_measure_line(Line([make(word, style)])))
            continue
        run = make(word, style)
        trial = _measure_line(Line(current + [run]))
        if current and trial.width > max_w:
            flush()
        current.append(run)
    flush()
    return lines


def fit_lines(tokens, plan, max_w, max_h, em_own_line=True, floor=0.45):
    scale = 1.0
    while True:
        lines = build_lines(tokens, plan, max_w, scale, em_own_line)
        height = sum(l.pitch for l in lines)
        widest = max((l.width for l in lines), default=0)
        if (widest <= max_w and height <= max_h) or scale <= floor:
            return lines, scale
        scale *= 0.96


def _cap_height(voice, size):
    return -_font(VOICES[voice][0], size).getbbox("H", anchor="ls")[1]


def _block_height(lines):
    return sum(l.pitch for l in lines)


# ── Desenho ────────────────────────────────────────────────────────────────────

def _draw_run(draw, x, baseline, word, voice, size, fill):
    path, tracking, bold = VOICES[voice][0], VOICES[voice][1], VOICES[voice][2]
    font = _font(path, size)
    stroke = max(0, round(bold * size))
    track = tracking * size
    for i, ch in enumerate(word):
        px = x + font.getlength(word[:i]) + track * i
        draw.text((px, baseline), ch, font=font, fill=fill, anchor="ls",
                  stroke_width=stroke, stroke_fill=fill if stroke else None)


def draw_lines(draw, lines, x, y, max_w, fill, align="left", indents=None, boxes=None,
               report=None, name="Título", role="title", rotation=0):
    """Desenha linhas e devolve o y final. `y` é o topo das maiúsculas da 1ª linha."""
    cursor = y
    for idx, line in enumerate(lines):
        top_run = max(line.runs, key=lambda r: r["size"])
        cap = _cap_height(top_run["voice"], top_run["size"])
        baseline = cursor + cap
        indent = indents[idx % len(indents)] if indents and line.runs[0]["style"] != "pl" else 0
        if align == "center":
            lx = x + (max_w - line.width) / 2
        elif align == "right":
            lx = x + max_w - line.width
        else:
            lx = x + indent
        if boxes:
            pad_x, pad_top, pad_bottom, color = boxes
            draw.rectangle((lx - pad_x, baseline - cap - pad_top, lx + line.width + pad_x,
                            baseline + top_run["size"] * 0.24 + pad_bottom), fill=color)
        cx = lx
        for i, run in enumerate(line.runs):
            _draw_run(draw, cx, baseline, run["word"], run["voice"], run["size"], fill)
            cx += _adv(run["word"], run["voice"], run["size"])
            if i < len(line.runs) - 1:
                cx += _space(run["voice"], run["size"])
        if report is not None:
            voice = top_run["voice"]
            report.append({
                "role": role, "id": f"{role}-line-{idx + 1}", "name": f"{name} {idx + 1}",
                "x": int(lx), "y": int(baseline - cap - top_run["size"] * 0.12),
                "width": int(line.width + 12), "height": int(top_run["size"] * 1.12),
                "rotation": rotation, "fontSize": int(top_run["size"]),
                "fontFamily": VOICES[voice][4], "fontWeight": VOICES[voice][5], "fontStyle": VOICES[voice][6],
                "lineHeight": 1.0, "letterSpacing": round(VOICES[voice][1] * top_run["size"], 2),
                "color": rgba_to_hex(fill), "align": "left",
                "content": " ".join(r["word"] for r in line.runs),
            })
        cursor += line.pitch
    return cursor


def _hidden_source(report, role, content):
    """Mantém `title`/`body` completos no documento para sincronizar o meta ao salvar."""
    if report is None:
        return
    report.append({
        "role": role, "id": role, "name": "Texto completo (fonte)", "x": 0, "y": 0, "width": 10, "height": 10,
        "visible": False, "locked": True, "fontSize": 12, "fontFamily": "sans", "fontWeight": 400,
        "fontStyle": "normal", "color": "#000000", "align": "left", "content": strip_markup(content),
    })


def _grain(img, amount=0.07):
    noise = Image.effect_noise(img.size, 38).convert("RGB")
    base = img.convert("RGB")
    return Image.blend(base, ImageChops.overlay(base, noise), amount).convert("RGBA")


def _paper(pal):
    canvas = Image.new("RGBA", (W, H), (*pal["bg"], 255))
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse((-200, -260, W + 200, int(H * 0.8)), fill=26)
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    tint = Image.new("RGBA", (W, H), (255, 255, 255, 255))
    tint.putalpha(glow)
    canvas = Image.alpha_composite(canvas, tint)
    return _grain(canvas, 0.09 if pal["bg"][0] > 120 else 0.05)


def _micro(draw, pal, report, top=True, bottom=True, color=None, left="@ISABELLA.DALCIN", right="ACADEMIA SETE"):
    color = color or pal["ink"]
    size = 17
    font = _font(INTER, size)
    track = 1.2

    def put(text, x, y, align):
        total = font.getlength(text) + track * len(text)
        px = x if align == "left" else x - total
        for i, ch in enumerate(text):
            draw.text((px + font.getlength(text[:i]) + track * i, y), ch, font=font, fill=_alpha(color, 235))
        if report is not None:
            report.append({
                "role": "watermark", "id": f"micro-{y}-{align}", "name": "Assinatura",
                "x": int(px), "y": int(y - 3), "width": int(total + 8), "height": 26, "opacity": .92,
                "fontSize": size, "fontFamily": "sans", "fontWeight": 500, "fontStyle": "normal",
                "letterSpacing": track, "color": rgba_to_hex(color), "align": "left", "content": text,
            })

    for enabled, y in ((top, 50), (bottom, H - 66)):
        if enabled:
            put(left, MARGIN, y, "left")
            put(right, W - MARGIN, y, "right")


# ── Objetos: régua de medida ───────────────────────────────────────────────────

def _ruler_image(length, thickness, ink, paper, ticks=44, bare=False):
    layer = Image.new("RGBA", (length, thickness), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if bare:
        d.line((0, 2, length, 2), fill=(*_rgb(ink), 120), width=3)
    else:
        d.rectangle((0, 0, length, thickness), fill=(*_rgb(paper), 235))
    step = length / ticks
    num_font = _font(OSWALD, int(thickness * 0.26))
    for i in range(ticks + 1):
        x = i * step
        long_tick, mid_tick = i % 10 == 0, i % 5 == 0
        h = thickness * (0.46 if long_tick else 0.34 if mid_tick else 0.22)
        tone = 120 if bare else 235
        d.line((x, 0, x, h), fill=(*_rgb(ink), tone), width=4 if long_tick else 3)
        if long_tick:
            d.text((x + 8, h + 4), str(i // 10), font=num_font, fill=(*_rgb(ink), tone))
    noise = Image.effect_noise((length, thickness), 70).convert("L").point(lambda v: 255 if v > 118 else 205)
    layer.putalpha(ImageChops.multiply(layer.getchannel("A"), noise))
    return layer.filter(ImageFilter.GaussianBlur(0.7))


def _data_uri(img, max_side=900):
    thumb = img.copy()
    thumb.thumbnail((max_side, max_side))
    try:
        thumb = thumb.quantize(colors=32, method=Image.Quantize.FASTOCTREE)
    except Exception:
        pass
    buf = BytesIO()
    thumb.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def _place_ruler(canvas, report, pal, center, angle, length=980, thickness=150, seed=1, name="Régua", bare=False):
    layer = _ruler_image(length, thickness, pal["ink"], pal["paper"], bare=bare)
    rotated = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    x = int(center[0] - rotated.width / 2)
    y = int(center[1] - rotated.height / 2)
    if not bare:
        shadow = Image.new("RGBA", rotated.size, (0, 0, 0, 0))
        shadow.putalpha(rotated.getchannel("A").point(lambda v: int(v * 0.22)))
        shadow = shadow.filter(ImageFilter.GaussianBlur(10))
        canvas.paste(shadow, (x + 6, y + 12), shadow)
    canvas.paste(rotated, (x, y), rotated)
    if report is not None:
        report.append({
            "role": "image", "id": f"objeto-{name.lower()}-{seed}", "name": f"{name} (objeto)",
            "x": x, "y": y, "width": rotated.width, "height": rotated.height,
            "src": _data_uri(rotated), "sourceRole": "object", "fit": "contain", "aspectLocked": True,
        })


# ── Fotografia ─────────────────────────────────────────────────────────────────

def _edge_energy(img, box):
    gray = img.convert("L").filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES)
    return ImageStat.Stat(gray.crop(box)).mean[0]


def _calm_side(photo):
    small = photo.resize((W // 4, H // 4))
    sw, sh = small.size
    box_l = (0, int(sh * .18), int(sw * .58), int(sh * .78))
    box_r = (int(sw * .42), int(sh * .18), sw, int(sh * .78))
    return "left" if _edge_energy(small, box_l) <= _edge_energy(small, box_r) * 1.08 else "right"


def _region_energy(canvas, box):
    """Quão agitada é a região: desvio-padrão da luz (suavizada). Baixo = área calma para texto."""
    gray = canvas.convert("L").filter(ImageFilter.GaussianBlur(3))
    return ImageStat.Stat(gray.crop(tuple(int(v) for v in box))).stddev[0]


def _calm_height(canvas, x0, x1, top, limit_h, step=60):
    """Altura, a partir de `top`, em que a faixa ainda está calma (o sujeito ainda não apareceu)."""
    for y in range(int(top), min(H, int(top + limit_h)), step):
        if _region_energy(canvas, (x0, y, x1, min(H, y + step))) > 34:
            return max(0, y - int(top))
    return limit_h


def _calm_height_up(canvas, x0, x1, bottom, limit_h, step=60):
    """Altura calma subindo a partir de `bottom`."""
    for k in range(0, int(limit_h), step):
        y1 = int(bottom - k)
        if _region_energy(canvas, (x0, max(0, y1 - step), x1, y1)) > 34:
            return k
    return limit_h


def _luminance(img, box):
    return ImageStat.Stat(img.convert("L").crop(box)).mean[0]


def _local_shade(canvas, box, strength, report=None):
    if strength <= 0:
        return
    pad = 110
    if report is not None:
        report.append({
            "role": "shape", "id": "sombra-local", "name": "Sombra local de leitura",
            "x": int(box[0] - pad / 2), "y": int(box[1] - pad / 2), "width": int(box[2] - box[0] + pad),
            "height": int(box[3] - box[1] + pad), "fill": "#0e0c0a", "opacity": round(strength, 2),
            "radius": 80, "blur": 80,
        })
    mask = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(mask).rectangle((box[0] - pad / 2, box[1] - pad / 2, box[2] + pad / 2, box[3] + pad / 2),
                                   fill=int(255 * strength))
    mask = mask.filter(ImageFilter.GaussianBlur(80))
    shade = Image.new("RGBA", canvas.size, (14, 12, 10, 255))
    shade.putalpha(mask)
    canvas.alpha_composite(shade)


def _photo_or_paper(img_bytes):
    if img_bytes:
        return crop_photo(Image.open(BytesIO(img_bytes)), (W, H), focus=(0.5, 0.45)).convert("RGBA"), True
    return None, False


def _text_ink(canvas, box):
    """Escolhe cor do texto e sombra local pelo contraste real da região."""
    lum = _luminance(canvas, box)
    energy = _edge_energy(canvas, box)
    if lum > 175 and energy < 14:
        return (28, 24, 20), 0.0
    if lum < 95 and energy < 8:
        return (250, 246, 238), 0.0
    shade = 0.26 + max(0.0, (lum - 100) / 150) + min(0.18, energy / 70)
    return (250, 246, 238), min(0.7, shade)


# ── Arquétipos ─────────────────────────────────────────────────────────────────

def _split_body(body):
    return [p.strip() for p in re.split(r"(?<=[.!?…])\s+|\n+", clean_copy(body)) if p.strip()]


def render_cover(img_bytes, title, body, pal_name, report, closing=False, spec=None, middle=False):
    spec = spec or {}
    compact = closing or middle
    canvas, has_photo = _photo_or_paper(img_bytes)
    if has_photo:
        pal = PALETTES["foto"]
    else:
        pal = PALETTES.get(pal_name if pal_name not in (None, "foto") else "papel")
        canvas = _paper(pal)
        if report is not None:
            report.append({"role": "canvas_background", "color": rgba_to_hex(pal["bg"])})

    side = spec.get("text_side") if spec.get("text_side") in ("left", "right") else (_calm_side(canvas) if has_photo else "left")
    zone = spec.get("text_zone") if spec.get("text_zone") in ("topo", "base") else None
    if closing:
        zone = "topo" if zone else None
    col_w = 904 if zone else (600 if not compact else 640)
    x0 = MARGIN if (zone or side == "left") else W - MARGIN - col_w
    top = 190 if zone == "topo" else (330 if not compact else 230)

    parts = _split_body(body)
    cta = None
    if closing:
        cta = next((p for p in parts if "COMENTE" in p.upper()), None) or "COMENTE BELLA"
        parts = [p for p in parts if "COMENTE" not in p.upper()]
    body_text = sentence_lines(" ".join(parts[:3]))

    cta_h = 250 if closing else 0
    b_plan = {"pl": ("light", 34), "em": ("semi", 34), "it": ("light", 34)}
    b_w = 600 if closing else 540
    body_tokens = parse_voices(body_text)
    b_lines = fit_lines(body_tokens, b_plan, b_w, 240, em_own_line=False)[0] if body_text else []
    b_h = _block_height(b_lines)
    avail = (H - 150 - cta_h) - top - (b_h + 60 if b_lines else 0)

    plan = {
        "pl": ("light", 60 if not compact else 54),
        "em": ("display", 172 if not compact else 140),
        "it": ("italic", 156 if not compact else 128),
    }
    title_tokens = parse_voices(auto_markup(title))
    body_y = None

    if zone and has_photo:
        # Decide antes de desenhar: zona calma, tamanho do título e posição do corpo.
        probe_w = min(col_w, 640)  # o texto é alinhado à esquerda: mede só a coluna que ele ocupa
        spans = {"topo": _calm_height(canvas, x0, x0 + probe_w, 190, 620),
                 "base": _calm_height_up(canvas, x0, x0 + probe_w, H - 170, 620)}
        if not closing:
            zone = "base" if spans["base"] > 1.1 * spans["topo"] else "topo"
        span = spans[zone]
        top = 190 if zone == "topo" else top
        extra = (54 + b_h) if b_lines else 0
        cap = max(150, min(430, span - (extra if zone == "base" else 0)))
        lines, _ = fit_lines(title_tokens, plan, col_w, cap)
        height = _block_height(lines)
        if zone == "topo" and b_lines:
            end_est = top + height
            limit_y = H - 360 if closing else H - 230
            narrow = fit_lines(body_tokens, b_plan, 380, 320, em_own_line=False)[0]
            best = None
            for width_v, lines_v in ((b_w, b_lines), (380, narrow)):
                h_v = _block_height(lines_v)
                ys = [limit_y - h_v]
                if end_est + 54 + h_v <= limit_y:
                    ys.append(end_est + 54)
                for y_v in ys:
                    cost = _region_energy(canvas, (x0, y_v, x0 + width_v, y_v + h_v))
                    if width_v != b_w:
                        cost *= 1.15
                    if best is None or cost < best[0]:
                        best = (cost, width_v, lines_v, y_v)
            cost, b_w_pick, b_lines_pick, y_pick = best
            if cost > 35 and span - 54 - b_h >= 150:
                # tudo embaixo está agitado: aperta o título e põe o corpo logo abaixo, no trecho calmo
                lines, _ = fit_lines(title_tokens, plan, col_w, span - 54 - b_h)
                height = _block_height(lines)
                body_y = top + height + 54
            else:
                b_w, b_lines, body_y = b_w_pick, b_lines_pick, y_pick
            b_h = _block_height(b_lines)
        elif zone == "base":
            top = H - 170 - (height + extra)
            body_y = top + height + 54
    else:
        lines, _ = fit_lines(title_tokens, plan, col_w, 430 if zone else min(720, avail))
        height = _block_height(lines)
        if zone == "base":
            top = H - 170 - (height + (54 + b_h if b_lines else 0))

    ink = pal["ink"]
    if has_photo:
        region = (int(x0), top, int(x0 + col_w), int(top + height))
        ink, shade = _text_ink(canvas, region)
        _local_shade(canvas, region, shade, report)
    draw = ImageDraw.Draw(canvas)
    _micro(draw, pal, report, color=ink)
    end = draw_lines(draw, lines, x0, top, col_w, ink, indents=[0, 16, 0, 10], report=report)
    _hidden_source(report, "title", title)

    if b_lines:
        if body_y is not None:
            by = body_y
        elif zone == "base" or closing:
            by = end + 54
        else:
            by = min(end + 54, H - 250 - b_h)
        ink_b = ink
        if has_photo:
            region_b = (int(x0), int(by), int(x0 + b_w), int(by + b_h))
            ink_b, shade_b = _text_ink(canvas, region_b)
            _local_shade(canvas, region_b, shade_b, report)
        draw_lines(draw, b_lines, x0, by, b_w, ink_b, report=report, name="Corpo", role="body")
        _hidden_source(report, "body", body_text)

    if closing:
        cta_word = "Bella" if "BELLA" in cta.upper() else cta.split()[-1].title()
        base_y = H - 150
        ink_c = ink
        if has_photo:
            region_c = (int(x0), base_y - 180, int(x0 + 560), base_y + 20)
            ink_c, shade_c = _text_ink(canvas, region_c)
            _local_shade(canvas, region_c, shade_c, report)
        draw.text((x0, base_y - 130), "Comente", font=_font(INTER, 40), fill=_alpha(ink_c, 245), anchor="ls")
        _draw_run(draw, x0, base_y, cta_word + ".", "display", 150, pal["accent"])
        if report is not None:
            for nm, y, size, voice, col, content in (
                ("CTA — chamada", base_y - 130, 40, "light", ink_c, "Comente"),
                ("CTA — palavra", base_y, 150, "display", pal["accent"], cta_word + "."),
            ):
                report.append({
                    "role": "body", "id": f"cta-{voice}", "name": nm, "x": int(x0), "y": int(y - size * 0.95),
                    "width": 560, "height": int(size * 1.2), "fontSize": size, "fontFamily": VOICES[voice][4],
                    "fontWeight": VOICES[voice][5], "fontStyle": VOICES[voice][6], "lineHeight": 1.0,
                    "letterSpacing": round(VOICES[voice][1] * size, 2), "color": rgba_to_hex(col), "align": "left",
                    "content": content,
                })
    return canvas


def _extract_fragments(parts):
    quotes, rest = [], []
    for part in parts:
        if re.match(r'^[“"«].+[”"»]\.?$', part.strip()):
            quotes.append(part.strip())
        else:
            rest.append(part)
    return quotes, rest


FRAGMENT_SLOTS = [
    dict(x=64, y=330, w=330, rot=-3.2),
    dict(x=800, y=470, w=250, rot=3.8),
    dict(x=60, y=905, w=330, rot=-2.4),
]


def render_fragments(title, body, pal_name, report, spec=None):
    spec = spec or {}
    pal = PALETTES.get(pal_name) or PALETTES["musgo"]
    canvas = _paper(pal)
    if report is not None:
        report.append({"role": "canvas_background", "color": rgba_to_hex(pal["bg"])})
    seed = int(hashlib.md5(title.encode("utf-8")).hexdigest()[:6], 16)

    quotes, rest = _extract_fragments(_split_body(body))
    quotes = [strip_markup(q) for q in (spec.get("fragments") or quotes)][:3]

    _place_ruler(canvas, report, pal, (900, 200), -16, length=960, thickness=140, seed=seed % 5 + 1)
    _place_ruler(canvas, report, pal, (150, 1288), 20, length=780, thickness=140, seed=seed % 7 + 2)

    draw = ImageDraw.Draw(canvas)
    _micro(draw, pal, report, bottom=False)

    plan = {"pl": ("display", 124), "em": ("display", 124), "it": ("italic", 124)}
    lines, _ = fit_lines(parse_voices(auto_markup(title)), plan, 560, 470, em_own_line=False)
    t_height = _block_height(lines)
    t_top = 500 + (400 - t_height) / 2 - 40
    end = draw_lines(draw, lines, 250, t_top, 560, pal["ink"], align="center", report=report)
    _hidden_source(report, "title", title)

    for i, quote in enumerate(quotes):
        slot = FRAGMENT_SLOTS[i % len(FRAGMENT_SLOTS)]
        q_lines, _ = fit_lines(parse_voices(quote), {"pl": ("semi", 46), "em": ("semi", 46), "it": ("semi", 46)},
                               slot["w"], 230, em_own_line=False)
        q_h = int(_block_height(q_lines)) + 30
        layer = Image.new("RGBA", (slot["w"] + 40, q_h + 20), (0, 0, 0, 0))
        draw_lines(ImageDraw.Draw(layer), q_lines, 14, 10, slot["w"], _alpha(pal["ink"], 190), align="center")
        rotated = layer.filter(ImageFilter.GaussianBlur(1.5)).rotate(slot["rot"], expand=True, resample=Image.BICUBIC)
        canvas.paste(rotated, (slot["x"], slot["y"]), rotated)
        if report is not None:
            report.append({
                "role": "body", "id": f"fragmento-{i + 1}", "name": f"Fragmento {i + 1}",
                "x": slot["x"], "y": slot["y"], "width": slot["w"] + 40, "height": q_h, "rotation": slot["rot"],
                "opacity": .78, "fontSize": 46, "fontFamily": "sans", "fontWeight": 700, "fontStyle": "normal",
                "letterSpacing": -0.5, "lineHeight": 1.1, "color": rgba_to_hex(pal["ink"]), "align": "center",
                "content": quote,
            })

    draw = ImageDraw.Draw(canvas)
    if rest:
        # frases separadas por linha; o fecho vira a voz forte
        turn = rest[-1] if len(rest) > 1 else ""
        lead = " ".join(rest[:-1]) if len(rest) > 1 else rest[0]
        text = sentence_lines(lead)
        tokens = parse_voices(text)
        if turn:
            tokens += [("", "br")]
            tokens += parse_voices(turn) if "*" in turn else [(w, "em") for w in turn.split()]
        b_plan = {"pl": ("light", 48), "em": ("semi", 48), "it": ("light", 48)}
        bx, bw = 560, 460
        b_lines, _ = fit_lines(tokens, b_plan, bw - 34, 330, em_own_line=False)
        b_h = _block_height(b_lines)
        by = min(max(end + 90, 850), H - 190 - b_h)
        draw.rectangle((bx, by - 4, bx + 10, by + b_h - 4), fill=pal["accent"])
        draw_lines(draw, b_lines, bx + 34, by, bw - 34, pal["ink"], report=report, name="Corpo", role="body")
        _hidden_source(report, "body", " ".join(rest))
        if report is not None:
            report.append({
                "role": "shape", "id": "barra-acento", "name": "Barra de acento", "x": bx, "y": int(by - 4),
                "width": 10, "height": int(b_h), "fill": rgba_to_hex(pal["accent"]), "radius": 0, "blur": 0,
            })
    return canvas


def _sentence_case(text):
    """Texto escrito todo em CAIXA ALTA volta para caixa normal (maiúscula no início das frases)."""
    letters = [c for c in text if c.isalpha()]
    if len(letters) < 8 or sum(c.isupper() for c in letters) / len(letters) < 0.7:
        return text
    lowered = text.lower()
    return re.sub(r"(^|[.!?…]\s+)([a-zà-ú])", lambda m: m.group(1) + m.group(2).upper(), lowered)


def render_escalation(title, body, pal_name, report, spec=None):
    pal = PALETTES.get(pal_name) or PALETTES["papel"]
    canvas = _paper(pal)
    if report is not None:
        report.append({"role": "canvas_background", "color": rgba_to_hex(pal["bg"])})
    seed = int(hashlib.md5(title.encode("utf-8")).hexdigest()[:6], 16)

    parts = [_sentence_case(part) for part in _split_body(body)]
    argument = parts[0] if parts else ""
    bridge = " ".join(parts[1:])

    _place_ruler(canvas, report, pal, (24, 800), 88, length=760, thickness=130, seed=seed % 5 + 1, bare=True)
    _place_ruler(canvas, report, pal, (W - 24, 840), -88, length=760, thickness=130, seed=seed % 7 + 3, bare=True)

    draw = ImageDraw.Draw(canvas)
    _micro(draw, pal, report)

    y = 190
    if argument:
        a_lines, _ = fit_lines(parse_voices(strip_markup(argument)),
                               {"pl": ("semi", 66), "em": ("semi", 66), "it": ("semi", 66)}, 790, 360, em_own_line=False)
        y = draw_lines(draw, a_lines, MARGIN + 18, y, 790, pal["ink"], boxes=(18, 14, 8, (*_rgb(pal["paper"]), 255)),
                       report=report, name="Argumento", role="body") + 28
        _hidden_source(report, "body", " ".join(parts))
    if bridge:
        br_lines, _ = fit_lines(parse_voices(strip_markup(bridge)),
                                {"pl": ("light", 42), "em": ("light", 42), "it": ("light", 42)}, 640, 150, em_own_line=False)
        y = draw_lines(draw, br_lines, MARGIN + 40, y + 10, 640, pal["ink"], report=report, name="Ponte", role="body") + 8

    plan = {"pl": ("heavy", 168), "em": ("heavy", 168), "it": ("heavy", 168)}
    c_lines, _ = fit_lines(parse_voices(strip_markup(title)), plan, W - 70, 420, em_own_line=False)
    c_top = max(y + 30, H - 190 - _block_height(c_lines))
    draw_lines(draw, c_lines, 36, c_top, W - 70, pal["ink"], report=report, name="Conclusão", role="title")
    _hidden_source(report, "title", title)
    return canvas


def render_pause(title, body, pal_name, report, spec=None):
    pal = PALETTES.get(pal_name) or PALETTES["areia"]
    canvas = _paper(pal)
    if report is not None:
        report.append({"role": "canvas_background", "color": rgba_to_hex(pal["bg"])})
    draw = ImageDraw.Draw(canvas)
    _micro(draw, pal, report)

    plan = {"pl": ("display", 124), "em": ("display", 124), "it": ("italic", 124)}
    lines, _ = fit_lines(parse_voices(auto_markup(title)), plan, W - 2 * MARGIN - 20, 640, em_own_line=False)
    end = draw_lines(draw, lines, MARGIN + 6, 235, W - 2 * MARGIN - 20, pal["ink"], report=report)
    _hidden_source(report, "title", title)

    parts = _split_body(body)
    if parts:
        text = sentence_lines(" ".join(parts[:3]))
        b_lines, _ = fit_lines(parse_voices(text), {"pl": ("light", 40), "em": ("semi", 40), "it": ("light", 40)},
                               600, 300, em_own_line=False)
        b_h = _block_height(b_lines)
        by = max(end + 70, H - 190 - b_h)
        draw.rectangle((MARGIN + 6, by - 4, MARGIN + 16, by + b_h - 4), fill=pal["accent"])
        draw_lines(draw, b_lines, MARGIN + 44, by, 600, pal["ink"], report=report, name="Corpo", role="body")
        _hidden_source(report, "body", " ".join(parts[:3]))
        if report is not None:
            report.append({
                "role": "shape", "id": "barra-acento", "name": "Barra de acento", "x": MARGIN + 6, "y": int(by - 4),
                "width": 10, "height": int(b_h), "fill": rgba_to_hex(pal["accent"]), "radius": 0, "blur": 0,
            })
    return canvas


KINDS = ("cover", "photo", "fragments", "escalation", "pause", "close", "coverpaper", "closepaper")


def render_bella_type(img_bytes, title, body, kind, preset=None, report=None, spec=None):
    title = clean_copy(title)
    body = clean_copy(body)
    spec = spec or {}
    pal_name = spec.get("palette")
    if kind == "cover":
        canvas = render_cover(img_bytes, title, body, pal_name or "foto", report, closing=False, spec=spec)
    elif kind == "photo":
        canvas = render_cover(img_bytes, title, body, pal_name or "foto", report, closing=False, spec=spec, middle=True)
    elif kind == "coverpaper":
        canvas = render_cover(None, title, body, pal_name or "papel", report, closing=False, spec=spec)
    elif kind == "closepaper":
        canvas = render_cover(None, title, body, pal_name or "areia", report, closing=True, spec=spec)
    elif kind == "close":
        canvas = render_cover(img_bytes, title, body, pal_name or "foto", report, closing=True, spec=spec)
    elif kind == "fragments":
        canvas = render_fragments(title, body, pal_name or "musgo", report, spec=spec)
    elif kind == "escalation":
        canvas = render_escalation(title, body, pal_name or "papel", report, spec=spec)
    else:
        canvas = render_pause(title, body, pal_name or "areia", report, spec=spec)
    return canvas.convert("RGB")
