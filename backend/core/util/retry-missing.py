#!/usr/bin/env python3
"""Retry slides 03, 06, 07, 08"""


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

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-oracao-neurociencia")
W, H = 1080, 1350

FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
    {
        "num": "03",
        "title": 'POR QUE 90% DAS ORAÇÕES\n"NÃO FUNCIONAM"',
        "body": "Você ora em BETA (14-30Hz) — o estado do problema.\nA resposta existe em THETA (4-8Hz) — o estado da solução.\nÉ como ligar para um número errado e ninguém atender.",
        "layout": "fullbleed",
        "prompt": "Dark scientific mystical illustration. A split human brain visualization: left side shows chaotic red electrical waves labeled BETA — stress, worry, scattered thinking. Right side shows calm harmonious golden waves labeled THETA — peace, creation, solution. A glowing brain in center transitioning between states. Deep black background. Cinematic scientific art. No text. Portrait 4:5 format.",
    },
    {
        "num": "06",
        "title": "O QUE MONGES TIBETANOS\nE NEUROCIENTISTAS\nCONCORDAM:",
        "body": "Após 40 minutos de oração profunda, o cérebro produz\nondas gamma de 40Hz. Bloqueios se dissolvem.\nCrenças são reescritas. O campo ao redor muda.",
        "layout": "card",
        "prompt": "Dark mystical digital art. A Buddhist monk meditating in lotus position, their head semi-transparent showing a glowing brain with golden 40Hz gamma frequency rings radiating outward. Sacred geometry patterns floating around the monk. Ancient temple merged with modern neuroscience instruments in background. Deep black and dark background, gold and amber energy tones. Ultra-detailed. No text. Square 1:1 format.",
    },
    {
        "num": "07",
        "title": "E SE VOCÊ CONSEGUISSE\nENTRAR NESSE ESTADO\nEM MENOS DE 24 HORAS?",
        "body": "Tecnologia sonora binaurial — usada em laboratórios de\nneurociência — sincroniza seus dois hemisférios e induz\no estado theta-gamma em minutos.",
        "layout": "fullbleed",
        "prompt": "Dark scientific mystical illustration. Two human brain hemispheres shown floating in dark space. Left: red and fragmented, chaotic energy. Right: also fragmented. Between them: a golden sinusoidal sound wave connecting both. After the wave passes: both hemispheres glow and synchronize in brilliant gold. Electric blue energy radiates outward. Deep black background. Portrait 4:5 format. No text.",
    },
    {
        "num": "08",
        "title": "O PORTAL ESTÁ\nNO LINK DA BIO.",
        "body": "Quem entendeu que a mudança não vem de mais esforço\n— mas de acessar a frequência certa — já está dentro.\nOs demais continuarão pedindo no nível errado.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic mystical illustration. A luminous golden circular portal made of glowing sound wave rings in deep black space. Brilliant white and gold light emanates from within the portal. A lone dark human silhouette stands before it, about to step through. Sacred geometry surrounds the portal. Dramatic cinematic lighting. Ultra-detailed spiritual art. No text. Portrait 4:5 format.",
    },
]

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
        draw.text((x + 2, y + 2), line, font=font, fill=(0, 0, 0, 180))
        draw.text((x, y), line, font=font, fill=color)
        y += int(line_h)
    return y

def text_block_height(draw, text, font, line_spacing=1.2):
    lines = text.split("\n")
    bbox = draw.textbbox((0, 0), "Ag", font=font)
    line_h = (bbox[3] - bbox[1]) * line_spacing
    return int(len(lines) * line_h)

def add_gradient_overlay(img, start_y_ratio=0.35, alpha_max=210):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = img.size
    start_y = int(h * start_y_ratio)
    for y in range(start_y, h):
        alpha = int(alpha_max * ((y - start_y) / (h - start_y)) ** 0.7)
        draw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
    return Image.alpha_composite(img.convert("RGBA"), overlay)

