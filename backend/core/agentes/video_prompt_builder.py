#!/usr/bin/env python3
import sys

# Força o encoding correto no Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PREFIX = "Vertical 9:16 aspect ratio. Ultra high-end commercial aesthetic, photorealistic, 8K, cinematic lighting, studio-grade color grading. "

SUFFIX = " Deep mystical tones from another dimension, psychedelic realism, extreme macro detail, surreal visual effects. Extremely slow, hypnotic, and subtle camera movement. Immaculate reflections. ABSOLUTELY NO TEXT. No letters, no numbers. No cartoon, no anime."

def build_kling_prompt(descricao_crua: str) -> str:
    """
    Pega a metáfora surreal do Roteirista e envelopa com a 'Coleira de Ouro' da Fonte Oculta.
    Garante que a Kling Video não fuja da estética de alta produção.
    """
    return f"{PREFIX}{descricao_crua}{SUFFIX}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        entrada = " ".join(sys.argv[1:])
    else:
        entrada = "A person holding a glowing smartphone in the dark, but their physical face and skin are stretching and being violently sucked into the phone's screen like a digital black hole."

    prompt_final = build_kling_prompt(entrada)

    print("\n[Diretor de Fotografia] Aplicando DNA Visual Ultra High-End...")
    print(f"\nPROMPT FINAL GERADO PARA KLING:\n\n{prompt_final}\n")
