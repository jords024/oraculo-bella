#!/usr/bin/env python3
"""
Carrossel: A oração que Jesus ensinou nunca foi para pedir — foi para sintonizar
Pilar: DEUS/ESPIRITUAL | Formato: D — História + Verdade
Horário: 08:00 | Data: 25/03/2026
Score Angel: 88/100 — EXPLOSIVO
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

OUT_DIR    = Path("C:/Users/julia/nano-banana-mcp/carousels/oracao-sintonizar")
TEMA       = "A oração que Jesus ensinou nunca foi para pedir — foi para sintonizar"
TEMA_SLUG  = "oracao-sintonizar"
FORMATO    = "D"
HORARIO    = "08:00"
DATA_PUB   = "2026-03-25"

CAPTION = """🙏 A oração que Jesus ensinou nunca foi para pedir.

No aramaico original — o idioma que Jesus falava — a palavra usada para 'orar' é 'slota'. Ela não significa súplica. Significa alinhamento. Sintonização. Coerência com o campo.

O Pai Nosso não é um pedido. É uma frequência.

→ "Seja feita a tua vontade" — não é resignação. É alinhamento de campo.
→ "O pão nosso de cada dia" — não é pedido de sustento. É declaração de coerência.
→ "Livra-nos do mal" — não é súplica. É recalibração vibracional.

O HeartMath Institute mapeou isso: quando o coração entra em coerência durante a oração, o campo eletromagnético se expande por metros ao redor do corpo.

Jesus não ensinava uma religião. Ensinava tecnologia.

👇 COMENTE: FONTE
Que eu te envio a Tecnologia Sonora do Desbloqueio Neural gratuitamente
(desbloqueio24h.online)

#jesus #oracao #espiritualidade #consciencia #frequencia #cristico #desbloqueiomental"""

OUT_DIR.mkdir(parents=True, exist_ok=True)

