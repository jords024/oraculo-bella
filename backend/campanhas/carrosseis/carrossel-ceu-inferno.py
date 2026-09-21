#!/usr/bin/env python3
"""
carrossel-ceu-inferno.py — O Céu e o Inferno Nunca Foram Lugares Físicos
Método Jordânico | Praça: ESPÍRITO | Formato B
Tema: Céu e inferno como frequências cerebrais e não destinos geográficos.
Preset: revelacao | 10 slides
"""

import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from diretor_artistico import SlideData, gerar_carrossel

TEMA      = "O Céu e o Inferno Nunca Foram Lugares Físicos"
TEMA_SLUG = "ceu-inferno-frequencias"
PRESET    = "revelacao"
FORMATO   = "B"

CAPTION = """\
Eles te desenharam um paraíso nas nuvens e um tormento sob a terra.

Não foi erro de tradução. Foi método de controle.

Lucas 17:21 diz: 'O Reino não vem com aparência exterior... o Reino está dentro de vós'.

Quando você vive no cortisol, na ansiedade, na escassez, seu sistema nervoso está literalmente no inferno eletromagnético (Ondas Beta Altas).

Quando você entra em coerência cardíaca, o paraíso acontece no seu sangue e no seu campo.

Não espere morrer para saber para onde você vai. Você já está lá.

Comente FONTE e eu te envio o protocolo que tira seu cérebro do estado de sobrevivência.

#fonteoculta #despertar #neurociencia #espiritualidade #frequencia #fisicaquantica #desbloqueiomental #coerenciacardiaca\
"""

