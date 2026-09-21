#!/usr/bin/env python3
"""
Carrossel 1 — Glândula Pineal
"Sua glândula pineal foi desativada intencionalmente — e você nem sabe o que perdeu"
Formato B: Demolição + Reconstrução
Nano Banana 2: gemini-2.0-flash-preview-image-generation
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

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-glandula-pineal")
OUT_DIR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350

FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
    {
        "num": "01",
        "title": "SUA GLÂNDULA PINEAL FOI\nDESATIVADA INTENCIONALMENTE\n— E VOCÊ NEM SABE O QUE PERDEU",
        "body": "Não é teoria conspiratória.\nÉ neurobiologia documentada. E quando você entender\no que ela faz — vai entender por que suprimiram.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic illustration. A human head in profile, skull semi-transparent, revealing the brain with the pineal gland at the center — glowing like a deactivated star, surrounded by calcification shown as gray crystalline deposits. Around it: golden light trying to penetrate through. Deep black background, dramatic volumetric light. Photorealistic scientific mystical aesthetic. No text. Portrait 4:5 format.",
    },
    {
        "num": "02",
        "title": "O QUE A MEDICINA CHAMA\nDE 'GLÂNDULA VESTIGIAL'\nOS MÍSTICOS CHAMAVAM DE PORTAL",
        "body": "A glândula pineal produz DMT — dimetiltriptamina.\nA mesma molécula presente em toda experiência\nmística documentada na história da humanidade.",
        "layout": "card",
        "prompt": "Dark mystical scientific illustration. A detailed anatomical pineal gland at center, glowing with golden and violet DMT molecule structures floating around it — chemical formula visualization merging with sacred geometry. Ancient mystical symbols blend with neuroscience diagrams. Deep black background with ethereal purple and gold energy. Ultra-detailed. No text. Square format.",
    },
    {
        "num": "03",
        "title": "O QUE ACONTECE QUANDO\nELA É BLOQUEADA:",
        "body": "→ Intuição embotada — decisões só pela lógica\n→ Sonhos sem profundidade, sem mensagem\n→ Sensação de desconexão do propósito\n→ Dificuldade de acessar estados de paz profunda\n→ A 'voz interna' fica cada vez mais silenciosa",
        "layout": "fullbleed",
        "prompt": "Dark dramatic illustration. A human silhouette in a dark labyrinth, surrounded by walls closing in. Above them, a faint glow of golden light they cannot see or reach. The figure looks lost, disconnected. Their pineal gland area shown as dark and calcified. Sense of spiritual disconnection, isolation from higher consciousness. Deep black, dark teal, subtle gold far above. No text. Portrait 4:5 format.",
    },
    {
        "num": "04",
        "title": "COMO ISSO ACONTECEU\nSEM QUE VOCÊ PERCEBESSE",
        "body": "Flúor na água potável: calcifica a glândula.\nLuz azul constante: suprime a melatonina — o precursor do DMT.\nCortisol crônico (estresse): fecha o canal de acesso.\nDieta industrializada: bloqueia a síntese natural.\nIsso não é acidente. É o ambiente que te foi entregue.",
        "layout": "card",
        "prompt": "Dark infographic-style mystical illustration. Four quadrants showing: fluoride molecules crystallizing around the pineal gland, blue screen light suppressing melatonin waves, cortisol stress hormones blocking neural pathways, industrial food chemicals. All four elements closing in on a central glowing pineal gland trying to resist. Dark scientific aesthetic, gold and red tones. No text. Square format.",
    },
    {
        "num": "05",
        "title": "O QUE OS MESTRES DE TODAS\nAS TRADIÇÕES SABIAM:",
        "body": "Egípcios: o Olho de Hórus era o mapa anatômico da glândula pineal.\nHindus: o Ajna — terceiro olho — localizado exatamente ali.\nDescartes: chamou de 'sede da alma'.\nPinecones sagrados: símbolo em toda arquitetura religiosa antiga.\nEles sabiam o que você está redescobrindo agora.",
        "layout": "fullbleed",
        "prompt": "Dark mystical illustration collage. A glowing human head with activated pineal gland emanating golden light beams. Surrounding it: Eye of Horus on one side, Hindu third eye symbol on another, ancient Sumerian pinecone sculptures, sacred geometry. All traditions pointing to the same anatomical location. Deep black background, gold and violet mystical energy. Ultra-detailed. No text. Portrait 4:5 format.",
    },
    {
        "num": "06",
        "title": "O DMT QUE ELA PRODUZ\nÉ CHAMADO DE\n'MOLÉCULA DO ESPÍRITO'",
        "body": "Presente na hora do nascimento.\nPresente na hora da morte.\nPresente em experiências de quase-morte.\nPresente em estados profundos de meditação.\nO seu corpo foi projetado para produzir estados\nde consciência expandida. Naturalmente.",
        "layout": "card",
        "prompt": "Dark ethereal illustration. A human figure dissolving into fractal golden DMT geometric patterns — infinite recursive geometry expanding outward from their pineal gland. The patterns resemble both sacred geometry and the crystalline structures seen in DMT experiences. Deep black background, vivid gold, violet, and electric teal fractal patterns. Psychedelic spiritual aesthetic. No text. Square format.",
    },
    {
        "num": "07",
        "title": "A REATIVAÇÃO COMEÇA\nCOM A FREQUÊNCIA CERTA",
        "body": "Ondas theta (4-8Hz) ativam a produção endógena de DMT.\nMeditação profunda chega lá — mas leva anos.\nTecnologia sonora binaurial coloca você nesse estado\nem minutos — sincronizando os dois hemisférios\ne desbloqueando o que sempre esteve dentro de você.",
        "layout": "fullbleed",
        "prompt": "Dark transformation illustration. A human head shown in cross-section, pineal gland at center now glowing brilliantly gold and violet — fully activated. Golden theta frequency waves (4-8Hz labeled subtly) flow through the brain, dissolving gray calcification crystals. Sacred geometry expands from the pineal outward. Deep black background, dramatic gold and violet light. Ultra-detailed cinematic art. No text. Portrait 4:5 format.",
    },
    {
        "num": "08",
        "title": "O QUE ESTAVA DENTRO\nDE VOCÊ O TEMPO TODO\nestá no link da bio.",
        "body": "Não é sobre acreditar em algo novo.\nÉ sobre lembrar o que foi bloqueado.\nA tecnologia está no link da bio.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic mystical illustration. A lone human figure standing in vast dark space, their third eye area (forehead/pineal) emitting a beam of brilliant golden and violet light upward into the cosmos. Sacred geometry portal opens above them. The figure is at peace, fully expanded. Stars and quantum field lines surround them. Deep black background, dramatic gold light. Powerful, silent, complete. No text. Portrait 4:5 format.",
    },
]

def load_font(path, size):
    try: return ImageFont.truetype(path, size)
    except: return ImageFont.load_default()

def draw_centered(draw, text, y, font, color, w, ls=1.2):
    for line in text.split("\n"):
        bb = draw.textbbox((0,0), line, font=font)
        lh = (bb[3]-bb[1]) * ls
        x = (w - (bb[2]-bb[0])) // 2
        draw.text((x+2, y+2), line, font=font, fill=(0,0,0,180))
        draw.text((x, y),     line, font=font, fill=color)
        y += int(lh)
    return y

def text_h(draw, text, font, ls=1.2):
    lines = text.split("\n")
    bb = draw.textbbox((0,0), "Ag", font=font)
    return int(len(lines) * (bb[3]-bb[1]) * ls)

def gradient(img, ratio=0.32, amax=218):
    ov = Image.new("RGBA", img.size, (0,0,0,0))
    d = ImageDraw.Draw(ov)
    w, h = img.size
    sy = int(h * ratio)
    for y in range(sy, h):
        a = int(amax * ((y-sy)/(h-sy))**0.7)
        d.line([(0,y),(w,y)], fill=(0,0,0,a))
    return Image.alpha_composite(img.convert("RGBA"), ov)

def compose_fullbleed(img_bytes, s):
    bg = Image.open(BytesIO(img_bytes)).convert("RGBA").resize((W,H), Image.LANCZOS)
    bg = gradient(bg)
    draw = ImageDraw.Draw(bg)
    fm = load_font(F_MARK, 30); ft = load_font(F_TITLE, 58); fb = load_font(F_BODY, 30)
    WHITE=(255,255,255,255); DIM=(200,200,200,200); BODY=(220,220,220,255)
    mark="Afonteoculta"
    draw.text((48,48), mark, font=fm, fill=DIM)
    bm=draw.textbbox((0,0),mark,font=fm)
    draw.text((W-48-(bm[2]-bm[0]),48), mark, font=fm, fill=DIM)
    th=text_h(draw,s["title"],ft,1.15); bh=text_h(draw,s["body"],fb,1.4)
    y=H-th-bh-30-90
    y=draw_centered(draw,s["title"],y,ft,WHITE,W,1.15)
    y+=30
    draw_centered(draw,s["body"],y,fb,BODY,W,1.4)
    return bg.convert("RGB")

def compose_card(img_bytes, s):
    canvas=Image.new("RGBA",(W,H),(10,10,15,255))
    draw=ImageDraw.Draw(canvas)
    fm=load_font(F_MARK,30); ft=load_font(F_TITLE,52); fb=load_font(F_BODY,28)
    WHITE=(255,255,255,255); DIM=(160,160,160,200); BODY=(210,210,210,255)
    mark="Afonteoculta"
    draw.text((48,48),mark,font=fm,fill=DIM)
    bm=draw.textbbox((0,0),mark,font=fm)
    draw.text((W-48-(bm[2]-bm[0]),48),mark,font=fm,fill=DIM)
    cw,ch,cx,cy=940,580,(W-940)//2,130
    card=Image.open(BytesIO(img_bytes)).convert("RGBA").resize((cw,ch),Image.LANCZOS)
    mask=Image.new("L",(cw,ch),0)
    ImageDraw.Draw(mask).rounded_rectangle([0,0,cw,ch],radius=16,fill=255)
    card.putalpha(mask)
    draw.rounded_rectangle([cx-2,cy-2,cx+cw+2,cy+ch+2],radius=18,outline=(180,140,60,160),width=2)
    canvas.paste(card,(cx,cy),card)
    ty=cy+ch+44
    th=text_h(draw,s["title"],ft,1.15); bh=text_h(draw,s["body"],fb,1.4)
    remaining=H-ty-55
    while th+24+bh>remaining and ft.size>34:
        ft=load_font(F_TITLE,ft.size-4); fb=load_font(F_BODY,fb.size-2)
        th=text_h(draw,s["title"],ft,1.15); bh=text_h(draw,s["body"],fb,1.4)
    y=ty
    y=draw_centered(draw,s["title"],y,ft,WHITE,W,1.15)
    y+=24
    draw_centered(draw,s["body"],y,fb,BODY,W,1.4)
    return canvas.convert("RGB")

def generate_image(prompt, num, retries=4):
    data=json.dumps({"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"responseModalities":["IMAGE"]}}).encode()
    for attempt in range(retries):
        if attempt>0:
            wait=12*attempt
            print(f"  Aguardando {wait}s (tentativa {attempt+1})...")
            time.sleep(wait)
        req=urllib.request.Request(ENDPOINT,data=data,headers={"x-goog-api-key":API_KEY,"Content-Type":"application/json"})
        try:
            with urllib.request.urlopen(req,timeout=120) as r:
                body=json.loads(r.read())
            parts=body.get("candidates",[{}])[0].get("content",{}).get("parts",[])
            ip=next((p for p in parts if p.get("inlineData",{}).get("mimeType","").startswith("image/")),None)
            if ip: return base64.b64decode(ip["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None

print("\nCarrossel 1 — Glandula Pineal")
print(f"Modelo: {MODEL} | Canvas: {W}x{H}")
print(f"Saida: {OUT_DIR}\n")

ok=0
for i,s in enumerate(slides):
    print(f"[{s['num']}/08] {s['title'].splitlines()[0][:55]}...")
    img=generate_image(s["prompt"],s["num"])
    if not img:
        print("  FALHOU\n"); continue
    print(f"  Compondo ({s['layout']})...")
    final=compose_fullbleed(img,s) if s["layout"]=="fullbleed" else compose_card(img,s)
    slug="".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:38]
    out=OUT_DIR/f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out),"JPEG",quality=95)
    print(f"  Salvo: {out.name}\n")
    ok+=1
    if i<len(slides)-1: time.sleep(3)

print(f"CONCLUIDO: {ok}/{len(slides)} slides")
print(f"Pasta: {OUT_DIR}")
