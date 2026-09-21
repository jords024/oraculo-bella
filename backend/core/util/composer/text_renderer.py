"""
Motor de Renderização Tipográfica: Inline Markup, Quebra de Linhas e Renderizador de Título/Corpo.
"""

from PIL import ImageFont

from .presets import (
    W,
    MARGIN_C,
    MARGIN_L,
    MAX_TW_C,
    MAX_TW_L,
    F_HEAVY,
    F_HEAVY_IT,
    F_BOLD,
    F_REGULAR,
    F_SERIF,
    F_SERIF_BOLD,
    F_SERIF_IT
)

from pathlib import Path

def load_font(path, size):
    sz = max(int(size), 10)
    # 1. Tenta carregar o path primário se existir
    if path:
        try:
            p_obj = Path(str(path))
            if p_obj.exists():
                return ImageFont.truetype(str(p_obj), sz)
        except Exception:
            pass

    # 2. Tenta fontes bundled no projeto
    try:
        from core.util.fonts import get_fonts
        f_dict = get_fonts()
        for candidate in f_dict.values():
            if candidate and Path(str(candidate)).exists():
                try:
                    return ImageFont.truetype(str(candidate), sz)
                except Exception:
                    pass
    except Exception:
        pass

    # 3. Tenta fontes comuns de sistema
    fallback_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]
    for fb in fallback_paths:
        try:
            if Path(fb).exists():
                return ImageFont.truetype(fb, sz)
        except Exception:
            pass

    # 4. Fallback final com suporte a size quando suportado pelo Pillow
    try:
        return ImageFont.load_default(size=sz)
    except Exception:
        return ImageFont.load_default()

def parse_markup(text: str):
    """
    Parseia **bold**, *italic* e texto normal.
    Retorna lista de (segment_text, style) onde style é 'bold'|'italic'|'normal'.
    """
    segments = []
    i = 0
    while i < len(text):
        if text[i:i+2] == "**":
            end = text.find("**", i + 2)
            if end != -1:
                segments.append((text[i+2:end], "bold"))
                i = end + 2
                continue
        if text[i] == "*" and (i == 0 or text[i-1] != "*"):
            end = text.find("*", i + 1)
            if end != -1 and text[end:end+2] != "**":
                segments.append((text[i+1:end], "italic"))
                i = end + 1
                continue
        j = i + 1
        while j < len(text):
            if text[j:j+2] == "**" or (text[j] == "*" and text[j:j+2] != "**"):
                break
            j += 1
        segments.append((text[i:j], "normal"))
        i = j
    return segments

def seg_font(style: str, size: int, font_family: str = "default"):
    if font_family == "serif":
        if style == "bold":
            return load_font(F_SERIF_BOLD, size)
        if style == "italic":
            return load_font(F_SERIF_IT, size)
        return load_font(F_SERIF, size)
    if font_family == "sans":
        if style == "bold":
            return load_font(F_BOLD, size)
        if style == "italic":
            return load_font(F_HEAVY_IT, size)
        return load_font(F_REGULAR, size)
    if style == "bold":
        return load_font(F_HEAVY, size)
    if style == "italic":
        return load_font(F_HEAVY_IT, size)
    return load_font(F_REGULAR, size)

def get_title_font(size: int, font_family: str = "default"):
    if font_family == "serif":
        return load_font(F_SERIF_BOLD, size)
    if font_family == "sans":
        return load_font(F_BOLD, size)
    return load_font(F_HEAVY, size)

def measure_segment(draw, text, style, size, font_family: str = "default"):
    f = seg_font(style, size, font_family=font_family)
    bb = draw.textbbox((0, 0), text, font=f)
    return bb[2] - bb[0], bb[3] - bb[1]

