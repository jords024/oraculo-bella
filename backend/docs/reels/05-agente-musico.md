# Agente 4 — Músico (Trilha de Fundo)

**Arquivo:** `core/agentes/musico.py`
**API:** fal.ai → Stable Audio
**Posição no pipeline:** Última etapa — roda uma vez após todas as cenas

---

## Responsabilidade

Compor uma **trilha instrumental contínua** para todo o reel.

Recebe um prompt descritivo e gera um arquivo `.mp3` de 40 segundos (ou a duração configurada) que vai por baixo de todas as cenas na montagem final.

---

## Entrada

```python
prompt: str     — descrição da trilha em inglês
nome_arquivo: str — nome do arquivo de saída
duration: int   — duração em segundos (padrão: 45)
```

## Saída

```
campanhas/reels/temp/trilha_fundo.mp3
```

---

## Prompt Padrão do Pipeline

```
"Dark cinematic ambient music, mystery and suspense, slow hypnotic buildup,
transitioning into a soft ethereal hopeful piano chord progression at the very end"
```

A transição para piano no final serve para suavizar o encerramento do reel e deixar o ouvinte num estado mais receptivo — alinhado com a Fala 7 (virada/ativação).

---

## Arquitetura Técnica

O Stable Audio opera via **fila assíncrona** no fal.ai:

```
1. POST /fal-ai/stable-audio → recebe status_url
2. polling GET status_url a cada 3s
3. quando COMPLETED → GET response_url → pega URL do áudio
4. download e salva localmente
```

---

## Ajustes de Trilha por Tema

| Tema do Reel | Sugestão de prompt de trilha |
|--------------|------------------------------|
| Controle / algoritmo | `Deep cyberpunk ambient, industrial drone, slow digital pulse, ominous buildup` |
| Espiritual / quântico | `Sacred ambient with subtle binaural tones, ethereal choir pads, mystical drone` |
| Dinheiro / sistema | `Dark orchestral tension, low cello drones, subtle percussion, building intensity` |
| Consciência / pineal | `Deep meditation drone, 432hz resonance, ancient mystical atmosphere, crystal bowls` |
| Trauma / cura | `Melancholic piano ambient, soft strings, emotional depth, resolving to warmth` |

---

## Dependência

```
FAL_KEY no .env
```
