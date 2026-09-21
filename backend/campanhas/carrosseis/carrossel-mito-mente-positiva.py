import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "O Mito da Mente Positiva"
tema_slug = "mito-mente-positiva"
preset_name = "A"

slides = [
    SlideData(1, "DISRUPÇÃO", "A 'positividade tóxica' é a nova Matrix.", "E você acabou de entrar nela."),
    SlideData(2, "DESCIDA", "O sistema percebeu que você estava acordando.", "Então, ele criou uma 'sala de espera' confortável chamada Espiritualidade New Age."),
    SlideData(3, "NOMEAÇÃO", "Mandaram você 'pensar positivo'.", "Mandaram você ignorar a sua raiva, sua dor e seu instinto."),
    SlideData(4, "PROFUNDIDADE", "O resultado?", "Você se tornou um prisioneiro sorridente. Uma bateria que não morde."),
    SlideData(5, "QUEDA FUNDA", "O verdadeiro Despertar não é pacífico.", "Ele não tem cheiro de incenso."),
    SlideData(6, "ESPELHO", "Ele cheira a demolição.", "É o colapso doloroso de todas as mentiras que você contou para si mesmo para ser aceito."),
    SlideData(7, "ASCENSÃO", "Integrar a sua 'Sombra' (suas falhas, sua fúria) é o que gera energia real.", "A luz só existe porque a escuridão lhe dá contorno."),
    SlideData(8, "CRISTALIZAÇÃO", "Se você foge do desconforto fingindo que 'está tudo bem'...", "Você não transcendeu. Você se anestesiou."),
    SlideData(9, "SETUP CTA", "O despertar nunca termina.", "A cada nível, um novo demônio. A cada demônio, um novo poder."),
    SlideData(10, "CTA FIXO", "COMENTE\nFONTE", "E eu te envio o protocolo sonoro que quebra as amarras da Matrix Espiritual e reconecta você à Fonte real.")
]

caption = """O "pensamento positivo" é a forma mais perversa de controle mental moderno. 

Enquanto você tenta sufocar a sua raiva, sua frustração e o seu instinto primal para "vibrar alto", você corta a própria fonte da sua força motriz. A Sombra não é seu inimigo. Ela é o motor que a luz usa para construir impérios.

Se você só aceita a sua metade "iluminada", você viverá uma vida pela metade.

O verdadeiro despertar queima. Demole a identidade falsa que você construiu. E só do outro lado desse fogo existe a verdadeira liberdade.

Comente "FONTE" que eu te envio no direct o acesso à Tecnologia Sonora que faz a integração dessas duas forças no seu cérebro, ativando a frequência do Ponto Zero."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
