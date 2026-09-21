#!/usr/bin/env python3
"""
Gerador de Carrossel Completo — Fonte Oculta
Tema: "O que você chama de rezar, a neurociência chama de reconfiguração neural"
Imagens: Nano Banana 2 (gemini-2.0-flash-preview-image-generation)
Design: Python + Pillow — texto + imagem compostos
"""


import os

from dotenv import load_dotenv

load_dotenv()
import base64
import json
import time
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ── Config ─────────────────────────────────────────────────────────────────────
API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-oracao-neurociencia")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Canvas 1080x1350 (Instagram 4:5)
W, H = 1080, 1350

# Fonts
FD = Path("C:/Windows/Fonts")
F_TITLE    = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY     = str(FD / "Inter-Regular-slnt=0.ttf")
F_BOLD     = str(FD / "Inter-Bold-slnt=0.ttf")
F_MARK     = str(FD / "Inter-Regular-slnt=0.ttf")

# Colors
WHITE      = (255, 255, 255, 255)
WHITE_DIM  = (200, 200, 200, 180)
BLACK_FULL = (0, 0, 0, 255)

# ── Slide data ──────────────────────────────────────────────────────────────────
slides = [
    {
        "num": "01",
        "title": "O QUE VOCÊ CHAMA DE REZAR,\nA NEUROCIÊNCIA CHAMA DE\nRECONFIGURAÇÃO NEURAL",
        "body": "E isso explica por que algumas orações \"funcionam\" e a maioria\ncai no vazio — não é questão de fé. É questão de frequência.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic portrait photograph. A human figure kneeling in prayer, brain semi-transparent and glowing with neural frequency waves — golden gamma waves at 40Hz emanating from the mind upward. Dramatic volumetric light from above. The neural waves create halos of golden electric energy around the figure. Deep black background. Photorealistic, ultra-detailed, spiritual neuroscience aesthetic. No text. Portrait 4:5 format.",
    },
    {
        "num": "02",
        "title": '"A MORTE E A VIDA ESTÃO NO\nPODER DA LÍNGUA"\n— PROVÉRBIOS 18:21',
        "body": "As palavras que você fala alteram a estrutura molecular da água.\nMasaru Emoto provou com cristais. Seu corpo é 70% água.",
        "layout": "card",
        "prompt": "Dark dramatic macro photograph. Close-up of human lips slightly open, visible golden sound frequency waves emanating outward. Below the lips, water molecules forming crystal structures — chaotic dark red ones and perfect golden hexagonal ones. Deep black background, scientific meets mystical aesthetic. Ultra-detailed. No text. Square format.",
    },
    {
        "num": "03",
        "title": "POR QUE 90% DAS ORAÇÕES\n\"NÃO FUNCIONAM\"",
        "body": "Você ora em BETA (14-30Hz) — o estado do problema.\nA resposta existe em THETA (4-8Hz) — o estado da solução.\nÉ como ligar para um número errado e ninguém atender.",
        "layout": "fullbleed",
        "prompt": "Dark scientific illustration. Split visualization: left half shows chaotic red brain waves — beta state of stress, anxiety, scattered thoughts. Right half shows calm harmonious golden theta waves — peace, creation, solution state. In the center, a glowing human brain transitioning between states. Deep black background, electric energy fields. Cinematic scientific mystical art. No text. Portrait 4:5 format.",
    },
    {
        "num": "04",
        "title": '"QUANDO ORARES, ENTRA NO\nTEU QUARTO SECRETO..."\n— MATEUS 6:6',
        "body": "O 'quarto secreto' não é físico. É um estado mental.\nOs hebraicos chamavam de hitbonenut — contemplação\nque altera a onda cerebral. A neurociência mede em 4-8Hz.",
        "layout": "card",
        "prompt": "Dark mystical illustration of an ancient stone chamber illuminated from within by golden divine light. A lone meditating figure at center, their mind expanding outward as golden theta waves and sacred geometry fill the space. Ancient stone walls etched with sacred symbols. Candlelight. Deep shadow with dramatic gold light contrast. Cinematic, ultra-detailed. No text. Square format.",
    },
    {
        "num": "05",
        "title": "A RAZÃO REAL PELA QUAL\nO QUE VOCÊ QUER\nAINDA NÃO CHEGOU",
        "body": "Não é falta de fé. Não é falta de merecimento.\nSua frequência cerebral dominante nunca entrou\nno estado onde a mudança acontece.",
        "layout": "fullbleed",
        "prompt": "Dark dramatic artistic illustration. A human silhouette reaching upward toward a beam of brilliant golden light above, but separated by an invisible frequency barrier — shown as dark chaotic interference waves blocking the connection. Above the barrier: golden light, abundance, clarity. Below: deep shadows. The figure almost touching breakthrough. Cinematic, emotional, ultra-detailed. No text. Portrait 4:5 format.",
    },
    {
        "num": "06",
        "title": "O QUE MONGES TIBETANOS\nE NEUROCIENTISTAS\nCONCORDAM:",
        "body": "Após 40 minutos de oração profunda, o cérebro produz\nondas gamma de 40Hz. Bloqueios se dissolvem.\nCrenças são reescritas. O campo ao redor muda.",
        "layout": "card",
        "prompt": "Dark mystical illustration of a Buddhist monk in deep meditation, skull semi-transparent revealing a glowing brain with visible 40Hz gamma waves as golden rings. Sacred geometry mandalas floating around. Ancient temple merged with neuroscience laboratory — EEG machine showing gamma brainwaves visible in background. Deep black background, gold and amber tones. Ultra-detailed. No text. Square format.",
    },
    {
        "num": "07",
        "title": "E SE VOCÊ CONSEGUISSE\nENTRAR NESSE ESTADO\nEM MENOS DE 24 HORAS?",
        "body": "Tecnologia sonora binaurial — usada em laboratórios de\nneurociência — sincroniza seus dois hemisférios e induz\no estado theta-gamma em minutos.",
        "layout": "fullbleed",
        "prompt": "Dark scientific mystical illustration. Two glowing brain hemispheres — left side red and chaotic, right side red and chaotic. In the center between them, a golden binaural sound wave passes through both. After synchronization, both hemispheres transform and glow unified in brilliant gold light. Sound waves radiate outward. Deep black background with electric blue accents. No text. Portrait 4:5 format.",
    },
    {
        "num": "08",
        "title": "O PORTAL ESTÁ\nNO LINK DA BIO.",
        "body": "Quem entendeu que a mudança não vem de mais esforço\n— mas de acessar a frequência certa — já está dentro.\nOs demais continuarão pedindo no nível errado.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic illustration. A luminous golden portal made of concentric sound wave frequency rings opens in deep dark space. A lone human silhouette stands at the threshold, on the edge of stepping through into brilliant golden light. Around the portal, sacred geometry patterns and quantum frequency lines. Deep black background with dramatic light contrast. Silent, powerful, decisive atmosphere. Ultra-detailed mystical art. No text. Portrait 4:5 format.",
    },
]

