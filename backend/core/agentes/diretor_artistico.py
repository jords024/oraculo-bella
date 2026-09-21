#!/usr/bin/env python3
"""
diretor_artistico.py — Diretor Artístico — Oráculo Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Orquestra o pipeline completo de geração de carrossel:

  1. Recebe lista de 10 slides (SlideData)
  2. Decide modo (image | text) e cover para cada slide
  3. Enriquece prompts com contexto emocional do estado
  4. Gera imagem via GPT Image 2 para slides de imagem
  5. Compõe cada slide com compose_util_v3
  6. Salva na pasta de saída (Desktop)
  7. Registra no dashboard

REGRAS DE MODO (padrão 10-slide Método Jordânico):
  S01 → image, cover=True   (DISRUPÇÃO — imagem máxima)
  S02 → image               (DESCIDA — imagem com peso)
  S03 → image               (NOMEAÇÃO — raiva tem força visual)
  S04 → text                (PROFUNDIDADE — dado científico, denso)
  S05 → text                (QUEDA FUNDA — frases que queimam)
  S06 → text                (ESPELHO — fundo preto = espelho literal)
  S07 → image               (ASCENSÃO — luz visual, esperança)
  S08 → image               (CRISTALIZAÇÃO — visual amplo, resolução)
  S09 → text                (SETUP CTA — urgência pura)
  S10 → image               (CTA FIXO — portal dourado)

  Override por comprimento de corpo:
    > 140 palavras → força text
    < 15 palavras  → força image (exceto se não há prompt)
"""

import sys
import time

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv

load_dotenv()

from dataclasses import dataclass
from pathlib import Path

from core.agentes.register_carousel import broadcast_event
from core.util.compose_util_v3 import compose
from core.util.gen_image_openai import gen_openai as gen_image


def d_print(msg: str):
    """Print to console and broadcast to dashboard terminal."""
    print(msg)
    broadcast_event("terminal_log", {"message": msg})


# ── CONFIGURAÇÕES ──────────────────────────────────────────────────────────────
DESKTOP        = Path("C:/Users/julia/Desktop")
DEFAULT_PRESET = "revelacao"

# Modo padrão por posição de slide (1-indexed)
DEFAULT_MODE: dict[int, tuple[str, bool]] = {
    1:  ("image", True),     # capa
    2:  ("image", False),
    3:  ("image", False),
    4:  ("text",  False),
    5:  ("text",  False),
    6:  ("text",  False),
    7:  ("image", False),
    8:  ("image", False),
    9:  ("text",  False),
    10: ("image", False),    # CTA portal dourado
}

WORD_THRESHOLD_FORCE_TEXT  = 140   # > este → força text_slide
WORD_THRESHOLD_FORCE_IMAGE = 15    # < este → se estava text, força image


# ── DATACLASS DE SLIDE ─────────────────────────────────────────────────────────
@dataclass
class SlideData:
    """Dados completos de um slide individual."""
    num:    int           # 1–10
    estado: str           # "DISRUPÇÃO", "DESCIDA", "NOMEAÇÃO", etc.
    title:  str           # Título (suporta \n para quebras manuais)
    body:   str           # Corpo (suporta **acento**, *itálico*, \n)
    prompt: str = ""      # Prompt de imagem base. Vazio → text_slide forçado
    mode:   str | None  = None   # 'image' | 'text' | None (auto)
    cover:  bool | None = None   # True | False | None (auto)


# ── ATMOSFERA E ENERGIA POR CONTEXTO ──────────────────────────────────────────
PRESET_ATMOSPHERE = {
    "revelacao": (
        "Cinematic moody photograph. High-contrast lighting, 35mm film grain, "
        "dramatic chiaroscuro atmosphere. Expressive human portrait with deep emotion and realistic textures."
    ),
    "sagrado": (
        "Cinematic portrait photography. Warm golden hour lighting, volumetric light rays, "
        "dramatic shadow contrast, authentic human features and natural skin texture."
    ),
    "cosmico": (
        "Cinematic dark photography. Deep atmospheric lighting, subtle teal and warm amber contrast, "
        "mysterious moody aura, realistic 35mm photograph."
    ),
    "esoterico": (
        "Cinematic realistic photograph. Deep shadow transitions, dramatic single light source, "
        "high emotional intensity, natural grain and cinematic color grading."
    ),
}

