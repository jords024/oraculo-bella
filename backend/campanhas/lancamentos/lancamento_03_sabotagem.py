import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "Lançamento 03: O Paradoxo da Sabotagem"
tema_slug = "lancamento-03-sabotagem"
preset_name = "A"

slides = [
    SlideData(
        1, "DISRUPÇÃO",
        "Você não se autossabota porque é fraco.",
        "Você se sabota porque o seu subconsciente é brilhante.",
        mode="image", cover=True,
        prompt="A glowing brain trapped inside a beautiful golden puzzle box, showing that sabotage is just a complex defense mechanism. Moody, hyper-realistic."
    ),
    SlideData(
        2, "DESCIDA",
        "Toda vez que você ganha dinheiro, acontece uma emergência.",
        "Toda vez que uma relação fica em paz, você cria uma briga.",
        mode="text"
    ),
    SlideData(
        3, "NOMEAÇÃO",
        "Você chama isso de azar ou falta de disciplina.",
        "A neurociência chama isso de Mecanismo de Proteção.",
        mode="text"
    ),
    SlideData(
        4, "PROFUNDIDADE",
        "Se o seu cérebro, lá na infância, gravou que 'ter dinheiro gera brigas na família'...",
        "Fazer você falir é a forma de te manter em segurança.",
        mode="image", cover=False,
        prompt="A small child's silhouette standing in front of a massive, ancient supercomputer emitting red warning lights. Symbolic representation of childhood programming."
    ),
    SlideData(
        5, "QUEDA FUNDA",
        "O seu corpo prefere a miséria conhecida...",
        "Do que a abundância desconhecida.",
        mode="text"
    ),
    SlideData(
        6, "ESPELHO",
        "É por isso que você tem picos de melhora e logo recai.",
        "A sua força de vontade (5%) não consegue vencer o seu instinto de sobrevivência (95%).",
        mode="text"
    ),
    SlideData(
        7, "ASCENSÃO",
        "Para quebrar o ciclo, você não precisa de mais disciplina.",
        "Você precisa de uma atualização de sistema. Desativar o vírus antigo.",
        mode="image", cover=False,
        prompt="A luminous golden key unlocking a heavy, rusted iron vault inside a dark, ancient library. Beams of pure light escaping."
    ),
    SlideData(8, "CRISTALIZAÇÃO", "Enquanto você lutar contra a sua própria mente, você sempre vai perder.", "A chave é alterar o código-fonte através do corpo.", mode="text"),
    SlideData(9, "SETUP CTA", "Seus resultados atuais são o teto de segurança da sua programação de infância.", "Chegou a hora de hackear esse teto.", mode="text"),
    SlideData(
        10, "CTA FIXO",
        "COMENTE\n75",
        "E receba o convite VIP para os Engenheiros da Realidade. O protocolo definitivo que destrava seu código financeiro, amoroso e físico.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """Você não tem "falta de vergonha na cara". Você tem um sistema operacional desatualizado.

O nosso cérebro basal foi desenhado para uma única coisa: nos manter vivos. E para ele, "estar vivo" significa "ficar na zona do que é familiar".

Se na sua infância (antes dos 7 anos) o seu ambiente associou relacionamentos pacíficos com perigo, ou dinheiro com conflito familiar, o seu subconsciente gravou uma regra de ferro: "Para essa pessoa sobreviver e ser amada, ela não pode ter paz nem dinheiro".

Então, quando você, adulto, começa a prosperar, o seu cérebro acende um alerta vermelho de risco de vida. E o que ele faz? Cria autossabotagem. 

Você gasta tudo, perde o foco, cria brigas do nada. Tudo para voltar ao nível de miséria que o seu corpo acha que é "seguro".

Não adianta usar força de vontade contra instinto de sobrevivência. Você precisa acessar o seu subconsciente em frequência Theta e alterar o código.

Comente "75" abaixo e descubra a Tecnologia Sonora projetada para desativar os gatilhos de autossabotagem direto na raiz neural."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
