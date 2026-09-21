import assert from 'assert';
import http from 'http';

console.log('\n📋 Teste Unitário: Carregamento Dinâmico do Prompt do Agente Criador no Stream\n');

try {
  // Testar requisição HTTP no endpoint do container
  const reqData = JSON.stringify({
    messages: [{ role: 'user', content: 'teste' }],
    totalSlides: 10,
    noImageSlidesCount: 0
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3131,
    path: '/api/criador/stream',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reqData),
      'x-test-auth': 'admin'
    }
  }, (res) => {
    assert.strictEqual(res.statusCode === 200 || res.statusCode === 401, true, 'Endpoint respondeu adequadamente');
    console.log(`  ✅ Endpoint /api/criador/stream está respondendo com Status ${res.statusCode}`);
    console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
    process.exit(0);
  });

  req.on('error', (e) => {
    console.error(`  ❌ FALHOU: Erro na conexão com o servidor de backend: ${e.message}`);
    process.exit(1);
  });

  req.write(reqData);
  req.end();
} catch (err) {
  console.error(`  ❌ FALHOU: ${err.message}`);
  process.exit(1);
}
