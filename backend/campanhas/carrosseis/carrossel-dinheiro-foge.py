#!/usr/bin/env python3

from dotenv import load_dotenv

load_dotenv()
import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose

# Substituindo a geração padrão do Gemini pelo GPT-Image-1 (OpenAI)
from core.util.gen_image_openai import gen_openai as gen
from core.util.prompt_builder import build_prompt

# ── CONFIGURACAO ──────────────────────────────────────────────────────────────
OUT_DIR       = Path("C:/Users/julia/Desktop/carrossel-dinheiro-foge")
TEMA          = "O Dinheiro que Foge"
TEMA_SLUG     = "dinheiro-foge"
FORMATO       = "B"
CAPTION       = "Sabe quando você finalmente consegue juntar um dinheirinho, e do nada aparece um imprevisto pra roubar tudo? Não é azar. Comente FONTE para desativar essa trava."
REVISOR_SCORE = "15/15"
NOTAS         = "Linguagem visceral e humanizada (Humanizer Impecável). Tese: Trauma financeiro biológico."

OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides ────────────────────────────────────────────────────────────────────
slides = [
  {
    "num": "01",
    "estado": "DISRUPÇÃO",
    "layout": "fullbleed",
    "title": "SABE QUANDO VOCÊ\nJUNTA UM DINHEIRO\nE DO NADA...",
    "body": "O carro quebra, a geladeira queima ou aparece uma dívida surpresa? Chega a parecer brincadeira. Mas o nome disso não é azar.",
    "prompt": (
        "A pair of weathered human hands trying desperately to hold glowing golden sand, "
        "but the sand slips uncontrollably through their fingers into an endless abyss. "
        "Warm gold lighting, visceral desperation."
    ),
  },
  {
    "num": "02",
    "estado": "DESCIDA",
    "layout": "fullbleed",
    "title": "A GENTE CRESCE OUVINDO\nQUE DINHEIRO HONESTO\nÉ SUADO",
    "body": "Mas repara numa coisa: quem mais trabalha, acorda às 5 da manhã e pega ônibus lotado... é quem menos tem. Tem alguma coisa muito errada nessa conta.",
    "prompt": (
        "A tired human silhouette pushing a massive, rusted iron wheel uphill in absolute darkness. "
        "The wheel is impossibly heavy. A visual representation of the endless hamster wheel. "
        "Cold amber light, extreme exhaustion."
    ),
  },
  {
    "num": "03",
    "estado": "NOMEAÇÃO",
    "layout": "fullbleed",
    "title": "A VERDADE CRUA:\nSEU PRÓPRIO CORPO\nEXPULSA O DINHEIRO",
    "body": "É sério. Toda vez que você tá quase saindo do buraco, o seu sistema nervoso entra em curto-circuito e dá um jeito de você gastar ou se sabotar.",
    "prompt": (
        "A highly detailed, glowing human nervous system visible inside a dark translucent silhouette. "
        "The nerves are sparking and short-circuiting with violent electric blue and red energy "
        "the moment a gentle golden light touches the hands."
    ),
  },
  {
    "num": "04",
    "estado": "PROFUNDIDADE",
    "layout": "card",
    "title": "POR QUE\nISSO ACONTECE?",
    "body": "Sua família passou por tanto perrengue lá atrás, que o seu cérebro gravou a escassez como 'o único lugar seguro'. Você virou especialista em sobreviver.",
    "prompt": (
        "A cinematic portrait of a person standing, but their feet are turning into ancient, "
        "wooden roots that anchor them deeply into cracked, dry soil. "
        "A visual metaphor for ancestral trauma holding someone back. Moody, dramatic."
    ),
  },
  {
    "num": "05",
    "estado": "QUEDA FUNDA",
    "layout": "fullbleed",
    "title": "TER DINHEIRO É UM\nTERRITÓRIO DESCONHECIDO",
    "body": "E o cérebro morre de medo do novo. Ele prefere te puxar de volta pra estaca zero, porque a pobreza... ah, a pobreza o seu corpo já sabe como aguentar.",
    "prompt": (
        "A person curled up tightly inside a very small, glowing amber cage hanging in space. "
        "Outside the cage is infinite freedom and golden stars, but they choose the tiny familiar cage. "
        "Visceral fear of the unknown."
    ),
  },
  {
    "num": "06",
    "estado": "ESPELHO",
    "layout": "fullbleed",
    "title": "A SENSAÇÃO HORRÍVEL\nDE ESTAR SEMPRE\nPATINANDO",
    "body": "Você se esforça o mês inteiro, e no dia 15 já tá contando moeda de novo. Não é falta de inteligência sua. É pura biologia.",
    "prompt": (
        "A silhouette of a person running exhaustedly on an infinite treadmill made of rusty metal gears, "
        "going absolutely nowhere. Surrounded by infinite darkness and cold teal light. "
        "The feeling of eternal struggle."
    ),
  },
  {
    "num": "07",
    "estado": "ASCENSÃO",
    "layout": "card",
    "title": "NÃO ADIANTA ARRUMAR\nUM SEGUNDO EMPREGO",
    "body": "Enquanto essa memória de escassez estiver grudada aí dentro, o dinheiro vai bater na porta e ir embora. A raiz do problema não é o seu salário.",
    "prompt": (
        "A dense, heavy layer of dark, muddy chains detaching and falling away from a glowing human heart. "
        "Underneath the dark mud, the heart is made of pure, radiant golden light. "
        "A moment of biological release."
    ),
  },
  {
    "num": "08",
    "estado": "CRISTALIZAÇÃO",
    "layout": "fullbleed",
    "title": "O CORPO PRECISA\nPARAR DE VER A RIQUEZA\nCOMO AMEAÇA",
    "body": "Você só quebra esse ciclo limpando essa sujeira que ficou no seu sistema. E isso não se resolve lendo livro de finanças.",
    "prompt": (
        "A human figure standing tall, calm, and relaxed, absorbing a massive beam of warm golden light "
        "falling from the sky. They are not flinching or hiding; they are accepting it with total peace. "
        "Sacred gold and deep blues."
    ),
  },
  {
    "num": "09",
    "estado": "SETUP CTA",
    "layout": "fullbleed",
    "title": "DÁ PRA 'DESPROGRAMAR'\nESSE SUSTO DO\nSEU CORPO.",
    "body": "Existe um padrão sonoro que funciona como um reset. Ele desliga esse alarme de emergência do seu cérebro e faz ele aceitar a abundância em paz.",
    "prompt": (
        "A glowing golden tuning fork vibrating with visible sound waves of pure light. "
        "The sound waves are striking the back of a human silhouette's neck, shattering invisible dark constraints. "
        "Cinematic, mysterious, highly aesthetic."
    ),
  },
  {
    "num": "10",
    "estado": "CTA FIXO",
    "layout": "fullbleed",
    "title": "COMENTE\nFONTE",
    "body": "Para receber o acesso ao áudio de destrave neural e parar de expulsar o dinheiro da sua vida.",
    "prompt": (
        "A radiant column of pure golden light descending from top to bottom of frame. "
        "The light has weight and temperature. "
        "At the threshold: barely-visible outline of a human figure dissolved into the gold. "
        "Single accent color: vivid gold — the entire central pillar. "
    ),
  },
]

