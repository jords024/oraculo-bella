import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "O Arquétipo do Sacrifício"
tema_slug = "arquetipo-sacrificio"
preset_name = "A"

slides = [
    SlideData(1, "DISRUPÇÃO", "Quem te ensinou que sofrer te faz uma pessoa melhor?", ""),
    SlideData(2, "DESCIDA", "Existe um código malicioso instalado no seu DNA cultural:", "O Arquétipo do Mártir."),
    SlideData(3, "NOMEAÇÃO", "A ideia de que 'dinheiro suado' é mais honrado do que dinheiro fácil.", "A crença de que você precisa 'pagar um preço' de dor para ser feliz."),
    SlideData(4, "PROFUNDIDADE", "Isso não é lei divina.", "Isso é controle de massa."),
    SlideData(5, "QUEDA FUNDA", "Se o sofrimento gerasse riqueza e elevação...", "Os escravos e os doentes seriam os donos do mundo."),
    SlideData(6, "ESPELHO", "A elite não sofre para acumular poder.", "Eles operam na frequência da facilidade e da alavancagem."),
    SlideData(7, "ASCENSÃO", "O Campo Quântico (A Fonte) não entende o 'esforço'.", "Ele só entende a Ressonância."),
    SlideData(8, "CRISTALIZAÇÃO", "Você pode lutar 14 horas por dia vibrando em escassez.", "O resultado será mais escassez."),
    SlideData(9, "SETUP CTA", "A nobreza não está na dor.", "Está na clareza. Está em soltar a culpa de querer uma vida leve."),
    SlideData(10, "CTA FIXO", "COMENTE\nFONTE", "E eu te envio o protocolo que desinstala o código do sacrifício e ativa a frequência da facilidade.")
]

caption = """Você foi programado para se culpar pela facilidade.

A sociedade inteira foi construída em cima do Arquétipo do Sacrifício: para merecer o céu, tem que sofrer na terra. Para ser rico de forma honesta, tem que perder a saúde trabalhando.

Mentira. Isso foi desenhado para manter você na roda do hamster. O Universo, a Fonte Oculta, opera pelo caminho de menor resistência. A água não se esforça para contornar a pedra. Ela apenas flui.

Quando você entender que o seu esforço brutal é a prova de que você está nadando contra a correnteza do seu próprio destino, o jogo vira.

Comente "FONTE" abaixo e eu te envio a frequência sonora exata para desativar a culpa pelo sucesso e colocar seu cérebro no fluxo da prosperidade com facilidade."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