SLIDE_ENERGY = {
    "DISRUPÇÃO":    (
        "Maximum visual magnetism — VIBRANT, alive, scroll-stopping. "
        "Bold electric colors: deep indigo, vivid gold, electric blue or sacred crimson. "
        "Dramatic light source that commands attention. The image must be IMPOSSIBLE to scroll past. "
        "Think: Van Gogh meets cinematic spirituality. Alive, not just dark."
    ),
    "DESCIDA":      (
        "Descent into recognition — atmospheric depth, moody but colorful. "
        "Deep blues, indigos, muted purples. A human figure or silhouette in the scene. "
        "Emotional weight with visual richness, not flat darkness."
    ),
    "NOMEAÇÃO":     (
        "Confrontational revelation — powerful, accusatory, alive. "
        "Strong contrast between shadow and vivid light: gold vs deep blue, crimson vs black. "
        "Something being unmasked — lightning, dramatic reveal, visible tension in the light itself."
    ),
    "PROFUNDIDADE": (
        "Layered visual depth — something hidden becoming visible. "
        "Rich textures, multiple planes, sacred geometry or cosmic structure. "
        "Electric teal, deep violet, gold filaments. Intellectually beautiful."
    ),
    "QUEDA FUNDA":  (
        "Visceral emotional depth — but with visual richness. "
        "Deep space blues, abyssal purples, a lone human figure falling or suspended. "
        "Not flat black — deep, textured, layered darkness with color within it."
    ),
    "ESPELHO":      (
        "Self-recognition — reflective, cosmic, intimate. "
        "A human figure facing their own reflection or a luminous threshold. "
        "Blues and silvers with gold accents. The viewer recognizes themselves in the image."
    ),
    "ASCENSÃO":     (
        "True luminous hope — the image GLOWS. "
        "Full color saturation: warm golds, celestial blues, dawn light breaking. "
        "A human silhouette moving upward toward radiant light. "
        "Open sky, cosmic expansion, visible joy in the light itself."
    ),
    "CRISTALIZAÇÃO": (
        "Pure radiant resolution — clear, luminous, complete. "
        "Sacred gold, warm amber, crystalline light. Something finally revealed in its true form. "
        "Beautiful and weighty — gravity with luminosity. A final form, glowing."
    ),
    "SETUP CTA":    (
        "Tension of luminous possibility — a glowing threshold or cosmic doorway. "
        "Something brilliant just beyond reach. Gold, teal, or violet light. "
        "A human silhouette at the edge of transformation."
    ),
    "CTA FIXO":     (
        "Sacred luminous portal — radiant gold, divine light, ancient and powerful. "
        "Warm gold and amber tones, celestial glow, inviting passage. "
        "A threshold that has always been there, now fully visible."
    ),
}

TECHNICAL_SUFFIX = (
    " — TECHNICAL REQUIREMENTS: Portrait orientation. "
    "Absolutely NO text, NO letters, NO words anywhere in image. "
    "Human figures, silhouettes and faces ARE WELCOME and encouraged — they carry emotion. "
    "Style: cinematic, photorealistic, digital art or painterly — whatever serves the scene best. "
    "VIBRANT and saturated colors — never flat, never uniformly dark. "
    "Each image must have a clear SUBJECT and EMOTIONAL STORY, not just atmosphere or light beams. "
    "Upper 40% of frame open for text overlay. "
    "High detail, cinematic depth, expressive and alive."
)


# ── DECISÃO DE MODO ───────────────────────────────────────────────────────────
def _word_count(text: str) -> int:
    return len(text.split())


