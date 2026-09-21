#!/usr/bin/env python3

import os

from dotenv import load_dotenv

load_dotenv()
os.environ["PYTHONIOENCODING"] = "utf-8"
"""
Carrossel - O Deus Que Te Ensinaram Nao Existe
Tema: DEUS | Ângulo 01 | Formato B — Demolição + Reconstrução
Curva: ⚡↘️↘️↗️↗️↘️⬆️⬆️⬆️🚪
gemini-2.0-flash-preview-image-generation + compose_util.py
"""
import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

import base64
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

from core.util.compose_util import compose

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-deus-01")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Visual Style Guide — Fonte Oculta ────────────────────────────────────────
PREFIX = (
    "Dark cinematic mystical illustration, ultra-detailed, single focal point, "
    "minimalist composition, deep black background. "
)
SUFFIX = (
    " No text, no words, no letters visible anywhere in the image. "
    "Photorealistic dark digital art style. No watermarks. Portrait ratio 4:5."
)

def p(prompt): return PREFIX + prompt.strip().rstrip(".") + "." + SUFFIX

# ── Slides — Copy + Prompts ──────────────────────────────────────────────────
slides = [

  # ── 01 ⚡ CHOQUE — Cover ──────────────────────────────────────────────────
  {
    "num": "01", "layout": "fullbleed",
    "title": (
      "O QUE A IGREJA CHAMA DE DEUS DISTANTE,\n"
      "A FÍSICA CHAMA DE CAMPO DO QUAL\n"
      "VOCÊ NUNCA SE SEPAROU"
    ),
    "body": (
      "E isso muda absolutamente tudo que te ensinaram\n"
      "sobre pecado, sobre merecimento\n"
      "e sobre por que você sente que Deus não te ouve..."
    ),
    "prompt": p(
      "Human silhouette standing with arms open wide, head tilted back in awe, "
      "golden divine light emanating from within the chest and heart area, "
      "expanding outward in luminous amber-gold waves and particles — "
      "the light source is INSIDE the human, not from above. "
      "The figure is rendered in black and white with the golden light as the only color. "
      "Sacred geometry mandala as subtle background texture in deep shadow. "
      "Dramatic cinematic composition, sense of infinite expansion radiating from a single human body"
    ),
  },

  # ── 02 🔥 CONFRONTO — Card ────────────────────────────────────────────────
  {
    "num": "02", "layout": "card",
    "title": (
      "MAS TE ENSINARAM QUE\n"
      "VOCÊ NASCEU EM FALTA"
    ),
    "body": (
      "Que existe uma distância entre você e o sagrado.\n"
      "Que você precisa se purificar para merecer proximidade com Deus.\n"
      "Que a Igreja tem a única ponte.\n"
      "Essa narrativa não saiu do texto original.\n"
      "Saiu da necessidade de ter alguém\n"
      "que precisasse do intermediário."
    ),
    "prompt": p(
      "Gothic cathedral interior viewed from ground level, "
      "overwhelming stone architecture pressing down from above, "
      "a single tiny dark human silhouette standing alone at the center of the nave, "
      "looking impossibly small against the massive vaulted ceiling. "
      "Cold distant light filtering through stained glass far above, "
      "atmosphere of imposed smallness and unworthiness. "
      "Black and white with faint colored light from distant windows. "
      "Sense of institutional weight and human diminishment"
    ),
  },

  # ── 03 🔥 CONFRONTO — Fullbleed ──────────────────────────────────────────
  {
    "num": "03", "layout": "fullbleed",
    "title": (
      "TE ENSINARAM A TEMER\n"
      "UM DEUS QUE TE AMA"
    ),
    "body": (
      "A pedir perdão por existir.\n"
      "A se sentir pequeno diante do que te criou.\n"
      "Mas qual pai cria um filho para passar\n"
      "a vida inteira pedindo permissão para existir?"
    ),
    "prompt": p(
      "Classical marble statue of a human figure in permanent supplication — "
      "kneeling, head deeply bowed, hands clasped tightly, frozen in submission. "
      "Fine engraving etching style, sepia and dark tones. "
      "The statue is cracked and worn, ancient, cold. "
      "Dramatic side lighting casting deep shadows. "
      "Same aesthetic as classical religious artwork repurposed to reveal its oppressive nature. "
      "Heavy dark atmosphere, stone texture, no warmth"
    ),
  },

  # ── 04 💡 REVELAÇÃO — Card ────────────────────────────────────────────────
  {
    "num": "04", "layout": "card",
    "title": (
      "EM 1944, O PAI DA FÍSICA QUÂNTICA\n"
      "CHEGOU A UMA CONCLUSÃO"
    ),
    "body": (
      "Max Planck afirmou: existe uma mente inteligente\n"
      "que é a matriz de toda a matéria.\n"
      "Não como hipótese. Como conclusão da física experimental.\n"
      "O que João 1:1 chama de Verbo,\n"
      "a física chama de campo.\n"
      "Duas linguagens. A mesma realidade."
    ),
    "prompt": p(
      "Abstract quantum field visualization — "
      "wave and particle duality rendered as luminous golden and electric blue patterns "
      "on deep black background. "
      "Mathematical wave equations dissolving into sacred geometry patterns, "
      "particles of light forming toroidal field shapes. "
      "Scientific and mystical simultaneously — the boundary between physics and spirituality dissolving. "
      "No human figure — the field itself as protagonist. "
      "Ultra-detailed, crystalline clarity, gold and blue on absolute black"
    ),
  },

  # ── 05 💡 REVELAÇÃO — Fullbleed ──────────────────────────────────────────
  {
    "num": "05", "layout": "fullbleed",
    "title": (
      "'À IMAGEM E SEMELHANÇA'\n"
      "NÃO DESCREVE APARÊNCIA.\n"
      "DESCREVE FUNÇÃO CRIATIVA."
    ),
    "body": (
      "No hebraico original, Elohim é plural.\n"
      "É Deus como força criativa em ação contínua.\n"
      "Ser criado à sua imagem significa uma coisa:\n"
      "você foi criado para criar.\n"
      "A tradução que recebeu transformou o versículo\n"
      "mais empoderador da história no argumento da sua submissão."
    ),
    "prompt": p(
      "Close-up of human hands open wide, palms facing upward, "
      "golden light particles and sparks materializing from the palms and fingertips, "
      "rising upward as if creating something from nothing. "
      "Black and white hands with only the golden creation-light in color. "
      "Sacred geometry subtle pattern emerging in the background from the act of creation. "
      "Sense of raw creative power contained in human hands. "
      "Cinematic close-up composition, dramatic amber-gold light"
    ),
  },

  # ── 06 🔥 CONFRONTO — Card ───────────────────────────────────────────────
  {
    "num": "06", "layout": "card",
    "title": (
      "ESSA INFORMAÇÃO FOI RETIRADA\n"
      "DE CIRCULAÇÃO. NÃO POR ACIDENTE."
    ),
    "body": (
      "Um Deus do qual você não pode se separar\n"
      "não precisa de intermediário.\n"
      "Um Deus que vive dentro de você\n"
      "não precisa de templo pago.\n"
      "A separação não é teológica.\n"
      "É um produto."
    ),
    "prompt": p(
      "Ancient illuminated manuscript or sacred scroll being sealed behind "
      "heavy iron vault doors with massive chains and locks. "
      "Golden light leaks intensely through the cracks and edges of the sealed vault, "
      "desperate to escape containment. "
      "Outside the vault: darkness. Inside: ancient sacred knowledge glowing. "
      "Dramatic tension between imprisoned light and oppressive containment. "
      "Deep black, amber gold light, heavy metal textures"
    ),
  },

  # ── 07 🔓 DESBLOQUEIO — Fullbleed ────────────────────────────────────────
  {
    "num": "07", "layout": "fullbleed",
    "title": (
      "O CAMPO NÃO JULGA.\n"
      "NÃO PUNE. NÃO ABANDONA.\n"
      "ELE RESPONDE."
    ),
    "body": (
      "Ao seu estado. À sua frequência.\n"
      "É por isso que Jesus disse 'a tua fé te curou' —\n"
      "e não 'meu poder te curou'.\n"
      "Ele sempre apontou para a sua capacidade.\n"
      "Nunca para a dependência de você."
    ),
    "prompt": p(
      "Human figure standing at the center of a vast cosmic dark space, "
      "golden electromagnetic waves and rings expanding outward from the figure "
      "in perfect concentric circles through infinite space — "
      "the field responding to the human presence. "
      "Toroidal energy field pattern visible around the figure. "
      "The person is the source, not the receiver. "
      "Stars and cosmos in the background. "
      "Scale is epic — tiny human generating infinite field. "
      "Deep black, luminous gold, sense of sovereign power"
    ),
  },

  # ── 08 🔓 DESBLOQUEIO — Card ─────────────────────────────────────────────
  {
    "num": "08", "layout": "card",
    "title": (
      "TRÊS LINGUAGENS.\n"
      "UMA TECNOLOGIA."
    ),
    "body": (
      "A neurociência chama de coerência cardíaca.\n"
      "A física chama de alinhamento de campo.\n"
      "Jesus chamou de fé.\n"
      "A oração que funciona não é a que mais repete palavras.\n"
      "É a que alinha o estado interno\n"
      "com o que está sendo pedido."
    ),
    "prompt": p(
      "Scientific visualization of the heart's electromagnetic toroidal field — "
      "golden luminous waves emanating from the center in a perfect torus shape, "
      "expanding outward in concentric golden rings. "
      "No human figure — the heart field itself as the protagonist. "
      "Looks simultaneously like a scientific diagram and sacred geometry. "
      "Deep black background, warm amber-gold electromagnetic waves, "
      "crystalline precision, sense of power and order"
    ),
  },

  # ── 09 🔓 DESBLOQUEIO Pico — Fullbleed ───────────────────────────────────
  {
    "num": "09", "layout": "fullbleed",
    "title": (
      "O DEUS QUE TE ENSINARAM\n"
      "PRECISAVA DE VOCÊ PEQUENO\n"
      "PARA EXISTIR."
    ),
    "body": (
      "O Deus que a física descreve\n"
      "só pode ser encontrado\n"
      "quando você para de se diminuir.\n"
      "Um te aprisiona. O outro te liberta."
    ),
    "prompt": p(
      "Powerful duality composition split vertically — "
      "LEFT HALF: dark, heavy, compressed atmosphere with downward pressure, "
      "chains implied by shadow, crushing weight, cold grey tones, "
      "a small figure bent under invisible weight. "
      "RIGHT HALF: expansive, luminous, infinite golden space, "
      "the same figure now upright with arms open, golden light radiating. "
      "The dividing line between the two halves is sharp and dramatic. "
      "The transformation is visible — same person, completely different reality. "
      "Black and grey versus gold and light"
    ),
  },

  # ── 10 🚪 PORTAL — Fullbleed ─────────────────────────────────────────────
  {
    "num": "10", "layout": "fullbleed",
    "title": (
      "A SEPARAÇÃO QUE TE ENSINARAM\n"
      "NÃO É REAL NA FÍSICA.\n"
      "SÓ É REAL NA CRENÇA."
    ),
    "body": (
      "E crenças podem ser reescritas.\n"
      "Comente FONTE se você já sentiu a presença de Deus\n"
      "mas nunca se sentiu em paz\n"
      "com o Deus que te ensinaram.\n"
      "Vou te mandar o que os textos originais revelam."
    ),
    "prompt": p(
      "Ancient stone archway portal standing alone in infinite dark cosmic space, "
      "intense warm golden amber light pouring through the arch from the other side — "
      "the light is overwhelming, sacred, inviting. "
      "Sacred geometry patterns carved into the arch stones, glowing faintly. "
      "A single human silhouette seen from behind, standing small but upright "
      "at the threshold, on the verge of stepping through. "
      "The figure is at peace, not afraid. "
      "Deep black space around, the portal as the only light source. "
      "Sense of eternal invitation, not urgency"
    ),
  },

]

