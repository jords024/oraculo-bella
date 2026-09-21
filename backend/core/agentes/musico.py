#!/usr/bin/env python3
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

def gerar_musica_fundo(
    prompt: str,
    nome_arquivo: str = "trilha_fundo.mp3",
    duration: int = 45,
    output_dir: str = "campanhas/reels/temp",
) -> str:
    """
    Envia o pedido para o modelo fal-ai/stable-audio para gerar uma trilha instrumental.
    """
    if not FAL_KEY:
        print("Erro: FAL_KEY não encontrada no arquivo .env")
        return ""

    print(f"\n[Agente Músico] Compondo trilha sonora de {duration}s na Fal.ai (Stable Audio)...")

    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": prompt,
        "seconds_total": duration
    }

    try:
        # Envia pedido para fila
        submit_url = "https://queue.fal.run/fal-ai/stable-audio"
        response = requests.post(submit_url, headers=headers, json=payload)

        if response.status_code != 200:
            print(f"Erro ao contatar API de música: {response.text}", flush=True)
            return ""

        status_url = response.json().get("status_url")

        print("  > Músico trabalhando no estúdio (aguarde)...", flush=True)
        while True:
            try:
                status_res = requests.get(status_url, headers=headers, timeout=10)
                status_data = status_res.json()
                status = status_data.get("status")
            except Exception as e:
                print(f"  ... falha na rede ({e}). Retentando...", flush=True)
                time.sleep(5)
                continue

            if status == "COMPLETED":
                final_res = requests.get(status_data["response_url"], headers=headers).json()
                audio_url = final_res.get("audio_file", {}).get("url")

                if not audio_url:
                    print("Erro: URL do áudio não encontrada na resposta final.")
                    return ""

                print("  > Música finalizada! Fazendo download...")
                audio_data = requests.get(audio_url).content

                pasta_saida = Path(output_dir)
                pasta_saida.mkdir(parents=True, exist_ok=True)
                caminho_final = pasta_saida / nome_arquivo

                with open(caminho_final, "wb") as f:
                    f.write(audio_data)

                print(f"[Agente Músico] Sucesso absoluto! Faixa salva em: {caminho_final}")
                return str(caminho_final)

            elif status == "FAILED":
                print(f"Falha ao gerar música: {status_data}", flush=True)
                return ""

            time.sleep(3)

    except Exception as e:
        print(f"[Agente Músico] Exceção crítica: {e}")
        return ""

if __name__ == "__main__":
    teste = "Dark cinematic ambient music, mystery and suspense, slow hypnotic buildup, transitioning into a soft, ethereal, and hopeful piano chord progression at the very end"
    gerar_musica_fundo(teste, "teste_musica.mp3", 40)
