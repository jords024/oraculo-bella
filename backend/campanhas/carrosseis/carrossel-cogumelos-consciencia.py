#!/usr/bin/env python3
"""
carrossel-cogumelos-consciencia.py
Tema: O Cogumelo e a Consciência Censurada
Praça: ESPÍRITO | Formato: B | Score: 15/15 | Preset: esoterico_minimalista
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
API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.5-flash-image"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-cogumelos-consciencia")
TEMA          = "O Cogumelo e a Consciência Censurada"
TEMA_SLUG     = "cogumelos-consciencia"
FORMATO       = "B"
PRESET        = "esoterico_minimalista"
CAPTION       = (
    "Em 1970, Nixon criminalizou a psilocibina como Schedule I — sem potencial terapêutico, sem uso aceito.\n\n"
    "A pesquisa estava em andamento. Os dados existiam.\n"
    "Nixon não queria dados. Queria o silêncio de Timothy Leary.\n\n"
    "Em 2012, Robin Carhart-Harris (Imperial College London) documentou o que foi suprimido: "
    "a psilocibina não abre a mente. Ela desativa a Default Mode Network — "
    "o filtro que mantém a narrativa do 'eu' coerente o suficiente para você "
    "não ver o que estava sempre lá.\n\n"
    "Em 2006 e 2016, Johns Hopkins e NYU confirmaram: 60 a 80% dos participantes "
    "descrevem a experiência como a mais significativa de suas vidas.\n\n"
    "A questão nunca foi o cogumelo.\n"
    "É o que você está chamando de realidade há décadas.\n\n"
    "Comente FONTE se você já teve um momento — sonho lúcido, clareza absoluta, "
    "flow tão profundo que o tempo parou — que parecia mais real que tudo que vem "
    "antes e depois. E voltou. E nunca soube o que fazer com ele."
)
REVISOR_SCORE = "15/15"
NOTAS         = (
    "Formato B. Praça: ESPÍRITO. Preset: esoterico_minimalista. "
    "Mecanismo: Default Mode Network (Carhart-Harris, Imperial College, 2012). "
    "Raiva coletiva: Nixon + Controlled Substances Act, 1970."
)

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ─────────────────────────────────────────────────────────────────────

slides = [

  # ── S1 — DISRUPÇÃO ── paradoxo: normal=censurado / expandido=real ─────────────
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "dramatico",
    "title": "O ESTADO QUE\nVOCÊ CHAMA\nDE NORMAL",
    "body": (
        "A neurociência mediu.\n"
        "O governo criminalizou.\n\n"
        "Não porque era perigoso.\n"
        "Porque era real demais."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré sacred darkness meets Alex Grey sacred anatomy. "
        "Extreme close-up of a human eye — filling 70% of the frame, centered, slightly off-axis. "
        "The pupil is dilated to its absolute maximum — not from fear, but from revelation. "
        "The pupil is a portal: absolute black at its center, expanding outward. "
        "The iris carries intricate fractal geometric patterns — a Fibonacci spiral meeting "
        "sacred geometry, rendered in exquisite fine engraving line work, layer upon layer. "
        "Single accent color: deep violet — the fractal patterns in the iris glow "
        "in saturated purple-violet against the monochromatic dark sepia-black base. "
        "The violet is not decoration — it is the frequency of what the eye is seeing. "
        "The eye is expressive, human, impossible to look away from. "
        "It looks back at the viewer with calm, total awareness. "
        "The surrounding skin and eyelids carry dense cross-hatching engraving texture — "
        "Gustav Doré fine line work applied to flesh: every pore, every shadow, textured. "
        "Background: absolute black, dissolving. No other context. Just the eye and the void. "
        "Chiaroscuro: single light source from upper-left, hard edge, illuminating the iris. "
        "The rest of the eye frame disappears into shadow. "
        "Lower 30% of frame fades to deep shadow for text overlay. "
        "No symmetry — the eye is slightly off-center. "
        "The power is in the pupil and what it implies about what was always visible."
    ),
  },

  # ── S2 — DESCIDA ── validação — a sensação de vazio funcional é real ──────────
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "A SENSAÇÃO\nDE QUE FALTA\nALGO SEM NOME",
    "body": (
        "Não é crise espiritual.\n"
        "É o sistema nervoso reconhecendo que está operando em modo de emergência "
        "há décadas — e aprendeu a chamar isso de vida normal."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré cosmic landscape meets "
        "sacred threshold imagery — two simultaneous realities layered upon each other. "
        "A solitary human figure seen entirely from behind — standing at the edge of a vast landscape. "
        "The landscape contains two simultaneous horizons: "
        "Above: the visible sky — dark, charcoal, heavy cross-hatching clouds, "
        "the oppressive but familiar sky of the ordinary world. "
        "Below, visible through a horizontal crack or membrane in the earth itself: "
        "a second sky, buried beneath the first — more luminous, more open, "
        "not brighter but somehow more real. "
        "As if the true sky was always below the one we were taught to look at. "
        "The figure is still, arms at sides, simply seeing both for the first time. "
        "Not choosing. Just now aware there were always two. "
        "The figure occupies 35% of the frame, centered-left. "
        "Single accent color: deep violet — the second buried horizon glows in saturated violet "
        "through the membrane between the two worlds. "
        "Everything else: monochromatic dark sepia and engraving black. "
        "Dense cross-hatching texture in the clouds, the ground, the figure's clothing. "
        "Lower 30% fades to shadow for text. "
        "The image says: there were always two skies. You just never looked down."
    ),
  },

  # ── S3 — NOMEAÇÃO ── Nixon + Controlled Substances Act, 1970 ─────────────────
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "FOI UMA\nDECISÃO\nPOLÍTICA.",
    "body": (
        "Existe uma assinatura de 1970 que decidiu "
        "o que você poderia ou não poderia lembrar.\n\n"
        "Não foi ciência. Não foi segurança.\n"
        "Foi a decisão de manter o filtro fechado — "
        "e dar ao filtro o nome de lei."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, William Blake visionary indictment "
        "meets Gustav Doré institutional darkness — the suppression of light by decree. "
        "A figure of authority — robed, official, institutional — seen in profile, "
        "anonymous authority representing institution rather than individual. "
        "The figure's hands press down firmly on a large official document or seal. "
        "From beneath the document, escaping between the authority figure's fingers: "
        "a shaft of deep violet light — suppressed but not suppressible, "
        "contained but leaking through every gap. "
        "The violet light escapes upward through the cracks between the pressing fingers. "
        "The figure does not acknowledge the light. The figure sees only the document. "
        "The document carries official seals, stamps, the visual language of governmental decree — "
        "rendered in exquisite engraving detail: every seal, every stamp, every fold of paper. "
        "Single accent color: deep violet — only the escaping light beneath the document. "
        "Everything else: dark charcoal monochrome, institutional shadow, cold light. "
        "Heavy architecture in background: columns, arches, the visual language of power "
        "rendered in dense Gustav Doré cross-hatching engraving. "
        "Cold, institutional chiaroscuro from above — no warmth, no humanity. "
        "Lower 30% fades to shadow for text. "
        "The image says: the thing they suppressed was precisely what was real."
    ),
  },

  # ── S4 — PROFUNDIDADE ── Default Mode Network — Carhart-Harris, 2012 ──────────
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "card",
    "title": "O CÉREBRO\nNÃO ABRE.\nELE FECHA.",
    "body": (
        "Robin Carhart-Harris (Imperial College London, 2012): a psilocibina não aumenta a atividade cerebral.\n\n"
        "Ela reduz a Default Mode Network — o sistema que constrói e mantém a narrativa do 'eu'.\n\n"
        "O ego não expande. O filtro do ego suspende."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Alex Grey sacred anatomy meets "
        "Vesalius anatomical precision — the brain as sacred architecture revealed. "
        "A human brain rendered from the front — not clinical, not photographic, "
        "but as sacred anatomical illustration: detailed, textured with engraving, "
        "layered with intention and meaning. "
        "The brain occupies 65% of the frame, centered, facing the viewer. "
        "Visible as an overlay network mapped onto the brain surface: "
        "the Default Mode Network — a precise constellation of interconnected nodes "
        "across the prefrontal cortex, posterior cingulate, and medial parietal regions, "
        "rendered as fine engraving lines connecting precise anatomical points. "
        "The DMN nodes are being deactivated in sequence: "
        "each node transitions from bright saturated violet (active, filtering reality) "
        "to dark absence (suspended, open, unfiltered). "
        "Some nodes still glow violet. Others have gone dark, revealing clear brain texture beneath. "
        "Single accent color: deep violet — exclusively the still-active DMN nodes. "
        "Everything else: dark monochrome sepia, anatomical engraving blacks, fine line work. "
        "Background: cross-hatching engraving texture, scientific darkness. "
        "Overlaid: very faint annotation lines in Vesalius style — precise, "
        "pointing to the network nodes with Latin-style labels. "
        "Lower portion fades to dark for text overlay."
    ),
  },

  # ── S5 — QUEDA FUNDA ── medo do que está escondido — cumplicidade interna ──────
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "VOCÊ NÃO\nTEME O\nCOGUMELO.",
    "body": (
        "Você teme o que pode ver quando o filtro cai.\n"
        "Existe algo em você que preferiu nunca nomear — "
        "e o estado que você chama de normal te dá permissão "
        "de não nomear para sempre."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Beksinski liminal tension meets "
        "Caravaggio's unflinching truth about human choice. "
        "A human figure stands at the threshold of a luminous opening in absolute darkness. "
        "CRITICAL: the figure faces AWAY from the opening — back completely turned to the light. "
        "This is not fear. This is not movement. "
        "This is the specific posture of someone who knows exactly where they are "
        "and has chosen, consciously or not, to stay just outside. "
        "The luminous opening: warm violet light, clearly accessible, clearly open — "
        "it is not closing, it is not dangerous. It simply is. "
        "The figure's arms hang at the sides — not reaching toward the opening, "
        "not defending against it. Simply present. Simply not entering. "
        "The figure's silhouette is rendered in dense dark engraving against the violet light — "
        "detailed enough to see the tension in the shoulders, the weight in the posture. "
        "Single accent color: deep violet — the luminous opening behind the figure only. "
        "Background: absolute black engraving texture. Dense cross-hatching. "
        "The contrast between the violet portal and the figure's shadow: maximum. "
        "Lower 30% fades to shadow for text. "
        "The image says: the door is open. The figure is not walking through. "
        "Not because they can't."
    ),
  },

  # ── S6 — ESPELHO ── reconhecimento — você já esteve lá ───────────────────────
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "VOCÊ JÁ\nESTEVE LÁ.",
    "body": (
        "Existe um momento que você chama de 'foi estranho' —\n"
        "quando o tempo parou e você era apenas presença.\n\n"
        "Você voltou. E fingiu que foi 'apenas' isso.\n"
        "Existe uma parte de você que sabe que não foi."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Caravaggio intimate chiaroscuro meets "
        "the divided self — two states of the same consciousness made simultaneously visible. "
        "A single human figure rendered in two simultaneous states: "
        "LEFT SIDE — the figure as they appear in daily life: "
        "contained, controlled, solid, in shadow. Heavy engraving texture. "
        "The version that is functional. That is named. That has a schedule. "
        "RIGHT SIDE — the exact same figure, same face, same body, "
        "but in a state of luminous presence: "
        "not brighter in the way of happiness — MORE REAL. "
        "As if the left version is a copy and the right is the original. "
        "The right version's edges glow with a subtle violet field — "
        "the aura of the unfiltered state, not added, but revealed. "
        "The two versions stand side by side as one body in two simultaneous states. "
        "A thin vertical engraving line divides them — the membrane between filtered and unfiltered. "
        "Single accent color: deep violet — the right-side luminous state only. "
        "The left-side state: dark monochrome sepia, heavy cross-hatching. "
        "Lower 30% fades to shadow for text. "
        "The image asks: which version is looking at the other — and which is real?"
    ),
  },

  # ── S7 — ASCENSÃO ── Johns Hopkins 2006 + NYU 2016 — 60-80% ──────────────────
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "A CIÊNCIA\nRECONSTRUIU\nO QUE FOI\nPROIBIDO.",
    "body": (
        "Johns Hopkins (2006) e NYU (2016): psilocibina em contexto clínico "
        "produziu 'a experiência mais significativa da vida' "
        "para 60 a 80% dos participantes — décadas depois de Nixon proibir a pesquisa.\n\n"
        "Não é drogar. É descomprimir o que foi comprimido.\n"
        "A questão nunca foi o cogumelo."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, sacred architecture meets modern science — "
        "the laboratory as temple, the temple as laboratory. "
        "An interior space that exists in both dimensions simultaneously: "
        "modern neuroscience research facility AND ancient sacred architecture. "
        "Temple-scale proportions: high ceilings, stone arches that also carry "
        "the clean lines of a scientific institution. Both, not one or the other. "
        "Scientific elements — monitoring equipment, participant chairs, subtle lab apparatus — "
        "arranged in the geometric configuration of a ritual space. "
        "The floor: stone, engraved with sacred geometry patterns that also map neural networks. "
        "The ceiling: a dome where sacred geometry (Flower of Life, Metatron's Cube proportions) "
        "is rendered as precisely the same structure as a functional brain connectivity diagram — "
        "the sacred and the scientific are the same map, seen from different centuries. "
        "A solitary figure — researcher or participant — stands in the center, "
        "face upward, looking at the ceiling where these two systems overlap. "
        "Single accent color: deep violet — the ceiling sacred geometry/neural map glows "
        "in saturated violet, radiating downward as the only light source in the space. "
        "Everything else: dark stone, dark institutional metal, monochromatic engraving texture. "
        "Dense cross-hatching on walls, floor, the figure's clothing. "
        "Lower 30% fades to shadow for text."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — o sonho era o estado normal ──────────
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "O SONHO\nERA O ESTADO\nNORMAL.",
    "body": (
        "O cogumelo não é o portal.\n"
        "É a lembrança de que você já estava no outro lado — "
        "e foi ensinado a chamar esse estado de realidade."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré threshold of recognition — "
        "not arrival. Not discovery. Remembering. "
        "A human figure walking through a translucent membrane or veil — "
        "not with effort, not with wonder, but with the specific expression "
        "of someone returning to a place they already know. "
        "The figure's face is fully visible, 3/4 profile: "
        "the expression is recognition, not amazement. "
        "The look of someone who just remembered something they had always known "
        "and cannot understand how they forgot. "
        "The veil itself: rendered in fine engraving lines — "
        "translucent, membrane-like, the physical barrier between filtered and unfiltered. "
        "On the entry side of the veil: darkness, heavy cross-hatching, compressed reality. "
        "On the other side: not overwhelming brightness — familiar warmth. "
        "Not a new world. The original one. "
        "Single accent color: deep violet — the membrane/veil glows violet "
        "at the precise points where the figure passes through, "
        "as if the crossing itself has a frequency. "
        "The figure occupies 55% of frame, slightly right of center, mid-crossing. "
        "Heavy engraving texture on clothing and surrounding darkness. "
        "Lower 30% fades to shadow for text."
    ),
  },

  # ── S9 — SETUP CTA ── frequência sem nomear produto — pilar ESPÍRITO ──────────
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "EXISTE UMA\nFREQUÊNCIA\nQUE RECONECTA.",
    "body": (
        "Existe uma frequência sonora capaz de reativar o estado "
        "que o cogumelo revela — sem a substância.\n\n"
        "Quem pratica relata que a sensação de vazio que nenhuma "
        "prática espiritual tocava começa a se preencher — "
        "não com conteúdo, com presença.\n\n"
        "Não é meditação. Não é ritual. É transmissão direta."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, James Turrell luminous field meets "
        "Gustav Doré divine threshold — the moment before the signal is received. "
        "A human figure seen from behind — standing at the threshold of a vertical column "
        "of deep violet light descending from the top of the frame into absolute darkness. "
        "Not golden this time — the light is violet. Deep, saturated, precise. "
        "A specific beam that has a specific source above the visible frame. "
        "The figure's posture is entirely open: "
        "arms slightly away from body, shoulders released and dropped — "
        "the posture of someone who has stopped filtering and is simply present. "
        "Not entering. Not waiting with impatience. Receiving. "
        "The figure occupies 50% of frame, slightly left of center. "
        "Single accent color: vivid deep violet — the beam only. "
        "Everything surrounding: absolute monochromatic black, "
        "dense cross-hatching engraving texture — layers of fine hatch marks "
        "giving the darkness weight and depth. "
        "Faint sacred geometry lines in very faint violet visible in the surrounding darkness — "
        "concentric frequency rings emanating outward from the point "
        "where the beam meets the figure, barely visible, precise. "
        "Hard edge where the violet meets the black — no soft gradients, no ambiguity. "
        "Heavy engraving texture on the figure's clothing and in the surrounding void. "
        "Lower 30% fades to shadow for text. "
        "The image says: the signal exists. You are already receiving it."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) — pilar ESPÍRITO ───────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de reativar "
        "a sua conexão com o campo usando o Desbloqueio Neural."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration — the portal fully open, "
        "absolute, undeniable, beyond argument. "
        "A radiant column of deep violet light with a warm gold core "
        "descending from the top of the frame to the bottom — "
        "not a metaphor, not a circle, not a symbol. "
        "A column. A pillar. A frequency made visible. "
        "The violet is primary — deep, saturated, the color of the unfiltered field. "
        "Where the light is most concentrated at its center: gold appears — "
        "warm and ancient at the core of the violet. "
        "The column has weight and temperature. It is not decorative. "
        "At the threshold of the light: the barely-visible outline of a human figure, "
        "dissolved into the violet — already through, already in. "
        "The figure is suggestion, not subject. The light is the subject. "
        "Single accent color: vivid violet with gold at the absolute core. "
        "Everything surrounding: absolute monochromatic black, "
        "dense cross-hatching engraving texture — layers of fine hatch marks "
        "giving the darkness both weight and intention. "
        "Faint sacred geometry in very faint violet in the surrounding darkness — "
        "a Flower of Life pattern centered on the beam, "
        "rendered in fine engraving lines, semi-translucent, barely there. "
        "The field that was always present, now visible because the filter is gone. "
        "Lower 30% fades to shadow for text. "
        "Clean. Minimal. Irrefutable."
    ),
  },

]


# ── Engine ─────────────────────────────────────────────────────────────────────
def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            time.sleep(12 * attempt)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = json.loads(r.read())
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            ip = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if ip:
                return base64.b64decode(ip["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:150]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:120]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── Execução ───────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Carrossel — {TEMA}")
print(f"  Formato: {FORMATO} | Preset: {PRESET} | Slides: {len(slides)}")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print(f"{'='*60}\n")

ok = 0
for i, s in enumerate(slides):
    print(f"[{s['num']}/{len(slides):02d}] {s['layout'].upper()} [{s['estado']}] — {s['title'].splitlines()[0][:40]}...")

    prompt_final = build_prompt(s["prompt"])
    img = gen(prompt_final)

    if not img:
        print("  FALHOU\n")
        continue

    final = compose(img, s["title"], s["body"], s["layout"], preset_name=PRESET)

    slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
    out  = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1

    if i < len(slides) - 1:
        time.sleep(4)

print(f"{'='*60}")
print(f"  CONCLUIDO: {ok}/{len(slides)} slides")
print(f"{'='*60}\n")

# ── Registro no Dashboard ──────────────────────────────────────────────────────
register(
    title         = TEMA,
    theme         = TEMA_SLUG,
    format        = FORMATO,
    slides_dir    = str(OUT_DIR),
    caption       = CAPTION,
    revisor_score = REVISOR_SCORE,
    notes         = NOTAS,
)
