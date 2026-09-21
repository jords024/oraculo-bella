#!/usr/bin/env python3
"""
sonoplasta.py — Agente Sonoplasta (SFX)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responsabilidade ÚNICA: gerar os efeitos sonoros ambientais de cada cena.

Recebe a fala + descrição visual de uma cena e:
1. Monta o prompt de SFX via GPT-4o (descreve o som ideal em inglês)
2. Envia para ElevenLabs Sound Generation
3. Salva o MP3 em campanhas/reels/temp/

APIs: OpenAI (prompt SFX) + ElevenLabs (geração de áudio)
"""

import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
_openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

_SFX_SYSTEM = """
Você é o Sonoplasta da "A Fonte Oculta".
Dado a fala narrada e o visual de uma cena de Reel, descreva em inglês o efeito sonoro ambiental ideal.

REGRAS:
- O SFX é AMBIENTE, não música. Drones, rumbles, frequências, texturas sonoras.
- Nunca instrumento melódico. Nunca voz.
- Entre 8 e 15 palavras descrevendo o som exato.
- Estética: dark, cinematográfico, misterioso, quântico.

Retorne APENAS a descrição do SFX em inglês, sem JSON, sem explicação.
"""

def _gerar_prompt_sfx(fala: str, visual: str) -> str:
    resp = _openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": _SFX_SYSTEM},
            {"role": "user", "content": f'Fala: "{fala}"\nVisual: "{visual}"'}
        ]
    )
    return resp.choices[0].message.content.strip()


def gerar_sfx(
    prompt: str = "",
    nome_arquivo: str = "sfx.mp3",
    duration_seconds: float = 5.0,
    fala: str = "",
    visual: str = "",
    output_dir: str = "campanhas/reels/temp",
) -> str:
    """
    Gera SFX via ElevenLabs.

    Uso com prompt direto:
        gerar_sfx(prompt="Low frequency drone", nome_arquivo="cena_01_sfx.mp3")

    Uso com fala + visual (prompt gerado automaticamente via GPT-4o-mini):
        gerar_sfx(fala="...", visual="...", nome_arquivo="cena_01_sfx.mp3")
    """
    if not ELEVENLABS_API_KEY:
        print("[Sonoplasta] Erro: ELEVENLABS_API_KEY não encontrada.")
        return ""

    sfx_prompt = prompt
    if not sfx_prompt and (fala or visual):
        print("[Sonoplasta] Gerando prompt SFX via GPT...")
        sfx_prompt = _gerar_prompt_sfx(fala, visual)
        print(f"[Sonoplasta] Prompt SFX: {sfx_prompt}")

    if not sfx_prompt:
        print("[Sonoplasta] Nenhum prompt disponível.")
        return ""

    print(f"\n[Sonoplasta] Gerando SFX: {sfx_prompt[:60]}...")

    try:
        response = requests.post(
            "https://api.elevenlabs.io/v1/sound-generation",
            headers={"Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY},
            json={"text": sfx_prompt, "duration_seconds": duration_seconds, "prompt_influence": 0.3},
        )
        if response.status_code != 200:
            print(f"[Sonoplasta] Erro ElevenLabs: {response.text}")
            return ""

        pasta = Path(output_dir)
        pasta.mkdir(parents=True, exist_ok=True)
        caminho = pasta / nome_arquivo
        caminho.write_bytes(response.content)
        print(f"[Sonoplasta] SFX salvo: {caminho}")
        return str(caminho)

    except Exception as e:
        print(f"[Sonoplasta] Falha: {e}")
        return ""


if __name__ == "__main__":
    gerar_sfx(
        fala="Onde a sua atenção vai, a sua força vital vai junto.",
        visual="A glowing gold thread being pulled from a human forehead into a dark monolith.",
        nome_arquivo="teste_sfx.mp3",
    )
