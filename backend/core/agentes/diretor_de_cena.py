#!/usr/bin/env python3
"""
diretor_de_cena.py — Agente Diretor de Cena (Visual)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responsabilidade ÚNICA: traduzir cada fala em uma descrição visual surreal.

Recebe a lista de falas do Copywriter e devolve, para cada uma,
a "descricao_visual_crua" — a metáfora visual que aparecerá no fundo.

NÃO escreve copy. NÃO gera prompt técnico (isso é do video_prompt_builder).
Apenas a visão — o que será visto em cada cena.

Saída JSON:
{
  "cenas": [
    {
      "num": 1,
      "fala": "...",
      "descricao_visual_crua": "..."
    },
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
Você é o Diretor de Cena da "A Fonte Oculta" — um visionário de imagens simbólicas, surrealistas e de magnitude cósmica.

SUA MISSÃO ÚNICA: para cada fala fornecida, criar a descrição visual que aparece no fundo do vídeo.

REGRAS ABSOLUTAS DE VISUALIZAÇÃO:
1. NUNCA cenas literais. Proibido: pessoas trabalhando, dinheiro caindo, rostos tristes, mãos segurando objetos comuns.
2. Pense em METÁFORAS VISCERAIS e ENERGÉTICAS:
   - Se a fala fala de atenção sendo drenada → fio dourado sendo puxado da testa para um monólito escuro.
   - Se a fala fala de sistema controlando → silhuetas humanas suspensas por fios invisíveis em uma colmeia industrial.
   - Se a fala fala de libertação → pupila humana fechando como obturador mecânico, cortando luz artificial.
3. Estética obrigatória: Dark Fantasy. Cósmico. Psicológico. Surreal. Cinematográfico.
4. Figura humana permitida APENAS como silhueta, sem rosto, como elemento mínimo e poderoso.
5. Cada descrição deve ter entre 2 e 4 frases. Específico e visual, não vago.
6. Descreva em INGLÊS — o prompt vai direto para a IA de vídeo.

FORMATO DE RETORNO: JSON puro, sem markdown.

{
  "cenas": [
    {
      "num": 1,
      "fala": "(a fala original)",
      "descricao_visual_crua": "A description in English..."
    },
    ...
  ]
}
"""

def criar_visuais(falas: list[dict]) -> dict:
    """
    Recebe lista de dicts com {"num": int, "fala": str}
    Devolve dict com "cenas" contendo fala + descricao_visual_crua.
    """
    print(f"\n[Diretor de Cena] Criando visuais para {len(falas)} falas...")

    falas_formatadas = "\n".join(
        f'Fala {f["num"]}: "{f["fala"]}"' for f in falas
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Crie a descrição visual para cada fala abaixo:\n\n{falas_formatadas}"}
            ],
            response_format={"type": "json_object"}
        )
        resultado = json.loads(response.choices[0].message.content)
        print(f"[Diretor de Cena] {len(resultado.get('cenas', []))} visuais criados.")
        return resultado
    except Exception as e:
        print(f"[Diretor de Cena] Erro: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    # Teste com falas hardcoded
    falas_teste = [
        {"num": 1, "fala": "Onde a sua atenção vai, a sua força vital vai junto."},
        {"num": 2, "fala": "Você acha que essas telas brilhantes são apenas janelas para o mundo."},
        {"num": 3, "fala": "Mas elas são agulhas. Uma fazenda silenciosa, colhendo a sua frequência."},
    ]
    resultado = criar_visuais(falas_teste)
    print("\n" + json.dumps(resultado, indent=2, ensure_ascii=False))
