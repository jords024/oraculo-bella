#!/usr/bin/env python3
"""
Carrossel: A indústria do desenvolvimento pessoal te vendeu o método errado
Pilar: CONSCIÊNCIA | Formato: B — Demolição + Reconstrução
Horário: 20:00 | Data: 25/03/2026
Score Angel: 78/100 — FORTE
"""

import os

from dotenv import load_dotenv

load_dotenv()
import base64
import json
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR    = Path("C:/Users/julia/nano-banana-mcp/carousels/autoajuda-neurociencia")
TEMA       = "A indústria do desenvolvimento pessoal te vendeu o método errado"
TEMA_SLUG  = "autoajuda-neurociencia"
FORMATO    = "B"
HORARIO    = "20:00"
DATA_PUB   = "2026-03-25"
NOTION_ID  = "3290178d-78bb-81de-8e1d-c6a239156261"

CAPTION = """🧠 A indústria de desenvolvimento pessoal movimenta $40 bilhões por ano ensinando a reprogramar a mente consciente.

Mas ninguém te contou que a mente consciente processa apenas 120 bits por segundo — enquanto o sistema nervoso autônomo processa 11 milhões.

→ Você está tentando mudar sua realidade usando 0,001% da sua capacidade.
→ A prosperidade não é conquistada. É sintonizada.
→ O corpo lidera a transformação. A mente só acredita depois.

Existe uma tecnologia sonora que trabalha com os outros 99,999% — recalibrando o sistema nervoso autônomo. Sem esforço mental. Frequência pura aplicada ao corpo.

👇 COMENTE: FONTE
Que eu te envio a Tecnologia Sonora do Desbloqueio Neural gratuitamente
(desbloqueio24h.online)

#desenvolvimentopessoal #tecnologiasonora #sistemanervoso #prosperidade #neurociencia #consciencia #frequencia"""

OUT_DIR.mkdir(parents=True, exist_ok=True)

