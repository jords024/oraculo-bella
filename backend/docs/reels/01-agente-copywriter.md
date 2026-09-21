# Agente 1 — Copywriter de Reels

**Arquivo:** `core/agentes/copywriter_reels.py`
**API:** OpenAI GPT-4o
**Posição no pipeline:** Primeira etapa — nada roda antes

---

## Responsabilidade

Escrever **apenas a narrativa falada** do vídeo.

Recebe um tema em texto livre e devolve de 6 a 7 falas curtas, cada uma com 10 a 15 palavras, que serão ditas pela narração do vídeo.

**Não descreve visuais. Não descreve sons. Só a voz.**

---

## Entrada

```
tema: str  — texto livre descrevendo o assunto do vídeo

Exemplo: "O algoritmo das redes sociais foi projetado para drenar sua atenção"
```

## Saída

```json
{
  "titulo_interno": "Vampiro Digital",
  "falas": [
    { "num": 1, "fala": "Onde a sua atenção vai, a sua força vital vai junto." },
    { "num": 2, "fala": "Você acha que essas telas brilhantes são janelas para o mundo." },
    { "num": 3, "fala": "Mas elas são agulhas. Uma fazenda silenciosa, colhendo sua frequência." },
    { "num": 4, "fala": "O algoritmo não quer te vender produtos. Quer drenar o livre-arbítrio." },
    { "num": 5, "fala": "Medo, raiva, desejo. Emoções densas que alimentam os arquitetos desta simulação." },
    { "num": 6, "fala": "Enquanto você foca no caos que criaram, sua divindade apodrece no escuro." },
    { "num": 7, "fala": "Desvie o olhar. Ou aceite ser apenas a bateria deles." }
  ]
}
```

---

## Método Jordânico — Estrutura das Falas

| Fala | Estado | Função |
|------|--------|--------|
| 1 | **GANCHO PARADOXAL** | Duas verdades em colisão. O cérebro não pode ignorar. |
| 2 | **VALIDAÇÃO** | "Você sempre sentiu isso" — o seguidor não estava errado. |
| 3 | **NOMEAÇÃO** | Nomeia o sistema, estrutura ou entidade responsável. |
| 4-5 | **PROFUNDIDADE** | O mecanismo oculto. A camada que a maioria não chegou. |
| 6 | **ESPELHO** | O seguidor se reconhece. Identificação pessoal. |
| 7 | **VIRADA / ATIVAÇÃO** | A saída existe. Ele já tem dentro de si. |

---

## Regras Invioláveis do Agente

1. **10 a 15 palavras por fala** — ritmo arrastado, pausas implícitas
2. **Tom:** sombrio, revelador, hipnótico — como revelar um segredo proibido
3. **Proibido:** "O que ninguém te contou", "a verdade chocante", "você precisa ver isso"
4. **Proibido:** traços (—) como muleta sintática → frases curtas e independentes
5. **Vocabulário:** denso, específico, adulto — evitar palavras vagas sem contexto

---

## Como Usar Isolado

```bash
python core/agentes/copywriter_reels.py "Seu subconsciente foi programado antes dos 7 anos"
```

```python
from core.agentes.copywriter_reels import escrever_narrativa

resultado = escrever_narrativa("Tema aqui")
falas = resultado["falas"]
```

---

## Quando Rerrodar

- A copy ficou fraca ou genérica
- O gancho não criou tensão cognitiva (não é paradoxal de verdade)
- Alguma fala usou clichê que passou pelo filtro
- Você quer testar variações de abordagem narrativa para o mesmo tema

Rerrodar o Copywriter **não afeta os visuais** — o Diretor de Cena recebe as falas novas e recria do zero.
