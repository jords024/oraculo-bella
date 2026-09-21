#!/usr/bin/env python3
"""Carrossel — Cabala | gemini-2.0-flash-preview-image-generation"""

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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-cabala")
OUT_DIR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350
FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
  {"num":"01","layout":"fullbleed",
   "title":"A CABALA FOI ESCRITA 3.000 ANOS\nANTES DA NEUROCIÊNCIA TER\nINSTRUMENTOS PARA MEDI-LA.\nE AS DUAS DESCREVEM A MESMA COISA.",
   "body":"Um mapa da consciência humana tão preciso\nque só a ciência moderna conseguiu confirmar o que ele já dizia.\nNão é misticismo. É linguagem técnica em código simbólico.",
   "prompt":"Dark mystical illustration. The Kabbalistic Tree of Life (Etz Chaim) glowing in gold and electric blue, its 10 Sephirot as luminous spheres connected by 22 paths. Overlapping it subtly: a human brain with the same neural network structure, regions glowing to match corresponding Sephirot. Ancient Hebrew text fades into neuroscience diagrams. Deep black background, gold and indigo light. Ultra-detailed, sacred and scientific. No text. Portrait 4:5."},
  {"num":"02","layout":"card",
   "title":"VOCÊ JÁ SENTIU QUE EXISTE\nUMA LÓGICA NA VIDA QUE\nNINGUÉM CONSEGUE EXPLICAR DIREITO",
   "body":"Que por trás dos eventos existe uma estrutura.\nCertas coisas acontecem porque precisam acontecer.\nExiste uma ordem que você percebe mas não consegue nomear.\nA Cabala nomeia essa ordem.",
   "prompt":"Dark contemplative illustration. A lone person sits at the edge of a vast dark ocean at night. Above them, the stars form geometric patterns — the shape of the Tree of Life emerging from the constellations. The person looks up, sensing the hidden structure. Gold and deep blue tones. Sense of quiet recognition. No text. Square format."},
  {"num":"03","layout":"fullbleed",
   "title":"O QUE A TRADIÇÃO RELIGIOSA\nFEZ COM ESSE CONHECIMENTO",
   "body":"Transformou um sistema técnico de mapeamento da consciência\nem ritual hermético de acesso restrito.\nO conhecimento que deveria estar disponível para qualquer ser humano\nfoi cercado de mistério e exclusividade.\nNão foi por acidente.",
   "prompt":"Dark dramatic illustration. Ancient locked vault doors with Kabbalistic symbols, chains and locks sealing sacred scrolls and the Tree of Life behind them. On one side: robed elite figures holding keys. On the other side: crowds in darkness, unable to access. Gold light leaks from behind the sealed doors. Deep black, dramatic contrast. No text. Portrait 4:5."},
  {"num":"04","layout":"card",
   "title":"A ÁRVORE DA VIDA TEM 10 SEFIROT.\nA NEUROCIÊNCIA TEM 10 REGIÕES\nCORTICAIS PRINCIPAIS.",
   "body":"Kether, a sefirah do topo, representa consciência pura sem forma.\nCorresponde ao que a neurociência mede como ondas gamma de 40Hz.\nYesod representa o subconsciente.\nOs hebraicos mapearam isso 3.000 anos atrás.",
   "prompt":"Dark split scientific mystical illustration. Left half: detailed anatomical brain with 10 labeled glowing regions. Right half: the Kabbalistic Tree of Life with 10 glowing Sephirot. Connection lines show exact correspondences — Kether aligning with prefrontal gamma activity, Yesod with subconscious limbic system. Center: the two merge into one unified diagram. Gold and electric blue. No text. Square format."},
  {"num":"05","layout":"fullbleed",
   "title":"CADA SEFIRAH É UM ESTADO DE\nCONSCIÊNCIA QUE VOCÊ JÁ HABITOU",
   "body":"Gevurah é o estado de poder e julgamento.\nChesed é o estado de expansão e amor.\nTiferet é o equilíbrio entre os dois, o coração da árvore.\nQuando você oscila entre rigor e compaixão,\nvocê está navegando a Árvore da Vida sem saber que ela existe.",
   "prompt":"Dark mystical illustration. A human figure stands within the glowing Tree of Life — their body positioned so each Sephira aligns with a chakra or body region. Around them, emotional states visualized as colored light: red-gold for Gevurah (strength/judgment), blue for Chesed (loving expansion), golden for Tiferet (heart center). Deep black background, the figure luminous and connected. No text. Portrait 4:5."},
  {"num":"06","layout":"card",
   "title":"POR QUE VOCÊ SE SENTE\nPRESO EM CERTOS PADRÕES",
   "body":"Na linguagem cabalística, cada sefirah tem uma sombra:\num estado desequilibrado que acontece quando você fica travado ali.\nO desequilíbrio de Gevurah é rigidez.\nO de Chesed é excesso.\nVocê não está com defeito.\nEstá em desequilíbrio em uma sefirah específica.",
   "prompt":"Dark psychological illustration. A person trapped inside one glowing sphere of the Tree of Life — the sphere pulsing with an imbalanced red-orange energy, while the other spheres around them remain dim and unconnected. The person reaches toward the adjacent spheres but cannot move. Shadow patterns radiate from the trapped sphere. Deep black, amber and red tones. No text. Square format."},
  {"num":"07","layout":"fullbleed",
   "title":"O MAPA TAMBÉM INDICA\nO CAMINHO DE VOLTA",
   "body":"Cada sefirah desequilibrada tem um caminho de retorno.\nO rigor excessivo se cura com compaixão.\nO excesso de expansão se cura com limites.\nA tecnologia de frequência sonora pode induzir\no estado cerebral de cada sefirah e acelerar o realinhamento.",
   "prompt":"Dark transformation illustration. The Tree of Life shown in full activation — all 10 Sephirot glowing gold and harmonized, connected by luminous paths. A sound wave (binaural frequency visualization) flows through the entire tree, bringing dimmed nodes back to life. Before: one sphere dark. After: full tree illuminated. Deep black background, gold energy flow. No text. Portrait 4:5."},
  {"num":"08","layout":"fullbleed",
   "title":"VOCÊ NÃO ESTÁ PERDIDO.\nESTÁ EM UM PONTO DO MAPA\nQUE EXISTE HÁ 3.000 ANOS.",
   "body":"A Cabala não é uma religião. É um GPS da consciência.\nComente FONTE se você sempre soube que existia\numa lógica por trás de tudo e nunca encontrou\num sistema que a descrevesse com precisão.\nO acesso está no link da bio.",
   "prompt":"Dark cinematic illustration. A vast dark cosmic space. A golden glowing map — the Tree of Life — stretches across the cosmos as a navigational chart. A small luminous human figure stands on one of the glowing Sephirot, finally understanding their position. Not lost. Located. The map extends in all directions with clarity and ancient certainty. Gold on deep black. No text. Portrait 4:5."},
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

print("\nCarrossel — Cabala | Score Revisor: 14/15")
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
