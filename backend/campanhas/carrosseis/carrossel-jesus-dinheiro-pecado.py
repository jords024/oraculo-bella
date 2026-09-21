#!/usr/bin/env python3
"""
carrossel-jesus-dinheiro-pecado.py — Jesus Nunca Disse que Dinheiro é Pecado
Método Jordânico | Praça: ALAVANCA | Formato B
Tema: Culpa financeira instalada pela religião — Jesus nunca condenou dinheiro, condenou o amor ao dinheiro
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

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-jesus-dinheiro-pecado")
TEMA          = "Jesus Nunca Disse que Dinheiro é Pecado"
TEMA_SLUG     = "jesus-dinheiro-pecado"
FORMATO       = "B"
CAPTION       = (
    "Jesus não disse que dinheiro é pecado.\n\n"
    "Disse que o AMOR ao dinheiro é raiz de todo mal. Isso é diferente.\n\n"
    "A Bíblia menciona dinheiro 2.350 vezes — mais do que fé, mais do que oração.\n\n"
    "E em 11 das 39 parábolas, Jesus falava de dinheiro. Não pra condenar. "
    "Pra ensinar gestão, multiplicação, responsabilidade.\n\n"
    "A mensagem de pobreza como virtude não veio do texto.\n\n"
    "Veio de quem se beneficiava do seu não ter.\n\n"
    "Comente FONTE e eu te envio o protocolo que dissolve essa culpa na raiz.\n\n"
    "#dinheiro #biblia #fé #abundancia #fonteoculta #bloqueiofinanceiro "
    "#culpafinanceira #prosperidade #desbloqueiomental #jesus"
)
REVISOR_SCORE = "15/15"
NOTAS         = "Formato B. Culpa financeira religiosa. Jesus x doutrina de pobreza. Praça ALAVANCA."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [

  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "VOCÊ ACREDITA\nQUE DINHEIRO\nÉ PECADO.",
    "body": (
        "Jesus não disse isso.\n\n"
        "A Igreja disse.\n\n"
        "E você acreditou — e carregou isso dentro de você toda vez "
        "que esteve perto de ganhar de verdade."
    ),
    "prompt": (
        "A human figure standing at the threshold between two worlds — "
        "one side radiant gold with coins and abundance, the other side dark and austere "
        "with chains made of wooden rosary beads and ancient parchment. "
        "The figure's body frozen at the threshold, unable to cross into the light side. "
        "A visible force field of guilt made of pulsing red and dark purple "
        "preventing forward movement. "
        "Divine golden light pouring through from the abundant side — warm, inviting, sacred. "
        "Ancient sacred manuscripts dissolving into the barrier. "
        "Expression of someone who wants to cross but was taught they cannot. "
        "Esoteric mystical atmosphere, deep cosmic violet background."
    ),
  },

  # ── S2 — DESCIDA ── tensão BAIXA — validação
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "CADA VEZ QUE\nVOCÊ GANHA,\nSENTE CULPA.",
    "body": (
        "Quando você recebe uma grande comissão e sente que não merecia tanto.\n\n"
        "Quando você cobra o que vale e sente vergonha de falar o número.\n\n"
        "Isso não é humildade.\n\n"
        "É programação instalada antes de você poder questioná-la."
    ),
    "prompt": (
        "A luminous golden coin hovering in front of a human figure's open hands — "
        "but instead of reaching for it, the hands are frozen, retracted slightly, "
        "as if the coin is both desired and forbidden. "
        "Around the coin: wisps of crimson guilt smoke creating an invisible barrier. "
        "The face of the figure shows longing mixed with conditioned shame. "
        "Sacred geometric patterns in gold surrounding the scene. "
        "Deep indigo and violet background. "
        "The architecture of a lifetime of conditioning made visible in a single moment."
    ),
  },

  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "A BÍBLIA TEM\nDOIS TIPOS\nDE RICO.",
    "body": (
        "Ricos que usaram dinheiro para servir: Abraão, Salomão, José de Arimateia.\n\n"
        "E ricos que colocaram dinheiro acima de Deus.\n\n"
        "Jesus combateu o segundo tipo.\n\n"
        "A Igreja inverteu o ensinamento — e condenou os dois."
    ),
    "prompt": (
        "Two contrasting human figures standing side by side in divine light — "
        "one figure radiating gold with open hands offering abundance to others, "
        "surrounded by flowing coins that become light as they leave the hands. "
        "The second figure clutching coins tightly, turning inward, gold becoming tarnished. "
        "Between them: an ancient open scripture glowing with divine light. "
        "A third silhouette in the background gesturing as if erasing the distinction. "
        "Sacred symbols — menorah, ancient seals, sacred geometry — in the glowing backdrop. "
        "The precise moment a teaching was distorted made visible."
    ),
  },

  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "fullbleed",
    "title": "O VERSÍCULO\nQUE VOCÊ\nMAL ENTENDE.",
    "body": (
        "\"A raiz de todos os males é o AMOR ao dinheiro\" — 1 Timóteo 6:10.\n\n"
        "Não o dinheiro. O amor ao dinheiro.\n\n"
        "Em 11 das 39 parábolas, Jesus falou de dinheiro — ensinando gestão, "
        "multiplicação, responsabilidade.\n\n"
        "A Bíblia nunca condenou ter. Condenou o apego que destrói o ser."
    ),
    "prompt": (
        "An ancient illuminated manuscript open to two pages, glowing with divine gold light. "
        "On one page: the word AMOR highlighted in crimson fire — standing apart, isolated, condemned. "
        "On the other page: ancient gold coins illustrated in the text with a divine glow — "
        "honored, not condemned. "
        "A human figure leaning over the manuscript with a magnifying lens made of crystal, "
        "finally seeing the distinction. "
        "Sacred light streaming from the pages upward. "
        "Quill pens and ancient ink visible in the luminous scene. "
        "The revelation of a misreading that changed everything."
    ),
  },

  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "A CULPA\nNÃO É SUA.\nFOI INSTALADA.",
    "body": (
        "Antes de você ter idade para questionar, você aprendeu que o rico "
        "passa pelo buraco da agulha antes de entrar no paraíso.\n\n"
        "E essa frase virou uma voz dentro de você.\n\n"
        "Ela fala toda vez que você está perto de ganhar de verdade — "
        "antes de você ter tempo de pensar."
    ),
    "prompt": (
        "A small child figure kneeling in a beam of church light, head bowed, "
        "absorbing words that rain down from above like glowing crimson embers — "
        "each ember landing on the child's chest and becoming embedded, burning cold, not hot. "
        "The same figure shown as an adult beside the child, "
        "the embedded embers still glowing in the chest. "
        "The inheritance of a belief system visible as light-embers traveling through time. "
        "Sacred architecture silhouette in the background — arches, stained glass shadows. "
        "The most invisible form of programming: the kind installed through devotion."
    ),
  },

  # ── S6 — ESPELHO ── tensão RECONHECIMENTO
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "VOCÊ JÁ\nSENTIU ISSO\nAQUI DENTRO.",
    "body": (
        "Ganhou uma grande comissão — e sentiu que não merecia tanto.\n\n"
        "Fez uma proposta de alto valor — e abaixou o preço na hora.\n\n"
        "Recusou uma oportunidade por 'humildade'.\n\n"
        "Não foi modéstia.\n\n"
        "Foi a voz da culpa falando mais alto que o seu valor real."
    ),
    "prompt": (
        "A human figure standing in front of a mirror — "
        "but the reflection shows the same person surrounded by golden abundance "
        "while the real figure has hands pressed to chest with an expression "
        "of guilty recognition. "
        "In the mirror: the life that was always available. "
        "In reality: the invisible wall of conditioned guilt. "
        "Between them: translucent waves of crimson programming. "
        "The face in both versions shows the same person — "
        "only one of them was taught they were allowed."
    ),
  },

  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "FÉ E RIQUEZA\nNÃO SÃO\nOPOSTOS.",
    "body": (
        "Abraão era o homem mais rico de sua época — e o chamado amigo de Deus.\n\n"
        "Salomão pediu sabedoria — e recebeu riqueza junto, como consequência.\n\n"
        "A prosperidade não contradiz a fé.\n\n"
        "Ela é fruto de uma mente alinhada com propósito, serviço e expansão."
    ),
    "prompt": (
        "A majestic human figure standing in open divine light — "
        "one hand raised toward heaven in prayer and connection, "
        "the other hand open at the side receiving flowing golden coins and light. "
        "Both movements happening simultaneously — prayer and prosperity as one gesture. "
        "Sacred golden pillars rising around the figure. "
        "Ancient symbols of Abrahamic covenant floating in the golden light. "
        "The figure's face lifted, expression of simultaneous spiritual reverence and "
        "material freedom. "
        "The integration of two things that were never actually opposed."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "DINHEIRO NÃO\nTE AFASTA\nDE DEUS.",
    "body": (
        "A culpa financeira afasta.\n\n"
        "Quando você dissolve a culpa e entende que abundância e fé "
        "caminham juntas, o dinheiro para de ser tabu — e começa a ser instrumento.\n\n"
        "Comente FONTE se você cresceu aprendendo que dinheiro é coisa de mundo "
        "e sentiu que isso te segurou."
    ),
    "prompt": (
        "A human figure at the center with both arms open wide — "
        "on one side, divine light and sacred geometry, golden divine connection. "
        "On the other side, golden coins and abundance flowing freely. "
        "Both streams of light meeting at the figure's chest, merging into one unified golden glow. "
        "No tension between the two streams — perfect integration. "
        "The figure's face showing peaceful recognition of something always true. "
        "The invisible wall of guilt dissolved — the threshold finally crossed. "
        "Sacred and material as one unbroken field of light."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "DÁ PRA\nDISSOLVER\nESSA VOZ.",
    "body": (
        "A culpa financeira religiosa não está no pensamento consciente.\n\n"
        "Está na frequência onde a crença foi gravada — antes de você "
        "ter palavras para questioná-la.\n\n"
        "Existe uma frequência que opera exatamente nesse nível. "
        "Quando a culpa é dissolvida na raiz, o dinheiro passa a ser recebido "
        "sem o peso de décadas de programação."
    ),
    "prompt": (
        "Waves of healing golden and teal light entering a human figure's chest — "
        "precisely where the crimson guilt-embers were embedded. "
        "Each wave of light contacting an ember and transforming it: "
        "crimson becoming gold, guilt becoming permission, restriction becoming flow. "
        "The transformation visible as a cascade from chest outward through the body. "
        "Sacred geometry forming around the figure as the process unfolds. "
        "A sense of ancient programming finally being updated. "
        "The body's field clearing like clouds parting to reveal continuous sky."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de dissolver a culpa financeira "
        "gravada no seu sistema — usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A radiant golden portal of pure divine light — "
        "sacred geometry forming an archway of golden fire and divine luminescence. "
        "A human figure stepping through the portal with complete ease, "
        "body dissolving into golden light at the threshold. "
        "On this side of the portal: old chains of rosary beads and parchment falling away. "
        "On the other side: pure flowing abundance and sacred gold. "
        "Ancient sacred symbols — crosses transformed into sacred geometry, "
        "coins with divine light emanating from them — orbiting the portal. "
        "Deep cosmic violet and iridescent magenta background. "
        "The passage from guilt to permission made into one luminous image."
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
