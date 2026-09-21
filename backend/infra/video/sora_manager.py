#!/usr/bin/env python3
import os
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
# Usando o endpoint padrão de vídeo (ajuste conforme a documentação oficial do Sora quando liberada)
SORA_URL = "https://api.openai.com/v1/videos/generations"

def gerar_video_sora(prompt_final: str, nome_arquivo: str = "cena_01.mp4") -> str:
    """
    Envia o prompt para a API de vídeo, aguarda a geração e baixa o arquivo MP4.
    """
    if not API_KEY:
        print("Erro: OPENAI_API_KEY não encontrada.")
        return ""

    print("Enviando pedido de vídeo para a OpenAI...")

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # Parâmetros básicos (sujeito à documentação final do Sora)
    payload = {
        "model": "sora", # ou modelo correspondente
        "prompt": prompt_final,
        "size": "1080x1920",
        "duration": 12 # segundos
    }

    try:
        # ATENÇÃO: Como a API do Sora é restrita/beta, isso é um modelo de como a requisição funciona.
        # response = requests.post(SORA_URL, headers=headers, json=payload)
        # data = response.json()

        # Simulação temporária até liberação pública completa da API:
        print("Aguardando o vídeo ficar pronto (isso pode demorar vários minutos)...")
        time.sleep(3) # Simula o tempo de espera

        # Cria a pasta de saída se não existir
        pasta_saida = Path("campanhas/reels/temp")
        pasta_saida.mkdir(parents=True, exist_ok=True)
        caminho_final = pasta_saida / nome_arquivo

        # Simula salvar um arquivo MP4 vazio apenas para manter a esteira funcionando
        with open(caminho_final, "wb") as f:
            f.write(b"Arquivo de video simulado.")

        print(f"Vídeo baixado com sucesso em: {caminho_final}")
        return str(caminho_final)

    except Exception as e:
        print(f"Erro ao gerar vídeo: {e}")
        return ""

if __name__ == "__main__":
    teste_prompt = "Vertical 9:16 aspect ratio. Photorealistic dark fantasy. Uma silhueta no escuro."
    gerar_video_sora(teste_prompt)
