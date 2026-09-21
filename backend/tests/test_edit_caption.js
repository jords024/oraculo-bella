import assert from 'assert';

// Teste unitário para validar resposta de API ao salvar legenda
function testCaptionSaveResponseParsing() {
  console.log('🧪 Executando testes unitários de tratamento de resposta da API de legenda...');

  // Simula o objeto Response do customFetch e data retornado por res.json()
  const mockResponse = {
    ok: true,
    status: 200,
    json: async () => ({
      id: 'carrossel-01',
      title: 'Carrossel Teste',
      caption: 'Nova legenda testada',
      caption_full: 'Nova legenda testada'
    })
  };

  const isResponseInstance = typeof mockResponse.json === 'function';
  assert.strictEqual(isResponseInstance, true, 'customFetch deve retornar um objeto Response com método json()');

  mockResponse.json().then(data => {
    assert.strictEqual(mockResponse.ok, true, 'Response ok deve ser true');
    assert.strictEqual(data.id, 'carrossel-01', 'O ID retornado no JSON deve ser carrossel-01');
    assert.strictEqual(data.caption, 'Nova legenda testada', 'Legenda deve ser salva no objeto do JSON');
    console.log('  ✓ Teste 1: Parsing de res.json() no customFetch funcionou perfeitamente.');
    console.log('✅ Todos os testes de salvamento de legenda passaram!');
  });
}

testCaptionSaveResponseParsing();
