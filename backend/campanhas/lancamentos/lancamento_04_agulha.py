import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")
from diretor_artistico import SlideData, gerar_carrossel

tema = "A Mentira da Agulha"
tema_slug = "lancamento-04-agulha"
preset_name = "A"

slides = [
    SlideData(
        1, "DISRUPÇÃO",
        "A frase mais famosa da Bíblia sobre o dinheiro...",
        "É uma das maiores falsificações históricas para te manter pobre.",
        mode="image", cover=True,
        prompt="A colossal ancient stone gate in Jerusalem shaped like the eye of a needle. A camel loaded with golden treasures stands before it. Cinematic lighting, mysterious and historical."
    ),
    SlideData(
        2, "DESCIDA",
        "'É mais fácil um camelo passar no buraco da agulha do que um rico entrar no reino do céu'.",
        "Essa frase instalou um vírus no DNA da sua família.",
        mode="text"
    ),
    SlideData(
        3, "NOMEAÇÃO",
        "O sistema usou o medo divino para te convencer de que o dinheiro era sujo.",
        "Mas a verdade histórica é chocante.",
        mode="text"
    ),
    SlideData(
        4, "PROFUNDIDADE",
        "O 'Buraco da Agulha' não era um objeto de costura.",
        "Era o nome de uma porta muito estreita na muralha de Jerusalém.",
        mode="image", cover=False,
        prompt="A close up of medieval kings and dark figures whispering in shadows, hoarding gold coins while giving crumbs to starving peasants. High contrast, dark renaissance style."
    ),
    SlideData(
        5, "QUEDA FUNDA",
        "Para o camelo passar, o mercador precisava tirar toda a carga das costas do animal.",
        "A lição nunca foi sobre ser pobre.",
        mode="text"
    ),
    SlideData(
        6, "ESPELHO",
        "A lição era sobre desapego. Sobre não ser escravo do medo de perder o que tem.",
        "Mas o sistema distorceu isso para garantir que você não tentasse enriquecer.",
        mode="text"
    ),
    SlideData(
        7, "ASCENSÃO",
        "Até hoje, o seu sistema nervoso bloqueia o dinheiro para não irritar a 'Deus'.",
        "Você precisa desinstalar essa mentira do seu corpo físico.",
        mode="image", cover=False,
        prompt="A glowing golden DNA strand breaking free from heavy, rusted iron chains in the dark void. Beams of pure light escaping."
    ),
    SlideData(8, "CRISTALIZAÇÃO", "A riqueza é o seu estado natural. A culpa é a verdadeira prisão.", "Se o seu corpo sente medo de cobrar, a mentira ainda vive em você.", mode="text"),
    SlideData(9, "SETUP CTA", "A sua escassez atual é apenas um trauma milenar rodando em segundo plano.", "Chegou a hora de hackear esse teto.", mode="text"),
    SlideData(
        10, "CTA FIXO",
        "COMENTE\n75",
        "E receba o convite VIP para os Engenheiros da Realidade. O protocolo definitivo que destrava seu código financeiro, amoroso e físico.",
        mode="image", cover=False,
        prompt="A massive glowing golden portal in a dark room. Ancient symbols of hermeticism floating softly around it."
    )
]

caption = """O sistema usou a sua fé contra você.

Gerações inteiras da sua família cresceram acreditando que ser pobre era uma virtude e que enriquecer era um pecado perigoso. Isso não foi um erro de tradução, foi um projeto de controle de massa.

Quando você cresce ouvindo essas narrativas, o seu sistema nervoso (que se forma antes dos 7 anos) associa o dinheiro ao perigo e à rejeição divina. 

Então o que acontece hoje? Você trabalha, se esforça, deseja a abundância... Mas quando o dinheiro chega, o seu subconsciente aciona um alarme de emergência. Você se autossabota, gasta tudo, ou pior: adoece. Porque o seu corpo prefere a pobreza do que ser "punido".

A culpa bloqueia a frequência da atração. Enquanto você não limpar esse vírus do seu sistema biológico, nenhum esforço te deixará rico.

Comente "75" abaixo. Vou te enviar o acesso restrito ao protocolo capaz de desinstalar essa culpa milenar direto na raiz, sem que você precise lutar contra a própria mente."""

gerar_carrossel(tema, tema_slug, slides, preset_name, caption=caption)
