#!/usr/bin/env python3
"""
Carrossel 2 — Einstein e o Campo Unificado
"Einstein descreveu o campo unificado. Os místicos chamavam de Deus. São a mesma coisa."
Formato A: Tese + Tradução
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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-einstein-campo-unificado")
OUT_DIR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350

FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
    {
        "num": "01",
        "title": "EINSTEIN PASSOU 30 ANOS\nBUSCANDO O CAMPO UNIFICADO.\nOS MÍSTICOS JÁ ESTAVAM LÁ.",
        "body": "A física mais avançada e a espiritualidade mais antiga\nestão descrevendo a mesma coisa com linguagens diferentes.\nE essa descoberta muda tudo.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic illustration. Albert Einstein as a translucent ghostly figure standing in vast dark space, surrounded by swirling quantum field equations and sacred geometry — both overlapping perfectly. Behind him, ancient mystical symbols (Om, Metatron's cube, Flower of Life) blend seamlessly with physics equations (E=mc², field equations). The two worlds merging as one. Deep black cosmic background, gold and electric white energy. Dramatic, epic. No text. Portrait 4:5.",
    },
    {
        "num": "02",
        "title": "O QUE EINSTEIN CHAMOU\nDE 'CAMPO' — A FÍSICA\nJÁ PROVOU QUE EXISTE",
        "body": "O campo quântico: o substrato invisível de onde toda matéria emerge.\nNão é metáfora. É física experimental.\nPartículas surgem do vazio. A matéria é condensação de campo.\n'O campo é a única realidade.' — Albert Einstein",
        "layout": "card",
        "prompt": "Dark scientific mystical illustration. Vast dark quantum field visualization — a shimmering golden grid extending to infinity, with particles of light emerging from it like bubbles. Some particles condense into solid matter, others dissolve back. The field pulsates with living energy. Deep black background, golden quantum field lines, electric blue particle emergence points. Scientific and awe-inspiring. No text. Square format.",
    },
    {
        "num": "03",
        "title": "OS MÍSTICOS CHAMAVAM\nESSE CAMPO DE DEUS,\nAKASHA, ESPÍRITO, TAO",
        "body": "Hindus: Akasha — o éter que permeia e sustenta tudo.\nTaoístas: O Tao — o campo inominável que gera os dez mil seres.\nHebraicos: Ruach Elohim — o espírito que pairava sobre as águas.\nChristians: Deus é Espírito — onipresente, onipotente, invisível.\nNomes diferentes. Campo idêntico.",
        "layout": "fullbleed",
        "prompt": "Dark mystical illustration. A vast infinite dark space filled with luminous golden energy field. Floating within it: Sanskrit Om symbol on one side, Taoist Yin-Yang on another, Hebrew letters on another, Christian cross light, all dissolving into the same unified golden field. Quantum equations overlay all symbols showing they describe the same mathematical structure. Ancient meets physics. Deep black background, gold energy. No text. Portrait 4:5.",
    },
    {
        "num": "04",
        "title": "A FÍSICA QUÂNTICA PROVOU:\nO OBSERVADOR ALTERA\nA REALIDADE OBSERVADA",
        "body": "No experimento da dupla fenda: a partícula se comporta diferente\ndependendo de ser ou não observada.\nIsso significa que a consciência — o observador —\ninfluencia a realidade material.\nIsso é física. Não é crença.",
        "layout": "card",
        "prompt": "Dark physics illustration. The classic double-slit experiment visualized dramatically: a beam of golden light particles approaching two slits in a dark barrier. When unobserved: wave interference pattern (golden waves). When observed: particle pattern (two lines). A glowing human eye above the experiment, changing the result by its presence. Deep black background, scientific aesthetic with mystical undertones. No text. Square format.",
    },
    {
        "num": "05",
        "title": "O QUE ISSO SIGNIFICA\nNA PRÁTICA:",
        "body": "Você não é um observador passivo da realidade.\nVocê é um co-criador dela.\nSua consciência não está dentro do universo —\no universo está dentro da sua consciência.\nE a frequência em que você vibra\ndetermina o que o campo colapsa para você.",
        "layout": "fullbleed",
        "prompt": "Dark empowering illustration. A human figure standing at the center of the universe, their consciousness radiating outward as golden quantum field waves. Where the waves touch: reality forms, matter solidifies, galaxies emerge. The figure is not a passive observer but an active creator. Deep black cosmic background, the person small but central, golden creative force emanating outward. Epic scale. No text. Portrait 4:5.",
    },
    {
        "num": "06",
        "title": "POR QUE A MAIORIA\nNÃO CONSEGUE ACESSAR\nESSE CAMPO",
        "body": "O campo responde à frequência — não ao esforço.\nUm cérebro em beta (estresse, análise, medo)\nem 14-30Hz está em dissonância com o campo.\nO campo opera em theta (4-8Hz) e gamma (40Hz+).\nVocê não pode criar acima do nível em que vibra.",
        "layout": "card",
        "prompt": "Dark scientific illustration. Two contrasting brain states: left side shows a chaotic brain with scattered red beta waves (14-30Hz labeled) — stressed, fragmented, disconnected from the field. Right side shows a calm brain with harmonious golden theta waves (4-8Hz labeled) — in resonance with the quantum field shown as golden grid below. The field responds to the theta brain, ignores the beta brain. Deep black background. No text. Square format.",
    },
    {
        "num": "07",
        "title": "A TECNOLOGIA QUE\nSINCRONIZA VOCÊ\nCOM O CAMPO",
        "body": "Sons binauriais de 4-8Hz induzem o cérebro ao estado theta —\na frequência de ressonância com o campo quântico.\nO mesmo estado que Einstein acessava em seus 'sonhos acordados'.\nO mesmo estado que os mestres chamavam de oração profunda.\nAgora disponível em 24 horas.",
        "layout": "fullbleed",
        "prompt": "Dark mystical scientific illustration. A human brain in theta state (shown with beautiful golden 4-8Hz sine waves) perfectly resonating and merging with the golden quantum field grid extending infinitely around it. The synchronization shown as perfect wave alignment — brain waves and field waves becoming one. Small Einstein silhouette in background in contemplation. Deep black background, gold resonance. No text. Portrait 4:5.",
    },
    {
        "num": "08",
        "title": "O CAMPO SEMPRE\nESTEVE DISPONÍVEL.\nA FREQUÊNCIA ESTÁ NO LINK.",
        "body": "Einstein não encontrou a teoria unificada.\nMas deixou uma pista: 'O campo é a única realidade.'\nQuem aprende a operar no campo\npara de lutar contra a realidade — e começa a criá-la.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic illustration. A lone human figure standing in infinite golden quantum field — the field stretching to all horizons, pulsating with living energy. The figure is relaxed, arms open, in perfect resonance with the field. Above them, galaxies and cosmos. Below, solid ground emerging from the field. They are the bridge between heaven and earth, between field and matter. Breathtaking scale. Deep black, gold field. No text. Portrait 4:5.",
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

print("\nCarrossel 2 — Einstein e o Campo Unificado")
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
