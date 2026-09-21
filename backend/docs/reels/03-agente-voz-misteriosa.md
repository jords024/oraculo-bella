# Agente 3a — Voz Misteriosa (Narração)

**Arquivo:** `core/agentes/voz_misteriosa.py`
**API:** ElevenLabs TTS (Text-to-Speech)
**Posição no pipeline:** Etapa 3, loop por cena

---

## Responsabilidade

Narrar cada fala do Copywriter, gerando o arquivo de áudio MP3 da voz.

Recebe o texto de uma fala e devolve um arquivo `.mp3` com a narração gerada pelo ElevenLabs, usando a voz configurada (Roger — voz natural e relaxada).

---

## Entrada

```python
texto: str        — a fala a ser narrada
nome_arquivo: str — nome do arquivo de saída (ex: "cena_01_voz.mp3")
```

## Saída

```
campanhas/reels/temp/cena_01_voz.mp3
```

---

## Configuração da Voz

| Parâmetro | Valor | Efeito |
|-----------|-------|--------|
| `VOICE_ID` | `CwhRBWXzGAHq8TQ4Fs17` (Roger) | Voz natural, grave, profissional |
| `model_id` | `eleven_multilingual_v2` | Suporte ao português com qualidade alta |
| `stability` | `0.35` | Baixo → voz mais emotiva e orgânica |
| `similarity_boost` | `0.8` | Alto → mantém o peso e timbre do original |

### Por que stability baixo?

`stability = 0.35` deixa a voz um pouco menos robotizada e mais expressiva. Para um tom sombrio e revelador, alguma variação orgânica na entonação é desejável. Subir para `0.6+` deixa mais uniforme e menos vivo.

---

## Como Usar Isolado

```bash
python core/agentes/voz_misteriosa.py
# (roda com texto de teste hardcoded)
```

```python
from core.agentes.voz_misteriosa import gerar_voz_cinematografica

caminho = gerar_voz_cinematografica(
    "O sistema foi desenhado para te manter exausto.",
    "cena_01_voz.mp3"
)
```

---

## Quando Ajustar

- **Voz errada para o tom:** trocar o `VOICE_ID` para outro do ElevenLabs
- **Muito robótico:** baixar `stability` (ex: para 0.25)
- **Muito instável/caótico:** subir `stability` (ex: para 0.5)
- **Sotaque diferente:** trocar o `model_id` para `eleven_turbo_v2` (mais rápido, menos fiel)

---

## Dependência

```
ELEVENLABS_API_KEY no .env
```
