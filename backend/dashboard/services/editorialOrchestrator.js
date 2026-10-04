const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

// Modo Oráculo único (padrão): o prompt-mestre da Bella (oraculo-v2.md) lidera sozinho a
// ideação e a escrita; os prompts criador/copywriter/gancho e a reescrita do revisor ficam
// de fora. Defina ORACULO_MODO_UNICO=0 no .env para voltar ao pipeline com vários agentes.
const ORACULO_UNICO = process.env.ORACULO_MODO_UNICO !== '0';
const IDEAS_SCHEMA = '{"candidates":[{"theme":"","title":"","estado_emocional":"","territorio":"","motor_narrativo":"","abertura_de_loop":"","cena_humana":"","confissao_silenciosa":"","acordo_invisivel":"","protecao":"","beneficio_oculto":"","custo_real":"","mecanismo":"","contradicao":"","virada":"","capacidade_ausente":"","ponte_tafa":"","por_que_so_bella":"","relevancia":0,"nivel_consciencia":"","visual_world":"","score":0}]}';

export const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
export const conversationText = (messages, limit = 12) => (Array.isArray(messages) ? messages : [])
  .slice(-limit).map(message => `${message.role === 'assistant' ? 'ASSISTENTE' : 'USUÁRIO'}: ${message.content || ''}`).join('\n\n');

// O scorecard do revisor é controle interno; não deve chegar como parte da entrega.
export const stripScorecard = text => String(text || '').replace(/^\s*(?:#+\s*)?\**SCORECARD[^\n]*\n(?:[^\n]*\n)*?[^\n]*TOTAL:[^\n]*\n+/i, '').trim();

function outputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text.trim();
  return (response?.output || []).flatMap(item => item?.content || []).map(item => item?.text || '').filter(Boolean).join('\n').trim();
}

export function parseJson(text, fallback = {}) {
  const raw = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(raw); } catch {}
  const start = raw.indexOf('{'); const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) { try { return JSON.parse(raw.slice(start, end + 1)); } catch {} }
  return { ...fallback, raw };
}

function collectSources(response) {
  const sources = [];
  const add = source => {
    const url = source?.url || source?.url_citation?.url;
    const title = source?.title || source?.url_citation?.title || url;
    if (url && !sources.some(item => item.url === url)) sources.push({ title, url });
  };
  for (const item of response?.output || []) {
    for (const source of item?.action?.sources || item?.sources || []) add(source);
    for (const content of item?.content || []) for (const annotation of content?.annotations || []) add(annotation);
  }
  return sources;
}

export async function callResponses({ apiKey, model, reasoningEffort, instructions, input, maxOutputTokens = 6500, webSearch = false, onProgress = () => {} }) {
  const payload = { model, instructions, input, reasoning: { effort: reasoningEffort }, max_output_tokens: maxOutputTokens };
  if (webSearch) { payload.tools = [{ type: 'web_search' }]; payload.include = ['web_search_call.action.sources']; }
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const startedAt = Date.now();
    const timer = setInterval(() => onProgress({ elapsedSeconds: Math.round((Date.now() - startedAt) / 1000), attempt }), 7000);
    try {
      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(120000)
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) return { text: outputText(body), usage: body?.usage || {}, sources: collectSources(body) };
      const error = new Error(body?.error?.message || `OpenAI HTTP ${response.status}`); error.status = response.status; lastError = error;
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw error;
    } catch (error) {
      lastError = error;
      if (attempt === 3 || (error.status && ![429, 500, 502, 503, 504].includes(error.status))) throw error;
    } finally { clearInterval(timer); }
    await new Promise(resolve => setTimeout(resolve, attempt * 900));
  }
  throw lastError || new Error('Falha editorial inesperada.');
}