# ── Execução ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"  Carrossel — {TEMA}")
    print(f"  Formato: {FORMATO} | Slides: {len(slides)} | Gerador: OpenAI (gpt-image-2)")
    print(f"  Saida: {OUT_DIR}")
    print(f"{'='*60}\n")

    ok = 0
    for i, s in enumerate(slides):
        print(f"[{s['num']}/{len(slides):02d}] {s['layout'].upper()} — {s['title'].splitlines()[0][:50]}...")

        # O prompt_builder adiciona prefixo e sufixo de estilo
        prompt_final = build_prompt(s["prompt"])

        # Usando a OpenAI para gerar a imagem
        img = gen(prompt_final)

        if not img:
            print("  FALHOU A GERAÇÃO DE IMAGEM\n")
            continue

        # Composição visual da fonte e fundo
        final = compose(img, s["title"], s["body"], s["layout"])

        slug = "".join(c if c.isalnum() else "-" for c in s["title"].splitlines()[0].lower()).strip("-")[:36]
        out  = OUT_DIR / f"slide-{s['num']}-{slug}.jpg"
        final.save(str(out), "JPEG", quality=95)
        print(f"  OK: {out.name}\n")
        ok += 1

    print(f"{'='*60}")
    print(f"  CONCLUIDO: {ok}/{len(slides)} slides")
    print(f"{'='*60}\n")

    # Registra no dashboard local
    register(
        title         = TEMA,
        theme         = TEMA_SLUG,
        format        = FORMATO,
        slides_dir    = str(OUT_DIR),
        caption       = CAPTION,
        revisor_score = REVISOR_SCORE,
        notes         = NOTAS,
    )
