#!/usr/bin/env python3
"""
carrossel-ilusao-magnetica.py — A Ilusão Magnética: Você não "Atrai"
Método Jordânico | Praça: ALAVANCA / MENTE | Formato B
Tema: A falácia da Lei da Atração ensinada. O conceito de colapso de onda.
Preset: esoterico | 10 slides
"""

import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from diretor_artistico import SlideData, gerar_carrossel

TEMA      = "A Ilusão Magnética: Você Não 'Atrai' Dinheiro"
TEMA_SLUG = "ilusao-magnetica"
PRESET    = "esoterico"
FORMATO   = "B"

CAPTION = """\
A Lei da Atração foi mal traduzida de propósito para vender livros.

Se você tenta 'atrair' o dinheiro, o seu cérebro entende duas coisas: o dinheiro está longe, e você não tem.

E o Universo obedece a essa leitura.

O experimento da Fenda Dupla da física quântica provou que a realidade não é sólida. Ela é uma onda de infinitas possibilidades. O observador é quem 'colapsa' uma dessas possibilidades na matéria.

Você não atrai. Você SINTONIZA.

Comente FONTE e eu te envio o protocolo que força o cérebro a mudar de canal.

#fonteoculta #leidaatracao #fisicaquantica #prosperidade #manifestacao #energia #frequencia #mentemilionaria\
"""

SLIDES = [
    SlideData(
        num    = 1,
        estado = "DISRUPÇÃO",
        title  = "VOCÊ NÃO\nATRAI\nO DINHEIRO.",
        body   = (
            "O documentário O Segredo escondeu a parte mais importante "
            "para te vender um método mastigado.\n"
            "Se você foca em 'atrair', o seu cérebro "
            "foca na separação: o dinheiro está longe de você."
        ),
        prompt = (
            "A solitary person standing in a vast, dark, majestic hall reaching out with one hand towards a distant, floating golden light. "
            "The space between them is filled with tension. "
            "Moody, dramatic cinematic lighting, deep blues and rich gold, painterly style, emotional weight."
        ),
        cover  = True,
    ),
    SlideData(
        num    = 2,
        estado = "DESCIDA",
        title  = "A FÍSICA PROVOU\nA FALHA EM 1927.",
        body   = (
            "O experimento da Fenda Dupla já provou "
            "que não existe uma realidade única.\n"
            "A matéria só se comporta como matéria "
            "quando é observada. Quando não é observada, "
            "ela é uma onda de probabilidade."
        ),
        prompt = (
            "A mesmerizing visualization of light passing through two vertical slits in a massive dark monolith, creating an ethereal wave pattern in the dusty air. "
            "Atmospheric, scientific but mystical, high contrast between the glowing light and deep shadows."
        ),
    ),
    SlideData(
        num    = 3,
        estado = "NOMEAÇÃO",
        title  = "NÃO É ATRAÇÃO.\nÉ COLAPSO.",
        body   = (
            "Tentar atrair a riqueza é como tentar puxar "
            "o apresentador do canal 4 para o canal 5 "
            "usando um laço.\n"
            "É fisicamente impossível.\n"
            "Você não puxa o apresentador. Você muda o canal."
        ),
        prompt = (
            "A person standing in front of several massive, semi-transparent panes of glass floating in a dark room. "
            "Each pane reflects a different version of the person's life, some dark and bleak, one glowing with warm gold. "
            "The person is gently touching the golden pane. "
            "Cinematic, mysterious, deep emotional resonance."
        ),
    ),
    SlideData(
        num    = 4,
        estado = "PROFUNDIDADE",
        title  = "A FREQUÊNCIA\nDO PEDINTE.",
        body   = (
            "Quando você deseja algo com desespero, "
            "o campo eletromagnético do seu coração "
            "emite o código da FALTA.\n"
            "O campo quântico é um espelho mecânico.\n"
            "Ele lê a falta, e te entrega mais motivos "
            "para sentir falta."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 5,
        estado = "QUEDA FUNDA",
        title  = "ISSO EXPLICA\nO SEU CANSAÇO.",
        body   = (
            "É por isso que as afirmações positivas no espelho "
            "parecem uma mentira.\n"
            "Sua boca diz 'eu sou próspero'.\n"
            "Mas o seu sistema nervoso central grita "
            "'como vou pagar o cartão amanhã?'\n"
            "O Universo só escuta o grito."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 6,
        estado = "ESPELHO",
        title  = "A LINHA DO TEMPO\nONDE VOCÊ É RICO\nJÁ ESTÁ PRONTA.",
        body   = (
            "A versão de você que não precisa olhar o preço "
            "no cardápio já existe no campo quântico agora.\n"
            "Ela não está no futuro. "
            "Ela está em outra frequência.\n"
            "Somos deuses esquecidos operando como mendigos."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 7,
        estado = "ASCENSÃO",
        title  = "COMO MUDAR\nO CANAL?",
        body   = (
            "Você não pode mentir para o seu cérebro.\n"
            "A única forma de mudar de canal é alterar a sua onda cerebral "
            "de Beta (estado de alerta e estresse) para Theta (estado de co-criação).\n"
            "Nesse estado, o colapso de onda obedece você."
        ),
        prompt = (
            "A close-up of a human face bathed in a serene, warm golden light breaking through the darkness. "
            "The expression is one of absolute peace and sudden clarity, as if a heavy burden has just lifted. "
            "Painterly, emotional, deeply resonant, rich lighting."
        ),
    ),
    SlideData(
        num    = 8,
        estado = "CRISTALIZAÇÃO",
        title  = "VOCÊ É O\nCOLAPSO.",
        body   = (
            "Pare de tentar atrair o que você não tem.\n"
            "Comece a ocupar a frequência de quem você já é.\n"
            "O Universo não te dá o que você quer.\n"
            "O Universo te dá QUEM você é."
        ),
        prompt = (
            "A lone person standing perfectly still in a vast, dark expanse, radiating a subtle but powerful, warm golden light that illuminates the ground around them. "
            "Quiet strength, mastery, beautiful composition, atmospheric."
        ),
    ),
    SlideData(
        num    = 9,
        estado = "SETUP CTA",
        title  = "COMO ACESSAR\nO ESTADO THETA?",
        body   = (
            "Você pode meditar por 20 anos em uma caverna.\n"
            "Ou você pode usar tecnologia sonora desenvolvida "
            "por neurocientistas para forçar as suas ondas cerebrais "
            "a entrarem em sincronia Theta em 15 minutos."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 10,
        estado = "CTA FIXO",
        title  = "COMENTE\nFONTE",
        body   = (
            "E eu te envio o protocolo do Desbloqueio Neural "
            "para você forçar o seu sistema nervoso a mudar "
            "a linha do tempo."
        ),
        prompt = (
            "A beautifully lit, ancient stone doorway opening into a world of vibrant, living light and lush nature. "
            "A person is walking steadily toward the threshold. "
            "Inviting, powerful, cinematic."
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
        notes         = "Demolição da Lei da Atração via Diretor Artístico. Prompts limpos.",
    )
