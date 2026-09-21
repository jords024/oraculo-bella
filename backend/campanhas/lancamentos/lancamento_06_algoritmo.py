import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "O Algoritmo do Apocalipse"
tema_slug = "lancamento-06-algoritmo"
preset_name = "A"

slides = [
    SlideData(
        1, "DISRUPÇÃO",
        "O fim do mundo que aparece no seu celular é uma ilusão bilionária.",
        "Ele foi criado sob medida para hipertrofiar a sua Amígdala e travar o seu dinheiro.",
        mode="image", cover=True,
        prompt="A glowing red human brain trapped inside a transparent smartphone screen, surrounded by chaos and fire, but outside the screen everything is peaceful. Cyberpunk aesthetic."
    ),
    SlideData(
        2, "DESCIDA",
        "Você acha que está apenas lendo as notícias e se mantendo 'informado'.",
        "Mas há um ataque direto sendo feito contra a sua anatomia.",
        mode="text"
    ),
    SlideData(
        3, "NOMEAÇÃO",
        "A guerra não é pela sua atenção. É pela sua biologia.",
        "Eles estão bombardeando a sua Amígdala Cerebral.",
        mode="text"
    ),
    SlideData(
        4, "PROFUNDIDADE",
        "A Amígdala é o centro primitivo do pânico. Quando ativada, ela sequestra o seu cérebro.",
        "Você fica viciado em prever o pior cenário possível em tudo.",
        mode="image", cover=False,
        prompt="A dark room filled with giant, imposing digital screens showing static noise and red warning signs. A human figure is connected to the screens by glowing neural wires. Matrix vibe."
    ),
    SlideData(
        5, "QUEDA FUNDA",
        "Um cérebro em pânico constante não consegue arquitetar negócios.",
        "Não consegue amar com paz. Não consegue atrair abundância.",
        mode="text"
    ),
    SlideData(
        6, "ESPELHO",
        "É por isso que a massa continua ansiosa, paralisada e pobre.",
        "O medo coletivo é o combustível perfeito para manter as engrenagens rodando.",
        mode="text"
    ),
    SlideData(
        7, "ASCENSÃO",
        "Os donos do jogo não consomem esse lixo digital.",
        "Eles blindam a própria frequência porque sabem que o foco é a única moeda real.",
        mode="image", cover=False,
        prompt="A serene, glowing golden mind field emitting powerful shockwaves that instantly shatter the dark digital screens around it. Triumphant, epic lighting."
    ),
    SlideData(8, "CRISTALIZAÇÃO", "A sua ansiedade crônica não é um defeito seu.", "É um hackeamento bem-sucedido feito por quem controla o algoritmo.", mode="text"),
    SlideData(9, "SETUP CTA", "Se o seu cérebro está travado na frequência do terror...", "O dinheiro e as relações saudáveis não encontram porta de entrada.", mode="text"),
    SlideData(
        10, "CTA FIXO",
        "COMENTE\n75",
        "E receba o convite VIP para os Engenheiros da Realidade. O protocolo definitivo que destrava seu código financeiro, amoroso e físico.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """Você está sob ataque e nem percebeu.

As redes sociais e os portais de notícia não vendem informação. Eles vendem o seu pânico. O cérebro humano foi programado pela evolução para dar 10x mais atenção ao perigo do que às coisas boas (isso evitava que fôssemos devorados na selva).

O sistema sabe disso e criou o "Algoritmo do Apocalipse". Ele joga crises, guerras e medos irreais na sua cara o dia inteiro.

O resultado biológico? Sua glândula suprarrenal dispara cortisol e sua Amígdala hipertrofia. Você entra em estado de alerta permanente. E adivinha? Um corpo em "modo de sobrevivência" desliga o Córtex Pré-Frontal — a parte do cérebro responsável pelo planejamento, criatividade e execução de metas.

A guerra digital não quer apenas os seus cliques. Ela quer paralisar a sua capacidade de criar riqueza e de se libertar.

Retome o controle da sua sala de máquinas.

Comente "75" abaixo. Você vai receber o acesso à tecnologia capaz de hackear a amígdala e trazer o seu corpo de volta à frequência da criação e do poder."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
