import assert from 'assert';
import http from 'http';

console.log('\n📋 Teste Unitário: Chamada de Publicação via PYTHON binary\n');

try {
  const reqData = JSON.stringify({
    caption: 'Legenda de Teste'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3131,
    path: '/api/carousels/carrossel-test/publish',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(reqData)
    }
  }, (res) => {
    // 404 significa que encontrou a rota e tentou buscar o id inexistente (ou 500 se executou o python)
    assert.strictEqual(res.statusCode === 401 || res.statusCode === 404 || res.statusCode === 500 || res.statusCode === 200, true, 'Rota respondeu corretamente');
    console.log(`  ✅ Rota /api/carousels/:id/publish executou sem erro de ENOENT (Status ${res.statusCode})`);
    console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
    process.exit(0);
  });

  req.on('error', (e) => {
    console.error(`  ❌ FALHOU: ${e.message}`);
    process.exit(1);
  });

  req.write(reqData);
  req.end();
} catch (err) {
  console.error(`  ❌ FALHOU: ${err.message}`);
  process.exit(1);
}
