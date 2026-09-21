#!/usr/bin/env python3

import os

from dotenv import load_dotenv

load_dotenv()
os.environ["PYTHONIOENCODING"] = "utf-8"
"""
Carrossel — A Industria Musical Mudou a Frequencia Padrao do Mundo em 1953
Tema: CONSPIRACAO + FREQUENCIA | Formato D — Historia + Verdade
Preset: manuscrito_sagrado
Curva: CHOQUE > HISTORIA x3 > DECISAO > CIENCIA x2 > IMPLICACAO > RESISTENCIA > PORTAL
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

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-440hz")
PRESET   = "manuscrito_sagrado"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides — Copy + Prompts ──────────────────────────────────────────────────
slides = [

  # ── 01 CHOQUE — Cover fullbleed ───────────────────────────────────────────
  {
    "num": "01", "layout": "fullbleed",
    "title": (
      "EM 1953, UMA DECISÃO POLÍTICA\n"
      "MUDOU A FREQUÊNCIA\n"
      "DE TODA A MÚSICA DO PLANETA."
    ),
    "body": (
      "Ninguém votou.\n"
      "Ninguém foi consultado.\n"
      "E seu sistema nervoso vive com essa decisão até hoje."
    ),
    "prompt": build_prompt(
      "A massive tuning fork struck against stone — "
      "two distinct sound wave patterns emanating from it simultaneously. "
      "One wave: ancient, organic, aligned with sacred geometry and Fibonacci spirals, warm gold. "
      "The other wave: sharp, institutional, perfectly mechanical, cold and sterile. "
      "The moment of the choice made physically visible — "
      "two incompatible frequencies radiating from the same source. "
      "Ancient stone background, warm amber for the natural frequency, "
      "cold institutional silver for the imposed one. "
      "The fork is ancient. The choice was modern."
    ),
  },

  # ── 02 HISTÓRIA — Como era antes — card ──────────────────────────────────
  {
    "num": "02", "layout": "card",
    "title": (
      "ANTES DE 1953,\n"
      "O MUNDO SOAVA\n"
      "EM OUTRA FREQUÊNCIA"
    ),
    "body": (
      "Durante séculos, a música ocidental soou em 432Hz.\n"
      "Mozart compunha em 432Hz.\n"
      "Verdi defendia 432Hz em cartas ao parlamento italiano.\n"
      "\n"
      "Os instrumentos gregos e egípcios antigos\n"
      "estavam afinados em 432Hz.\n"
      "\n"
      "Não por acidente.\n"
      "432Hz ressoa com a proporção áurea de Fibonacci\n"
      "e com a frequência de Schumann — o campo da Terra."
    ),
    "prompt": build_prompt(
      "Ancient musical instruments — Greek lyre, Egyptian harp, Renaissance violin — "
      "arranged on weathered stone, each emitting visible warm golden sound waves "
      "that align perfectly with sacred geometry spirals floating in the dark air around them. "
      "The Fibonacci spiral and the Schumann frequency pattern overlap naturally "
      "with the sound waves emanating from the instruments. "
      "Natural harmony made visually explicit. "
      "Warm amber gold, ancient stone textures, deep black background, "
      "the instruments as historical evidence of the original frequency"
    ),
  },

  # ── 03 HISTÓRIA — 1939: a primeira proposta — fullbleed ───────────────────
  {
    "num": "03", "layout": "fullbleed",
    "title": (
      "1939: A PRIMEIRA\n"
      "PROPOSTA PARA MUDAR"
    ),
    "body": (
      "Em 1939, numa conferência em Londres,\n"
      "a Alemanha propôs elevar o padrão para 440Hz.\n"
      "\n"
      "Músicos e físicos acústicos protestaram.\n"
      "A razão técnica para 440Hz nunca foi cientificamente estabelecida.\n"
      "\n"
      "Era mais prático para a produção\n"
      "industrial de instrumentos em massa.\n"
      "A música estava se tornando produto."
    ),
    "prompt": build_prompt(
      "A formal conference room in 1939 — cold institutional architecture, "
      "long stone table, suited figures reduced to silhouettes in cold light. "
      "On the table: a single tuning fork rendered in warm ancient gold, "
      "surrounded by cold mechanical industrial objects. "
      "The tuning fork is ancient and organic — completely out of place in the industrial setting. "
      "Cold blue-grey institutional light from above, "
      "the warm gold of the tuning fork as the only warm element, "
      "the decision to industrialize something sacred made architecturally visible"
    ),
  },

  # ── 04 DECISÃO — ISO 16 — card ────────────────────────────────────────────
  {
    "num": "04", "layout": "card",
    "title": (
      "1953: A ISO 16\n"
      "TORNA 440HZ\n"
      "NORMA MUNDIAL OFICIAL"
    ),
    "body": (
      "A International Organization for Standardization\n"
      "publicou a norma ISO 16.\n"
      "\n"
      "440Hz virou lei técnica internacional.\n"
      "Toda a indústria fonográfica aderiu.\n"
      "Toda gravação. Todo estúdio. Toda rádio.\n"
      "\n"
      "O planeta inteiro passou a ouvir\n"
      "numa frequência que nenhuma tradição cultural\n"
      "havia escolhido antes."
    ),
    "prompt": build_prompt(
      "An official institutional seal being stamped onto ancient parchment — "
      "the heavy mechanical stamp crushing down onto the warm organic document beneath. "
      "The parchment shows faint sacred geometry and natural wave patterns "
      "being obscured under the cold official mark. "
      "The stamp is bureaucratic, heavy, definitive — an institution overwriting nature. "
      "The seal's impact radiates cold mechanical waves outward across the parchment. "
      "Warm amber gold parchment below, cold metallic institutional force above, "
      "deep black background — the moment a natural standard became a legal one"
    ),
  },

  # ── 05 CIÊNCIA — O que a acústica diz — fullbleed ─────────────────────────
  {
    "num": "05", "layout": "fullbleed",
    "title": (
      "O QUE A FÍSICA\n"
      "ACÚSTICA DOCUMENTOU"
    ),
    "body": (
      "440Hz gera leve tensão no sistema nervoso autônomo\n"
      "em exposição prolongada.\n"
      "\n"
      "432Hz produz estado de coerência mensurável\n"
      "entre frequência cardíaca e ondas cerebrais.\n"
      "\n"
      "O físico Jahn e a pesquisadora Dunne, de Princeton,\n"
      "publicaram estudos sobre como frequências sonoras\n"
      "afetam estados fisiológicos de forma mensurável.\n"
      "\n"
      "Não é metáfora. É física ondulatória."
    ),
    "prompt": build_prompt(
      "Human body silhouette shown as a receiver of two different sound frequencies — "
      "on the left: 432Hz waves entering the body and aligning perfectly with "
      "the body's own cardiac and neural wave patterns, golden and coherent. "
      "On the right: 440Hz waves entering and creating slight interference patterns "
      "with the body's natural rhythms, a barely perceptible but measurable dissonance. "
      "The body's internal waves are shown as scientific measurements — "
      "coherence versus mild interference made physically visible. "
      "Dark background, warm gold for natural frequency, cool silver for imposed one"
    ),
  },

  # ── 06 CIÊNCIA — Fibonacci e Schumann — card ──────────────────────────────
  {
    "num": "06", "layout": "card",
    "title": (
      "432Hz RESSOA COM\n"
      "A MATEMÁTICA\n"
      "DA NATUREZA"
    ),
    "body": (
      "432Hz é divisível pela proporção áurea.\n"
      "Pelo número Pi.\n"
      "Pela sequência de Fibonacci.\n"
      "\n"
      "A frequência de Schumann — o campo eletromagnético da Terra —\n"
      "pulsa em harmônicos que se alinham com 432Hz.\n"
      "\n"
      "440Hz não se alinha com nenhum desses padrões.\n"
      "\n"
      "Uma é matemática da natureza.\n"
      "A outra é matemática da conveniência industrial."
    ),
    "prompt": build_prompt(
      "The Fibonacci spiral overlaid with sound wave patterns — "
      "432Hz wave crests aligning perfectly with each Fibonacci expansion point, "
      "the mathematical harmony explicit and geometric. "
      "Surrounding the spiral: the Earth's Schumann frequency resonance pattern "
      "shown as concentric electromagnetic rings, also in perfect alignment. "
      "Everything in the composition fits together: spiral, wave, planetary field. "
      "Warm amber gold geometry on deep black, sacred mathematics made visible, "
      "the natural order of frequency"
    ),
  },

  # ── 07 IMPLICAÇÃO — Você cresceu numa frequência imposta — fullbleed ───────
  {
    "num": "07", "layout": "fullbleed",
    "title": (
      "TODA MÚSICA QUE\n"
      "TE FORMOU SOOU\n"
      "EM 440HZ"
    ),
    "body": (
      "Toda canção da sua infância.\n"
      "Todo show. Todo filme. Toda missa.\n"
      "\n"
      "Uma frequência adotada por conveniência industrial\n"
      "e mantida por inércia institucional.\n"
      "\n"
      "A pergunta não é se isso importa.\n"
      "A pergunta é: por que nunca perguntamos?"
    ),
    "prompt": build_prompt(
      "A person listening through headphones — "
      "shown from above, the sound waves entering through the headphones "
      "are visibly misaligned with the body's natural internal frequency patterns. "
      "The internal body resonance tries to find coherence with the incoming signal "
      "but the slight interference remains persistent. "
      "Years of accumulated exposure made physically visible "
      "as a subtle but constant frequency friction in the nervous system. "
      "Dark gold-tinged atmosphere, the mismatch shown with scientific precision, "
      "not alarming but undeniable"
    ),
  },

  # ── 08 RESISTÊNCIA — Verdi sabia — card ──────────────────────────────────
  {
    "num": "08", "layout": "card",
    "title": (
      "O QUE VERDI SABIA\n"
      "E A ISO IGNOROU"
    ),
    "body": (
      "Giuseppe Verdi escreveu ao governo italiano em 1884\n"
      "pedindo que o La fosse fixado em 432Hz.\n"
      "\n"
      "Ele argumentou que 432Hz era a frequência\n"
      "em que voz humana e instrumentos\n"
      "soavam em harmonia natural.\n"
      "\n"
      "O governo italiano aceitou — por um tempo.\n"
      "\n"
      "Depois veio a padronização industrial.\n"
      "E Verdi virou patrimônio histórico\n"
      "enquanto o que entendia sobre frequência foi arquivado."
    ),
    "prompt": build_prompt(
      "An aged composer at a writing desk by candlelight — "
      "quill pen in hand, an official letter taking shape on aged parchment. "
      "Through the window behind him: a vast orchestra hall with warm amber light, "
      "sound waves from the instruments flowing in visible golden streams. "
      "The composer's letter is urgent, careful, aware of what he is defending. "
      "The candlelight casts warm shadows across stacks of musical scores. "
      "19th century aesthetic, warm amber candlelight, the weight of an expert "
      "warning an institution that would eventually ignore him"
    ),
  },

  # ── 09 ATIVAÇÃO — Você pode escolher — fullbleed ──────────────────────────
  {
    "num": "09", "layout": "fullbleed",
    "title": (
      "VOCÊ PODE ESCOLHER\n"
      "O QUE NUNCA\n"
      "PÔDE ANTES"
    ),
    "body": (
      "Gravações em 432Hz existem e estão acessíveis.\n"
      "Plataformas permitem ajustar a afinação.\n"
      "\n"
      "O experimento é simples:\n"
      "ouça a mesma música nas duas frequências.\n"
      "Observe o que seu sistema nervoso sente.\n"
      "\n"
      "Não tome como verdade o que dizemos.\n"
      "Teste no corpo. O corpo não mente."
    ),
    "prompt": build_prompt(
      "Two identical sound wave patterns side by side — "
      "one in warm golden amber (432Hz), one in cold silver (440Hz). "
      "A human hand reaching toward the warm golden wave, making a choice. "
      "The choice is simple, available, undramatic — "
      "just the act of selecting one frequency over another. "
      "For the first time: a deliberate choice available where before there was none. "
      "Dark background, the two frequencies clearly distinguished by warmth and cold, "
      "the hand as agent of deliberate selection"
    ),
  },

  # ── 10 PORTAL — CTA — fullbleed ───────────────────────────────────────────
  {
    "num": "10", "layout": "fullbleed",
    "title": (
      "COMENTE FONTE\n"
      "SE VOCÊ NUNCA TINHA\n"
      "QUESTIONADO ISSO"
    ),
    "body": (
      "Alguns fatos são grandes demais\n"
      "para caber num slide.\n"
      "Este é um deles.\n"
      "@afonteoculta"
    ),
    "prompt": build_prompt(
      "Ancient stone portal standing in darkness — "
      "warm golden 432Hz frequency waves pouring through the arch from the other side, "
      "the natural frequency restored and available. "
      "Sacred geometry carved into the arch stones. "
      "On this side of the portal: cold silver 440Hz waves fade and dissolve. "
      "A single human silhouette stands at the threshold, "
      "turning toward the warm frequency with quiet recognition. "
      "Deep black space, warm amber gold on the other side of the arch, "
      "the passage as an invitation to hear differently"
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
            print(f"  Aguardando {wait}s...")
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
            print(f"  Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── Main ───────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("  Carrossel — 440Hz e a Frequencia Imposta")
print("  Tema: CONSPIRACAO | 10 slides | Formato D | Preset: Manuscrito")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print("="*60 + "\n")

ICONS = {
    "01": "[CHOQUE]",
    "02": "[HISTORIA]", "03": "[HISTORIA]", "04": "[DECISAO]",
    "05": "[CIENCIA]",  "06": "[CIENCIA]",  "07": "[IMPLICACAO]",
    "08": "[RESISTENCIA]", "09": "[ATIVACAO]",
    "10": "[PORTAL]",
}

ok = 0
for i, s in enumerate(slides):
    num    = s["num"]
    layout = s["layout"]
    title  = s["title"]
    icon   = ICONS.get(num, "")
    print(f"[{num}/10] {icon} {layout.upper()} - {title.splitlines()[0][:45]}...")

    img_bytes = gen_image(s["prompt"])
    if not img_bytes:
        print(f"  FALHOU — slide {num}\n")
        continue

    final = compose(img_bytes, title, s["body"], layout, preset_name=PRESET)

    fname = f"slide-{num}.jpg"
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


# ── Registro ───────────────────────────────────────────────────────────────
register(
    title         = "A Industria Musical Mudou a Frequencia Padrao do Mundo em 1953",
    theme         = "440hz-frequencia-imposta",
    format        = "D",
    slides_dir    = str(OUT_DIR),
    caption       = (
        "Em 1953, uma comissao decidiu a frequencia em que toda musica do planeta soaria. "
        "Ninguem consultou musicos. Ninguem consultou cientistas acusticos. "
        "Mozart compunha em 432Hz. Verdi escreveu ao parlamento para defende-la. "
        "Comente FONTE se voce nunca tinha questionado o padrao da musica que te formou."
    ),
    revisor_score = "—",
    notes         = (
        "Formato D (Historia + Verdade). Tema CONSPIRACAO + FREQUENCIA. "
        "Preset: manuscrito_sagrado. 10 slides. "
        "Fatos: 432Hz padrao historico, 1939 proposta alema, ISO 16 de 1953, "
        "Verdi carta parlamento 1884, Jahn e Dunne Princeton, Schumann 7.83Hz. "
        "Curva: CHOQUE > HISTORIA x2 > DECISAO > CIENCIA x2 > IMPLICACAO > RESISTENCIA > ATIVACAO > PORTAL."
    ),
)
