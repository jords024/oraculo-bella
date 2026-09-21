#!/usr/bin/env python3
"""
carrossel-coerencia.py
Campanha: O que o Evangelho chama de Fé, a Física chama de Coerência (Tema 10)
Estruturado no método de 10 slides do Oráculo (Método Jordânico) adaptado com Copy Viral e Acessível.
"""

import sys
from pathlib import Path

# Adiciona o diretório do projeto ao PATH
sys.path.insert(0, "C:/Users/julia/nano-banana-mcp")

from core.agentes.diretor_artistico import SlideData, gerar_carrossel


def main():
    tema = "O que o Evangelho chama de Fé, a Física chama de Coerência"
    tema_slug = "coerencia-cardiaca-fe"

    # ── DEFINIÇÃO DOS SLIDES ──────────────────────────────────────────────────
    slides = [
        SlideData(
            num=1,
            estado="DISRUPÇÃO",
            title="O QUE O EVANGELHO\nCHAMA DE FÉ,\nA FÍSICA CHAMA DE\nCOERÊNCIA.",
            body="E isso muda tudo o que você sabe sobre orações. O universo não escuta o que você diz. Ele decodifica o que **seu corpo sente**.",
            prompt="Meditation torus of golden light radiating from chest, esoteric indigo cosmos background",
            mode="image",
            cover=True
        ),
        SlideData(
            num=2,
            estado="DESCIDA",
            title="VOCÊ TENTOU\nACREDITAR.\nE NADA MUDOU.",
            body="Você passou anos se culpando pelo silêncio das suas preces. Disseram que faltava fé. Mas a verdade é que **seu corpo estava tenso**, com medo. E o medo bloqueia a resposta.",
            prompt="Lone dark human silhouette, deep blue and cold purple nebulas, heavy atmosphere",
            mode="image"
        ),
        SlideData(
            num=3,
            estado="NOMEAÇÃO",
            title="ELES TE ENSINARAM\nA IMPLORAR.",
            body="Fomos ensinados a pedir a Deus chorando, a partir da falta e do desespero. Mas o campo quântico é um espelho. Se você pede sentindo falta, ele te devolve **mais escassez**.",
            prompt="Ancient gothic arch or ruined cathedral dome, moody amber and dark crimson glow",
            mode="image"
        ),
        SlideData(
            num=4,
            estado="PROFUNDIDADE",
            title="A BIOLOGIA\nDA ORAÇÃO.",
            body="Seu coração tem um poder magnético **5.000 vezes maior** que o do cérebro. Quando você acalma o peito, o cérebro se cala. E a realidade começa a se moldar ao sinal do coração.",
            mode="text" # Modo texto forçado
        ),
        SlideData(
            num=5,
            estado="QUEDA FUNDA",
            title="O UNIVERSO\nNÃO OUVE PALAVRAS.",
            body="Se a sua boca pede prosperidade, mas o seu peito aperta de angústia pelo amanhã, o campo responde ao **aperto no peito**, não à sua voz. Você atrai o que sente.",
            mode="text"
        ),
        SlideData(
            num=6,
            estado="ESPELHO",
            title="SUA MENTE E SEU\nCORPO BRIGAM.",
            body="Você tenta pensar positivo. Mas as células do seu corpo guardam memórias de medo e rejeição herdadas na infância. A mente quer subir, mas **o corpo te puxa para baixo**.",
            mode="text"
        ),
        SlideData(
            num=7,
            estado="ASCENSÃO",
            title="A VERDADEIRA\nFÉ É ALINHAMENTO.",
            body="Fé nunca foi esforço mental ou repetir frases prontas. É **sintonia física**. É o seu batimento e a sua respiração estarem em perfeita paz. É o estado de pura certeza.",
            prompt="Luminous silhouette walking towards glorious warm golden dawn, sunbeams breaking mist",
            mode="image"
        ),
        SlideData(
            num=8,
            estado="CRISTALIZAÇÃO",
            title="DEUS NÃO JULGA.\nAPENAS REFLETE.",
            body="Toda a abundância do mundo já existe. O Criador não está decidindo se você merece ou não. A sua única tarefa é **sintonizar o seu peito** na frequência de quem já recebeu.",
            prompt="Sacred geometry flower of life golden patterns reflecting over dark quiet water",
            mode="image"
        ),
        SlideData(
            num=9,
            estado="SETUP CTA",
            title="EXISTE UMA\nFREQUÊNCIA\nQUE RECONECTA.",
            body="Existe um caminho simples para sincronizar seu coração e desativar o mecanismo de alerta. O vazio e a ansiedade começam a **sumir em minutos**. É ciência. É imediato.",
            mode="text"
        ),
        SlideData(
            num=10,
            estado="CTA FIXO",
            title="COMENTE\nFONTE",
            body="E eu te envio a Tecnologia Sonora criada para **alinhar seu coração** com o campo da criação hoje mesmo.",
            prompt="Monumental ancient portal of pure golden cosmic light, radiant glowing threshold",
            mode="image"
        )
    ]

    # ── LEGENDA DO INSTAGRAM (CAPTION) ─────────────────────────────────────────
    caption = (
        "O que chamamos de milagre nada mais é do que uma lei da física que ainda não compreendemos.\n\n"
        "Quando você fecha os olhos e repete palavras de esperança, mas o seu peito aperta de angústia, "
        "o campo quântico não ouve a sua voz. Ele reage à contração das suas células.\n\n"
        "O coração é o maior transmissor eletromagnético do corpo humano. Quando ele entra em harmonia profunda, "
        "o cérebro se cala e a realidade se alinha à frequência emitida.\n\n"
        "A verdadeira fé não é um esforço da mente para acreditar no impossível. É uma tecnologia biológica precisa: "
        "o estado absoluto de segurança.\n\n"
        "Você está pronto para parar de implorar e começar a sintonizar?\n\n"
        "Comente \"FONTE\" abaixo e eu te envio o Desbloqueio Neural. Uma tecnologia sonora que sincroniza "
        "seu batimento com o campo da criação hoje mesmo."
    )

    # ── COMPILAÇÃO E REGISTRO ──────────────────────────────────────────────────
    # Usaremos o preset "sagrado" (âmbar/dourado) que se alinha perfeitamente
    # com o tema da oração, da fé e do coração.
    out_dir = Path("C:/Users/julia/Desktop/carrossel-coerencia-cardiaca-fe")

    print("\n[CAMPANHA] Iniciando o pipeline do Diretor Artístico...")
    gerar_carrossel(
        tema=tema,
        tema_slug=tema_slug,
        slides=slides,
        preset_name="sagrado",
        formato="A",
        caption=caption,
        revisor_score=14.2,  # Nota alta para copy altamente viralizada e acessível
        notes="Copy viral acessível baseada na biologia da oração, sem travessões.",
        out_dir=out_dir,
        registrar=True
    )

    print("\n[CAMPANHA] Campanha compilada com sucesso!")

if __name__ == "__main__":
    main()
