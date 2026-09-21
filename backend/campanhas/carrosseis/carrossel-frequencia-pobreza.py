#!/usr/bin/env python3
"""
Carrossel: Físicos provaram que a pobreza é uma frequência
Pilar: CIÊNCIA/DINHEIRO | Formato: A — Tese + Tradução
Horário: 13:00 | Data: 25/03/2026
Score Angel: 85/100 — EXPLOSIVO
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

OUT_DIR    = Path("C:/Users/julia/nano-banana-mcp/carousels/frequencia-pobreza")
TEMA       = "Físicos provaram que a pobreza é uma frequência"
TEMA_SLUG  = "frequencia-pobreza"
FORMATO    = "A"
HORARIO    = "13:00"
DATA_PUB   = "2026-03-25"
NOTION_ID  = "3290178d-78bb-81e8-ab45-ccc40137194f"

CAPTION = """⚛️ Físicos provaram que a pobreza é uma frequência — não uma condição.

O Nobel de Física de 2022 provou o entrelaçamento quântico.
O HeartMath Institute mapeou o campo eletromagnético do coração.
A epigenética confirmou: padrões de escassez são transmitidos geneticamente.

→ Você não atrai o que deseja. Você atrai o que irradia.
→ Sua frequência chega antes de você.
→ Você não tem um problema financeiro. Tem um problema de frequência herdada.

Isso não é espiritualidade sem base. É ciência que o sistema financeiro prefere que você não veja.

👇 COMENTE: FONTE
Que eu te envio a Tecnologia Sonora do Desbloqueio Neural gratuitamente
(desbloqueio24h.online)

#fisicaquantica #tecnologiasonora #prosperidade #frequencia #desbloqueiomental #consciencia #quantica #neurociencia"""

OUT_DIR.mkdir(parents=True, exist_ok=True)

slides = [
  {
    "num": "01", "layout": "fullbleed",
    "title": "FÍSICOS PROVARAM\nQUE A POBREZA\nÉ UMA FREQUÊNCIA",
    "body": "Não uma condição.\nE isso destrói tudo que\no sistema financeiro te ensinou.",
    "prompt": (
        "A quantum wave function visualization dissolving a dollar sign. "
        "Black background with electric blue electromagnetic waves radiating outward. "
        "The wave pattern transforms into golden energy particles. "
        "Dark, scientific, powerful. Portrait vertical composition."
    ),
  },
  {
    "num": "02", "layout": "fullbleed",
    "title": "VOCÊ NÃO ATRAI\nO QUE DESEJA",
    "body": "Você atrai o que irradia.\nSeu campo eletromagnético corporal\né o instrumento que o universo lê\n24 horas por dia.",
    "prompt": (
        "A human silhouette with visible electromagnetic field radiating outward in concentric rings. "
        "Dark navy background, glowing amber and electric blue energy waves. "
        "Scientific visualization style. Portrait vertical composition."
    ),
  },
  {
    "num": "03", "layout": "card",
    "title": "O NOBEL DE FÍSICA\nDE 2022 PROVOU ISSO",
    "body": "Partículas entrelaçadas se influenciam\nindependente da distância.\nSua frequência se conecta ao campo\nantes do seu esforço chegar lá.",
    "prompt": (
        "Two quantum particles connected by an entanglement beam, Nobel Prize medallion overlaid. "
        "Dark laboratory aesthetic, glowing connection lines between particles. "
        "Deep black and gold tones. Square composition."
    ),
  },
  {
    "num": "04", "layout": "fullbleed",
    "title": "MONGES TIBETANOS\nEM 40HZ — ONDAS GAMMA",
    "body": "Estado de criatividade máxima\ne manifestação. A neurociência mediu.\nA diferença entre criar riqueza\ne criar escassez não é disciplina.",
    "prompt": (
        "A Tibetan monk meditating with visible brainwave patterns (gamma 40Hz) radiating from the head. "
        "Split image: monk on left, neuroscience brain scan on right showing gamma waves highlighted. "
        "Dark moody, spiritual meets science. Portrait vertical composition."
    ),
  },
  {
    "num": "05", "layout": "fullbleed",
    "title": "SEUS PADRÕES\nDE ESCASSEZ VIVEM\nNO SEU DNA",
    "body": "Transmitidos por 3 gerações.\nEnquanto você segue planilhas,\nseu sistema nervoso transmite:\n'Dinheiro é difícil. Para mim nunca sobra.'",
    "prompt": (
        "A DNA double helix with dark energy patterns woven into the strands. "
        "Multiple translucent human figures above, representing generational inheritance. "
        "Deep blacks with dark red and amber undertones. Eerie, revelatory. Portrait composition."
    ),
  },
  {
    "num": "06", "layout": "fullbleed",
    "title": "A TECNOLOGIA SONORA\nQUE RECALIBRA\nEM HORAS",
    "body": "Não em anos de terapia.\nFrequências binaurais sincronizam\nos dois hemisférios e movem\no sistema nervoso para expansão.",
    "prompt": (
        "A human brain split in two hemispheres being synchronized by binaural sound waves. "
        "Sound waves visualized as golden light entering both ears simultaneously. "
        "Deep black background, gold and electric blue. Scientific and spiritual. Portrait composition."
    ),
  },
  {
    "num": "07", "layout": "card",
    "title": "QUANDO O SISTEMA\nNERVOSO ENTRA\nEM COERÊNCIA",
    "body": "→ O campo do coração se expande\n→ Decisões financeiras mudam\n→ Oportunidades invisíveis\n   tornam-se visíveis\n→ A frequência de prosperidade\n   começa a ser transmitida",
    "prompt": (
        "A human heart with an expanding electromagnetic field visualization. "
        "Golden concentric rings radiating outward from the heart center. "
        "Dark background, warm gold and amber glow. Powerful, expanding energy. Square composition."
    ),
  },
  {
    "num": "08", "layout": "fullbleed",
    "title": "NÃO É CRENÇA\nÉ FÍSICA APLICADA\nAO CORPO HUMANO",
    "body": "O campo quântico está esperando\nsua nova frequência.\nA prosperidade não é conquistada.\nÉ sintonizada.",
    "prompt": (
        "A human figure standing in a quantum field, body radiating golden electromagnetic energy. "
        "Particles of light being attracted toward the figure. "
        "Dark cosmic background, gold and white energy. Expansive, powerful. Portrait composition."
    ),
  },
  {
    "num": "09", "layout": "fullbleed",
    "title": "EXISTE UMA TECNOLOGIA\nQUE FAZ ISSO\nEM 24 HORAS",
    "body": "Quem a acessa relata mudanças\nno padrão de atração financeira\nque anos de esforço consciente\nnão conseguiram produzir.",
    "prompt": (
        "A sound wave transforming into golden particles flowing toward a human figure. "
        "Headphones with visible frequency patterns emanating outward. "
        "Dark background, transformation from blue (survival) to gold (expansion). "
        "Mysterious, powerful, portal-like. Portrait vertical composition."
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
print(f"  Angel — {TEMA}")
print(f"  Formato: {FORMATO} | 13:00 | 25/03/2026")
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
    revisor_score="", notes=f"Angel | 13:00 | {DATA_PUB} | Notion:{NOTION_ID}"
)
print("  Registrado no Dashboard ✓")
