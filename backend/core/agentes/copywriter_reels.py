#!/usr/bin/env python3
"""
copywriter_reels.py — Agente Copywriter de Reels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responsabilidade ÚNICA: escrever a narrativa falada do vídeo.

Recebe um tema e devolve uma lista de falas (blocos de 10-15 palavras),
seguindo o Método Jordânico: tom sombrio, revelador, cinematográfico.

NÃO descreve visuais. NÃO descreve sons.
Apenas a voz — o que será dito em cada cena.

Saída JSON:
{
  "titulo_interno": "...",
  "falas": [
    { "num": 1, "fala": "Onde a sua atenção vai, a sua força vital vai junto." },
    ...
  ]
}
"""

import json
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
Você é o Copywriter da "A Fonte Oculta" — mestre em narrativa esotérica, psicologia profunda e escrita cinematográfica.

SUA MISSÃO ÚNICA: escrever APENAS a narração falada de um Reel de 30 a 40 segundos.

REGRAS ABSOLUTAS DE ESCRITA:
1. Cada fala deve ter entre 10 e 15 palavras. Ritmo arrastado, pausas implícitas.
2. Tom: sombrio, revelador, hipnótico. Como se estivesse revelando um segredo proibido.
3. Estrutura narrativa obrigatória (Método Jordânico):
   - Fala 1: GANCHO PARADOXAL — coloca duas verdades em colisão
   - Fala 2: VALIDAÇÃO — "você sempre sentiu isso"
   - Fala 3: NOMEAÇÃO — nomeia o sistema ou estrutura responsável
   - Falas 4-5: PROFUNDIDADE — o mecanismo real, a camada oculta
   - Fala 6: ESPELHO — o seguidor se reconhece
   - Fala 7: VIRADA / ATIVAÇÃO — a saída existe, ele já tem dentro de si
4. NUNCA use clichês: "O que ninguém te contou", "a verdade chocante", "você precisa ver isso"
5. NUNCA use traços (—) como muleta. Frases curtas e independentes.
6. Vocabulário: denso, específico, adulto. Evite palavras vagas como "energia" sem contexto.

FORMATO DE RETORNO: JSON puro, sem markdown.

{
  "titulo_interno": "nome interno do projeto",
  "falas": [
    { "num": 1, "fala": "..." },
    { "num": 2, "fala": "..." },
    ...
  ]
}
"""

def escrever_narrativa(tema: str) -> dict:
    print(f"\n[Copywriter] Escrevendo narrativa para: '{tema}'")
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Tema do vídeo:\n\n{tema}"}
            ],
            response_format={"type": "json_object"}
        )
        resultado = json.loads(response.choices[0].message.content)
        print(f"[Copywriter] {len(resultado.get('falas', []))} falas escritas.")
        return resultado
    except Exception as e:
        print(f"[Copywriter] Erro: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    tema = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else \
        "O algoritmo das redes sociais foi projetado para drenar sua atenção e seu livre-arbítrio."
    resultado = escrever_narrativa(tema)
    print("\n" + json.dumps(resultado, indent=2, ensure_ascii=False))