export function emit(onActivity, event) { try { onActivity({ timestamp: Date.now(), ...event }); } catch {} }
export function progress(onActivity, base) { return ({ elapsedSeconds, attempt }) => emit(onActivity, { ...base, status: 'working', elapsedSeconds, detail: attempt > 1 ? `${base.detail} Nova tentativa automática.` : base.detail }); }
export function addUsage(total, usage = {}) { total.input_tokens += Number(usage.input_tokens || 0); total.output_tokens += Number(usage.output_tokens || 0); }

export function detectEditorialMode(messages) {
  const users = (messages || []).filter(message => message.role === 'user').map(message => clean(message.content).toLowerCase());
  const latest = users.at(-1) || '';
  if (!latest) return 'conversation';
  const artifact = /(carrossel|roteiro|slides?|l[aâ]minas?|conte[uú]do(?: completo)?|post(?: completo)?|pe[cç]a|publica[cç][aã]o)/i;
  const production = /(crie|criar|gere|gerar|produza|desenvolva|escreva|monte|fa[cç]a|transforme|tema\s*:)/i;
  const selection = /(?:tema|ideia|op[cç][aã]o|pauta)\s*(?:n[º°o.]?\s*)?#?\s*\d{1,2}\b|\b(?:primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa])\s+(?:tema|ideia|op[cç][aã]o|pauta)\b/i;
  const ideas = /(?:sugira|sugest[oõ]es?|me\s+d[eê]|quero|preciso\s+de|liste|mostre|inspirar|inspira[cç][aã]o).{0,60}(?:ideias?|temas?|pautas?)|(?:ideias?|temas?|pautas?).{0,40}(?:para|sobre|de\s+conte[uú]do)/i;
  const explicitBrainstorm = /sugira|sugest[oõ]es?|\bideias?\b|\bpautas?\b|inspirar|inspira[cç][aã]o|(?:me\s+d[eê]|liste|mostre).{0,40}\btemas?\b/i;
  // Uma escolha numerada dentro do histórico é uma ordem de produção, nunca
  // um novo pedido de brainstorming. Não dependa da ortografia das outras
  // palavras: usuários frequentemente escrevem "conte´do", "cntedo" etc.
  // Só mantenha ideação quando ela tiver sido pedida explicitamente.
  if (selection.test(latest) && !explicitBrainstorm.test(latest)) return 'production';
  // "conteúdo(s)" está na lista de palavras de artefato, mas também aparece o
  // tempo todo em pedidos de brainstorm legítimos ("ideias de conteúdo",
  // "sugestões de conteúdos disruptivos"). Por isso o gatilho de ideação
  // precisa vencer aqui, a menos que exista também um verbo de produção
  // explícito (crie, gere, monte...) — nesse caso sim é uma ordem de produção.
  if (ideas.test(latest) && !production.test(latest)) return 'ideas';
  if ((artifact.test(latest) && production.test(latest)) || /tema\s*:.*t[ií]tulo\s*:/is.test(latest)) return 'production';
  if (artifact.test(latest)) return 'production';
  return 'conversation';
}

function selectedThemeNumber(text) {
  const normalized = clean(text).toLowerCase();
  const numeric = normalized.match(/(?:tema|ideia|op[cç][aã]o|pauta)\s*(?:n[º°o.]?\s*)?#?\s*(\d{1,2})\b/i);
  if (numeric) return Number(numeric[1]);

  const ordinals = { primeira: 1, primeiro: 1, segunda: 2, segundo: 2, terceira: 3, terceiro: 3, quarta: 4, quarto: 4, quinta: 5, quinto: 5 };
  const ordinal = normalized.match(/\b(primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa])\s+(?:tema|ideia|op[cç][aã]o|pauta)\b/i);
  return ordinal ? ordinals[ordinal[1]] || null : null;
}

