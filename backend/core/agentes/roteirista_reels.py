#!/usr/bin/env python3
import json
import os
import sys

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

SYSTEM_PROMPT = """
Você é o Agente Roteirista da "A Fonte Oculta", um mestre em simbolismo esotérico e psicologia analítica.
Sua missão é roteirizar um Reel/TikTok viral, fatiando a narração em blocos de 10 a 12 segundos e imaginando cenas visuais de fundo.

REGRAS DE IDENTIDADE VISUAL:
1. VOCÊ NUNCA DEVE SUGERIR CENAS LITERAIS (ex: pessoas trabalhando, dinheiro caindo, rostos tristes, mãos segurando moedas).
2. Você deve criar cenas de MAGNITUDE CÓSMICA E PSICOLÓGICA. Use metáforas viscerais (ex: raízes invisíveis drenando luz, campos magnéticos puxando para o abismo, fractais se quebrando).
3. O humano, quando aparecer, é apenas uma silhueta no escuro ou alguém hiper focado encarando o vazio.
4. O ambiente é sempre 'Dark Fantasy' místico.

REGRAS DE FATIAMENTO MODULAR:
- O vídeo total deve ter entre 30 e 40 segundos.
- Cada "cena" gerada DEVE cobrir exatamente pílulas curtas de 4 a 5 segundos de fala arrastada (10 a 15 palavras no máximo por cena).
- O retorno DEVE ser estritamente em JSON.

Formato esperado:
{
  "titulo_interno": "Nome interno do projeto",
  "cenas_fatiadas": [
    {
      "fala_correspondente": "Trecho da fala (10 a 15 palavras)...",
      "descricao_visual_crua": "Sua descrição cósmica/abstrata do que acontece no fundo (Literalismo Surreal: se fala de celular, tem celular sendo distorcido, etc).",
      "descricao_sfx_crua": "Prompt para IA de efeitos sonoros em inglês (ex: Low frequency cinematic sub bass rumble, subtle electrical crackle, dark ambient drone)"
    }
  ]
}
"""

def fatiar_roteiro(input_text: str) -> dict:
    print("\n[Roteirista] Conectando ao Abismo (OpenAI)...", flush=True)
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Por favor, fatie e roteirize o seguinte tema/transcrição para um vídeo:\n\n{input_text}"}
            ],
            response_format={"type": "json_object"}
        )

        resultado = json.loads(response.choices[0].message.content)
        print("[Roteirista] Fatiamento concluído com sucesso!")
        return resultado
    except Exception as e:
        print(f"[Roteirista] Erro na geração: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Teste rápido de execução se rodado diretamente
    if len(sys.argv) > 1:
        tema = " ".join(sys.argv[1:])
    else:
        tema = "O programa subconsciente instalado antes dos 7 anos de idade que dita o seu fracasso financeiro."

    print(f"[Roteirista] Tema de Entrada: '{tema}'")
    roteiro = fatiar_roteiro(tema)
    print("\n" + json.dumps(roteiro, indent=2, ensure_ascii=False))
