#!/usr/bin/env python3
"""Carrossel — Neville Goddard | gemini-2.0-flash-preview-image-generation"""

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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-neville-goddard")
OUT_DIR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350
FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
  {"num":"01","layout":"fullbleed",
   "title":"NEVILLE GODDARD ENSINAVA QUE\nVOCÊ NÃO FOI FEITO À IMAGEM DE DEUS.\nVOCÊ É A CONSCIÊNCIA DE DEUS\nINDIVIDUALIZANDO-SE.",
   "body":"Não é blasfêmia. É a interpretação mais literal do que está escrito.\nE quando você entende a diferença,\ntudo sobre como você cria a realidade muda.",
   "prompt":"Dark cinematic mystical illustration. A human figure dissolving upward into infinite golden light — not ascending toward God, but expanding outward as God. The boundary between the person and the divine disappears. Sacred geometry emanates from their core. Above: the cosmos. Below: solid ground. The figure is both human and infinite simultaneously. Deep black background, brilliant gold and white divine light. Epic scale. No text. Portrait 4:5."},
  {"num":"02","layout":"card",
   "title":"VOCÊ JÁ SENTIU QUE O QUE EXISTE\nDENTRO DE VOCÊ É MAIOR DO QUE\nQUALQUER NOME QUE COLOCARAM NELE",
   "body":"Antes de ser filho, profissional ou qualquer outra identidade,\nexiste um estado puro de presença que é simplesmente você existindo.\nNeville chamava isso de I AM.\nÉ o mesmo nome que Deus revelou a Moisés no monte.",
   "prompt":"Dark contemplative illustration. A person sitting in stillness, their form glowing with pure white inner light — no labels, no roles, no identities attached. Around them float transparent silhouettes of the roles they play (worker, parent, etc) but these are clearly separate from the luminous core self. Ancient flame in background like the burning bush. Deep black, white and gold inner light. No text. Square format."},
  {"num":"03","layout":"fullbleed",
   "title":"O QUE A RELIGIÃO INSTITUCIONAL\nFEZ COM ESSE ENSINAMENTO",
   "body":"Posicionou Deus como entidade separada que precisa ser adorada,\npedida e aguardada.\nTransformou o ser humano em receptor passivo de uma vontade externa.\nUm ser que ora esperando resposta de fora\nnunca vai buscar o poder que Neville dizia estar dentro.",
   "prompt":"Dark dramatic contrast illustration. Left side: a person kneeling in submission, looking upward to an empty throne far above in the clouds — vast distance between human and divine, supplication and passivity. Right side: the same person standing upright, glowing with inner divine light, the throne now recognized as within. Church architecture crumbling on the left. Open cosmos on the right. Deep black, dramatic contrast. No text. Portrait 4:5."},
  {"num":"04","layout":"card",
   "title":"O QUE ESTÁ ESCRITO, DE FATO",
   "body":"Êxodo 3:14. Deus responde a Moisés: Eu Sou o Que Sou.\nEm hebraico: Ehyeh Asher Ehyeh.\nA mesma estrutura do Eu Sou que existe em você antes de qualquer adjetivo.\nNeville dizia: o nome de Deus não é uma palavra.\nÉ um estado de consciência que você habita\ntoda vez que pensa eu sou...",
   "prompt":"Dark sacred illustration. Ancient stone tablets with Hebrew letters glowing gold: Ehyeh Asher Ehyeh. Below the letters, the same sound wave structure visualized — showing how the I AM resonates as frequency. A burning bush illuminates the scene. The Hebrew letters dissolve at the edges into pure consciousness light. Ancient and quantum simultaneously. Deep black, gold and fire. No text. Square format."},
  {"num":"05","layout":"fullbleed",
   "title":"TUDO QUE VEM DEPOIS DO EU SOU\nVOCÊ ESTÁ CRIANDO",
   "body":"Eu sou cansado. Eu sou pobre. Eu sou difícil de amar.\nCada completamento do I AM é uma instrução para o campo de consciência.\nNão como metáfora. Como mecanismo.\nO que você afirma após o eu sou\ndefine o que o campo organiza ao redor de você.",
   "prompt":"Dark powerful illustration. A human figure at center radiating golden light from their core. Around them, dark thought-form shapes are being magnetized toward them — each one labeled with a limiting I AM statement (poverty, unworthiness, scarcity) shown as dark energetic tendrils. The field responding to what is declared. Quantum field visualization. Deep black background, gold center, dark manifestations orbiting. No text. Portrait 4:5."},
  {"num":"06","layout":"card",
   "title":"VOCÊ JÁ SE PEGOU COMPLETANDO\nO EU SOU DE FORMAS QUE NÃO QUER",
   "body":"Eu sou do tipo que nunca tem dinheiro.\nEu sou aquela que sempre se magoa.\nEu sou assim mesmo.\nEsses não são pensamentos aleatórios.\nSão o criador dentro de você operando sem instrução consciente,\ncriando pelo padrão antigo porque ninguém explicou o mecanismo.",
   "prompt":"Dark mirror illustration. A person stands before a cracked dark mirror. Their reflection does not show their face — it shows the unconscious I AM statements they have been broadcasting, rendered as dark energy patterns swirling around the reflected figure. The person is beginning to recognize the reflection for what it is. Moment of awakening, not despair. Deep black, dark mirror with recognition dawning. No text. Square format."},
  {"num":"07","layout":"fullbleed",
   "title":"O QUE MUDA QUANDO VOCÊ COMEÇA\nA HABITAR O EU SOU COM CONSCIÊNCIA",
   "body":"Neville ensinava um estado específico antes de dormir:\nassumia como real o que queria manifestar.\nNão visualizar de fora, mas sentir de dentro como se já fosse.\nA neurociência chama isso de estado theta,\na janela em que o subconsciente aceita novas instruções sem filtro.\nA tecnologia sonora abre essa janela em minutos.",
   "prompt":"Dark transformation illustration. A person lying in theta state — golden 4-8Hz brain waves visible, eyes closed in deep relaxation. From their consciousness, the desired reality crystallizes around them as living golden light — not visualized from outside, but felt from within and expanding outward. The subconscious mind shown as deep ocean accepting new instructions. Deep black, warm golden theta light. No text. Portrait 4:5."},
  {"num":"08","layout":"fullbleed",
   "title":"O CRIADOR NÃO ESTÁ NO CÉU.\nESTÁ NO ESTADO QUE VOCÊ\nHABITA AGORA.",
   "body":"Cada vez que você completa o I AM com consciência,\nvocê assume o papel que sempre foi seu.\nComente FONTE se você já sentiu que o poder de criar a sua realidade\nestá dentro de você e nunca soube como acessá-lo de verdade.\nO acesso está no link da bio.",
   "prompt":"Dark epic cinematic illustration. A human figure standing at the center of creation — galaxies forming around them as they speak, reality crystallizing from their consciousness outward. They are the source, not the recipient. The creator within, not the worshipper without. The cosmos responds to their presence. Deep black space, brilliant golden creative force emanating from the human figure at center. Breathtaking scale and power. No text. Portrait 4:5."},
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
        draw.text((x, y), line, font=font, fill=color)
        y += int(lh)
    return y

