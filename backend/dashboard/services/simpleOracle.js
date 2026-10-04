// Modo simples do Oráculo (versão de teste): um único prompt-mestre (agents/oraculo-simples.md)
// escreve ideias e carrosséis. Sem etapa de ganchos, sem diretor artístico, sem JSON de memória
// visual. O código só acrescenta o contrato técnico mínimo que o pipeline precisa para ler as lâminas.
import { callResponses, parseJson, conversationText, emit, progress, addUsage, clean } from './editorialOrchestrator.js';

const MARKUP_RULES = `Marcação de vozes (o motor tipográfico desenha com ela, use SOMENTE em TÍTULO e CORPO): [[palavra]] = a palavra-conceito em serifa monumental; *palavra* = itálico de virada. No máximo 3 marcações por título, sempre em palavras que carregam sentido (nunca preposição). Exemplo de forma: Você fala o preço e já pede [[desculpa]] pelo *número*.`;

function productionContract({ numSlides, layoutPlan, noImageInstruction, usesMarkup }) {
  return `MODO PRODUÇÃO. Entregue SOMENTE o roteiro e a legenda, sem análise, plano ou explicação, neste formato exato (o sistema lê estas tags, não invente outras):

[S1 — NOME AUTORAL DO ESTADO | layout: LAYOUT]
TÍTULO: título completo
CORPO: texto das lâminas, uma frase por linha quando ajudar
CENA: A (lâmina com foto) ou TIPOGRÁFICA (lâmina só com tipografia)
RESPIRO: topo, centro ou base
VISUAL: só nas lâminas com foto: a cena em 2 ou 3 frases (gesto humano espontâneo num ambiente real, luz natural, a figura num terço do quadro e o resto espaço calmo); sem texto, logo ou marca d'água na imagem
DIREÇÃO_JSON: {"subject":"","action":"","environment":"","mood":"","light":"","text_side":"left ou right","palette":"papel, musgo, areia ou cacau"}  (uma única linha de JSON válido; palette só nas lâminas sem foto)

Depois das ${numSlides} lâminas, entregue:
## CAPTION
6 a 10 linhas curtas na mesma voz; abre retomando o gancho com outras palavras e fecha com uma pergunta e COMENTE BELLA.
## CTA TRIBAL
uma linha com COMENTE BELLA e o convite.

Entregue exatamente ${numSlides} lâminas. TÍTULO e CORPO sempre por extenso, sem reticências. Escreva em caixa normal (maiúscula só no início das frases); nunca em CAIXA ALTA. A penúltima lâmina convida e a última termina com COMENTE BELLA.

Plano de layouts (use exatamente os valores de layout abaixo, nunca nomes descritivos):
${layoutPlan}
${noImageInstruction ? `\n${noImageInstruction}\n` : ''}
${usesMarkup ? `\n${MARKUP_RULES}\n` : ''}`;
}

export async function runSimpleIdeas({ apiKey, model, reasoningEffort, messages, memory = '', master, onStage = () => {}, onActivity = () => {} }) {
  const usage = { input_tokens: 0, output_tokens: 0 };
  onStage('ideation', 'Pensando em temas e ganchos');
  const base = { id: 'simple-ideas', agent: 'Oráculo Bella', collaborators: [], title: 'Escrevendo temas e ganchos', detail: 'Um único prompt-mestre cuida do tema, do estado emocional e do gancho.' };
  emit(onActivity, { ...base, status: 'working', elapsedSeconds: 0 });
  const result = await callResponses({
    apiKey, model, reasoningEffort, maxOutputTokens: 6000,
    instructions: `${master}\n\nMODO IDEIAS. Entregue exatamente 5 temas de carrossel para a Isabella, de áreas diferentes da vida da leitora (amor, amizade, trabalho, dinheiro, descanso, desejo, decisão, visibilidade, espiritualidade; família só se o pedido pedir), cada um com um estado emocional diferente e um tipo de gancho diferente. Para cada tema escreva cinco versões do gancho da capa seguindo a seção "O gancho é tudo", entregue a melhor em "gancho" e as duas seguintes em "outras_versoes". Responda apenas JSON válido: {"ideias":[{"tema":"uma frase dizendo a ideia do carrossel","gancho":"","estado_emocional":"","tipo":"paradoxal|metafórico|confrontacional","gatilhos":["",""],"por_que_prende":"uma frase simples","outras_versoes":["",""]}]}`,
    input: `PEDIDO:\n${conversationText(messages)}\n\nMEMÓRIA ANTIRREPETIÇÃO (não repita temas nem formas):\n${memory || 'Nenhuma.'}`,
    onProgress: progress(onActivity, base)
  });
  addUsage(usage, result.usage);
  const ideas = (parseJson(result.text, { ideias: [] }).ideias || []).filter(item => clean(item.gancho)).slice(0, 5);
  emit(onActivity, { ...base, status: 'done', title: 'Temas e ganchos prontos', detail: 'Escritos com o prompt-mestre simples.', metrics: [{ label: 'ideias', value: ideas.length }] });
  const text = ideas.map((item, index) => [
    `${index + 1}. Tema: ${clean(item.tema)}`,
    `Título: ${clean(item.gancho)}`,
    item.estado_emocional && `Estado emocional: ${clean(item.estado_emocional)}`,
    item.tipo && `Tipo de gancho: ${clean(item.tipo)}`,
    item.por_que_prende && `Por que prende: ${clean(item.por_que_prende)}${(item.gatilhos || []).length ? ` · Gatilhos: ${item.gatilhos.map(clean).join(' + ')}` : ''}`,
    (item.outras_versoes || []).length && `Outras versões do gancho: ${item.outras_versoes.map(clean).join(' | ')}`
  ].filter(Boolean).join('\n')).join('\n\n');
  return { text, usage, stages: ['ideation'], brief: { research_mode: 'dispensable' } };
}

export async function runSimpleProduction({ apiKey, model, reasoningEffort, messages, totalSlides = 5, memory = '', master, layoutPlan = '', noImageInstruction = '', usesMarkup = false, onStage = () => {}, onActivity = () => {} }) {
  const usage = { input_tokens: 0, output_tokens: 0 };
  onStage('writing', 'Escrevendo o carrossel');
  const base = { id: 'simple-writing', agent: 'Oráculo Bella', collaborators: [], title: 'Escrevendo o carrossel', detail: 'Um único prompt-mestre escreve a copy, a legenda e a direção das cenas.' };
  emit(onActivity, { ...base, status: 'working', elapsedSeconds: 0 });
  const result = await callResponses({
    apiKey, model, reasoningEffort, maxOutputTokens: 9000,
    instructions: `${master}\n\n${productionContract({ numSlides: totalSlides, layoutPlan, noImageInstruction, usesMarkup })}`,
    input: `CONVERSA:\n${conversationText(messages)}\n\nMEMÓRIA ANTIRREPETIÇÃO (não repita temas nem formas):\n${memory || 'Nenhuma.'}\n\nQUANTIDADE: ${totalSlides} lâminas.`,
    onProgress: progress(onActivity, base)
  });
  addUsage(usage, result.usage);
  emit(onActivity, { ...base, status: 'done', title: 'Carrossel escrito', detail: 'Roteiro, legenda e direção das cenas prontos.' });
  const text = String(result.text || '').replace(/^```(?:markdown)?\s*/i, '').replace(/\s*```$/, '').trim();
  return { text, usage, stages: ['writing'], brief: { research_mode: 'dispensable' } };
}
