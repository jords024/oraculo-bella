import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from core.agentes.register_carousel import register as reg
from core.util.gen_image_openai import gen_openai

# Constants
W, H = 1080, 1080
OUT_DIR = Path("C:/Users/julia/Desktop/Pilulas_de_Poder_Quadradas")
OUT_DIR.mkdir(parents=True, exist_ok=True)

FONTS_DIR = Path("C:/Windows/Fonts")
FONT_MAIN = str(FONTS_DIR / "Inter-Bold-slnt=0.ttf")
FONT_SUB  = str(FONTS_DIR / "Inter-Regular-slnt=0.ttf")

criativos = [
    {
        "id": "01_neural_cansaco",
        "headline": "VOCÊ ACORDA CANSADO MESMO DEPOIS DE DORMIR 8 HORAS?",
        "sub": "O seu corpo não precisa de café. Ele precisa de uma reinicialização profunda.",
        "prompt": "Minimalist dark cinematic composition. A human brain made of dark glass, with glowing golden neural pathways lighting up to break a state of stagnation. Vast dark negative space in the center for text overlay. Esoteric realism, high contrast, elegant and clean."
    },
    {
        "id": "02_neural_dinheiro",
        "headline": "VOCÊ GANHA MAIS DINHEIRO, MAS ELE SEMPRE SOME DA SUA MÃO?",
        "sub": "Não é falta de sorte. Existe um teto invisível te bloqueando, e você sabe disso.",
        "prompt": "Minimalist dark cinematic composition. A complex dark neural network breaking through a hyper-realistic glass ceiling. Glowing golden and neon teal synapses frozen in mid-air. Vast dark negative space. Elegant and clean, esoteric realism."
    },
    {
        "id": "03_neural_relacoes",
        "headline": "SEMPRE A PESSOA ERRADA. SEMPRE A MESMA DECEPÇÃO?",
        "sub": "Parece azar, mas é um padrão de bloqueio que você continua repetindo sem perceber.",
        "prompt": "Minimalist dark cinematic composition. Glowing neural pathways forming two silhouetted hands almost touching in absolute darkness. Bright golden synapses firing. Vast dark negative space. Esoteric, moody, elegant and clean."
    }
]

def create_radial_gradient(size, center, radius, color_center, color_edge):
    img = Image.new("RGBA", size)
    draw = ImageDraw.Draw(img)
    # Simple trick: draw concentric circles with decreasing alpha
    for r in range(radius, 0, -5):
        alpha = int(color_center[3] + (color_edge[3] - color_center[3]) * (r / radius))
        bbox = [center[0] - r, center[1] - r, center[0] + r, center[1] + r]
        draw.ellipse(bbox, fill=(0, 0, 0, alpha))
    return img

def draw_text_wrapped(draw, text, font, max_width, x_center, start_y, fill="white", align="center", line_spacing=1.2):
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
        w = font.getlength(line)
        x = x_center - (w / 2) if align == "center" else x_center
        # Shadow for legibility
        draw.text((x+3, y+3), line, font=font, fill="black")
        draw.text((x, y), line, font=font, fill=fill)
        y += int(line_h * line_spacing)
        total_height += int(line_h * line_spacing)

    return total_height

def process_criativo(data):
    print(f"Gerando [{data['id']}]...")
    # 1. Gen Image (1024x1024 for DALL-E/GPT square)
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

    # 2. Open and Resize to exactly 1080x1080
    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    img = img.resize((W, H), Image.LANCZOS)

    # 3. Create Overlay (Dark vignette in the center to make text legible)
    # We create a dark mask over the entire image, slightly lighter on the edges
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 140)) # 55% opacity black
    img = Image.alpha_composite(img, overlay)

    # 4. Draw Text
    draw = ImageDraw.Draw(img)
    try:
        f_head = ImageFont.truetype(FONT_MAIN, 52)
        f_sub = ImageFont.truetype(FONT_SUB, 38)
    except Exception as e:
        print("Erro ao carregar fontes:", e)
        return

    # Calulate total height to center perfectly
    dummy_draw = ImageDraw.Draw(Image.new("RGB", (1,1)))
    h1 = draw_text_wrapped(dummy_draw, data["headline"], f_head, W - 160, W//2, 0)
    h2 = draw_text_wrapped(dummy_draw, data["sub"], f_sub, W - 200, W//2, 0)
    total_text_h = h1 + 50 + h2

    start_y = (H - total_text_h) // 2

    y_pos = start_y
    h_used = draw_text_wrapped(draw, data["headline"], f_head, W - 160, W//2, y_pos, fill="white")

    y_pos += h_used + 50
    draw_text_wrapped(draw, data["sub"], f_sub, W - 200, W//2, y_pos, fill=(210,210,210))

    # --- DRAW CTA BUTTON ---
    cta_text = "CLIQUE EM SAIBA MAIS"
    try:
        f_cta = ImageFont.truetype(FONT_MAIN, 28)
    except:
        f_cta = f_sub

    cta_w = f_cta.getlength(cta_text)
    # create dummy box to get height
    dummy_bbox = draw.textbbox((0,0), "Ag", font=f_cta)
    cta_h = dummy_bbox[3] - dummy_bbox[1]

    pad_x, pad_y = 40, 20
    box_w = cta_w + pad_x * 2
    box_h = cta_h + pad_y * 2

    box_x = (W - box_w) // 2
    box_y = H - 150 # fixed near the bottom

    # Draw rounded rectangle (black background, white border)
    draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=15, fill=(0,0,0,200), outline=(255,255,255,100), width=2)
    # Draw text centered in the box
    draw.text((W//2 - cta_w//2, box_y + pad_y), cta_text, font=f_cta, fill=(255,255,255))

    out_path = OUT_DIR / f"{data['id']}.jpg"
    img.convert("RGB").save(out_path, quality=95)
    print(f"Salvo: {out_path}\n")

    # Registra no dashboard
    reg(
        title = f"Pílula: {data['headline'][:20]}...",
        theme = f"pilula-{data['id']}",
        slides_dir = str(OUT_DIR),
        format = "Quadrado",
        caption = data["sub"],
        slide_prefix = f"{data['id']}" # Assim ele conta apenas este slide
    )

print("Iniciando Fabrica de Pilulas de Poder (1080x1080)...")
for c in criativos:
    process_criativo(c)

print("Finalizado!")
