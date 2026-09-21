#!/usr/bin/env python3
"""
kling_pro_manager.py — Kling Video v2.1 Pro (motor mais avançado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usa o modelo fal-ai/kling-video/v2.1/pro/text-to-video.
Qualidade cinematográfica máxima disponível no fal.ai.

Diferença do seedance_manager (Kling O3 Standard):
  - v2.1 Pro → maior coerência visual, movimento mais fluido,
    melhor interpretação de cenas complexas (múltiplos elementos,
    culturas, simbolismo, macro detail)
  - Tempo de geração: ~3-8 min por clip de 5s
"""

import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

FAL_KEY = os.getenv("FAL_KEY")

ENDPOINT = "https://queue.fal.run/fal-ai/kling-video/v1.6/pro/text-to-video"


def gerar_video_kling_pro(
    prompt: str,
    nome_arquivo: str = "video.mp4",
    duration: str = "5",
    aspect_ratio: str = "9:16",
    output_dir: str = "campanhas/reels/temp",
) -> str:
    """
    Gera um clip via Kling Video v2.1 Pro (fal.ai).
    Polling assíncrono — aguarda até COMPLETED e faz download.

    Args:
        prompt:       Prompt final (já com prefixo/sufixo da Coleira de Ouro)
        nome_arquivo: Nome do arquivo MP4 de saída
        duration:     "5" ou "10" segundos
        aspect_ratio: "9:16" (vertical) | "16:9" | "1:1"

    Returns:
        Caminho do arquivo salvo, ou "" em caso de erro.
    """
    if not FAL_KEY:
        print("[Kling Pro] ❌ FAL_KEY não encontrada no .env")
        return ""

    print("\n[Kling Pro] Enviando para Kling v2.1 Pro...")
    print(f"  Prompt: {prompt[:90]}...")

    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": prompt,
        "aspect_ratio": aspect_ratio,
        "duration": duration,
    }

    try:
        # 1. Envia para fila
        resp = requests.post(ENDPOINT, headers=headers, json=payload, timeout=30)
        if resp.status_code != 200:
            print(f"[Kling Pro] ❌ Erro ao enviar: {resp.text}")
            return ""

        status_url = resp.json().get("status_url")
        if not status_url:
            print("[Kling Pro] ❌ status_url não retornada.")
            return ""

        # 2. Polling
        print("[Kling Pro] Renderizando... (pode levar 3-8 min)")
        tentativas = 0
        while True:
            try:
                s = requests.get(status_url, headers=headers, timeout=15)
                data = s.json()
                status = data.get("status")
            except Exception as e:
                print(f"  ... falha de rede ({e}), retentando...")
                time.sleep(10)
                continue

            if status == "COMPLETED":
                final = requests.get(data["response_url"], headers=headers).json()
                video_url = (
                    final.get("video", {}).get("url")
                    or final.get("video_url")
                    or final.get("output", {}).get("video", {}).get("url")
                )
                if not video_url:
                    print(f"[Kling Pro] ❌ URL do vídeo não encontrada: {final}")
                    return ""
                break

            elif status == "FAILED":
                print(f"[Kling Pro] ❌ Geração falhou: {data.get('error')}")
                return ""

            tentativas += 1
            elapsed = tentativas * 10
            print(f"  ... {elapsed}s — ainda renderizando...", flush=True)
            time.sleep(10)

        # 3. Download
        print("[Kling Pro] ✅ Pronto! Baixando vídeo...")
        video_data = requests.get(video_url, timeout=120).content

        pasta = Path(output_dir)
        pasta.mkdir(parents=True, exist_ok=True)
        caminho = pasta / nome_arquivo
        caminho.write_bytes(video_data)

        print(f"[Kling Pro] Salvo: {caminho}")
        return str(caminho)

    except Exception as e:
        print(f"[Kling Pro] ❌ Exceção: {e}")
        return ""


if __name__ == "__main__":
    teste = (
        "Vertical 9:16. Ultra high-end cinematic. "
        "Ancient sacred symbols from Hindu, Christian, Buddhist, Islamic and Kabbalistic traditions "
        "slowly morphing into each other, all sharing the same golden light at their center. "
        "Each symbol dissolves and becomes the next in a hypnotic flow. "
        "Deep mystical atmosphere, slow hypnotic movement. ABSOLUTELY NO TEXT."
    )
    gerar_video_kling_pro(teste, "teste_kling_pro.mp4")
