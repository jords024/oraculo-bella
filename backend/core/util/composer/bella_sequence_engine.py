"""Motor editorial sequencial Bella — dez lâminas, dez papéis visuais.

O motor organiza tipografia e ritmo; a linguagem da imagem é variável e nasce
da direção viva de cada conteúdo.
"""

from io import BytesIO
import re
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

from .presets import W, H, F_SERIF, F_SERIF_IT, F_BOLD, F_REGULAR
from .art_director import crop_photo, clean_editorial_copy, editorial_excerpt, rgba_to_hex

CREAM = (244, 239, 229, 255)
INK = (25, 29, 25, 255)
# A Bella trabalha melhor em grafite, cacau e papel quente. O verde-musgo
# deixava a fotografia excessivamente fria e distante da linguagem editorial.
MOSS = (48, 38, 31, 255)
MOSS_2 = (72, 54, 42, 255)
TERRA = (184, 91, 49, 255)
MINERAL = (76, 98, 124, 255)
MIST = (226, 231, 228, 255)
OAT = (211, 204, 190, 255)
WHITE = (250, 248, 242, 255)
MUTED = (196, 202, 190, 255)
MX = 82


def _font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except Exception:
        return ImageFont.load_default()


def _lines(draw, text, path, start, minimum, width, max_lines=5):
    text = clean_editorial_copy(text)
    start = max(start, minimum)
    lines = []
    for size in range(start, minimum - 1, -2):
        font = _font(path, size)
        words, lines, current = text.split(), [], ''
        for word in words:
            trial = f'{current} {word}'.strip()
            if draw.textbbox((0, 0), trial, font=font)[2] <= width:
                current = trial
            else:
                if current: lines.append(current)
                current = word
        if current: lines.append(current)
        if len(lines) <= max_lines:
            return font, lines, size
    return _font(path, minimum), lines[:max_lines], minimum


def _family_of(path):
    """Nomeia a família (serif = Playfair Display, sans = Inter) para o editor web."""
    return "serif" if path in (F_SERIF, F_SERIF_IT) else "sans"


def _report_text(report, role, x, y, width, height, font, path, color, align, content, line_height=1.2):
    """`font` é o objeto Pillow já carregado (para ler o tamanho real após o auto-fit);
    `path` é a constante de arquivo (F_SERIF/F_SERIF_IT/F_BOLD/F_REGULAR) usada para escolhê-lo."""
    if report is None:
        return
    weight = {"title": 600, "body": 400, "watermark": 500}.get(role, 400)
    report.append({
        "role": role, "x": int(x), "y": int(y), "width": int(max(1, width)), "height": int(max(1, height)),
        "fontSize": int(getattr(font, "size", 36)),
        "fontFamily": _family_of(path), "fontWeight": weight, "fontStyle": "normal",
        "color": rgba_to_hex(color), "align": align, "content": content,
        "lineHeight": float(line_height),
    })


def _report_layer(report, role, name, x, y, width, height, **extra):
    if report is None:
        return
    report.append({
        "role": role, "name": name, "x": int(x), "y": int(y),
        "width": int(max(1, width)), "height": int(max(1, height)),
        "rotation": 0, "opacity": 1, "locked": False, "visible": True, **extra,
    })


def _report_canvas(report, color, textured=True):
    if report is None:
        return
    report.append({"role": "canvas_background", "color": rgba_to_hex(color)})
    if textured:
        _report_layer(report, "texture", "Grão de papel", 0, 0, W, H,
                      textureKind="paper-grain", color="#30261f", intensity=.13,
                      blendMode="multiply", opacity=.42, seed=17)


def _report_brand(report, dark=True):
    color = (238, 234, 226, 255) if dark else (54, 50, 46, 255)
    _report_text(report, "watermark", MX, 45, 260, 30, _font(F_REGULAR, 18), F_REGULAR, color, "left", "ISABELLA DALCIN")
    _report_text(report, "watermark", 735, H - 58, 265, 30, _font(F_REGULAR, 18), F_REGULAR, color, "right", "ACADEMIA SETE  ·  MÉTODO T.A.F.A")


