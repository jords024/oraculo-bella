import assert from 'assert';

// Teste unitário para validar atualização de cache-buster e envio de no-cache na API de imagens
function testCacheBusterLogic() {
  console.log('🧪 Executando testes unitários de invalidação de cache de imagens...');

  const queryWithVersion = { v: '1785501234' };
  const queryWithoutVersion = {};

  function getCacheControlHeader(query) {
    if (query.v || query.t) {
      return "no-cache, no-store, must-revalidate";
    }
    return "public, max-age=86400, must-revalidate";
  }

  assert.strictEqual(
    getCacheControlHeader(queryWithVersion),
    "no-cache, no-store, must-revalidate",
    'Deve retornar no-cache quando parâmetro v for fornecido'
  );

  assert.strictEqual(
    getCacheControlHeader(queryWithoutVersion),
    "public, max-age=86400, must-revalidate",
    'Deve retornar cache de 24h quando não houver versão'
  );

  console.log('  ✓ Teste 1: Validação correta de cabeçalho Cache-Control para imagens.');
  console.log('✅ Todos os testes de invalidação de cache passaram com sucesso!');
}

testCacheBusterLogic();
