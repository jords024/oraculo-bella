import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "O Falso Livre-Arbítrio"
tema_slug = "falso-livre-arbitrio"
preset_name = "A"

slides = [
    SlideData(1, "DISRUPÇÃO", "A pior ilusão que te venderam foi a de que você está no controle das suas escolhas.", ""),
    SlideData(2, "DESCIDA", "Pare e pense:", "Por que você reage exatamente como seus pais quando está sob pressão, mesmo jurando que seria diferente?"),
    SlideData(3, "NOMEAÇÃO", "Você não tem livre-arbítrio real.", "Até 95% das suas ações diárias são apenas programas automatizados em execução."),
    SlideData(4, "PROFUNDIDADE", "Quem instalou esses programas?", "O ambiente, os traumas infantis e a epigenética dos seus ancestrais."),
    SlideData(5, "QUEDA FUNDA", "Antes dos 7 anos, o seu cérebro estava em frequência Theta (hipnose).", "Você fez o download de medos e limitações antes de ter consciência para se defender."),
    SlideData(6, "ESPELHO", "Hoje, você acha que escolhe a escassez.", "Mas é o trauma do seu avô bloqueando a sua mão invisivelmente."),
    SlideData(7, "ASCENSÃO", "Você se dissociou de quem realmente é.", "O 'Eu' atual é apenas um amálgama de reações primitivas de sobrevivência."),
    SlideData(8, "CRISTALIZAÇÃO", "A vida de dificuldades que você vive hoje...", "Foi escolhida por uma criança assustada há 20 anos atrás."),
    SlideData(9, "SETUP CTA", "Para acessar a verdadeira 'Fonte', você precisa deletar o script na raiz.", "Não com palavras, mas com frequência."),
    SlideData(10, "CTA FIXO", "COMENTE\nFONTE", "E eu te envio o protocolo que interrompe a repetição do passado no seu sistema nervoso central.")
]

caption = """Você é um fantasma assombrando o seu próprio presente.

Muitas pessoas chegam até mim dizendo: "Eu quero enriquecer, eu faço tudo certo, mas na hora H eu me saboto". 

Isso não é falta de vontade. Isso é o Subconsciente, governando a sua vida nas sombras. O cérebro poupa energia automatizando 95% das suas decisões baseadas em arquivos salvos antes de você fazer 7 anos de idade.

Se você viu seus pais brigando por dinheiro, o seu arquivo interno entende "Dinheiro = Perigo". E toda vez que você estiver prestes a prosperar, seu próprio corpo dará um jeito de falhar, para te manter "seguro".

A única saída é desprogramar a memória somática no corpo. 

Comente "FONTE" e acesse o protocolo de Tecnologia Sonora focado na reconstrução subconsciente."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
