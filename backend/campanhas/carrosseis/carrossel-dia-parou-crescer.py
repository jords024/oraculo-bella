#!/usr/bin/env python3
"""
carrossel-dia-parou-crescer.py — O Dia que Você Parou de Crescer
Método Jordânico | Praça: MENTE | Formato B
Tema: Janela 0-7 anos — decisão gravada em frequência theta antes de você saber falar
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

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-dia-parou-crescer")
TEMA          = "O Dia que Você Parou de Crescer"
TEMA_SLUG     = "dia-parou-crescer"
FORMATO       = "B"
CAPTION       = (
    "Em algum momento antes dos 7 anos, num momento que você provavelmente nem lembra, "
    "uma decisão foi tomada sobre o quanto você pode ter.\n\n"
    "E você construiu uma vida inteira em cima da conclusão de uma criança.\n\n"
    "Não é fraqueza. Não é falta de disciplina.\n\n"
    "É que o cérebro de 0 a 7 anos opera em frequência theta — o mesmo estado de hipnose. "
    "Não tem filtro. Tudo que entra vira verdade absoluta.\n\n"
    "Terapia trabalha com a história.\n"
    "Esse protocolo vai à frequência onde o momento foi gravado.\n\n"
    "Comente FONTE e eu te envio o que atualiza a decisão da criança.\n\n"
    "#bloqueiomental #fonteoculta #desbloqueiomental #infancia #epigenetica "
    "#consciencia #crescimento #mentalidade #espiritualidade #manifestacao"
)
REVISOR_SCORE = "15/15"
NOTAS         = "Formato B. Janela theta 0-7 anos. Campo eletromagnetico cardiaco. Decisao pre-consciente."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [

  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "UMA CRIANÇA\nDE 6 ANOS\nDECIDE POR VOCÊ.",
    "body": (
        "Você tem planos. Tem clareza. Sabe exatamente o que precisa fazer.\n\n"
        "E toda vez que está perto de conseguir — trava.\n\n"
        "Não é falta de disciplina. É que a decisão foi tomada "
        "antes de você saber contar dinheiro."
    ),
    "prompt": (
        "A determined adult figure walking forward on a luminous cosmic path — "
        "but a small transparent child figure stands directly in front "
        "with arms stretched wide, blocking the way. "
        "The child is made of electric violet and gold ancestral memory light, "
        "semi-transparent and glowing. "
        "The adult cannot pass — not because the child is an enemy "
        "but because the child is afraid and the adult cannot see why. "
        "Psychedelic deep violet and iridescent gold background. "
        "The adult's face shows confusion and frustrated recognition. "
        "The paradox made flesh: you and the one who stops you are the same person."
    ),
  },

  # ── S2 — DESCIDA ── tensão BAIXA — validação
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "VOCÊ TRAVOU\nANTES DE\nSABER FALAR.",
    "body": (
        "Toda criança que cresce num ambiente de tensão com dinheiro "
        "chega numa conclusão antes dos 7 anos.\n\n"
        "Um momento específico. Uma cena. "
        "Uma frase que não era pra chegar nos seus ouvidos — e chegou.\n\n"
        "Seu sistema gravou: esse é o limite do que é seguro ter."
    ),
    "prompt": (
        "A child of approximately 5 years old sitting alone on the floor in a dimly lit room — "
        "adult silhouettes arguing as blurred figures visible through a half-open door behind them. "
        "The child is completely still, wide-eyed, absorbing everything. "
        "Luminous recording lines flow visibly from the scene through the air "
        "and into the child's chest and nervous system — the moment being written into biology. "
        "Warm amber lamplight from one side, cold shadow from the other. "
        "Nobody noticed the child was recording. Nobody noticed the decision being made. "
        "Intimate and quietly devastating."
    ),
  },

  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "DE 0 A 7:\nA JANELA\nQUE GRAVOU TUDO.",
    "body": (
        "Neurocientistas documentaram que até os 7 anos o cérebro opera "
        "em frequência theta — o mesmo estado da hipnose.\n\n"
        "Não existe filtro. Não existe questionamento.\n\n"
        "Tudo que entra nessa janela é gravado como verdade absoluta. "
        "Incluindo o que o dinheiro significa na sua família."
    ),
    "prompt": (
        "A child's brain in cross-section with slow luminous theta waves moving "
        "through the neural tissue — deep purple oscillating waves, hypnotic and slow. "
        "Family scenes, emotional charges, overheard conversations flowing directly "
        "into the brain architecture as glowing imprints with zero resistance. "
        "Scientific frequency overlay showing the theta brainwave signature in electric teal. "
        "No filter barrier visible — the brain completely open and unprotected. "
        "The vulnerability of the early mind made visible as both beautiful and disturbing. "
        "Cosmic deep violet background with gold neural pathway details."
    ),
  },

  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "fullbleed",
    "title": "O CAMPO\nDA SUA CASA\nJÁ DECIDIU.",
    "body": (
        "O coração humano gera um campo eletromagnético que se estende "
        "90 centímetros além do corpo.\n\n"
        "Numa casa com frequência de escassez, seu sistema nervoso calibrou "
        "nessa frequência antes de você entender o que era dinheiro.\n\n"
        "Não foi ensinado. Foi transmitido."
    ),
    "prompt": (
        "A family gathered around a dinner table — each person emitting visible "
        "electromagnetic heart fields as concentric luminous waves extending "
        "90 centimeters from the chest in gold and teal. "
        "All the individual fields overlap and merge in the space between people. "
        "A small child sits at the center of the table, their own small heart field "
        "beginning to mirror and calibrate to the family's collective frequency. "
        "Scientific biological visualization: beautiful, intimate, and quietly terrifying. "
        "Nobody chose this. It happened like breathing. "
        "Deep violet and iridescent gold tones throughout."
    ),
  },

  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "UMA CRIANÇA\nCONCLUIU.\nVOCÊ CARREGA.",
    "body": (
        "Você não chegou nessa conclusão com 30 anos.\n\n"
        "Uma criança de 5 anos, num momento que ela não conseguia "
        "processar de outro jeito, decidiu:\n\n"
        "\"Esse é o limite do que eu mereço.\"\n\n"
        "E você construiu uma vida inteira sem questionar a decisão dela."
    ),
    "prompt": (
        "An adult figure walking through life with a small glowing child figure "
        "carried on their back — not as a heavy burden but as an invisible anchor "
        "made of crystallized memory light in electric violet, "
        "that shapes every step and limits every stride forward. "
        "The child is luminous, not malicious — just fixed in a moment long past. "
        "The adult's face shows the specific exhaustion of someone who never knew "
        "what they were carrying and has just now realized. "
        "The invisible made finally and completely visible. "
        "Psychedelic crimson and violet shadows. Gold accents."
    ),
  },

  # ── S6 — ESPELHO ── tensão RECONHECIMENTO
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "VOCÊ LEMBRA.\nMAS NÃO SABE\nQUE LEMBRA.",
    "body": (
        "Tem uma cena.\n\n"
        "Um jantar que ficou em silêncio. "
        "Uma briga que você fingiu não estar ouvindo. "
        "Uma frase que não era pra chegar nos seus ouvidos — e chegou.\n\n"
        "Você gravou tudo.\n\n"
        "E desde esse dia, você age como se aquela cena "
        "ainda estivesse acontecendo."
    ),
    "prompt": (
        "Extreme close-up of an adult's eyes looking directly at the viewer — "
        "but inside each pupil, reflected in perfect miniature detail, "
        "is a specific ordinary childhood scene: a kitchen at night, a tense silence, "
        "a child pretending not to hear an argument. "
        "The past and present coexisting in the same gaze. "
        "The adult is living in the present but seeing the world through a child's eyes. "
        "Iridescent violet and teal reflected light. "
        "Intimate and unsettling — the memory that never announced itself as a memory. "
        "The realization visible in real time."
    ),
  },

  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "DÁ PRA\nATUALIZAR\nA DECISÃO.",
    "body": (
        "A conclusão foi gravada em frequência theta.\n\n"
        "Pra sobrescrever, você precisa acessar a mesma frequência — "
        "não com força de vontade, não com análise, "
        "não com mais sessões de terapia.\n\n"
        "Com um protocolo que opera no nível onde a decisão foi tomada.\n\n"
        "Quando a gravação original muda, o teto some."
    ),
    "prompt": (
        "The childhood recording scene from slide 2 — but now being reprocessed "
        "in real time. The original memory visible in sepia and muted tones on one side. "
        "Overlaid on top of it, radiant golden light actively rewriting the recording — "
        "new luminous neural pathways burning bright gold "
        "where the old scarcity pathways were etched. "
        "The child in the scene visibly releasing the weight of a decision she carried alone. "
        "Not erasing the past — updating the file. "
        "A human figure witnessing the transformation with expression of profound relief. "
        "Electric gold and deep violet. The original recording changing."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "VOCÊ NÃO\nTRAVOU.\nFOI PROTEGIDO.",
    "body": (
        "O sistema que gravou o limite não é um inimigo.\n\n"
        "É uma criança que fez o melhor que podia com o que tinha.\n\n"
        "Agora você pode fazer o que ela não conseguia: "
        "avisar que mudou. Que é seguro ir além.\n\n"
        "Comente FONTE se você sente que existe um teto invisível "
        "— e nunca soube de onde ele veio."
    ),
    "prompt": (
        "An adult and a small child standing face to face — not in conflict "
        "but in full mutual recognition and release. "
        "The child reaching upward, the adult reaching downward, "
        "their hands meeting in the center in a gesture of reconciliation. "
        "Between them: a field of golden light where the old limit used to be, "
        "now completely dissolved. "
        "The child releasing the adult with love and visible relief. "
        "Both figures luminous and expanded — the adult finally free, "
        "the child finally understood. "
        "Sacred geometry forming between their joined hands. "
        "Deep violet background with electric gold and iridescent magenta. "
        "Sacred and deeply human."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "O PROTOCOLO\nVAI DIRETO\nAO MOMENTO.",
    "body": (
        "Terapia trabalha com a história do que aconteceu.\n\n"
        "Este protocolo vai à frequência onde o momento foi gravado.\n\n"
        "É sonoro. Não precisa que você se lembre. "
        "Não precisa que você entenda. "
        "O sistema nervoso recebe, reconhece, e atualiza.\n\n"
        "O teto some. Não de repente — de dentro."
    ),
    "prompt": (
        "Sound waves descending in distinct visible layers through a translucent human body — "
        "passing first through the cortex at the top glowing gold, "
        "then through the luminous limbic system in the center, "
        "then reaching all the way down to the ancient brainstem "
        "where the earliest recordings live. "
        "Electric teal and gold frequencies illuminating the exact "
        "deep primitive region where the childhood decision was stored. "
        "The place terapia could never reach — now reached. "
        "The brainstem region lighting up gold as the sound frequency arrives. "
        "Deep violet background. The protocol arriving at the source."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de acessar o momento "
        "onde seu limite foi gravado e atualizar a decisão da criança "
        "— usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A radiant golden column of light descending from top to bottom of frame "
        "in absolute cosmic darkness. "
        "Gold and electric magenta intertwined like ascending helices of light. "
        "At the center: a child and an adult fused into one luminous single figure "
        "with arms open wide, inhabiting the same body in complete peace — "
        "the limit dissolved, the separation healed. "
        "Sacred geometry spirals burning in electric gold throughout the surrounding void. "
        "Deep violet and cyan framing the golden column like a cosmic crown. "
        "The portal between what was recorded and what is possible standing fully open. "
        "Psychedelic iridescent borders. The old ceiling no longer exists."
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
