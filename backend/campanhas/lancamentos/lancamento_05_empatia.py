import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "O Sequestro da Empatia"
tema_slug = "lancamento-05-empatia"
preset_name = "A"

slides = [
    SlideData(
        1, "DISRUPÇÃO",
        "A empatia que a mídia te ensinou é uma armadilha financeira.",
        "Toda vez que você sente pena do mundo, o sistema lucra e você empobrece.",
        mode="image", cover=True,
        prompt="A person drowning in a sea of thick black liquid, surrounded by floating glowing TV screens showing chaos and wars. Dark, dystopian, hyper-realistic."
    ),
    SlideData(
        2, "DESCIDA",
        "Te ensinaram que sofrer com as tragédias do jornal é um sinal de que você é 'bom'.",
        "Mas o que a neurociência prova é brutal.",
        mode="text"
    ),
    SlideData(
        3, "NOMEAÇÃO",
        "A empatia sem blindagem é suicídio vibracional.",
        "Você não está ajudando ninguém, você só está afundando junto.",
        mode="text"
    ),
    SlideData(
        4, "PROFUNDIDADE",
        "Ao sentir a dor coletiva das guerras e crises, o seu cérebro entra no modo Luta ou Fuga.",
        "Você literalmente desliga a área responsável por criar soluções e dinheiro.",
        mode="image", cover=False,
        prompt="A glowing human heart being drained of its light by invisible dark leeches and shadowy wires connected to smartphones. Neon teal and amber lighting."
    ),
    SlideData(
        5, "QUEDA FUNDA",
        "Você não pode salvar alguém que está se afogando...",
        "Se você pular na água sem saber nadar.",
        mode="text"
    ),
    SlideData(
        6, "ESPELHO",
        "Enquanto você entra em ressonância com o medo do rebanho...",
        "Uma pequena minoria continua enriquecendo. Porque eles protegem a própria frequência.",
        mode="text"
    ),
    SlideData(
        7, "ASCENSÃO",
        "Ajudar o mundo não é sobre chorar com ele.",
        "É sobre ficar tão absurdamente forte, que a sua luz puxa os outros para cima.",
        mode="image", cover=False,
        prompt="A powerful figure standing on a glowing golden boat, pulling desperate hands out of the dark water. Radiant, heroic, epic lighting."
    ),
    SlideData(8, "CRISTALIZAÇÃO", "O caos não é seu. A crise não é sua.", "Desligue a televisão e ligue o Modo Desenvolvedor da sua mente.", mode="text"),
    SlideData(9, "SETUP CTA", "Se você não blindar o seu sistema nervoso agora...", "Vai continuar pagando a conta emocional do planeta.", mode="text"),
    SlideData(
        10, "CTA FIXO",
        "COMENTE\n75",
        "E receba o convite VIP para os Engenheiros da Realidade. O protocolo definitivo que destrava seu código financeiro, amoroso e físico.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """Você não é o salvador do mundo. Você é o alvo.

O sistema desenhou as redes sociais e os noticiários com um único objetivo: sequestrar a sua empatia. Quando você chora, se revolta ou entra em pânico com as tragédias globais, o seu sistema nervoso afunda na frequência da "sobrevivência".

Nesse estado, o fluxo de dinheiro, de ideias e de relacionamentos saudáveis é bloqueado no seu cérebro. O pânico coletivo é a moeda mais lucrativa do mundo moderno.

Eles te convenceram de que assistir às tragédias te faz um ser humano "empático". Mas a verdadeira empatia exige força. Você só consegue alimentar quem tem fome se você for dono da padaria. E você nunca será dono da padaria se continuar vibrando na escassez coletiva.

Desconectar do pânico não é egoísmo. É blindagem de frequência. É o primeiro passo para criar o "Campo Zero" ao seu redor.

Comente "75" abaixo. Vou te enviar o passaporte para reprogramar a sua resposta nervosa ao mundo externo e voltar a criar riqueza blindada."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
