#!/usr/bin/env python3
"""
copywriter_haucacau.py — Agente de Copy para Carrosséis HauCacau
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Motor: Claude Sonnet (Anthropic SDK)
Método: Jordânico aplicado à HauCacau — curva dramática de 11 slides

Recebe:  tema + universo (1-6) + avatar (A/B/C/D) + âncora opcional
Entrega: copy completa dos 11 slides pronta para o template

USO INTERATIVO:
    python -X utf8 core/agentes/copywriter_haucacau.py

USO IMPORTADO:
    from core.agentes.copywriter_haucacau import gerar_copy_haucacau
    resultado = gerar_copy_haucacau(tema="...", universo=2, avatar="B")
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).parent.parent.parent

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_KEY:
    print("ERRO: ANTHROPIC_API_KEY não encontrada no .env")
    sys.exit(1)

import anthropic

_claude = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
MODEL   = "claude-sonnet-4-6"

# ── Carrega o Oráculo-Mãe ────────────────────────────────────────────────────
ORACULO_FILE = ROOT / "agents" / "oraculo-haucacau.md"
ORACULO_TEXT = ORACULO_FILE.read_text(encoding="utf-8") if ORACULO_FILE.exists() else ""

UNIVERSOS = {
    1: "Espiritualidade sem Pedestal — Tom: fogueira, intimidade, memória",
    2: "Estimulantes e Estilo de Vida — Tom: Tim Maia, direto, leveza que esconde profundidade",
    3: "A Ciência que Valida a Tradição — Tom: professor apaixonado, traduz sem simplificar",
    4: "Relacionamentos e Encontros — Tom: convite para jantar, sensorial, quente",
    5: "Corporativo e NR1 — Tom: executivo sem misticismo, embasamento científico",
    6: "A Arquitetura Hermética — Tom: revelação lenta, camadas simbólicas",
}

AVATARES = {
    "A": "Buscador Espiritual — 25-42 anos, terapeuta/liberal, busca constância espiritual",
    "B": "Atleta / Biohacker — 28-45 anos, executivo, busca performance sem dependência",
    "C": "Gestor / RH — 32-52 anos, busca bem-estar corporativo com resultado real",
    "D": "Anfitrião Consciente — 28-48 anos, reduzindo álcool, quer encontros mais reais",
}

SYSTEM_PROMPT = f"""
Você é o Oráculo de Conteúdo da HauCacau.

Não é um gerador de posts. Você é o especialista em comunicação que entende que o cacau
é o PERSONAGEM — não o produto — e que cada carrossel é uma história com curva dramática completa.

Você escreve como Tim Maia fala: direto, humano, com leveza que esconde profundidade.
Você nunca promete transformação vazia. Você nomeia o que a pessoa já sente.
Você nunca usa palavras de guru. Você usa a linguagem da experiência real.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## O DOCUMENTO-MÃE (leia antes de criar qualquer copy)