def generate_image(prompt, num, max_retries=4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode("utf-8")
    for attempt in range(max_retries):
        if attempt > 0:
            wait = 15 * attempt
            print(f"  Aguardando {wait}s antes de retry {attempt+1}...")
            time.sleep(wait)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                body = json.loads(resp.read())
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            img_part = next((p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")), None)
            if img_part:
                return base64.b64decode(img_part["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            print(f"  HTTP {e.code}: {err[:200]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None

def compose_fullbleed(img_bytes, slide):
    bg = Image.open(BytesIO(img_bytes)).convert("RGBA").resize((W, H), Image.LANCZOS)
    bg = add_gradient_overlay(bg, 0.30, 220)
    draw = ImageDraw.Draw(bg)
    fm = load_font(F_MARK, 30); ft = load_font(F_TITLE, 60); fb = load_font(F_BODY, 32)
    WHITE = (255, 255, 255, 255); DIM = (200, 200, 200, 200); BODY = (220, 220, 220, 255)
    mark = "Afonteoculta"
    draw.text((48, 48), mark, font=fm, fill=DIM)
    bm = draw.textbbox((0,0), mark, font=fm)
    draw.text((W - 48 - (bm[2]-bm[0]), 48), mark, font=fm, fill=DIM)
    th = text_block_height(draw, slide["title"], ft, 1.15)
    bh = text_block_height(draw, slide["body"], fb, 1.4)
    y = H - th - bh - 30 - 80
    y = draw_text_centered(draw, slide["title"], y, ft, WHITE, W, 1.15)
    y += 30
    draw_text_centered(draw, slide["body"], y, fb, BODY, W, 1.4)
    return bg.convert("RGB")

def compose_card(img_bytes, slide):
    canvas = Image.new("RGBA", (W, H), (10, 10, 15, 255))
    draw = ImageDraw.Draw(canvas)
    fm = load_font(F_MARK, 30); ft = load_font(F_TITLE, 54); fb = load_font(F_BODY, 30)
    WHITE = (255, 255, 255, 255); DIM = (160, 160, 160, 200); BODY = (210, 210, 210, 255)
    mark = "Afonteoculta"
    draw.text((48, 48), mark, font=fm, fill=DIM)
    bm = draw.textbbox((0,0), mark, font=fm)
    draw.text((W - 48 - (bm[2]-bm[0]), 48), mark, font=fm, fill=DIM)
    cw, ch, cx, cy = 940, 620, (W-940)//2, 130
    card = Image.open(BytesIO(img_bytes)).convert("RGBA").resize((cw, ch), Image.LANCZOS)
    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw, ch], radius=18, fill=255)
    card.putalpha(mask)
    draw.rounded_rectangle([cx-2, cy-2, cx+cw+2, cy+ch+2], radius=20, outline=(180,140,60,180), width=2)
    canvas.paste(card, (cx, cy), card)
    ty = cy + ch + 48
    th = text_block_height(draw, slide["title"], ft, 1.15)
    bh = text_block_height(draw, slide["body"], fb, 1.4)
    y = ty
    y = draw_text_centered(draw, slide["title"], y, ft, WHITE, W, 1.15)
    y += 26
    draw_text_centered(draw, slide["body"], y, fb, BODY, W, 1.4)
    return canvas.convert("RGB")

print("Retentando slides 03, 06, 07, 08...\n")
for slide in slides:
    print(f"[{slide['num']}] {slide['title'].splitlines()[0][:50]}...")
    img = generate_image(slide["prompt"], slide["num"])
    if not img:
        print("  FALHOU - pulando\n")
        continue
    print(f"  Compondo ({slide['layout']})...")
    if slide["layout"] == "fullbleed":
        final = compose_fullbleed(img, slide)
    else:
        final = compose_card(img, slide)
    slug = slide["title"].splitlines()[0].lower()
    slug = "".join(c if c.isalnum() else "-" for c in slug).strip("-")[:40]
    out = OUT_DIR / f"slide-{slide['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  Salvo: {out.name}\n")
    time.sleep(5)

print("Pronto!")