# ── API ────────────────────────────────────────────────────────────────────
def gen_image(prompt, retries=4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 12 * attempt
            print(f"  Aguardando {wait}s antes de tentar novamente...")
            time.sleep(wait)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = json.loads(r.read())
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            img_part = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if img_part:
                return base64.b64decode(img_part["inlineData"]["data"])
            print(f"  Sem imagem na resposta: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None

# ── Main ──────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("  Carrossel — O Deus Que Te Ensinaram Não Existe")
print("  Tema: DEUS | 10 slides | Formato B")
print(f"  Modelo: {MODEL}")
print(f"  Saída: {OUT_DIR}")
print("="*60 + "\n")

ok = 0
for i, s in enumerate(slides):
    num    = s["num"]
    layout = s["layout"]
    title  = s["title"]
    icon   = "[CHOQUE]" if num=="01" else "[CONFRONTO]" if num in ("02","03","06") else "[REVELACAO]" if num in ("04","05") else "[DESBLOQUEIO]" if num in ("07","08","09") else "[PORTAL]"
    print(f"[{num}/10] {icon} {layout.upper()} - {title.splitlines()[0][:45]}...")

    img_bytes = gen_image(s["prompt"])
    if not img_bytes:
        print(f"  FALHOU — slide {num} não gerado\n")
        continue

    final = compose(img_bytes, title, s["body"], layout)

    slug  = "".join(c if c.isalnum() else "-" for c in title.splitlines()[0].lower()).strip("-")[:38]
    fname = f"slide-{num}-{slug}.jpg"
    out   = OUT_DIR / fname
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1

    if i < len(slides) - 1:
        time.sleep(4)

print("="*60)
print(f"  CONCLUIDO: {ok}/10 slides")
print(f"  Pasta: {OUT_DIR}")
print("="*60 + "\n")

# ── Registro automatico no Dashboard ──────────────────────────────────────
from core.agentes.register_carousel import register

register(
    title         = "O que a Igreja chama de Deus distante, a fisica chama de campo do qual voce nunca se separou",
    theme         = "deus-campo-quantico",
    format        = "B",
    slides_dir    = str(OUT_DIR),
    caption       = (
        "A separacao que te ensinaram a sentir nao e real na fisica. "
        "So e real na crenca. E crencas podem ser reescritas. "
        "Comente FONTE se voce ja sentiu a presenca de Deus "
        "mas nunca se sentiu em paz com o Deus que te ensinaram. "
        "Vou te mandar o que os textos originais revelam."
    ),
    revisor_score = "15/15",
    notes         = (
        "Formato B (Demolicao + Reconstrucao). Tema DEUS — Angulo 01. "
        "10 slides. Mecanismo: Traducao Proibida + Violacao de Autoridade. "
        "Curva: CHOQUE > CONFRONTO > CONFRONTO > REVELACAO > REVELACAO "
        "> CONFRONTO > DESBLOQUEIO > DESBLOQUEIO > PICO > PORTAL. "
        "Arte gerada com gemini-2.0-flash-preview-image-generation (Nano Banana 2)."
    ),
)
