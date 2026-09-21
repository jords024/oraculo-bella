#!/usr/bin/env python3
"""
carrossel-teto-sna.py — ALAVANCA | Formato D | Score 15/15
Big Idea: "Você não tem um problema de estratégia. Tem um teto de segurança calibrado pelo SNA antes dos 7 anos."
Refs: Bruce Lipton (Stanford/1994), Paul MacLean (NIMH/1990), Raj Chetty (Harvard/2014), Joe Dispenza (JACM/2017)
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

OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-teto-sna")
TEMA          = "Seu Problema Nunca Foi Estrategia"
TEMA_SLUG     = "teto-sna-alavanca"
PRACA         = "ALAVANCA"
FORMATO       = "D"
REVISOR_SCORE = "15/15"
CAPTION = (
    "Em 1994, Bruce Lipton filmou o que ninguem queria aceitar.\n\n"
    "Celulas vivas. Mesmo DNA. Ambientes diferentes. Comportamentos opostos.\n\n"
    "O que ele documentou no laboratorio de Stanford explica um padrao que voce "
    "provavelmente ja viveu: aprender tudo, aplicar tudo — e o dinheiro voltar ao mesmo patamar toda vez.\n\n"
    "Nao e o que voce sabe.\n"
    "E o campo que seu sistema nervoso aprendeu a habitar antes dos seus 7 anos.\n\n"
    "O Sistema Nervoso Autonomo processa 11 milhoes de bits por segundo.\n"
    "Sua mente consciente: 40.\n\n"
    "Kiyosaki alcancou os 40 bits.\n"
    "O seu campo ja tinha decidido pelos outros 10.999.960.\n\n"
    "Isso tem nome, tem mecanismo, tem saida.\n"
    "Mas a saida nao e mais um livro.\n\n"
    "Deslize para entender o teto que voce nao consegue ver — mas sente.\n\n"
    "Comente FONTE se voce ja se pegou sabotando uma oportunidade financeira real "
    "sem conseguir explicar racionalmente por que.\n\n"
    "#fonteoculta #neurobiologia #alavanca #sistemnervoso #epigenetica #brucelipton "
    "#subconsciente #dinheiro #liberdadefinanceira #joedispenza"
)
NOTAS = (
    "Formato D (Historia + Verdade). Praca: ALAVANCA. Score Revisor: 15/15. "
    "Big Idea: teto financeiro e calibracao do SNA, nao falta de estrategia. "
    "Refs: Lipton/Stanford/1994, MacLean/NIMH/1990, Chetty/Harvard/2014, Dispenza/JACM/2017 (n=142). "
    "Arte: Caravaggio (S01,S06), Lange (S02), Beksinski (S03,S05), Dore (S04,S07), manuscrito (S08). "
    "Preset: cinematografico_crimson. CTA: Comente FONTE."
)

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── SLIDES ────────────────────────────────────────────────────────────────────
slides = [
  {
    "num": "01", "layout": "fullbleed",
    "title": "TUDO QUE VOCÊ\nAPRENDEU FALHOU.",
    "body": (
        "Em 1994, Bruce Lipton filmou células vivas trocando de ambiente\n"
        "no laboratório da Universidade Stanford.\n"
        "O DNA não mudou. O comportamento mudou completamente.\n"
        "O que ele documentou explica por que você leu todos os livros certos,\n"
        "aplicou todas as estratégias corretas —\n"
        "e o dinheiro ainda volta ao mesmo patamar.\n"
        "Não é o que você sabe. É o ambiente que seu sistema nervoso\n"
        "aprendeu a habitar antes dos 7 anos."
    ),
    "prompt": (
        "Cinematic photography, extreme low-key lighting, tenebrism inspired by Caravaggio, "
        "single-source cold amber light emerging from absolute darkness, 8K resolution, "
        "shot on large format film, grain texture visible. "
        "Center composition, microscopic cell structure illuminated in isolation, "
        "surrounding 90% pure black negative space, subject displaced left-center creating psychological unease. "
        "Single biological cell in extreme macro detail, semi-transparent membrane, nucleus visible, "
        "inside the cell: a miniaturized human silhouette standing, back turned, looking inward — "
        "scale contrast between cosmic and microscopic. "
        "Heavy shadow, sense of profound stillness, no movement implied, "
        "the silence before recognition, oppressive but contemplative darkness. "
        "Primary: #0A0A0A deep black, Secondary: #C8A96E cold amber (light source only), "
        "Accent: #F5F5F0 for cell membrane highlights, zero saturation except light source. "
        "Style of: Caravaggio's tenebrism, Ernst Haeckel's biological illustrations, "
        "Christopher Nolan's cinematography in Interstellar. "
        "No text overlay, no motivational aesthetic, no bright colors, no stock photo quality, "
        "purely abstract biological. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "02", "layout": "card",
    "title": "NÃO FOI FALTA\nDE ESFORÇO.",
    "body": (
        "Rich Dad Poor Dad vendeu 32 milhões de cópias.\n"
        "Think and Grow Rich existe há 87 anos.\n"
        "E as estatísticas de mobilidade de renda nos países ocidentais\n"
        "permaneceram virtualmente inalteradas nas últimas três décadas.\n"
        "(Chetty et al., Harvard, Equality of Opportunity Project, 2014)\n"
        "O problema não é que as pessoas não leram.\n"
        "É que estão tentando reprogramar software com hardware\n"
        "que opera em outra camada — uma camada que o livro não alcança."
    ),
    "prompt": (
        "Documentary photography aesthetic, Dorothea Lange influence, "
        "medium format film simulation, slight sepia base desaturated to near-monochrome, "
        "natural window light from left, soft shadows, textural depth. "
        "Overhead perspective (45-degree angle), stack of worn books open and overlapping, "
        "some face-down, some bookmarked but abandoned, slight disorder — "
        "not destruction but exhaustion, intimate table scale. "
        "Worn paperback books with illegible titles, pages yellowed, some highlighted in faded tones, "
        "a folded corner here and there, dust particles visible in light beam — "
        "knowledge applied, insufficient. "
        "Weight of accumulated effort, the specific sadness of doing everything right, "
        "silence of a study room after midnight, no drama — clinical observation of limitation. "
        "Base: warm #1C1410 dark brown-black, Books: desaturated warm tones, "
        "Edge vignette in #8B0000 crimson — barely visible, almost subliminal, highlights: cold white #F0EDE8. "
        "Style: Dorothea Lange documentary weight, Edward Hopper's quiet desperation, "
        "Irving Penn's still life precision. "
        "No legible book titles, no hands in frame, no bright lighting, no commercial bookstore aesthetic. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "03", "layout": "fullbleed",
    "title": "SEU TETO TEM\nNOME: SNA.",
    "body": (
        "O Sistema Nervoso Autônomo processa 11 milhões de bits por segundo.\n"
        "Sua mente consciente processa 40 bits.\n"
        "Paul MacLean, National Institute of Mental Health, 1990: cérebro trino.\n"
        "O neocórtex — onde você 'pensa sobre dinheiro' — é o inquilino mais novo.\n"
        "O sistema límbico e o cérebro reptiliano já decidiram antes.\n"
        "Quando você toma uma decisão financeira,\n"
        "você experimenta uma conclusão.\n"
        "O sistema nervoso já votou."
    ),
    "prompt": (
        "Medical illustration meets fine art photography, engraving aesthetic, "
        "high contrast, Beksinski architectural influence, detailed anatomical precision "
        "rendered in dramatic cinematic light — not clinical: visceral. "
        "Full vertical frame, human nervous system diagram (spine to brain) centered, "
        "symmetrical but with organic imperfection, the synaptic network extends "
        "beyond the body outline into the surrounding darkness. "
        "Detailed nervous system anatomical illustration rendered photorealistically, "
        "synapses and neural pathways glowing in deep crimson pulses, "
        "the brain illuminated at top as apex, spinal cord as column of power, "
        "peripheral nerves reaching outward like roots of a tree. "
        "Awe and unease simultaneously — this is the architecture operating without your permission. "
        "Background: #0D0D0D near-black, Neural pathways: #C41E3A crimson pulsing, "
        "Anatomical structure: #D4C5B0 aged paper white. "
        "Beksinski's architectural darkness meets Gray's Anatomy 1858 edition. "
        "No text labels on anatomy, no clinical white background, no cheerful medical illustration. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "04", "layout": "fullbleed",
    "title": "EPIGENÉTICA É\nO MECANISMO.",
    "body": (
        "Bruce Lipton documentou em Biology of Belief (2005):\n"
        "o ambiente celular controla a expressão genética.\n"
        "Antes dos 7 anos, o cérebro opera em ondas theta.\n"
        "O estado hipnagógico. O estado de transe.\n"
        "A ansiedade do seu pai ao falar de dinheiro.\n"
        "O silêncio quando a conta não fechava.\n"
        "A frase que sua mãe repetia sobre rico.\n"
        "Você não herdou crenças.\n"
        "Você herdou um campo calibrado no tecido do seu sistema nervoso."
    ),
    "prompt": (
        "Gustave Doré engraving style rendered as photographic fine art, "
        "extreme scale contrast, biblical grandeur applied to neuroscience, "
        "black and white with single crimson accent, panoramic vertical composition. "
        "Extreme scale: tiny child silhouette (bottom 10% of frame) beneath "
        "an immense architecture of light waves (occupying top 90%), "
        "the waves are theta brain waves rendered as physical structures — like cathedral arches made of light. "
        "Child silhouette (4-5 years old, gender neutral, back to viewer), "
        "sitting cross-legged, small and unaware, surrounded by ethereal "
        "theta wave structures that dwarf her — she is inside the program being written. "
        "The specific tragedy of innocent programming — not evil, not deliberate, "
        "just transmission without consent, the weight of inheritance. "
        "Base: Doré-style warm black #0F0B08, Theta waves: #C41E3A crimson with soft luminescence, "
        "Child: pure #1A1A1A dark silhouette, Light source: diffuse cold white #E8E8F0 from above. "
        "Gustave Doré's illustrations for Paradise Lost (1866) — the lone figure beneath cosmic architecture. "
        "No visible faces, no explicit religious symbols, no bright colors, no children's illustration style. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "05", "layout": "card",
    "title": "O TERMOSTATO\nQUE VOCÊ NÃO VÊ.",
    "body": (
        "Joe Dispenza analisou neuroimagens de pacientes com padrões\n"
        "repetitivos de autossabotagem. O que encontrou:\n"
        "o corpo se torna a mente.\n"
        "Quando o nível financeiro começa a exceder o que o sistema nervoso\n"
        "reconhece como seguro, o corpo gera desconforto físico real.\n"
        "Não é fraqueza psicológica. É homeostase neurológica.\n"
        "O mesmo mecanismo que mantém sua temperatura em 36,5°C\n"
        "mantém seu padrão de renda no número que foi calibrado como 'normal'\n"
        "antes de você ter memória consciente."
    ),
    "prompt": (
        "Industrial macro photography, Beksinski labyrinthine architecture, "
        "extreme close-up of mechanical device, film noir lighting, "
        "one-point perspective creating depth into frame. "
        "Extreme macro of vintage thermostat mechanism, internal gears exposed, "
        "shot from directly above at 15-degree angle, mechanical components "
        "filling the entire frame, depth of field shallow — foreground sharp, background dissolving into darkness. "
        "Vintage mechanical thermostat with cover removed, intricate brass gears and copper coil mechanisms, "
        "one central gear has the subtle suggestion of a human face in its texture (pareidolia — not obvious, discovered), "
        "the mechanism is clearly automatic — it does not wait for input. "
        "The cold precision of something that operates whether you want it to or not. "
        "Metal: desaturated #2C2416 aged brass, Gears: #8B6914 oxidized gold, "
        "Accent gear: #C41E3A crimson highlight, Background: #0A0A0A black. "
        "Beksinski's mechanical organic forms, Richard Avedon's close-up precision. "
        "No digital/cyborg aesthetic, no science fiction, no household thermostat — must be vintage mechanical, "
        "no obvious human faces — only pareidolia suggestion. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "06", "layout": "fullbleed",
    "title": "VOCÊ JÁ VIU\nISTO ACONTECER.",
    "body": (
        "Uma proposta maior chega. Algo em você hesita.\n"
        "Você dá um desconto que não precisava dar.\n"
        "Aceita um prazo que prejudica o fluxo.\n"
        "O projeto que ia dobrar a receita travou numa decisão pequena\n"
        "que você sempre soube que deveria ter tomado diferente.\n"
        "Não foi falta de estratégia. Foi o termostato operando.\n"
        "Ou você recebeu um valor maior.\n"
        "E dois meses depois, sem conseguir explicar como,\n"
        "o dinheiro foi embora — e você voltou ao mesmo patamar.\n"
        "Isso é o SNA defendendo o que aprendeu que é seguro."
    ),
    "prompt": (
        "Caravaggio tenebrism at maximum drama, single point of light source, "
        "90% darkness, cinematic still from psychological thriller, "
        "35mm film texture, sharp focus on single element. "
        "Extreme close-up of human hand on document/paper, "
        "fingers slightly retracted — the gesture of hesitation captured at its exact peak, "
        "document partially illuminated, rest of frame in near-total darkness. "
        "Left hand (suggesting doubt — the non-dominant side), "
        "visible tension in finger tendons without being dramatic, "
        "the specific gesture of almost-signing but pausing, "
        "paper beneath shows a number or signature line (illegible), a pen resting but not held. "
        "The decision that has already been made before the moment of decision, "
        "the body knowing what the mind has not yet admitted — clinical, not dramatic. "
        "Darkness: #080808, Hand: natural skin in harsh amber light #B8742A, "
        "Paper: aged white #E8E4D8 with crimson tint at edge, Pen: metallic #7A7A7A. "
        "Caravaggio's moment of action/inaction, Gregory Crewdson's psychological tableaux. "
        "No visible face, no body beyond the hand, no obvious symbols (money, coins), "
        "must feel documentary, real. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "07", "layout": "fullbleed",
    "title": "O CAMPO PODE\nSER REESCRITO.",
    "body": (
        "Neuroplasticidade não é metáfora motivacional.\n"
        "É alteração mensurável de estrutura neural.\n"
        "O que foi gravado em estado theta pode ser reescrito\n"
        "operando na mesma frequência.\n"
        "Joe Dispenza documentou biomarcadores alterados em 142 participantes\n"
        "após protocolos de coerência neurológica.\n"
        "(Journal of Alternative and Complementary Medicine, 2017)\n"
        "O teto não é sua identidade.\n"
        "É uma calibração antiga, feita por pessoas que também tinham tetos.\n"
        "A saída não é mais estratégia.\n"
        "É intervir na camada onde o teto foi construído."
    ),
    "prompt": (
        "Architectural photography, Gustave Doré's sacred geometry of escape, "
        "long exposure implied, single source of extreme light, "
        "the precision of structural photography meets fine art. "
        "Dead-center composition: a fissure (crack) in an ancient stone wall, "
        "fissure runs vertically through the full height of the frame, "
        "light source is beyond the wall — not warm sunrise, cold precise light, "
        "the fissure is narrow but sufficient — possibility, not promise. "
        "The fissure itself as subject — not metaphorical, structural, "
        "ancient stone texture around it suggesting permanence of the wall "
        "and the reality of the opening, no person, no hands — pure architecture of possibility. "
        "Not hope as emotion — hope as architectural fact. "
        "Stone: #1A1614 near-black with texture variation, Fissure edge: #3A3330, "
        "Light through fissure: #E8ECFF cold blue-white (not warm — scientific), "
        "Vignette: #0A0A0A black edges, zero warmth in the light source. "
        "Doré's architectural scale, Andreas Gursky's structural precision, James Turrell's light installations. "
        "No sunrise warmth, no person silhouetted, no tunnel, no open door (cliché), "
        "no motivational landscape — purely structural and architectural. "
        "Vertical portrait, 4:5 ratio. No text, no readable symbols, no watermarks. "
        "The image is a complete visual argument — legible without any text."
    ),
  },
  {
    "num": "08", "layout": "fullbleed",
    "title": "SEU PROBLEMA\nNUNCA FOI\nESTRATÉGIA.",
    "body": (
        "Você não tem um deficit de conhecimento financeiro.\n"
        "Você tem um teto de segurança calibrado pelo seu sistema nervoso\n"
        "antes dos 7 anos — operando 24 horas por dia, 95% das suas decisões.\n"
        "Essa é a razão pela qual as pessoas mais inteligentes,\n"
        "mais disciplinadas e mais bem-informadas\n"
        "continuam voltando ao mesmo número.\n"
        "Não é o mercado. Não é o momento. Não é falta do método certo.\n"
        "É o campo que você herdou — e que pode ser reescrito.\n\n"
        "Comente FONTE se você já se pegou sabotando\n"
        "uma oportunidade financeira real sem conseguir explicar por quê."
    ),
    "prompt": (
        "Typography as architecture, manuscript sacred geometry, "
        "pure black field with a single architectural element as the sole visual anchor, "
        "no photographic element — the visual silence gives maximum weight, "
        "letterpress printing aesthetic meets contemporary minimalism. "
        "Vertical centering with intentional imbalance: main visual element occupies upper 70%, "
        "crimson accent element in lower 20%, 10% void at bottom, generous margins, the composition breathes. "
        "A single wall, perfectly flat, absolute matte black, with a thin crimson horizontal line "
        "approximately at two-thirds height — precise, deliberate, the line that marks the ceiling. "
        "Above the line: void. Below the line: the entire story of the carousel compressed into this geometry. "
        "The silence after a diagnosis — not relief, recognition. "
        "Background: #060606 absolute black, The line: #C41E3A crimson — thin, exact, 2px equivalent, "
        "Below line zone: slightly lighter #0F0F0F — barely perceptible, zero other colors. "
        "The typography of Emigre magazine's severe issues, Jan Tschichold's 'The New Typography' (1928), "
        "Massimo Vignelli's typographic minimalism — the aesthetic of manifestos. "
        "No background image, no texture, no gradient, no drop shadows, "
        "no decorative elements, no borders — pure black except the line. "
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
