#!/usr/bin/env python3
"""
carrossel-dinheiro-que-foge.py — O Dinheiro que Foge
Método Jordânico | Praça: ALAVANCA | Formato B
Tema: Memória de escassez — o corpo que expulsa abundância
Modelo: OpenAI gpt-image-1
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

# ── CONFIGURACAO ───────────────────────────────────────────────────────────────
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MODEL      = "gpt-image-2"
ENDPOINT   = "https://api.openai.com/v1/images/generations"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-dinheiro-que-foge")
TEMA          = "O Dinheiro que Foge"
TEMA_SLUG     = "dinheiro-que-foge"
FORMATO       = "B"
CAPTION       = (
    "Sabe quando você finalmente junta um dinheirinho e do nada o carro quebra, "
    "a geladeira queima, aparece uma dívida surpresa?\n\n"
    "Chega a parecer brincadeira. Mas o nome disso não é azar.\n\n"
    "É o seu próprio corpo expulsando o dinheiro.\n\n"
    "Toda vez que você tá quase saindo do buraco, o seu sistema nervoso entra "
    "em curto-circuito e dá um jeito de você gastar ou se sabotar.\n\n"
    "Não é falta de inteligência. Não é falta de esforço. É pura biologia.\n\n"
    "Comente FONTE e eu te envio o reset sonoro que desfaz esse padrão.\n\n"
    "#dinheiro #abundancia #bloqueiofinanceiro #fonteoculta #desbloqueiomental "
    "#escassez #mentalidadefinanceira #espiritualidade #consciencia #manifestacao"
)
REVISOR_SCORE = "14/15"
NOTAS         = "Formato B. Humanização máxima — especificidade cotidiana. Geladeira, dia 15, ônibus lotado."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [

  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "O DINHEIRO\nQUE SOME\nSEMPRE.",
    "body": (
        "Sabe quando você finalmente junta um dinheirinho, e do nada "
        "o carro quebra, a geladeira queima ou aparece uma dívida surpresa?\n\n"
        "Chega a parecer brincadeira. Mas o nome disso não é azar."
    ),
    "prompt": (
        "A person's hands desperately grasping at golden coins and banknotes "
        "that are exploding outward in all directions like a supernova — "
        "money disintegrating into glowing fragments as it escapes. "
        "The hands reach but cannot hold. Cosmic crimson and electric gold. "
        "Shattered refrigerator and broken car silhouettes dissolving "
        "into a swirling vortex of escaping wealth. "
        "Deep violet void at the center. Expression of stunned recognition."
    ),
  },

  # ── S2 — DESCIDA ── tensão BAIXA — validação
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "TEM ALGO\nMUITO ERRADO\nNESSA CONTA.",
    "body": (
        "A gente cresce ouvindo que dinheiro honesto é suado. "
        "Que tem que ralar muito.\n\n"
        "Mas repara: quem mais trabalha, quem acorda às 5h e pega "
        "ônibus lotado... é quem menos tem."
    ),
    "prompt": (
        "A lone worker figure at 5am on a crowded bus — exhausted, dignified, "
        "carrying the weight of the world on their shoulders. "
        "Golden sweat and labor energy radiating from the figure "
        "but flowing away from them, upward toward unseen others. "
        "Indigo pre-dawn sky through the bus window. "
        "Iridescent teal and gold. The equation is visibly broken — "
        "more effort, less result. The body knows something is wrong."
    ),
  },

  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "SEU CORPO\nEXPULSA\nO DINHEIRO.",
    "body": (
        "É sério. Toda vez que você tá quase saindo do buraco, "
        "o seu sistema nervoso entra em curto-circuito "
        "e dá um jeito de você gastar ou se sabotar."
    ),
    "prompt": (
        "Human nervous system rendered as luminous electric pathways — "
        "the entire body visible as a network of firing neural circuits. "
        "Golden coins and banknotes are being actively ejected outward "
        "from the chest cavity like an electromagnetic defense response. "
        "Electric crimson and neon gold. The body is the mechanism. "
        "Short-circuit sparks where money touches the nervous system. "
        "The body betraying the mind in vivid psychedelic detail."
    ),
  },

  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "fullbleed",
    "title": "POR QUE\nISSO\nACONTECE?",
    "body": (
        "Sua família passou por tanto perrengue lá atrás, "
        "que o seu cérebro gravou a escassez como o único lugar seguro.\n\n"
        "Você aprendeu a ser especialista em sobreviver."
    ),
    "prompt": (
        "A human brain cross-section glowing with ancestral memory imprints — "
        "layered epigenetic trauma visible as sediment rings inside neural tissue. "
        "Ghost figures of past generations embedded within the brain structure, "
        "their scarcity written in the very architecture of the cortex. "
        "Deep cosmic purple brain matter. Gold synaptic firing pathways. "
        "Electric teal scientific overlay showing DNA strands merging with neural maps. "
        "The past living inside the present in vivid biological detail."
    ),
  },

  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "A POBREZA\nSEU CORPO\nJÁ SABE AGUENTAR.",
    "body": (
        "Ter dinheiro, pra você, é um território desconhecido.\n\n"
        "E o cérebro morre de medo do que ele não conhece. "
        "Ele prefere te puxar de volta pra estaca zero, "
        "porque a pobreza... ah, a pobreza o seu corpo já sabe como aguentar."
    ),
    "prompt": (
        "A figure standing at the threshold between two worlds — "
        "on one side a radiant golden landscape of abundance, "
        "on the other the familiar darkness of survival. "
        "Invisible luminous chains pulling the figure backward into the shadow. "
        "The person reaches toward the gold but their body resists, "
        "frozen at the boundary between known and unknown. "
        "The chains are not iron but memory, glowing with electric purple. "
        "The face shows terrible recognition: the fear is inside, not outside."
    ),
  },

  # ── S6 — ESPELHO ── tensão RECONHECIMENTO
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "DIA 15.\nCONTANDO\nMOEDA DE NOVO.",
    "body": (
        "É por isso que você tem essa sensação horrível "
        "de estar sempre patinando.\n\n"
        "Você se esforça o mês inteiro, e no dia 15 já tá contando moeda "
        "de novo. Não é falta de inteligência sua — é pura biologia."
    ),
    "prompt": (
        "Close-up of a person counting silver coins on a table at night — "
        "mid-month exhaustion visible in every line of their face. "
        "The face reflected in the scattered coins, fragmented and multiplied. "
        "A calendar on the wall shows the number 15. "
        "Cold electric blue-silver light. Iridescent fatigue. "
        "The whole month of effort dissolving into nothing. "
        "Recognition of a familiar trap. The same scene. Again."
    ),
  },

  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "SEGUNDO EMPREGO\nNÃO VAI\nRESOLVER.",
    "body": (
        "Enquanto essa memória de escassez estiver grudada aí dentro de você, "
        "o dinheiro vai continuar batendo na sua porta e indo embora.\n\n"
        "A raiz do problema não é o seu salário."
    ),
    "prompt": (
        "A figure standing before a massive luminous tree whose roots "
        "grow downward through the floor into layered ancestral soil — "
        "the roots are crystallized scarcity memories glowing electric purple. "
        "Golden money flows toward the figure like water "
        "but the roots redirect it underground before it can be held. "
        "The person sees the root mechanism for the first time — "
        "eyes wide with dawning clarity. Gold and deep violet. "
        "The problem has a name. It lives underground."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "O CICLO QUEBRA\nQUANDO SEU CORPO\nACEITA A GRANA.",
    "body": (
        "E isso você não resolve lendo livro de finanças.\n\n"
        "Você resolve limpando essa sujeira que ficou no seu sistema."
    ),
    "prompt": (
        "A human figure shedding layers of crystallized fear — "
        "scarcity programming dissolving from the body like breaking obsidian shells, "
        "each fragment dissolving into radiant golden light as it falls away. "
        "The figure underneath luminous, expanded, inhabiting full potential. "
        "Radiant gold and electric magenta. "
        "Sacred geometry emerging from the dissolving shells. "
        "Not explosion but quiet earned transformation. "
        "The body finally accepting what it once rejected."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "DÁ PRA\nDESPROGRAMAR\nESSE SUSTO.",
    "body": (
        "Existe um padrão sonoro que funciona como um reset.\n\n"
        "Ele desliga esse alarme de emergência do seu cérebro "
        "e faz ele finalmente aceitar a abundância em paz, de primeira.\n\n"
        "Não é meditação. Não é afirmação. É protocolo."
    ),
    "prompt": (
        "Sound waves rendered as visible living light — "
        "acoustic frequencies entering a human figure as luminous teal and gold ripples. "
        "The nervous system visible inside the body: "
        "scarcity pathways in crimson being overwritten by abundance frequencies in gold "
        "in real time. Neural reset. Brain lighting up in new configurations. "
        "Electric cyan sound waves. Deep violet background. "
        "The body receiving the frequency like a key entering a long-locked door — "
        "something closed since childhood finally opening."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de limpar a memória de escassez "
        "do seu sistema e parar de expulsar o dinheiro da sua vida — "
        "usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A radiant column of pure golden light descending from top to bottom of frame "
        "in absolute cosmic darkness. The light has weight and temperature — "
        "gold and electric magenta intertwined like DNA helices. "
        "At the center: a barely-visible human figure dissolved into the light, "
        "arms open, body finally receiving abundance. "
        "Sacred geometry spirals and fractals burning in electric gold in the surrounding void. "
        "Golden coins and banknotes orbit the column like planets drawn inward. "
        "Psychedelic iridescent border of deep violet and cyan framing the gold. "
        "The portal is open. The body said yes."
    ),
  },
]


# ── Engine OpenAI gpt-image-1 ─────────────────────────────────────────────────
def gen(prompt: str, retries: int = 3) -> bytes | None:
    payload = json.dumps({
        "model":   MODEL,
        "prompt":  prompt,
        "n":       1,
        "size":    "1024x1536",
        "output_format": "jpeg",
    }).encode()

    for attempt in range(retries):
        if attempt:
            time.sleep(10 * attempt)
        req = urllib.request.Request(
            ENDPOINT,
            data=payload,
            headers={
                "Authorization":  f"Bearer {OPENAI_KEY}",
                "Content-Type":   "application/json",
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
                # URL mode — baixa a imagem
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
