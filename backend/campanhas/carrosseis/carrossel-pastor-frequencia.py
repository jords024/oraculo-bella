#!/usr/bin/env python3
"""
carrossel-pastor-frequencia.py — v2 (Diretor Artístico + compose_util_v3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tema:    O salário do pastor vs. o cirurgião — e a doutrina que mantém você parado
Praça:   ALAVANCA | Formato: B | Score: 15/15 | Preset: revelacao
Hook:    PARADOXO SAGRADO — "Você paga para prosperar. Ele prospera."
Gerador: gpt-image-1 (OpenAI GPT Image 2)
Design:  compose_util_v3 — proporção 1080×1350 correta, smart_crop
"""

import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from dotenv import load_dotenv

load_dotenv()

from pathlib import Path

from diretor_artistico import SlideData, gerar_carrossel

# ── CONFIGURAÇÃO ───────────────────────────────────────────────────────────────
TEMA      = "O Pastor, o Cirurgião e a Doutrina que Mantém Você Parado"
TEMA_SLUG = "pastor-frequencia"
PRESET    = "revelacao"
OUT_DIR   = Path("C:/Users/julia/Desktop/carrossel-pastor-frequencia")

CAPTION = (
    "Um pastor neopentecostal ganha mais que um cirurgião.\n"
    "E quem paga são as pessoas que não conseguem sair do mesmo lugar financeiro.\n\n"
    "Isso não é coincidência.\n\n"
    "A doutrina de 'Deus provê' instala no sistema nervoso o mesmo estado "
    "que bloqueia ação, risco e merecimento.\n\n"
    "O sistema precisa que você espere.\n"
    "Porque quem age com autoridade própria não precisa de intermediário.\n\n"
    "E o intermediário é o produto.\n\n"
    "Prosperidade não vem de pedir.\n"
    "Vem de mudar o sinal que você já emite — antes de qualquer decisão consciente.\n\n"
    "Comente FONTE se você já sentiu que prosperar era pecado — "
    "como se dinheiro e espiritualidade não pudessem habitar o mesmo corpo.\n\n"
    "#fonteoculta #prosperidade #dizimo #teologiadaprosperidade "
    "#consciencia #liberdadefinanceira #espiritualidade #merecimento #desbloqueioNeural"
)

NOTAS = (
    "Formato B. Praça: ALAVANCA. Preset: revelacao. "
    "Gerador: gpt-image-1 (GPT Image 2). Design: compose_util_v3 (1080×1350). "
    "Raiva coletiva: IURD R$2,1bi, Macedo R$1,1bi, Cialdini 1984, HeartMath 1991. "
    "Produto bridge: Desbloqueio Neural."
)

