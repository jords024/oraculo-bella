#!/usr/bin/env python3
"""
carrossel-trauma-somatico.py — CORPO | Formato B | Score 15/15
Big Idea: "Você reprogramou a mente. Seu corpo ainda vive no trauma de 20 anos atrás."
Refs: Bessel van der Kolk (Harvard), HeartMath Institute, Rachel Yehuda (Mount Sinai 2016), Peter Levine
"""

import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv

load_dotenv()
import base64
import json
import time
import urllib.error
import urllib.request

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

# ── CONFIGURACAO ──────────────────────────────────────────────────────────────
API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-trauma-somatico")
TEMA          = "O Corpo Ainda Vive no Trauma"
TEMA_SLUG     = "trauma-somatico-corpo"
PRACA         = "CORPO"
FORMATO       = "B"
REVISOR_SCORE = "15/15"
CAPTION = (
    "Você passou anos treinando a parte que processa 40 bits por segundo.\n\n"
    "O sistema que processa 11 milhões ficou intocado.\n\n"
    "Bessel van der Kolk documentou em 30 anos de pesquisa em Harvard o que o campo da "
    "reprogramação mental ignorou sistematicamente: o trauma não se resolve onde foi interpretado. "
    "Se resolve onde foi armazenado.\n\n"
    "E ele não foi armazenado no córtex pré-frontal.\n\n"
    "Foi armazenado no tecido. Na postura. Na forma como o corpo reage milissegundos antes "
    "de qualquer pensamento se formar.\n\n"
    "O HeartMath Institute mediu: o coração transmite campo eletromagnético detectável a 90 "
    "centímetros do corpo. Quando há trauma não resolvido, esse campo perde coerência.\n\n"
    "Rachel Yehuda foi mais longe. Mount Sinai, 2016: marcadores epigenéticos de trauma passam "
    "de pais para filhos. O corpo pode estar respondendo a experiências que não são suas.\n\n"
    "Isso não é metáfora. É biologia com nome, instituição e dado mensurável.\n\n"
    "Comente CORPO se você já sentiu sua mente dizer sim enquanto seu corpo dizia não.\n\n"
    "#fonteoculta #trauma #reprogramacao #corpoemocional #somatico #heartmath #epigenetica"
)
NOTAS = (
    "Formato B (Demolição + Reconstrução). Praça: CORPO. Score Revisor: 15/15. "
    "Big Idea: corpo armazena trauma como frequência, não como memória cognitiva. "
    "Refs: van der Kolk/Harvard, HeartMath (60x, 90cm), Yehuda/Mount Sinai 2016, Peter Levine/Somatic Experiencing. "
    "Arte: Beksinski+AndroidJones (S01), Caravaggio (S02), AlexGrey (S03,S08), AndroidJones (S04), Doré (S05), Turrell (S06), Blake (S07). "
    "CTA: Comente CORPO."
)

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── SLIDES ────────────────────────────────────────────────────────────────────
slides = [
  {
    "num": "01", "layout": "fullbleed",
    "title": "VOCÊ NÃO SABOTA\nPORQUE NÃO ACREDITA.\nVOCÊ SABOTA PORQUE\nSEU CORPO ACREDITA\nEM OUTRA COISA.",
    "body": (
        "Sua mente aprendeu a confiar.\n"
        "Seu sistema nervoso ainda espera o ataque.\n"
        "São dois sistemas. Com memórias diferentes.\n"
        "E apenas um deles comanda quando o risco aparece.\n"
        "Não é o que você treinou por anos."
    ),
    "prompt": (
        "In the visual language of Zdzislaw Beksinski's figurative surrealism merged with "
        "Android Jones's sacred geometry — architectural precision of the human body rendered as fracture and duality. "
        "The image evokes cognitive dissonance as physical sensation — the specific discomfort of recognizing two things "
        "believed to be one, now split. "
        "Centered single human figure, full body, bisected by a precise vertical line — not torn, not gradual: cut. "
        "Left half: luminous, geometric, crystalline indigo blue — cerebral, structured. "
        "Right half: compressed stone, earth, roots embedded in muscle tissue — ancient, dense. "
        "Both halves equally detailed, equally real. The division is not a wound — it is a fact. "
        "Left half indigo blue (#1a1a4e) and crystalline white — the color of thought. "
        "Right half ferrous amber (#8B4513) and charcoal gray — the color of compressed earth. "
        "No gradient between them. Hard division. "
        "Blue half glows from within, diffuse and even. Amber half catches external light on raised surfaces. "
        "Where they meet: a thin seam of heat, like two tectonic plates in contact. "
        "Ultra-high detail, oil painting texture with digital precision. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "Multiple conceptual layers visible simultaneously. The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "02", "layout": "card",
    "title": "VOCÊ NÃO FALHOU.\nVOCÊ TREINOU\nA PARTE ERRADA.",
    "body": (
        "Anos de meditação, afirmação, reprogramação mental.\n"
        "Resultado real: você entende mais. Sofre diferente. Mas ainda sabota.\n"
        "Isso não é fraqueza. Isso é arquitetura biológica.\n"
        "A mente processa 40 bits por segundo.\n"
        "O sistema nervoso autônomo processa 11 milhões.\n"
        "Você passou anos treinando o menor dos dois."
    ),
    "prompt": (
        "Caravaggio's chiaroscuro — the most rigorous use of darkness in Western painting — "
        "applied to a contemporary figure. The Caravaggio principle of light as moral agent, translated to the present. "
        "Relief that arrives as weight — the recognition that working with incomplete information is not weakness. "
        "Extreme close-up: two hands resting on a chest, palms down, the chest barely visible. "
        "The hands are the entire image. Light descends in a single shaft from upper left — touches only the hands "
        "and a small area of chest beneath them. Everything else: absolute black. "
        "The hands are in the act of acknowledging something, not performing — quiet, still, certain. "
        "The hands as point of contact between intention and body. "
        "Warm olive skin lit by golden amber (#C8860A) light — living, present, warm. "
        "Background: absolute black (#000000). "
        "Single source raking angle — the light selects: hands and heart. Face in darkness — not about understanding, "
        "about location. The light says: here. This is where the work is. "
        "Skin with visible texture — real hands, real skin, real weight. "
        "High contrast photography rendered with oil paint texture. The light has physical weight. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "03", "layout": "fullbleed",
    "title": "O TRAUMA NÃO MORA\nNA MEMÓRIA.\nMORA NO MÚSCULO.",
    "body": (
        "Bessel van der Kolk documentou isso em 30 anos de pesquisa em Harvard.\n"
        "O trauma não é o que você lembra — é o que seu corpo aprendeu a fazer.\n"
        "Tensão crônica no pescoço. Peito fechado em momentos de oportunidade.\n"
        "Estômago contraído antes de decisões importantes.\n"
        "Não são sintomas de ansiedade.\n"
        "São memórias somáticas com sinal de ameaça ainda ativo."
    ),
    "prompt": (
        "Alex Grey's transparent anatomical vision merged with classical medical illustration — "
        "the body made legible from inside. Not mystical: clinical. The aesthetic of a diagnostic instrument. "
        "The weight of recognition — something you suspected but couldn't name suddenly has a location in the body. "
        "Full body human silhouette, translucent — internal musculature fully visible through the skin. "
        "Specific anatomical points illuminated in deep red: back of neck, upper chest/sternum, solar plexus, jaw, lower back. "
        "Not decorative highlights — the exact locations of chronic tension in somatic trauma literature. "
        "Red nodes pulse outward with concentric rings. The rest of the body is cool gray-white. "
        "Deep red (#8B0000) for the active threat nodes — the color of biological alarm. "
        "Cool gray-white (#C8C8C8) for surrounding tissue — neutral, waiting. "
        "Black background with slight blue undertone — the clinical dark of a diagnostic room. "
        "Light comes from within the body — specifically from the red nodes outward. Diagnostic light. "
        "Transparent musculature with the precision of Gray's Anatomy rendered with digital oil paint texture. "
        "The red nodes have quality of heat — slight blur at edges suggesting radiation of signal. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "04", "layout": "fullbleed",
    "title": "SEU CORAÇÃO EMITE\nUM CAMPO MAGNÉTICO.\nTRAUMA DISTORCE\nESSE CAMPO.",
    "body": (
        "O HeartMath Institute (1991–2023) mediu: o coração gera campo eletromagnético\n"
        "60 vezes mais potente que o cérebro. Detectável a 90 centímetros do corpo.\n"
        "Esse campo comunica seu estado interno antes de você abrir a boca.\n"
        "Quando há trauma não resolvido, o padrão de coerência cardíaca colapsa.\n"
        "Você entra em ambientes novos transmitindo a frequência de experiências antigas.\n"
        "As pessoas sentem. As oportunidades respondem."
    ),
    "prompt": (
        "Android Jones's sacred geometry precision applied to HeartMath Institute's toroidal field research — "
        "not fantasy: the measurable electromagnetic architecture of the human heart made visually legible. "
        "Awe at scale followed immediately by unease — something operating at full power, its signal distorted. "
        "Centered human torso from mid-thigh to shoulders. The heart visible through translucent skin as radiant source. "
        "From it: a perfect toroidal field — the mathematically accurate donut shape of the heart's electromagnetic field, "
        "extending 90 centimeters in all directions. "
        "But the torus is not perfect: on one side, field lines are fragmented, disrupted, irregular — like a transmission with interference. "
        "The intact side: pure gold. The disrupted side: violet fracturing into gray static. "
        "Pure gold (#FFD700) for the coherent field — the color of what the body is capable of. "
        "Deep violet (#4B0082) for the disrupted region — compressed, confused, carrying too much. "
        "Gray static (#808080) at the breakdown point. The heart itself: warm white, neutral. "
        "The heart is the only light source. What is coherent glows, what is disrupted fractures the light into scatter. "
        "Field lines with the mathematical precision of physics visualization, rendered with tactile warmth of oil paint. "
        "The disruption zone has texture like static on a television screen — recognizable, specific, not metaphorical. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "05", "layout": "card",
    "title": "SEU TRAUMA\nPODE TER VINDO\nANTES DE VOCÊ\nNASCER.",
    "body": (
        "Rachel Yehuda, Mount Sinai, 2016: filhos de sobreviventes do Holocausto\n"
        "carregam marcadores epigenéticos do trauma dos pais — sem ter vivido as experiências.\n"
        "O corpo herda padrões de sobrevivência que nunca foram seus.\n"
        "Você pode nunca ter passado por trauma direto e ainda carregar\n"
        "um sistema nervoso programado para catástrofe.\n"
        "Isso não é metáfora. É biologia mensurável."
    ),
    "prompt": (
        "Gustave Doré's engraving tradition — the weight of line work that makes image feel like historical document — "
        "merged with contemporary biological illustration. The aesthetic of something discovered, not invented. "
        "Existential weight — the gravity of realizing what limits you may predate your birth. "
        "A tree, full frame, vertical. The tree is simultaneously a genealogical tree and a nervous system. "
        "Roots: figures of ancestors, compressed into the earth, their postures carrying fear, survival, contraction. "
        "Trunk: the boundary between inherited and present. "
        "Upper branches: a single contemporary figure, arms extended — but on the branches themselves: "
        "the same compression marks that appear in the roots, mirrored exactly. "
        "The marks are not the same experiences — but the biological pattern is identical. "
        "Sepia (#704214) and cold gray — the palette of historical photography. "
        "The contemporary figure in the branches: slightly warmer tone — alive, present — "
        "but the marks share the sepia of the roots. "
        "Cold white light (#F0F0F0) on the branch sections where inherited marks appear — diagnostic light. "
        "Engraving line quality — every element built from accumulated lines, like Doré's illustrations. "
        "Dense, dark, weighted. Ultra-fine detail: the correspondence between root and branch marks is recognizable. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "06", "layout": "fullbleed",
    "title": "VOCÊ CONHECE\nESSE MOMENTO.",
    "body": (
        "A oportunidade aparece. Você sabe que é boa.\n"
        "A mente diz: vai. O corpo trava.\n"
        "Coração acelerado. Raciocínio confuso. Vontade de adiar.\n"
        "Você interpreta como medo do sucesso, falta de preparo, síndrome do impostor.\n"
        "Mas é mais antigo que isso.\n"
        "É um sinal de ameaça arquivado no tecido conjuntivo há décadas,\n"
        "confundindo o presente com um passado que já terminou."
    ),
    "prompt": (
        "James Turrell's use of light as field — light that has physical presence, that the body responds to "
        "before the mind registers. Not a painting of light: light as the medium itself. "
        "Recognition without resolution — the specific ache of seeing the gap between where you are and where "
        "you want to be — knowing the gap is not your fault, but still yours to cross. "
        "Single figure, from behind, medium shot. Standing before an open doorway filled with warm white light. "
        "The figure's body language: rigid, weight slightly back, shoulders contracted — "
        "not afraid of the light, but not moving toward it. One step away from the threshold. "
        "Perhaps 60 centimeters — years of stored signal — between the figure and the door. "
        "The body is the subject. The light is the context. The gap is the argument. "
        "The light in the doorway: warm white (#FFF8E7) — open, safe, possible. "
        "The environment: blue-steel (#4A5568) — the compressed present, not hostile but heavy. "
        "The figure: dark, almost silhouette — defined enough to be recognizable. "
        "The doorway is the only light source. It illuminates what is directly in front of it. "
        "The light is not reaching toward the figure — it is simply present, available. "
        "The light in the doorway has physical depth — Turrell's signature: light you feel you could walk into. "
        "The figure: matte, heavy, textured — weight. The gap is a physical fact, not symbolic distance. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "07", "layout": "card",
    "title": "O CORPO APRENDE.\nO CORPO\nTAMBÉM DESAPRENDE.",
    "body": (
        "Peter Levine demonstrou: o sistema nervoso não é estático.\n"
        "Ele foi programado por experiência — e pode ser reprogramado por experiência.\n"
        "Não por crença. Não por afirmação. Por sinal somático novo,\n"
        "repetido com segurança suficiente para substituir o antigo.\n"
        "O trabalho não é convencer a mente.\n"
        "É dar ao corpo evidência suficiente de que o perigo passou."
    ),
    "prompt": (
        "William Blake's energetic human form — the body as dynamic force, as potential in motion — "
        "applied with contemporary technical precision. Blake's principle: the body as expressive of interior state. "
        "The specific quality of possibility that comes after genuine understanding — "
        "not hope as emotion, but hope as updated assessment of probability. "
        "Human figure, three-quarter view, medium close. The figure has visible constraints — "
        "not dramatic chains, but precise organic bindings: dense fiber, like scar tissue or compressed fascia, "
        "wrapped around joints, solar plexus, throat. "
        "Hands are working — methodically, carefully — at one of the bindings at the wrist. "
        "The binding is partially released. Not explosive liberation: skilled, patient, technical work. "
        "Somatic reprogramming as surgical precision work. Not praying, not having a breakthrough — "
        "doing the specific, skilled work of creating new signals in tissue running old ones. "
        "Deep forest green (#1B4332) — the color of sustained, serious work. "
        "The bindings: amber-rust (#92400E) — compressed history. "
        "Where the binding is released: warm gold (#F59E0B) appears in the tissue beneath. "
        "Background: dark, neutral — this work happens in private. "
        "Soft, directional light from above — the light of a workspace, not a stage. "
        "The bindings have organic texture — biological compression, like dense connective tissue. "
        "Blake's energetic line quality: even in constraint, inherent vitality. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "08", "layout": "fullbleed",
    "title": "A MENTE ENTENDEU\nHÁ ANOS.\nO CORPO ESTÁ\nESPERANDO SER\nINCLUÍDO.",
    "body": (
        "Reprogramação sem trabalho somático é arquitetura sem fundação.\n"
        "Bonita. Frágil. Colapsa quando a pressão real aparece.\n"
        "A Fonte Oculta trabalha nas três camadas: mente, campo energético, memória somática.\n"
        "Não porque é mais completo.\n"
        "Porque as outras duas não funcionam sem a terceira.\n\n"
        "Comente CORPO se você já sentiu sua mente dizer sim\n"
        "enquanto seu corpo dizia não."
    ),
    "prompt": (
        "Alex Grey's full integration vision — the body as multi-dimensional reality, "
        "all layers simultaneously visible and coherent — at its highest technical execution. "
        "Not mystical decoration: the architecture of complete human function made visible. "
        "Arrival — the specific quality of recognition when something fragmented becomes unified. "
        "Not triumph, not relief: the sober, solid feeling of a system finally operating as designed. "
        "Full human figure, centered, frontal, arms slightly open — simply present, complete. "
        "Three distinct layers simultaneously visible and perfectly aligned: "
        "outermost — electromagnetic field (toroidal, coherent, gold); "
        "middle — physical body with full musculature visible (warm amber-earth tones); "
        "innermost — cognitive/mental layer (crystalline blue-white geometry). "
        "All three layers share the same central axis. All three are in coherence. "
        "Integration as architecture, not achievement. The layers are distinct, each doing its specific work. "
        "Indigo blue (#312E81) for the mental/crystalline layer — precise, cold, structured. "
        "Pure gold (#D97706) for the electromagnetic field — coherent, broadcasting, warm. "
        "Amber-earth (#92400E) for the somatic/physical layer — grounded, present, real. "
        "Where the three meet at the central axis: a thin line of white light. "
        "Each layer has its own light source illuminating from within — the three light sources are in phase. "
        "Alex Grey's cellular-to-cosmic texture: each layer has texture appropriate to its scale. "
        "Ultra-high resolution: detail rewards close examination. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
]


# ── Engine ────────────────────────────────────────────────────────────────────
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


# ── Execucao ──────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Carrossel — {TEMA}")
print(f"  Praca: {PRACA} | Formato: {FORMATO} | Score: {REVISOR_SCORE}")
print(f"  Slides: {len(slides)} | Modelo: {MODEL}")
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
        time.sleep(4)

print(f"{'='*60}")
print(f"  CONCLUIDO: {ok}/{len(slides)} slides")
print(f"{'='*60}\n")

register(
    title         = TEMA,
    theme         = TEMA_SLUG,
    format        = FORMATO,
    slides_dir    = str(OUT_DIR),
    caption       = CAPTION,
    revisor_score = REVISOR_SCORE,
    notes         = NOTAS,
)
