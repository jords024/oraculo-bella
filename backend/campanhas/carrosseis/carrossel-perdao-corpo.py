#!/usr/bin/env python3
"""
carrossel-perdao-corpo.py
Tema: O Perdão que Cura o Corpo
Praça: CORPO | Formato: B | Score: 15/15 | Preset: cinematografico_crimson
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

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-perdao-corpo")
TEMA          = "O Perdão que Cura o Corpo"
TEMA_SLUG     = "perdao-corpo"
FORMATO       = "B"
PRESET        = "cinematografico_crimson"
CAPTION       = (
    "O rancor que você carrega não pune quem te feriu.\n\n"
    "Pune o seu sistema imunológico.\n\n"
    "Janice Kiecolt-Glaser (Ohio State) passou décadas documentando "
    "o que acontece no corpo de quem vive em hostilidade crônica: "
    "elevação de IL-6 — a citocina associada a doenças cardiovasculares, "
    "diabetes e depressão.\n\n"
    "A cultura religiosa ensinou perdão como virtude.\n"
    "A autoajuda vendeu como libertação instantânea.\n"
    "Nenhuma entregou o mecanismo.\n\n"
    "Perdão não é o que você dá pra quem te feriu.\n"
    "É o que você para de fazer com o seu próprio corpo.\n\n"
    "Comente FONTE se existe alguém que você já tentou perdoar "
    "— e o rancor voltou — porque uma parte de você ainda sente "
    "que soltar seria perder."
)
REVISOR_SCORE = "15/15"
NOTAS         = "Formato B. Praça: CORPO. Preset: cinematografico_crimson. Mecanismo: IL-6 (Kiecolt-Glaser, Ohio State)."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ─────────────────────────────────────────────────────────────────────
# Prompts seguem estrutura 7-camadas do diretor-de-arte.md (800-2500 chars)
# Imagem cria TENSÃO com o texto — não o ilustra

slides = [

  # ── S1 — DISRUPÇÃO ── paradoxo: intenção de punir / único punido é você ──────
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "dramatico",
    "title": "VOCÊ AINDA\nESTÁ PAGANDO\nA CONTA.",
    "body": (
        "Você mantém o rancor para punir quem te feriu.\n"
        "A única pessoa sendo punida é você."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré meets Caravaggio chiaroscuro. "
        "Close-up 3/4 portrait of a human figure — head slightly bowed, jaw tense, "
        "eyes carrying the weight of years of unresolved grief. "
        "The face occupies 55% of the frame — expressive, detailed, deeply human. "
        "The viewer should feel they are looking at themselves. "
        "The figure's hands grip their own shoulders — holding on, not releasing — "
        "the gesture of self-imprisonment mistaken for self-protection. "
        "Single accent color: deep crimson red — emanating from the throat and chest area, "
        "as if the body itself is lit from within by inflammation, by the cost of carrying. "
        "The crimson is not blood. It is heat. It is the body paying a debt it never owed. "
        "The crimson glows against a monochromatic dark sepia-black base. "
        "Everything else is desaturated — dark charcoal, deep shadow, engraving blacks. "
        "Background: dense cross-hatched engraving texture, layers of hatch marks, "
        "the visual language of sacred illustration. "
        "Single Caravaggio spotlight from upper-left: hard edge, warm amber, zero fill. "
        "Light falls on the face and the glowing crimson chest — everything else dissolves. "
        "Heavy engraving texture on skin, hair, clothing, background. "
        "The lower 30% of frame fades to deep shadow for text. "
        "No symmetry. The face is slightly off-center. The gaze is downward, inward."
    ),
  },

  # ── S2 — DESCIDA ── validação — a dor foi real, fechar-se foi inteligente ────
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "VOCÊ NÃO\nESTAVA ERRADO\nEM SE FECHAR.",
    "body": (
        "O que aconteceu foi real. A dor foi real.\n"
        "Fechar-se foi inteligente — era o que o momento exigia.\n"
        "O problema não é que você sentiu. "
        "É quanto tempo o seu corpo ficou no modo de sentir."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Caravaggio tenderness meets sacred geometry. "
        "Close-up of a human figure — face in profile, eyes closed, expression of "
        "exhausted peace. Not happiness. Not sadness. The specific stillness after "
        "having survived something. "
        "The face and neck occupy 50% of the frame, slightly right of center. "
        "Single accent color: warm gold — a narrow beam of golden light falls "
        "precisely on the closed eyelid and the bridge of the nose. "
        "The gold is delicate, not triumphant. It is permission, not salvation. "
        "Everything else: dark sepia monochrome, deep engraving blacks. "
        "Background: dense engraving texture — layered hatch marks creating "
        "depth and texture in the darkness around the figure. "
        "A subtle overlay element: faint sacred geometry lines — thin, "
        "almost invisible, a partial Flower of Life pattern in the upper left corner, "
        "rendered in the faintest gold, semi-translucent, barely present. "
        "Chiaroscuro light from upper-right. Hard edge, zero fill. "
        "The lower 30% dissolves into deep shadow for text overlay. "
        "Heavy cross-hatching engraving texture throughout. "
        "The image says: your defense was real. It was necessary. "
        "That time is not now."
    ),
  },

  # ── S3 — NOMEAÇÃO ── raiva — quem ensinou perdão errado ──────────────────────
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "TE ENSINARAM\nPERDÃO ERRADO.",
    "body": (
        "A religião ensinou perdão como obrigação moral — algo que você deve ao outro.\n"
        "A autoajuda vendeu como libertação instantânea.\n"
        "Nenhuma disse que quem adoece com o rancor não é quem feriu. "
        "É quem guarda."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré biblical scale meets "
        "William Blake's visionary indictment of false authority. "
        "A robed religious or institutional figure seen from below — "
        "occupying 60% of the frame, towering, authoritative. "
        "The figure faces away or is seen in profile — anonymous authority, "
        "representing institution rather than individual. "
        "The figure's outstretched hand points downward toward the viewer — "
        "the gesture of moral obligation imposed. "
        "Single accent color: deep crimson — staining the figure's robes at the chest, "
        "spreading outward like a wound or like the cost of a lie told for centuries. "
        "The crimson is the color of the mechanism they kept hidden. "
        "Everything else: dark charcoal monochrome, deep engraving shadows. "
        "Background: architectural elements — arches, columns, institutional weight — "
        "rendered in dense cross-hatching engraving texture. "
        "The architecture is intact. It was never destroyed. That is the point. "
        "Chiaroscuro light from above — cold, institutional, not warm. "
        "Heavy engraving texture on robes, architecture, shadow areas. "
        "Lower 30% fades to pure shadow for text. "
        "The rage in this image is earned, specific, and directed."
    ),
  },

  # ── S4 — PROFUNDIDADE ── mecanismo — IL-6, anatomia sagrada inflamada ────────
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "card",
    "title": "A NEUROCIÊNCIA\nMEDIU.",
    "body": (
        "Janice Kiecolt-Glaser (Ohio State): hostilidade crônica eleva IL-6 "
        "— a citocina associada a doenças cardiovasculares, diabetes e depressão.\n\n"
        "O rancor não é uma postura emocional.\n"
        "É inflamação em andamento."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Alex Grey sacred anatomy meets "
        "Vesalius anatomical illustration style. "
        "A human torso — chest and upper body — rendered in the style of sacred anatomical "
        "illustration: skin made partially transparent, revealing the internal systems. "
        "The figure occupies 60% of the frame, centered, facing forward. "
        "The face is not shown — the body is the subject, not the person. "
        "Single accent color: deep crimson red — the cardiovascular system visible through "
        "the transparent chest, lit from within, glowing crimson. "
        "The crimson is not decorative — it is the inflammation made visible. "
        "The heart, arteries, and surrounding tissue glow with the specific red "
        "of tissue under sustained stress. "
        "The crimson intensifies at the heart and diffuses outward through blood vessels "
        "in a pattern that maps the cost of chronic hostility through the body. "
        "Everything else: dark monochrome sepia, engraving blacks, fine line anatomical detail. "
        "Background: dense cross-hatched engraving, dark, textured. "
        "Overlaid element: faint Latin anatomical notation style lines — fine, precise, "
        "pointing to the inflamed areas — in the style of Vesalius or Da Vinci anatomical sketches. "
        "Light: a clinical, cold single source from upper right — illuminating the body "
        "as a specimen being studied. "
        "Heavy engraving texture throughout. Lower portion fades to dark for text."
    ),
  },

  # ── S5 — QUEDA FUNDA ── cumplicidade interna — mantém o peso para ser testemunha
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "SOLTAR\nPARECE DIZER\nQUE ESTAVA\nCERTO.",
    "body": (
        "Então você segura.\n"
        "Porque soltar o rancor parece absolver quem te feriu "
        "— e uma parte de você ainda quer que o peso que carrega "
        "seja testemunha do que aconteceu.\n"
        "O seu sistema nervoso prepara o corpo para uma guerra que já terminou."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Beksinski surreal tension meets "
        "Caravaggio's unflinching human vulnerability. "
        "Close-up portrait of a human figure — face intense, jaw set, eyes focused "
        "on something that is no longer there. "
        "The expression is the specific face of someone who is still ready for a fight "
        "that ended years ago. Ready for someone who already left. "
        "The face occupies 60% of the frame. Expression: controlled fury mixed with exhaustion. "
        "Hands raised slightly into frame at the bottom — fists half-closed, "
        "the posture of combat in the absence of enemy. "
        "Single accent color: deep crimson — the fists and the tension in the jaw "
        "carry a crimson undertone, the color of sustained physiological stress. "
        "The crimson is subtle here — not bright, not triumphant. "
        "It is the color of a body that has been in state of war for too long. "
        "Background: dark void, cross-hatched engraving texture — "
        "no landscape, no enemy, nothing. The emptiness is the point. "
        "Chiaroscuro: single amber light from upper-left, hard edge. "
        "The darkness around the figure is absolute — heavy engraving blacks. "
        "Lower 30% fades to shadow for text. "
        "This is the most difficult image to make and to see: "
        "a person fighting alone in a room with no one in it."
    ),
  },

  # ── S6 — ESPELHO ── reconhecimento — você já tentou, o rancor voltou ─────────
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "VOCÊ JÁ\nTENTOU\nPERDOAR.",
    "body": (
        "Você repetiu que deixou pra lá.\n"
        "E o rancor voltou — porque perdoar sem entender o mecanismo "
        "é forçar o sistema nervoso a fingir que terminou "
        "algo que ele ainda registra como aberto.\n\n"
        "Existe uma parte de você que ainda espera justiça antes de soltar."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Caravaggio intimacy meets "
        "symbolic duality of the divided self. "
        "Close-up of a face partially reflected — one half of the face seen directly, "
        "the other half visible as a mirror reflection slightly misaligned. "
        "The two halves don't quite match: one looks forward, one looks back. "
        "This is the same person — but the two directions coexist simultaneously. "
        "The face occupies 65% of the frame. Expression on the direct half: "
        "wanting to release. Expression in the reflection: not yet ready. "
        "Single accent color: warm gold — the mirror surface glows faintly gold, "
        "the reflection is bathed in it. The direct face is in cool shadow. "
        "The gold says: the release is possible. The shadow says: not yet chosen. "
        "Background: dark engraving texture, the mirror edge visible as a vertical line "
        "dividing the frame — rendered in fine engraving lines. "
        "Chiaroscuro: one light source from upper-right illuminating the reflected side, "
        "leaving the direct face in shadow. "
        "Heavy cross-hatching throughout. The skin has engraving texture — not photographic. "
        "Lower 30% fades to shadow for text. "
        "The image forces the viewer to ask: which side am I looking from?"
    ),
  },

  # ── S7 — ASCENSÃO ── saída concreta — perdão como protocolo, não sentimento ──
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "fullbleed",
    "title": "PERDÃO NÃO\nÉ ABSOLVIÇÃO.\nÉ PROTOCOLO.",
    "body": (
        "Frederick Luskin (Stanford Forgiveness Project): perdão praticado como decisão "
        "deliberada — não como sentimento — reduz cortisol e interrompe o ciclo inflamatório.\n\n"
        "Você não precisa sentir que perdoou.\n"
        "Você não precisa falar com quem te feriu.\n"
        "Você precisa que o seu corpo saia do estado de guerra."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Alex Grey meets James Turrell — "
        "the body released from its own war, the mechanism of peace made visible. "
        "A human figure — upper body and face — in the act of releasing. "
        "Not collapse. Not weakness. The specific posture of a decision made: "
        "shoulders dropping, jaw unclenching, hands opening from fists. "
        "The face: eyes closed, expression of deliberate release — not emotional flooding, "
        "but the specific calm of a protocol being executed. "
        "The figure occupies 55% of frame. "
        "Single accent color: warm gold — radiating outward from the chest area "
        "where the crimson was in previous slides. "
        "The crimson is gone. The gold takes its place. "
        "The gold is not bright triumph — it is the specific warmth of inflammation subsiding. "
        "Background: dark engraving texture, but lighter than previous slides — "
        "the darkness is retreating, not dominating. "
        "Overlaid element: faint sacred geometry — a partial Metatron's Cube or Sri Yantra "
        "in very faint gold lines centered on the chest, semi-translucent, "
        "representing the body returning to its natural geometric order. "
        "Chiaroscuro: warm amber light now from upper-center — no longer oblique and hard, "
        "but slightly more open. The body receives the light differently now. "
        "Heavy engraving texture. Lower portion fades to shadow for text."
    ),
  },

  # ── S8 — CRISTALIZAÇÃO ── síntese pura — sem CTA ──────────────────────────────
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "O SEU CORPO\nNUNCA\nMENTIU.",
    "body": (
        "O rancor que você carrega não pune quem te feriu. Pune o seu sistema nervoso.\n\n"
        "O corpo sabe quanto você pagou. E o corpo sabe quando é hora de parar de pagar."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré divine light meets "
        "Alex Grey transcendental anatomy — the body after the decision. "
        "A human figure — full upper body, face tilted upward — "
        "in the specific posture of someone who has crossed a threshold. "
        "Not ecstasy. Not revelation. The quiet dignity of a decision carried through. "
        "The figure occupies 60% of the frame, slightly off-center. "
        "Face: eyes upward, expression of earned stillness — the specific peace "
        "of someone no longer at war with their own body. "
        "Single accent color: pure gold — a shaft of golden light descends "
        "from the upper frame onto the figure's upturned face and open chest. "
        "The gold is rich, warm, specific — the color of inflammation resolved, "
        "of cortisol dropped, of the body returning to its baseline. "
        "Around the figure: engraving darkness — but the darkness is not oppressive. "
        "It is the darkness that has always been there, made neutral by the choice. "
        "Overlaid element: faint golden frequency lines — thin, precise, "
        "radiating outward from the figure's heart in concentric arcs, "
        "the specific visual language of the body transmitting rather than withholding. "
        "Background: dense cross-hatching engraving, dark but textured with depth. "
        "The engraving texture on the figure's skin catches the gold. "
        "Lower 30% fades to pure shadow for text overlay. "
        "This is the crystallization: darkness present but not dominant, "
        "gold available and chosen, the body finally no longer paying someone else's debt."
    ),
  },

  # ── S9 — SETUP CTA ── urgência sem revelar produto ────────────────────────────
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "EXISTE UMA\nFREQUÊNCIA\nPARA ISSO.",
    "body": (
        "Existe uma frequência sonora capaz de liberar o sistema nervoso "
        "do estado inflamatório crônico.\n\n"
        "Quem pratica relata que o rancor que não cedia em anos "
        "se dissolve em horas.\n\n"
        "Não é meditação. Não é afirmação. É protocolo."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, James Turrell threshold light meets "
        "Gustav Doré divine intervention — the moment before the door opens. "
        "A human figure standing at the threshold of a narrow beam of warm golden light "
        "that descends from above into total absolute darkness. "
        "The figure is seen from behind — at the threshold, not yet through. "
        "The posture is open: shoulders released, arms slightly away from the body — "
        "not collapsed, not rigid. The posture of someone who has stopped fighting "
        "and is now simply receiving. "
        "The figure occupies 55% of frame, slightly left of center. "
        "Single accent color: warm gold — the beam of light from above is pure vivid gold "
        "against absolute monochromatic black and deep sepia engraving. "
        "The gold has weight and temperature — it is not decoration, it is the thing itself. "
        "Background: dense cross-hatching engraving, pure absolute black. "
        "The darkness is not threatening — it is the silence before the protocol begins. "
        "Chiaroscuro: the beam of golden light from directly above is the only source. "
        "Hard edge where the gold meets the black — no soft gradients, no ambiguity. "
        "Heavy engraving texture on the figure's clothing and in the surrounding darkness. "
        "Overlaid element: very faint concentric frequency lines in gold radiating "
        "from the point where the beam touches the figure — barely visible, precise. "
        "Lower 30% fades to shadow for text. "
        "The image says: the door exists. You are standing at it."
    ),
  },

  # ── S10 — CTA FIXO (INTOCÁVEL) ────────────────────────────────────────────────
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": (
        "E eu te envio a Tecnologia Sonora capaz de liberar o seu sistema nervoso "
        "do estado inflamatório usando o Desbloqueio Neural."
    ),
    "prompt": (
        "Hyper-detailed engraving illustration, Gustav Doré divine light — "
        "the portal open, absolute, undeniable. "
        "A radiant column of pure golden light descending from the top of the frame "
        "to the bottom — not a circle, not a metaphor, but a specific pillar of light "
        "so saturated it seems to have weight and temperature. "
        "At the threshold of the light: the barely-visible outline of a human figure, "
        "dissolved into the gold — already through, already in. "
        "The figure is suggestion, not subject. The light is the subject. "
        "Single accent color: vivid gold — the entire central vertical beam. "
        "Everything surrounding it: absolute monochromatic black, "
        "dense cross-hatching engraving texture in the darkness — "
        "layers of fine hatch marks giving the darkness depth and intention. "
        "No other colors. The power comes from the contrast: absolute black, then this gold. "
        "Faint sacred geometry lines in very faint gold visible in the surrounding darkness — "
        "a partial Flower of Life or Sri Yantra centered on the beam, "
        "rendered in fine engraving lines, semi-translucent, barely present. "
        "The field that was always there, now visible because the body stopped blocking it. "
        "The portal is clean, minimal, powerful. "
        "Lower 30% fades to shadow for text. "
        "No complexity — just the threshold, and what comes after."
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

    # Passa o preset correto para o compose
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
