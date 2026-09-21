#!/usr/bin/env python3
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

# Força o encoding correto no Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
# ID de uma voz misteriosa/sombria no ElevenLabs (Pode ser substituído pelo ID da sua voz preferida)
VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17" # Roger - Voz natural e relaxada da sua conta

def gerar_voz_cinematografica(
    texto: str,
    nome_arquivo: str = "narracao_01.mp3",
    output_dir: str = "campanhas/reels/temp",
) -> str:
    """
    Envia o roteiro para a ElevenLabs e baixa o áudio MP3 gerado.
    """
    if not ELEVENLABS_API_KEY:
        print("Erro: ELEVENLABS_API_KEY não encontrada no arquivo .env")
        return ""

    print("\n[Agente de Voz] Conjurando voz na ElevenLabs...")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }

    data = {
        "text": texto,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.35,      # Baixa estabilidade para deixar a voz mais emotiva e profunda
            "similarity_boost": 0.8 # Alta similaridade para manter o peso da voz original
        }
    }

    try:
        response = requests.post(url, json=data, headers=headers)

        if response.status_code != 200:
            print(f"Erro na ElevenLabs: {response.text}")
            return ""

        pasta_saida = Path(output_dir)
        pasta_saida.mkdir(parents=True, exist_ok=True)
        caminho_final = pasta_saida / nome_arquivo

        with open(caminho_final, "wb") as f:
            f.write(response.content)

        print(f"[Agente de Voz] Áudio gerado com sucesso: {caminho_final}")
        return str(caminho_final)

    except Exception as e:
        print(f"[Agente de Voz] Falha na conjuração: {e}")
        return ""

if __name__ == "__main__":
    teste_texto = "O sistema foi desenhado para te manter exausto. Quando você dorme, eles lucram."
    gerar_voz_cinematografica(teste_texto)
