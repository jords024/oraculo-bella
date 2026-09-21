#!/usr/bin/env python3

import os

from dotenv import load_dotenv

load_dotenv()
os.environ["PYTHONIOENCODING"] = "utf-8"
"""
Carrossel — 5 Coisas que o Sistema te Escondeu sobre Dinheiro
Tema: CONSPIRACAO + DINHEIRO | Formato C — Lista Revelacao
Preset: cinematografico_crimson
Curva: CHOQUE > ITEM1 > ITEM2 > ITEM3 > ITEM4 > ITEM5 > CONVERGENCIA > OMISSAO > POSSIBILIDADE > PORTAL
gemini-2.0-flash-preview-image-generation + compose_util.py
"""
import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

import base64
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

from core.agentes.register_carousel import register
from core.util.compose_util import compose
from core.util.prompt_builder import build_prompt

API_KEY  = os.getenv("GEMINI_API_KEY")
MODEL    = "gemini-2.0-flash-preview-image-generation"
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-sistema-dinheiro")
PRESET   = "cinematografico_crimson"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides — Copy + Prompts ──────────────────────────────────────────────────
slides = [

  # ── 01 CHOQUE — Cover fullbleed ───────────────────────────────────────────
  {
    "num": "01", "layout": "fullbleed",
    "title": (
      "5 COISAS QUE O SISTEMA\n"
      "DOCUMENTOU SOBRE DINHEIRO\n"
      "E DECIDIU QUE VOCÊ NÃO SABIA"
    ),
    "body": (
      "Não é teoria. Não é esoterismo.\n"
      "São fatos registrados em tratados internacionais,\n"
      "leis e publicações oficiais de bancos centrais."
    ),
    "prompt": build_prompt(
      "Five sealed vault doors arranged in a descending staircase into darkness — "
      "each door massive, institutional, heavy with cold metal. "
      "Behind each door: a faint warm amber light leaking at the edges, "
      "the suppressed knowledge still alive inside. "
      "The vaults are labeled only with numbers, not words. "
      "The architecture is deliberately intimidating — built to discourage approach. "
      "Deep black, cold institutional crimson-tinged metal, "
      "warm amber truth glowing behind each sealed door"
    ),
  },

  # ── 02 ITEM 1 — Reserva Fracionária — card ────────────────────────────────
  {
    "num": "02", "layout": "card",
    "title": (
      "1. BANCOS CRIAM DINHEIRO\n"
      "DO NADA. LEGALMENTE."
    ),
    "body": (
      "Isso se chama reserva fracionária.\n"
      "\n"
      "Um banco recebe R$1.000 em depósito.\n"
      "Pode emprestar R$9.000 que não existem.\n"
      "\n"
      "O dinheiro que você paga de juros\n"
      "sobre esse empréstimo nunca existiu\n"
      "antes de você assinar o contrato.\n"
      "\n"
      "Isso não é especulação. Está no site\n"
      "do Banco da Inglaterra desde 2014:\n"
      "'Money creation in the modern economy'.\n"
      "\n"
      "Você trabalha anos para devolver\n"
      "dinheiro criado em segundos."
    ),
    "prompt": build_prompt(
      "A single coin multiplying exponentially on a dark surface — "
      "starting from one physical coin, then phantom copies materializing beside it, "
      "then more, the multiplication increasing rapidly. "
      "The original coin is solid and warm amber gold. "
      "The created copies are progressively more transparent, ghostly, crimson-tinged — "
      "real in the system but without physical substance. "
      "The exponential multiplication shown as a physical geometric progression. "
      "Deep black background, the created money visibly less real than the deposited money, "
      "the mechanism of money creation made physically explicit"
    ),
  },

  # ── 03 ITEM 2 — Bretton Woods — fullbleed ────────────────────────────────
  {
    "num": "03", "layout": "fullbleed",
    "title": (
      "2. BRETTON WOODS 1944:\n"
      "O DIA QUE SUBSTITUÍRAM\n"
      "O OURO POR CONFIANÇA"
    ),
    "body": (
      "Em julho de 1944, 44 países se reuniram\n"
      "em Bretton Woods, New Hampshire.\n"
      "\n"
      "Decidiram: o dólar americano substituiria\n"
      "o ouro como reserva de valor mundial.\n"
      "\n"
      "Em 1971, Nixon encerrou a conversibilidade\n"
      "dólar-ouro sem consultar nenhum outro país.\n"
      "\n"
      "Toda moeda mundial passou a ser\n"
      "lastreada em confiança política.\n"
      "Não em nenhum ativo real."
    ),
    "prompt": build_prompt(
      "A gold bar and a paper document side by side — "
      "the gold bar: solid, warm amber, ancient, physically real. "
      "The paper document: official, sealed, cold — but fragile and thin. "
      "A heavy institutional hand pressing the document down onto the gold bar, "
      "beginning to replace one with the other. "
      "The gold does not disappear — it is simply pushed aside by bureaucratic weight. "
      "In 1944 this happened in a room. The world's financial system changed at a conference table. "
      "Cold institutional crimson-tinged background, warm amber gold being overridden by cold paper authority"
    ),
  },

  # ── 04 ITEM 3 — Inflação como imposto — card ──────────────────────────────
  {
    "num": "04", "layout": "card",
    "title": (
      "3. INFLAÇÃO É UM IMPOSTO\n"
      "QUE NENHUM PARLAMENTO\n"
      "PRECISA APROVAR"
    ),
    "body": (
      "Quando um governo imprime moeda para pagar dívidas,\n"
      "o valor de cada real que você tem diminui.\n"
      "\n"
      "Seu salário não cresce. Seu poder de compra encolhe.\n"
      "\n"
      "A riqueza não desaparece. É transferida.\n"
      "De quem tem dinheiro parado\n"
      "para quem controla a emissão.\n"
      "\n"
      "Milton Friedman documentou isso em 1963.\n"
      "Chamou de tributação sem representação.\n"
      "\n"
      "Você foi tributado hoje.\n"
      "Não viu o desconto no contracheque."
    ),
    "prompt": build_prompt(
      "A currency note shown shrinking over time — "
      "a sequence of the same note getting physically smaller and more transparent, "
      "its purchasing power draining visibly as a cold crimson liquid seeping out. "
      "The note itself remains nominally the same — the number printed on it unchanged. "
      "But its physical form diminishes. The space it occupied contracts. "
      "The lost value flows toward an institutional drain at the bottom of the frame. "
      "Dark background, the note's original warm gold color fading to grey as it shrinks, "
      "the mechanism of inflation as visible physical diminishment"
    ),
  },

  # ── 05 ITEM 4 — Sistema de crédito — fullbleed ────────────────────────────
  {
    "num": "05", "layout": "fullbleed",
    "title": (
      "4. O CRÉDITO FOI\n"
      "DESENHADO PARA\n"
      "MANTER VOCÊ NO CICLO"
    ),
    "body": (
      "Juros compostos sobre dívida de consumo\n"
      "garantem matematicamente que a maioria\n"
      "nunca quite o principal.\n"
      "\n"
      "O cartão de crédito rotativo no Brasil\n"
      "cobra em média 400% ao ano.\n"
      "\n"
      "Isso não é erro de cálculo. É design.\n"
      "\n"
      "Um sistema que educa para consumo imediato\n"
      "e financia com juros exponenciais\n"
      "não está te ajudando a construir riqueza.\n"
      "Está te vendendo o presente\n"
      "em troca do seu futuro."
    ),
    "prompt": build_prompt(
      "A debt spiral shown as a physical vortex pulling downward — "
      "at the top: a person with full purchasing power, warm amber. "
      "As they descend through each ring of the spiral: "
      "the interest compounds visibly, each ring tighter than the last, "
      "the warm amber draining to cold grey as the principal never reduces. "
      "The mathematical inevitability of exponential interest made architecturally visible. "
      "This is not a trap — it is a design. The spiral was engineered, not accidental. "
      "Deep black, cold crimson spiral pulling downward, "
      "the warm color of financial freedom only at the entry point, never regained"
    ),
  },

  # ── 06 ITEM 5 — Frequência instalada — card ───────────────────────────────
  {
    "num": "06", "layout": "card",
    "title": (
      "5. SUA CRENÇA SOBRE\n"
      "DINHEIRO FOI INSTALADA\n"
      "ANTES DOS 7 ANOS"
    ),
    "body": (
      "Até os 7 anos, a criança opera\n"
      "em ondas cerebrais theta.\n"
      "Estado de hipnose leve. Absorção sem filtro crítico.\n"
      "\n"
      "Tudo que seus pais diziam sobre dinheiro\n"
      "foi gravado como verdade absoluta:\n"
      "\n"
      "'Dinheiro não é pra nós.'\n"
      "'Rico é ladrão.'\n"
      "'Trabalho duro é a única forma.'\n"
      "\n"
      "Você não escolheu essas crenças.\n"
      "Elas foram instaladas.\n"
      "E operam como sistema operacional\n"
      "silencioso até hoje."
    ),
    "prompt": build_prompt(
      "A small child shown in theta brainwave state — "
      "slow, deep, hypnotic wave patterns surrounding the figure, "
      "the child's mind open and receptive, no critical filter visible. "
      "Around the child: adult voices shown as physical wave transmissions "
      "flowing directly into the child's neural pathways without resistance. "
      "The transmitted beliefs are cold and limiting — "
      "they enter warm and available neural tissue and set like concrete. "
      "Years later these patterns operate silently as the default system. "
      "Cold crimson belief transmissions entering warm amber open neural tissue, "
      "the installation of limiting frequency shown as a physical process"
    ),
  },

  # ── 07 CONVERGÊNCIA — O ponto em comum — fullbleed ────────────────────────
  {
    "num": "07", "layout": "fullbleed",
    "title": (
      "OS 5 ITENS TÊM\n"
      "UM PONTO EM COMUM"
    ),
    "body": (
      "Reserva fracionária. Bretton Woods.\n"
      "Inflação silenciosa. Design do crédito.\n"
      "Programação na infância.\n"
      "\n"
      "Todos operam na mesma lógica:\n"
      "manter a maioria funcionando dentro de um sistema\n"
      "que foi construído para beneficiar\n"
      "quem o controla.\n"
      "\n"
      "Não é mal pessoal. É arquitetura.\n"
      "E arquitetura pode ser compreendida."
    ),
    "prompt": build_prompt(
      "Five separate cold crimson threads converging to a single central point — "
      "each thread labeled only by position (1 through 5), not by name. "
      "At the convergence point: a single architectural blueprint appears, "
      "cold and precise — the design of a system, not the chaos of coincidence. "
      "The five mechanisms are shown as deliberate components of one intentional structure. "
      "The blueprint is the revelation: not conspiracy, but architecture. "
      "Deep black, cold crimson threads, the blueprint emerging in sharp cold white at center"
    ),
  },

  # ── 08 OMISSÃO — O que não foi ensinado — card ────────────────────────────
  {
    "num": "08", "layout": "card",
    "title": (
      "O CONHECIMENTO FINANCEIRO\n"
      "REAL NUNCA ESTEVE\n"
      "NO CURRÍCULO ESCOLAR"
    ),
    "body": (
      "Educação financeira não é ensinada\n"
      "na escola pública.\n"
      "\n"
      "Não porque é difícil.\n"
      "\n"
      "Porque um cidadão que entende\n"
      "reserva fracionária, inflação como imposto\n"
      "e juros compostos\n"
      "é um consumidor muito menos rentável.\n"
      "\n"
      "O sistema precisa de você funcionando.\n"
      "Não de você entendendo\n"
      "como o sistema funciona."
    ),
    "prompt": build_prompt(
      "A school blackboard filled with subjects — mathematics, history, literature, science — "
      "all present and visible. "
      "A conspicuous empty space where financial literacy would be — "
      "not erased, never written. "
      "The absence is deliberate, architectural, permanent. "
      "The empty space is the same size as any other subject block — "
      "the gap was designed, not forgotten. "
      "Cold institutional lighting, chalk dust, "
      "the blackboard as evidence of intentional omission, "
      "the empty space more significant than what is written"
    ),
  },

  # ── 09 POSSIBILIDADE — O que saber muda — fullbleed ───────────────────────
  {
    "num": "09", "layout": "fullbleed",
    "title": (
      "SABER NÃO BASTA.\n"
      "MAS É O ÚNICO\n"
      "COMEÇO REAL."
    ),
    "body": (
      "Você não vai mudar o Banco Central.\n"
      "Não vai revogar Bretton Woods.\n"
      "Não vai fazer o banco parar de criar\n"
      "dinheiro do nada.\n"
      "\n"
      "Mas pode parar de operar\n"
      "como se não soubesse.\n"
      "\n"
      "Pode reconhecer a crença que foi instalada\n"
      "antes de você ter escolha.\n"
      "\n"
      "Informação não é poder.\n"
      "É pré-requisito."
    ),
    "prompt": build_prompt(
      "A person navigating a complex institutional maze — "
      "seen from above, the maze structure reveals the system's architecture clearly. "
      "Before understanding: the person moves randomly, hitting walls. "
      "After understanding: the same maze, but the person moves with deliberate awareness "
      "of the structure, finding the passages that exist. "
      "The maze does not change — the navigation changes. "
      "Knowledge as a shift in orientation, not in the system itself. "
      "Cold crimson maze architecture, deep black background, "
      "the person's path shifting from random to intentional"
    ),
  },

  # ── 10 PORTAL — CTA — fullbleed ───────────────────────────────────────────
  {
    "num": "10", "layout": "fullbleed",
    "title": (
      "COMENTE FONTE\n"
      "SE VOCÊ VAI OLHAR\n"
      "DIFERENTE PARA ISSO"
    ),
    "body": (
      "Não te pedimos para ter raiva.\n"
      "Te pedimos para ter clareza.\n"
      "@afonteoculta"
    ),
    "prompt": build_prompt(
      "A sealed vault door beginning to open — "
      "warm amber light flooding through the widening crack, "
      "the suppressed knowledge becoming accessible for the first time. "
      "The vault door is massive and institutional — cold, heavy, crimson-tinged metal. "
      "The light coming through is warm, honest, clear — "
      "not dangerous, just previously inaccessible. "
      "A single human silhouette stands before the opening door, "
      "not afraid, not angry — simply oriented toward the light with clarity. "
      "Deep black, cold institutional vault on this side, "
      "warm amber clarity on the other, the figure at the threshold of understanding"
    ),
  },

]


