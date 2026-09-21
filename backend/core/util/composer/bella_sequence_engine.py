"""Motor editorial sequencial Bella — dez lâminas, dez papéis visuais.

O motor organiza tipografia e ritmo; a linguagem da imagem é variável e nasce
da direção viva de cada conteúdo.
"""

from io import BytesIO
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

from .presets import W, H, F_SERIF, F_SERIF_IT, F_BOLD, F_REGULAR
from .art_director import crop_photo, clean_editorial_copy, editorial_excerpt

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


def _poster_title(draw, title, *, start=116, minimum=58, width=940, max_lines=4):
    """Título de cartaz: grande, ritmado e sempre composto como tipografia."""
    return _lines(draw, title, F_SERIF, start, minimum, width, max_lines)


def _caption_block(draw, body, x, y, width, *, color=WHITE, start=31, maximum=4):
    """Texto de apoio pequeno, porém presente e legível no feed."""
    bf, bl, _ = _lines(draw, body, F_REGULAR, start, 25, width, maximum)
    return _draw_lines(draw, bl, bf, x, y, color, 1.22)


def _draw_rhythm_title(draw, lines, size, x, y, color, *, leading=.94, italic_last=True):
    """Cria contraste dentro da manchete sem alterar ou repetir palavras."""
    line_h = int(size * leading)
    for index, line in enumerate(lines):
        path = F_SERIF_IT if italic_last and index == len(lines) - 1 and len(lines) > 1 else F_SERIF
        draw.text((x, y), line, font=_font(path, size), fill=color)
        y += line_h
    return y


