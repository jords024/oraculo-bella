# Agente 2 — Diretor de Cena (Visual)

**Arquivo:** `core/agentes/diretor_de_cena.py`
**API:** OpenAI GPT-4o
**Posição no pipeline:** Segunda etapa — roda após o Copywriter

---

## Responsabilidade

Traduzir cada fala em uma **descrição visual surreal** que aparece no fundo do vídeo.

Recebe a lista de falas do Copywriter e devolve, para cada uma, a `descricao_visual_crua` — a metáfora visual cinematográfica e surrealista.

**Não escreve copy. Não gera prompt técnico (isso é do `video_prompt_builder`). Só a visão.**

---

## Entrada

```python
falas: list[dict]  — lista de {"num": int, "fala": str}

Exemplo:
[
  {"num": 1, "fala": "Onde a sua atenção vai, a sua força vital vai junto."},
  {"num": 2, "fala": "Você acha que essas telas brilhantes são janelas para o mundo."}
]
```

## Saída

```json
{
  "cenas": [
    {
      "num": 1,
      "fala": "Onde a sua atenção vai, a sua força vital vai junto.",
      "descricao_visual_crua": "A stunningly detailed macro shot of a glowing ethereal gold thread being slowly pulled from the center of a human's forehead into a dark, void-like monolith."
    },
    {
      "num": 2,
      "fala": "Você acha que essas telas brilhantes são janelas para o mundo.",
      "descricao_visual_crua": "A person holding a glowing smartphone in the dark, but their physical face and skin are stretching and being violently sucked into the phone's screen like a digital black hole."
    }
  ]
}
```

---

## Regras de Visualização (A Alma do Agente)

### O que é proibido
- Cenas literais: pessoas trabalhando, dinheiro caindo, rostos tristes, mãos segurando objetos
- Imagens de banco: pôr do sol, natureza genérica, paisagens comuns
- Emoções representadas de forma direta e óbvia

### O que é obrigatório
- **Metáforas viscerais e energéticas** — o visual traduz a emoção, não a descreve
- **Estética Dark Fantasy** — cósmico, psicológico, surreal, cinematográfico
- **Figura humana** permitida apenas como silhueta, sem rosto, mínima e poderosa
- **Descrição em inglês** — vai direto para a IA de vídeo

### Exemplos de tradução

| Fala diz... | Agente comum faria... | Fonte Oculta faz... |
|-------------|----------------------|---------------------|
| "você está preso" | Pessoa atrás de grades | Silhueta enraizada no chão, raízes de energia vermelha drenando luz dourada do peito |
| "o sistema te controla" | Marionete com cordas | Milhares de silhuetas suspensas por fios invisíveis numa colmeia industrial escura |
| "você precisa despertar" | Olho se abrindo | Pupila mecânica fechando como obturador de câmera, cortando luz artificial azul |

---

## Separação de Responsabilidades

```
Diretor de Cena  →  descricao_visual_crua  (a metáfora, em linguagem humana)
        ↓
video_prompt_builder  →  prompt_final  (a metáfora + "Coleira de Ouro" técnica)
        ↓
Kling O3  →  video.mp4
```

O Diretor de Cena **não conhece o Kling**. Ele pensa em cinema, não em prompts de IA. O `video_prompt_builder` faz a tradução técnica.

---

## Como Usar Isolado

```bash
python core/agentes/diretor_de_cena.py
# (roda com falas de teste hardcoded)
```

```python
from core.agentes.diretor_de_cena import criar_visuais

falas = [{"num": 1, "fala": "Onde a sua atenção vai..."}]
resultado = criar_visuais(falas)
cenas = resultado["cenas"]
```

---

## Quando Rerrodar

- Os visuais ficaram genéricos ou literais demais
- Uma cena específica não traduz bem a emoção da fala
- Você quer testar variações estéticas para o mesmo roteiro
- A fala foi reescrita pelo Copywriter e o visual precisa ser atualizado

Rerrodar só os visuais **não afeta a copy, a voz ou o SFX** — cada agente é independente.
