#!/usr/bin/env python3
"""
carrossel-biblia-2350-vezes.py — A Bíblia Menciona Dinheiro 2.350 Vezes
Método Jordânico | Praça: MENTE | Formato B
Tema: A Bíblia fala de dinheiro mais que de fé — e te ensinaram o oposto
Modelo: OpenAI gpt-image-2
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

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

# ── CONFIGURACAO ───────────────────────────────────────────────────────────────
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MODEL      = "gpt-image-2"
ENDPOINT   = "https://api.openai.com/v1/images/generations"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-biblia-2350-vezes")
TEMA          = "A Bíblia Menciona Dinheiro 2.350 Vezes"
TEMA_SLUG     = "biblia-2350-vezes"
FORMATO       = "B"
CAPTION       = (
    "A Bíblia menciona dinheiro 2.350 vezes.\n\n"
    "Mais do que fé. Mais do que oração. Mais do que salvação.\n\n"
    "Em Deuteronômio 28, Deus lista o que significa estar na aliança com Ele: "
    "colheita abundante, rebanhos multiplicados, prosperidade.\n\n"
    "A maldição descrita no mesmo capítulo? Escassez. Dívida. Servidão.\n\n"
    "A Bíblia chama pobreza de maldição — não de virtude.\n\n"
    "E te ensinaram o oposto.\n\n"
    "Comente FONTE e eu te envio o protocolo que remove esse bloqueio espiritual.\n\n"
    "#biblia #dinheiro #prosperidade #fonteoculta #bloqueiofinanceiro "
    "#abundancia #fe #desbloqueiomental #consciencia #manifestacao"
)
REVISOR_SCORE = "15/15"
NOTAS         = "Formato B. 2.350 menções. Deuteronômio 28 pobreza como maldição. Praça MENTE."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [

  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "A BÍBLIA FALA\nDE DINHEIRO\n2.350 VEZES.",
    "body": (
        "Mais do que fé.\n\n"
        "Mais do que oração.\n\n"
        "Mais do que salvação.\n\n"
        "O livro mais lido do mundo nunca foi sobre pobreza."
    ),
    "prompt": (
        "An ancient sacred Bible or scripture open — glowing pages radiating gold divine light. "
        "Thousands of golden coins bursting from the open pages like stars, "
        "each coin trailing light as it spirals outward. "
        "The number 2350 written in luminous gold fire floating above the open book. "
        "Rays of divine light emanating from the text. "
        "A human figure standing before the book with expression of stunned revelation, "
        "seeing the text for the first time without a filter. "
        "Deep cosmic violet and indigo background with sacred geometry patterns. "
        "The book as a source of abundance, not restriction — finally visible."
    ),
  },

  # ── S2 — DESCIDA ── tensão BAIXA — validação
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "E TE\nENSINARAM\nO OPOSTO.",
    "body": (
        "Cresceu ouvindo que dinheiro é raiz de todo mal.\n\n"
        "Que rico não entra no paraíso.\n\n"
        "Que humildade é não ter.\n\n"
        "Enquanto o livro que deu base a isso falava de dinheiro "
        "mais do que qualquer outra coisa."
    ),
    "prompt": (
        "The same open Bible — but now a dark translucent veil draped over its pages, "
        "filtering the golden light into grey shadows. "
        "Through the veil: the golden coins and abundance still visible but muted, "
        "obscured deliberately. "
        "A hand adjusting the veil downward to cover more of the text. "
        "A human figure on one side receiving only the grey filtered version, "
        "unaware of the gold beneath the veil. "
        "The architecture of a filtered teaching — what was hidden in plain sight."
    ),
  },

  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "NEM JESUS\nFALOU\nDISSO.",
    "body": (
        "Jesus mencionou dinheiro em 11 das 39 parábolas.\n\n"
        "Falava de gestão, multiplicação, responsabilidade com o que é confiado.\n\n"
        "A mensagem de pobreza como virtude foi acrescentada depois — "
        "por quem se beneficiava do seu não ter."
    ),
    "prompt": (
        "A luminous figure in robes — the teacher — speaking with animated gestures, "
        "golden parables floating around in symbolic form: "
        "talents multiplying, coins discovered, seeds growing into abundant harvests. "
        "Each parable visual shows abundance and multiplication, not scarcity. "
        "Around the scene: later scribes and institutional figures in shadow "
        "adding dark ink annotations to the original glowing text. "
        "The contrast between the original luminous teaching and the dark additions. "
        "Sacred light atmosphere, deep violet and gold."
    ),
  },

  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "fullbleed",
    "title": "O QUE DEUS\nCHAMA DE\nBÊNÇÃO.",
    "body": (
        "Em Deuteronômio 28, Deus lista o que significa estar na aliança:\n\n"
        "Colheita abundante. Rebanhos multiplicados. Prosperidade em tudo.\n\n"
        "A maldição descrita no mesmo capítulo?\n\n"
        "Escassez, dívida, servidão.\n\n"
        "A Bíblia chama pobreza de maldição — não de virtude."
    ),
    "prompt": (
        "An ancient scroll split into two luminous halves — "
        "the top half glowing gold with abundant harvests, multiplying flocks, "
        "overflowing vessels of grain and oil rendered in divine sacred imagery. "
        "The bottom half in deep crimson shadow showing empty vessels, broken scales, "
        "chains of debt, figures bent under burden. "
        "The word BÊNÇÃO in gold fire above the upper half. "
        "The word MALDIÇÃO in deep crimson above the lower half. "
        "A human figure reading the scroll with dawning recognition. "
        "Deuteronômio 28 floating in luminous text at the top."
    ),
  },

  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "VOCÊ PEDIU\nPOUCO\nPOR TODA A VIDA.",
    "body": (
        "Não por humildade.\n\n"
        "Porque você aprendeu que pedir muito era errado.\n\n"
        "E essa crença operou em silêncio toda vez que você fez uma proposta, "
        "negociou um salário, ou escolheu uma meta — "
        "antes de você ter tempo de perceber."
    ),
    "prompt": (
        "A human figure kneeling with hands cupped together, "
        "but the cupped hands form only a very small bowl — barely enough for a handful. "
        "Above the figure: an infinite cascade of golden abundance pouring down, "
        "most of it flowing past and away because the cup was made too small. "
        "Around the figure: ancient parchment words in crimson — "
        "'não mereço', 'é demais', 'quem sou eu' — "
        "forming the invisible walls that kept the hands small. "
        "The heartbreaking precision of a life lived at reduced scale. "
        "The gold that was always available, always deflected."
    ),
  },

  # ── S6 — ESPELHO ── tensão RECONHECIMENTO
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "EXISTE UMA\nVOZ QUE\nFALA CULPA.",
    "body": (
        "Toda vez que você está perto de abundância real, ela fala:\n\n"
        "\"Quem sou eu para ter tanto?\"\n\n"
        "\"Rico não vai ao paraíso.\"\n\n"
        "\"Isso não é pra mim.\"\n\n"
        "Você reconhece essa voz?"
    ),
    "prompt": (
        "A human figure with one hand reaching toward a door of golden light — "
        "but a ghostly second figure behind, whispering into the ear, "
        "pulling the reaching arm back slightly. "
        "The whispering figure has the face of religious authority — ancient, institutional. "
        "From its mouth: visible crimson sound waves carrying the words of limitation. "
        "The reaching figure's eyes show recognition of both the light ahead "
        "and the voice behind. "
        "The moment of naming the voice that was always there but never identified. "
        "Deep violet atmosphere, the door of light warm and golden."
    ),
  },

  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "O LIVRO SEMPRE\nFALOU DE\nPROSPERIDADE.",
    "body": (
        "Quando você lê sem o filtro que te ensinaram, a Bíblia é um manual "
        "de gestão, fé e abundância.\n\n"
        "O bloqueio nunca estava no texto.\n\n"
        "Estava na interpretação — que serviu a quem precisava que você não tivesse."
    ),
    "prompt": (
        "The ancient Bible open again — but now the dark veil completely removed, "
        "burning away in golden fire. "
        "The pages now radiating their full original light: gold abundance pouring out "
        "in waves of divine luminescence. "
        "A human figure standing before the open book with the veil dissolving in their hands, "
        "face turned upward receiving the full golden light. "
        "Sacred symbols of prosperity — the parable of talents, the multiplication of loaves, "
        "Abrahamic covenant stars — all visible in the light now. "
        "The text as it was always meant to be received."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "O PROBLEMA\nNUNCA FOI\nO LIVRO.",
    "body": (
        "Foi o que fizeram com ele.\n\n"
        "Quando você remove o filtro instalado, a mensagem original aparece — "
        "e ela sempre foi sobre expansão, propósito e abundância.\n\n"
        "Comente FONTE se você cresceu com uma versão do texto sagrado "
        "que te ensinou a não querer."
    ),
    "prompt": (
        "The Bible stands as a luminous open monument — pages radiating gold divine light "
        "upward and outward in all directions. "
        "Around the base of the book: the discarded dark veil, the dark ink annotations, "
        "the institutional additions — all dissolved, turned to ash that drifts away. "
        "What remains is the pure original light: coins, harvests, abundance, "
        "sacred prosperity imagery flowing freely from the text. "
        "A human figure standing in the full light, arms open, finally receiving. "
        "The resolution of a lifetime's confusion in one image."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "DÁ PRA\nREMOVER\nESSE FILTRO.",
    "body": (
        "O bloqueio espiritual com dinheiro não está no consciente — "
        "está na frequência onde a culpa foi gravada.\n\n"
        "Existe um protocolo que opera nesse nível e dissolve a confusão "
        "entre fé e pobreza antes de qualquer pensamento.\n\n"
        "Quando o filtro é removido na raiz, o texto e a abundância "
        "param de se contradizer."
    ),
    "prompt": (
        "Waves of healing teal and gold frequency entering a human figure's head — "
        "inside the mind: visible as dark grey filter-layers dissolving one by one "
        "as each wave passes through. "
        "Behind each dissolved layer: the original golden light of the text visible, "
        "clearer and brighter. "
        "The process like archaeological excavation of the mind — "
        "layers of accumulated filtering removed to reveal what was always there. "
        "Sacred geometry forming as each layer clears. "
        "The restoration of original signal."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de remover o bloqueio espiritual "
        "com dinheiro — usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A radiant golden portal formed from an open sacred scripture — "
        "the pages themselves becoming the archway, "
        "luminous gold text transforming into flowing streams of abundance light. "
        "A human figure stepping through the book-portal, "
        "body becoming light as it crosses the threshold. "
        "On this side: grey filtered shadows, doubt, conditioned limitation. "
        "On the other side: pure gold abundance, sacred prosperity, divine permission. "
        "Ancient sacred symbols orbiting the portal — "
        "2350 in electric gold fire above the archway. "
        "Deep cosmic violet and iridescent teal background. "
        "The passage from filtered reading to original truth."
    ),
  },
]


# ── Engine OpenAI gpt-image-2 ─────────────────────────────────────────────────
def gen(prompt: str, retries: int = 3) -> bytes | None:
    payload = json.dumps({
        "model":         MODEL,
        "prompt":        prompt,
        "n":             1,
        "size":          "1024x1536",
        "output_format": "jpeg",
    }).encode()

    for attempt in range(retries):
        if attempt:
            time.sleep(10 * attempt)
        req = urllib.request.Request(
            ENDPOINT,
            data=payload,
            headers={
                "Authorization": f"Bearer {OPENAI_KEY}",
                "Content-Type":  "application/json",
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                body = json.loads(r.read())
            b64 = body.get("data", [{}])[0].get("b64_json") or \
                  body.get("data", [{}])[0].get("url")
            if b64 and not b64.startswith("http"):
                return base64.b64decode(b64)
            if b64 and b64.startswith("http"):
                with urllib.request.urlopen(b64, timeout=60) as r2:
                    return r2.read()
            print(f"  Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            body_err = e.read().decode()[:300]
            print(f"  HTTP {e.code}: {body_err}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── Execução ──────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Carrossel — {TEMA}")
print(f"  Modelo: {MODEL} | Slides: {len(slides)}")
print(f"  Saida: {OUT_DIR}")
print(f"{'='*60}\n")

ok = 0
for i, s in enumerate(slides):
    print(f"[{s['num']}/{len(slides):02d}] {s['layout'].upper()} — {s['title'].splitlines()[0][:50]}...")

    prompt_final = build_prompt(s["prompt"])
    img = gen(prompt_final)
    if not img:
        print("  FALHOU\n")
        continue

    final = compose(img, s["title"], s["body"], s["layout"])

    slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
    out  = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1

    if i < len(slides) - 1:
        time.sleep(3)

print(f"{'='*60}")
print(f"  CONCLUIDO: {ok}/{len(slides)} slides")
print(f"{'='*60}\n")

# ── Registro automatico no Dashboard ─────────────────────────────────────────
register(
    title         = TEMA,
    theme         = TEMA_SLUG,
    format        = FORMATO,
    slides_dir    = str(OUT_DIR),
    caption       = CAPTION,
    revisor_score = REVISOR_SCORE,
    notes         = NOTAS,
)