def text_h(draw, text, font, ls=1.2):
    bb = draw.textbbox((0,0), "Ag", font=font)
    return int(len(text.split("\n")) * (bb[3]-bb[1]) * ls)

def gradient(img, ratio=0.32, amax=218):
    ov = Image.new("RGBA", img.size, (0,0,0,0))
    d = ImageDraw.Draw(ov)
    w, h = img.size
    sy = int(h * ratio)
    for y in range(sy, h):
        a = int(amax * ((y-sy)/(h-sy))**0.7)
        d.line([(0,y),(w,y)], fill=(0,0,0,a))
    return Image.alpha_composite(img.convert("RGBA"), ov)

def compose(img_bytes, s):
    WHITE=(255,255,255,255); DIM=(200,200,200,200); BODY=(220,220,220,255)
    mark = "Afonteoculta"
    if s["layout"] == "fullbleed":
        bg = Image.open(BytesIO(img_bytes)).convert("RGBA").resize((W,H), Image.LANCZOS)
        bg = gradient(bg)
        draw = ImageDraw.Draw(bg)
        fm=load_font(F_MARK,30); ft=load_font(F_TITLE,56); fb=load_font(F_BODY,29)
        draw.text((48,48), mark, font=fm, fill=DIM)
        bm=draw.textbbox((0,0),mark,font=fm)
        draw.text((W-48-(bm[2]-bm[0]),48), mark, font=fm, fill=DIM)
        th=text_h(draw,s["title"],ft,1.15); bh=text_h(draw,s["body"],fb,1.4)
        y=H-th-bh-30-90
        y=draw_centered(draw,s["title"],y,ft,WHITE,W,1.15)
        y+=30
        draw_centered(draw,s["body"],y,fb,BODY,W,1.4)
        return bg.convert("RGB")
    else:
        canvas=Image.new("RGBA",(W,H),(10,10,15,255))
        draw=ImageDraw.Draw(canvas)
        fm=load_font(F_MARK,30); ft=load_font(F_TITLE,50); fb=load_font(F_BODY,27)
        draw.text((48,48),mark,font=fm,fill=(160,160,160,200))
        bm=draw.textbbox((0,0),mark,font=fm)
        draw.text((W-48-(bm[2]-bm[0]),48),mark,font=fm,fill=(160,160,160,200))
        cw,ch,cx,cy=940,560,(W-940)//2,130
        card=Image.open(BytesIO(img_bytes)).convert("RGBA").resize((cw,ch),Image.LANCZOS)
        mask=Image.new("L",(cw,ch),0)
        ImageDraw.Draw(mask).rounded_rectangle([0,0,cw,ch],radius=16,fill=255)
        card.putalpha(mask)
        draw.rounded_rectangle([cx-2,cy-2,cx+cw+2,cy+ch+2],radius=18,outline=(180,140,60,160),width=2)
        canvas.paste(card,(cx,cy),card)
        ty=cy+ch+40
        th=text_h(draw,s["title"],ft,1.15); bh=text_h(draw,s["body"],fb,1.4)
        remaining=H-ty-55
        while th+24+bh>remaining and ft.size>32:
            ft=load_font(F_TITLE,ft.size-4); fb=load_font(F_BODY,fb.size-2)
            th=text_h(draw,s["title"],ft,1.15); bh=text_h(draw,s["body"],fb,1.4)
        y=ty
        y=draw_centered(draw,s["title"],y,ft,WHITE,W,1.15)
        y+=22
        draw_centered(draw,s["body"],y,fb,BODY,W,1.4)
        return canvas.convert("RGB")

