#!/usr/bin/env python3
"""
carrossel-niceia.py
Campanha: Jesus nunca disse que era o único filho de Deus (Tema 6)
Estruturado no formato de 8 slides do Oráculo (Método de Tese + Tradução) com Copy de Alto Impacto.
"""

import sys
from pathlib import Path

# Adiciona o diretório do projeto ao PATH
sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from core.agentes.diretor_artistico import SlideData, gerar_carrossel


def main():
    tema = "Jesus nunca disse que era o único filho de Deus"
    tema_slug = "niceia-terceirizacao-divino"

    # ── DEFINIÇÃO DOS SLIDES ──────────────────────────────────────────────────
    slides = [
        SlideData(
            num=1,
            estado="DISRUPÇÃO",
            title="JESUS NUNCA DISSE QUE ERA\nO ÚNICO FILHO DE DEUS.\nISSO FOI VOTADO E\nDECIDIDO EM 325 D.C.",
            body="O maior sequestro de identidade da história humana não foi um crime. Foi um concílio político.",
            prompt=(
                "Vintage 1970s psychedelic sci-fi comic book illustration, retro pop-art graphic novel style "
                "in the manner of Jean Giraud Moebius. Thick black ink outlines, stipple shading, halftone dot textures. "
                "A monumental stone statue of a Roman Emperor holding a scale that is broken. Under a starlit black sky, "
                "the ground is arid Mars-red rock. Standing in the center is a wise bald African-American man in a long dark "
                "leather trench coat and round reflective sunglasses, looking up at the crumbling statue with a knowing and "
                "silent presence. High contrast, bold solar-yellow and Mars-red highlights, retro analog texture, masterpiece."
            ),
            mode="image",
            cover=True
        ),
        SlideData(
            num=2,
            estado="FERIDA",
            title="O ACORDO DE NICEIA.",
            body="No ano 325 d.C., o Imperador Constantino reuniu centenas de bispos. O objetivo **não era espiritual, era geopolítico**. O Império Romano estava rachando e o trono precisava de uma religião única, hierárquica e inquestionável para unificar o controle.",
            prompt=(
                "Split-screen comic book illustration. Left side: a dark hall filled with shouting robed men raising their hands in anger, "
                "shaded in dark purple tones. Right side: a simple, glowing silhouette of a man meditating in deep cyan light. "
                "Retro comic book style, stipple textures, heavy ink outlines."
            ),
            mode="image"
        ),
        SlideData(
            num=3,
            estado="MECANISMO",
            title="O DECRETO DA\nEXCLUSIVIDADE.",
            body="Para centralizar o poder de Roma, os bispos decretaram que Jesus era Deus exclusivo, de essência idêntica ao Pai. Ao fazer isso, criaram um abismo intransponível entre o ser humano e o divino. O poder criador **foi terceirizado**. Ficou trancado nos altares de pedra.",
            prompt=(
                "A massive, glowing golden lock sealing a set of rustic wooden doors of an ancient stone vault. "
                "The background is a starlit cosmic black void. Thick ink outlines, halftone dot textures, high-contrast solar-yellow highlights."
            ),
            mode="image"
        ),
        SlideData(
            num=4,
            estado="PROFUNDIDADE",
            title="O CÓDIGO GNÓSTICO.",
            body="Antes de Niceia, os primeiros cristãos ensinavam outra verdade. Os manuscritos de Nag Hammadi revelam: o Cristo não era um homem histórico para ser adorado, mas um estado de **consciência eletromagnética** a ser ativado no próprio corpo. O reino de Deus tá dentro de você.",
            mode="text"
        ),
        SlideData(
            num=5,
            estado="VIRADA",
            title="CADA TRADIÇÃO SABIA.",
            body="Niceia tentou esconder a anatomia do divino, mas toda tradição humana chegou lá. O que a Bíblia chama de 'Sopro de Vida', a física chama de campo unificado. O que os antigos chamavam de 'Reino', a neurociência chama de **sistema nervoso em coerência**.",
            prompt=(
                "The wise bald African-American man in a dark trench coat standing under a massive glowing golden torus energy field "
                "that emanates from his chest. The ground is Mars-red dust under a starlit black sky. "
                "High contrast, vintage print texture, Moebius style."
            ),
            mode="image"
        ),
        SlideData(
            num=6,
            estado="REDEFINIÇÃO",
            title="A ILUSÃO DA\nAJUDA EXTERNA.",
            body="Te ensinaram a ajoelhar e implorar a um Deus distante. Mas implorar é vibrar na falta. O campo quântico não atende ao desespero; ele **apenas espelha a contração** que você esconde no estômago. O Criador não julga. Ele responde à frequência.",
            prompt=(
                "Split-screen retro comic illustration. Left side: a skeletal hand reaching out in a dark purple cosmic void. "
                "Right side: a human hand holding a glowing golden key over a Mars-red background. "
                "Retro comic style, heavy dot shading, stipple textures."
            ),
            mode="image"
        ),
        SlideData(
            num=7,
            estado="SOLUÇÃO",
            title="A CHAVE TÁ NO CORPO.",
            body="Jesus nunca tentou criar uma religião. Ele tentou ensinar uma tecnologia somática: o relaxamento absoluto e a certeza do peito. Quando o seu corpo entra in coerência e desliga o modo de alerta, o milagre **deixa de ser um favor**. Vira física pura.",
            prompt=(
                "The wise bald African-American man in a dark trench coat holding a glowing solar-yellow key that radiates "
                "concentric circles of light, dissolving the dark background. Retro comic book style, thick black ink outlines, masterpiece."
            ),
            mode="image"
        ),
        SlideData(
            num=8,
            estado="PORTAL",
            title="O CÓDIGO TÁ INSTALADO.",
            body="A antena sempre esteve aí. Você só tá sintonizado no canal da sobrevivência e da escassez herdada. O Desbloqueio Neural não é uma crença. É a frequência sonora técnica que desliga o medo e **calibra seu peito com a criação** hoje.\n\n**COMENTE \"FONTE\"**",
            prompt=(
                "A monumental solar-yellow glowing circular portal standing in the Mars-red rocky desert under a starlit cosmic sky. "
                "Perfect retro comic illustration, high-friction complementary colors, thick ink outlines, masterpiece."
            ),
            mode="image"
        )
    ]

    # ── LEGENDA DO INSTAGRAM (CAPTION) ─────────────────────────────────────────
    caption = (
        "O maior escândalo do Cristianismo não foi uma heresia. Foi uma decisão de Estado.\n\n"
        "Em 325 d.C., o imperador romano Constantino sequestrou a mensagem original do Cristo e a transformou em um instrumento político de controle absoluto.\n\n"
        "Niceia decretou a divinização externa e inalcançável de Jesus. Fizeram isso pra que você esquecesse a tecnologia que ele mesmo ensinou: o poder criador que tá instalado no seu próprio corpo.\n\n"
        "O que chamamos de \"Sopro de Vida\", a física de vácuo chama de campo quântico unificado. O que os antigos chamavam de \"Reino de Deus\", a neurociência moderna chama de sistema nervoso em estado de coerência cardíaca.\n\n"
        "Tradições ancestrais e investigação científica convergem exatamente no mesmo ponto: a realidade física é um espelho tecnológico absoluto da voltagem eletromagnética que sua biologia emite a cada batimento.\n\n"
        "Te treinaram pra implorar de joelhos a um juiz distante. Mas implorar é vibrar no desespero de quem não tem. O universo não escuta o que você diz; ele decodifica a contração ou a segurança que você esconde no peito e no estômago.\n\n"
        "Jesus tentou te ensinar a criar. Niceia te treinou pra pedir. A diferença é abismal.\n\n"
        "Você tá pronto pra parar de pedir e começar a sintonizar?\n\n"
        "Comente \"FONTE\" aqui embaixo e eu te envio o Desbloqueio Neural. Uma tecnologia sonora que recalibra o seu sistema nervoso e devolve o seu peito para a frequência natural de criação ainda hoje."
    )

    # ── COMPILAÇÃO E REGISTRO ──────────────────────────────────────────────────
    out_dir = Path("C:/Users/julia/Desktop/carrossel-niceia-terceirizacao-divino")

    print("\n[CAMPANHA] Iniciando o pipeline de Niceia...")
    gerar_carrossel(
        tema=tema,
        tema_slug=tema_slug,
        slides=slides,
        preset_name="revelacao", # Crimson/Red preset
        formato="A",
        caption=caption,
        revisor_score=15.0,  # Nota máxima para copy polêmica e quebra de identidade
        notes="Campanha teológica polêmica baseada no Concílio de Niceia, estilo Morpheus retro-comic.",
        out_dir=out_dir,
        registrar=True
    )

    print("\n[CAMPANHA] Niceia compilada com sucesso!")

if __name__ == "__main__":
    main()