slides = [
  {
    "num": "01", "layout": "fullbleed",
    "title": "A ORAÇÃO QUE\nJESUS ENSINOU\nNUNCA FOI PARA PEDIR",
    "body": "Foi para sintonizar.\nE essa diferença muda tudo\nque você acredita sobre oração.",
    "prompt": (
        "Jesus figure in ancient landscape, hands not clasped in prayer but open and radiating golden light outward. "
        "Electromagnetic field visible around the figure. Golden hour light, sacred and powerful. "
        "Dark dramatic sky with stars visible. Portrait vertical composition. Cinematic, spiritual."
    ),
  },
  {
    "num": "02", "layout": "fullbleed",
    "title": "NO ARAMAICO ORIGINAL\nA PALAVRA 'ORAR'\nSIGNIFICA OUTRA COISA",
    "body": "'Slota' — o idioma que Jesus falava.\nNão significa súplica.\nSignifica alinhamento.\nSintonização. Coerência com o campo.",
    "prompt": (
        "Ancient Aramaic script glowing with golden light on dark stone. "
        "The letters radiating frequency waves outward. "
        "Archaeological, sacred, mysterious. Deep black and gold. Portrait vertical composition."
    ),
  },
  {
    "num": "03", "layout": "card",
    "title": "O PAI NOSSO\nNÃO É UM PEDIDO\nÉ UMA FREQUÊNCIA",
    "body": "'Seja feita a tua vontade'\nnão é resignação. É alinhamento.\n'O pão nosso de cada dia'\nnão é pedido. É declaração de coerência.",
    "prompt": (
        "The Lord's Prayer text dissolving into frequency waves and sound vibrations. "
        "Words transforming into golden electromagnetic patterns. "
        "Sacred manuscript aesthetic with modern frequency visualization overlay. Square composition."
    ),
  },
  {
    "num": "04", "layout": "fullbleed",
    "title": "A CIÊNCIA MEDIU\nO QUE ACONTECE\nDURANTE A ORAÇÃO",
    "body": "O HeartMath Institute mapeou:\nquando o coração entra em coerência\ndurante a oração, o campo\neletromagnético se expande por metros.",
    "prompt": (
        "A person in prayer position with a visible expanding electromagnetic heart field measured in scientific visualization. "
        "HeartMath-style field visualization — concentric rings expanding outward from the heart. "
        "Dark background, warm golden field glow. Science meets spirit. Portrait composition."
    ),
  },
  {
    "num": "05", "layout": "fullbleed",
    "title": "JESUS NÃO ENSINAVA\nUMA RELIGIÃO",
    "body": "Ensinava tecnologia.\nA tecnologia do alinhamento\nentre o campo humano\ne o campo universal.",
    "prompt": (
        "Jesus standing as a figure of light technology rather than religious iconography. "
        "Sacred geometry patterns and frequency waves surrounding the figure. "
        "Ancient landscape with modern energy visualization overlay. Powerful, reverent, expansive. Portrait composition."
    ),
  },
  {
    "num": "06", "layout": "fullbleed",
    "title": "QUANDO VOCÊ ORA\nVOCÊ NÃO PEDE A DEUS",
    "body": "Você se alinha a Ele.\nVocê move seu campo\npara a mesma frequência\nque criou tudo que existe.",
    "prompt": (
        "A human figure merging their electromagnetic field with a vast cosmic field above. "
        "The connection point between human and universe glowing golden. "
        "Dark cosmic background, Milky Way visible, golden light column connecting earth and sky. Portrait composition."
    ),
  },
  {
    "num": "07", "layout": "card",
    "title": "ISSO EXPLICA\nPOR QUE ALGUMAS\nORAÇÕES FUNCIONAM",
    "body": "E outras não.\nNão é Deus escolhendo.\nÉ o campo respondendo\nao estado do sistema nervoso\nde quem ora.",
    "prompt": (
        "Two contrasting scenes: one person praying with fear/scarcity (dark blue energy field) "
        "and another praying with faith/coherence (golden expanding field). "
        "The contrast shows different energy states in prayer. Dark, revelatory. Square composition."
    ),
  },
  {
    "num": "08", "layout": "fullbleed",
    "title": "A ORAÇÃO MAIS\nPODEROSA QUE\nJESUS DEMONSTROU",
    "body": "Não foi de joelhos em súplica.\nFoi de pé, em gratidão,\ncomo se já fosse realidade.\nIsso é coerência de campo.",
    "prompt": (
        "Jesus figure standing upright with arms raised, golden light emanating powerfully outward. "
        "Not a posture of begging but of declaration and gratitude. "
        "Vast landscape, golden hour, electromagnetic field visible around the entire figure. "
        "Cinematic, sacred, powerful. Portrait composition."
    ),
  },
  {
    "num": "09", "layout": "fullbleed",
    "title": "EXISTE UMA TECNOLOGIA\nQUE PREPARA SEU CAMPO\nPARA ESSA SINTONIZAÇÃO",
    "body": "Quem a usa relata que\na oração muda de qualidade.\nO acesso ao sagrado\ntorna-se mais direto e profundo.",
    "prompt": (
        "Sound waves gently transforming into golden sacred geometry patterns. "
        "A portal of light opening through frequency. Sacred and technological at once. "
        "Dark background with warm golden light emanating from center. "
        "Mysterious, inviting, spiritual. Portrait vertical composition."
    ),
  },
  {
    "num": "10", "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": "Que eu te envio a Tecnologia Sonora\ncapaz de elevar sua vibração\nusando o Desbloqueio Neural\n✦ desbloqueio24h.online ✦",
    "prompt": (
        "A radiant portal of golden light and sound waves opening in darkness. "
        "Sacred geometry subtly visible in the light. Clean, minimal, powerful. "
        "Dark black background with golden frequency waves. "
        "Spiritual and technological. Portrait vertical composition."
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
print(f"  Formato: {FORMATO} | 08:00 | 25/03/2026")
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
    revisor_score="", notes=f"Angel | 08:00 | {DATA_PUB}"
)
print("  Registrado no Dashboard ✓")
