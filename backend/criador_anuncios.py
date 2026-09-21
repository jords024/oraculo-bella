import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from core.agentes.register_carousel import register as reg
from core.util.gen_image_openai import gen_openai

# Constants
W, H = 1080, 1080
OUT_DIR = Path("C:/Users/julia/Desktop/Anuncios_Quadrados")
OUT_DIR.mkdir(parents=True, exist_ok=True)

FONTS_DIR = Path("C:/Windows/Fonts")
FONT_MAIN = str(FONTS_DIR / "Inter-Bold-slnt=0.ttf")
FONT_SUB  = str(FONTS_DIR / "Inter-Regular-slnt=0.ttf")

anuncios = [
    {
        "id": "ad_01_trabalha_menos_v2",
        "headline": "Gente que trabalha menos que você ganha mais.",
        "sub": "Não é injustiça. É frequência...",
        "cta": "Entre no grupo VIP de lançamento do Engenheiros da Realidade pra entender como mudar isso.",
        "prompt": "An epic, majestic, and hyper-detailed painting of an ancient alchemical golden clockwork mechanism suspended over a vast, glowing mystical city. Volumetric lighting, rich colors, intricate details, highly atmospheric. No text."
    },
    {
        "id": "ad_02_prosperidade_v2",
        "headline": "Prosperidade não é questão de estratégia. É questão de frequência.",
        "sub": "E frequência muda pelo corpo, não pelo pensamento.",
        "cta": "Entra no grupo de lançamento do Engenheiros da Realidade.",
        "prompt": "An epic, majestic, and hyper-detailed painting of a colossal glowing golden tree of life with roots intertwining inside a mystical ancient temple. Volumetric lighting, rich colors, highly atmospheric. No text."
    }
]

def draw_text_wrapped(draw, text, font, max_width, start_x, start_y, fill="white", line_spacing=1.2):
    lines = []
    words = text.split()
    current_line = []
    for w in words:
        test_line = " ".join(current_line + [w])
        width = font.getlength(test_line)
        if width <= max_width:
            current_line.append(w)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [w]
    if current_line:
        lines.append(" ".join(current_line))

    y = start_y
    dummy_bbox = draw.textbbox((0,0), "Ag", font=font)
    line_h = dummy_bbox[3] - dummy_bbox[1]

    total_height = 0
    for line in lines:
        # Left alignment
        x = start_x
        # Shadow for legibility
        draw.text((x+3, y+3), line, font=font, fill="black")
        draw.text((x, y), line, font=font, fill=fill)
        y += int(line_h * line_spacing)
        total_height += int(line_h * line_spacing)

    return total_height

def process_anuncio(data):
    print(f"Gerando [{data['id']}]...")
    # 1. Gen Image (1024x1024 for square)
    raw_fname = OUT_DIR / f"raw_{data['id']}.jpg"
    img_bytes = None

    if raw_fname.exists():
        print("  Carregando RAW do cache...")
        img_bytes = raw_fname.read_bytes()
    else:
        img_bytes = gen_openai(data["prompt"], size="1024x1024")
        if img_bytes:
            raw_fname.write_bytes(img_bytes)

    if not img_bytes:
        print("Falha ao gerar imagem.")
        return

    # 2. Open and Resize
    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    img = img.resize((W, H), Image.LANCZOS)

    # 3. Create Overlay (Dark gradient from bottom to top for text legibility)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)

    # Gradient from y=H//2 to H
    for y in range(H//2 - 200, H):
        alpha = int(240 * ((y - (H//2 - 200)) / (H - (H//2 - 200))))
        draw_overlay.line([(0, y), (W, y)], fill=(0, 0, 0, alpha))

    img = Image.alpha_composite(img, overlay)

    # 4. Draw Text
    draw = ImageDraw.Draw(img)
    try:
        f_head = ImageFont.truetype(FONT_MAIN, 64)
        f_sub = ImageFont.truetype(FONT_SUB, 48)
        f_cta = ImageFont.truetype(FONT_MAIN, 36)
    except Exception as e:
        print("Erro ao carregar fontes:", e)
        return

    start_x = 80 # Left margin
    max_w = W - 160 # Width constraint

    # Calulate total height to position at the bottom
    dummy_draw = ImageDraw.Draw(Image.new("RGB", (1,1)))
    h1 = draw_text_wrapped(dummy_draw, data["headline"], f_head, max_w, start_x, 0)
    h2 = draw_text_wrapped(dummy_draw, data["sub"], f_sub, max_w, start_x, 0)
    h3 = draw_text_wrapped(dummy_draw, data["cta"], f_cta, max_w, start_x, 0)

    total_text_h = h1 + 40 + h2 + 80 + h3

    # Position text starting near the bottom
    start_y = H - total_text_h - 100

    # Draw Headline
    y_pos = start_y
    h_used = draw_text_wrapped(draw, data["headline"], f_head, max_w, start_x, y_pos, fill="white", line_spacing=1.1)

    # Draw Subtitle
    y_pos += h_used + 40
    h_used2 = draw_text_wrapped(draw, data["sub"], f_sub, max_w, start_x, y_pos, fill=(220,220,220), line_spacing=1.2)

    # Draw CTA
    y_pos += h_used2 + 60
    draw_text_wrapped(draw, data["cta"], f_cta, max_w, start_x, y_pos, fill=(255,215,0), line_spacing=1.2) # Golden color for CTA

    # 5. Save
    out_path = OUT_DIR / f"{data['id']}.jpg"
    img.convert("RGB").save(out_path, quality=95)
    print(f"Salvo: {out_path}\n")

    # Registra no dashboard
    reg(
        title = f"Anúncio: {data['headline'][:20]}...",
        theme = f"anuncio-{data['id']}",
        slides_dir = str(OUT_DIR),
        format = "Quadrado",
        caption = f"{data['sub']}\n\n{data['cta']}",
        slide_prefix = f"{data['id']}" # Conta apenas este slide
    )

print("Iniciando Fabrica de Anuncios (1080x1080 - Esquerda)...")
for a in anuncios:
    process_anuncio(a)

print("Finalizado!")
