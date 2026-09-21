import "./loadEnv.js";
// dashboard/workerService.js — Worker Independente de Publicação Agendada & Filas
import { initDb } from "./db.js";
import { logger } from "./logger.js";
import { initScheduledPublisherWorker } from "./services/scheduledPublisherWorker.js";

logger.info('[WORKER-SERVICE]', '🚀 Inicializando serviço independente Oráculo Worker...');

initDb().then(() => {
  initScheduledPublisherWorker();
  logger.info('[WORKER-SERVICE]', '✅ Oráculo Worker Service ativo e monitorando agendamentos!');
}).catch(err => {
  logger.error('[WORKER-SERVICE]', '❌ Falha ao inicializar banco no Oráculo Worker:', err);
  process.exit(1);
});