def render_editorial_sequence(img_bytes, title, body, slide_no, preset=None):
    n = max(1, min(10, int(slide_no)))
    title = clean_editorial_copy(title)
    # Uma lâmina não é um parágrafo de blog: menos texto permite que imagem,
    # tipografia e ritmo editorial trabalhem juntos.
    body = editorial_excerpt(body, 34)

    deck = (preset or {}).get('_deck_direction') or {}
    art_id = deck.get('art_direction_id', 'cinema_em_movimento')

    if n == 1:
        canvas = _tint(_photo(img_bytes, (0.52, 0.44)), INK, 42)
        d = ImageDraw.Draw(canvas); _brand(d, True)

        if art_id == 'collage_poetico':
            # Um campo de papel imperfeito faz a tipografia participar da colagem.
            paper = Image.new('RGBA', (850, 650), (242, 237, 225, 232))
            paper = paper.rotate(-1.8, expand=True, resample=Image.Resampling.BICUBIC)
            canvas.alpha_composite(paper, (42, 125))
            d = ImageDraw.Draw(canvas)
            tf, tl, ts = _lines(d, title, F_SERIF, 92, 50, 730, 5)
            y = _draw_rhythm_title(d, tl, ts, 92, 175, INK, leading=.91)
            d.rectangle((92, y + 30, 215, y + 36), fill=TERRA)
            _caption_block(d, body, 420, min(720, y + 62), 420, color=INK, start=28, maximum=4)

        elif art_id == 'surrealismo_simbolico':
            # Manchete flutua no mundo visual; quase não há moldura gráfica.
            canvas = _soft_text_veil(canvas, (30, 410, 1045, 980), 105)
            d = ImageDraw.Draw(canvas)
            tf, tl, ts = _lines(d, title, F_SERIF, 110, 58, 900, 4)
            y = _draw_rhythm_title(d, tl, ts, MX, 470, WHITE, leading=.88)
            _caption_block(d, body, 585, min(1110, y + 75), 390, color=WHITE, start=27, maximum=4)

        elif art_id == 'materia_escultorica':
            # A matéria ocupa o centro; a tese emerge na base como legenda de exposição.
            canvas = _soft_text_veil(canvas, (35, 735, 1045, 1260), 135)
            d = ImageDraw.Draw(canvas)
            tf, tl, ts = _lines(d, title, F_SERIF, 100, 54, 850, 4)
            y = _draw_rhythm_title(d, tl, ts, MX, 805, WHITE, leading=.9)
            d.line((MX, y + 32, MX + 155, y + 32), fill=TERRA, width=6)
            _caption_block(d, body, 560, 185, 410, color=WHITE, start=27, maximum=5)

        elif art_id == 'grafismo_expressivo':
            # Campo cromático e gesto circular criam uma capa mais gráfica que fotográfica.
            overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(overlay)
            od.ellipse((665, 85, 1185, 605), fill=(*TERRA[:3], 190))
            od.rectangle((45, 205, 835, 760), fill=(*MINERAL[:3], 232))
            canvas = Image.alpha_composite(canvas, overlay); d = ImageDraw.Draw(canvas)
            tf, tl, ts = _lines(d, title, F_SERIF, 96, 52, 690, 5)
            y = _draw_rhythm_title(d, tl, ts, 92, 255, CREAM, leading=.9)
            _caption_block(d, body, 525, min(970, y + 110), 430, color=WHITE, start=29, maximum=4)

        else:  # cinema_em_movimento
            d.rectangle((MX, 148, MX + 5, 242), fill=TERRA)
            tf, tl, ts = _lines(d, title, F_SERIF, 90, 44, 800, 4)
            y = _draw_rhythm_title(d, tl, ts, MX + 24, 145, WHITE, leading=.96)
            canvas = _soft_text_veil(canvas, (60, max(790, y + 20), 615, 1165), 150)
            d = ImageDraw.Draw(canvas)
            bf, bl, _ = _lines(d, body, F_REGULAR, 29, 24, 470, 4)
            _draw_lines(d, bl, bf, MX + 24, max(875, y + 55), WHITE, 1.25)

    elif n == 7:
        canvas = _tint(_photo(img_bytes, (0.58, 0.40)), INK, 105)
        d = ImageDraw.Draw(canvas); _brand(d, True)
        d.rectangle((MX, 148, MX + 5, 242), fill=TERRA)
        tf, tl, ts = _lines(d, title, F_SERIF, 76, 44, 800, 4)
        y = _draw_rhythm_title(d, tl, ts, MX + 24, 145, WHITE, leading=.96)
        canvas = _soft_text_veil(canvas, (60, max(790, y + 20), 615, 1165), 150)
        d = ImageDraw.Draw(canvas)
        bf, bl, _ = _lines(d, body, F_REGULAR, 29, 24, 470, 4)
        _draw_lines(d, bl, bf, MX + 24, max(875, y + 55), WHITE, 1.25)

    elif n == 2:
        # Página de respiro: o fundo claro interrompe a fotografia e conduz a
        # leitura da tese à explicação por meio de uma linha editorial.
        canvas = Image.new('RGBA', (W, H), CREAM); d = ImageDraw.Draw(canvas); _brand(d, False)
        d.ellipse((710, 120, 1135, 545), fill=OAT)
        tf, tl, ts = _poster_title(d, title, start=92, minimum=52, width=650, max_lines=5)
        y = _draw_rhythm_title(d, tl, ts, MX, 205, MINERAL, leading=.91)
        line_y = min(930, y + 48)
        d.line((MX + 8, line_y, MX + 8, line_y + 210, MX + 355, line_y + 210), fill=(73, 70, 65, 180), width=2)
        _caption_block(d, body, 505, line_y + 92, 480, color=INK, start=32, maximum=5)

    elif n == 3:
        # A cena da capa retorna com outro recorte: continuidade cinematográfica
        # em vez de uma nova imagem aleatória.
        canvas = Image.new('RGBA', (W, H), MIST)
        d = ImageDraw.Draw(canvas)
        d.ellipse((-250, 240, 170, 660), fill=OAT)
        if img_bytes:
            side_photo = crop_photo(Image.open(BytesIO(img_bytes)), (440, H), focus=(0.70, 0.44))
            canvas.alpha_composite(side_photo, (640, 0))
        d = ImageDraw.Draw(canvas); _brand_split(d)
        tf, tl, ts = _poster_title(d, title, start=82, minimum=46, width=515, max_lines=5)
        y = _draw_rhythm_title(d, tl, ts, MX, 190, MINERAL, leading=.92)
        d.line((MX, y + 35, MX + 92, y + 35), fill=TERRA, width=5)
        _caption_block(d, body, MX, y + 82, 480, color=INK, start=31, maximum=6)

    elif n == 4:
        # Cartaz de palavras: a frase inteira é a protagonista. Escala e
        # recorte intencional substituem o antigo card com bullets.
        canvas = Image.new('RGBA', (W, H), MINERAL); d = ImageDraw.Draw(canvas); _brand(d, True)
        tf, tl, ts = _poster_title(d, title, start=124, minimum=62, width=900, max_lines=4)
        y = _draw_rhythm_title(d, tl, ts, MX, 250, CREAM, leading=.87)
        connector_y = min(940, y + 55)
        d.line((MX + 150, connector_y, MX + 300, connector_y + 150), fill=(242, 238, 228, 210), width=3)
        _caption_block(d, body, 430, connector_y + 130, 520, color=WHITE, start=32, maximum=5)

    elif n == 5:
        canvas = _tint(_photo(img_bytes, (0.60,0.45)), INK, 108); d = ImageDraw.Draw(canvas); _brand(d, True)
        tf, tl, _ = _poster_title(d, title, start=96, minimum=50, width=820, max_lines=4)
        y = _draw_lines(d, tl, tf, MX, 220, WHITE, .94)
        d.rectangle((MX, y + 42, MX + 100, y + 47), fill=TERRA)
        canvas = _soft_text_veil(canvas, (58, y + 80, 760, min(H - 110, y + 440)), 112)
        d = ImageDraw.Draw(canvas)
        _caption_block(d, body, MX, y + 112, 610, color=WHITE, start=32, maximum=4)

    elif n == 6:
        photo = _photo(img_bytes, (0.55,0.42)); canvas = Image.new('RGBA',(W,H),CREAM)
        canvas.alpha_composite(photo.crop((0,0,650,H)),(0,0)); d=ImageDraw.Draw(canvas); _brand(d, False)
        d.rectangle((610,0,W,H),fill=CREAM)
        tf, tl, _ = _lines(d,title,F_SERIF,62,38,370,6); y=_draw_lines(d,tl,tf,650,190,MOSS,1.0)
        bf, bl, _ = _lines(d,body,F_REGULAR,27,22,350,8); _draw_lines(d,bl,bf,650,y+55,INK,1.25)
        d.rectangle((650, y+22, 730, y+27), fill=TERRA)

    elif n == 8:
        canvas=Image.new('RGBA',(W,H),INK); d=ImageDraw.Draw(canvas); _brand(d,True)
        d.text((45,95),'“',font=_font(F_SERIF,190),fill=TERRA)
        tf,tl,_=_lines(d,title,F_SERIF,78,42,830,5); y=_draw_lines(d,tl,tf,MX,280,WHITE,1.04)
        bf,bl,_=_lines(d,body,F_SERIF_IT,36,26,720,6); _draw_lines(d,bl,bf,MX,y+70,MUTED,1.2)

    elif n == 9:
        canvas=Image.new('RGBA',(W,H),CREAM); d=ImageDraw.Draw(canvas); _brand(d,False)
        tf,tl,_=_lines(d,title,F_SERIF,68,40,820,4); y=_draw_lines(d,tl,tf,MX,150,MOSS,1.02)
        if img_bytes:
            inset=crop_photo(Image.open(BytesIO(img_bytes)),(820,470),(0.5,.42)); canvas.alpha_composite(inset,(130,y+55)); d=ImageDraw.Draw(canvas)
        bf,bl,_=_lines(d,body,F_REGULAR,28,22,700,5); _draw_lines(d,bl,bf,190,min(1080,y+560),INK,1.2)

    else:
        canvas=_tint(_photo(img_bytes,(0.5,.42)),MOSS,185); d=ImageDraw.Draw(canvas); _brand(d,True)
        tf,tl,_=_lines(d,title,F_SERIF_IT,76,46,780,4); y=_draw_lines(d,tl,tf,150,285,WHITE,1.02,align='center',width=780)
        d.line((450, y + 55, 630, y + 55), fill=TERRA, width=4)
        bf,bl,_=_lines(d,body,F_REGULAR,30,24,640,5); _draw_lines(d,bl,bf,220,y+120,WHITE,1.22,align='center',width=640)
        cta=_font(F_REGULAR,22)
        label='COMENTE “BELLA” PARA RECEBER O MÉTODO'
        tw=d.textbbox((0,0),label,font=cta)[2]; d.text(((W-tw)//2,1050),label,font=cta,fill=CREAM)

    return canvas.convert('RGB')