function numberedIdeaBlocks(content) {
  const source = String(content || '').replace(/\r/g, '').trim();
  if (!source) return [];
  const blocks = [];
  const matcher = /(?:^|\n)\s*(\d{1,2})\s*[.)-]\s*([\s\S]*?)(?=(?:\n\s*\d{1,2}\s*[.)-]\s)|$)/g;
  let match;
  while ((match = matcher.exec(source)) !== null) {
    blocks.push({ number: Number(match[1]), content: match[2].trim() });
  }
  return blocks;
}

export function resolveThemeSelection(messages) {
  const history = Array.isArray(messages) ? messages : [];
  let latestUserIndex = -1;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === 'user') { latestUserIndex = index; break; }
  }
  if (latestUserIndex < 0) return null;

  const number = selectedThemeNumber(history[latestUserIndex]?.content);
  if (!number) return null;

  for (let index = latestUserIndex - 1; index >= 0; index -= 1) {
    if (history[index]?.role !== 'assistant') continue;
    const selected = numberedIdeaBlocks(history[index]?.content).find(block => block.number === number);
    if (selected) return { number, content: selected.content, sourceMessageIndex: index };
  }
  return null;
}

export function contextualizeThemeSelection(messages) {
  const history = (Array.isArray(messages) ? messages : []).map(message => ({ ...message }));
  const selected = resolveThemeSelection(history);
  if (!selected) return history;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role !== 'user') continue;
    history[index].content = `${history[index].content}\n\n[CONTEXTO RESOLVIDO PELO SISTEMA]\nA referência \"tema ${selected.number}\" aponta exatamente para a opção abaixo, apresentada anteriormente pelo assistente:\n${selected.content}\n\nExecute o pedido usando ESTA opção. Não sugira novos temas e não troque a escolha do usuário.`;
    break;
  }
  return history;
}

const EFFORT_ORDER = ['low', 'medium', 'high'];
const FALLBACK_HOOK_PLAYBOOK = 'Você escreve o GANCHO DA CAPA da Bella: cada gancho evoca UM estado emocional universal que a leitora sente e não nomeia, é paradoxal, metafórico ou confrontacional, abre uma tensão sem resolver e tem 8 a 22 palavras faláveis. Evite cenas situacionais aleatórias, terceira pessoa analítica, o molde chama-de-X-o-que-é-Y, abstrações e vocabulário clínico.';