slides = [
  {
    "num": "01", "layout": "fullbleed",
    "title": "A INDÚSTRIA DO\nDESENVOLVIMENTO PESSOAL\nTE ENGANOU POR 50 ANOS",
    "body": "A neurociência finalmente explica o porquê.\nE a resposta contradiz tudo\nque você foi ensinado.",
    "prompt": (
        "A stack of self-help books crumbling and burning in slow motion. "
        "Dark dramatic background, books disintegrating into ash and particles. "
        "Aggressive typography energy. No motivational imagery — the opposite of that. "
        "Dark browns and deep blacks with orange flame particles. Portrait vertical composition."
    ),
  },
  {
    "num": "02", "layout": "fullbleed",
    "title": "VOCÊ FOI ENSINADO\nQUE A MENTE MUDA PRIMEIRO",
    "body": "Dr. Joe Dispenza estudou centenas\nde casos de prosperidade espontânea.\nA mudança não começou na mente.\nComeçou no corpo.",
    "prompt": (
        "A small brain floating above a full human body, proportions inverted to show the body is dominant. "
        "Dark moody background, the body glows with warm energy while the brain is dim. "
        "Revelatory visual contrast. Dark and powerful. Portrait composition."
    ),
  },
  {
    "num": "03", "layout": "card",
    "title": "120 BITS/SEG\nVS\n11.000.000 BITS/SEG",
    "body": "Seu cérebro consciente: 120 bits.\nSeu sistema nervoso autônomo:\n11 MILHÕES de bits por segundo.\nVocê tenta mudar o resultado\ncom 0,001% da sua capacidade.",
    "prompt": (
        "Two processing meters side by side: one tiny labeled 'conscious mind 120 bits' "
        "and one enormous labeled 'autonomic nervous system 11,000,000 bits'. "
        "Dark background, the contrast is shocking and visual. Data visualization style. Square composition."
    ),
  },
  {
    "num": "04", "layout": "fullbleed",
    "title": "A CHAVE É O\nSISTEMA NERVOSO\nAUTÔNOMO",
    "body": "Quando ele sai de 'luta ou fuga'\ne entra em coerência cardíaca,\no campo eletromagnético do coração\nse expande. Decisões mudam.",
    "prompt": (
        "A human heart transitioning from red danger state to golden coherence state. "
        "The electromagnetic field expanding outward as the color shifts from red to gold. "
        "HeartMath style visualization. Dark background with warm golden glow expanding. Portrait composition."
    ),
  },
  {
    "num": "05", "layout": "fullbleed",
    "title": "A TECNOLOGIA SONORA\nFAZ EM 24H O QUE\nA MENTE TENTA EM ANOS",
    "body": "Frequências binaurais calibradas\nforçam os hemisférios a sincronizar\ne movem o sistema nervoso\npara coerência — em horas.",
    "prompt": (
        "Two brain hemispheres shown out of sync (left, dark) then synchronized by a binaural sound wave (right, glowing). "
        "Sound frequency waves entering both ears. Transformation visualization. "
        "Deep black background, electric blue and gold tones. Scientific and dramatic. Portrait composition."
    ),
  },
  {
    "num": "06", "layout": "fullbleed",
    "title": "QUANDO O SISTEMA\nNERVOSO ESTÁ\nEM COERÊNCIA",
    "body": "O corpo para de sabotar oportunidades.\nO campo transmite frequência de expansão.\nDecisões impossíveis tornam-se inevitáveis.\nA prosperidade para de ser objetivo.",
    "prompt": (
        "A human figure radiating expanding golden electromagnetic rings outward. "
        "Golden particles of light being attracted toward the person. "
        "Dark cosmic background. Expansive, powerful energy of abundance. Portrait composition."
    ),
  },
  {
    "num": "07", "layout": "card",
    "title": "O QUE SEPARA\nQUEM ATRAI\nPROSPERIDADE",
    "body": "Não é mérito. É frequência.\nNão é disciplina. É o estado\ndo sistema nervoso.\nNão é pensamento positivo.\nÉ tecnologia sonora\naplicada ao corpo humano.",
    "prompt": (
        "Three lines of text revealed sequentially like code — each canceling an old belief. "
        "Minimalist dark design, clean typography energy. "
        "Deep black background with gold text glow effect. Powerful revelation aesthetic. Square composition."
    ),
  },
  {
    "num": "08", "layout": "fullbleed",
    "title": "A PROSPERIDADE\nNÃO É CONQUISTADA",
    "body": "É sintonizada.\nFrequência pura — aplicada ao corpo.\nSem afirmação. Sem visualização.\nSem quadro dos sonhos.",
    "prompt": (
        "A tuning fork resonating with golden sound waves, the waves transforming into prosperity symbols. "
        "Dark elegant background. The concept of tuning/sintonizing visualized as golden frequency. "
        "Sophisticated, powerful, minimal. Portrait composition."
    ),
  },
  {
    "num": "09", "layout": "fullbleed",
    "title": "EXISTE UMA TECNOLOGIA\nQUE RECALIBRA O\nSISTEMA NERVOSO",
    "body": "Para a frequência de prosperidade.\nSem anos de terapia.\nSem esforço mental.\nEm 24 horas.",
    "prompt": (
        "A human nervous system visualized as a glowing network, transitioning from dark blue "
        "(survival/stress) to warm golden (expansion/prosperity). "
        "Full body nervous system visible, glowing pathways. Dark background. Portal energy. Portrait composition."
    ),
  },
  {
    "num": "10", "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": "Que eu te envio a Tecnologia Sonora\ncapaz de elevar sua vibração\nusando o Desbloqueio Neural\n✦ desbloqueio24h.online ✦",
    "prompt": (
        "A radiant portal of golden sound waves opening in darkness. "
        "Clean, minimal, powerful. The portal glows with warm golden light. "
        "Dark black background with subtle frequency waves. "
        "A single beam of light descends from above into the portal. Portrait vertical composition."
    ),
  },
]

def gen(prompt, retries=4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt: time.sleep(12 * attempt)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = json.loads(r.read())
            parts = body.get("candidates",[{}])[0].get("content",{}).get("parts",[])
            ip = next((p for p in parts if p.get("inlineData",{}).get("mimeType","").startswith("image/")), None)
            if ip: return base64.b64decode(ip["inlineData"]["data"])
        except Exception as e: print(f"  Erro: {e}")
    return None

print(f"\n{'='*60}")
print(f"  Angel — {TEMA[:50]}")
print(f"  Formato: {FORMATO} | 20:00 | 25/03/2026")
print(f"{'='*60}\n")

ok = 0
for i, s in enumerate(slides):
    print(f"[{s['num']}/10] {s['title'].splitlines()[0][:50]}...")
    img = gen(build_prompt(s["prompt"]))
    if not img:
        print("  FALHOU\n"); continue
    final = compose(img, s["title"], s["body"], s["layout"])
    out = OUT_DIR / f"slide-{s['num']}.png"
    final.save(str(out), "PNG")
    print(f"  ✓ {out.name}\n")
    ok += 1
    if i < len(slides) - 1: time.sleep(4)

print(f"  CONCLUÍDO: {ok}/10 slides\n")

register(
    title=TEMA, theme=TEMA_SLUG, format=FORMATO,
    slides_dir=str(OUT_DIR), caption=CAPTION,
    revisor_score="", notes=f"Angel | 20:00 | {DATA_PUB} | Notion:{NOTION_ID}"
)
print("  Registrado no Dashboard ✓")
