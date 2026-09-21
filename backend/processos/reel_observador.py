#!/usr/bin/env python3
"""
reel_observador.py — Reel 02: O Observador
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Produção completa do Reel "O Observador" — Fonte Oculta.

Roteiro fixo, direção de cena cirúrgica, Kling v2.1 Pro como motor de vídeo.

Para ver em tempo real:
  Terminal 1 → python processos/reel_preview.py
  Terminal 2 → python processos/reel_observador.py
"""

import os
import sys
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.agentes.musico import gerar_musica_fundo
from core.agentes.sonoplasta import gerar_sfx
from core.agentes.video_prompt_builder import build_kling_prompt
from core.agentes.voz_misteriosa import gerar_voz_cinematografica
from infra.video.kling_pro_manager import gerar_video_kling_pro

REEL_DIR = Path("campanhas/reels/o-observador")


class C:
    GOLD  = "\033[38;5;214m"
    CYAN  = "\033[96m"
    GREEN = "\033[92m"
    WARN  = "\033[93m"
    DIM   = "\033[2m"
    RST   = "\033[0m"
    BOLD  = "\033[1m"


# ── ROTEIRO ───────────────────────────────────────────────────────────────────
# Copy: Método Jordânico — 7 falas, 10-15 palavras cada
# Direção visual: metáforas surrealistas, dark fantasy, cinematográfico
# ─────────────────────────────────────────────────────────────────────────────

CENAS = [
    {
        "num": 1,
        "estado": "GANCHO PARADOXAL",
        "fala": "Você acredita que é seus pensamentos. Mas seus pensamentos não param de mudar.",
        "visual": (
            "Extreme close-up of a human eye. Inside the pupil, a torrent of glowing "
            "symbols, words and faces flows like a river — constantly changing, dissolving, "
            "reforming. But deep in the center, a single point of absolute still golden light "
            "watches everything. Unwavering. Silent. The river moves. The light never does."
        ),
        "sfx": "Deep resonant cosmic hum, low frequency drone, subtle ancient bell tone fading in",
    },
    {
        "num": 2,
        "estado": "VALIDAÇÃO",
        "fala": "Você já se pegou assistindo seus próprios pensamentos como se fosse outra pessoa.",
        "visual": (
            "A lone dark silhouette sits in absolute darkness, facing an enormous floating "
            "cinema screen made entirely of translucent memories and emotions — scenes from a life "
            "playing in slow motion. The silhouette watches in silence. It is the audience, "
            "not the film. The screen glows cold blue. The figure radiates warm amber."
        ),
        "sfx": "Soft cinematic tension pad, distant whispering ambience, subtle heartbeat pulse",
    },
    {
        "num": 3,
        "estado": "NOMEAÇÃO",
        "fala": "Isso não foi coincidência. Foi o Observador. Ele sempre esteve lá.",
        "visual": (
            "From infinite black void, a single unblinking eye slowly emerges — ancient, "
            "primordial, made entirely of golden light and sacred geometry. "
            "It has always been there, behind everything. "
            "As it fully opens, faint sacred patterns radiate outward like ripples in water. "
            "The eye does not judge. It simply witnesses."
        ),
        "sfx": "Slow ancient metallic resonance, sacred bowl strike, deep mystical drone awakening",
    },
    {
        "num": 4,
        "estado": "PROFUNDIDADE",
        "fala": "Toda tradição mística chama isso de formas diferentes. Atman. Cristo interior. Testemunha.",
        "visual": (
            "A breathtaking visual sequence: a Hindu golden mandala slowly morphs into a "
            "Christian sacred heart radiating light, which flows into a Buddhist dharma wheel "
            "spinning in deep indigo space, dissolving into an Islamic geometric star pattern "
            "of infinite complexity, which transforms into the Kabbalistic Tree of Life with "
            "ten glowing spheres. Each tradition different. Each holding the same light at its center. "
            "A single golden thread connects them all."
        ),
        "sfx": "Sacred multicultural harmonic tones, Tibetan bowl, subtle gregorian echo, oud string",
    },
    {
        "num": 5,
        "estado": "PROFUNDIDADE",
        "fala": "Esse observador não pensa. Não sente medo. Não tem passado. Não tem nome.",
        "visual": (
            "Infinite dark cosmic space. No stars. No edges. No sound. "
            "A single point of pure white light at the center — expanding imperceptibly slowly. "
            "No subject. No object. Pure witnessing. "
            "The camera zooms out impossibly far and the light remains the same size. "
            "It is not in space. Space is inside it."
        ),
        "sfx": "Absolute near-silence, ultra-low 20hz sub bass presence, void ambient",
    },
    {
        "num": 6,
        "estado": "ESPELHO",
        "fala": "Você já esteve nesse silêncio. Uma fração de segundo antes de dormir.",
        "visual": (
            "Ultra slow motion: a human figure lying in darkness, eyes closing. "
            "At the precise threshold between waking and sleep, the body begins dissolving "
            "into thousands of golden particles that drift upward like embers. "
            "The face holds absolute peace. The dissolution is not death. "
            "It is return. The particles drift into deep space and become stars."
        ),
        "sfx": "Hypnotic sleep-threshold drone, soft descending frequency, breath slowing, crystalline fade",
    },
    {
        "num": 7,
        "estado": "VIRADA",
        "fala": "O que você busca do lado de fora nunca saiu de dentro.",
        "visual": (
            "A silhouette walks through vast darkness searching — hands reaching outward. "
            "Then stops. Turns inward. From the center of the chest, a radiant golden light "
            "ignites and expands outward, illuminating the entire void. "
            "Everything the figure was searching for materializes in the light — "
            "not brought from outside, but revealed from within. "
            "The light grows until it fills the entire frame."
        ),
        "sfx": "Rising harmonic resolution, sacred frequency build, golden resonant tone, hopeful crescendo",
    },
]

