import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "Lançamento 01: O Pensamento Positivo"
tema_slug = "lancamento-01-pensamento"
preset_name = "A"

slides = [
    SlideData(
        1, "DISRUPÇÃO",
        "A Bíblia nunca mandou você apenas 'pensar positivo'.",
        "Pensar positivo enquanto seu corpo está em pânico é tentar mentir para Deus.",
        mode="image", cover=True,
        prompt="A pristine white marble statue wearing a golden mask, but the marble is cracking and revealing dark, chaotic machinery underneath. Deep contrast, dark aesthetic."
    ),
    SlideData(
        2, "DESCIDA",
        "Você tenta forçar o otimismo.",
        "Mas o seu coração continua acelerado e o peito apertado.",
        mode="text"
    ),
    SlideData(
        3, "NOMEAÇÃO",
        "Isso acontece porque o universo não ouve as suas palavras.",
        "Ele lê a sua vibração biológica.",
        mode="text"
    ),
    SlideData(
        4, "PROFUNDIDADE",
        "Repetir 'eu sou rico' 100 vezes de frente para o espelho...",
        "Só ensina o seu cérebro a mentir melhor.",
        mode="image", cover=False,
        prompt="A shattered mirror reflecting a person reciting words, but the reflection shows a hollow, empty shell made of static noise. Mysterious, esoteric."
    ),
    SlideData(
        5, "QUEDA FUNDA",
        "Se o seu corpo foi programado na infância para sentir medo da falta...",
        "Afirmar riqueza consciente gera um curto-circuito de ansiedade.",
        mode="text"
    ),
    SlideData(
        6, "ESPELHO",
        "É por isso que O Segredo e a Lei da Atração clássica falharam com você.",
        "Eles ensinaram a visualizar, mas não a desinstalar o vírus corporal.",
        mode="text"
    ),
    SlideData(
        7, "ASCENSÃO",
        "Para mudar o reflexo lá fora, você não força a mente.",
        "Você altera o estado do sistema nervoso. Direto na raiz.",
        mode="image", cover=False,
        prompt="A glowing golden tuning fork struck in the dark, sending perfect golden soundwaves that reorganize chaotic matter into perfect geometry."
    ),
    SlideData(8, "CRISTALIZAÇÃO", "O trauma está na frequência Theta.", "Falar sobre ele em estado Beta não muda nada. Frequências sonoras sim.", mode="text"),
    SlideData(9, "SETUP CTA", "Se você tentou de tudo e continua travado...", "O problema não é sua falta de esforço. É que você está no nível errado.", mode="text"),
    SlideData(
        10, "CTA FIXO",
        "COMENTE\n75",
        "E receba o convite VIP para os Engenheiros da Realidade. O protocolo definitivo que destrava seu código financeiro, amoroso e físico.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """Você já notou que quanto mais você força o "pensamento positivo", mais exausto você fica?

Isso tem uma explicação neurobiológica. O seu sistema nervoso foi programado (na sua infância) para associar certas situações ao perigo. Se o seu corpo associou "ter dinheiro" a "conflito" ou "insegurança", ele gravou isso na sua frequência basal.

A Lei da Atração clássica ensina você a usar a mente consciente (que representa 5% de você) para repetir frases bonitas. Mas o seu corpo (os outros 95%) continua gritando em desespero e medo.

O resultado? Curto-circuito. Ansiedade silenciosa. Você não manifesta abundância, você manifesta o seu estado de sobrevivência.

A única saída não é pensar mais forte. É acessar o Sistema Operacional Subconsciente através de Frequências Sonoras e alterar a programação de fábrica.

Comente "75" abaixo e eu te envio a tecnologia sonora exata para parar de lutar contra si mesmo e ativar o modo desenvolvedor do seu corpo."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
