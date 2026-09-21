import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "Neuroplasticidade Obscura"
tema_slug = "neuroplasticidade-obscura"
preset_name = "A"

slides = [
    SlideData(1, "DISRUPÇÃO", "Eles não querem a sua atenção.", "Eles querem alterar a anatomia do seu cérebro.", mode="image", cover=True, prompt="Hyper-realistic digital art of a glowing human brain connected to fiber optic cables, emitting a hypnotic blue and purple light. Cinematic, dystopian matrix aesthetic."),
    SlideData(2, "DESCIDA", "O que você chama de 'rolar o feed', a neurociência chama de:", "Neuroplasticidade Obscura.", mode="text"),
    SlideData(3, "NOMEAÇÃO", "Cada vídeo de 15 segundos que você assiste...", "É um pulso elétrico redesenhando suas sinapses.", mode="text"),
    SlideData(4, "PROFUNDIDADE", "O alvo principal?", "O seu Córtex Pré-Frontal. A única região capaz de planejar o futuro e tomar decisões difíceis.", mode="image", cover=False, prompt="A close-up of a cybernetic eye staring at a glowing screen in a dark room. The screen reflects binary code and social media icons. Deep shadows, neon teal lighting."),
    SlideData(5, "QUEDA FUNDA", "Ao sobrecarregar seu sistema com picos falsos de dopamina...", "O algoritmo atrofia a sua capacidade de foco profundo.", mode="text"),
    SlideData(6, "ESPELHO", "Em contrapartida, as notícias ruins hipertrofiam a sua Amígdala.", "O centro primitivo do medo e da ansiedade.", mode="text"),
    SlideData(7, "ASCENSÃO", "O resultado físico?", "Você se torna ansioso, paralisado e biologicamente incapaz de executar seus próprios sonhos.", mode="image", cover=False, prompt="A beautiful golden neuron firing bright light in darkness, symbolizing the awakening and neuro-reprogramming. Ethereal, mystical, high contrast."),
    SlideData(8, "CRISTALIZAÇÃO", "Você se tornou um espectador de luxo da vida dos outros.", "Enquanto a sua apodrece em segundo plano.", mode="text"),
    SlideData(9, "SETUP CTA", "Isso não é vício.", "Isso é engenharia social aplicada diretamente no seu tecido neural.", mode="text"),
    SlideData(10, "CTA FIXO", "COMENTE\nFONTE", "E acesse a Tecnologia Sonora que reinicia as rotas neurais e te tira do transe hipnótico da tela.", mode="image", cover=False, prompt="A massive glowing golden portal in a dark room. Ancient symbols of neuro-hacking and hermeticism floating softly around it.")
]

caption = """Você não é "preguiçoso". Seu cérebro foi hackeado.

Toda vez que você passa horas rolando a tela, você está participando do maior experimento de neuroplasticidade em massa da história da humanidade. 

O design desses aplicativos não foca apenas em entretenimento; ele foi desenhado nos mesmos laboratórios de persuasão dos cassinos, para exaurir a sua dopamina e atrofiar a parte do seu cérebro que exige disciplina. 

Para retomar o controle da sua vida financeira e pessoal, você não precisa de mais motivação. Você precisa de um "hard reset" biológico.

Comente "FONTE" e eu vou te enviar no direct a ferramenta sonora desenvolvida para recalibrar as frequências cerebrais e devolver o seu foco profundo."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
