#!/usr/bin/env python3
"""
carrossel-igreja-mais-rica.py — A Mais Rica do Planeta te Ensinou Isso
Método Jordânico | Praça: SISTEMA | Formato B
Tema: O Vaticano — institução mais rica do mundo pregou pobreza para o povo
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

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-igreja-mais-rica")
TEMA          = "A Mais Rica do Planeta te Ensinou Isso"
TEMA_SLUG     = "igreja-mais-rica"
FORMATO       = "B"
CAPTION       = (
    "A instituição com maior patrimônio estimado do mundo te ensinou que dinheiro é perigoso.\n\n"
    "O Vaticano possui entre €10 e €15 bilhões em ativos conhecidos. "
    "Mais de 5.000 imóveis em Roma. Banco próprio. Portfólio de arte incalculável.\n\n"
    "E a mensagem oficial?\n\n"
    "Pobreza é sagrada. Dinheiro é tentação.\n\n"
    "Separar Deus da Igreja não é heresia. É clareza.\n\n"
    "Quando você separa a fé genuína da doutrina que serviu ao sistema, "
    "a culpa financeira perde o chão.\n\n"
    "Comente FONTE e eu te envio o protocolo que faz essa separação.\n\n"
    "#vaticano #igreja #dinheiro #fonteoculta #bloqueiofinanceiro "
    "#prosperidade #fe #desbloqueiomental #sistemafinanceiro #consciencia"
)
REVISOR_SCORE = "15/15"
NOTAS         = "Formato B. Vaticano €10-15bi. Agostinho séc. IV. Maior proprietário de terras medieval. Praça SISTEMA."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [

  # ── S1 — DISRUPÇÃO ── tensão MÁXIMA
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "A MAIS RICA\nDO PLANETA\nTE ENSINOU ISSO.",
    "body": (
        "A instituição com maior patrimônio do mundo te ensinou "
        "que dinheiro é perigoso.\n\n"
        "E você acreditou.\n\n"
        "Enquanto ela acumulava."
    ),
    "prompt": (
        "A grand cathedral or basilica with impossibly ornate gold architecture — "
        "vaulted ceilings with gold leaf, priceless art on every wall, "
        "marble floors reflecting divine light. "
        "The extreme opulence rendered in breathtaking detail. "
        "From the front of this golden palace, a beam of light projects outward "
        "toward a small humble human figure far below — "
        "the figure stands in plain darkness, empty hands outstretched. "
        "Above the cathedral: institutional authority. "
        "Below: the person who received the message. "
        "The unspoken architecture of the arrangement, finally visible. "
        "Crimson and gold, deep atmospheric shadows."
    ),
  },

  # ── S2 — DESCIDA ── tensão BAIXA — validação
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "VOCÊ DOOU.\nELA GUARDOU.\nVOCÊ APRENDEU.",
    "body": (
        "Não foi coincidência.\n\n"
        "Foi arquitetura.\n\n"
        "Um sistema onde você produz escassez e eles administram abundância — "
        "e ambos chamam isso de virtude."
    ),
    "prompt": (
        "Two scenes in one frame, separated by a line of light: "
        "On the upper half — vast institutional vaults and treasure rooms, "
        "gold artifacts and wealth accumulating behind heavy doors. "
        "On the lower half — humble hands dropping a coin into a collection box, "
        "the coin falling upward into the vault above. "
        "A human figure in the lower portion looking up with the dawning realization "
        "that the movement of value has always gone one direction. "
        "The word VIRTUDE in muted parchment tones connecting both halves — "
        "the same word meaning opposite things to each side of the divide."
    ),
  },

  # ── S3 — NOMEAÇÃO ── tensão MÉDIA-ALTA
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "O VATICANO\nVALE MAIS\nDO QUE VOCÊ.",
    "body": (
        "O Vaticano possui entre €10 e €15 bilhões em ativos conhecidos.\n\n"
        "Mais de 5.000 imóveis em Roma. Portfólio de arte incalculável. Banco próprio.\n\n"
        "E a mensagem oficial?\n\n"
        "Pobreza é sagrada. Dinheiro é tentação."
    ),
    "prompt": (
        "A balance scale — one side holding the Vatican in miniature: "
        "St. Peter's Basilica, golden art, stacked real estate tiles, a bank seal — "
        "all gleaming gold, heavy, the scale tilting deeply toward it. "
        "The other side of the scale holds a single humble human figure — "
        "small, the scale lifted high by the weight differential. "
        "Above the tilted scale: the phrase POBREZA É SAGRADA in crimson light. "
        "A dramatic contrast between the institutional reality and the taught message. "
        "Dark atmospheric background with crimson and gold lighting."
    ),
  },

  # ── S4 — PROFUNDIDADE ── tensão INTELECTUAL
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "fullbleed",
    "title": "A DOUTRINA\nDE POBREZA\nTEM HISTÓRIA.",
    "body": (
        "No século IV, Agostinho de Hipona consolidou a teologia da renúncia.\n\n"
        "Na Idade Média, a Igreja era o maior proprietário de terras da Europa.\n\n"
        "A pobreza como virtude foi codificada no momento exato "
        "em que a acumulação máxima era necessária.\n\n"
        "Não foi coincidência."
    ),
    "prompt": (
        "A historical timeline rendered as glowing crimson and gold layers — "
        "at the bottom layer: 4th century Roman architecture with a scholar writing theology, "
        "the words of renunciation taking shape in inked parchment. "
        "Above it: medieval maps of Europe with vast church landholdings glowing gold. "
        "The two layers superimposed: doctrine being written in the exact moment "
        "when land accumulation was at its peak. "
        "A human figure standing before the layered history with the look of someone "
        "connecting dots for the first time. "
        "The architecture of historical coordination made visible."
    ),
  },

  # ── S5 — QUEDA FUNDA ── tensão EMOCIONAL mais funda
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "VOCÊ INTERNALIZOU\nO QUE ERA\nPRO OUTRO.",
    "body": (
        "A doutrina de pobreza não era para eles.\n\n"
        "Era para você.\n\n"
        "E ela não ficou na Igreja. Ficou dentro de você — "
        "como uma voz que diz que querer muito é pecado, "
        "que cobrar o justo é ganância, "
        "que prosperar é traição a quem você ama."
    ),
    "prompt": (
        "A human figure with a ghostly institutional shadow merged into their chest — "
        "the cathedral silhouette overlaid on the person's body, "
        "becoming indistinguishable from their own interior. "
        "The doctrine no longer external — now internal, speaking in first person. "
        "From the figure's own mouth: crimson sound waves carrying the doctrine "
        "as if it were a personal belief. "
        "The face shows recognition of the voice as borrowed, not original. "
        "The horror of finding an intruder who has been living as resident. "
        "Deep violet and crimson atmosphere."
    ),
  },

  # ── S6 — ESPELHO ── tensão RECONHECIMENTO
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "A VOZ QUE\nVOCÊ ACHA\nQUE É SUA.",
    "body": (
        "Sente culpa quando cobra o que vale.\n\n"
        "Sente que prosperidade é coisa de gente materialista.\n\n"
        "Sente que espiritualidade e dinheiro não combinam.\n\n"
        "Essa voz não nasceu com você.\n\n"
        "Foi instalada."
    ),
    "prompt": (
        "A human figure looking directly forward — face showing recognition. "
        "Behind their head, slightly translucent: the cathedral architecture, "
        "the institutional shadow from which the voice comes. "
        "Between the figure and the viewer: the words CULPA, GANÂNCIA, TRAIÇÃO "
        "written in fading crimson — "
        "not as external accusations but as interior voices finally being seen from outside. "
        "The precise moment of realizing a thought you thought was yours "
        "was someone else's all along. "
        "The mirror of borrowed beliefs."
    ),
  },

  # ── S7 — ASCENSÃO ── tensão ESPERANÇA ESPECÍFICA
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "FÉ REAL\nNÃO PRECISA\nDE POBREZA.",
    "body": (
        "Separar Deus da Igreja não é heresia.\n\n"
        "É clareza.\n\n"
        "Quando você distingue a fé genuína da doutrina que serviu ao sistema, "
        "você pode ter as duas coisas:\n\n"
        "Conexão espiritual profunda. E abundância sem culpa."
    ),
    "prompt": (
        "A human figure standing at the point of separation — "
        "on one side: the cathedral institutional shadow, heavy, crimson, systematic. "
        "On the other side: pure divine light without architecture, "
        "direct connection between figure and luminous golden source — no intermediary. "
        "The figure's hands: one releasing the institutional shadow, "
        "the other open to the direct golden light. "
        "The face: not angry at what's released, but clear about what remains. "
        "Faith without the filter of doctrine. "
        "The distinction finally made."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — SEM CTA
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "A POBREZA\nNUNCA FOI\nSAGRADA.",
    "body": (
        "Foi conveniente.\n\n"
        "Quando você separa o que é fé do que é controle, "
        "a culpa financeira perde o chão.\n\n"
        "E o que fica é liberdade para ter, servir e expandir "
        "sem pedir desculpa por isso.\n\n"
        "Comente FONTE se você sente que sua espiritualidade e seu dinheiro "
        "sempre estiveram em guerra."
    ),
    "prompt": (
        "A human figure standing in full golden light — "
        "the cathedral shadow completely dissolved, "
        "ash and parchment fragments of old doctrine drifting away to the sides. "
        "What remains: the figure, and direct divine light. Gold, warm, abundant, free. "
        "In one hand: a glowing symbol of genuine faith — light without walls. "
        "In the other hand: gold coins flowing freely, received without apology. "
        "The two no longer in conflict — both held with equal dignity. "
        "The resolution of a war that was never actually the person's war. "
        "Crimson and gold atmosphere, deep violet background."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "DÁ PRA\nSEPARAR\nAS DUAS.",
    "body": (
        "A confusão entre fé e pobreza não está no nível dos argumentos.\n\n"
        "Está na frequência onde a doutrina foi gravada — "
        "antes de você ter vocabulário para questionar.\n\n"
        "Existe uma frequência que dissolve a confusão nesse nível. "
        "Quando a separação acontece no campo, a culpa vai embora. "
        "E a fé fica — mais limpa do que nunca."
    ),
    "prompt": (
        "Two frequencies rendered as visible light waves — "
        "one in deep crimson (institutional doctrine) and one in pure gold (genuine faith). "
        "Inside a human body: the two frequencies entangled, impossible to distinguish. "
        "Then: a teal healing frequency entering the body and separating them — "
        "crimson moving to one side and dissolving, "
        "gold remaining and amplifying, purer and stronger than before. "
        "The untangling of what was always two separate things. "
        "Sacred geometry forming around the purified gold frequency. "
        "The body finally able to hold faith without the doctrine it was bundled with."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ───────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de separar a sua fé genuína "
        "da doutrina de pobreza — usando o Desbloqueio Neural."
    ),
    "prompt": (
        "A monumental golden portal standing free of any cathedral architecture — "
        "pure divine light forming the archway without institutional walls. "
        "A human figure stepping through with one hand open receiving gold coins "
        "and the other hand open in prayer simultaneously — "
        "both gestures honored, both flowing freely. "
        "Behind the figure: the institutional shadows, crimson doctrine, "
        "the cathedral silhouette all fallen away. "
        "Through the portal: pure golden abundance and direct divine light as one field. "
        "Sacred geometry spiraling in electric gold around the archway. "
        "Deep cosmic crimson and violet background with gold iridescent border. "
        "The portal where faith and prosperity are finally one."
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
