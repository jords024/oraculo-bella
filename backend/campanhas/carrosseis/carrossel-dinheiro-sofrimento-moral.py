#!/usr/bin/env python3
"""
carrossel-dinheiro-sofrimento-moral.py
Campanha: Se o dinheiro precisa doer, alguém te ensinou (Tema 46)
Estruturado com Copy de Alto Impacto para a praça Sistema, seguindo o Método Jordânico de 10 slides.
"""

import sys
from pathlib import Path

# Adiciona o diretório do projeto ao PATH
sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from core.agentes.diretor_artistico import SlideData, gerar_carrossel


def main():
    tema = "SE O DINHEIRO PRECISA DOER ALGUEM TE ENSINOU ERRADO"
    tema_slug = "dinheiro-sofrimento-moral"

    # ── DEFINIÇÃO DOS SLIDES ──────────────────────────────────────────────────
    slides = [
        SlideData(
            num=1,
            estado="DISRUPÇÃO",
            title="SE O DINHEIRO\nPRECISA DOER,\nALGUÉM TE ENSINOU\nERRADO.",
            body="“Com o suor do teu rosto comerás o teu pão” (Gn 3:19). Você foi treinado para acreditar que a escassez te santifica.",
            prompt=(
                "Vintage 1970s psychedelic sci-fi comic book illustration, retro pop-art graphic novel style "
                "in the manner of Jean Giraud Moebius. Thick black ink outlines, stipple shading, halftone dot textures. "
                "A cracked golden coin floating above a crown of thorns. Dark cathedral shadows in the background, with faint dust in a beam of light. "
                "The image feels sacred and accusatory at once. High contrast, rich colors, retro analog texture, masterpiece."
            ),
            mode="image",
            cover=True
        ),
        SlideData(
            num=2,
            estado="DESCIDA",
            title="VOCÊ SENTIU ISSO\nANTES DE ENTENDER",
            body="Você não estava errado em estranhar o dinheiro. Em muitos lugares, desejar abundância foi tratado como risco moral. O seu corpo aprendeu a recuar antes da sua mente aprender a querer.",
            prompt=(
                "Retro comic book illustration. A solitary figure standing inside a dim chapel, looking at a distant warm light but unable to step forward. "
                "Soft shadows, intimate and quiet. Thick black ink outlines, stipple shading, halftone dot textures."
            ),
            mode="image"
        ),
        SlideData(
            num=3,
            estado="NOMEAÇÃO",
            title="O SOFRIMENTO\nVIROU PROVA\nDE VALOR",
            body="Em Gênesis 3:19, aparece a imagem do “suor do rosto” ligado ao pão. Séculos depois, isso foi absorvido por culturas inteiras como código moral. Max Weber mostrou em 1905 como a ética religiosa ajudou a transformar trabalho duro em sinal de virtude e disciplina social.",
            prompt=(
                "Retro comic book style illustration. Ancient scripture lines morphing into factory time cards. Ink turns into smoke, "
                "then into marching workers beneath a church bell. Heavy ink outlines, halftone dot textures, high-contrast highlights."
            ),
            mode="image"
        ),
        SlideData(
            num=4,
            estado="PROFUNDIDADE",
            title="QUANDO A MORAL\nENTRA NO DINHEIRO",
            body="O ponto não é a Bíblia em si. É o uso histórico de certos trechos para associar desejo, prazer e prosperidade a perigo espiritual. Quando riqueza passa a carregar culpa moral, o sistema ganha pessoas obedientes, cansadas e gratas pelo pouco. A escassez deixa de ser só condição material. Ela vira identidade.",
            mode="text"
        ),
        SlideData(
            num=5,
            estado="QUEDA FUNDA",
            title="ENTÃO VOCÊ\nAPRENDEU A SE TRAIR",
            body="O nível mais fundo não é trabalhar demais. É suspeitar do que vem com leveza. Existe uma parte de você que aceita o cansaço como preço de dignidade, porque sem sofrimento você teme não merecer receber.",
            mode="text"
        ),
        SlideData(
            num=6,
            estado="ESPELHO",
            title="VOCÊ JÁ FEZ\nISSO COM VOCÊ",
            body="Você já diminuiu o próprio preço para parecer humilde. Já julgou alguém rico para não encarar a própria vontade de prosperar. Já transformou exaustão em prova de caráter.",
            mode="text"
        ),
        SlideData(
            num=7,
            estado="ASCENSÃO",
            title="A SAÍDA\nCOMEÇA NA\nDESASSOCIAÇÃO",
            body="O primeiro movimento é separar dinheiro de culpa e esforço de punição. Prosperidade saudável nasce quando o sistema nervoso deixa de ler ganho como ameaça moral. Sem isso, toda oportunidade boa parece perigosa e todo fluxo tenta ser sabotado.",
            prompt=(
                "Retro comic book style, Moebius inspired. Golden threads being gently untied from barbed wire around a human heart. "
                "The scene shifts from shadow to controlled light, not euphoric, but precise. High contrast, stipple textures, heavy outlines."
            ),
            mode="image"
        ),
        SlideData(
            num=8,
            estado="CRISTALIZAÇÃO",
            title="ESCASSEZ TAMBÉM\nÉ UMA LITURGIA",
            body="Quando o sofrimento vira altar, a abundância parece profana. E quem foi educado a venerar o peso quase sempre sente culpa diante da própria expansão.",
            prompt=(
                "Retro comic book illustration. A silent altar made of stone and receipts, with a dim gold halo hovering above. "
                "Sacred, austere, heavy. Thick black ink outlines, stipple shading, halftone dot textures."
            ),
            mode="image"
        ),
        SlideData(
            num=9,
            estado="SETUP CTA",
            title="EXISTE UM\nPROTOCOLO PARA\nQUEBRAR ISSO",
            body="Existe um protocolo específico para desmontar a associação entre dinheiro, culpa e sofrimento no nível em que o corpo registra ameaça. Foi assim que eu mapeei um dos núcleos mais silenciosos da escassez.",
            prompt=(
                "Retro comic book style. A sealed ancient door with subtle golden sound waves leaking through its edges. "
                "Deep shadow, magnetic center. Thick outlines, stipple shading, halftone dot textures."
            ),
            mode="image"
        ),
        SlideData(
            num=10,
            estado="CTA FIXO",
            title="COMENTE\nFONTE",
            body="E eu te envio a Tecnologia Sonora capaz de dissolver a culpa inconsciente de prosperar e abrir espaço interno para receber mais usando o Desbloqueio Neural.",
            prompt=(
                "A monumental solar-yellow glowing circular portal standing in the deep dark cosmic background, "
                "light emanating from the center. Perfect retro comic illustration, high contrast, thick ink outlines, masterpiece."
            ),
            mode="image"
        )
    ]

    # ── LEGENDA DO INSTAGRAM (CAPTION) ─────────────────────────────────────────
    caption = (
        "Tem gente que não rejeita o dinheiro por falta de ambição.\n\n"
        "Rejeita por fidelidade.\n\n"
        "Fidelidade a uma ideia antiga de que sofrer purifica. De que ganhar pouco protege. De que querer muito corrompe. E de que quem prospera com leveza deve estar devendo algo à própria alma.\n\n"
        "Quando essa doutrina entra cedo no campo de alguém, o dinheiro deixa de ser recurso e vira teste moral.\n\n"
        "A pessoa trabalha. Tenta. Se esforça. Mas no fundo, segue negociando com uma voz invisível que sussurra: “se vier fácil demais, talvez não seja digno”.\n\n"
        "Foi assim que a escassez ganhou um lugar sagrado em muitas vidas.\n\n"
        "Não como falta de capacidade.\n"
        "Como identidade.\n\n"
        "E enquanto o sofrimento continuar sendo confundido com valor, a abundância seguirá parecendo perigosa.\n\n"
        "🜂 Tem crenças que não vivem na sua opinião.\n"
        "Vivem na forma como o seu corpo reage ao receber.\n\n"
        "Comente FONTE se existe em você uma culpa silenciosa toda vez que a vida começa a ficar mais leve"
    )

    # ── COMPILAÇÃO E REGISTRO ──────────────────────────────────────────────────
    out_dir = Path("C:/Users/julia/Desktop/carrossel-se-o-dinheiro-precisa-doer-alguem-te-ensinou")

    print("\n[CAMPANHA] Iniciando o pipeline de Geração do Tema 46...")
    gerar_carrossel(
        tema=tema,
        tema_slug=tema_slug,
        slides=slides,
        preset_name="revelacao",  # Crimson/Red preset
        formato="A",
        caption=caption,
        revisor_score=15.0,
        notes="Campanha teológica e social sobre dinheiro e sofrimento moral (Max Weber, Gênesis 3:19).",
        out_dir=out_dir,
        registrar=True
    )

    print("\n[CAMPANHA] Tema 46 compilado com sucesso!")

if __name__ == "__main__":
    main()