def gen(prompt, retries=4):
    data=json.dumps({"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"responseModalities":["IMAGE"]}}).encode()
    for attempt in range(retries):
        if attempt: time.sleep(12*attempt)
        req=urllib.request.Request(ENDPOINT,data=data,headers={"x-goog-api-key":API_KEY,"Content-Type":"application/json"})
        try:
            with urllib.request.urlopen(req,timeout=120) as r:
                body=json.loads(r.read())
            parts=body.get("candidates",[{}])[0].get("content",{}).get("parts",[])
            ip=next((p for p in parts if p.get("inlineData",{}).get("mimeType","").startswith("image/")),None)
            if ip: return base64.b64decode(ip["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:150]}")
        except urllib.error.HTTPError as e: print(f"  HTTP {e.code}: {e.read().decode()[:120]}")
        except Exception as e: print(f"  Erro: {e}")
    return None

print("\nCarrossel — Neville Goddard | Score Revisor: 15/15")
print(f"Modelo: {MODEL}\nSaida: {OUT_DIR}\n")
ok=0
for i,s in enumerate(slides):
    print(f"[{s['num']}/08] {s['title'].splitlines()[0][:50]}...")
    img=gen(s["prompt"])
    if not img: print("  FALHOU\n"); continue
    final=compose(img,s)
    slug="".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
    out=OUT_DIR/f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out),"JPEG",quality=95)
    print(f"  OK: {out.name}\n")
    ok+=1
    if i<len(slides)-1: time.sleep(3)
print(f"CONCLUIDO: {ok}/8 | {OUT_DIR}")