# ── API ────────────────────────────────────────────────────────────────────
def gen_image(prompt, retries=4):
    data = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }).encode()
    for attempt in range(retries):
        if attempt:
            wait = 12 * attempt
            print(f"  Aguardando {wait}s...")
            time.sleep(wait)
        req = urllib.request.Request(
            ENDPOINT, data=data,
            headers={"x-goog-api-key": API_KEY, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                body = json.loads(r.read())
            parts = body.get("candidates", [{}])[0].get("content", {}).get("parts", [])
            img_part = next(
                (p for p in parts if p.get("inlineData", {}).get("mimeType", "").startswith("image/")),
                None
            )
            if img_part:
                return base64.b64decode(img_part["inlineData"]["data"])
            print(f"  Sem imagem: {json.dumps(body)[:200]}")
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {e.read().decode()[:150]}")
        except Exception as e:
            print(f"  Erro: {e}")
    return None


# ── Main ───────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("  Carrossel — 5 Coisas que o Sistema te Escondeu sobre Dinheiro")
print("  Tema: CONSPIRACAO + DINHEIRO | 10 slides | Formato C | Preset: Crimson")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print("="*60 + "\n")

ICONS = {
    "01": "[CHOQUE]",
    "02": "[ITEM-1]", "03": "[ITEM-2]", "04": "[ITEM-3]",
    "05": "[ITEM-4]", "06": "[ITEM-5]",
    "07": "[CONVERGENCIA]", "08": "[OMISSAO]", "09": "[POSSIBILIDADE]",
    "10": "[PORTAL]",
}

ok = 0
for i, s in enumerate(slides):
    num    = s["num"]
    layout = s["layout"]
    title  = s["title"]
    icon   = ICONS.get(num, "")
    print(f"[{num}/10] {icon} {layout.upper()} - {title.splitlines()[0][:45]}...")

    img_bytes = gen_image(s["prompt"])
    if not img_bytes:
        print(f"  FALHOU — slide {num}\n")
        continue

    final = compose(img_bytes, title, s["body"], layout, preset_name=PRESET)

    fname = f"slide-{num}.jpg"
    out   = OUT_DIR / fname
    final.save(str(out), "JPEG", quality=95)
    print(f"  OK: {out.name}\n")
    ok += 1

    if i < len(slides) - 1:
        time.sleep(4)

print("="*60)
print(f"  CONCLUIDO: {ok}/10 slides")
print(f"  Pasta: {OUT_DIR}")
print("="*60 + "\n")


# ── Registro ───────────────────────────────────────────────────────────────
register(
    title         = "5 Coisas que o Sistema te Escondeu sobre Dinheiro",
    theme         = "sistema-dinheiro-conspiracao",
    format        = "C",
    slides_dir    = str(OUT_DIR),
    caption       = (
        "Bancos criam dinheiro do nada. Legalmente. "
        "Isso esta descrito no site do Banco da Inglaterra desde 2014. "
        "Voce trabalha anos para devolver dinheiro que foi criado em segundos. "
        "Inflacao e um imposto que nenhum parlamento precisa aprovar. "
        "Comente FONTE se voce vai olhar sua relacao com dinheiro diferente depois desse carrossel."
    ),
    revisor_score = "—",
    notes         = (
        "Formato C (Lista Revelacao). Tema CONSPIRACAO + DINHEIRO. "
        "Preset: cinematografico_crimson. 10 slides. "
        "5 itens: reserva fracionaria (BoE 2014), Bretton Woods 1944 + Nixon 1971, "
        "inflacao como imposto (Friedman 1963), juros rotativos 400% a.a., "
        "ondas theta e crencas pre-7-anos. "
        "Curva: CHOQUE > ITEM x5 > CONVERGENCIA > OMISSAO > POSSIBILIDADE > PORTAL."
    ),
)
