#!/usr/bin/env python3
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

# Usando FAL.AI como provedor de acesso ao Seedance 2.0 (é o mais estável e barato)
# Você precisará criar uma conta no fal.ai e colocar a chave no .env
FAL_KEY = os.getenv("FAL_KEY")

def gerar_video_seedance(prompt_final: str, nome_arquivo: str = "cena_01_video.mp4") -> str:
    """
    Envia o prompt para a API do Seedance 2.0 (via fal.ai), aguarda a geração e baixa o arquivo MP4 real.
    """
    if not FAL_KEY:
        print("Erro: Chave FAL_KEY não encontrada no arquivo .env")
        print("Crie uma conta em fal.ai, pegue a chave e adicione: FAL_KEY=sua_chave")
        return ""

    print("\n[Diretor] Acordando o Seedance 2.0 na nuvem...")

    headers = {
        "Authorization": f"Key {FAL_KEY}",
        "Content-Type": "application/json"
    }

    # Parâmetros de envio (ajustado para Seedance 2.0)
    payload = {
        "prompt": prompt_final,
        "aspect_ratio": "9:16",
        "duration": "5"
    }

    try:
        # 1. Envia o pedido para a fila
        print("  > Enviando prompt para a Kling Video O3 (Fal.ai)...", flush=True)
        # Endpoint oficial do Kling Video O3 (Text to Video)
        submit_url = "https://queue.fal.run/fal-ai/kling-video/o3/standard/text-to-video"
        response = requests.post(submit_url, headers=headers, json=payload)

        if response.status_code != 200:
            print(f"Erro ao contatar API: {response.text}", flush=True)
            return ""

        status_url = response.json().get("status_url")

        # 2. Fica perguntando (Polling) se o vídeo ficou pronto
        print("  > Renderizando vídeo cinematográfico (aguarde)...", flush=True)
        while True:
            try:
                status_res = requests.get(status_url, headers=headers, timeout=10)
                status_data = status_res.json()
                status = status_data.get("status")
            except Exception as e:
                print(f"  ... aviso: falha de rede temporária durante o polling ({e}). Retentando...", flush=True)
                time.sleep(5)
                continue

            if status == "COMPLETED":
                # Fazer GET na response_url para pegar o payload final
                final_res = requests.get(status_data["response_url"], headers=headers).json()
                if "video" in final_res and "url" in final_res["video"]:
                    video_url = final_res["video"]["url"]
                else:
                    video_url = final_res.get("video_url") or final_res.get("output", {}).get("video", {}).get("url")
                break
            elif status == "FAILED":
                print(f"Erro na renderização: {status_data.get('error')}")
                return ""

            print("  ... ainda renderizando ...", flush=True)
            time.sleep(10) # Espera 10 segundos antes de perguntar de novo

        # 3. Baixa o MP4 pronto
        print("  > Vídeo pronto! Fazendo download...")
        video_data = requests.get(video_url).content

        pasta_saida = Path("campanhas/reels/temp")
        pasta_saida.mkdir(parents=True, exist_ok=True)
        caminho_final = pasta_saida / nome_arquivo

        with open(caminho_final, "wb") as f:
            f.write(video_data)

        print(f"[Seedance 2.0] Sucesso absoluto! Salvo em: {caminho_final}")
        return str(caminho_final)

    except Exception as e:
        print(f"Erro catastrófico ao gerar vídeo: {e}")
        return ""

if __name__ == "__main__":
    teste = "Vertical 9:16 aspect ratio. Ultra high-end commercial aesthetic, photorealistic, 8K, cinematic lighting. A person holding a glowing smartphone in the dark, but their physical face and skin are stretching and being violently sucked into the phone's screen like a digital black hole. Deep mystical tones from another dimension, psychedelic realism, extreme macro detail, studio-grade color grading, surreal visual effects."
    gerar_video_seedance(teste, "cena_02_kling_sugado.mp4")
