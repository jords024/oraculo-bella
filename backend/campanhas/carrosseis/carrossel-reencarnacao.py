#!/usr/bin/env python3

import os

from dotenv import load_dotenv

load_dotenv()
os.environ["PYTHONIOENCODING"] = "utf-8"
"""
Carrossel - Jesus Ensinou Reencarnacao
Tema: DEUS | Angulo 02 | Formato B — Violacao de Autoridade + Conhecimento Suprimido
Curva: ⚡🔥🔥🔥💡💡💡🔓🔓🚪
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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-reencarnacao")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides — Copy + Prompts ──────────────────────────────────────────────────
slides = [

  # ── 01 ⚡ CHOQUE — Cover fullbleed ────────────────────────────────────────
  {
    "num": "01", "layout": "fullbleed",
    "title": (
      "JESUS ENSINOU REENCARNAÇÃO.\n"
      "ISSO FOI REMOVIDO DA BÍBLIA\n"
      "EM 553 D.C."
    ),
    "body": (
      "O maior escândalo da história do Cristianismo\n"
      "não foi uma heresia.\n"
      "Foi uma decisão política."
    ),
    "prompt": build_prompt(
      "Ancient sacred manuscript open on a dark stone altar, "
      "central pages being violently torn away from the binding — "
      "blazing golden sacred light erupts from within the torn pages, "
      "the suppressed truth impossible to extinguish. "
      "Fire and ash at the torn edges, the golden light more brilliant than the destruction surrounding it. "
      "Dramatic contrast: violence of institutional removal versus inextinguishable sacred knowledge. "
      "Deep black, amber gold light from within, cold grey ash and shadow outside. "
      "The book is ancient, the wound is deliberate"
    ),
  },

  # ── 02 🔥 O homem que eles queimaram — card ───────────────────────────────
  {
    "num": "02", "layout": "card",
    "title": (
      "O HOMEM QUE ELES\n"
      "QUEIMARAM"
    ),
    "body": (
      "Orígenes de Alexandria. Maior teólogo\n"
      "dos primeiros 3 séculos do Cristianismo.\n"
      "\n"
      "Ele ensinou que todas as almas existem antes do nascimento\n"
      "e passam por múltiplas vidas até o retorno completo a Deus.\n"
      "\n"
      "Em 553 d.C., o Imperador Justiniano convocou\n"
      "o Segundo Concílio de Constantinopla.\n"
      "\n"
      "Orígenes foi condenado como herege.\n"
      "Seus livros foram queimados."
    ),
    "prompt": build_prompt(
      "Massive controlled bonfire of ancient sacred scrolls and illuminated manuscripts, "
      "countless golden-paged books consumed by cold blue-white institutional flames. "
      "A single intact parchment scroll spirals upward through the dark smoke, "
      "still burning at the edges but its sacred calligraphy still visible, still glowing. "
      "The destruction is systematic, deliberate, cold — not accidental. "
      "Cold institutional flames versus the warm golden light of the illuminated pages fighting to survive. "
      "Deep black background, the bonfire as the only light source, "
      "the surviving scroll as the only gold against the cold fire"
    ),
  },

  # ── 03 🔥 A pergunta que Jesus nao deveria ter respondido — fullbleed ──────
  {
    "num": "03", "layout": "fullbleed",
    "title": (
      "A PERGUNTA QUE JESUS\n"
      "NÃO DEVERIA TER\n"
      "RESPONDIDO"
    ),
    "body": (
      "João 9:1-2 — Os discípulos perguntam sobre um cego de nascença:\n"
      "\n"
      "\"Mestre, quem pecou — este homem ou seus pais —\n"
      "para que nascesse cego?\"\n"
      "\n"
      "Como alguém poderia pecar antes de nascer,\n"
      "se não houvesse uma vida anterior?\n"
      "\n"
      "Jesus não corrigiu a premissa.\n"
      "Ele respondeu a pergunta."
    ),
    "prompt": build_prompt(
      "Ancient parchment scroll fragment dramatically lit from within — "
      "the aged paper glows with golden amber light as if the words themselves are luminous. "
      "Ancient Aramaic calligraphy flows across the surface in organic dark lines against the illuminated parchment. "
      "A single symbolic question mark motif forms organically from the aged text patterns and scroll edges. "
      "The scroll is partially unrolled, revealing only a fragment of the larger truth. "
      "Deep black surrounds the illuminated fragment. "
      "The texture is detailed — worn, authentic, ancient. "
      "The light source is from within the text, not from outside"
    ),
  },

  # ── 04 🔥 Elias ja veio — card ────────────────────────────────────────────
  {
    "num": "04", "layout": "card",
    "title": (
      "\"ELIAS JÁ VEIO,\n"
      "E NÃO O RECONHECERAM\""
    ),
    "body": (
      "Mateus 17:12-13.\n"
      "\n"
      "Jesus fala sobre Elias — e os discípulos entendem\n"
      "que ele se referia a João Batista, já morto.\n"
      "\n"
      "João Batista era Elias reencarnado.\n"
      "\n"
      "O texto está no cânone até hoje.\n"
      "Ninguém ensina isso."
    ),
    "prompt": build_prompt(
      "Two translucent human silhouettes occupying the same physical space simultaneously — "
      "one ancient figure in flowing Middle Eastern robes, one ancient figure in desert prophet garments, "
      "both overlapping perfectly, both bathed in identical luminous amber-gold light. "
      "A vertical sacred timeline of golden light connects the two eras behind them. "
      "The two souls are clearly the same essence expressed in two different lives — "
      "same posture, same light signature, different time. "
      "Deep black, luminous amber-gold, sense of eternal continuity of consciousness"
    ),
  },

  # ── 05 💡 Por que foi removido — fullbleed ────────────────────────────────
  {
    "num": "05", "layout": "fullbleed",
    "title": (
      "POR QUE FOI REMOVIDO"
    ),
    "body": (
      "Reencarnação é subversiva para uma instituição de poder.\n"
      "\n"
      "Se a alma tem infinitas chances → o medo do inferno perde a força.\n"
      "Se você acessa memórias de outras vidas → não precisa de intermediários.\n"
      "Se o aprendizado é progressivo → a autoridade se torna dispensável.\n"
      "\n"
      "A doutrina foi alterada para criar dependência.\n"
      "Não para proteger a verdade."
    ),
    "prompt": build_prompt(
      "Heavy ancient iron chains wrapped tightly around an open sacred book, "
      "golden luminous sacred light bursting with enormous pressure through every gap between the chain links — "
      "the suppressed truth impossible to fully contain, "
      "light escaping in brilliant rays from every point of weakness in the chains. "
      "The chains represent institutional control — cold, mechanical, deliberate. "
      "The escaping golden light represents unkillable sacred knowledge. "
      "The book is ancient and sacred, the chains are cold metal and modern in spirit. "
      "Deep black background, dramatic contrast: cold iron versus blazing gold"
    ),
  },

  # ── 06 💡 O que nao conseguiram queimar — card ────────────────────────────
  {
    "num": "06", "layout": "card",
    "title": (
      "O QUE NÃO\n"
      "CONSEGUIRAM QUEIMAR"
    ),
    "body": (
      "• Evangelho de Tomé (Nag Hammadi, 1945):\n"
      "  \"Se não recordais de onde viestes,\n"
      "  não sabereis para onde irdes\"\n"
      "\n"
      "• Pistis Sophia: ciclos de encarnação\n"
      "  descritos explicitamente\n"
      "\n"
      "• Manuscritos do Mar Morto:\n"
      "  múltiplas vidas nos Essênios —\n"
      "  a seita de Jesus"
    ),
    "prompt": build_prompt(
      "Hidden underground chamber carved in ancient stone, "
      "sealed clay jars and carefully rolled papyrus scrolls arranged on carved stone shelves "
      "in perfect preservation — the Nag Hammadi discovery aesthetic. "
      "A single warm amber torch-light illuminates the chamber from within, "
      "revealing intact manuscripts that survived every attempt at destruction. "
      "The chamber is silent, protected, waiting. "
      "Dust particles float in the golden light. "
      "Cold ancient stone against warm preserved knowledge. "
      "The manuscripts glow with their own quiet internal light. "
      "Sacred archaeology — the hiding place that outlasted the empire that sought to destroy it"
    ),
  },

  # ── 07 💡 O que nao fecha sem reencarnacao — fullbleed ────────────────────
  {
    "num": "07", "layout": "fullbleed",
    "title": (
      "O QUE NÃO FECHA\n"
      "SEM REENCARNAÇÃO"
    ),
    "body": (
      "• Por que nascemos em circunstâncias tão diferentes\n"
      "  se Deus é justo?\n"
      "• Por que uma única vida decide uma eternidade?\n"
      "• O que significa \"colher o que semear\"\n"
      "  se a semente foi plantada em outra vida?\n"
      "• Por que Jesus chama João Batista de Elias?\n"
      "\n"
      "A reencarnação resolve o paradoxo da justiça divina.\n"
      "A ausência dela cria contradições que ninguém responde."
    ),
    "prompt": build_prompt(
      "Cosmic scales of divine justice suspended alone in infinite black space — "
      "one side holds a single luminous human soul: small, fragile, glowing gold, precious. "
      "The other side holds the immense cold weight of eternity: dark, vast, imposing. "
      "The scales are locked in impossible perfect balance — "
      "the mathematical paradox of divine fairness made visible. "
      "Ancient Egyptian sacred scale aesthetic merged with cosmic scale. "
      "The soul glows as the only warm light in the composition. "
      "Deep black cosmic space, gold for the soul, cold silver-grey for eternity's weight"
    ),
  },

  # ── 08 🔓 O que muda quando voce aceita isso — card ───────────────────────
  {
    "num": "08", "layout": "card",
    "title": (
      "O QUE MUDA QUANDO\n"
      "VOCÊ ACEITA ISSO"
    ),
    "body": (
      "Você para de se ver como um acidente.\n"
      "Você para de se culpar por ter nascido onde nasceu.\n"
      "\n"
      "Cada desafio vira aprendizado escolhido pela alma.\n"
      "Cada encontro significativo vira um reencontro.\n"
      "\n"
      "Deus não é um juiz.\n"
      "É um campo de evolução que você atravessa\n"
      "por amor — não por medo."
    ),
    "prompt": build_prompt(
      "Single human figure shown in profound liberation — "
      "standing fully upright with arms slightly open, "
      "golden amber light radiating outward from the heart center in expanding concentric rings. "
      "The figure's posture communicates not triumph but quiet recognition — "
      "the moment of remembering, not achieving. "
      "The golden light feels earned, ancient, returning rather than new. "
      "Sacred geometry pattern forms subtly in the light waves expanding from the heart. "
      "Deep black background, the human as the sole light source, "
      "the liberation quiet and profound rather than dramatic"
    ),
  },

  # ── 09 🔓 Voce nao esta aqui pela primeira vez — fullbleed ────────────────
  {
    "num": "09", "layout": "fullbleed",
    "title": (
      "VOCÊ NÃO ESTÁ AQUI\n"
      "PELA PRIMEIRA VEZ"
    ),
    "body": (
      "Você carrega memórias que não sabe que tem.\n"
      "Medos sem explicação nessa vida.\n"
      "Amores instantâneos.\n"
      "Talentos que vieram sem treino.\n"
      "\n"
      "Isso tem nome. Tem história. Tem registros.\n"
      "\n"
      "E foi exatamente isso que eles\n"
      "não queriam que você soubesse."
    ),
    "prompt": build_prompt(
      "Vertical cosmic timeline extending from deep below to infinite above, "
      "multiple translucent human silhouettes at different points along it — "
      "ancient Egyptian, medieval, Renaissance, modern — "
      "all connected by the same continuous unbroken golden thread of consciousness "
      "running through each incarnation like a luminous spine. "
      "Same soul, different garments, different eras, same essential light. "
      "The golden thread is continuous — never cut, never ending. "
      "Each silhouette casts the same essential shadow. "
      "Deep black cosmic space, amber gold thread of eternal consciousness, "
      "the soul's journey across centuries made visible"
    ),
  },

  # ── 10 🚪 PORTAL — fullbleed ──────────────────────────────────────────────
  {
    "num": "10", "layout": "fullbleed",
    "title": (
      "COMENTE FONTE\n"
      "AQUI EMBAIXO"
    ),
    "body": (
      "E eu te mando o material completo —\n"
      "incluindo as passagens sobre reencarnação\n"
      "que ainda estão na Bíblia\n"
      "e ninguém ensina."
    ),
    "prompt": build_prompt(
      "Ancient stone archway portal standing alone in infinite cosmic darkness, "
      "overwhelming warm golden-amber sacred light pouring with tremendous force "
      "through the arch from the eternal other side. "
      "Sacred geometry patterns carved deeply into the arch stones, glowing faintly gold. "
      "A single human silhouette seen from behind — "
      "standing small but perfectly upright at the threshold, "
      "on the verge of stepping through into the light. "
      "The figure stands with quiet dignity and recognition — not fear, not urgency. "
      "This is not death — it is remembering. "
      "Deep black space on this side, blazing golden eternity on the other. "
      "The portal is an invitation, ancient and patient"
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
print("  Carrossel — Jesus Ensinou Reencarnacao")
print("  Tema: DEUS | 10 slides | Formato B")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print("="*60 + "\n")

ICONS = {
    "01": "[CHOQUE]",
    "02": "[CONFRONTO]", "03": "[CONFRONTO]", "04": "[CONFRONTO]",
    "05": "[REVELACAO]", "06": "[REVELACAO]", "07": "[REVELACAO]",
    "08": "[DESBLOQUEIO]", "09": "[DESBLOQUEIO]",
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
        print(f"  FALHOU — slide {num} nao gerado\n")
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
register(
    title         = "Jesus Ensinou Reencarnacao — Isso Foi Removido da Biblia em 553 d.C.",
    theme         = "reencarnacao-553",
    format        = "B",
    slides_dir    = str(OUT_DIR),
    caption       = (
        "Jesus ensinou reencarnacao. Isso foi removido da Biblia em 553 d.C. "
        "Nao como heresia — como decisao politica do Imperador Justiniano. "
        "Comente FONTE aqui embaixo e eu te mando o material completo, "
        "incluindo as passagens que ainda estao no canone e ninguem ensina."
    ),
    revisor_score = "15/15",
    notes         = (
        "Formato B (Violacao de Autoridade + Conhecimento Suprimido). "
        "Tema DEUS — Angulo 02. 10 slides. "
        "Mecanismo: Violacao de Autoridade + Conhecimento Suprimido + Custo Silencioso. "
        "Curva: CHOQUE > CONFRONTO x3 > REVELACAO x3 > DESBLOQUEIO x2 > PORTAL. "
        "Slides principais: Origenes queimado, Joao 9:1, Elias=Joao Batista, "
        "Concilio 553 d.C., Nag Hammadi, paradoxo da justica divina. "
        "Arte gerada com gemini-2.0-flash-preview-image-generation (Nano Banana 2)."
    ),
)
