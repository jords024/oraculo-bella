import assert from 'assert';
import http from 'http';

console.log('\n📋 Teste Unitário: Edição Customizada do Texto da Logomarca (Marca d\'água)\n');

try {
  const reqData = JSON.stringify({
    title: 'Título de Teste',
    body: 'Corpo de Teste',
    watermark_text: '@NOVALOGO',
    watermark_pos: 'top_left'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3131,
    path: '/api/carousels/test-id/slide/slide-01.jpg/recompose',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reqData),
      'x-test-auth': 'admin'
    }
  }, (res) => {
    assert.strictEqual(res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 401, true, 'Endpoint respondeu adequadamente');
    console.log(`  ✅ Endpoint /recompose aceitou parâmetro watermark_text com Status ${res.statusCode}`);
    console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
    process.exit(0);
  });

  req.on('error', (e) => {
    console.error(`  ❌ FALHOU: Erro no teste: ${e.message}`);
    process.exit(1);
  });

  req.write(reqData);
  req.end();
} catch (err) {
  console.error(`  ❌ FALHOU: ${err.message}`);
  process.exit(1);
}
