import json
import os
import sys
from pathlib import Path

import yt_dlp
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Força o encoding correto do console no Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print(json.dumps({"error": "OPENAI_API_KEY não encontrada no arquivo .env"}))
    sys.exit(1)

client = OpenAI(api_key=api_key)

def send_progress(msg):
    # Envia o progresso como JSON para o Node interpretar se necessário, ou puro texto
    print(f"[PROGRESS] {msg}", flush=True)

def download_reel(url, output_path):
    send_progress(f"Iniciando download do Reel: {url}")
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'best',
        'quiet': True,
        'no_warnings': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    send_progress("Download concluído com sucesso!")

def transcrever_audio(file_path):
    send_progress("Enviando áudio para a IA (Whisper) para transcrição...")
    with open(file_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    send_progress(f"Transcrição finalizada ({len(transcription.text.split())} palavras).")
    return transcription.text

def realizar_engenharia_reversa(transcription):
    send_progress("Aplicando Engenharia Reversa com GPT-4o...")
    prompt = f"""
Você é um especialista em conteúdo viral esotérico e misterioso (estilo "A Fonte Oculta").
Eu vou te passar a transcrição de um vídeo que viralizou no Reels/TikTok.

Sua tarefa:
1. Identificar e extrair o "Gancho" (Hook) original.
2. Explicar o Padrão Psicológico de Retenção usado na narrativa.
3. REESCREVER o script completo usando o "Método Jordânico" da Fonte Oculta (tom sombrio, revelador, frases curtas, ritmo cinematográfico). O objetivo é que esse novo texto vire um Carrossel.

Transcrição do vídeo original:
"{transcription}"

Por favor, responda estritamente no formato JSON com as chaves:
"gancho_original" (string),
"padrao_psicologico" (string),
"roteiro_fonte_oculta" (string)
    """

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )

    send_progress("Roteiro gerado com sucesso!")
    return json.loads(response.choices[0].message.content)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL do Reel não fornecida"}))
        sys.exit(1)

    url = sys.argv[1]

    # Pasta temporária para o vídeo
    # Pasta temporária para o vídeo
    temp_dir = Path(__file__).parent / "dashboard" / "data" / "temp"
    temp_dir.mkdir(parents=True, exist_ok=True)

    # Nome de arquivo único para evitar conflito de acesso no Windows
    import time
    video_filename = f"temp_reel_{int(time.time())}.mp4"
    video_path = str(temp_dir / video_filename)

    # Busca e limpa qualquer arquivo temporário antigo na pasta para não acumular lixo
    for old_file in temp_dir.glob("temp_reel_*"):
        try:
            os.remove(old_file)
        except:
            pass

    try:
        download_reel(url, video_path)
        texto = transcrever_audio(video_path)
        resultado = realizar_engenharia_reversa(texto)
        resultado["transcricao_original"] = texto

        send_progress("FINALIZANDO")
        print("FINAL_RESULT:" + json.dumps(resultado, ensure_ascii=False))

    except Exception as e:
        print("FINAL_RESULT:" + json.dumps({"error": str(e)}, ensure_ascii=False))
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)

if __name__ == "__main__":
    main()
