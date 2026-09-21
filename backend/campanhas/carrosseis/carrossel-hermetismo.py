import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "Hermetismo: A Máquina do Universo"
tema_slug = "hermetismo-mecanico"
preset_name = "A"

# APLICANDO A ESTRATÉGIA DE CORTE DE GASTOS (3 Imagens + 7 Textos)
slides = [
    # SLIDE 1: Capa Épica (Imagem)
    SlideData(
        1, "DISRUPÇÃO",
        "O Universo não tem sentimentos por você.", "",
        mode="image", cover=True,
        prompt="A colossal clockwork mechanism floating in space, gears made of golden light and dark matter. Visually striking, cosmic indifference, ancient technology."
    ),

    # SLIDE 2: Aprofundamento (Texto)
    SlideData(
        2, "DESCIDA",
        "Ele não liga se você é uma 'boa pessoa'.",
        "Ele não sente pena quando você sofre, nem te recompensa por ter trabalhado duro.",
        mode="text"
    ),

    # SLIDE 3: Nomeação (Texto)
    SlideData(
        3, "NOMEAÇÃO",
        "O Universo não é poético. Ele é matemático.",
        "Ele opera sob 7 Leis Imutáveis. Quem ignora essas regras passa a vida inteira sendo esmagado pelas engrenagens.",
        mode="text"
    ),

    # SLIDE 4: O Problema/Profundidade (Imagem Épica)
    SlideData(
        4, "PROFUNDIDADE",
        "A Primeira Lei do Hermetismo é clara: 'O Todo é Mente'.",
        "Você não está vivendo na matéria. Você está operando dentro de uma simulação mental gigantesca.",
        mode="image", cover=False,
        prompt="A human silhouette composed entirely of glowing neural pathways, standing inside a massive, dark geometric labyrinth. Cyber-mysticism, esoteric."
    ),

    # SLIDE 5: Queda Funda (Texto)
    SlideData(
        5, "QUEDA FUNDA",
        "A elite não reza pedindo por milagres. Eles usam a Lei da Correspondência.",
        "'O que está em cima é como o que está embaixo; o que está dentro é como o que está fora.'",
        mode="text"
    ),

    # SLIDE 6: Espelho (Texto)
    SlideData(
        6, "ESPELHO",
        "A sua conta bancária vazia não é uma injustiça divina.",
        "Ela é apenas o eco físico e mecânico de uma mente que está programada para vibrar em escassez.",
        mode="text"
    ),

    # SLIDE 7: Ascensão / A Cura (Imagem Épica)
    SlideData(
        7, "ASCENSÃO",
        "Você nunca vai mudar o reflexo se continuar quebrando o espelho.",
        "Para alterar a matéria física, você precisa hackear o código-fonte: a sua própria frequência.",
        mode="image", cover=False,
        prompt="A glowing golden tuning fork struck in the darkness, emitting visible ripples of golden soundwaves altering the fabric of reality. Cinematic lighting."
    ),

    # SLIDE 8: Cristalização (Texto)
    SlideData(
        8, "CRISTALIZAÇÃO",
        "Parar de sofrer não é uma questão de merecimento religioso.",
        "É uma pura questão de Física Oculta. Você recebe a exata frequência que você emite. Nem mais, nem menos.",
        mode="text"
    ),

    # SLIDE 9: Setup CTA (Texto)
    SlideData(
        9, "SETUP CTA",
        "A ignorância das leis do universo é a verdadeira Matrix.",
        "Enquanto você jogar as regras da humanidade, vai colher o sofrimento da massa.",
        mode="text"
    ),

    # SLIDE 10: Chamado / CTA (Imagem Asset Fixo - reaproveitável)
    SlideData(
        10, "CTA FIXO",
        "COMENTE\nFONTE",
        "E acesse o Protocolo de Desbloqueio Neural. Uma tecnologia sonora para reprogramar sua frequência basal.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """O Universo é um cofre, não uma instituição de caridade.

Muitas pessoas passam a vida inteira esperando que algo externo (o governo, a família, ou até "Deus") reconheça o seu sofrimento e decida recompensá-las. 

Essa é a mentira que o sistema quer que você acredite.

A verdade oculta, conhecida desde o Egito Antigo (O Caibalion), é que o universo é uma máquina perfeita e fria. Ele opera sob Leis Herméticas inflexíveis — como a Lei da Vibração e a Lei da Causa e Efeito. 

Se a sua frequência base é de medo e falta, a Máquina vai calcular matematicamente a sua vibração e entregar de volta situações que confirmam o medo e a falta. É física pura.

Para prosperar na "Matrix", você precisa parar de apelar para os sentimentos do Universo e começar a operar a máquina como um programador. Você não conserta o espelho sujo lavando o reflexo; você limpa o próprio rosto. 

Comente "FONTE" e eu te enviarei o acesso à Tecnologia Sonora projetada para alinhar automaticamente a sua vibração com as Leis Herméticas da Abundância."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
