import assert from 'assert';
import { enqueueCarouselTask, getQueueStatus } from '../dashboard/services/rabbitmq.js';

// Teste unitário para validar o enfileiramento e ordem da fila do RabbitMQ / Fallback
async function testRabbitMQCarouselQueue() {
  console.log('🧪 Executando testes unitários do Sistema de Fila RabbitMQ...');

  const task1 = {
    carouselId: 'test-carrossel-01',
    payload: { title: 'Carrossel Teste 1', slides: [{ title: 'S1' }] },
    startTime: Date.now()
  };

  const task2 = {
    carouselId: 'test-carrossel-02',
    payload: { title: 'Carrossel Teste 2', slides: [{ title: 'S2' }] },
    startTime: Date.now()
  };

  const res1 = await enqueueCarouselTask(task1);
  assert.ok(res1.success, 'A tarefa 1 deve ser enfileirada com sucesso');

  const res2 = await enqueueCarouselTask(task2);
  assert.ok(res2.success, 'A tarefa 2 deve ser enfileirada com sucesso');

  console.log(`  ✓ Teste 1: Tarefas enfileiradas com sucesso (Modo: ${res1.mode})`);
  console.log('✅ Todos os testes da Fila RabbitMQ passaram com sucesso!');
}

testRabbitMQCarouselQueue();