// Etapa dedicada: a ideação preenche dezenas de campos por tema e sobra pouca atenção para o
// gancho. Aqui cada tema recebe 5 versões, cada uma por um mecanismo psicológico diferente,
// e a melhor passa pelo "teste dos 3 segundos". Se algo falhar, a ideação segue com o título original.
async function forgeHooks({ apiKey, model, reasoningEffort, candidates, playbook, onActivity }) {
  const base = { id: 'ideas-hooks', agent: 'Forja de Ganchos', collaborators: ['Oráculo Bella'], title: 'Lapidando o gancho pelo gatilho psicológico', detail: 'Escreve versões paradoxais, metafóricas e confrontacionais e escolhe a que a leitora sente em 3 segundos.' };
  emit(onActivity, { ...base, status: 'working', elapsedSeconds: 0 });
  const effort = EFFORT_ORDER.indexOf(reasoningEffort) < 1 ? 'medium' : reasoningEffort;
  const themes = candidates.map((item, index) => ({
    indice: index + 1, tema: clean(item.theme), estado_emocional: clean(item.estado_emocional), gancho_atual: clean(item.title), cena_humana: clean(item.cena_humana),
    confissao_silenciosa: clean(item.confissao_silenciosa), custo_real: clean(item.custo_real),
    contradicao: clean(item.contradicao), virada: clean(item.virada)
  }));
  try {
    const result = await callResponses({ apiKey, model, reasoningEffort: effort, maxOutputTokens: 7000,
      instructions: `${playbook}\n\nPara CADA tema recebido escreva exatamente 5 versões de gancho (pelo menos uma paradoxal, uma metafórica e uma confrontacional), todas evocando o estado emocional do tema, e escolha a melhor pelo teste dos 3 segundos. VARIEDADE OBRIGATÓRIA NO LOTE DE ESCOLHIDAS: no máximo 2 ganchos do mesmo tipo (pelo menos 1 metafórico e 1 confrontacional entre as escolhidas); no máximo 2 com "Ela" como sujeito; pelo menos 2 falando direto com "você" e pelo menos 1 em lei/máxima ("Toda mulher que…" ou "Mulheres que…"); nenhum estado emocional repetido; tamanhos variados. O "gancho_atual" é só ponto de partida e costuma ser frio demais: não o repita nem o parafraseie. Responda apenas em JSON válido: {"hooks":[{"indice":1,"versoes":[{"tipo":"paradoxal|metafórico|confrontacional","estado_emocional":"","texto":""}],"escolhida":0,"tipo_escolhido":"","estado_emocional":"o que a leitora sente","por_que_prende":"uma frase simples dizendo por que ela quer ver o próximo slide","gatilhos":["Curiosidade","Identificação"]}]}. "escolhida" é o índice (0 a 4) da melhor versão em "versoes".`,
      input: `TEMAS:\n${JSON.stringify(themes, null, 1)}` });
    const parsed = parseJson(result.text, { hooks: [] });
    const hooks = Array.isArray(parsed.hooks) ? parsed.hooks : [];
    let improved = 0;
    for (const hook of hooks) {
      const item = candidates[Number(hook.indice) - 1];
      const versions = (hook.versoes || []).map(v => clean(v?.texto)).filter(Boolean);
      const chosen = versions[Number(hook.escolhida)] || versions[0];
      if (!item || !chosen) continue;
      item.title_original = item.title;
      item.title = chosen;
      item.por_que_prende = clean(hook.por_que_prende);
      item.tipo_gancho = clean(hook.tipo_escolhido);
      if (clean(hook.estado_emocional)) item.estado_emocional = clean(hook.estado_emocional);
      item.gatilhos = (Array.isArray(hook.gatilhos) ? hook.gatilhos : []).map(clean).filter(Boolean);
      item.outras_versoes = versions.filter(v => v !== chosen).slice(0, 2);
      improved += 1;
    }
    emit(onActivity, { ...base, status: 'done', title: 'Ganchos lapidados', detail: 'Cada título passou pelo teste dos 3 segundos.', metrics: [{ label: 'ganchos', value: improved }] });
    return result.usage || {};
  } catch (error) {
    emit(onActivity, { ...base, status: 'done', title: 'Ganchos mantidos', detail: 'Não foi possível lapidar agora; usando os títulos da ideação.' });
    return {};
  }
}

