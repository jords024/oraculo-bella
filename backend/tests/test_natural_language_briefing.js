import assert from 'assert';
import { parseCarouselText } from '../../frontend/src/utils/carouselParser.js';

// Teste unitário para validar o fluxo de briefing em linguagem natural
function testNaturalLanguageBriefing() {
  console.log('🧪 Executando testes unitários do Briefing em Linguagem Natural...');

  // Texto simulado que a IA gera após o usuário responder as 4 perguntas em linguagem natural
  const mockAIResponse = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRAÇA: MENTE
FORMATO: A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BIG IDEA: A física quântica revela a estrutura do dinheiro.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDES:

[S1 — DISRUPÇÃO | layout: fullbleed]
TÍTULO: O QUE A FÍSICA PROVA SOBRE DINHEIRO
CORPO: Você aprendeu a trabalhar por papel. A física quântica ensina a atrair massa.
VISUAL: Cosmic eye floating over golden particles in dark space.

[S2 — DESCIDA | layout: fullbleed]
TÍTULO: A ILUSÃO DO ESFORÇO
CORPO: Se esforço gerasse riqueza, a pessoa mais cansada seria a mais rica.
VISUAL: Solitary figure standing under a beam of golden light.
`;

  const parsed = parseCarouselText(mockAIResponse);

  assert.strictEqual(parsed.slides.length, 2, 'Deve ter extraído 2 slides');
  assert.strictEqual(parsed.title, 'O QUE A FÍSICA PROVA SOBRE DINHEIRO', 'Deve extrair o título do slide 1');
  assert.strictEqual(parsed.slides[0].num, '01', 'Número do slide 1 deve ser 01');

  console.log('  ✓ Teste 1: parseCarouselText extrai corretamente o roteiro gerado em resposta ao briefing natural.');
  console.log('✅ Todos os testes de Briefing em Linguagem Natural passaram com sucesso!');
}

testNaturalLanguageBriefing();
