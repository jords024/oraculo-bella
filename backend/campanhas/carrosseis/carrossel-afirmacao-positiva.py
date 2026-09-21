#!/usr/bin/env python3

import os

from dotenv import load_dotenv

load_dotenv()
os.environ["PYTHONIOENCODING"] = "utf-8"
"""
Carrossel — Afirmacao Positiva e o Maior Golpe do Desenvolvimento Pessoal
Tema: ANTI-GURU | Formato B — Demolicao + Reconstrucao
Preset: cinematografico_crimson
Curva: CHOQUE > DEMOLICAO x3 > MECANISMO x3 > RECONSTRUCAO x2 > PORTAL
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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-afirmacao-positiva")
PRESET   = "cinematografico_crimson"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides — Copy + Prompts ──────────────────────────────────────────────────
slides = [

  # ── 01 CHOQUE — Cover fullbleed ───────────────────────────────────────────
  {
    "num": "01", "layout": "fullbleed",
    "title": (
      "VOCÊ REPETE AFIRMAÇÕES HÁ ANOS.\n"
      "SEU SISTEMA NERVOSO\n"
      "NUNCA ACREDITOU EM NENHUMA."
    ),
    "body": (
      "Não é falta de disciplina. Não é falta de fé.\n"
      "É que ninguém te contou como o corpo realmente muda."
    ),
    "prompt": build_prompt(
      "A human mouth open and speaking — golden words and affirmations visibly dissolving "
      "into smoke before reaching the body below. "
      "The words evaporate instantly upon contact with the air, "
      "never penetrating the skin, never reaching the nervous system. "
      "The body stands rigid, unmoved, in a different frequency entirely. "
      "Cold crimson-tinged darkness, words glowing briefly then vanishing, "
      "the disconnect between thought and body made physically visible. "
      "Clinical, cold, honest — not dramatic"
    ),
  },

  # ── 02 DEMOLIÇÃO — O mercado vendeu o mecanismo errado — card ────────────
  {
    "num": "02", "layout": "card",
    "title": (
      "O MERCADO VENDEU\n"
      "O MECANISMO ERRADO"
    ),
    "body": (
      "Afirmação positiva ativa o córtex pré-frontal.\n"
      "A parte racional do seu cérebro.\n"
      "\n"
      "Mas quem controla seus comportamentos, reações e padrões\n"
      "não é o córtex pré-frontal.\n"
      "\n"
      "É o sistema nervoso autônomo.\n"
      "E ele não fala a língua das palavras."
    ),
    "prompt": build_prompt(
      "Human brain cross-section split dramatically in two halves — "
      "left half blazing with clinical white-blue light, rational cortex fully illuminated, "
      "neural pathways firing visibly. "
      "Right half: the autonomic nervous system in deep shadow, cool and dark, "
      "operating silently and separately from the lit rational side. "
      "A clean dividing line between the two systems. "
      "The shadow side is clearly running deeper, older, more powerful. "
      "Crimson-tinged darkness, cold clinical blue for the cortex, "
      "deep shadow for the autonomous system beneath"
    ),
  },

  # ── 03 DEMOLIÇÃO — Seu corpo opera por frequência — fullbleed ─────────────
  {
    "num": "03", "layout": "fullbleed",
    "title": (
      "SEU CORPO OPERA\n"
      "POR FREQUÊNCIA,\n"
      "NÃO POR FRASE"
    ),
    "body": (
      "O sistema nervoso autônomo registra estados.\n"
      "Tensão. Segurança. Ameaça. Expansão.\n"
      "\n"
      "Se você repete 'sou abundante' em estado de ansiedade,\n"
      "o que seu sistema nervoso grava é: ansiedade."
    ),
    "prompt": build_prompt(
      "Human silhouette shown as pure frequency — the body rendered entirely as "
      "overlapping wave patterns and vibrational fields. "
      "The surface frequency: high-amplitude anxious rapid waves in cold crimson. "
      "The interior core frequency: a different, deeper, slower pattern — the true state. "
      "The surface words are chaotic and mismatched with the deep interior truth. "
      "Vibrational mismatch made visually explicit — two incompatible frequencies "
      "occupying the same body simultaneously. "
      "Dark background, crimson frequency waves, the body as pure waveform"
    ),
  },

  # ── 04 EVIDÊNCIA — A neurociência mediu isso — card ──────────────────────
  {
    "num": "04", "layout": "card",
    "title": (
      "A NEUROCIÊNCIA\n"
      "MEDIU ISSO"
    ),
    "body": (
      "O neurocientista Joe Dispenza documentou:\n"
      "mudança de padrão neurológico real exige\n"
      "coerência entre pensamento, emoção\n"
      "e estado corporal — simultâneos.\n"
      "\n"
      "Só o pensamento não basta.\n"
      "Só a emoção não basta.\n"
      "Os três ao mesmo tempo. Em frequência sustentada.\n"
      "Isso nunca coube num Post-it."
    ),
    "prompt": build_prompt(
      "Three-dimensional neural network diagram rendered as pure light in darkness — "
      "three distinct systems shown: cognitive pathways (cold blue), "
      "emotional pathways (warm amber), somatic/body pathways (deep crimson). "
      "When all three align and overlap at the center: "
      "a single brilliant point of coherent light — real neurological change. "
      "When only one or two are active: the center remains dark. "
      "Scientific precision, cold clinical aesthetic, "
      "the mathematics of coherence made visible as intersecting light systems"
    ),
  },

  # ── 05 INJUSTIÇA — Simplificaram para vender — fullbleed ─────────────────
  {
    "num": "05", "layout": "fullbleed",
    "title": (
      "SIMPLIFICARAM O MECANISMO\n"
      "PARA CABER EM UM PRODUTO"
    ),
    "body": (
      "Afirmação positiva é fácil de ensinar.\n"
      "Fácil de vender em curso de fim de semana.\n"
      "Fácil de colocar em caneca.\n"
      "\n"
      "Reprogramação somática real não cabe num produto de prateleira.\n"
      "Então te venderam a versão que cabe."
    ),
    "prompt": build_prompt(
      "A polished commercial product — motivational book or mug — sitting on a pristine shelf, "
      "perfectly lit with commercial lighting, gleaming. "
      "Directly beside it: an enormously complex organic nervous system diagram, "
      "vast and intricate, completely incompatible in scale with the product. "
      "The product is tiny and tidy. The real mechanism is massive and messy. "
      "The contrast between the packaged version and the actual biological truth. "
      "Cold crimson-tinged background, the product pathetically small beside reality"
    ),
  },

  # ── 06 MECANISMO — O que realmente reprograma — card ─────────────────────
  {
    "num": "06", "layout": "card",
    "title": (
      "O QUE REALMENTE\n"
      "REPROGRAMA O\n"
      "SISTEMA NERVOSO"
    ),
    "body": (
      "Não é o que você diz. É o estado em que seu corpo está.\n"
      "\n"
      "Práticas que mudam frequência de forma mensurável:\n"
      "Respiração coerente por ao menos 11 minutos contínuos.\n"
      "Meditação em estado de gratidão antecipada real.\n"
      "Exposição ao frio — ativa o sistema parassimpático.\n"
      "Movimento somático intencional.\n"
      "\n"
      "O corpo muda quando a frequência muda.\n"
      "Não quando a frase muda."
    ),
    "prompt": build_prompt(
      "Human nervous system shown in full coherence — "
      "the autonomic pathways lit with steady, harmonious, warm amber-gold waves "
      "pulsing at regular intervals throughout the entire body silhouette. "
      "The frequency is slow, deep, expansive — the opposite of the anxious surface pattern. "
      "The body is fully lit from within by its own coherent internal signal. "
      "No external stimulation — the change is endogenous, internal, earned. "
      "Dark background, the body as its own light source, warm coherent frequency"
    ),
  },

  # ── 07 VIRADA — A ordem importa — fullbleed ───────────────────────────────
  {
    "num": "07", "layout": "fullbleed",
    "title": (
      "A ORDEM IMPORTA.\n"
      "VOCÊ NÃO AFIRMA\n"
      "PARA MUDAR."
    ),
    "body": (
      "Você muda o estado fisiológico primeiro.\n"
      "A afirmação vem depois — como ancoragem\n"
      "de um estado que já é real no corpo.\n"
      "\n"
      "Pessoas que transformaram padrões reais\n"
      "não repetiram frases por mais tempo.\n"
      "Elas mudaram a frequência primeiro."
    ),
    "prompt": build_prompt(
      "Two identical human figures shown side by side — same person, same moment, different internal states. "
      "Left figure: words and affirmations floating around the exterior, "
      "the interior body frequency chaotic and unchanged. "
      "Right figure: interior body frequency already shifted and coherent, warm and expansive — "
      "then an affirmation emerges naturally from within, not imposed from outside. "
      "The sequence difference made architecturally visible: outside-in versus inside-out. "
      "Cold crimson left, warm coherent amber right, deep black background"
    ),
  },

  # ── 08 RECONHECIMENTO — Você não falhou — card ────────────────────────────
  {
    "num": "08", "layout": "card",
    "title": (
      "VOCÊ NÃO FALHOU.\n"
      "TE ENSINARAM\n"
      "A FERRAMENTA ERRADA."
    ),
    "body": (
      "Se as afirmações não funcionaram,\n"
      "não é porque você não acreditou o suficiente.\n"
      "\n"
      "É porque ninguém te entregou o mecanismo completo.\n"
      "\n"
      "A culpa foi transferida para você\n"
      "para proteger o produto que estava sendo vendido."
    ),
    "prompt": build_prompt(
      "A broken compass — the needle spinning uselessly, unable to find north. "
      "Around it: scattered motivational tools, all pointing in different directions. "
      "The compass was the wrong instrument for the terrain it was sold for. "
      "Not a failure of the person using it — a failure of the tool itself. "
      "Cold dark aesthetic, the useless spinning needle as the central symbol, "
      "crimson tones, the frustration of having been given the wrong map"
    ),
  },

  # ── 09 ATIVAÇÃO — A pergunta — fullbleed ─────────────────────────────────
  {
    "num": "09", "layout": "fullbleed",
    "title": (
      "QUAL É O ESTADO\n"
      "FISIOLÓGICO EM QUE\n"
      "VOCÊ VIVE?"
    ),
    "body": (
      "Tensão ou expansão?\n"
      "Contração ou abertura?\n"
      "\n"
      "Essa resposta explica mais sobre seus resultados\n"
      "do que qualquer afirmação que você já repetiu."
    ),
    "prompt": build_prompt(
      "A single human figure shown twice in perfect mirror symmetry — "
      "left side: body contracted, shoulders forward, frequency tight and inward, "
      "crimson contraction signals visible throughout. "
      "Right side: same body expanded, chest open, frequency radiating outward, "
      "warm amber expansion signals flowing freely. "
      "The mirror asks: which one are you? "
      "The question is posed through posture and frequency, not words. "
      "Deep black background, the physiological states made undeniably visible"
    ),
  },

  # ── 10 PORTAL — CTA — fullbleed ───────────────────────────────────────────
  {
    "num": "10", "layout": "fullbleed",
    "title": (
      "COMENTE FONTE\n"
      "SE VOCÊ JÁ USOU A\n"
      "FERRAMENTA ERRADA"
    ),
    "body": (
      "O desenvolvimento pessoal vendeu o mapa.\n"
      "Nós estamos aqui para entregar o território.\n"
      "@afonteoculta"
    ),
    "prompt": build_prompt(
      "A dark corridor opening into pure coherent warm light ahead — "
      "the threshold between the old mechanism and the real one. "
      "On the dark side: scattered motivational objects losing their color and form. "
      "On the lit side: a single human silhouette standing in full physiological coherence, "
      "body frequency aligned and expansive, seen from behind facing the light. "
      "The passage is an invitation to the correct mechanism. "
      "Deep black, cold crimson fading, warm amber ahead, the figure small but certain"
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
print("  Carrossel — Afirmacao Positiva")
print("  Tema: ANTI-GURU | 10 slides | Formato B | Preset: Crimson")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print("="*60 + "\n")

ICONS = {
    "01": "[CHOQUE]",
    "02": "[DEMOLICAO]", "03": "[DEMOLICAO]", "04": "[EVIDENCIA]",
    "05": "[INJUSTICA]", "06": "[MECANISMO]", "07": "[VIRADA]",
    "08": "[RECONHECIMENTO]", "09": "[ATIVACAO]",
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

    slug  = "".join(c if c.isalnum() else "-" for c in title.splitlines()[0].lower()).strip("-")[:38]
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
    title         = "Afirmacao Positiva e o Maior Golpe do Desenvolvimento Pessoal",
    theme         = "afirmacao-positiva",
    format        = "B",
    slides_dir    = str(OUT_DIR),
    caption       = (
        "Voce repete afirmacoes ha anos. Seu sistema nervoso nunca acreditou em nenhuma. "
        "Nao e falta de disciplina. E que te venderam a ferramenta errada. "
        "Comente FONTE se voce ja tentou afirmacao por meses e nada mudou de verdade."
    ),
    revisor_score = "—",
    notes         = (
        "Formato B (Demolicao + Reconstrucao). Tema ANTI-GURU. "
        "Preset: cinematografico_crimson. 10 slides. "
        "Mecanismo: cortex pre-frontal vs sistema nervoso autonomo. "
        "Referencia: Joe Dispenza — coerencia pensamento + emocao + corpo. "
        "Curva: CHOQUE > DEMOLICAO x3 > MECANISMO x3 > RECONSTRUCAO x2 > PORTAL."
    ),
)
