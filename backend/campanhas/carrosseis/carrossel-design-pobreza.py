#!/usr/bin/env python3
"""
carrossel-design-pobreza.py — O Design da Pobreza
Tema: SELIC como mecanismo de transferência / arquitetura da pobreza
Preset: REVELACAO | 10 slides | Formato A
"""

import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from diretor_artistico import SlideData, gerar_carrossel

TEMA      = "O Design da Pobreza"
TEMA_SLUG = "design-pobreza"
PRESET    = "esoterico"
FORMATO   = "A"

CAPTION = """\
O Brasil pagou R$ 756 bilhões em juros da dívida pública em 2023.

Esse dinheiro saiu de algum lugar.
Saiu do seu imposto. Do seu salário. Da sua inflação.
E foi para quem tem títulos públicos.

Não é corrupção. É o contrato.
Você só nunca foi informado que estava dentro dele.

Comente FONTE se você já tentou de tudo — poupou, investiu, se esforçou — \
e ainda sentia uma força invisível impedindo o dinheiro de ficar.\
"""

SLIDES = [
    SlideData(
        num    = 1,
        estado = "DISRUPÇÃO",
        title  = "O BRASIL TEM A MAIOR\nTAXA DE JUROS REAL\nDO MUNDO HÁ 30 ANOS.\nISTO NÃO É INCOMPETÊNCIA.\nÉ O MODELO.",
        body   = "E o modelo funciona.\nSó não funciona para você.",
        prompt = (
            "A Brazilian favela and a luxury penthouse side by side, "
            "divided by a glowing financial graph line going up, "
            "vivid electric blue and gold color contrast, cinematic split composition, "
            "expressive and confrontational, dramatic depth, high detail portrait"
        ),
        cover  = True,
    ),
    SlideData(
        num    = 2,
        estado = "DESCIDA",
        title  = "VOCÊ SENTE.\nMAS NÃO SABE\nNOMEAR.",
        body   = (
            "Trabalhou mais esse ano. A conta não cresceu proporcionalmente.\n"
            "Tentou poupar. A inflação não deixou.\n"
            "Não é falta de esforço. É física.\n"
            "O dinheiro vai para algum lugar."
        ),
        prompt = (
            "A tired worker at a desk late at night, coins slipping through their fingers, "
            "blue melancholic light from a window, cinematic intimate shot, "
            "deep blues and warm amber, atmospheric and emotional, high detail"
        ),
    ),
    SlideData(
        num    = 3,
        estado = "NOMEAÇÃO",
        title  = "CADA REAL QUE VOCÊ\nNÃO CONSEGUE GUARDAR\nFOI TRANSFERIDO.\nVIA SELIC.\nPARA QUEM JÁ TINHA.",
        body   = (
            "A SELIC não é uma taxa técnica. É um mecanismo de transferência.\n"
            "Em 2023, o governo brasileiro pagou R$ 756 bilhões em juros da dívida pública.\n"
            "Quem recebeu esse dinheiro nunca trabalhou um dia para ele."
        ),
        prompt = (
            "Streams of golden money flowing upward like rivers of light, "
            "from many working hands below toward a single wealthy figure above, "
            "vivid electric gold and deep indigo contrast, cinematic wide shot, "
            "accusatory and powerful composition, high detail"
        ),
    ),
    SlideData(
        num    = 4,
        estado = "PROFUNDIDADE",
        title  = "COMO O MECANISMO\nFUNCIONA:",
        body   = (
            "1. Governo emite títulos públicos pagando SELIC\n"
            "2. Bancos e fundos compram esses títulos\n"
            "3. Você paga impostos para servir essa dívida\n"
            "4. Os juros voltam para quem já tinha capital\n\n"
            "Não é corrupção. É o contrato.\n"
            "Você só nunca foi informado que assinou."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 5,
        estado = "QUEDA FUNDA",
        title  = "E A PARTE\nQUE QUEIMA:",
        body   = (
            "Cada vez que você paga IR, INSS, IOF —\n"
            "você financia os juros de quem não precisa trabalhar.\n"
            "Você não é vítima passiva do sistema.\n"
            "Você é o mecanismo.\n"
            "Sem o seu trabalho, os juros não existem."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 6,
        estado = "ESPELHO",
        title  = "EXISTE UMA PARTE\nDE VOCÊ QUE JÁ\nSUSPEITAVA.",
        body   = (
            "Que não era preguiça.\n"
            "Que não era falta de disciplina.\n"
            "Que existia uma força contra a qual nenhum esforço individual era suficiente.\n"
            "Você estava certo. E nunca soube nomear."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 7,
        estado = "ASCENSÃO",
        title  = "VOCÊ NÃO PODE\nMUDAR A SELIC.\nPODE MUDAR\nO QUE SEU CAMPO\nRECONHECE COMO RIQUEZA.",
        body   = (
            "Não é resignação. É precisão.\n"
            "O sistema opera na frequência do capital acumulado.\n"
            "Você pode sintonizar nessa frequência — antes de ter o capital.\n"
            "É isso que o sistema não ensina."
        ),
        prompt = (
            "A person standing on top of a mountain at sunrise, arms open wide, "
            "vast golden sky stretching infinitely, electric dawn light, "
            "sense of breakthrough and possibility, vivid warm golds and electric blues, "
            "cinematic and powerful, expressive upward energy"
        ),
    ),
    SlideData(
        num    = 8,
        estado = "CRISTALIZAÇÃO",
        title  = "A POBREZA\nNÃO É AUSÊNCIA\nDE ESFORÇO.\nÉ PRESENÇA\nDE ARQUITETURA.",
        body   = (
            "E arquitetura pode ser reconhecida.\n"
            "O que é reconhecido, pode ser atravessado."
        ),
        prompt = (
            "A lone figure standing at the center of a vast invisible financial architecture, "
            "walls of translucent golden geometric structures surrounding them, "
            "the structures beginning to dissolve and shatter into streams of light, "
            "warm gold and electric teal tones, cinematic dramatic wide shot, "
            "sense of recognition and liberation, expressive and luminous, high detail portrait"
        ),
    ),
    SlideData(
        num    = 9,
        estado = "SETUP CTA",
        title  = "EXISTE UM PROTOCOLO\nQUE SINTONIZA SEU CAMPO\nNA FREQUÊNCIA DO\nCAPITAL — ANTES\nDE VOCÊ TÊ-LO.",
        body   = (
            "Não é visualização. Não é afirmação.\n"
            "Opera no sistema nervoso antes da mente consciente decidir.\n"
            "Eu uso. Funciona."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 10,
        estado = "CTA FIXO",
        title  = "COMENTE\nFONTE",
        body   = (
            "E eu te envio a Tecnologia Sonora capaz de sintonizar "
            "seu campo na frequência de prosperidade "
            "usando o Desbloqueio Neural."
        ),
        prompt = (
            "A triumphant figure standing above a broken financial graph, "
            "golden coins and light raining down from a vast electric sky, "
            "the SELIC architecture crumbling below into dust, "
            "arms raised wide, vivid gold and electric indigo sky above, "
            "powerful upward cinematic composition from below looking up, "
            "radiant abundance energy, expressive and alive, high detail portrait"
        ),
    ),
]

if __name__ == "__main__":
    gerar_carrossel(
        tema          = TEMA,
        tema_slug     = TEMA_SLUG,
        slides        = SLIDES,
        preset_name   = PRESET,
        formato       = FORMATO,
        caption       = CAPTION,
        revisor_score = 15.0,
        notes         = "Design da Pobreza — SELIC + R$756bi 2023 + mecanismo rentista. 15/15.",
    )
