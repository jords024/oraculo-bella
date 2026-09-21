# Vault — Pipeline de Reels / Fonte Oculta

> Navegue por este índice no Obsidian para acessar qualquer parte do sistema.

---

## Visão Geral

- [[00-pipeline-completo]] — Arquitetura completa, fluxo, como rodar

## Agentes

| Etapa | Nota | O que faz |
|-------|------|-----------|
| 1 | [[01-agente-copywriter]] | Escreve a narrativa falada (as 7 falas) |
| 2 | [[02-agente-diretor-de-cena]] | Cria os visuais surrealistas para cada fala |
| 3a | [[03-agente-voz-misteriosa]] | Narra o texto via ElevenLabs |
| 3b | [[04-agente-sonoplasta]] | Gera SFX ambiental por cena |
| 3c | [[06-agente-video-kling]] | Renderiza o clip de vídeo via Kling O3 |
| 4 | [[05-agente-musico]] | Compõe a trilha contínua de fundo |

## Referência Rápida

```bash
# Rodar o pipeline completo
python processos/pipeline_reels.py "seu tema aqui"

# Engenharia reversa de reel viral
python core/agentes/reels_engineer.py https://instagram.com/reel/...
```

```
APIs necessárias no .env:
  OPENAI_API_KEY     → Copywriter, Diretor de Cena, Sonoplasta (prompt)
  ELEVENLABS_API_KEY → Voz Misteriosa, Sonoplasta (áudio)
  FAL_KEY            → Vídeo (Kling O3), Músico (Stable Audio)
```
