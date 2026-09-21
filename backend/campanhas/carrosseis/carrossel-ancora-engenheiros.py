import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "Abertura Turma Fundadora"
tema_slug = "ancora-engenheiros-matrix"
preset_name = "revelacao"

slides = [
    SlideData(1, "DISRUPÇÃO", "Abertura da Primeira Turma Fundadora.", "No dia 07, o acesso ao Campo Zero será liberado.", mode="image", cover=True, prompt="A cinematic wide shot of a dark cyberpunk city where a massive golden portal of sacred geometry is opening in the sky. Green matrix-like code rain is falling, but it turns into golden light as it touches the ground."),
    SlideData(2, "DESCIDA", "O que é o Engenheiros da Realidade?", "Não é um curso. É o protocolo definitivo para destravar as 3 áreas que estão travando a sua vida.", mode="text"),
    SlideData(3, "PROFUNDIDADE", "Corpo", "Você acorda cansado. Sente um peso no peito sem motivo. Começa a dieta na segunda e na quarta já desistiu. Não é preguiça - é o corpo travado.", mode="text"),
    SlideData(4, "PROFUNDIDADE", "Relacionamentos", "Sempre o mesmo tipo de pessoa errada. Sempre a mesma briga. Sempre se sentindo sozinho mesmo acompanhado. Parece azar, mas é padrão.", mode="image", cover=False, prompt="A human figure looking into a glowing fractured mirror. In the reflection, multiple shadowy figures stand behind them. Dark, moody, cinematic lighting."),
    SlideData(5, "QUEDA FUNDA", "Dinheiro", "Você ganha mais e some. Aparece uma conta, um problema no carro, alguém pedindo emprestado. É como se existisse um limite invisível - e existe.", mode="text"),
    SlideData(6, "NOMEAÇÃO", "A Raiz do Problema", "Essas 3 áreas não estão travadas por 'falta de esforço'. Elas estão travadas na sua frequência basal.", mode="text"),
    SlideData(7, "ASCENSÃO", "O Campo Zero", "Ao acessar essa tecnologia, nós reprogramamos a forma como o seu sistema nervoso reage à vida. O destrave é mecânico.", mode="image", cover=False, prompt="A silhouetted figure standing in a void, surrounded by floating holograms of sacred geometry and ancient symbols. Cinematic lighting, deep contrast."),
    SlideData(8, "CRISTALIZAÇÃO", "O Dia 07.", "Esta é a primeira vez que abrimos essa tecnologia. Guarde essa data.", mode="text"),
    SlideData(9, "CTA FIXO", "COMENTE 75", "Entre no grupo VIP e garanta seu lugar na Turma Fundadora. O Campo Zero te espera.", mode="image", cover=False, prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it.")
]

caption = """O Campo Zero será aberto.

O "Engenheiros da Realidade" não é um curso sobre tentar se esforçar mais. É um protocolo de intervenção direta na sua frequência basal. É a tecnologia para reprogramar a forma como o seu corpo reage ao dinheiro, aos seus relacionamentos e ao cansaço diário.

Chega de lutar contra a corrente. No dia 07, liberaremos as vagas para a nossa primeira Turma Fundadora. 

Se você está lendo isso, o chamado já foi feito.
Comente "75" para receber o acesso antecipado e entrar para o grupo VIP."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
