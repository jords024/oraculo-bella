import amqp from 'amqplib';
import { logger } from '../logger.js';

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'oraculo_user';
const RABBITMQ_PASS = process.env.RABBITMQ_PASS || 'oraculo_pass_123';

const QUEUE_NAME = 'carousel_generation_queue';
const CONNECTION_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

let connection = null;
let channel = null;
let isConnecting = false;
const inMemoryQueue = [];
let isInMemoryProcessing = false;
let globalConsumerCallback = null;

export async function getRabbitChannel() {
  if (channel) return channel;
  if (isConnecting) return null;

  isConnecting = true;
  try {
    logger.info('[RabbitMQ]', `Conectando ao RabbitMQ em ${RABBITMQ_HOST}:${RABBITMQ_PORT}...`);
    connection = await amqp.connect(CONNECTION_URL);
    
    connection.on('error', (err) => {
      logger.error('[RabbitMQ]', 'Erro na conexão RabbitMQ:', err.message);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      logger.warn('[RabbitMQ]', 'Conexão com RabbitMQ fechada. Tentando reconectar...');
      channel = null;
      connection = null;
    });

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.prefetch(1); // Concorrência 1 a 1 (apenas 1 por vez!)
    logger.info('[RabbitMQ]', `✓ Canal RabbitMQ criado e fila '${QUEUE_NAME}' assertada com prefetch(1).`);
    
    // Se havia um consumidor registrado, re-subscrever
    if (globalConsumerCallback) {
      await setupCarouselQueueConsumer(globalConsumerCallback);
    }
    
    // Processar itens do fallback em memória se houver
    flushInMemoryQueueToRabbit();

    isConnecting = false;
    return channel;
  } catch (err) {
    logger.warn('[RabbitMQ]', `RabbitMQ indisponível (${err.message}). Usando fila em memória.`);
    isConnecting = false;
    return null;
  }
}

async function flushInMemoryQueueToRabbit() {
  if (!channel || inMemoryQueue.length === 0) return;
  logger.info('[RabbitMQ]', `Enviando ${inMemoryQueue.length} tarefas salvas no fallback para o RabbitMQ...`);
  while (inMemoryQueue.length > 0) {
    const item = inMemoryQueue.shift();
    try {
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(item)), { persistent: true });
    } catch (e) {
      inMemoryQueue.unshift(item);
      break;
    }
  }
}

// ── Enfileirar tarefa de geração de carrossel ──────────────────────────────────
export async function enqueueCarouselTask(taskData) {
  const ch = await getRabbitChannel();
  if (ch) {
    try {
      ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(taskData)), { persistent: true });
      logger.info('[RabbitMQ]', `[Enfileirado] Carrossel ${taskData.carouselId} publicado no RabbitMQ.`);
      return { success: true, mode: 'rabbitmq' };
    } catch (err) {
      logger.error('[RabbitMQ]', 'Erro ao publicar no RabbitMQ:', err.message);
    }
  }

  // Fallback in-memory se RabbitMQ estiver indisponível
  inMemoryQueue.push(taskData);
  logger.info('[RabbitMQ]', `[Fallback] Carrossel ${taskData.carouselId} adicionado à fila em memória. Posição: #${inMemoryQueue.length}`);
  triggerInMemoryConsumer();
  return { success: true, mode: 'in_memory', queuePosition: inMemoryQueue.length };
}

// ── Consumidor sequencial de carrosséis ───────────────────────────────────────
export async function setupCarouselQueueConsumer(consumerCallback) {
  globalConsumerCallback = consumerCallback;
  const ch = await getRabbitChannel();
  if (!ch) return;

  try {
    ch.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      try {
        const taskData = JSON.parse(msg.content.toString());
        logger.info('[RabbitMQ]', `[Consumindo] Iniciando tarefa do carrossel ${taskData.carouselId}...`);
        
        await consumerCallback(taskData, () => {
          try { ch.ack(msg); } catch (e) {}
        }, (requeue = false) => {
          try { ch.nack(msg, false, requeue); } catch (e) {}
        });
      } catch (err) {
        logger.error('[RabbitMQ]', 'Erro ao processar mensagem do RabbitMQ:', err.message);
        ch.ack(msg);
      }
    }, { noAck: false });

    logger.info('[RabbitMQ]', '✓ Consumidor registrado no RabbitMQ com sucesso.');
  } catch (err) {
    logger.error('[RabbitMQ]', 'Erro ao registrar consumidor no RabbitMQ:', err.message);
  }
}

async function triggerInMemoryConsumer() {
  if (isInMemoryProcessing || inMemoryQueue.length === 0 || !globalConsumerCallback) return;
  isInMemoryProcessing = true;

  while (inMemoryQueue.length > 0) {
    const taskData = inMemoryQueue[0];
    try {
      await globalConsumerCallback(taskData, () => {
        inMemoryQueue.shift();
      }, (requeue = false) => {
        if (!requeue) inMemoryQueue.shift();
      });
    } catch (err) {
      logger.error('[RabbitMQ-InMemory]', `Erro no consumidor em memória para ${taskData.carouselId}:`, err.message);
      inMemoryQueue.shift();
    }
  }
  isInMemoryProcessing = false;
}

export function getQueueStatus(carouselId) {
  const memIndex = inMemoryQueue.findIndex(item => item.carouselId === carouselId);
  if (memIndex >= 0) {
    return { status: 'queued', position: memIndex + 1 };
  }
  return { status: 'unknown', position: null };
}
