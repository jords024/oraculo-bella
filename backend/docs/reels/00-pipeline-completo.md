# Pipeline de Reels — Fonte Oculta

> Documento mestre. Toda decisão arquitetural vive aqui.

---

## O que é esse sistema

Fábrica modular de vídeos verticais (Reels/TikTok) para o Instagram @afonteoculta.

Recebe um **tema** e produz todos os assets necessários para montar um Reel de 30-40 segundos com estética dark, mística, cinematográfica — o DNA visual da Fonte Oculta.

A montagem final (juntar os clips na timeline) é feita manualmente no CapCut ou Premiere. O pipeline entrega as peças prontas.

---

## Fluxo Completo

```
TEMA (texto livre)
      │
      ▼
┌─────────────────────────────────┐
│  [1] COPYWRITER                 │  → escreve as 7 falas (narrativa)
│  core/agentes/copywriter_reels  │
└─────────────────────────────────┘
      │  lista de falas
      ▼
┌─────────────────────────────────┐
│  [2] DIRETOR DE CENA            │  → cria 1 visual surreal por fala
│  core/agentes/diretor_de_cena   │
└─────────────────────────────────┘
      │  cenas = fala + visual
      ▼
┌─────────────────────────────────────────────────────────┐
│  [3] LOOP POR CENA (×7)                                 │
│                                                         │
│  ├── [VOZ MISTERIOSA]   ElevenLabs TTS                  │
│  │   core/agentes/voz_misteriosa   → cena_NN_voz.mp3   │
│  │                                                      │
│  ├── [SONOPLASTA]       ElevenLabs Sound Gen            │
│  │   core/agentes/sonoplasta       → cena_NN_sfx.mp3   │
│  │                                                      │
│  └── [VÍDEO KLING O3]  fal.ai → Kling                  │
│      core/agentes/video_prompt_builder                  │
│      infra/video/seedance_manager   → cena_NN_video.mp4 │
└─────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  [4] MÚSICO                     │  → trilha contínua de 40s
│  core/agentes/musico            │  → trilha_fundo.mp3
└─────────────────────────────────┘
```

**Saída:** `campanhas/reels/temp/`

---

## Agentes — Índice

| # | Agente | Arquivo | Responsabilidade |
|---|--------|---------|-----------------|
| 1 | [[01-agente-copywriter]] | `copywriter_reels.py` | Escreve a narrativa falada |
| 2 | [[02-agente-diretor-de-cena]] | `diretor_de_cena.py` | Cria os visuais surrealistas |
| 3 | [[03-agente-voz-misteriosa]] | `voz_misteriosa.py` | Narra o texto (ElevenLabs) |
| 4 | [[04-agente-sonoplasta]] | `sonoplasta.py` | Gera SFX ambiental |
| 5 | [[05-agente-musico]] | `musico.py` | Compõe trilha de fundo |
| 6 | [[06-agente-video-kling]] | `seedance_manager.py` | Gera os clips de vídeo |

---

## APIs Necessárias

| Variável `.env` | Serviço | Usado por |
|-----------------|---------|-----------|
| `OPENAI_API_KEY` | OpenAI GPT-4o | Copywriter, Diretor de Cena, Sonoplasta (prompt SFX) |
| `ELEVENLABS_API_KEY` | ElevenLabs | Voz Misteriosa, Sonoplasta |
| `FAL_KEY` | fal.ai | Vídeo (Kling O3), Músico (Stable Audio) |

---

## Como Rodar

```bash
# Tema próprio
python processos/pipeline_reels.py "O seu subconsciente foi programado antes dos 7 anos"

# Tema padrão (algoritmo/atenção)
python processos/pipeline_reels.py

# Engenharia reversa de reel viral
python core/agentes/reels_engineer.py https://www.instagram.com/reel/...
```

---

## Princípios de Design do Pipeline

### Por que agentes separados?

O Roteirista original fazia 3 coisas em 1 prompt GPT-4o:
- Escrevia a copy
- Imaginava os visuais
- Descrevia os SFX

Isso funciona mas não dá controle. Se a copy ficou boa mas o visual ficou fraco, você não consegue rerrodar só o visual sem gastar novamente no copy.

Com agentes separados:
- **Rerrodar só o visual** → chama `diretor_de_cena.py` com as falas existentes
- **Rerrodar só o SFX** → chama `sonoplasta.py` com fala + visual existentes
- **Rerrodar só a voz** → chama `voz_misteriosa.py` com a fala existente
- **Cada agente pode evoluir** seu prompt independentemente sem quebrar os outros

### DNA Visual (inquebrável)

Todo prompt de vídeo passa pelo `video_prompt_builder.py` que injeta:
- Formato 9:16 vertical
- Estética ultra high-end, 8K, cinematic
- Movimento hipnótico e lento
- Proibição absoluta de texto no vídeo

---

## Estrutura de Pastas

```
nano-banana-mcp/
├── processos/
│   └── pipeline_reels.py        ← orquestrador, rode aqui
│
├── core/agentes/
│   ├── copywriter_reels.py      ← [1] narrativa
│   ├── diretor_de_cena.py       ← [2] visuais
│   ├── voz_misteriosa.py        ← [3a] narração
│   ├── sonoplasta.py            ← [3b] SFX
│   ├── musico.py                ← [4] trilha
│   ├── video_prompt_builder.py  ← coleira de ouro (helper)
│   └── reels_engineer.py        ← engenharia reversa (modo B)
│
├── infra/video/
│   └── seedance_manager.py      ← client fal.ai / Kling O3
│
└── campanhas/reels/temp/        ← assets gerados
    ├── cena_01_voz.mp3
    ├── cena_01_sfx.mp3
    ├── cena_01_video.mp4
    ├── ...
    └── trilha_fundo.mp3
```
