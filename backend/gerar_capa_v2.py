#!/usr/bin/env python3
"""
gerar_capa_v2.py
Capa do carrossel "Frequência do Corpo" — Diretor de Arte v2
Arquitetura de 7 camadas + 3 variações + avaliação automática.
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

import numpy as np

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from io import BytesIO
from pathlib import Path

from PIL import Image

from core.util.compose_util import compose

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-3.1-flash-image-preview"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

OUT_DIR = Path("C:/Users/julia/Desktop/carrossel-frequencia-corpo")
OUT_DIR.mkdir(parents=True, exist_ok=True)

TITLE = "O dinheiro não obedece ao trabalho.\nEle obedece à frequência\ndo corpo que o carrega."
BODY  = (
    "Essa frequência foi gravada no seu sistema nervoso\n"
    "antes de você ter palavras para descrevê-la.\n"
    "Ela opera agora. Antes de qualquer decisão sua."
)

# ══════════════════════════════════════════════════════════════════════════════
# FASE 1 — ARQUITETURA EMOCIONAL
# ══════════════════════════════════════════════════════════════════════════════
# Emoção primária (0,3s): Awe + reconhecimento — "eu sempre soube disso"
# Emoção secundária: Inquietação — "meu corpo está transmitindo agora e eu nunca controlei"
# Scroll-stop: A escala — corpo humano como antena cósmica irradiando campo visível
# Conceito em 2s: O campo eletromagnético do corpo curva e direciona energia — visível
#
# FASE 2 — METÁFORA VISUAL (3 leituras)
# Superficial: Figura humana dourada irradiando em cosmos escuro — beleza
# Conceitual: Campo eletromagnético curvando partículas — frequência determina resultado
# Filosófica: O corpo é um instrumento de transmissão calibrado antes da consciência
#
# FASE 3 — MESTRES
# Alex Grey (anatomia transcendental, corpo como cosmos)
# + Gustav Doré (escala épica, o divino intervindo)
# + toque de Android Jones (energia visionária digital)
# ══════════════════════════════════════════════════════════════════════════════

# ── 3 VARIAÇÕES — mesmo conceito, abordagens visuais distintas ────────────────

VARIATIONS = [
    {
        "id": "A",
        "name": "Anatomia Cósmica",
        "prompt": (
            # [1. ESTILO & MESTRES]
            "In the visual language of Alex Grey's transcendental anatomy merged with "
            "Gustav Doré's cosmic divine scale. Rich digital painting, luminous sacred art. "

            # [2. EMOÇÃO PRIMEIRA]
            "The image evokes awe and deep recognition — a truth the viewer has always felt "
            "but never seen visualized. The body is not separate from the cosmos. It IS the cosmos, individualized. "

            # [3. COMPOSIÇÃO & ESCALA]
            "A human figure at the center of the composition, seen from the torso up, occupying 40% of the frame height. "
            "The figure faces slightly upward, eyes closed, in a state of transmission — not meditation, transmission. "
            "Above and around the figure: deep cosmic space expands infinitely — galaxies, nebulae, star clusters. "
            "The cosmic elements are not background — they are CONNECTED to the figure through visible field lines. "
            "The lower 30% of the image transitions to deep darkness for text space. "

            # [4. A METÁFORA VISUAL]
            "From the figure's chest: a toroidal electromagnetic field expands outward — "
            "rendered as precise, luminous amber-gold concentric rings with visible energy pathways between them. "
            "Along these field pathways: streams of fine golden particles flow — some toward the figure, some away — "
            "their trajectories CURVED by the field geometry, proving that the body's frequency steers outcomes. "
            "The figure's hands are open at its sides. It does nothing. The field does everything. "
            "Faint sacred geometry (Metatron's Cube) overlays the chest area — the body as cosmic architecture. "
            "Through the torso, the nervous system is faintly visible — glowing amber neural pathways — "
            "the hardware that generates the frequency. "

            # [5. COR COMO EMOÇÃO]
            "Gold and amber: the frequency, the transmission, the divine signal. "
            "Deep cosmic black: the responsive void that rearranges around frequency. "
            "Faint warm white: the particles being directed by the field. "
            "No cool colors. No blue. No green. Everything warm or black. "

            # [6. LUZ COMO NARRATIVA]
            "Light emanates FROM the figure's chest outward — the figure is the light source, not a receiver. "
            "The cosmos around is illuminated BY the figure's field, not the other way around. "
            "Subtle rim light on the figure's silhouette edges from the cosmic background. "

            # [7. TEXTURA & ACABAMENTO]
            "Rich painterly texture with luminous particles. Sacred geometry as translucent overlay. "
            "Visible fine detail in the electromagnetic rings — they are precise, not fuzzy. "
            "Cosmic elements have depth — nebulae have gas layers, stars have glow halos. "
            "The overall quality feels like a frame from a $200 million sci-fi film's most transcendent scene. "

            # RESTRIÇÕES
            "Vertical portrait, 4:5 ratio, 1080x1350px. "
            "No text, no readable symbols, no watermarks, no logos. "
            "No cartoonish or flat elements. Photorealistic painterly quality. "
            "Multiple conceptual layers visible simultaneously."
        ),
    },
    {
        "id": "B",
        "name": "O Transmissor",
        "prompt": (
            # [1. ESTILO & MESTRES]
            "In the visual language of Android Jones' visionary digital art merged with "
            "Caravaggio's dramatic chiaroscuro. Luminous against absolute darkness. "

            # [2. EMOÇÃO PRIMEIRA]
            "The image creates an immediate sense of power and recognition — "
            "the viewer sees their own body as a transmitter for the first time. Awe-inducing scale. "

            # [3. COMPOSIÇÃO & ESCALA]
            "Full body human figure at center, standing, occupying 55% of frame height. "
            "The figure is surrounded by absolute darkness on all sides — but the darkness RESPONDS to the field. "
            "The composition is dramatic: figure at center, field expanding to all edges. "
            "Lower 25% darkens naturally for text space. "

            # [4. A METÁFORA VISUAL]
            "The figure's entire body is visible, with the internal anatomy faintly glowing through — "
            "the spine as a golden axis, the heart as a radiant core, neural pathways as luminous branches. "
            "From the heart center: massive toroidal electromagnetic field expanding outward — "
            "concentric rings of amber light that extend to the very edges of the frame. "
            "Where the field rings pass through the surrounding darkness, "
            "the darkness itself transforms — golden particles crystallize in the field's wake, "
            "as if reality is being rewritten by the transmission. "
            "The figure stands absolutely still. Eyes closed. Arms at sides. "
            "The body is the antenna. The field is the broadcast. The world rearranges. "

            # [5. COR COMO EMOÇÃO]
            "Luminous amber-gold: the living frequency emanating from within. "
            "Deep absolute black: the void before the signal reaches it. "
            "Transformed gold: where the field has already rewritten reality. "
            "The color gradient from figure outward: bright gold → amber → darkness → faint gold at edges. "

            # [6. LUZ COMO NARRATIVA]
            "The figure IS the only light source. No external illumination. "
            "Light radiates from within the body — heart, spine, neural crown. "
            "Caravaggio chiaroscuro: absolute darkness against luminous body. "

            # [7. TEXTURA & ACABAMENTO]
            "Rich digital painterly quality. The electromagnetic rings have precise detail — "
            "thin, luminous, with subtle interference patterns where they overlap. "
            "The internal anatomy glow is delicate — not X-ray, but transcendental — Alex Grey influence. "
            "Fine golden particles in the field have soft bokeh quality. "
            "The overall feel: sacred, powerful, true. "

            # RESTRIÇÕES
            "Vertical portrait, 4:5 ratio, 1080x1350px. "
            "No text, no readable symbols, no watermarks, no logos. "
            "Photorealistic luminous art. Not cartoonish. Not flat. "
            "Multiple layers of meaning visible at once."
        ),
    },
    {
        "id": "C",
        "name": "Frequência vs Esforço",
        "prompt": (
            # [1. ESTILO & MESTRES]
            "In the visual language of Alex Grey's sacred anatomy combined with "
            "Beksinski's surreal dark architecture. Rich visionary digital art. "

            # [2. EMOÇÃO PRIMEIRA]
            "The image creates confrontation — the viewer sees two realities and recognizes "
            "which one they have been living in. Uncomfortable recognition followed by awe. "

            # [3. COMPOSIÇÃO & ESCALA]
            "Split narrative composition — not a hard line split, but two realities coexisting in one frame. "
            "Right-center: a luminous human figure, standing upright, 45% of frame height, eyes closed. "
            "Left side: a darker figure, hunched, straining, smaller (30% of frame height), face down. "
            "Above: cosmic space with galaxies connects to the luminous figure but not to the straining one. "
            "Lower 28% transitions to darkness for text overlay. "

            # [4. A METÁFORA VISUAL]
            "The luminous figure: electromagnetic toroidal field expands outward from the heart — "
            "amber-gold rings, precise and wide. Streams of golden particles follow the field lines TOWARD the figure. "
            "Sacred geometry (Flower of Life) faintly glowing at the chest — the body as cosmic receptor. "
            "The cosmos above sends a column of golden light that connects to this figure's crown. "
            "The straining figure: similar field lines but COLLAPSING inward — crimson-amber, contracting. "
            "Energy particles flow AWAY from this figure, dissipating into the surrounding darkness. "
            "No cosmic connection above the straining figure — only darkness pressing down. "
            "The contrast is the entire argument: frequency determines what flows toward you. "
            "Effort without frequency pushes everything away. "

            # [5. COR COMO EMOÇÃO]
            "Luminous gold: the open frequency, abundance flowing toward resonance. "
            "Deep crimson-amber: trapped effort, energy consumed without return. "
            "Cosmic black: the responsive void. "
            "Bright warm white: the cosmic light column connecting frequency to source. "

            # [6. LUZ COMO NARRATIVA]
            "The luminous figure generates its own light from within. "
            "The straining figure has no inner light — only reflected crimson from its own dissipating energy. "
            "Cosmic light connects only to the figure in the right frequency. "

            # [7. TEXTURA & ACABAMENTO]
            "Rich layered digital painting. The electromagnetic fields are rendered with precision — "
            "thin luminous rings with visible energy flow along them. "
            "The sacred geometry is a translucent overlay, not heavy-handed. "
            "The straining figure is less detailed — darker, more abstract — the viewer's eye goes to the light. "
            "Cosmic elements: nebulae, star clusters, rendered with photorealistic depth. "

            # RESTRIÇÕES
            "Vertical portrait, 4:5 ratio, 1080x1350px. "
            "No text, no readable symbols, no watermarks, no logos. "
            "Rich visionary art. Not cartoonish. Not flat. "
            "The image is a complete visual argument — legible without text."
        ),
    },
]


def gen(prompt: str, retries: int = 4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 15 * attempt
            print(f"    aguardando {wait}s...")
            time.sleep(wait)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body_resp = json.loads(r.read())
            parts = body_resp.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            ip = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if ip:
                return base64.b64decode(ip["inlineData"]["data"])
            print(f"    Sem imagem: {json.dumps(body_resp)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"    HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"    Erro: {e}")
    return None


def evaluate_image(img_bytes: bytes) -> dict:
    """Avalia a imagem em critérios técnicos mensuráveis."""
    img = Image.open(BytesIO(img_bytes))
    arr = np.array(img.convert("RGB"))

    # Riqueza visual — desvio padrão dos pixels (quanto maior, mais variação visual)
    richness = float(np.std(arr))

    # Contraste — diferença entre luminosidade alta e baixa
    gray = np.array(img.convert("L"))
    p5, p95 = np.percentile(gray, 5), np.percentile(gray, 95)
    contrast = float(p95 - p5)

    # Warm tone ratio — proporção de pixels com dominância âmbar/dourado
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    warm_mask = (r > g) & (g > b) & (r > 60)
    warm_ratio = float(np.sum(warm_mask) / warm_mask.size)

    # Text zone darkness — o terço inferior deve ser escuro para legibilidade
    bottom_third = gray[int(gray.shape[0]*0.70):, :]
    text_zone_dark = float(np.mean(bottom_third < 60))

    # Score composto
    score = (
        richness / 80 * 0.30 +          # riqueza visual (normalizado ~80 = bom)
        contrast / 200 * 0.25 +          # contraste (normalizado ~200 = bom)
        warm_ratio * 3 * 0.20 +          # tons quentes (~0.33 = bom)
        text_zone_dark * 0.25            # zona de texto escura (~0.80 = bom)
    )

    return {
        "richness": richness,
        "contrast": contrast,
        "warm_ratio": warm_ratio,
        "text_zone_dark": text_zone_dark,
        "score": min(score, 1.0),
    }


# ── EXECUÇÃO ──────────────────────────────────────────────────────────────────
print("\n" + "="*62)
print("  CAPA — Diretor de Arte v2")
print("  3 Variações | 7 Camadas | Avaliação Automática")
print("  Nano Banana 2 | gemini-3.1-flash-image-preview")
print("="*62 + "\n")

results = []

for v in VARIATIONS:
    print(f"[{v['id']}] {v['name']}")
    print(f"    Prompt: {len(v['prompt'])} chars")

    img = gen(v["prompt"])
    if not img:
        print("    FALHOU\n")
        continue

    # Avaliar
    ev = evaluate_image(img)
    print(f"    Riqueza: {ev['richness']:.1f} | Contraste: {ev['contrast']:.0f} | "
          f"Warm: {ev['warm_ratio']:.0%} | TextZone: {ev['text_zone_dark']:.0%}")
    print(f"    Score: {ev['score']:.0%}")

    # Salvar raw
    raw = OUT_DIR / f"capa-v2-raw-{v['id']}.jpg"
    with open(str(raw), "wb") as f:
        f.write(img)

    # Compor
    final = compose(img, TITLE, BODY, layout="dramatico", preset_name="dramatico")
    out = OUT_DIR / f"capa-v2-{v['id']}.jpg"
    final.save(str(out), "JPEG", quality=96)
    print(f"    Salvo → {out.name}\n")

    results.append({"id": v["id"], "name": v["name"], "score": ev["score"],
                     "eval": ev, "path": out, "img": img})

    if v != VARIATIONS[-1]:
        time.sleep(5)

if not results:
    print("Nenhuma variação gerada com sucesso.")
    sys.exit(1)

# Ranking
results.sort(key=lambda x: x["score"], reverse=True)
best = results[0]

final_best = compose(best["img"], TITLE, BODY, layout="dramatico", preset_name="dramatico")
final_path = OUT_DIR / "capa-v2-FINAL.jpg"
final_best.save(str(final_path), "JPEG", quality=96)

print("="*62)
print(f"  CONCLUÍDO — {len(results)}/3 variações")
print("  Ranking:")
for r in results:
    flag = " ★ MELHOR" if r == best else ""
    print(f"    {r['id']} ({r['name']}): {r['score']:.0%}{flag}")
    e = r["eval"]
    print(f"       Riqueza={e['richness']:.1f} Contraste={e['contrast']:.0f} "
          f"Warm={e['warm_ratio']:.0%} TextZone={e['text_zone_dark']:.0%}")
print(f"\n  Final → {final_path.name}")
print("="*62 + "\n")
