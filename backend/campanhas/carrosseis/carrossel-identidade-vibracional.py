#!/usr/bin/env python3
"""
Carrossel 3 — Lei da Atracao x Identidade Vibracional
"Voce nao esta atraindo o que quer. Esta atraindo quem voce e vibratoriamente."
Formato B: Demolicao + Reconstrucao
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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-identidade-vibracional")
OUT_DIR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350

FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
    {
        "num": "01",
        "title": "VOCE NAO ESTA ATRAINDO\nO QUE QUER.\nESTa ATRAINDO QUEM VOCE E.",
        "body": "A Lei da Atracao nao falhou com voce.\nVoce nunca foi ensinado como ela realmente funciona.\nE ha uma diferenca devastadora entre as duas coisas.",
        "layout": "fullbleed",
        "prompt": "Dark dramatic illustration. A human figure surrounded by a glowing mirror that reflects not what they wish for — but who they actually are vibrationally. The desired reality (shown as golden distant light) floats far away, while their current vibrational identity (darker, tangled energy) pulls everything toward them instead. Sense of magnetic law being misunderstood. Deep black background, contrast between dim current state and distant golden desired state. No text. Portrait 4:5.",
    },
    {
        "num": "02",
        "title": "A VERSAO QUE TE ENSINARAM\nSOBRE A LEI DA ATRACAO\nESTa INCOMPLETA",
        "body": "Te ensinaram: pense positivo + visualize = manifesta.\nO problema: voce pode pensar em abundancia\nenquanto vibra em escassez.\nO subconsciente (95% das suas acoes) vence sempre.\nVisualizacao sem reprogramacao e decoracao.",
        "layout": "card",
        "prompt": "Dark contrast illustration. Split scene: left side shows a person smiling and creating a vision board with luxury items and positive words — but their energy field (shown as aura) is dark and contracted, full of fear and scarcity patterns. Right side shows the same person in deep theta state — no vision board — but their energy field expanded, golden, magnetic. The law responds to the field, not the thought. Deep black background. No text. Square format.",
    },
    {
        "num": "03",
        "title": "O QUE A LEI REALMENTE\nDIZ (A PARTE QUE\nNINGUEM ENSINA):",
        "body": "O universo nao responde ao que voce quer.\nResponde ao que voce E.\nNao ao pensamento consciente — mas ao campo eletromagnetico\nque seu coracao irradia a 5.000 vezes a forca do cerebro.\nVoce nao atrai o que deseja. Atrai o que irradia.",
        "layout": "fullbleed",
        "prompt": "Dark scientific mystical illustration. A glowing human heart at center, radiating powerful toroidal electromagnetic field rings outward in all directions — gold and electric. The field acts as a magnet, pulling toward the person exactly what matches its frequency. Scattered around: the things being attracted (some desired, some not) all matching the field's vibration. HeartMath visualization style. Deep black, gold heart field. No text. Portrait 4:5.",
    },
    {
        "num": "04",
        "title": "A DIFERENCA ENTRE\nDESEJO E IDENTIDADE\nVIBRACIONAL:",
        "body": "Desejo: o que voce quer conscientemente.\nIdentidade vibracional: quem voce e no subconsciente.\nExemplo: voce quer abundancia (desejo)\nmas se sente indigno dela desde a infancia (identidade).\nO campo do coracao transmite a identidade — nao o desejo.\nO universo entrega a identidade. Sempre.",
        "layout": "card",
        "prompt": "Dark illustration showing two levels of a person. Above: conscious mind shown as a bright surface level with desired images floating — money, love, peace. Below: subconscious shown as deep dark ocean filled with old patterns, childhood imprints, unworthiness programs — all glowing with different frequency than the surface. The universe's field interacts with the deep level, not the surface. Iceberg metaphor meets quantum field. Deep black, layered depths. No text. Square format.",
    },
    {
        "num": "05",
        "title": "VOCE RECONHECE\nESSE PADRAO?",
        "body": "Voce sabe o que precisa fazer — mas nao faz.\nVoce visualiza abundancia — mas toma decisoes de escassez.\nVoce atrai sempre o mesmo tipo de situacao.\nNao e falta de disciplina. Nao e falta de fe.\nE o seu programa subconsciente respondendo mais alto\nque o seu desejo consciente.",
        "layout": "fullbleed",
        "prompt": "Dark emotional illustration. A person standing in a recurring loop — shown as a circular time distortion around them. The same situations, same people types, same financial patterns repeat around them like a carousel they cannot exit. Their expression shows recognition — they see the pattern now. Glowing frequency rings show the loop is vibrational, not circumstantial. Dark dramatic atmosphere. Deep black with subtle gold loop patterns. No text. Portrait 4:5.",
    },
    {
        "num": "06",
        "title": "IDENTIDADE PRECEDE\nMANIFESTACAO.\nSEMPRE.",
        "body": "Nao e o que voce faz que cria sua realidade.\nE quem voce E vibratoriamente antes de agir.\nAbraham Hicks, Neville Goddard, Joe Dispenza:\ntodos chegaram ao mesmo ponto.\nSer antes de ter. Frequencia antes de forma.\nIdentidade antes de manifestacao.",
        "layout": "card",
        "prompt": "Dark mystical illustration. A timeline showing the sequence of manifestation: first, a person's vibrational identity field shifts and expands (shown as golden aura transformation). Then, inspired action flows naturally. Then, reality reorganizes itself to match. The sequence is clear: Being → Doing → Having — not the reverse. Sacred geometry shows the law. Deep black background, gold progression. No text. Square format.",
    },
    {
        "num": "07",
        "title": "COMO MUDAR A IDENTIDADE\nVIBRACIONAL EM MENOS\nDE 24 HORAS",
        "body": "A identidade vibracional esta gravada no subconsciente.\nO subconsciente e acessivel apenas em estado theta (4-8Hz).\nTecnologia sonora binaural induz o cerebro a theta em minutos —\no estado onde a reprogramacao acontece em profundidade.\nNao e afirmacao. E acesso ao nivel onde o programa roda.",
        "layout": "fullbleed",
        "prompt": "Dark transformation illustration. A person in theta state — brain shown with calm golden 4-8Hz waves — surrounded by old dark subconscious programs dissolving like ash. New golden identity patterns crystallizing in their place. The vibrational field around them shifting from contracted dark to expanded luminous. The change happening at the deepest level. Deep black, dramatic gold and purple transformation energy. No text. Portrait 4:5.",
    },
    {
        "num": "08",
        "title": "VOCE NAO PRECISA\nDE MAIS DESEJO.\nPRECISA DE NOVA IDENTIDADE.",
        "body": "O link esta na bio.\nQuem entrou nao esta tentando atrair mais.\nEsta se tornando quem ja tem.\nHa uma diferenca que muda tudo.",
        "layout": "fullbleed",
        "prompt": "Dark cinematic illustration. Two versions of the same person side by side: left — contracted, reaching desperately toward desires that float away. Right — expanded, radiating gold, the same desires now flowing naturally toward them magnetically. The right version is not trying harder. They simply became a different frequency. Deep black background, powerful contrast between the two states. Epic, emotional, decisive. No text. Portrait 4:5.",
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

print("\nCarrossel 3 — Identidade Vibracional")
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
