#!/usr/bin/env python3
"""
carrossel-ganhadores-loteria.py — Ganhadores de Loteria
Método Jordânico | Praça: ALAVANCA | Formato B
Tema: Termostato financeiro — o corpo expulsa o dinheiro antes de você perceber
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

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-ganhadores-loteria")
TEMA          = "Ganhadores de Loteria"
TEMA_SLUG     = "ganhadores-loteria"
FORMATO       = "B"
CAPTION       = (
    "70% das pessoas que ganham na loteria voltam ao mesmo nível financeiro em 12 meses.\n\n"
    "Não é porque gastaram errado.\n\n"
    "É porque o dinheiro não muda o termostato interno. Só revela onde ele está calibrado.\n\n"
    "Você pode ter vinte vezes mais dinheiro. E se o termostato não mudar, você vai achar "
    "um jeito de voltar pro mesmo número — sem perceber, sem querer, rindo nervoso quando acontecer.\n\n"
    "O problema nunca foi a quantidade.\n\n"
    "Foi o lugar de dentro onde o dinheiro é permitido ficar.\n\n"
    "Comente FONTE e eu te envio o protocolo que recalibra esse lugar.\n\n"
    "#dinheiro #abundancia #bloqueiofinanceiro #fonteoculta #termostato "
    "#mentalidadefinanceira #desbloqueiomental #consciencia #manifestacao #escassez"
)
REVISOR_SCORE = "15/15"
NOTAS         = "Formato B. Termostato financeiro — Universidade de Massachusetts 1978. 70% em 12 meses."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [

  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "VOCÊ QUER\nTER DINHEIRO.\nE EXPULSA ELE.",
    "body": (
        "70% das pessoas que ganham na loteria voltam ao mesmo nível em 12 meses.\n\n"
        "Não porque gastaram errado.\n\n"
        "Porque o corpo trata o dinheiro como ameaça — e devolve tudo "
        "antes da cabeça perceber."
    ),
    "prompt": (
        "A person's hands desperately reaching for golden banknotes that dissolve "
        "into luminous dust the moment fingertips make contact — money disintegrating "
        "before it can be held. Real adult working hands, veins visible, expression of "
        "stunned recognition on the face. Psychedelic gold and electric crimson fragments "
        "exploding outward from the point of contact. Deep cosmic violet void background. "
        "The paradox made visible: wanting and expelling simultaneously. Human figure "
        "reaching forward into swirling money that evaporates."
    ),
  },

  # ── S2 — DESCIDA ── tensão BAIXA — validação
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "SEU DINHEIRO\nNÃO SOME.\nÉ EXPULSO.",
    "body": (
        "Sabe quando você junta R$3.000 e do nada aparece "
        "uma conta que você não sabia que existia?\n\n"
        "Isso não é azar.\n\n"
        "É o seu sistema te puxando de volta pro lugar que ele conhece."
    ),
    "prompt": (
        "A worn analog thermostat mounted on an aged wall — the temperature dial "
        "frozen at a low setting despite human hands trying to turn it upward. "
        "The dial resists with invisible force, glowing faintly with electric purple resistance. "
        "Around the thermostat, fragments of banknotes orbit like satellites "
        "kept at a fixed distance by an invisible magnetic field. "
        "Warm amber light fighting against cold shadow. "
        "A human figure reaches toward the dial from the side, determined but unable to move it. "
        "The mechanism of a limit made tangible."
    ),
  },

  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "A UNIVERSIDADE\nMEDIU O QUE\nVOCÊ SENTE.",
    "body": (
        "Em 1978, pesquisadores de Massachusetts rastrearam "
        "ganhadores de loteria por dois anos.\n\n"
        "Em 12 meses, 70% voltaram ao mesmo patamar de antes.\n\n"
        "O dinheiro não mudou nada. Porque não mudou o lugar de dentro "
        "onde o dinheiro é permitido ficar."
    ),
    "prompt": (
        "A luminous graph line rising sharply upward like a lottery jackpot win "
        "then curving back and landing precisely at the exact starting point — "
        "drawn in electric gold on deep cosmic black void. "
        "The graph line is alive and organic, pulsing with energy. "
        "Numbers float around the curve. Multiple ghostly human figures visible along the descending arc, "
        "each one counting coins and bills as they make their way back to zero. "
        "Scientific data overlay with iridescent teal grid lines. "
        "The cruel mathematical beauty of a system working exactly as programmed."
    ),
  },

  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "fullbleed",
    "title": "SEU CÉREBRO\nTEM UM LIMITE\nPROGRAMADO.",
    "body": (
        "Neurologistas chamam de zona de conforto financeira.\n\n"
        "Quando o dinheiro passa do número programado, o cérebro dispara alarme. "
        "Não é metáfora — é o sistema de sobrevivência tratando abundância como ameaça.\n\n"
        "O mesmo circuito que te salva do fogo te salva do dinheiro."
    ),
    "prompt": (
        "A detailed cross-section of the human brain with one specific neural region "
        "pulsing bright crimson red as golden coins approach it — "
        "like an alarm system triggering in real time. "
        "Electric crimson warning signals radiating outward from the alarm region "
        "through the neural pathways. "
        "A human figure stands inside the luminous brain visualization, "
        "touching the alarm region with an expression of dawning horror and recognition. "
        "Iridescent gold neural circuits throughout the brain structure. "
        "Deep violet scientific background. The survival mechanism exposed as both "
        "protector and captor."
    ),
  },

  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "VOCÊ MESMO\nÉ QUEM\nPUXA O FREIO.",
    "body": (
        "Aqui é onde dói.\n\n"
        "Você não está sendo sabotado por outra pessoa.\n\n"
        "Está sendo sabotado por uma versão de você criada antes de "
        "você saber escrever o nome — e ela age antes de você ter tempo de pensar."
    ),
    "prompt": (
        "A human figure in two simultaneous versions occupying the same space — "
        "the adult moving forward with visible determination and purpose, "
        "while a younger ghostly version of the exact same person grips the adult's "
        "ankle from below, pulling backward with electric purple ancestral memory light. "
        "The child figure is not malicious — terrified, protective. "
        "The two versions of the same body in conflict. "
        "Expression on adult face: recognition of something that cannot be denied. "
        "The invisible force that was always there, finally visible. "
        "Psychedelic iridescent crimson and violet shadows."
    ),
  },

  # ── S6 — ESPELHO ── tensão RECONHECIMENTO
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "VOCÊ JÁ\nFEZ ISSO\nSEM PERCEBER.",
    "body": (
        "Recusou uma oportunidade por 'falta de tempo'.\n\n"
        "Gastou o extra em algo desnecessário na mesma semana em que juntou.\n\n"
        "Adiou a conversa que poderia mudar sua situação financeira.\n\n"
        "Não foi preguiça. Foi o termostato empurrando de volta pro número que ele conhece."
    ),
    "prompt": (
        "A cracked mirror showing the same adult person in multiple fragmented reflections "
        "— each shard revealing a different moment of financial self-sabotage: "
        "one fragment shows hands pushing away an opportunity, "
        "another shows impulsive spending at a store, "
        "a third shows a hand frozen above a phone before an important call. "
        "Cold silver-blue light fractured across all shards. "
        "The face in the central unbroken fragment looking directly forward with "
        "painful and absolute recognition. "
        "The pattern of an entire life finally made visible in one reflection."
    ),
  },

  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "TERMOSTATO\nTEM COMO\nRECALIBRAR.",
    "body": (
        "Não é questão de força de vontade.\n\n"
        "Não é questão de disciplina.\n\n"
        "É questão de acessar o lugar onde o limite foi gravado "
        "e reescrever a frequência. "
        "Quando o termostato muda, o dinheiro para de ir embora sozinho."
    ),
    "prompt": (
        "The same weathered thermostat from earlier — but now luminous gentle hands "
        "are recalibrating it upward with ease. "
        "The dial moving freely and smoothly for the first time, glowing gold. "
        "New luminous numbers appearing in electric gold where the frozen setting was. "
        "The banknote fragments that were orbiting at a distance now drifting closer, "
        "being drawn in and staying. "
        "Deep violet background. "
        "The movement is quiet and earned, not dramatic — "
        "the mechanism finally working the way it was supposed to. "
        "A human figure watching the recalibration with calm recognition."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "O DINHEIRO\nNUNCA FOI\nO PROBLEMA.",
    "body": (
        "O problema estava no lugar de dentro onde o dinheiro é permitido ficar.\n\n"
        "Quando esse lugar muda, você para de expulsar o que entra.\n\n"
        "Comente FONTE se você já sentiu que, de algum jeito, "
        "faz questão de se livrar do dinheiro — mesmo sem querer."
    ),
    "prompt": (
        "A human figure with the chest open and radiating pure golden light outward — "
        "not in shadow, but in full luminous expansion. "
        "The center of the body as a magnetic field that now attracts instead of repels. "
        "Golden coins and banknotes drifting toward the figure and staying, "
        "orbiting gently close to the body. "
        "Sacred geometry emerging from the chest cavity in electric gold. "
        "Deep violet and iridescent magenta background. "
        "The body finally in alignment with abundance. "
        "Both scientific and sacred in equal measure. "
        "Expression of quiet earned peace."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "DÁ PRA\nMUDAR O\nTERMOSTATO.",
    "body": (
        "Existe um protocolo sonoro que vai direto no sistema que gravou o limite.\n\n"
        "Não é meditação. Não é afirmação positiva.\n\n"
        "É frequência que opera no nível onde a decisão foi tomada — "
        "antes do pensamento consciente. O resultado: o dinheiro começa a ficar."
    ),
    "prompt": (
        "Sound waves rendered as living luminous light — "
        "electric teal and gold frequencies entering a translucent human body. "
        "Inside the body, the neural circuits that were pulsing crimson alarm "
        "are transforming to deep gold in real time as the sound reaches them. "
        "A neural reset visible as a cascade of light rewriting the alarm pathways "
        "from the inside out. "
        "Electric cyan sound waves expanding outward from a resonating source. "
        "Deep violet background. "
        "The body receiving a frequency like a key entering a lock that has been closed "
        "since childhood — something finally opening from within."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de recalibrar o seu termostato "
        "financeiro e parar de expulsar o dinheiro antes de você perceber "
        "— usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A radiant column of pure golden light descending from top to bottom of frame "
        "in absolute cosmic darkness. The light has weight and temperature — "
        "gold and electric magenta intertwined like ascending DNA helices. "
        "At the center: a human figure with arms open wide, body dissolved into the "
        "golden column, finally receiving. "
        "The thermostat from earlier visible in the lower periphery, "
        "dial set high, glowing gold. "
        "Sacred geometry spirals burning in electric gold in the surrounding void. "
        "Golden coins and banknotes orbit the column like planets drawn home. "
        "Psychedelic iridescent border of deep violet and cyan framing everything. "
        "The portal is open. The body said yes."
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
            with urllib.request.urlopen(req, timeout=120) as r:
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
