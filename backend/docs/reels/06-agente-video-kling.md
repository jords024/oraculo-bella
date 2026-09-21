# Agente 3c — Vídeo Kling O3

**Arquivos:**
- `core/agentes/video_prompt_builder.py` — monta o prompt final
- `infra/video/seedance_manager.py` — envia para fal.ai e baixa o vídeo

**API:** fal.ai → Kling Video O3 (text-to-video)
**Posição no pipeline:** Etapa 3, loop por cena

---

## Responsabilidade

Gerar o **clip de vídeo** de cada cena.

Dois componentes trabalham em sequência:

### `video_prompt_builder.py` — A Coleira de Ouro

Pega a `descricao_visual_crua` do Diretor de Cena e envolve com o DNA técnico da Fonte Oculta.

**Prefixo obrigatório:**
```
Vertical 9:16 aspect ratio. Ultra high-end commercial aesthetic, photorealistic,
8K, cinematic lighting, studio-grade color grading.
```

**Sufixo obrigatório:**
```
Deep mystical tones from another dimension, psychedelic realism, extreme macro detail,
surreal visual effects. Extremely slow, hypnotic, and subtle camera movement.
Immaculate reflections. ABSOLUTELY NO TEXT. No letters, no numbers.
No cartoon, no anime.
```

Isso garante que mesmo que a descrição do Diretor de Cena seja vaga, o Kling sempre entregará o estilo visual correto.

### `seedance_manager.py` — O Executor

Envia o prompt para a fila do fal.ai e aguarda a renderização:

```
1. POST /fal-ai/kling-video/o3/standard/text-to-video → status_url
2. polling GET status_url a cada 10s
3. quando COMPLETED → pega video_url
4. download → salva em campanhas/reels/temp/cena_NN_video.mp4
```

---

## Configurações de Geração

| Parâmetro | Valor | Motivo |
|-----------|-------|--------|
| `aspect_ratio` | `"9:16"` | Vertical, Instagram Reels |
| `duration` | `"5"` | 5 segundos por cena → 7 cenas = ~35s total |
| Modelo | `kling-video/o3/standard` | Melhor custo-benefício qualidade/tempo |

---

## Fluxo de Dados Completo

```
Diretor de Cena
    descricao_visual_crua: "A glowing gold thread being pulled from a forehead..."
          │
          ▼
video_prompt_builder.build_kling_prompt()
    prompt_final: "Vertical 9:16 aspect ratio. Ultra high-end... A glowing gold thread... ABSOLUTELY NO TEXT..."
          │
          ▼
seedance_manager.gerar_video_seedance()
    → fal.ai / Kling O3
    → polling até COMPLETED
    → download
          │
          ▼
campanhas/reels/temp/cena_01_video.mp4
```

---

## Troubleshooting

**Erro `FAILED` na API:**
- Verifique se o prompt contém conteúdo sensível (Kling rejeita violência, nudez, etc.)
- Tente simplificar a descrição visual

**Vídeo gerado com texto:**
- O sufixo já tem `ABSOLUTELY NO TEXT` — se aparecer, é bug do modelo
- Rerrodar a cena resolve na maioria dos casos

**Tempo de espera alto:**
- Kling O3 demora entre 2 a 5 minutos por clip de 5s
- 7 cenas = ~15 a 35 minutos de geração total
- Não feche o terminal durante o polling

---

## Dependência

```
FAL_KEY no .env
```