export async function runBigIdeaLab({ apiKey, model, reasoningEffort, messages, memory = '', prompts = {}, onStage = () => {}, onActivity = () => {} }) {
  const usage = { input_tokens: 0, output_tokens: 0 };
  onStage('ideation', 'Abrindo territórios emocionais diferentes');
  const base = { id: 'ideas-explore', agent: 'Estrategista de Big Ideas', collaborators: ['Gancho Viral'], title: 'Criando hipóteses que abrem loops mentais', detail: 'Cruza dor, desejo, contradição e descoberta sem repetir fórmulas recentes.' };
  emit(onActivity, { ...base, status: 'working', elapsedSeconds: 0 });
  const result = await callResponses({ apiKey, model, reasoningEffort, maxOutputTokens: 9000,
    instructions: ORACULO_UNICO
      ? `${prompts.strategist || ''}\n\nMODO IDEIAS. Crie exatamente 12 candidatos de tema para Isabella Dalcin seguindo as Partes 4 e 6 deste prompt. Cada tema nasce de UM estado emocional central que a leitora sente e nunca nomeou (ex.: medo de incomodar, vergonha de querer, solidão dentro da utilidade, culpa de descansar, cansaço de ser a forte, raiva engolida, invisibilidade): preencha "estado_emocional" e escolha temas universais para o público da Bella, não cenas aleatórias ou situações que só algumas viveram (jantar, bloco de notas, grupo de WhatsApp). Nenhum estado emocional se repete entre os candidatos. O campo "title" é um rascunho do gancho da capa, que será lapidado em seguida; ele já deve evocar o estado emocional. Cada candidato usa território, motor narrativo, abertura de loop, forma de capa e conflito diferentes. Aplique a Lei de rotação: família em no máximo 1 candidato; corpo/sintoma em no máximo 1; pelo menos 8 territórios não familiares. Pai, mãe, infância e sintomas não podem ser atalhos de profundidade. Preencha todos os campos; se não conseguir preencher "por_que_so_bella" com algo específico, descarte o tema e crie outro. "relevancia" vai de 0 a 10, honesta, com no máximo dois temas 9 ou 10. "nivel_consciencia" é uma destas: ainda não percebe o padrão, percebe mas não nomeia, já nomeia e procura saída. Responda em JSON válido: ${IDEAS_SCHEMA}.`
      : `${prompts.master || ''}\n\n${prompts.strategist || ''}\n\nCrie exatamente 12 TEMAS PROFUNDOS autorais para Isabella Dalcin e Academia Sete — nunca categorias abstratas ou conselhos de autoajuda genéricos que poderiam pertencer a qualquer conta de bem-estar. Cada tema nasce de uma cena humana real, atravessa um mecanismo específico e só faz sentido dentro do universo da Bella (a vergonha de saber muito e integrar pouco, a espiritualidade usada como fuga, a integração como o produto que ninguém nomeia, o T.A.F.A como sustentação pós-experiência). Rejeite clichês sobre corpo, cansaço, limites, mulher forte, janela, cadeira, e qualquer tese que já é lugar-comum em contas de terapia ou desenvolvimento pessoal. O TÍTULO é o GANCHO da capa (siga "Título e gancho" e "Anatomia do carrossel" da Bíblia): 1 ou 2 frases curtas, até 14 palavras, esdrúxulas de propósito (provocam, incomodam), na Fórmula do choque: uma coisa sofisticada que ela já tem CONTRA um ato humano básico que ela ainda não faz, com a pessoa ou a coisa NOMEADA. Todo substantivo precisa ter referente claro: se dá pra perguntar "qual?" ou "quem?" depois de ler, reescreva ("a mesma conversa" reprova; "a conversa com a sua mãe" passa). Nunca um fragmento poético de 4 ou 5 palavras que só nomeia o assunto, nunca sujeito abstrato, nunca estatística inventada. Distribua os 12 candidatos entre formas diferentes: no máximo 4 na Fórmula do choque; os demais em "Você diz X. Mas Y.", pergunta que cobra com nome, confissão de Bella e denúncia da indústria. No máximo um gancho com a segunda frase começando por "Ainda", e cada gancho com uma pessoa ou ato diferente (mãe, pai, ex, amiga, dinheiro, corpo, trabalho). Profundidade fica nos campos de raciocínio, não no vocabulário do título. Para cada tema, preencha TODOS os campos abaixo — se não conseguir preencher "por_que_so_bella" com algo específico, descarte o tema e crie outro. Responda em JSON válido: {"candidates":[{"theme":"","title":"","cena_humana":"","confissao_silenciosa":"","acordo_invisivel":"","protecao":"","beneficio_oculto":"","custo_real":"","mecanismo":"","contradicao":"","virada":"","capacidade_ausente":"","ponte_tafa":"","por_que_so_bella":"","relevancia":0,"nivel_consciencia":"","visual_world":"","score":0}]}. "relevancia" é de 0 a 10 (quanto o tema ressoa com o momento atual da leitora); seja honesto: no máximo dois temas com nota 9 ou 10 e as notas precisam variar entre os candidatos. E "nivel_consciencia" diz se ela ainda não percebe o padrão, percebe mas não nomeia, ou já nomeia e procura saída.`,
    input: `PEDIDO:\n${conversationText(messages)}\n\nMEMÓRIA ANTIRREPETIÇÃO:\n${memory || 'Nenhuma.'}`,
    onProgress: progress(onActivity, base) });
  addUsage(usage, result.usage);
  const parsed = parseJson(result.text, { candidates: [] });
  const allCandidates = parsed.candidates || [];
  const deepCandidates = allCandidates.filter(item => clean(item.por_que_so_bella) && clean(item.mecanismo));
  // Se o modelo não preencher os campos profundos em nenhum candidato, não
  // deixamos a lista vazia — usamos o que veio, em vez de travar a etapa.
  const candidates = (deepCandidates.length ? deepCandidates : allCandidates)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0)).slice(0, 5);
  addUsage(usage, await forgeHooks({ apiKey, model, reasoningEffort, candidates, playbook: prompts.hookForge || FALLBACK_HOOK_PLAYBOOK, onActivity }));
  emit(onActivity, { ...base, status: 'done', title: 'Territórios selecionados', detail: 'As ideias mais distintas e ressonantes passaram pelo filtro antirrepetição.', metrics: [{ label: 'ideias finais', value: candidates.length }] });
  const text = candidates.map((item, index) => [
    `${index + 1}. Tema: ${item.theme}`,
    `Título: ${item.title}`,
    item.estado_emocional && `Estado emocional: ${item.estado_emocional}`,
    item.tipo_gancho && `Tipo de gancho: ${item.tipo_gancho}`,
    item.por_que_prende && `Por que prende: ${item.por_que_prende}${item.gatilhos?.length ? ` · Gatilhos: ${item.gatilhos.join(' + ')}` : ''}`,
    item.outras_versoes?.length && `Outras versões do gancho: ${item.outras_versoes.join(' | ')}`,
    item.territorio && `Território: ${item.territorio}`,
    item.motor_narrativo && `Motor narrativo: ${item.motor_narrativo}`,
    item.abertura_de_loop && `Loop aberto: ${item.abertura_de_loop}`,
    item.cena_humana && `Cena humana: ${item.cena_humana}`,
    item.confissao_silenciosa && `Confissão silenciosa: ${item.confissao_silenciosa}`,
    item.acordo_invisivel && `Acordo invisível: ${item.acordo_invisivel}`,
    item.custo_real && `Custo real: ${item.custo_real}`,
    item.mecanismo && `Mecanismo: ${item.mecanismo}`,
    item.virada && `Virada: ${item.virada}`,
    item.ponte_tafa && `Ponte T.A.F.A: ${item.ponte_tafa}`,
    item.por_que_so_bella && `Por que só a Bella: ${item.por_que_so_bella}`,
    item.relevancia && `Relevância: ${item.relevancia}/10${item.nivel_consciencia ? ` · Consciência: ${item.nivel_consciencia}` : ''}`,
    `Universo visual: ${item.visual_world}`,
  ].filter(Boolean).join('\n')).join('\n\n');
  return { text, usage, stages: ['ideation'], brief: { research_mode: 'dispensable' } };
}

