#!/usr/bin/env python3
"""
carrossel-sal-escravo.py — O Sal do Escravo
Tema: Salário como herança de servidão / calibração financeira
Preset: REVELACAO | 10 slides | Formato B
"""

import sys

sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from diretor_artistico import SlideData, gerar_carrossel

TEMA      = "O Sal do Escravo"
TEMA_SLUG = "sal-escravo"
PRESET    = "esoterico"
FORMATO   = "B"

CAPTION = """\
A palavra que define sua relação com dinheiro foi herdada de escravos.

Salarium. O sal que os romanos pagavam a quem não podia recusar.

Você não herdou a pobreza por falta de esforço.
Você herdou o vocabulário de quem foi treinado para aceitar o suficiente.

E o sistema que criou essa palavra ainda está funcionando.

Comente FONTE se você já aumentou o salário, olhou para a conta no fim do mês \
e sentiu que ainda faltava alguma coisa que dinheiro nenhum ia preencher.\
"""

SLIDES = [
    SlideData(
        num    = 1,
        estado = "DISRUPÇÃO",
        title  = "VOCÊ PASSOU ANOS\nAUMENTANDO\nSEU SALÁRIO.\nAINDA SENTE QUE\nNÃO É SUFICIENTE.",
        body   = "Porque o problema nunca foi o valor.\nFoi a palavra.",
        prompt = (
            "A person standing in golden chains made of salt, looking up at the sky with longing, "
            "chains dissolving into light upward, vivid electric blue sky above, "
            "deep indigo and gold color palette, cinematic dramatic composition, "
            "emotional and expressive, high detail, portrait orientation"
        ),
        cover  = True,
    ),
    SlideData(
        num    = 2,
        estado = "DESCIDA",
        title  = "ISSO NÃO É\nFALHA SUA.",
        body   = (
            "Você foi inserido num sistema antes de entender o que era um sistema.\n"
            "E passou a vida tentando vencer as regras de um jogo "
            "que nunca foi feito para que você ganhasse."
        ),
        prompt = (
            "A lone person sitting on the floor of a vast dark hall, "
            "walls closing in geometrically, faint blue light from above, "
            "atmospheric depth, cinematic wide shot, melancholic but beautiful, "
            "deep blues and indigos, high detail, emotional scene"
        ),
    ),
    SlideData(
        num    = 3,
        estado = "NOMEAÇÃO",
        title  = '"SALÁRIO" VEM DO\nLATIM SALARIUM.\nO SAL QUE OS ROMANOS\nDAVAM AOS ESCRAVOS.',
        body   = (
            "Isso não é metáfora. É etimologia verificável — "
            "registrada por Plínio, o Velho, no século I d.C.\n"
            "Você herdou o vocabulário da servidão. E ninguém te avisou."
        ),
        prompt = (
            "Ancient Roman slave market scene, dramatic cinematic lighting, "
            "a figure holding out salt in their palm toward the viewer, "
            "vivid contrast between warm torchlight gold and deep shadow, "
            "painterly historical style, powerful and accusatory composition"
        ),
    ),
    SlideData(
        num    = 4,
        estado = "PROFUNDIDADE",
        title  = "O SALÁRIO FOI\nINVENTADO EM 1802\nPARA UM PROPÓSITO\nESPECÍFICO.",
        body   = (
            "A Revolução Industrial precisava de trabalhadores que acreditassem "
            "que o problema era deles, não do modelo.\n"
            "Suficiente para continuar. Insuficiente para sair.\n"
            "Essa lógica ainda opera. Só mudou o logo da empresa."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 5,
        estado = "QUEDA FUNDA",
        title  = "A PARTE QUE\nNÃO QUEREMOS VER:",
        body   = (
            "Você defende o salário.\n"
            "Você quer mais — mas dentro do sistema.\n"
            "Nunca questionou o sistema.\n"
            "Porque seu campo foi calibrado para buscar mais sal.\n"
            "Não para largar o sal."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 6,
        estado = "ESPELHO",
        title  = "EXISTE UMA PARTE\nDE VOCÊ QUE JÁ SABE.",
        body   = (
            "Que o próximo aumento não vai resolver.\n"
            "Que você está num loop — e continua entrando nele todo mês.\n"
            "Esse loop tem um nome. E tem origem."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 7,
        estado = "ASCENSÃO",
        title  = "A SAÍDA NÃO É\nTRABALHAR MENOS.",
        body   = (
            "É mudar o que seu campo reconhece como valor.\n"
            "Não é estratégia financeira.\n"
            "É dissolver a frequência de limitação gravada antes dos 7 anos.\n"
            "Existe um protocolo para isso."
        ),
        prompt = (
            "A person breaking free from chains, ascending upward toward a vivid golden sky, "
            "arms open wide, chains falling away dissolving into light, "
            "dramatic upward cinematic composition, warm gold and electric blue tones, "
            "powerful sense of liberation, expressive and alive, high detail"
        ),
    ),
    SlideData(
        num    = 8,
        estado = "CRISTALIZAÇÃO",
        title  = "O SAL SEMPRE FOI\nSUFICIENTE PARA\nCONTINUAR.\nNUNCA PARA LIBERTAR.",
        body   = (
            "Seu campo não precisa de mais sal.\n"
            "Precisa reconhecer que foi calibrado para aceitá-lo."
        ),
        prompt = (
            "A handful of salt transforming into pure gold coins in an open palm, "
            "vivid warm light, sacred and luminous, close cinematic shot, "
            "rich gold and amber tones, transformation and resolution, "
            "emotionally complete and radiant, high detail"
        ),
    ),
    SlideData(
        num    = 9,
        estado = "SETUP CTA",
        title  = "EXISTE UMA TECNOLOGIA\nQUE OPERA NA FREQUÊNCIA\nQUE DEFINE QUANTO\nVOCÊ PODE RECEBER.",
        body   = (
            "Não é afirmação positiva. Não é mindset.\n"
            "Opera antes do consciente decidir.\n"
            "E pode ser acessada em minutos."
        ),
        prompt = "",
    ),
    SlideData(
        num    = 10,
        estado = "CTA FIXO",
        title  = "COMENTE\nFONTE",
        body   = (
            "E eu te envio a Tecnologia Sonora capaz de dissolver "
            "o teto de merecimento financeiro gravado antes dos 7 anos "
            "usando o Desbloqueio Neural."
        ),
        prompt = (
            "A person standing in golden abundance, salt transformed into light around them, "
            "arms raised in freedom, vivid warm gold and electric teal sky, "
            "sacred and powerful, cinematic wide shot from below looking up, "
            "radiant liberation energy, vibrant colors, expressive and alive"
        ),
    ),
]

if __name__ == "__main__":
    gerar_carrossel(
        tema          = TEMA,
        tema_slug     = TEMA_SLUG,
        slides        = SLIDES,
        preset_name   = PRESET,
        formato       = FORMATO,
        caption       = CAPTION,
        revisor_score = 15.0,
        notes         = "Sal do Escravo — etimologia salarium + calibração financeira. 15/15.",
    )