# ── API call ────────────────────────────────────────────────────────────────────
def generate_image(prompt, slide_num):
    print("  🎨 Gerando imagem Nano Banana 2...")
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode("utf-8")

    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  ❌ HTTP {e.code}: {err[:300]}")
        return None
    except Exception as e:
        print(f"  ❌ Erro: {e}")
        return None

    parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    img_part = next((p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")), None)
    if not img_part:
        print(f"  ❌ Sem imagem. Resposta: {json.dumps(body)[:300]}")
        return None

    return base64.b64decode(img_part["inlineData"]["data"])

# ── Text helpers ────────────────────────────────────────────────────────────────
def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def draw_text_centered(draw, text, y, font, color, max_width, line_spacing=1.2):
    lines = text.split("\n")
    bbox = draw.textbbox((0, 0), "Ag", font=font)
    line_h = (bbox[3] - bbox[1]) * line_spacing
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        x = (max_width - tw) // 2
        # Shadow
        draw.text((x + 2, y + 2), line, font=font, fill=(0, 0, 0, 180))
        draw.text((x, y), line, font=font, fill=color)
        y += int(line_h)
    return y

def text_block_height(draw, text, font, line_spacing=1.2):
    lines = text.split("\n")
    bbox = draw.textbbox((0, 0), "Ag", font=font)
    line_h = (bbox[3] - bbox[1]) * line_spacing
    return int(len(lines) * line_h)

# ── Gradient overlay ────────────────────────────────────────────────────────────
def add_gradient_overlay(img, start_y_ratio=0.35, alpha_max=210):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = img.size
    start_y = int(h * start_y_ratio)
    for y in range(start_y, h):
        alpha = int(alpha_max * ((y - start_y) / (h - start_y)) ** 0.7)
        draw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
    return Image.alpha_composite(img.convert("RGBA"), overlay)

# ── Compose slide: fullbleed layout ────────────────────────────────────────────
def compose_fullbleed(img_bytes, slide):
    bg_img = Image.open(BytesIO(img_bytes)).convert("RGBA")
    bg_img = bg_img.resize((W, H), Image.LANCZOS)

    # Dark gradient from middle down
    bg_img = add_gradient_overlay(bg_img, start_y_ratio=0.30, alpha_max=220)

    draw = ImageDraw.Draw(bg_img)

    # Fonts
    font_mark  = load_font(F_MARK, 30)
    font_title = load_font(F_TITLE, 60)
    font_body  = load_font(F_BODY, 32)

    # Watermark top
    mark = "Afonteoculta"
    draw.text((48, 48), mark, font=font_mark, fill=(200, 200, 200, 200))
    bbox_r = draw.textbbox((0, 0), mark, font=font_mark)
    draw.text((W - 48 - (bbox_r[2] - bbox_r[0]), 48), mark, font=font_mark, fill=(200, 200, 200, 200))

    # Calculate text block total height
    title_h = text_block_height(draw, slide["title"], font_title, 1.15)
    body_h  = text_block_height(draw, slide["body"], font_body, 1.4)
    gap     = 30
    padding = 60
    total_h = title_h + gap + body_h + padding

    # Starting Y
    y_start = H - total_h - 80

    y = y_start
    y = draw_text_centered(draw, slide["title"], y, font_title, WHITE, W, 1.15)
    y += gap
    draw_text_centered(draw, slide["body"], y, font_body, (220, 220, 220, 255), W, 1.4)

    return bg_img.convert("RGB")

# ── Compose slide: card layout ──────────────────────────────────────────────────
def compose_card(img_bytes, slide):
    # Dark background
    canvas = Image.new("RGBA", (W, H), (10, 10, 15, 255))
    draw   = ImageDraw.Draw(canvas)

    # Fonts
    font_mark  = load_font(F_MARK, 30)
    font_title = load_font(F_TITLE, 54)
    font_body  = load_font(F_BODY, 30)

    # Watermark top
    mark = "Afonteoculta"
    draw.text((48, 48), mark, font=font_mark, fill=(160, 160, 160, 200))
    bbox_r = draw.textbbox((0, 0), mark, font=font_mark)
    draw.text((W - 48 - (bbox_r[2] - bbox_r[0]), 48), mark, font=font_mark, fill=(160, 160, 160, 200))

    # Card image — centered, with subtle golden border
    card_w = 940
    card_h = 620
    card_x = (W - card_w) // 2
    card_y = 130

    card_img = Image.open(BytesIO(img_bytes)).convert("RGBA")
    card_img = card_img.resize((card_w, card_h), Image.LANCZOS)

    # Rounded mask for card
    mask = Image.new("L", (card_w, card_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, card_w, card_h], radius=18, fill=255)
    card_img.putalpha(mask)

    # Subtle golden border
    border_draw = ImageDraw.Draw(canvas)
    border_draw.rounded_rectangle(
        [card_x - 2, card_y - 2, card_x + card_w + 2, card_y + card_h + 2],
        radius=20, outline=(180, 140, 60, 180), width=2
    )

    canvas.paste(card_img, (card_x, card_y), card_img)

    # Text below card
    text_y = card_y + card_h + 48

    title_h = text_block_height(draw, slide["title"], font_title, 1.15)
    body_h  = text_block_height(draw, slide["body"], font_body, 1.4)
    gap = 26

    # Check if text fits, scale down if needed
    remaining = H - text_y - 60
    while (title_h + gap + body_h) > remaining and font_title.size > 36:
        font_title = load_font(F_TITLE, font_title.size - 4)
        font_body  = load_font(F_BODY, font_body.size - 2)
        title_h = text_block_height(draw, slide["title"], font_title, 1.15)
        body_h  = text_block_height(draw, slide["body"], font_body, 1.4)

    y = text_y
    y = draw_text_centered(draw, slide["title"], y, font_title, WHITE, W, 1.15)
    y += gap
    draw_text_centered(draw, slide["body"], y, font_body, (210, 210, 210, 255), W, 1.4)

    return canvas.convert("RGB")

# ── Main ────────────────────────────────────────────────────────────────────────
def main():
    print("\nNANO BANANA 2 -- Carrossel Completo")
    print(f"Canvas: {W}x{H} | Modelo: {MODEL}")
    print(f"Saida: {OUT_DIR}\n")

    success = 0
    for i, slide in enumerate(slides):
        print(f"[{slide['num']}/08] {slide['title'].splitlines()[0][:50]}...")

        img_bytes = generate_image(slide["prompt"], slide["num"])
        if not img_bytes:
            print(f"  ⚠️  Pulando slide {slide['num']}")
            continue

        print(f"  🖼️  Compondo slide ({slide['layout']})...")
        if slide["layout"] == "fullbleed":
            final = compose_fullbleed(img_bytes, slide)
        else:
            final = compose_card(img_bytes, slide)

        slug = slide["title"].splitlines()[0].lower()
        slug = "".join(c if c.isalnum() else "-" for c in slug).strip("-")
        slug = slug[:40]
        out_path = OUT_DIR / f"slide-{slide['num']}-{slug}.jpg"
        final.save(str(out_path), "JPEG", quality=95)
        print(f"  ✅ Salvo: {out_path.name}")
        success += 1

        # Delay entre slides para não sobrecarregar a API
        if i < len(slides) - 1:
            time.sleep(2)

    print(f"\n🎉 CONCLUÍDO! {success}/{len(slides)} slides gerados")
    print(f"📁 {OUT_DIR}")

if __name__ == "__main__":
    main()
