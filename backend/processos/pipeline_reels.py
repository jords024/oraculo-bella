#!/usr/bin/env python3
"""
pipeline_reels.py — Orquestrador Principal de Reels
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Executa a fábrica modular de vídeo da Fonte Oculta, passando o tema
por cada agente especializado em sequência.

FLUXO:
  Tema
    → [1] Copywriter       (narrativa falada — as 7 falas)
    → [2] Diretor de Cena  (descrição visual surreal por fala)
    → [3] Por cena:
          ├── Voz Misteriosa  (ElevenLabs TTS → cena_NN_voz.mp3)
          ├── Sonoplasta      (ElevenLabs SFX → cena_NN_sfx.mp3)
          └── Vídeo Kling     (fal.ai Kling O3 → cena_NN_video.mp4)
    → [4] Músico            (Stable Audio → trilha_fundo.mp3)

SAÍDA: campanhas/reels/temp/

USO:
    python processos/pipeline_reels.py "O algoritmo drena sua atenção"
    python processos/pipeline_reels.py  ← usa tema padrão
"""

import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.agentes.copywriter_reels import escrever_narrativa
from core.agentes.diretor_de_cena import criar_visuais
from core.agentes.musico import gerar_musica_fundo
from core.agentes.sonoplasta import gerar_sfx
from core.agentes.video_prompt_builder import build_kling_prompt
from core.agentes.voz_misteriosa import gerar_voz_cinematografica
from infra.video.seedance_manager import gerar_video_seedance


class C:
    GOLD  = "\033[38;5;214m"
    CYAN  = "\033[96m"
    GREEN = "\033[92m"
    WARN  = "\033[93m"
    RST   = "\033[0m"
    BOLD  = "\033[1m"


def iniciar_pipeline(tema: str):
    print(f"\n{C.GOLD}{C.BOLD}{'═'*58}")
    print("      FÁBRICA FONTE OCULTA — REELS PIPELINE")
    print(f"{'═'*58}{C.RST}")
    print(f"  Tema: {C.CYAN}{tema}{C.RST}\n")

    # ── ETAPA 1: Copy ────────────────────────────────────────────
    print(f"{C.WARN}[Etapa 1/4]{C.RST} Copywriter escrevendo narrativa...")
    narrativa = escrever_narrativa(tema)
    if "error" in narrativa:
        print(f"  ❌ Falha no Copywriter: {narrativa['error']}")
        return

    falas = narrativa.get("falas", [])
    titulo = narrativa.get("titulo_interno", "reel")
    print(f"  ✅ {len(falas)} falas escritas | Título: {titulo}\n")

    # ── ETAPA 2: Visuais ─────────────────────────────────────────
    print(f"{C.WARN}[Etapa 2/4]{C.RST} Diretor de Cena criando visuais...")
    resultado_visuais = criar_visuais(falas)
    if "error" in resultado_visuais:
        print(f"  ❌ Falha no Diretor de Cena: {resultado_visuais['error']}")
        return

    cenas = resultado_visuais.get("cenas", [])
    print(f"  ✅ {len(cenas)} visuais criados\n")

    # ── ETAPA 3: Assets por cena ─────────────────────────────────
    print(f"{C.WARN}[Etapa 3/4]{C.RST} Gerando assets cena a cena...\n")
    total = len(cenas)

    for cena in cenas:
        num      = cena["num"]
        num_str  = f"{num:02d}"
        fala     = cena["fala"]
        visual   = cena["descricao_visual_crua"]

        print(f"{C.GOLD}>>> CENA {num_str}/{total:02d}{C.RST}")
        print(f"  Fala:   {C.CYAN}{fala}{C.RST}")
        print(f"  Visual: {visual[:80]}...\n")

        # Voz
        print(f"  {C.WARN}[Voz]{C.RST} Conjurando narração...")
        gerar_voz_cinematografica(fala, f"cena_{num_str}_voz.mp3")

        # SFX (geração de prompt automática via GPT)
        print(f"  {C.WARN}[SFX]{C.RST} Conjurando efeitos sonoros...")
        gerar_sfx(fala=fala, visual=visual, nome_arquivo=f"cena_{num_str}_sfx.mp3", duration_seconds=5.0)

        # Vídeo
        print(f"  {C.WARN}[Vídeo]{C.RST} Renderizando com Kling O3...")
        prompt_video = build_kling_prompt(visual)
        gerar_video_seedance(prompt_video, f"cena_{num_str}_video.mp4")

        print(f"  {C.GREEN}✅ Cena {num_str} concluída.{C.RST}\n")

    # ── ETAPA 4: Trilha ──────────────────────────────────────────
    print(f"{C.WARN}[Etapa 4/4]{C.RST} Músico compondo trilha sonora...")
    prompt_musica = (
        "Dark cinematic ambient music, mystery and suspense, slow hypnotic buildup, "
        "transitioning into a soft ethereal hopeful piano chord progression at the very end"
    )
    gerar_musica_fundo(prompt_musica, "trilha_fundo.mp3", 40)

    # ── Resumo ───────────────────────────────────────────────────
    print(f"\n{C.GOLD}{C.BOLD}{'═'*58}")
    print("      PIPELINE CONCLUÍDO")
    print(f"{'═'*58}{C.RST}")
    print(f"  {C.GREEN}Assets salvos em: campanhas/reels/temp/{C.RST}")
    print("  Cada cena: _voz.mp3 + _sfx.mp3 + _video.mp4")
    print("  Trilha: trilha_fundo.mp3")
    print("\n  Arraste os pares para sua timeline e monte o reel.\n")


if __name__ == "__main__":
    tema = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else \
        "O algoritmo das redes sociais foi criado para ser um vampiro da sua atenção."
    iniciar_pipeline(tema)