def wrap_markup_lines(draw, raw_line: str, size: int, max_w: int, font_family: str = "default"):
    """
    Recebe uma linha com markup (**bold**, *italic*), retorna lista de linhas
    onde cada linha é [(segment_text, style), ...] e cabe em max_w pixels.
    Evita orphans.
    """
    segments = parse_markup(raw_line)
    words = []
    for seg_text, style in segments:
        for w in seg_text.split(" "):
            if w:
                words.append((w + " ", style))

    lines = []
    cur_ln = []
    cur_w = 0

    for word, style in words:
        ww, _ = measure_segment(draw, word, style, size, font_family=font_family)
        if cur_w + ww > max_w and cur_ln:
            lines.append(cur_ln)
            cur_ln = [(word, style)]
            cur_w = ww
        else:
            cur_ln.append((word, style))
            cur_w += ww

    if cur_ln:
        lines.append(cur_ln)

    if len(lines) >= 2:
        last = lines[-1]
        last_text = "".join(t for t, _ in last).strip()
        if len(last_text) <= 8 and len(lines[-2]) > 1:
            moved = lines[-2].pop()
            lines[-1] = [moved] + lines[-1]

    return lines

def line_px_height(draw, size: int, font_family: str = "default") -> int:
    f = seg_font("normal", size, font_family=font_family)
    bb = draw.textbbox((0, 0), "Ag", font=f)
    return bb[3] - bb[1]

def render_markup_block(draw, raw_text: str, size: int, x0: int, y: float,
                        preset: dict, ls=1.55, align="left", max_w=None, font_family=None, shadow=True):
    """
    Renderiza bloco de texto com markup. Retorna y final.
    align: 'left' | 'center'
    """
    ff = font_family or preset.get("font_family", "default")
    if max_w is None:
        max_w = MAX_TW_L if align == "left" else MAX_TW_C

    lh = line_px_height(draw, size, font_family=ff) * ls

    for raw_line in raw_text.split("\n"):
        wrapped = wrap_markup_lines(draw, raw_line, size, max_w, font_family=ff)
        if not wrapped:
            y += lh * 0.5
            continue
        for ln_segs in wrapped:
            total_w = sum(measure_segment(draw, t, s, size, font_family=ff)[0] for t, s in ln_segs)
            if align == "center":
                cx = (W - total_w) // 2
            else:
                cx = x0

            xc = cx
            for seg_text, style in ln_segs:
                col = (preset.get("bold_color") if style == "bold"
                       else preset.get("italic_color") if style == "italic"
                       else preset.get("body_color"))
                f = seg_font(style, size, font_family=ff)
                if shadow:
                    draw.text((xc + 2, y + 2), seg_text, font=f, fill=(0, 0, 0, 120))
                draw.text((xc, y), seg_text, font=f, fill=col)
                sw, _ = measure_segment(draw, seg_text, style, size, font_family=ff)
                xc += sw
            y += lh

    return y

def render_title(draw, title: str, size: int, x0: int, y: float,
                 color, ls=1.22, align="left", max_w=None, font_family="default", shadow=True):
    """Renderiza título, auto-wrapping."""
    if max_w is None:
        max_w = MAX_TW_L if align == "left" else MAX_TW_C

    f = get_title_font(size, font_family=font_family)
    lh = line_px_height(draw, size, font_family=font_family) * ls

    all_lines = []
    for raw_line in title.split("\n"):
        words = raw_line.split(" ")
        cur = ""
        for w in words:
            test = (cur + " " + w).strip()
            bb = draw.textbbox((0, 0), test, font=f)
            if (bb[2] - bb[0]) > max_w and cur:
                all_lines.append(cur)
                cur = w
            else:
                cur = test
        if cur:
            all_lines.append(cur)

    for ln in all_lines:
        bb = draw.textbbox((0, 0), ln, font=f)
        lw = bb[2] - bb[0]
        if align == "center":
            x = (W - lw) // 2
        else:
            x = x0
        if shadow:
            draw.text((x + 2, y + 2), ln, font=f, fill=(0, 0, 0, 150))
        draw.text((x, y), ln, font=f, fill=color)
        y += lh

    return y

def fit_title_size(draw, title: str, start_px: int, min_px: int,
                   align="left", max_w=None, font_family="default"):
    """Reduz fonte se alguma palavra individual ultrapassar MAX_TW, permitindo auto-wrap em 2+ linhas."""
    if max_w is None:
        max_w = MAX_TW_L if align == "left" else MAX_TW_C
    for sz in range(start_px, min_px - 1, -2):
        f = get_title_font(sz, font_family=font_family)
        too_wide = False
        for word in title.split():
            bb = draw.textbbox((0, 0), word, font=f)
            if (bb[2] - bb[0]) > max_w:
                too_wide = True
                break
        if not too_wide:
            return sz
    return min_px