export async function runEditorialOrchestration({ apiKey, model, reasoningEffort, messages, totalSlides = 5, memory = '', visualDirection = '', prompts = {}, onStage = () => {}, onActivity = () => {} }) {
  const usage = { input_tokens: 0, output_tokens: 0 }; const stages = [];
  onStage('strategy', 'Definindo Big Idea, tensão e arco de percepção'); stages.push('strategy');
  const strategyBase = { id: 'strategy', agent: 'Arquiteto de Percepção', collaborators: ['Oráculo Bella', 'Gancho Viral'], title: 'Desenhando a mudança de percepção', detail: 'Define o que a leitora acredita antes, o que descobre e por que isso importa.' };
  emit(onActivity, { ...strategyBase, status: 'working', elapsedSeconds: 0 });
  const strategyResult = await callResponses({ apiKey, model, reasoningEffort, maxOutputTokens: 5000,
    instructions: `${ORACULO_UNICO ? (prompts.strategist || '') : `${prompts.master || ''}\n\n${prompts.strategist || ''}\n${prompts.hooks || ''}`}\nResponda apenas em JSON válido: {"selected_big_idea":"","territory":"","old_belief":"","new_perception":"","emotional_arc":[],"narrative_mechanism":"","opening_loop":"","stakes":"","visual_law":"","research_mode":"required|useful|dispensable","research_question":"","anti_repetition_changes":[]}. Pesquisa é required apenas quando a tese depende de ciência, lei, história, notícia, número ou comparação verificável. Escolha um arco da Parte 7 e um motor narrativo coerente. Pai, mãe, infância, família e sintomas só entram quando forem causalmente indispensáveis; não fixe S3 nem qualquer outra posição em corpo ou validação.`,
    input: `CONVERSA:\n${conversationText(messages)}\n\nMEMÓRIA:\n${memory || 'Nenhuma.'}\n\nQUANTIDADE: ${totalSlides} lâminas.`,
    onProgress: progress(onActivity, strategyBase) });
  addUsage(usage, strategyResult.usage); const brief = parseJson(strategyResult.text, {});
  emit(onActivity, { ...strategyBase, status: 'done', title: 'Arco editorial definido', detail: brief.selected_big_idea || 'Big Idea e progressão aprovadas.' });

  let research = { sources: [], text: '' };
  if (brief.research_mode === 'required') {
    onStage('research', 'Verificando a base factual necessária'); stages.push('research');
    const researchBase = { id: 'research', agent: 'Pesquisador', collaborators: ['Verificador de Fatos'], title: 'Pesquisando apenas o que sustenta a tese', detail: 'Busca fontes primárias ou institucionais e separa fato, interpretação e metáfora.' };
    emit(onActivity, { ...researchBase, status: 'working', elapsedSeconds: 0 });
    const researchResult = await callResponses({ apiKey, model, reasoningEffort: 'low', webSearch: true, maxOutputTokens: 4500,
      instructions: `${prompts.researcher || ''}\nPesquise a pergunta dada. Entregue fatos verificáveis, limites e o que não pode ser afirmado. Não procure validação para metáforas emocionais.`,
      input: brief.research_question || brief.selected_big_idea, onProgress: progress(onActivity, researchBase) });
    addUsage(usage, researchResult.usage); research = { text: researchResult.text, sources: researchResult.sources };
    emit(onActivity, { ...researchBase, status: 'done', title: 'Base factual verificada', detail: 'A copy receberá apenas afirmações sustentáveis.', metrics: [{ label: 'fontes', value: research.sources.length }] });
  }

  onStage('writing', 'Escrevendo copy e direção visual como uma peça única'); stages.push('writing');
  const writingBase = { id: 'writing', agent: 'Copywriter Bella', collaborators: ['Diretor Artístico', 'Canalizador Visual'], title: 'Construindo o carrossel completo', detail: 'Cada lâmina responde à anterior, abre um loop específico e muda o ritmo visual.' };
  emit(onActivity, { ...writingBase, status: 'working', elapsedSeconds: 0 });
  const writingResult = await callResponses({ apiKey, model, reasoningEffort, maxOutputTokens: 12000,
    instructions: ORACULO_UNICO
      ? `${prompts.strategist || ''}\n\n${prompts.artDirector || ''}\n${visualDirection}\nMODO PRODUÇÃO. Produza exatamente ${totalSlides} lâminas seguindo o arco adaptativo escolhido na Parte 7 e o formato da Parte 9. Não reserve posição para corpo, infância, validação ou lista. Entregue somente as lâminas, depois CAPTION e CTA TRIBAL, sem análise, plano de arte, big idea ou auditoria. O BRIEF APROVADO abaixo é seu ponto de partida. Toda lâmina tem TÍTULO e CORPO por extenso. Cada lâmina responde algo e abre a tensão seguinte; a virada deve alterar a leitura, não apenas renomeá-la. O campo VISUAL segue o Diretor Artístico acima e nasce da mesma ideia da copy; cumpra o CONTRATO TÉCNICO DAS LÂMINAS acima (plano de layouts e DIREÇÃO_JSON em cada lâmina); não repita metáforas, cenas, pronomes, cadências ou construções da memória.`
      : `${prompts.master || ''}\n\n${prompts.strategist || ''}\n\n${prompts.copywriter || ''}\n${prompts.artDirector || ''}\n${visualDirection}\nProduza exatamente ${totalSlides} lâminas. O BRIEF APROVADO abaixo já decidiu praça, big idea, arco e gancho — não repita esse raciocínio, vá direto para a Partitura Emocional (breve) e o ROTEIRO OFICIAL. O ROTEIRO OFICIAL é a entrega principal: TODA lâmina precisa ter TÍTULO e CORPO com texto completo escrito por extenso, no formato exato "[SX — ESTADO | layout: LAYOUT]" seguido de TÍTULO:/CORPO:/CENA:/RESPIRO:/VISUAL: em linhas próprias — nunca entregue uma lâmina só com estado e layout, sem título e corpo escritos. Não explique seu processo fora das seções pedidas. A copy e o visual devem nascer da mesma ideia. Varie o ritmo; não use papel fixo para S3; não repita metáforas, cenas ou construções da memória.`,
    input: `PEDIDO:\n${conversationText(messages)}\n\nBRIEF APROVADO:\n${JSON.stringify(brief)}\n\nPESQUISA:\n${research.text || 'Dispensada.'}\n\nMEMÓRIA ANTIRREPETIÇÃO:\n${memory || 'Nenhuma.'}`,
    onProgress: progress(onActivity, writingBase) });
  addUsage(usage, writingResult.usage);
  emit(onActivity, { ...writingBase, status: 'done', title: 'Primeira versão concluída', detail: `${totalSlides} lâminas integradas entre copy, imagem e ritmo.`, metrics: [{ label: 'lâminas', value: totalSlides }] });

  // No modo Oráculo único a reescrita do revisor fica de fora: ela suavizava títulos e ganchos.
  if (ORACULO_UNICO) return { text: stripScorecard(writingResult.text), usage, stages, brief, research };

  onStage('review', 'Revisando precisão, ritmo e originalidade'); stages.push('review');
  const reviewBase = { id: 'review', agent: 'Oráculo Revisor', collaborators: ['Verificador de Fatos', 'Diretor Artístico'], title: 'Executando controle de qualidade', detail: 'Corrige clichês, repetições, excesso de texto, quebras de formato e incoerência visual.' };
  emit(onActivity, { ...reviewBase, status: 'working', elapsedSeconds: 0 });
  const reviewResult = await callResponses({ apiKey, model, reasoningEffort: 'medium', maxOutputTokens: 12000,
    instructions: `${prompts.strategist || ''}\n\n${prompts.reviewer || ''}\nRevise o material abaixo e devolva somente a versão final completa. Preserve exatamente ${totalSlides} slides, todas as tags obrigatórias e o CTA COMENTE BELLA. Elimine clichês, títulos truncados, S3 corporal automático, imagens genéricas, objetos literais sem tensão e cenas que poderiam pertencer a qualquer copy. Garanta que o universo visual seja coerente, porém não engessado.`,
    input: writingResult.text, onProgress: progress(onActivity, reviewBase) });
  addUsage(usage, reviewResult.usage);
  emit(onActivity, { ...reviewBase, status: 'done', title: 'Conteúdo aprovado pelo controle de qualidade', detail: 'Roteiro, design narrativo e formato foram verificados.' });
  return { text: stripScorecard(reviewResult.text) || writingResult.text, usage, stages, brief, research };
}
