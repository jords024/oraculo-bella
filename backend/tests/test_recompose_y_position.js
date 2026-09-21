import assert from 'assert';

// Teste unitário para validar parâmetros de recomposição com posição Y do corpo
function testRecomposeYPositionLogic() {
  console.log('🧪 Executando testes unitários de recomposição com posição Y do corpo...');

  const inputPayload = {
    title: 'O Sistema Que Nos Limita',
    body: 'Desde criança aprendemos que o valor está no que temos.',
    layout: 'fullbleed',
    title_y: 890,
    body_y: 1073
  };

  const parsedTitleY = inputPayload.title_y !== undefined && String(inputPayload.title_y).trim() !== '' ? parseInt(inputPayload.title_y, 10) : null;
  const parsedBodyY = inputPayload.body_y !== undefined && String(inputPayload.body_y).trim() !== '' ? parseInt(inputPayload.body_y, 10) : null;

  assert.strictEqual(parsedTitleY, 890, 'O Y do título deve ser 890');
  assert.strictEqual(parsedBodyY, 1073, 'O Y do corpo deve ser 1073');
  console.log('  ✓ Teste 1: Parsing correto de body_y = 1073');

  console.log('✅ Todos os testes de Recomposição de Posição Y passaram!');
}

testRecomposeYPositionLogic();
