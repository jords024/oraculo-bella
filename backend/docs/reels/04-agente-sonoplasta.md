# Agente 3b — Sonoplasta (SFX)

**Arquivo:** `core/agentes/sonoplasta.py`
**APIs:** OpenAI GPT-4o-mini (prompt) + ElevenLabs Sound Generation (áudio)
**Posição no pipeline:** Etapa 3, loop por cena (paralelo com Voz e Vídeo)

---

## Responsabilidade

Gerar os **efeitos sonoros ambientais** (SFX) de cada cena.

Recebe a fala + descrição visual de uma cena e:
1. Usa GPT-4o-mini para descrever o SFX ideal em inglês
2. Envia para ElevenLabs Sound Generation
3. Salva o `.mp3` na pasta de saída

O SFX é **ambiente** — drones, rumbles, texturas sonoras, frequências. Nunca melodia, nunca voz.

---

## Entrada

```python
# Modo 1: prompt direto
gerar_sfx(prompt="Low frequency drone, dark ambient", nome_arquivo="cena_01_sfx.mp3")

# Modo 2: fala + visual (GPT gera o prompt automaticamente)
gerar_sfx(fala="Onde a sua atenção vai...", visual="Gold thread being pulled from forehead...", nome_arquivo="cena_01_sfx.mp3")
```

## Saída

```
campanhas/reels/temp/cena_01_sfx.mp3
```

---

## Dois Modos de Operação

### Modo direto (prompt manual)
Você já sabe o SFX que quer. Passa o prompt em inglês diretamente.

```python
gerar_sfx(
    prompt="Ethereal high frequency sci-fi sweep, subtle dark hum, mysterious intro",
    nome_arquivo="cena_01_sfx.mp3"
)
```

### Modo automático (pipeline padrão)
O agente usa GPT-4o-mini para inferir o SFX ideal a partir da fala e do visual.

```python
gerar_sfx(
    fala="O algoritmo não quer te vender produtos. Quer drenar o livre-arbítrio.",
    visual="A hyper-realistic human brain encased by metallic parasite-like structures...",
    nome_arquivo="cena_04_sfx.mp3"
)
```

---

## Configuração de Duração

`duration_seconds=5.0` — alinhado com a duração padrão de cada cena de vídeo (5 segundos).

Se o vídeo tiver cenas mais longas, ajuste esse parâmetro.

---

## Referência de Prompts SFX por Tipo de Cena

| Atmosfera | Prompt de referência |
|-----------|---------------------|
| Abertura mística | `Ethereal high frequency sci-fi sweep, subtle dark hum, mysterious intro` |
| Tensão / sistema | `Mechanical clicking, deep cybernetic bass pulse, glitchy futuristic sound design` |
| Revelação | `Low frequency cinematic sub bass rumble, subtle electrical crackle, dark ambient drone` |
| Peso emocional | `Heavy liquid splash, deep visceral heartbeat pulse, dark ominous rumble` |
| Fragilidade | `Fragile glass vibrating, soft ethereal sigh, fading magical chime, melancholic drone` |
| Virada / ativação | `Sharp mechanical camera shutter snap, sudden heavy bass drop, absolute silence following` |

---

## Dependências

```
ELEVENLABS_API_KEY no .env
OPENAI_API_KEY no .env  (apenas no modo automático)
```