TRILHA_PROMPT = (
    "Deep meditative ambient music. Ancient mystical atmosphere, "
    "slow hypnotic sacred drone, subtle binaural undertones building in depth and presence. "
    "No percussion. No melody. Pure resonant consciousness. "
    "Final 8 seconds: a single soft piano note resolves into silence."
)


# ── PIPELINE ──────────────────────────────────────────────────────────────────

def run():
    print(f"\n{C.GOLD}{C.BOLD}{'═'*60}")
    print("   REEL: O OBSERVADOR — Fonte Oculta")
    print("   Motor de vídeo: Kling v2.1 Pro")
    print(f"   Pasta: {REEL_DIR}")
    print(f"{'═'*60}{C.RST}\n")

    REEL_DIR.mkdir(parents=True, exist_ok=True)
    total = len(CENAS)

    for cena in CENAS:
        num        = cena["num"]
        num_str    = f"{num:02d}"
        fala       = cena["fala"]
        visual     = cena["visual"]
        sfx_prompt = cena["sfx"]
        estado     = cena["estado"]

        cena_dir = REEL_DIR / f"cena_{num_str}"
        cena_dir.mkdir(parents=True, exist_ok=True)

        print(f"{C.GOLD}{C.BOLD}━━━ CENA {num_str}/{total} — {estado} ━━━{C.RST}")
        print(f"{C.DIM}  Fala: {fala}{C.RST}\n")

        # Voz
        print(f"  {C.WARN}[VOZ]{C.RST} ElevenLabs TTS...")
        gerar_voz_cinematografica(fala, "voz.mp3", output_dir=str(cena_dir))

        # SFX
        print(f"  {C.WARN}[SFX]{C.RST} ElevenLabs Sound Gen...")
        gerar_sfx(prompt=sfx_prompt, nome_arquivo="sfx.mp3", duration_seconds=5.0, output_dir=str(cena_dir))

        # Vídeo — Kling v2.1 Pro
        print(f"  {C.WARN}[VIDEO]{C.RST} Kling v2.1 Pro renderizando...")
        prompt_final = build_kling_prompt(visual)
        gerar_video_kling_pro(prompt_final, "video.mp4", output_dir=str(cena_dir))

        print(f"  {C.GREEN}✅ Cena {num_str} completa.{C.RST}\n")

    # Trilha — fica na raiz do reel
    print(f"{C.GOLD}{C.BOLD}━━━ TRILHA SONORA ━━━{C.RST}")
    print(f"  {C.WARN}[MÚSICO]{C.RST} Stable Audio composing...")
    gerar_musica_fundo(TRILHA_PROMPT, "trilha_fundo.mp3", duration=42, output_dir=str(REEL_DIR))

    print(f"\n{C.GOLD}{C.BOLD}{'═'*60}")
    print("   PRODUÇÃO CONCLUÍDA")
    print(f"{'═'*60}{C.RST}")
    print(f"  {C.GREEN}Assets em: {REEL_DIR}/{C.RST}")
    print(f"\n  {C.DIM}Abra http://localhost:4242 para ver tudo montado.{C.RST}\n")


if __name__ == "__main__":
    run()
