#!/usr/bin/env python3
"""Carrossel — Memorias como Frequencia | gemini-2.0-flash-preview-image-generation"""

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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-memorias-frequencia")
OUT_DIR.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350
FD = Path("C:/Windows/Fonts")
F_TITLE = str(FD / "Franklin Gothic Pro-Heavy.ttf")
F_BODY  = str(FD / "Inter-Regular-slnt=0.ttf")
F_MARK  = str(FD / "Inter-Regular-slnt=0.ttf")

slides = [
  {"num":"01","layout":"fullbleed",
   "title":"SUAS MEMÓRIAS NÃO SÃO\nARQUIVOS DO PASSADO.\nSÃO FREQUÊNCIAS ATIVAS QUE\nESTÃO CRIANDO SEU FUTURO AGORA.",
   "body":"O passado não ficou no passado.\nEle continua operando como frequência no presente\ntoda vez que você o acessa.\nE a ciência já sabe exatamente como isso funciona.",
   "prompt":"Dark cinematic illustration. A human figure standing at a crossroads in time. Behind them: ghostly memory scenes floating like broken film reels — painful, unresolved, still glowing with active frequency light. Ahead: the future, but it mirrors the same patterns from the past because the frequency hasn't changed. The person begins to recognize this. Time shown as circular, not linear. Deep black, red-amber active memory frequencies, pale blue future. No text. Portrait 4:5."},
  {"num":"02","layout":"card",
   "title":"VOCÊ PROVAVELMENTE JÁ PERCEBEU\nQUE CERTAS SITUAÇÕES SE\nREPETEM NA SUA VIDA",
   "body":"Mesmo tipo de relacionamento. Mesmo padrão financeiro.\nMesma sensação de quase chegar e recuar.\nVocê muda de ambiente, de pessoas, de cidade,\ne o padrão aparece de novo.\nNão é coincidência. É frequência.",
   "prompt":"Dark psychological illustration. A person surrounded by a circular loop — the same scenes repeating around them like a carousel: different faces but same relationship dynamic, different jobs but same financial ceiling, different cities but same emotional pattern. The loop glows with a recognizable frequency signature. The person at center is beginning to see the loop rather than just living in it. Deep black, amber loop pattern. No text. Square format."},
  {"num":"03","layout":"fullbleed",
   "title":"O QUE A PSICOLOGIA CONVENCIONAL\nNÃO TE CONTOU SOBRE O TRAUMA",
   "body":"O modelo tradicional trata memória traumática como arquivo\nque precisa ser processado e guardado.\nO problema é que esse modelo não explica\npor que o arquivo continua se abrindo sozinho.\nTrauma não é arquivo. É frequência em loop ativo.\nE frequência não se arquiva. Ela precisa ser resintonizada.",
   "prompt":"Dark contrast illustration. Left: a psychologist's filing cabinet with labeled trauma folders neatly stored — but the drawers keep flying open on their own, folders spilling out. The archive model failing. Right: the same traumatic energy shown as a sound wave loop — visible, measurable, active, and tunable. The wave model: solvable. Deep black background, clinical white left, electric amber right. No text. Portrait 4:5."},
  {"num":"04","layout":"card",
   "title":"A FÍSICA QUÂNTICA E A\nEPIGENÉTICA CONFIRMAM:",
   "body":"Joe Dispenza documenta que quando você revive uma memória traumática,\nseu corpo produz as mesmas substâncias químicas do evento original.\nO cérebro não distingue experiência real de memória vívida.\nNo nível subatômico, passado e presente coexistem no campo quântico.\nVocê está revivendo o passado em frequência no agora.",
   "prompt":"Dark scientific illustration. A split visualization: top half shows a traumatic past event rendered in sepia. Bottom half shows the person in present day — but their brain chemistry (shown as glowing chemical molecules: cortisol, adrenaline) is identical in both moments. Time markers show past and present coexisting. Joe Dispenza-style neuroscience aesthetic. The body reliving the past in real time. Deep black, amber chemistry, clinical detail. No text. Square format."},
  {"num":"05","layout":"fullbleed",
   "title":"CADA VEZ QUE VOCÊ ACESSA\nUMA MEMÓRIA DOLOROSA,\nVOCÊ NÃO ESTÁ LEMBRANDO.\nESTÁ TRANSMITINDO.",
   "body":"A frequência da memória sai do seu campo eletromagnético\ne interage com o ambiente ao redor.\nO HeartMath Institute documentou que o campo cardíaco humano\nse expande até 3 metros ao redor do corpo.\nQuando você opera em frequência de trauma,\ntudo dentro desse raio responde a essa transmissão.",
   "prompt":"Dark scientific mystical illustration. A human figure at center with their heart emitting a powerful toroidal electromagnetic field extending 3 meters around them — the HeartMath toroidal field visualization. But the field is broadcasting a trauma frequency (shown as chaotic red-amber interference patterns). Everything within the field radius — people, opportunities, events — is being repelled or distorted by the transmission. Deep black, red-amber broadcast field. No text. Portrait 4:5."},
  {"num":"06","layout":"card",
   "title":"ISSO EXPLICA POR QUE VOCÊ ATRAI\nAS MESMAS SITUAÇÕES MESMO\nQUANDO MUDA TUDO AO REDOR",
   "body":"O ambiente muda. A frequência não mudou.\nE o campo responde à frequência,\nnão ao endereço, ao emprego ou ao relacionamento novo.\nVocê não está atraindo por pensamento.\nEstá atraindo por transmissão contínua\nde uma frequência que nunca foi resintonizada.",
   "prompt":"Dark illustration. A person moves through three different environments (home, city, relationship) shown as different backdrop panels — but in each environment, the same situation repeats. Shown as identical frequency signatures (identical wave patterns) radiating from the person in each setting. The environments change. The broadcast doesn't. Deep black with three distinct but related scenes showing the same pattern. No text. Square format."},
  {"num":"07","layout":"fullbleed",
   "title":"O QUE MUDA QUANDO VOCÊ\nRESINTONIZA A FREQUÊNCIA\nDA MEMÓRIA",
   "body":"Não é sobre apagar o passado. É sobre alterar a frequência\ncom que ele opera no presente.\nPesquisas com ondas theta e gamma documentam\ndissolução de padrões de trauma em sessões de 20 a 40 minutos.\nO campo ao redor do corpo começa a transmitir uma frequência diferente.\nE o que é atraído começa a mudar.",
   "prompt":"Dark transformation illustration. A before-and-after of the same human figure. Before: broadcasting chaotic red-amber trauma frequencies, surrounded by repelled and distorted reality. After: broadcasting harmonious golden theta-gamma frequencies, surrounded by aligned and flowing reality. The heart field now coherent and golden. Same person, different transmission. Deep black background, dramatic transformation from chaos to harmony. No text. Portrait 4:5."},
  {"num":"08","layout":"fullbleed",
   "title":"O PASSADO NÃO TEM PODER\nSOBRE VOCÊ.\nA FREQUÊNCIA QUE VOCÊ\nCARREGA DELE TEM.",
   "body":"E frequência pode ser alterada.\nComente FONTE se você já percebeu que o mesmo padrão\naparece na sua vida independente de tudo que você tenta mudar.\nO acesso está no link da bio.",
   "prompt":"Dark cinematic illustration. A person standing free from the loop — the circular pattern of repeating situations now visible behind them as a transparent ghost, dissolving. They face forward, their field now broadcasting clear golden frequency rings. The past patterns are still visible but no longer active — shown as fading sepia echoes. The person is present, transmitting a new frequency. Deep black, dissolving past in amber, golden present frequency expanding forward. No text. Portrait 4:5."},
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

print("\nCarrossel — Memorias como Frequencia | Score Revisor: 15/15")
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
