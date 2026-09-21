import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "Lançamento 02: O Mito do Merecimento"
tema_slug = "lancamento-02-merecimento"
preset_name = "A"

slides = [
    SlideData(
        1, "DISRUPÇÃO",
        "Pessoas ruins enriquecem o tempo todo.",
        "Enquanto pessoas puras continuam presas na miséria.",
        mode="image", cover=True,
        prompt="A pristine white dove trapped inside a dusty golden birdcage, while outside a dark raven sits on a pile of gold coins. Cinematic lighting, rich contrast."
    ),
    SlideData(
        2, "DESCIDA",
        "Isso te revolta? Faz você achar que o universo estragou?",
        "Você foi ensinado que o dinheiro é uma recompensa por bom comportamento.",
        mode="text"
    ),
    SlideData(
        3, "NOMEAÇÃO",
        "Mas a verdade mecânica é uma só:",
        "O universo não é moral. Ele é puramente matemático.",
        mode="text"
    ),
    SlideData(
        4, "PROFUNDIDADE",
        "A lei da gravidade derruba um criminoso e um monge da mesma forma.",
        "A frequência da abundância funciona exatamente igual.",
        mode="image", cover=False,
        prompt="A majestic ancient golden scale of justice in a dark void. On one side a glowing light, on the other a heavy iron weight. The scale is perfectly balanced. Mystical."
    ),
    SlideData(
        5, "QUEDA FUNDA",
        "Ele não recompensa o seu bom caráter.",
        "Ele recompensa a frequência que o seu corpo físico está emitindo agora.",
        mode="text"
    ),
    SlideData(
        6, "ESPELHO",
        "Enquanto você tentar ser 'bonzinho' para convencer o universo a te pagar...",
        "Estará jogando um jogo que não existe.",
        mode="text"
    ),
    SlideData(
        7, "ASCENSÃO",
        "A moralidade é uma criação humana para convívio social.",
        "A atração magnética é um código de Física Oculta.",
        mode="image", cover=False,
        prompt="A cosmic blueprint glowing in gold lines over a dark background, showing complex sacred geometry and mathematical equations of reality."
    ),
    SlideData(8, "CRISTALIZAÇÃO", "Você não precisa sofrer para ser digno.", "Você só precisa calibrar a máquina.", mode="text"),
    SlideData(9, "SETUP CTA", "Se o seu esforço não trouxe o prêmio, a sua vibração basal está desalinhada.", "E o alinhamento acontece no subconsciente.", mode="text"),
    SlideData(
        10, "CTA FIXO",
        "COMENTE\n75",
        "E receba o convite VIP para os Engenheiros da Realidade. O protocolo definitivo que destrava seu código financeiro, amoroso e físico.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """O Universo não é um juiz que te dá notas pelo seu comportamento. Ele é um espelho mecânico que reflete a sua vibração.

Fomos condicionados a acreditar que sofrer, nos sacrificar e sermos "boas pessoas" garantiria um lugar no céu e dinheiro na conta. Isso é controle social.

Pessoas de caráter questionável muitas vezes enriquecem não porque o universo as ama, mas porque, no nível subconsciente delas, o "código da abundância" não tem bloqueios de culpa ou escassez. A matemática delas bate.

Enquanto isso, pessoas incríveis passam fome porque o corpo delas foi programado na infância para emitir a frequência de que "dinheiro é sujo" ou "riqueza é pecado".

Para mudar o jogo, você precisa parar de apelar para a moralidade e começar a operar as regras da máquina.

Comente "75" abaixo e eu te enviarei o acesso à Tecnologia Sonora que faz o download da frequência correta direto no seu sistema nervoso, sem esforço consciente."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