{ORACULO_TEXT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ESTRUTURA DE SAÍDA OBRIGATÓRIA

Você retorna SEMPRE um JSON válido com esta estrutura:

{{
  "titulo_carrossel": "...",
  "universo": 1,
  "avatar": "A",
  "bolhas": ["bolha 1", "bolha 2"],
  "slides": [
    {{
      "num": 1,
      "estado": "GANCHO",
      "titulo": "...",
      "corpo": "...",
      "cta_coment": null,
      "layout": "fullbleed",
      "prompt_imagem": "..."
    }},
    ...
  ],
  "caption": "...",
  "cta_palavra": "RITUAL"
}}

## REGRAS DO JSON

- `titulo`: texto em CAIXA ALTA, máximo 6 palavras por linha, máximo 3 linhas
- `corpo`: parágrafos curtos, pontos finais frequentes, máximo 12 linhas
- `cta_coment`: null em todos os slides exceto S10 (que contém "COMENTE [PALAVRA]")
- `layout`: fullbleed | dramatico | card | text_only
- `prompt_imagem`: null para slides text_only; prompt completo para slides com imagem
- `caption`: legenda do Instagram, 150-200 palavras, finaliza com 3-5 hashtags
- `cta_palavra`: a palavra que o usuário deve comentar para receber o material

## REGRAS ABSOLUTAS

- NUNCA começa S1 com benefício do produto
- NUNCA usa "cacau cerimonial" como primeira palavra
- NUNCA culpa a pessoa — o culpado é sempre o sistema/padrão
- NUNCA usa linguagem de guru (frequência alta, vibrar amor, alinhar chacras)
- SEMPRE o S6 (reframing) é o slide mais forte do carrossel
- SEMPRE um paradoxo real em algum slide
- SEMPRE o cacau entra como resposta, nunca como ponto de partida
- SEMPRE a última frase de cada slide puxa o próximo

Retorne APENAS o JSON. Nenhum texto adicional antes ou depois.
"""

def gerar_copy_haucacau(tema: str, universo: int = 2, avatar: str = "A",
                         ancora: str = "") -> dict:
    """
    Gera copy completa para um carrossel HauCacau.

    Args:
        tema:     O tema central do carrossel
        universo: 1-6 (ver UNIVERSOS dict)
        avatar:   A/B/C/D (ver AVATARES dict)
        ancora:   Dado científico ou histórico que ancora o argumento

    Returns:
        dict com titulo, slides, caption, cta_palavra
    """
    univ_desc  = UNIVERSOS.get(universo, UNIVERSOS[2])
    avatar_desc = AVATARES.get(avatar, AVATARES["A"])

    prompt_user = f"""Crie um carrossel HauCacau com 11 slides sobre o seguinte tema:

TEMA: {tema}
UNIVERSO: {universo} — {univ_desc}
AVATAR PRIMÁRIO: {avatar} — {avatar_desc}
ÂNCORA (dado/fato que ancora o argumento): {ancora or "Escolha o mais relevante para o tema"}

Siga a curva dramática completa:
S1 Gancho → S2 Validação → S3 Confronto → S4 Educação 1 → S5 Educação 2 →
S6 Reframing (mais importante) → S7 Empoderamento → S8 Síntese →
S9 Reflexão → S10 CTA → S11 PS

Retorne o JSON completo da estrutura definida."""

    response = _claude.messages.create(
        model=MODEL,
        max_tokens=8000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt_user}],
    )

    raw = response.content[0].text.strip()

    # Remove markdown code blocks se presentes
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    if raw.endswith("```"):
        raw = raw[:-3]

    return json.loads(raw.strip())


# ── CLI interativo ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  Oráculo HauCacau — Gerador de Carrossel")
    print("  " + "─" * 40)

    tema   = input("  Tema do carrossel: ").strip()
    print("\n  Universos:")
    for k, v in UNIVERSOS.items():
        print(f"    {k}) {v[:60]}...")
    universo = int(input("  Universo (1-6): ").strip() or "2")

    print("\n  Avatares: A) Espiritual  B) Biohacker  C) RH  D) Anfitrião")
    avatar  = input("  Avatar (A/B/C/D): ").strip().upper() or "A"
    ancora  = input("  Âncora científica/histórica (opcional): ").strip()

    print("\n  Gerando carrossel...\n")
    resultado = gerar_copy_haucacau(tema, universo, avatar, ancora)

    out = Path(f"carrossel-haucacau-{tema[:30].lower().replace(' ','-')}.json")
    out.write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"  Titulo: {resultado.get('titulo_carrossel','')}")
    print(f"  Slides: {len(resultado.get('slides',[]))}")
    print(f"  CTA: COMENTE {resultado.get('cta_palavra','')}")
    print(f"\n  Salvo em: {out}")
    print("\n  Slides:")
    for s in resultado.get("slides", []):
        print(f"  S{s['num']:02d} [{s['estado']}] — {s['titulo'][:60]}")
