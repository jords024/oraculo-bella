#!/usr/bin/env python3
"""
Regenera apenas as cenas 06 e 07 do Reel O Observador.
Voz e SFX já existem — só renderiza os vídeos.
"""

import os
import sys
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.agentes.video_prompt_builder import build_kling_prompt
from infra.video.kling_pro_manager import gerar_video_kling_pro

REEL_DIR = Path("campanhas/reels/o-observador")

CENAS = [
    {
        "num": 6,
        "visual": (
            "Ultra slow motion: a human figure lying in darkness, eyes closing. "
            "At the precise threshold between waking and sleep, the body begins dissolving "
            "into thousands of golden particles that drift upward like embers. "
            "The face holds absolute peace. The dissolution is not death. "
            "It is return. The particles drift into deep space and become stars."
        ),
    },
    {
        "num": 7,
        "visual": (
            "A silhouette walks through vast darkness searching — hands reaching outward. "
            "Then stops. Turns inward. From the center of the chest, a radiant golden light "
            "ignites and expands outward, illuminating the entire void. "
            "Everything the figure was searching for materializes in the light — "
            "not brought from outside, but revealed from within. "
            "The light grows until it fills the entire frame."
        ),
    },
]


def run():
    print("\n=== REGENERANDO CENAS 06 e 07 — O OBSERVADOR ===\n")

    for cena in CENAS:
        num     = cena["num"]
        num_str = f"{num:02d}"
        cena_dir = REEL_DIR / f"cena_{num_str}"
        cena_dir.mkdir(parents=True, exist_ok=True)

        print(f"[CENA {num_str}] Kling v1.6 Pro renderizando...")
        prompt_final = build_kling_prompt(cena["visual"])
        resultado = gerar_video_kling_pro(prompt_final, "video.mp4", output_dir=str(cena_dir))

        if resultado:
            print(f"[CENA {num_str}] Salvo em: {resultado}\n")
        else:
            print(f"[CENA {num_str}] FALHOU — tente novamente.\n")

    print("=== CONCLUÍDO ===")
    print(f"Assets em: {REEL_DIR}")


if __name__ == "__main__":
    run()