SLIDES = [
    SlideData(
        num    = 1,
        estado = "DISRUPÇÃO",
        title  = "O CÉU NÃO É\nNAS NUVENS.\nO INFERNO NÃO\nÉ LÁ EMBAIXO.",
        body   = (
            "Te venderam a maior mentira geográfica da história.\n"
            "E o preço dessa mentira é você aceitar "
            "uma vida medíocre hoje, esperando um paraíso amanhã."
        ),
        prompt = (
            "A solitary human figure standing at a threshold looking forward. "
            "Above them, a beautifully intricate classical painting of the sky dissolving into geometric light. "
            "Below them, a dark cavern floor dissolving into faint red atmospheric energy. "
            "Cinematic, mysterious, highly detailed, deep shadows with rich color accents."
        ),
        cover  = True,
    ),
    SlideData(
        num    = 2,
        estado = "DESCIDA",
        title  = "JESUS JÁ TINHA\nAVISADO EM\nLUCAS 17:21.",
        body   = (
            "\"O Reino de Deus não vem com aparência visível... "
            "porque o Reino está dentro de vós.\"\n"
            "A Igreja escondeu isso para poder ser a única porta de entrada.\n"
            "E cobrar ingresso por ela."
        ),
        prompt = (
            "An ancient heavy wooden church door, slightly ajar, revealing pure golden light from within. "
            "A person standing outside in the dark, hesitant. "
            "Moody, dramatic lighting, painterly texture, highly atmospheric."
        ),
    ),
    SlideData(
        num    = 3,
        estado = "NOMEAÇÃO",
        title  = "INFERNO É UM\nESTADO\nNEUROLÓGICO.",
        body   = (
            "Quando você vive estressado por dinheiro, "
            "seu cérebro opera em Ondas Beta Altas.\n"
            "O cortisol inunda seu sangue. Sua visão afunila. "
            "O coração perde a coerência.\n"
            "Você já está queimando no inferno. E ele é químico."
        ),
        prompt = (
            "A close-up of a human face partially obscured by shadow. "
            "Visible tension in the expression, surrounded by subtle, chaotic red and purple energy lines resembling frayed wires or nerves. "
            "Deep cinematic darkness, powerful emotional weight."
        ),
    ),
    SlideData(
        num    = 4,
        estado = "PROFUNDIDADE",
        title  = "A BÍBLIA É\nUM MANUAL DE\nNEUROBIOLOGIA.",
        body   = (
            "O 'demônio' que te persegue não é um bicho com chifres.\n"
            "É a rede neural do trauma (Default Mode Network) "
            "que te faz repetir os mesmos ciclos de pobreza "
            "e relacionamentos tóxicos no piloto automático."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 5,
        estado = "QUEDA FUNDA",
        title  = "A PIOR PARTE\nÉ QUE VOCÊ\nACEITOU ISSO.",
        body   = (
            "Você normalizou a ansiedade.\n"
            "Normalizou tomar remédio pra dormir "
            "e café pra acordar.\n"
            "Você aceitou viver no inferno acreditando "
            "que é apenas 'a vida adulta'."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 6,
        estado = "ESPELHO",
        title  = "E O CÉU?\nO QUE ELE\nREALMENTE É?",
        body   = (
            "O paraíso é o Estado Theta e Delta.\n"
            "É quando seu coração bate em perfeita coerência com "
            "o campo magnético da Terra (Ressonância de Schumann).\n"
            "Nesse estado, seu corpo se cura sozinho e "
            "oportunidades 'caem do céu'."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 7,
        estado = "ASCENSÃO",
        title  = "A SALVAÇÃO NÃO\nÉ UM PERDÃO.\nÉ UMA CALIBRAÇÃO.",
        body   = (
            "Deus não está sentado num trono te julgando.\n"
            "A Fonte é o campo quântico. Ela apenas colapsa "
            "a frequência que você está emitindo.\n"
            "Se você emite a frequência de inferno (medo), "
            "você atrai inferno (dívida, doença)."
        ),
        prompt = (
            "A lone person standing in a vast, dark, majestic landscape looking at an immense, serene celestial sphere glowing with gentle amber and teal light. "
            "The person is calm, aligned. "
            "Awe-inspiring, profound, cinematic wide shot, rich deep colors."
        ),
    ),
    SlideData(
        num    = 8,
        estado = "CRISTALIZAÇÃO",
        title  = "O REINO ESTÁ\nNAS SUAS MÃOS.",
        body   = (
            "Enquanto você esperar morrer para ver Deus, "
            "o sistema vai continuar sugando sua energia vital "
            "e o seu dinheiro.\n"
            "O portal de acesso ao paraíso nunca esteve "
            "no altar. Sempre esteve no seu sistema nervoso."
        ),
        prompt = (
            "A pair of open hands holding a glowing, perfectly geometric source of warm light that gently illuminates the surrounding dark space. "
            "Intimate, powerful, deeply spiritual but grounded. "
            "Painterly texture, cinematic lighting."
        ),
    ),
    SlideData(
        num    = 9,
        estado = "SETUP CTA",
        title  = "COMO SAIR DO\nINFERNO HOJE?",
        body   = (
            "Você não pode conversar com seu sistema nervoso. "
            "A palavra falada (afirmação positiva) não muda a frequência profunda.\n"
            "O único atalho conhecido pela neurociência "
            "é o estímulo sonoro binaurial que força o cérebro "
            "a entrar em coerência (Estado do Reino)."
        ),
        prompt = "", # text slide
    ),
    SlideData(
        num    = 10,
        estado = "CTA FIXO",
        title  = "COMENTE\nFONTE",
        body   = (
            "E eu te envio o protocolo da Tecnologia Sonora que "
            "tira o seu cérebro do modo sobrevivência e acessa a coerência."
        ),
        prompt = (
            "A human figure stepping confidently through a magnificent, warm golden archway made of light, leaving behind a shadowy, chaotic background. "
            "Deep cosmic violet and amber tones, divine lighting, cinematic and resolving."
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
        notes         = "Desconstrução céu/inferno como espaço físico -> Frequência neurológica. Usando Diretor Artístico.",
    )