def _decide_mode(slide: SlideData) -> tuple[str, bool]:
    """
    Retorna (mode, cover) para o slide.
    Prioridade: explícito > override por comprimento > padrão por posição.
    """
    # 1. Modo explícito tem prioridade total
    if slide.mode is not None:
        m = slide.mode
        c = slide.cover if slide.cover is not None else (slide.num == 1)
        return m, c

    # 2. (Removida a regra que forçava text_slide sem prompt)

    # 3. Padrão por posição
    m, c = DEFAULT_MODE.get(slide.num, ("image", False))

    # 4. Override por comprimento do corpo
    wc = _word_count(slide.body)
    if wc > WORD_THRESHOLD_FORCE_TEXT:
        m = "text"
    elif wc < WORD_THRESHOLD_FORCE_IMAGE and m == "text":
        m = "image"

    # 5. Cover explícito override
    if slide.cover is not None:
        c = slide.cover

    return m, c


# ── ENRIQUECIMENTO DE PROMPT ───────────────────────────────────────────────────
def _enrich_prompt(slide: SlideData, preset_name: str) -> str:
    """
    O prompt base do slide é DOMINANTE.
    Atmosfera e energia são dicas secundárias — não sobrepõem a cena.
    """
    atmos  = PRESET_ATMOSPHERE.get(preset_name, PRESET_ATMOSPHERE["revelacao"])
    energy = SLIDE_ENERGY.get(slide.estado.upper(), "Esoteric, expressive, vivid.")

    base = slide.prompt.strip()
    if not base:
        base = (
            f"Cinematic esoteric scene — {slide.estado.lower()} emotional state. "
            f"Vivid colors, human figure present, expressive and alive."
        )

    # Prompt base domina. Atmosfera e energia são hints leves no final.
    return (
        f"{base} "
        f"Visual mood: {energy} "
        f"Color palette hint: {atmos}"
        f"{TECHNICAL_SUFFIX}"
    )


# ── GERAÇÃO DE SLIDE INDIVIDUAL ────────────────────────────────────────────────
def _generate_slide(
    slide:       SlideData,
    preset_name: str,
    out_dir:     Path,
    retries:     int = 2,
) -> bool:
    """Gera, compõe e salva um slide. Retorna True se bem-sucedido."""
    mode, cover = _decide_mode(slide)
    fname       = out_dir / f"slide-{slide.num:02d}.jpg"

    label = f"S{slide.num:02d} [{slide.estado}]"
    mode_label = f"modo={mode.upper()}{' (CAPA)' if cover else ''}"
    d_print(f"\n  ┌─ {label} → {mode_label}")

    # RAW CACHE SYSTEM (Evitar regeração e gasto de créditos)
    raw_fname = out_dir / f"raw-{slide.num:02d}.jpg"
    img_bytes = None

    if mode in ("image", "card"):
        if raw_fname.exists():
            print(f"  │  🔄 Raw Cache encontrado! Carregando {raw_fname.name} (Poupando créditos OpenAI)")
            img_bytes = raw_fname.read_bytes()
        else:
            enriched = _enrich_prompt(slide, preset_name)
            print("  │  Gerando imagem DALL-E 3...")

            for attempt in range(1, retries + 1):
                try:
                    img_bytes = gen_image(enriched)
                    if img_bytes:
                        print(f"  │  ✓ Imagem gerada ({len(img_bytes) // 1024} KB)")
                        # SALVAR RAW CACHE AQUI
                        raw_fname.write_bytes(img_bytes)
                        print("  │  💾 Raw Cache salvo para reuso futuro.")
                        break
                    else:
                        print(f"  │  ⚠️  Tentativa {attempt}: resposta vazia")
                except Exception as e:
                    d_print(f"  │  ⚠️  Tentativa {attempt} falhou: {e}")
                    if attempt < retries:
                        time.sleep(4)

            if not img_bytes:
                print("  │  ❌ Falha ao gerar imagem. Fallback → text_slide.")
                mode = "text"

    # S10 usa o mesmo preset do carrossel — sem override forçado
    effective_preset = preset_name

    try:
        result = compose(
            img_bytes   = img_bytes,
            title       = slide.title,
            body        = slide.body,
            mode        = mode,
            preset_name = effective_preset,
            cover       = cover,
        )
        result.save(str(fname), "JPEG", quality=95)
        size_kb = fname.stat().st_size // 1024
        print(f"  └─ ✅ {fname.name} salvo ({size_kb} KB)")
        return True

    except Exception as e:
        print(f"  └─ ❌ Erro ao compor slide: {e}")
        import traceback; traceback.print_exc()
        return False


