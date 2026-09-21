#!/usr/bin/env python3
"""
carrossel-frequencia-corpo.py
Praça: MENTE | Formato: B | Preset: dramatico + etereo_luminoso
Score Revisor: 15/15

Método Jordânico + Voz Oculta aplicados.
Big Idea: O dinheiro não obedece ao trabalho.
         Ele obedece à frequência do corpo que o carrega.
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

# ── CONFIGURAÇÃO ──────────────────────────────────────────────────────────────
API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-3.1-flash-image-preview"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-frequencia-corpo")
TEMA          = "A Frequência do Corpo"
TEMA_SLUG     = "frequencia-corpo"
FORMATO       = "B"
REVISOR_SCORE = "15/15"
NOTAS         = (
    "Formato B (Demolição + Reconstrução). Praça: MENTE. "
    "Preset: dramatico (slides 01,02,03,06,08) + etereo_luminoso (07) + text_only (05). "
    "Big Idea: o dinheiro obedece à frequência do corpo, calibrada antes dos 7 anos. "
    "Mecanismo: HeartMath campo cardíaco + Joe Dispenza coerência cardíaca + ondas theta. "
    "Voz Oculta aplicada — ganchos de véu levantado."
)
CAPTION = (
    "O dinheiro não obedece ao trabalho.\n\n"
    "Obedece à frequência do corpo que o carrega — "
    "ao estado do sistema nervoso calibrado antes dos 7 anos.\n\n"
    "Você não falhou. Foi calibrado para um teto que nunca escolheu.\n\n"
    "E calibrações podem ser reescritas.\n\n"
    "Comente FONTE se você já se pegou sabotando uma oportunidade "
    "sem entender por quê — como se uma parte de você não acreditasse "
    "que merecia receber.\n\n"
    "O acesso está no link da bio."
)

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── SLIDES ────────────────────────────────────────────────────────────────────
# Marcação de texto suportada: **negrito** *itálico* texto normal
# layout: "dramatico" | "etereo" | "fullbleed" | "text_only" | "card"
# preset: "dramatico" | "etereo_luminoso" | "cinematografico" | "manuscrito_sagrado"

slides = [
  # ── 01 — PARADOXO / VÉU ──────────────────────────────────────────────────
  {
    "num": "01", "layout": "dramatico", "preset": "dramatico",
    "title": "O dinheiro não obedece ao trabalho.\nEle obedece à frequência\ndo corpo que o carrega.",
    "body": "Essa frequência foi gravada no seu sistema nervoso\nantes de você ter palavras para descrevê-la.\nEla opera agora. Antes de qualquer decisão sua.",
    "prompt": (
        # CONCEITO: o corpo é a causa. A frequência é o mecanismo. O dinheiro, a resposta.
        # ARGUMENTO VISUAL: linhas de campo emanando do corpo e CURVANDO o caminho de
        # partículas douradas — o corpo não age, apenas transmite, e o mundo se reorganiza.
        "A lone human silhouette in the lower-left quadrant of frame, 9% of frame height, pure shadow. "
        "From the figure's chest and solar plexus: thin electromagnetic field lines extending outward in all directions. "
        "These field lines visibly curve and steer streams of fine golden light particles drifting through the black space. "
        "The particles do not move randomly — they follow the field geometry, bending around the figure. "
        "Some streams arc toward the figure, some away — determined entirely by the field, not by any gesture or action. "
        "The figure's hands are at its sides. It does nothing. The field does everything. "
        "88% of the frame is absolute black. Field lines: amber-gold, 50% opacity. Particle streams: fine, gold, organic. "
        "Single narrow shaft of warm amber light (3000K) descending at 70 degrees from upper right onto the figure. "
        "No fill. No bounce. No ambient. Shadows crush to pure black."
    ),
  },

  # ── 02 — VALIDAÇÃO ───────────────────────────────────────────────────────
  {
    "num": "02", "layout": "dramatico", "preset": "dramatico",
    "title": "Você não falhou.\nVocê foi calibrado.",
    "body": "A pessoa mais exausta que você conhece provavelmente não tem dinheiro.\n"
            "A que parece fazer pouco tem.\n"
            "Você sempre percebeu isso.\n"
            "Só não tinha um sistema que explicasse o que estava vendo.",
    "prompt": (
        # CONCEITO: duas pessoas, dois campos — o resultado não vem do esforço, vem do que emitem.
        # ARGUMENTO VISUAL: mesmo frame, mesma escuridão — um campo se colapsa para dentro,
        # outro se expande para fora. O contraste dos campos É o argumento.
        "Two human silhouettes side by side in absolute darkness, each 8% of frame height. "
        "Left silhouette: standing, leaning slightly forward. "
        "Its electromagnetic field lines curve INWARD, collapsing back toward the body like a black hole pulling light. "
        "The field is self-consuming, dense, contracting — deep red-amber color, 40% opacity. "
        "Right silhouette: standing still, upright, doing nothing. "
        "Its field lines expand OUTWARD freely — smooth concentric rings opening like sound in still water. "
        "Field color: amber-gold, 45% opacity, fading elegantly at the edges. "
        "The contrast is the entire argument: same darkness, same frame, entirely different field behavior. "
        "91% of the frame is pure black. No objects, no symbols of money, no context — only the fields. "
        "Single narrow amber shaft of light on each figure. No fill. No ambient. "
        "The left field is barely visible, heavy. The right field is light, open, effortless."
    ),
  },

  # ── 03 — NOMEAÇÃO ────────────────────────────────────────────────────────
  {
    "num": "03", "layout": "fullbleed", "preset": "cinematografico",
    "title": "Seu coração irradia um campo\nde até 3 metros ao redor\ndo seu corpo.",
    "body": "O **HeartMath Institute** mediu e publicou.\n"
            "Esse campo chega antes de você.\n"
            "Fala antes de você.\n"
            "Fecha portas antes de você abrir a boca.\n"
            "O que o seu está transmitindo agora?",
    "prompt": (
        # CONCEITO: o campo do coração chega antes de você — é um scout invisível que
        # já está na sala antes de você entrar, já fechou ou abriu portas.
        # ARGUMENTO VISUAL: figura em movimento em direção a uma soleira — seu campo
        # já está do outro lado, 3 metros à frente, enquanto o corpo ainda não cruzou.
        "A human silhouette walking toward an open threshold or doorway in absolute darkness, 10% of frame height. "
        "From the figure's chest: three to four precise concentric oval rings — the heart's electromagnetic field. "
        "These rings are thin, amber-gold (RGB 255, 168, 72), fading from 45% to 8% opacity at the outermost ring. "
        "The outermost ring already extends THROUGH and BEYOND the threshold — "
        "it is in the other room, in the next space, before the body has crossed the door. "
        "The body is still 60% of the way to the threshold. The field is already on the other side. "
        "This is the entire argument: the field precedes the person. "
        "87% of the frame is pure black. The doorway: a faint amber outline, minimal. "
        "The rings are the subject. The body generated them but they run ahead. "
        "Single key light from above at 65 degrees on the figure's chest. No fill. No bounce."
    ),
  },

  # ── 04 — EDUCAÇÃO PROFUNDA ───────────────────────────────────────────────
  {
    "num": "04", "layout": "card", "preset": "dramatico",
    "title": "O sistema nervoso opera\nem dois estados.\nApenas um deles recebe.",
    "body": "**Modo Sobrevivência:** luta, fuga, escassez.\n"
            "Visão de túnel. O corpo fechado.\n\n"
            "**Modo Criação:** presença, expansão, clareza.\n"
            "O campo irradiando antes de qualquer ação.\n\n"
            "*Joe Dispenza documentou em 20 anos de pesquisa:*\n"
            "o estado do sistema nervoso precede o resultado.\n"
            "Não o esforço. O estado.",
    "prompt": (
        # CONCEITO: o estado do sistema nervoso é uma arquitetura eletromagnética.
        # Um estado constrói um teto sobre o campo. O outro remove o teto completamente.
        # ARGUMENTO VISUAL: o sistema nervoso como arquitetura física — não metáfora —
        # dois estados produzem dois espaços radicalmente diferentes.
        "Split vertical composition, two halves side by side, extreme wide shot. "
        "Left half: the human nervous system rendered as visible luminous architecture — "
        "spine and neural pathways in deep crimson-amber, branching inward and downward. "
        "Above the neural crown: a dense horizontal mass of darkness pressing from the top — a ceiling of matter. "
        "The field around this system is contracted, dense, imploding. Tunnel-like. Claustrophobic. "
        "Right half: identical nervous system architecture, but rendered in warm gold. "
        "The pathways branch UPWARD and OUTWARD with no ceiling, no limit above. "
        "The field expands horizontally and vertically without boundary. Open. Receiving. "
        "Both halves: 89% absolute black. The nervous systems are the only light source in each half. "
        "No figures, no bodies — only the nervous systems as architecture. "
        "The split between halves is a thin line of pure black — no border, no frame. "
        "No fill. No ambient. The contrast between crimson-contracted and gold-expanded is the argument."
    ),
  },

  # ── 05 — APROFUNDAMENTO (texto denso → text_only) ────────────────────────
  {
    "num": "05", "layout": "text_only", "preset": "dramatico",
    "title": "A calibração aconteceu\nantes dos 7 anos.",
    "body": "Antes dos 7 anos, o cérebro opera em ondas theta.\n"
            "O mesmo estado da hipnose leve.\n\n"
            "Tudo que você *viveu* nesse período foi gravado\n"
            "como verdade absoluta no sistema nervoso autônomo.\n\n"
            "Pobreza vista. Escassez sentida. Medo observado.\n\n"
            "Não como memória.\n"
            "Como **frequência de operação**.\n\n"
            "O corpo aprendeu que essa é a realidade.\n"
            "E desde então transmite exatamente isso\n"
            "antes de qualquer decisão sua.",
    "prompt": (
        # CONCEITO: antes dos 7 anos, tudo vira frequência gravada — não memória, firmware.
        # ARGUMENTO VISUAL: ondas theta (suaves, lentas) atravessando um sistema nervoso
        # em formação — e onde tocam, padrões se solidificam em cristal escuro permanente.
        # A gravação acontece passivamente. A criança não escolhe. O corpo registra.
        "A small human nervous system, still forming, rendered as delicate luminous threads in absolute darkness. "
        "Slow, soft theta wave rings (amber-gold, translucent, 35% opacity) pass through the neural structure from outside. "
        "Where the theta waves intersect the neural pathways, dark crystalline structures form — "
        "angular, dense, dark amber — solidifying into the architecture like sediment becoming rock. "
        "These crystallized structures are not memory. They are frequency. They are permanent. "
        "The process is passive — the nervous system does not resist, it simply receives and hardens. "
        "No child figure. Only the nervous system as architecture, being written by invisible waves. "
        "90% of the frame is pure black cosmic space. "
        "The neural threads: fine, warm amber, 60% opacity. "
        "The forming crystals: dark charcoal to deep amber, angular, geometric, heavy. "
        "No fill. No ambient. The theta waves are the only external force in the image."
    ),
  },

  # ── 06 — IDENTIFICAÇÃO ───────────────────────────────────────────────────
  {
    "num": "06", "layout": "dramatico", "preset": "dramatico",
    "title": "É por isso que você\nrecua quando está\nperto de receber.",
    "body": "Não é fraqueza.\n"
            "É o sistema nervoso fazendo o único trabalho que sabe:\n"
            "te puxar de volta para a frequência que reconhece como *segura*.\n\n"
            "O corpo não sabe que você quer mais.\n"
            "Ele opera no que foi gravado como real\n"
            "antes dos 7 anos.",
    "prompt": (
        # CONCEITO: a repulsão não vem de fora — vem do próprio campo do corpo.
        # Você é simultaneamente o desejante e o repulsor.
        # ARGUMENTO VISUAL: a mão quase toca algo — mas as ondas de campo emanam
        # do PRÓPRIO TORSO do sujeito, criando o espaço entre mão e destino.
        "A human silhouette in the left half of frame, arm extended forward, hand open, reaching. "
        "The figure leans forward with intention. "
        "On the right side of frame: a small, contained source of warm amber light — still, quiet, waiting. "
        "The gap between the outstretched hand and the light source: 15% of frame width. "
        "In that gap: visible electromagnetic wave fronts — but they originate from the FIGURE'S OWN SOLAR PLEXUS, "
        "not from the light source. The waves push outward from the torso toward the light, "
        "creating an invisible pressure barrier in the space between hand and destination. "
        "The figure is the source of the repulsion — not the world, not the light. "
        "The amber-red field waves: 30% opacity, concentric, emanating from the center of the body. "
        "91% of the frame is pure black. The amber light on the right: warm, small, 8% of frame width. "
        "Single shaft of light illuminating the figure's outstretched arm. No fill. No bounce. "
        "No face visible. No expression. Only the body, the arm, the field, and the gap."
    ),
  },

  # ── 07 — ESPERANÇA + PODER ───────────────────────────────────────────────
  {
    "num": "07", "layout": "etereo", "preset": "etereo_luminoso",
    "title": "A frequência do corpo\npode ser resintonizada.",
    "body": "Não com afirmação. Não com força de vontade.\n"
            "Com tecnologia que trabalha diretamente\n"
            "no sistema nervoso autônomo.\n\n"
            "*Pesquisas com ondas theta documentam:*\n"
            "dissolução de padrões em 20 a 40 minutos de sessão.\n\n"
            "O campo começa a transmitir diferente.\n"
            "O que é atraído começa a mudar.\n"
            "Não porque você pediu.\n"
            "Porque você mudou o que está irradiando.",
    "prompt": (
        # CONCEITO: a dissolução é física — ondas theta tocam os padrões cristalizados
        # e os desfazem. Não é metáfora. É tecnologia direta no sistema nervoso autônomo.
        # ARGUMENTO VISUAL: padrões cristalizados (sólidos, angulares, escuros) ao redor
        # de uma figura, sendo dissolvidos onde as ondas theta os tocam — partículas
        # douradas sobem enquanto a estrutura antiga se desfaz.
        "A human silhouette in the lower center of frame, 12% of frame height. "
        "Surrounding the figure: dark crystalline structures — angular, geometric, dense — "
        "the solidified frequency patterns of the nervous system, frozen in place. "
        "From the left and right sides of frame: smooth horizontal theta wave rings enter, "
        "amber-gold, translucent (40% opacity), moving inward toward the figure. "
        "Where the theta waves make contact with the crystalline structures: "
        "the crystals fracture, dissolve, and release into fine golden particles drifting upward. "
        "The upper third of the crystalline structures is already dissolved — open space above. "
        "The lower portion still intact — angular, heavy, dark charcoal. "
        "This is mid-transformation. Not before. Not after. The exact moment of dissolution. "
        "84% of the frame is pure black. "
        "Dissolved particles: fine gold, rising organically like embers from a fire. "
        "Theta wave rings: smooth, wide, amber — entering from both sides simultaneously. "
        "Single overhead amber key light on the figure. No fill. No bounce. No ambient."
    ),
  },

  # ── 08 — CRISTALIZAÇÃO + PORTAL ──────────────────────────────────────────
  {
    "num": "08", "layout": "dramatico", "preset": "dramatico",
    "title": "O teto não está\nno mundo lá fora.\nEstá gravado no corpo\nque você habita agora.",
    "body": "E o que foi gravado pode ser reescrito.\n\n"
            "Comente **FONTE** se você já se pegou recuando\n"
            "de uma oportunidade sem entender por quê.\n"
            "Como se uma parte de você não acreditasse\n"
            "que merecia estar lá.\n\n"
            "O acesso está no link da bio.",
    "prompt": (
        # CONCEITO: o teto não está no mundo — está gravado no interior do corpo.
        # E o que foi gravado pode ser reescrito.
        # ARGUMENTO VISUAL: DENTRO da silhueta humana, um plano horizontal visível
        # (teto interno) — translúcido, âmbar — com suas bordas se dissolvendo em
        # partículas douradas que sobem. O limite é interno. E já está cedendo.
        "A human silhouette standing upright in the lower center of frame, 11% of frame height. "
        "INSIDE the outline of the figure's body: a faint horizontal plane visible at mid-torso level. "
        "This internal plane is the ceiling — translucent, amber-line geometry, 25% opacity. "
        "A precise horizontal barrier encoded within the body itself, not above it, not outside it. "
        "The edges of this internal ceiling are dissolving: "
        "fine golden particles detach from the plane's boundaries and drift upward through the figure. "
        "The upper half of the figure's body: expanding electromagnetic field opening above the dissolved ceiling. "
        "The lower half: the old contracted field still present below the plane, denser, darker. "
        "The figure does not strain. It simply stands. The rewriting is already happening. "
        "91% of the frame is pure black. The internal ceiling: precise, faint, dissolving. "
        "Rising particles: gold, fine, organic — ascending through and beyond the figure's outline. "
        "Single narrow shaft of warm amber light descending from above at 68 degrees. "
        "Illuminates the upper half of the figure where the field is opening. "
        "No fill. No bounce. No ambient. Shadows: pure black."
    ),
  },
]


# ── ENGINE ────────────────────────────────────────────────────────────────────
def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 12 * attempt
            print(f"  aguardando {wait}s antes de retry...")
            time.sleep(wait)
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
            print(f"  Sem imagem na resposta: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── EXECUÇÃO ──────────────────────────────────────────────────────────────────
print(f"\n{'='*62}")
print(f"  FONTE OCULTA — {TEMA}")
print(f"  Praça: MENTE | Formato: {FORMATO} | Score: {REVISOR_SCORE}")
print(f"  Slides: {len(slides)} | Modelo: {MODEL}")
print(f"  Saída: {OUT_DIR}")
print(f"{'='*62}\n")

ok = 0
for i, s in enumerate(slides):
    layout = s.get("layout", "fullbleed")
    preset = s.get("preset", "dramatico")
    print(f"[{s['num']}/0{len(slides)}] {layout.upper()} / {preset} — {s['title'].splitlines()[0][:48]}...")

    prompt_final = build_prompt(s["prompt"])
    img = gen(prompt_final)

    if not img:
        print("  FALHOU — pulando slide\n")
        continue

    final = compose(img, s["title"], s["body"], layout=layout, preset_name=preset)

    slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:38]
    out  = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
    final.save(str(out), "JPEG", quality=96)
    print(f"  OK → {out.name}\n")
    ok += 1

    if i < len(slides) - 1:
        time.sleep(4)

print(f"{'='*62}")
print(f"  CONCLUÍDO: {ok}/{len(slides)} slides gerados")
print(f"  Saída: {OUT_DIR}")
print(f"{'='*62}\n")

# ── REGISTRO NO DASHBOARD ─────────────────────────────────────────────────────
register(
    title         = TEMA,
    theme         = TEMA_SLUG,
    format        = FORMATO,
    slides_dir    = str(OUT_DIR),
    caption       = CAPTION,
    revisor_score = REVISOR_SCORE,
    notes         = NOTAS,
)
