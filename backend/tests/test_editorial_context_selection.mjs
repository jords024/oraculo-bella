import assert from 'node:assert/strict';
import {
  contextualizeThemeSelection,
  detectEditorialMode,
  resolveThemeSelection
} from '../dashboard/services/editorialOrchestrator.js';

const ideas = `1. Tema: O preço de nunca pedir ajuda
Título: A conta invisível de ser indispensável
Por que conecta: revela o custo oculto da autossuficiência.

2. Tema: Descansar sem pedir desculpas
Título: Você não precisa merecer o próprio descanso
Por que conecta: confronta a culpa aprendida.

3. Tema: A filha que virou especialista em clima emocional
Título: Você entra em um lugar e já sabe quem está triste
Por que conecta: dá nome à hipervigilância confundida com maturidade.

4. Tema: Receber também exige coragem
Título: Dar sempre pode ser uma forma de não ser vista
Por que conecta: abre uma contradição íntima.`;

const history = [
  { role: 'user', content: 'Me dê ideias de temas para a Bella' },
  { role: 'assistant', content: ideas },
  { role: 'user', content: 'Quero criar um conteúdo com o tema 3' }
];

assert.equal(detectEditorialMode(history), 'production');
assert.equal(detectEditorialMode([{ role: 'user', content: 'Me dê cinco temas sobre culpa' }]), 'ideas');
assert.equal(detectEditorialMode([{ role: 'user', content: 'Faça o conteúdo sobre a terceira opção' }]), 'production');
assert.equal(detectEditorialMode([{ role: 'user', content: 'quero um conte´do sobre o tema 3' }]), 'production');
assert.equal(detectEditorialMode([{ role: 'user', content: 'tema 3' }]), 'production');

const selected = resolveThemeSelection(history);
assert.equal(selected?.number, 3);
assert.match(selected?.content || '', /especialista em clima emocional/i);
assert.match(selected?.content || '', /hipervigilância confundida com maturidade/i);

const contextualized = contextualizeThemeSelection(history);
const last = contextualized.at(-1)?.content || '';
assert.match(last, /CONTEXTO RESOLVIDO PELO SISTEMA/);
assert.match(last, /tema 3/i);
assert.match(last, /Você entra em um lugar e já sabe quem está triste/i);
assert.match(last, /Não sugira novos temas/i);

console.log('OK — seleção contextual de tema reconhecida e resolvida.');