# ══════════════════════════════════════════════════════════════════════════════
# API PÚBLICA
# ══════════════════════════════════════════════════════════════════════════════

def gerar_carrossel(
    tema:          str,
    tema_slug:     str,
    slides:        list[SlideData],
    preset_name:   str  = DEFAULT_PRESET,
    formato:       str  = "A",
    caption:       str  = "",
    revisor_score: float = 0.0,
    notes:         str  = "",
    out_dir:       Path | None = None,
    registrar:     bool = True,
) -> Path:
    """
    Pipeline completo de geração de carrossel.

    Args:
        tema:          Nome legível do carrossel (ex: 'Pastor & Frequência').
        tema_slug:     Slug para dashboard (ex: 'pastor-frequencia').
        slides:        Lista de SlideData (normalmente 10 slides).
        preset_name:   'revelacao' | 'sagrado' | 'cosmico'.
        caption:       Caption completo do Instagram.
        revisor_score: Score da revisão autônoma (0.0–15.0).
        notes:         Notas adicionais para o dashboard.
        out_dir:       Diretório de saída. Default: Desktop/carrossel-{tema_slug}.
        registrar:     Se True, registra no dashboard ao final.

    Returns:
        Path do diretório de saída com os slides gerados.
    """
    if out_dir is None:
        out_dir = DESKTOP / f"carrossel-{tema_slug}"
    out_dir.mkdir(parents=True, exist_ok=True)

    if registrar:
        try:
            from core.agentes.register_carousel import broadcast_event
            from core.agentes.register_carousel import register as reg
            # Registra no início como gerando
            c_entry = reg(
                title         = tema,
                theme         = tema_slug,
                slides_dir    = str(out_dir),
                format        = formato,
                caption       = caption,
                revisor_score = revisor_score,
                notes         = notes or "Diretor Artístico v1",
                status        = "gerando"
            )
            broadcast_event("generation_started", {"carousel_id": c_entry["id"]})
        except Exception as e:
            d_print(f"  ⚠️  Falha ao iniciar registro: {e}")
            registrar = False

    line = "═" * 60
    d_print(f"\n{line}")
    d_print("  🎬 DIRETOR ARTÍSTICO — Oráculo Manager")
    d_print(f"  Carrossel: {tema}")
    d_print(f"  Preset: {preset_name.upper()} | {len(slides)} slides")
    d_print(f"  Saída: {out_dir}")
    d_print(f"{line}")

    ok_count = 0
    for slide in slides:
        success = _generate_slide(slide, preset_name, out_dir)
        if success:
            ok_count += 1
            if registrar:
                try:
                    percent = int((slide.num / len(slides)) * 100)
                    broadcast_event("slide_generated", {
                        "carousel_id": c_entry["id"],
                        "slide_num": slide.num,
                        "total_slides": len(slides),
                        "percent": percent,
                        "filename": f"slide-{slide.num:02d}.jpg",
                        "title": slide.title
                    })
                except Exception:
                    pass

    d_print(f"\n{'─' * 60}")
    d_print(f"  ✅ {ok_count}/{len(slides)} slides gerados com sucesso")
    d_print(f"  📁 {out_dir.resolve()}")

    if registrar and ok_count > 0:
        try:
            reg(
                title         = tema,
                theme         = tema_slug,
                slides_dir    = str(out_dir),
                format        = formato,
                caption       = caption,
                revisor_score = revisor_score,
                notes         = notes or f"Diretor Artístico v1 — {ok_count}/{len(slides)} slides.",
                status        = "pronto"
            )
            broadcast_event("generation_done", {"carousel_id": c_entry["id"]})
            d_print("  📋 Registrado no dashboard com status pronto.")
        except Exception as e:
            d_print(f"  ⚠️  Dashboard não finalizou registro: {e}")

    d_print(f"{line}\n")
    return out_dir
