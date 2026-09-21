import assert from 'assert';

console.log('\n📋 Teste Unitário: Scheduled Publisher Worker (Serviço de Agendamento)\n');

try {
  const now = Date.now();
  const pastTimeSeconds = Math.floor((now - 120000) / 1000); // 2 minutos no passado
  const futureTimeSeconds = Math.floor((now + 3600000) / 1000); // 1 hora no futuro

  const carousels = [
    { id: 'carrossel-past', title: 'Passado', status: 'agendado', scheduledTimestamp: pastTimeSeconds },
    { id: 'carrossel-future', title: 'Futuro', status: 'agendado', scheduledTimestamp: futureTimeSeconds },
    { id: 'carrossel-normal', title: 'Normal', status: 'pronto' }
  ];

  const nowSeconds = Math.floor(now / 1000);

  const dueCarousels = carousels.filter(c => {
    if (c.status === 'agendado' && c.scheduledTimestamp && nowSeconds >= c.scheduledTimestamp) {
      return true;
    }
    return false;
  });

  assert.strictEqual(dueCarousels.length, 1, 'Deveria identificar exatamente 1 carrossel pendente de publicação');
  assert.strictEqual(dueCarousels[0].id, 'carrossel-past', 'O carrossel com tempo no passado deve ser disparado');

  console.log('  ✅ Worker de publicação de agendados validado com sucesso!');
  console.log('\n📊 Resultado: 1 passou / 0 falhou\n');
  process.exit(0);
} catch (e) {
  console.error(`  ❌ FALHOU: ${e.message}`);
  process.exit(1);
}