# ── SLIDES ─────────────────────────────────────────────────────────────────────
slides = [

  # S1 — DISRUPÇÃO — image/cover ────────────────────────────────────────────────
  SlideData(
    num    = 1,
    estado = "DISRUPÇÃO",
    title  = "O SALÁRIO MÉDIO DE UM\nPASTOR NEOPENTECOSTAL\nSUPERA O DE UM CIRURGIÃO.\nQUEM PAGA NÃO CONSEGUE\nPAGAR O PRÓPRIO ALUGUEL.",
    body   = "E nenhum dos dois está errado\nsobre o que está acontecendo.",
    prompt = (
        "Painterly digital oil painting, cinematic mystical realism. "
        "Visual language of dark sacred baroque illustration meets contemporary digital painting. "
        "Rich, atmospheric, deeply textured."

        "Interior of an enormous neopentecostal megachurch seen from extreme low angle — "
        "camera at floor level looking steeply upward. "
        "The congregation fills the lower 30% of frame as a sea of tiny anonymous figures, "
        "heads slightly bowed, seen from above and behind. "
        "The altar and stage fill the upper 65% — grand, theatrical, corporate. "
        "A solitary suited male figure stands at the center of the illuminated stage, "
        "arms slightly extended, bathed in theatrical golden-amber spotlight from above. "
        "The scale contrast is overwhelming — pastor enormous, congregation small as insects."

        "Architectural details: soaring columns, massive LED screens flanking the stage "
        "showing abstract amber light, cathedral-like arched ceiling vanishing into darkness. "
        "NOT a humble church — this is a performance venue of power."

        "Color palette: deep crimson-black background, saturated amber-gold for the stage lighting, "
        "congregation in cool shadow-blue. "
        "From the ceiling: thin veins of vivid crimson light trace downward like cracks in plaster — "
        "suppressed fire bleeding through institutional stone."

        "Lower 35% fades to rich deep shadow for text. "
        "Rich painterly texture throughout — visible brushstroke quality."
    ),
  ),

  # S2 — DESCIDA — image ─────────────────────────────────────────────────────────
  SlideData(
    num    = 2,
    estado = "DESCIDA",
    title  = "VOCÊ NÃO ERA\nINGÊNUO.\nERA CONFIANTE.",
    body   = (
        "Ingenuidade é não saber o que está acontecendo.\n"
        "Confiança é saber — e acreditar que ia funcionar.\n\n"
        "O sistema que te capturou não é simples.\n"
        "É engenharia social com dois mil anos de refinamento."
    ),
    prompt = (
        "Painterly digital oil painting, cinematic atmospheric. "
        "Warm chiaroscuro lighting in the tradition of Vermeer and Rembrandt reimagined as dark fantasy."

        "A solitary figure seen entirely from behind, standing before an enormous arched window. "
        "The figure is still, shoulders carrying quiet weight — not defeat, just stillness. "
        "The window glass is thick, aged, very slightly frosted — amber-gold light pours through "
        "from the other side, visible but not quite reachable. "
        "The window frame has the architecture of a cathedral but repurposed for something institutional."

        "Outside the window: warm amber light suggesting possibility, movement, life. "
        "Inside where the figure stands: cool, contained, dignified shadow. "
        "The contrast is not punishing — it is elegant containment."

        "Floor: aged stone with subtle reflections of the amber light. "
        "The figure's posture: not broken, not hopeful — simply present at a threshold."

        "Color palette: warm amber and gold for the window light, "
        "cool grey-blue shadow for the interior, "
        "subtle crimson undertones in the stone floor and walls. "
        "Upper 50% of frame left for text overlay — keep it compositionally open."
    ),
  ),

  # S3 — NOMEAÇÃO — text (dados densos, modo preto) ────────────────────────────
  SlideData(
    num    = 3,
    estado = "NOMEAÇÃO",
    mode   = "text",
    title  = "O NÚMERO QUE\nNINGUÉM MOSTRA\nNO SERMÃO",
    body   = (
        "A Igreja Universal registra faturamento estimado\n"
        "em R$ 2,1 bilhões por ano. CNPJ de templo.\n"
        "Isenção fiscal total.\n\n"
        "Bispo Edir Macedo: patrimônio declarado superior a R$ 1,1 bilhão.\n\n"
        "Cirurgião cardíaco no SUS: R$ 12 mil/mês.\n"
        "Pastor titular de megaigreja: R$ 30 a 80 mil/mês.\n\n"
        "O dinheiro que falta na sua conta tem endereço."
    ),
    prompt = (
        "Painterly digital oil painting, esoteric mystical realism. "
        "Visual language of an ancient illuminated manuscript crossed with a secret society's "
        "financial ledger — sacred and sinister simultaneously."

        "An open ancient tome or grimoire lying on a dark stone surface. "
        "The pages are aged parchment, hand-lettered with large ornate numerals and symbols "
        "in the style of medieval financial records — but the numbers are vast, "
        "rendered in gold ink that glows with inner light. "
        "Surrounding the tome: scattered gold coins, institutional seals in wax, "
        "architectural blueprints of temples folded at the edges."

        "Illumination from a single candle source — warm amber-gold casting dramatic shadows "
        "across the page surface, making the numbers feel both revealed and dangerous."

        "From between the pages: thin lines of vivid crimson light "
        "seep outward like something being held shut that wants to open."

        "Color palette: aged parchment, deep shadow-brown, gold illumination, crimson accents. "
        "NOT journalistic — this is the aesthetic of forbidden knowledge, not a spreadsheet. "
        "Upper 45% compositionally open for text."
    ),
  ),

  # S4 — PROFUNDIDADE — text (dado denso, texto longo) ─────────────────────────
  SlideData(
    num    = 4,
    estado = "PROFUNDIDADE",
    title  = "POR QUE FUNCIONA\nNO SEU CÉREBRO",
    body   = (
        "Não é manipulação simples. É neurociência documentada.\n\n"
        "Reciprocidade (Cialdini, 1984): você doa → espera retorno →\n"
        "quando não vem → doa mais.\n"
        "O mesmo mecanismo de reforço variável que cria dependência em jogos.\n\n"
        "Identidade tribal: 'sou uma pessoa de fé' fica neurologicamente\n"
        "atrelado ao ato de dar. Parar de dar é trair quem você é.\n\n"
        "Não foi inventado por pastores.\n"
        "Foi catalogado por Robert Cialdini em laboratório."
    ),
  ),

  # S5 — QUEDA FUNDA — text ─────────────────────────────────────────────────────
  SlideData(
    num    = 5,
    estado = "QUEDA FUNDA",
    title  = "A DOUTRINA DE\n\"DEUS PROVÊ\"\nE A DOUTRINA DE\n\"EU NÃO MEREÇO AGIR\"\nSÃO A MESMA COISA.",
    body   = (
        "Ditas em tons diferentes.\n\n"
        "O sistema não precisou te obrigar a parar.\n"
        "Apenas te ensinou a esperar.\n\n"
        "Uma doutrina que te ensina a ESPERAR\n"
        "desativa a mesma parte do cérebro\n"
        "que você precisaria para AGIR com autoridade financeira.\n\n"
        "O sistema precisa que você espere.\n"
        "Porque quem age com autoridade própria\n"
        "não precisa de intermediário."
    ),
  ),

  # S6 — ESPELHO — text ──────────────────────────────────────────────────────────
  SlideData(
    num    = 6,
    estado = "ESPELHO",
    title  = "VOCÊ JÁ FEZ ISSO.",
    body   = (
        "Recusou uma oportunidade porque 'não era a hora de Deus.'\n"
        "Deixou de cobrar o que valia porque pedir dinheiro parecia ganância.\n"
        "Esperou uma 'abertura de porta'\n"
        "enquanto a porta estava destrancada do seu lado de dentro.\n\n"
        "Você não estava sem fé.\n"
        "Estava sem merecimento.\n\n"
        "E o sistema precisava exatamente disso de você."
    ),
  ),

  # S7 — ASCENSÃO — image ────────────────────────────────────────────────────────
  SlideData(
    num    = 7,
    estado = "ASCENSÃO",
    title  = "PROSPERIDADE\nNÃO VEM DE PEDIR.\nVEM DE MUDAR\nO SINAL.",
    body   = (
        "O coração humano emite um sinal mensurável\n"
        "a 1,5 metro do corpo.\n"
        "HeartMath Institute, 1991.\n\n"
        "Esse sinal chega antes de você falar.\n"
        "Antes de você agir.\n"
        "Antes de qualquer decisão."
    ),
    prompt = (
        "Painterly digital oil painting, scientific mysticism, cinematic atmospheric. "
        "Visual language where physics visualization meets sacred geometry — "
        "beautiful, empirical, and numinous simultaneously."

        "Abstract frequency and resonance made visible — "
        "concentric rings and spiraling wave patterns "
        "radiating outward from a brilliant central point of intense amber-white light. "
        "The rings are not mechanical or digital — they are painted with organic warmth, "
        "like ripples on water rendered in luminous gold. "
        "Each successive ring transitions from bright gold at center "
        "to warm amber, then to deep teal-cyan at the outer edges."

        "Between the rings: deep cosmic indigo-black space with scattered luminous particles "
        "being drawn inward toward the center, like iron filings pulled to a source. "

        "Color palette: deep cosmic indigo-black background, "
        "primary amber-gold rings, teal-cyan secondary harmonics, "
        "white-gold at convergence center, subtle crimson accents at far edges. "
        "Upper 45% compositionally open for text overlay. "
        "No human figures."
    ),
  ),

  # S8 — CRISTALIZAÇÃO — image ──────────────────────────────────────────────────
  SlideData(
    num    = 8,
    estado = "CRISTALIZAÇÃO",
    title  = "O QUE VOCÊ\nPAGOU NÃO ERA\nSEMENTE.\nERA ALUGUEL.",
    body   = (
        "Aluguel de uma identidade\n"
        "que precisava de intermediário para existir.\n\n"
        "Sempre esteve dentro de você.\n"
        "Antes do seu nome.\n"
        "Antes do primeiro sermão.\n\n"
        "Comente FONTE se você já sentiu\n"
        "que prosperar era pecado."
    ),
    prompt = (
        "Painterly digital oil painting, cinematic sacred naturalism. "
        "Visual language of Renaissance botanical illustration meets mystical earth magic — "
        "intimate, luminous, and deeply symbolic."

        "Close-up view of earth and root system, rendered with extraordinary painterly detail. "
        "A single seed at the center of frame — cracked open, its shell split. "
        "But instead of roots growing DOWN and a shoot growing UP, "
        "light emerges FROM WITHIN the seed itself, radiating outward in all directions equally — "
        "amber-gold illumination pouring out of the crack as if the seed contains its own sun."

        "The surrounding earth: rich, dark, fertile — rendered with visible soil texture, "
        "tiny mineral particles catching the amber light from within. "
        "At the very edges of frame: darkness."

        "The light from within the seed: not miraculous — "
        "it reads as NATURAL, as if this is simply what seeds do "
        "when they have not been prevented from opening."

        "Color palette: deep earth browns and blacks, "
        "vivid amber-gold emanating from seed center, "
        "subtle crimson undertones in the surrounding soil. "
        "Lower 38% fades to deep shadow for text overlay."
    ),
  ),

  # S9 — SETUP CTA — text ────────────────────────────────────────────────────────
  SlideData(
    num    = 9,
    estado = "SETUP CTA",
    title  = "EXISTE UMA\nTECNOLOGIA\nPARA ISSO.",
    body   = (
        "Não é afirmação positiva.\n"
        "Não é lei da atração.\n"
        "Não é mais um curso de mentalidade financeira.\n\n"
        "É uma tecnologia sonora desenvolvida\n"
        "para mudar o que você acredita que merece —\n"
        "antes da crença, antes da resistência,\n"
        "antes de qualquer esforço consciente.\n\n"
        "A mudança acontece antes de você precisar\n"
        "acreditar em qualquer coisa."
    ),
  ),

  # S10 — CTA FIXO — image (portal dourado, preset sagrado automático) ──────────
  SlideData(
    num    = 10,
    estado = "CTA FIXO",
    title  = "COMENTE\nFONTE",
    body   = (
        "E eu te envio a Tecnologia Sonora capaz de\n"
        "mudar o que você acredita que merece\n"
        "usando o Desbloqueio Neural."
    ),
    prompt = (
        "Painterly digital oil painting, pure sacred mysticism. "
        "A portal of golden light — nothing else."

        "The entire frame is occupied by a circular or archway portal of pure golden-amber light. "
        "The portal radiates from its center outward — "
        "the center is brilliant white-gold, transitioning to warm amber, "
        "then to deep amber at the edges, then to rich dark cosmic indigo at the frame edges. "
        "The transition is painted with extraordinary luminous detail — "
        "visible brushstrokes in the light itself, like Turner's luminous atmospheres."

        "The portal shape: a natural oval or archway, not geometric or mechanical — "
        "organic, like light emerging through ancient stone that has dissolved. "
        "No frame, no door, no threshold object — just the light itself as destination."

        "At the very edges: faint suggestions of ancient stone or cosmic depth, "
        "barely visible in the darkness surrounding the portal."

        "Color palette: brilliant white-gold center, warm amber mid-tones, "
        "deep cosmic indigo at outer edges. "
        "The image should feel like an invitation, not a command — "
        "warm, open, inevitable."
    ),
  ),

]

# ── EXECUÇÃO ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    gerar_carrossel(
        tema          = TEMA,
        tema_slug     = TEMA_SLUG,
        slides        = slides,
        preset_name   = PRESET,
        formato       = "B",
        caption       = CAPTION,
        revisor_score = 15.0,
        notes         = NOTAS,
        out_dir       = OUT_DIR,
        registrar     = True,
    )
