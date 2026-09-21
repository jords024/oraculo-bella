#!/usr/bin/env python3

import os

from dotenv import load_dotenv

load_dotenv()
os.environ["PYTHONIOENCODING"] = "utf-8"
"""
Carrossel — Seus Ancestrais te Deixaram Heranca. Foi Trauma. E ele Vibra no seu DNA.
Tema: EPIGENETICA | Formato A — Tese + Traducao
Preset: cinematografico
Curva: TESE > CIENCIA x3 > TRADUCAO x2 > EXTENSAO > RECONHECIMENTO > POSSIBILIDADE > PORTAL
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
OUT_DIR  = Path("C:/Users/julia/Desktop/carrossel-heranca-trauma")
PRESET   = "cinematografico"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Slides — Copy + Prompts ──────────────────────────────────────────────────
slides = [

  # ── 01 TESE — Cover fullbleed ─────────────────────────────────────────────
  {
    "num": "01", "layout": "fullbleed",
    "title": (
      "SEUS ANCESTRAIS TE DEIXARAM\n"
      "HERANÇA. NÃO FOI DINHEIRO.\n"
      "FOI TRAUMA."
    ),
    "body": (
      "E ele vibra no seu DNA agora.\n"
      "\n"
      "Isso não é metáfora espiritual.\n"
      "É epigenética. É mensurável. É você."
    ),
    "prompt": build_prompt(
      "A DNA double helix rendered in deep blue and cold electric light — "
      "but threaded through the helix: faint ancestral shadow figures, "
      "generations of human forms embedded within the genetic structure itself. "
      "Each figure carries a visible frequency pattern — stress signatures, "
      "survival patterns, inherited alarm states — "
      "encoded directly into the spiral's structure. "
      "The DNA is not just biology — it is carrying lived experience. "
      "Deep black, cold electric blue for the helix, "
      "faint warm amber for the ancestral traces embedded within it"
    ),
  },

  # ── 02 CIÊNCIA — Epigenética — card ──────────────────────────────────────
  {
    "num": "02", "layout": "card",
    "title": (
      "EPIGENÉTICA:\n"
      "O QUE É E POR QUE\n"
      "MUDA TUDO"
    ),
    "body": (
      "O DNA não muda entre gerações. A expressão gênica, sim.\n"
      "\n"
      "Epigenética é o estudo de como experiências,\n"
      "traumas e ambientes ativam ou silenciam genes\n"
      "sem alterar a sequência do DNA.\n"
      "\n"
      "A informação não fica no código genético.\n"
      "Fica em marcadores químicos chamados grupos metil\n"
      "que dizem a cada gene: fale ou cale.\n"
      "\n"
      "Esses marcadores são herdados."
    ),
    "prompt": build_prompt(
      "A DNA strand shown in scientific cross-section — "
      "the base sequence unchanged and stable beneath. "
      "Above it: small chemical methyl group markers attaching and detaching, "
      "shown as cold blue molecular structures landing on specific gene sites "
      "and switching them on (lit, electric blue) or off (dark, silenced). "
      "The on/off mechanism is precise, targeted, hereditary. "
      "Cold clinical light, molecular precision, "
      "the epigenetic switch shown as a physical mechanism on the genetic structure"
    ),
  },

  # ── 03 CIÊNCIA — O estudo do Holocausto — fullbleed ───────────────────────
  {
    "num": "03", "layout": "fullbleed",
    "title": (
      "FILHOS DE SOBREVIVENTES\n"
      "DO HOLOCAUSTO\n"
      "NASCERAM COM O TRAUMA"
    ),
    "body": (
      "Rachel Yehuda, Hospital Monte Sinai, Nova York.\n"
      "Biological Psychiatry, 2016.\n"
      "\n"
      "Filhos de sobreviventes tinham\n"
      "marcadores epigenéticos alterados\n"
      "idênticos aos dos pais que viveram o trauma.\n"
      "\n"
      "Eles não viveram a guerra.\n"
      "Mas o sistema de resposta ao estresse\n"
      "estava calibrado como se tivessem."
    ),
    "prompt": build_prompt(
      "Two human silhouettes — parent and child — standing apart from each other "
      "but connected by an invisible thread of identical frequency patterns. "
      "The parent figure carries visible trauma markers: "
      "high-frequency stress patterns radiating from the nervous system, electric and fractured. "
      "The child figure, untouched by the original event, "
      "carries the exact same stress frequency pattern — "
      "inherited without experience, biological without memory. "
      "The thread connecting them is the epigenetic inheritance. "
      "Cold blue, deep black, the inherited trauma shown as identical wave signatures "
      "in two separate bodies across a generation"
    ),
  },

  # ── 04 CIÊNCIA — O mecanismo — card ──────────────────────────────────────
  {
    "num": "04", "layout": "card",
    "title": (
      "TRAUMA NÃO É\n"
      "SÓ MEMÓRIA.\n"
      "É FREQUÊNCIA."
    ),
    "body": (
      "Quando um ancestral sobreviveu a escassez extrema,\n"
      "o corpo aprendeu: o mundo é perigoso.\n"
      "Mantenha-se em alerta.\n"
      "\n"
      "Esse estado de alerta foi transmitido\n"
      "como configuração padrão.\n"
      "\n"
      "Não como história.\n"
      "Como biologia.\n"
      "\n"
      "Bessel van der Kolk documentou isso\n"
      "em 20 anos de pesquisa clínica."
    ),
    "prompt": build_prompt(
      "The human autonomic nervous system shown in high-alert state — "
      "sympathetic nervous system fully activated, "
      "stress hormones shown as electric cold blue signals cascading through the body pathways. "
      "The alarm state is permanent, background, always-on — "
      "not triggered by any current threat, just running as a default setting. "
      "The body as a system configured for danger that no longer exists. "
      "Deep black background, cold electric blue for the stress pathways, "
      "the nervous system as inherited hardware running inherited software"
    ),
  },

  # ── 05 TRADUÇÃO — O que isso significa — fullbleed ────────────────────────
  {
    "num": "05", "layout": "fullbleed",
    "title": (
      "O QUE ISSO SIGNIFICA\n"
      "NA SUA VIDA AGORA"
    ),
    "body": (
      "Padrões de ansiedade que você não consegue explicar.\n"
      "Medo desproporcional a situações de baixo risco.\n"
      "Dificuldade de confiar sem motivo claro.\n"
      "Sensação de que algo vai dar errado\n"
      "mesmo quando tudo está bem.\n"
      "\n"
      "Esses não são seus defeitos de caráter.\n"
      "São frequências gravadas no seu sistema nervoso\n"
      "por experiências que seus avós viveram."
    ),
    "prompt": build_prompt(
      "A person standing in a calm, safe environment — "
      "warm light, open space, no visible threat. "
      "But their nervous system, shown as a translucent overlay, "
      "is running in high-alert mode: rapid stress signals, "
      "contracted posture, the alarm system firing for no current reason. "
      "The disconnect between the safe environment and the inherited alarm state "
      "made visually explicit. "
      "The environment is warm and safe. The body is cold and contracted. "
      "Deep black background, the mismatch between outer safety and inner inherited alarm"
    ),
  },

  # ── 06 EXTENSÃO — Além do Holocausto — card ───────────────────────────────
  {
    "num": "06", "layout": "card",
    "title": (
      "NÃO É SÓ\n"
      "O HOLOCAUSTO"
    ),
    "body": (
      "Pesquisadores da Universidade de Emory\n"
      "condicionaram ratos a temer um cheiro específico.\n"
      "\n"
      "Seus filhos e netos nasceram com medo\n"
      "do mesmo cheiro.\n"
      "Sem nunca terem sido expostos ao trauma original.\n"
      "\n"
      "Para humanos:\n"
      "escravidão, fome, guerra,\n"
      "pobreza extrema, perseguição religiosa.\n"
      "\n"
      "Qual dessas frequências está na sua linhagem?"
    ),
    "prompt": build_prompt(
      "A generational family tree shown as root system descending deep into the earth — "
      "at the root level: a single traumatic event marked in deep red, "
      "a stress frequency pattern originating in one ancestor. "
      "The roots carry the pattern upward through generations, "
      "each branch showing the same frequency signature arriving at modern descendants "
      "who have never experienced the original event. "
      "The transmission is biological, inevitable, invisible to those who carry it. "
      "Cold blue electric frequency traveling through warm amber root pathways, "
      "deep black background, the inheritance made structurally visible"
    ),
  },

  # ── 07 RECONHECIMENTO — Você não começou do zero — fullbleed ──────────────
  {
    "num": "07", "layout": "fullbleed",
    "title": (
      "VOCÊ NÃO\n"
      "COMEÇOU DO ZERO"
    ),
    "body": (
      "Ninguém começa do zero.\n"
      "Você nasceu com configurações instaladas.\n"
      "Algumas úteis. Algumas limitantes.\n"
      "Nenhuma escolhida por você.\n"
      "\n"
      "O problema não é ter essas configurações.\n"
      "O problema é não saber que elas existem\n"
      "e achar que os padrões que você repete\n"
      "são falhas suas."
    ),
    "prompt": build_prompt(
      "A human figure shown as a layered system — "
      "the outermost layer: who they present themselves as today, clear and defined. "
      "Beneath it: layers of inherited configuration — each layer slightly older, "
      "each carrying different frequency patterns from different ancestors. "
      "The deepest layer: the original ancestral trauma frequency, cold and foundational. "
      "The person does not know the layers exist — they only see the surface. "
      "Cross-section aesthetic, deep black background, "
      "cold blue for the inherited layers, the person's own frequency warmest at the surface"
    ),
  },

  # ── 08 POSSIBILIDADE — Epigenética é reversível — card ────────────────────
  {
    "num": "08", "layout": "card",
    "title": (
      "EPIGENÉTICA\n"
      "É REVERSÍVEL"
    ),
    "body": (
      "Isso é o que a ciência também diz.\n"
      "\n"
      "Práticas que alteram expressão gênica\n"
      "de forma mensurável:\n"
      "\n"
      "Meditação sustentada — estudo Harvard, 8 semanas.\n"
      "Regulação do sistema nervoso autônomo.\n"
      "Exposição intencional ao estado oposto ao trauma.\n"
      "\n"
      "Você pode ser o primeiro de sua linhagem\n"
      "a interromper uma frequência."
    ),
    "prompt": build_prompt(
      "A DNA strand shown in transformation — "
      "the inherited methyl group trauma markers beginning to release and detach "
      "from specific gene sites, shown as cold blue structures loosening and dissolving. "
      "As each marker releases: the gene beneath lights up in warm amber, "
      "expressing differently, speaking a new language. "
      "The process is slow, deliberate, biological — earned through sustained practice. "
      "Cold blue releasing, warm amber emerging, "
      "the epigenetic change as a physical visible process in the genetic material"
    ),
  },

  # ── 09 ATIVAÇÃO — A pergunta da linhagem — fullbleed ──────────────────────
  {
    "num": "09", "layout": "fullbleed",
    "title": (
      "QUE PADRÃO SE REPETE\n"
      "NA SUA FAMÍLIA\n"
      "HÁ GERAÇÕES?"
    ),
    "body": (
      "Escassez? Medo de abandono?\n"
      "Desconfiança? Autossabotagem?\n"
      "\n"
      "Esse padrão tem uma origem.\n"
      "E a origem não é você.\n"
      "\n"
      "Saber disso não resolve.\n"
      "Mas é o único começo real."
    ),
    "prompt": build_prompt(
      "A single human figure standing with translucent ancestral shadows behind them — "
      "three generations of ancestors visible as faint overlapping silhouettes, "
      "all in the same contracted posture, all carrying the same frequency pattern. "
      "The current person begins to straighten slightly — "
      "a barely perceptible shift from the inherited posture. "
      "The pattern is visible across generations. The beginning of the break is also visible. "
      "Deep black background, ancestral figures in cold blue shadow, "
      "the current figure with the faintest warm amber light emerging"
    ),
  },

  # ── 10 PORTAL — CTA — fullbleed ───────────────────────────────────────────
  {
    "num": "10", "layout": "fullbleed",
    "title": (
      "COMENTE FONTE\n"
      "SE VOCÊ RECONHECEU\n"
      "ESSE PADRÃO NA SUA LINHAGEM"
    ),
    "body": (
      "A ciência chegou onde\n"
      "a espiritualidade já sabia.\n"
      "\n"
      "A linhagem importa.\n"
      "E pode ser reescrita.\n"
      "@afonteoculta"
    ),
    "prompt": build_prompt(
      "A luminous doorway opening in a dark ancestral space — "
      "behind the door: the inherited frequency patterns of generations, cold and accumulated. "
      "Through the door: warm amber light, a different frequency, chosen rather than inherited. "
      "A single human figure standing at the threshold — "
      "aware for the first time of the door's existence. "
      "The awareness itself is the beginning of the crossing. "
      "Deep black ancestral space, warm amber light ahead, "
      "the figure small at the threshold of a generational shift"
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
print("  Carrossel — Heranca de Trauma no DNA")
print("  Tema: EPIGENETICA | 10 slides | Formato A | Preset: Cinematografico")
print(f"  Modelo: {MODEL}")
print(f"  Saida: {OUT_DIR}")
print("="*60 + "\n")

ICONS = {
    "01": "[TESE]",
    "02": "[CIENCIA]", "03": "[CIENCIA]", "04": "[CIENCIA]",
    "05": "[TRADUCAO]", "06": "[EXTENSAO]",
    "07": "[RECONHECIMENTO]", "08": "[POSSIBILIDADE]", "09": "[ATIVACAO]",
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
    title         = "Seus Ancestrais te Deixaram Heranca. Foi Trauma. E ele Vibra no seu DNA.",
    theme         = "heranca-trauma-epigenetica",
    format        = "A",
    slides_dir    = str(OUT_DIR),
    caption       = (
        "O trauma que voce carrega talvez nao tenha comecado em voce. "
        "Pesquisadores do Hospital Monte Sinai mediram: filhos de sobreviventes do Holocausto "
        "tinham marcadores epigeneticos alterados identicos aos dos pais. "
        "Eles nao viveram a guerra. O sistema nervoso deles foi calibrado como se tivessem. "
        "Comente FONTE se voce identificou na sua familia um padrao que se repete ha geracoes."
    ),
    revisor_score = "—",
    notes         = (
        "Formato A (Tese + Traducao). Tema EPIGENETICA. "
        "Preset: cinematografico. 10 slides. "
        "Referencias: Rachel Yehuda (Monte Sinai, 2016), Bessel van der Kolk, "
        "Universidade de Emory (ratos e olfato), Harvard meditacao 8 semanas. "
        "Curva: TESE > CIENCIA x3 > TRADUCAO x2 > EXTENSAO > RECONHECIMENTO > POSSIBILIDADE > PORTAL."
    ),
)