def _draw_lines(draw, lines, font, x, y, fill, leading=1.08, align='left', width=None, stroke=0):
    size = getattr(font, 'size', 40)
    line_h = int(size * leading)
    for line in lines:
        box = draw.textbbox((0, 0), line, font=font, stroke_width=stroke)
        tw = box[2] - box[0]
        px = x if align == 'left' else x + ((width or 0) - tw) // 2
        # Sombra/contorno é uma linguagem de apresentação. Nesta direção, a
        # legibilidade vem da área de silêncio e do contraste da fotografia.
        draw.text((px, y), line, font=font, fill=fill, stroke_width=stroke)
        y += line_h
    return y


def _photo(img_bytes, focus=(0.5, 0.42)):
    if not img_bytes: return Image.new('RGBA', (W, H), MOSS)
    return crop_photo(Image.open(BytesIO(img_bytes)), (W, H), focus=focus)


def _tint(image, color, alpha=80):
    return Image.alpha_composite(image.convert('RGBA'), Image.new('RGBA', image.size, (*color[:3], alpha)))


def _soft_text_veil(image, box, opacity=145):
    """Cria contraste local sem transformar a copy em um card visível."""
    x1, y1, x2, y2 = box
    veil = Image.new('RGBA', image.size, (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    vd.rounded_rectangle((x1, y1, x2, y2), radius=42, fill=(20, 15, 12, opacity))
    # O desfoque dissolve bordas e mantém a foto respirando.
    veil = veil.filter(ImageFilter.GaussianBlur(28))
    return Image.alpha_composite(image.convert('RGBA'), veil)


def _brand(draw, dark=True):
    col = (238, 235, 226, 205) if dark else (54, 50, 46, 190)
    f = _font(F_REGULAR, 18)
    draw.text((MX, 45), 'ISABELLA DALCIN', font=f, fill=col)
    footer = 'ACADEMIA SETE  ·  MÉTODO T.A.F.A'
    fw = draw.textbbox((0, 0), footer, font=f)[2]
    draw.text((W - MX - fw, H - 58), footer, font=f, fill=col)


def _brand_split(draw):
    """Assinatura legível quando a página termina sobre fotografia escura."""
    f = _font(F_REGULAR, 18)
    draw.text((MX, 45), 'ISABELLA DALCIN', font=f, fill=(54, 50, 46, 190))
    footer = 'ACADEMIA SETE  ·  MÉTODO T.A.F.A'
    fw = draw.textbbox((0, 0), footer, font=f)[2]
    draw.text((W - MX - fw, H - 58), footer, font=f, fill=(246, 242, 233, 220))


def _keyword(title):
    stop = {'você','para','uma','como','mais','menos','sem','não','que','seu','sua','isso','pela','pelo'}
    words = [w.strip('.,:;!?').lower() for w in clean_editorial_copy(title).split()]
    meaningful = [w for w in words if w not in stop and not w.endswith('mente')]
    return max(meaningful, key=len, default='presença')


def _paper_field(color):
    """Campo de papel com grão discreto; evita fundo digital perfeitamente liso."""
    base = Image.new('RGBA', (W, H), color)
    noise = Image.effect_noise((W, H), 18).convert('RGBA')
    noise.putalpha(16)
    return Image.alpha_composite(base, noise)


def _measurement_fragment(draw, box, color, *, vertical=False, step=42):
    """Objeto de medida editorial, cortado pela borda e sem aparência de infográfico."""
    x1, y1, x2, y2 = box
    if vertical:
        draw.line((x1, y1, x1, y2), fill=color, width=4)
        for index, y in enumerate(range(y1, y2, step)):
            length = 28 if index % 5 else 52
            draw.line((x1, y, x1 + length, y), fill=color, width=3)
    else:
        draw.line((x1, y1, x2, y1), fill=color, width=4)
        for index, x in enumerate(range(x1, x2, step)):
            length = 28 if index % 5 else 52
            draw.line((x, y1, x, y1 + length), fill=color, width=3)


def _sentence_parts(text):
    parts = [part.strip() for part in re.split(r'(?<=[.!?])\s+|\n+', clean_editorial_copy(text)) if part.strip()]
    return parts or [clean_editorial_copy(text)]


def _poster_title(draw, title, *, start=116, minimum=58, width=940, max_lines=4):
    """Título de cartaz: grande, ritmado e sempre composto como tipografia."""
    return _lines(draw, title, F_SERIF, start, minimum, width, max_lines)


def _caption_block(draw, body, x, y, width, *, color=WHITE, start=31, maximum=4, report=None):
    """Texto de apoio pequeno, porém presente e legível no feed."""
    bf, bl, _ = _lines(draw, body, F_REGULAR, start, 25, width, maximum)
    end_y = _draw_lines(draw, bl, bf, x, y, color, 1.22)
    _report_text(report, "body", x, y, width, end_y - y, bf, F_REGULAR, color, "left", body)
    return end_y


def _draw_rhythm_title(draw, lines, size, x, y, color, *, leading=.94, italic_last=True, width=None, content=None, report=None):
    """Cria contraste dentro da manchete sem alterar ou repetir palavras."""
    y0 = y
    line_h = int(size * leading)
    for index, line in enumerate(lines):
        path = F_SERIF_IT if italic_last and index == len(lines) - 1 and len(lines) > 1 else F_SERIF
        draw.text((x, y), line, font=_font(path, size), fill=color)
        y += line_h
    _report_text(report, "title", x, y0, width or 900, y - y0, _font(F_SERIF, size), F_SERIF, color, "left", content or " ".join(lines))
    return y


def render_editorial_sequence(img_bytes, title, body, slide_no, preset=None, report=None):
    n = max(1, min(10, int(slide_no)))
    title = clean_editorial_copy(title)
    # Uma lâmina não é um parágrafo de blog: menos texto permite que imagem,
    # tipografia e ritmo editorial trabalhem juntos.
    body = editorial_excerpt(body, 34)

    if n == 1:
        # CAPA CINÉTICA — a imagem cria mundo e ação; a tipografia entra no
        # espaço real da cena, sem card, faixa preta ou mulher posando.
        canvas = _tint(_photo(img_bytes, (0.58, 0.43)), (68, 62, 45, 255), 24)
        d = ImageDraw.Draw(canvas); _brand(d, True)
        _report_layer(report, "shape", "Atmosfera oliva", 0, 0, W, H, fill="#443e2d", opacity=.10, radius=0, blur=0)
        _report_brand(report, True)
        words = title.split()
        pivot = max(2, min(4, len(words) // 2))
        context_line = ' '.join(words[:pivot])
        concept_line = ' '.join(words[pivot:]) or context_line
        if concept_line == context_line: context_line = ''
        top_y = 285
        if context_line:
            cf, cl, _ = _lines(d, context_line, F_REGULAR, 52, 34, 650, 3)
            context_end = _draw_lines(d, cl, cf, 58, top_y, WHITE, 1.0)
            _report_text(report, "title", 58, top_y, 650, context_end - top_y, cf, F_REGULAR, WHITE, "left", context_line)
            top_y = context_end + 10
        tf, tl, ts = _lines(d, concept_line, F_SERIF, 132, 66, 760, 4)
        title_end = _draw_rhythm_title(d, tl, ts, 58, top_y, WHITE, leading=.82, width=760, content=concept_line, report=report)
        _caption_block(d, body, 590, 1000, 400, color=WHITE, start=27, maximum=4, report=report)

    elif n == 7:
        canvas = _tint(_photo(img_bytes, (0.58, 0.40)), INK, 105)
        d = ImageDraw.Draw(canvas); _brand(d, True); _report_brand(report, True)
        d.rectangle((MX, 148, MX + 5, 242), fill=TERRA)
        tf, tl, ts = _lines(d, title, F_SERIF, 76, 44, 800, 4)
        y = _draw_rhythm_title(d, tl, ts, MX + 24, 145, WHITE, leading=.96, width=800, content=title, report=report)
        canvas = _soft_text_veil(canvas, (60, max(790, y + 20), 615, 1165), 150)
        d = ImageDraw.Draw(canvas)
        bf, bl, _ = _lines(d, body, F_REGULAR, 29, 24, 470, 4)
        body_y = max(875, y + 55)
        body_end = _draw_lines(d, bl, bf, MX + 24, body_y, WHITE, 1.25)
        _report_text(report, "body", MX + 24, body_y, 470, body_end - body_y, bf, F_REGULAR, WHITE, "left", body)

    elif n == 2:
        # MANIFESTO DE MECANISMO — papel, instrumento simbólico e vozes
        # periféricas. O objeto escolhido pelo diretor entra na imagem gerada
        # quando houver; aqui o compositor sustenta a gramática de medição.
        canvas = _paper_field(CREAM); d = ImageDraw.Draw(canvas); _brand(d, False)
        _report_canvas(report, CREAM); _report_brand(report, False)
        tf, tl, ts = _poster_title(d, title, start=88, minimum=50, width=560, max_lines=4)
        title_y = 350
        title_end = _draw_rhythm_title(d, tl, ts, 100, title_y, MOSS, leading=.96, width=560, content=title, report=report)
        body_y = max(760, title_end + 86)
        d.rectangle((640, body_y, 648, body_y + 170), fill=TERRA)
        _report_layer(report, "shape", "Linha de ênfase", 640, body_y, 8, 170, fill="#b85b31", radius=4, blur=0)
        _caption_block(d, body, 678, body_y - 6, 320, color=INK, start=28, maximum=6, report=report)

    elif n == 3:
        # COLAGEM DE ARMADILHA — a palavra vira cenário e a imagem simbólica
        # interrompe a leitura, em vez de ocupar uma faixa lateral previsível.
        canvas = _paper_field((24, 61, 52, 255)); d = ImageDraw.Draw(canvas); _brand(d, True)
        _report_canvas(report, (24, 61, 52, 255)); _report_brand(report, True)
        keyword = _keyword(title).upper()
        atmosphere = _font(F_BOLD, 154)
        d.text((-12, 175), keyword, font=atmosphere, fill=(244, 239, 229, 218))
        _report_text(report, "atmosphere", -12, 175, 1090, 185, atmosphere, F_BOLD, (244, 239, 229, 218), "left", keyword)
        if img_bytes:
            inset = crop_photo(Image.open(BytesIO(img_bytes)), (470, 680), focus=(0.5, 0.43))
            mask = Image.new('L', (470, 680), 0)
            md = ImageDraw.Draw(mask)
            md.rounded_rectangle((10, 8, 458, 672), radius=110, fill=255)
            canvas.paste(inset, (55, 370), mask)
            _report_layer(report, "image", "Imagem principal", 55, 370, 470, 680,
                          sourceRole="raw", fit="cover", focusX=50, focusY=43, radius=110, aspectLocked=True)
        d = ImageDraw.Draw(canvas)
        tf, tl, ts = _lines(d, title, F_SERIF_IT, 68, 40, 470, 4)
        title_y = 410
        title_end = _draw_lines(d, tl, tf, 555, title_y, WHITE, .98)
        _report_text(report, "title", 555, title_y, 470, title_end - title_y, tf, F_SERIF_IT, WHITE, "left", title)
        _caption_block(d, body, 575, max(780, title_end + 70), 390, color=WHITE, start=27, maximum=5, report=report)

    elif n == 4:
        # ESCALADA TIPOGRÁFICA — raciocínio em tiras físicas e conclusão em
        # grande escala. Sem card, sem bullet e sem ícone genérico.
        canvas = _paper_field(CREAM); d = ImageDraw.Draw(canvas); _brand(d, False)
        _report_canvas(report, CREAM); _report_brand(report, False)
        # Título propositalmente menor e com linhas autônomas. Além de evitar
        # colisão, isto permite selecionar/mover cada linha e cada faixa no Estúdio.
        tf, tl, ts = _lines(d, title, F_BOLD, 54, 38, 850, 3)
        y = 205
        for index, line in enumerate(tl):
            line_y = y
            font = _font(F_BOLD, ts)
            box = d.textbbox((0, 0), line, font=font)
            strip_w = min(920, box[2] - box[0] + 42)
            offset = (index % 3) * 24
            d.polygon([(74 + offset, line_y - 10), (74 + offset + strip_w, line_y - 12), (80 + offset + strip_w, line_y + ts + 16), (68 + offset, line_y + ts + 14)], fill=(255, 253, 246, 245))
            _report_layer(report, "shape", f"Faixa do título {index + 1}", 68 + offset, line_y - 12, strip_w + 16, ts + 30, fill="#fffdf6", opacity=.96, radius=0, blur=0, rotation=(-.35 if index % 2 else .35))
            text_x = 88 + offset
            d.text((text_x, line_y), line, font=font, fill=MOSS)
            _report_text(report, "title", text_x, line_y, strip_w - 22, int(ts * 1.12), font, F_BOLD, MOSS, "left", line, line_height=1.12)
            y += int(ts * 1.28)
        parts = _sentence_parts(body)
        setup = ' '.join(parts[:-1]) if len(parts) > 1 else ''
        conclusion = parts[-1]
        if setup:
            _caption_block(d, setup, 165, y + 54, 690, color=MOSS, start=28, maximum=3, report=report)
        cf, cl, cs = _lines(d, conclusion, F_BOLD, 88, 52, 930, 3)
        conclusion_y = max(690, y + 205)
        conclusion_end = _draw_lines(d, cl, cf, 62, conclusion_y, MOSS, .82)
        _report_text(report, "body", 62, conclusion_y, 930, conclusion_end - conclusion_y, cf, F_BOLD, MOSS, "left", conclusion)

    elif n == 5:
        canvas = _tint(_photo(img_bytes, (0.60,0.45)), INK, 108); d = ImageDraw.Draw(canvas); _brand(d, True)
        _report_layer(report, "shape", "Atmosfera escura", 0, 0, W, H, fill="#191d19", opacity=.42, radius=0, blur=0)
        _report_brand(report, True)
        tf, tl, _ = _poster_title(d, title, start=96, minimum=50, width=820, max_lines=4)
        title_y = 220
        y = _draw_lines(d, tl, tf, MX, title_y, WHITE, .94)
        _report_text(report, "title", MX, title_y, 820, y - title_y, tf, F_SERIF, WHITE, "left", title)
        d.rectangle((MX, y + 42, MX + 100, y + 47), fill=TERRA)
        _report_layer(report, "shape", "Linha de passagem", MX, y + 42, 100, 5, fill="#b85b31", radius=3, blur=0)
        canvas = _soft_text_veil(canvas, (58, y + 80, 760, min(H - 110, y + 440)), 112)
        d = ImageDraw.Draw(canvas)
        _caption_block(d, body, MX, y + 112, 610, color=WHITE, start=32, maximum=4, report=report)

    elif n == 6:
        photo = _photo(img_bytes, (0.55,0.42)); canvas = Image.new('RGBA',(W,H),CREAM)
        canvas.alpha_composite(photo.crop((0,0,650,H)),(0,0)); d=ImageDraw.Draw(canvas); _brand(d, False)
        d.rectangle((610,0,W,H),fill=CREAM)
        title_y = 190
        tf, tl, _ = _lines(d,title,F_SERIF,62,38,370,6); y=_draw_lines(d,tl,tf,650,title_y,MOSS,1.0)
        _report_text(report, "title", 650, title_y, 370, y - title_y, tf, F_SERIF, MOSS, "left", title)
        body_y = y + 55
        bf, bl, _ = _lines(d,body,F_REGULAR,27,22,350,8); body_end = _draw_lines(d,bl,bf,650,body_y,INK,1.25)
        _report_text(report, "body", 650, body_y, 350, body_end - body_y, bf, F_REGULAR, INK, "left", body)
        d.rectangle((650, y+22, 730, y+27), fill=TERRA)

    elif n == 8:
        canvas=Image.new('RGBA',(W,H),INK); d=ImageDraw.Draw(canvas); _brand(d,True)
        d.text((45,95),'“',font=_font(F_SERIF,190),fill=TERRA)
        title_y = 280
        tf,tl,_=_lines(d,title,F_SERIF,78,42,830,5); y=_draw_lines(d,tl,tf,MX,title_y,WHITE,1.04)
        _report_text(report, "title", MX, title_y, 830, y - title_y, tf, F_SERIF, WHITE, "left", title)
        body_y = y + 70
        bf,bl,_=_lines(d,body,F_SERIF_IT,36,26,720,6); body_end = _draw_lines(d,bl,bf,MX,body_y,MUTED,1.2)
        _report_text(report, "body", MX, body_y, 720, body_end - body_y, bf, F_SERIF_IT, MUTED, "left", body)

    elif n == 9:
        canvas=Image.new('RGBA',(W,H),CREAM); d=ImageDraw.Draw(canvas); _brand(d,False)
        title_y = 150
        tf,tl,_=_lines(d,title,F_SERIF,68,40,820,4); y=_draw_lines(d,tl,tf,MX,title_y,MOSS,1.02)
        _report_text(report, "title", MX, title_y, 820, y - title_y, tf, F_SERIF, MOSS, "left", title)
        if img_bytes:
            inset=crop_photo(Image.open(BytesIO(img_bytes)),(820,470),(0.5,.42)); canvas.alpha_composite(inset,(130,y+55)); d=ImageDraw.Draw(canvas)
        body_y = min(1080, y + 560)
        bf,bl,_=_lines(d,body,F_REGULAR,28,22,700,5); body_end = _draw_lines(d,bl,bf,190,body_y,INK,1.2)
        _report_text(report, "body", 190, body_y, 700, body_end - body_y, bf, F_REGULAR, INK, "left", body)

    else:
        # LIBERAÇÃO AÉREA — baixa densidade, gesto tipográfico amplo e um
        # único sinal cromático. O encerramento deixa de ser outra foto escura.
        canvas = _paper_field((171, 196, 184, 255)); d = ImageDraw.Draw(canvas); _brand(d, False)
        d.ellipse((610, 205, 930, 525), fill=TERRA)
        # Marcas direcionais abstratas; sugerem voo/abertura sem impor pássaros
        # a todo tema nem depender de um ícone pronto.
        d.arc((635, 210, 760, 330), 198, 338, fill=WHITE, width=12)
        d.arc((735, 280, 840, 380), 195, 337, fill=WHITE, width=10)
        tf, tl, ts = _lines(d, title, F_SERIF_IT, 126, 66, 900, 5)
        title_y = 300
        title_end = _draw_lines(d, tl, tf, 92, title_y, WHITE, .78)
        _report_text(report, "title", 92, title_y, 900, title_end - title_y, tf, F_SERIF_IT, WHITE, "left", title)
        bf, bl, _ = _lines(d, body, F_REGULAR, 38, 27, 760, 6)
        body_y = max(870, title_end + 65)
        body_end = _draw_lines(d, bl, bf, 160, body_y, WHITE, 1.12, align='center', width=760)
        _report_text(report, "body", 160, body_y, 760, body_end - body_y, bf, F_REGULAR, WHITE, "center", body)
        cta = _font(F_BOLD, 20)
        label = 'COMENTE BELLA'
        tw = d.textbbox((0, 0), label, font=cta)[2]
        d.text(((W - tw) // 2, 1195), label, font=cta, fill=(250, 248, 242, 225))

    return canvas.convert('RGB')
