# Fonte Oculta — Visual Style Guide
## DNA Visual dos Carrosséis

Este documento define a identidade visual obrigatória de todos os carrosséis.
Todo prompt enviado ao Gemini deve passar pelo `prompt_builder.py` antes de ser executado.

---

## Identidade Central

| Atributo | Definição |
|---|---|
| Estética | Ilustração cinemática dark e mística |
| Mood | Profundo, revelador, entre o científico e o espiritual |
| Densidade | **Minimalista** — um elemento focal dominante por slide |
| Referências | Stanley Kubrick + documentários National Geographic + arte conceitual de jogos dark |

---

## Paleta de Cores

| Papel | Tom | Uso nos prompts |
|---|---|---|
| Fundo | Preto absoluto | `deep black background`, nunca cinza ou marrom |
| Acento primário | Dourado / âmbar | Frequência, luz, ativação, divino, transformação |
| Acento secundário | Índigo elétrico / azul | Consciência, quântico, mistério, profundidade |
| Luz | Branco / prata | Bordas, emanação, pós-transformação |
| Energia ativa | Âmbar-vermelho | Trauma, frequência de loop, urgência |
| Transformação | Dourado branco | Estado após a mudança, campo coerente |

---

## Elementos Permitidos

- Silhuetas humanas sem feições definidas
- Campos eletromagnéticos e toroidais
- Ondas de frequência (theta, gamma, sonoras, cardíacas)
- Geometria sagrada **como textura de fundo**, nunca em primeiro plano
- Luz emanando do centro, coração ou mente
- Espaço cósmico, constelações distantes, galáxias
- Padrões de dissolução e transformação (antes/depois)
- Espelhos, reflexos, portais

---

## Elementos Proibidos

- Qualquer texto, palavra, letra ou número visível na imagem
- Rostos humanos com feições claras ou identificáveis
- Mais de 2 elementos simbólicos simultâneos (causa poluição visual)
- Cores saturadas, neon, pastéis ou vibrantes
- Estilos cartoon, anime, 3D estilizado, pixel art
- Ícones religiosos literais (cruzes, estrelas, crescentes)
- Cenários urbanos, cotidianos ou natureza comum
- Qualquer palavra em inglês visível na imagem gerada

---

## Estrutura por Layout

### Fullbleed (slides 01, 03, 05, 07, 08 — padrão)
- Elemento focal centralizado ou levemente acima do centro
- Parte inferior deve ficar escura e limpa (área do texto sobreposto)
- Profundidade: elemento próximo + fundo atmosférico distante
- Sem elementos nos cantos inferiores

### Card (slides 02, 04, 06 — padrão)
- Composição quadrada, elemento focal centralizado
- Pode ter mais detalhe que o fullbleed (texto não sobrepõe a imagem)
- Fundo pode ter textura sutil de geometria ou campo de frequência

---

## Prefixo e Sufixo Obrigatórios

Estes são aplicados automaticamente pelo `prompt_builder.py`:

**PREFIXO:**
```
Dark cinematic mystical illustration. Single focal point. Minimalist composition. Deep black background.
```

**SUFIXO:**
```
Absolutely no text, words, letters, numbers or readable symbols anywhere in the image. No watermarks. Abstract and symbolic visual language only. Photorealistic dark digital art, high contrast, dramatic lighting.
```

---

## Vocabulário Visual por Tema

| Tema | Termos de prompt preferidos |
|---|---|
| Frequência / Vibração | `electromagnetic field`, `toroidal field`, `golden frequency rings`, `wave patterns` |
| Consciência / Mente | `golden light emanating from mind`, `glowing neural pathways`, `theta wave visualization` |
| Transformação | `dissolving darkness into golden light`, `before-and-after split composition` |
| Tempo / Memória | `circular time visualization`, `sepia ghost echoes`, `transparent past dissolving` |
| Divino / Eu Sou | `infinite golden light expanding outward`, `sacred geometry as subtle background texture` |
| Ciência / Quântico | `quantum field patterns`, `subatomic particle visualization`, `wave-particle duality` |
| Trauma / Loop | `chaotic amber interference`, `repeating circular loop pattern`, `pattern recognition moment` |
| Cabala / Árvore | `luminous spheres connected by golden paths`, `tree of life as subtle energy map` |

---

## Anti-padrões Documentados

| Problema | Causa | Correção |
|---|---|---|
| Imagem poluída (Cabala slide 01) | Muitos elementos simultâneos: texto hebraico + diagrama neural + geometria | Máx. 2 elementos, 1 em destaque |
| Texto em inglês na imagem | Prompt não especificava ausência de texto explicitamente | Sufixo obrigatório resolve |
| Estilo inconsistente entre slides | Cada script usava vocabulário diferente | Prefixo obrigatório resolve |
| Fundo acinzentado em vez de preto | Prompt dizia "dark" mas não "deep black background" | Especificar cor exata |
