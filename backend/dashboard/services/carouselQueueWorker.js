import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';
import { 
  readDataAsync, 
  writeDataAsync, 
  getSlidesForCarousel, 
  getCarouselById, 
  updateCarouselFields,
  getCarouselCostDetails,
  recordUsageCost
} from '../helpers.js';
import { generationJobs, sseClients, b2 } from '../state.js';
import { enqueueCarouselTask, setupCarouselQueueConsumer } from './rabbitmq.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PROD = process.env.NODE_ENV === 'production';

export function broadcastSSE(data) {
  sseClients.forEach(send => {
    try {
      send(data);
    } catch (e) {}
  });
}

export function initCarouselQueueWorker() {
  logger.info('[QueueWorker]', 'Iniciando worker consumidor de filas de carrosséis...');
  
  setupCarouselQueueConsumer(async (taskData, ack, nack) => {
    const { carouselId, payload, startTime } = taskData;
    logger.info('[QueueWorker]', `▶ Processando carrossel ${carouselId} da fila...`);

    await updateCarouselFields(carouselId, {
      status: 'generating',
      generationLogs: ['Iniciando pipeline de geração de imagens...'],
      generationError: null
    });

    generationJobs.set(carouselId, {
      id: carouselId,
      title: payload.title || 'Carrossel',
      status: 'generating',
      logs: ['Iniciando pipeline de geração de imagens via Fila RabbitMQ...'],
      slides: [],
      totalSlides: payload.slides?.length || 10,
      startedAt: startTime || Date.now(),
    });

    broadcastSSE({ type: 'status_change', id: carouselId, status: 'generating' });
    broadcastSSE({ type: 'log', msg: `⚙️ [Fila] Iniciando geração do carrossel ${carouselId}` });

    const PYTHON = process.platform === 'win32' ? 'python' : 'python3';
    const scriptName = process.env.USE_MOCK_GENERATOR === 'true' ? 'generate_mock_slides.py' : 'criador_pipeline.py';
    const PIPELINE = path.join(__dirname, '..', '..', 'core', scriptName);

    const spawnPayload = {
      ...payload,
      // Vincula arquivos e metadados ao mesmo ID exibido no dashboard.
      id: carouselId,
      slides: payload.slides ? payload.slides.map(s => ({ ...s })) : [],
      // A fila é a única responsável pelo registro no dashboard. Sem esta
      // marca, o pipeline local também criava outro ID para o mesmo carrossel.
      skipRegister: true,
      // "Recriar" deve aplicar a direção atual, não recuperar imagens brutas
      // de uma tentativa anterior como se fossem um checkpoint desta sessão.
      forceRegenerate: Boolean(taskData.isRetry),
    };

    // ── Forçamento estrito de slides de fundo preto (text_only) ──────────────
    // Se o usuário solicitou N slides de fundo preto, garantir exatamente N.
    if (taskData.noImageSlidesCount > 0 && spawnPayload.slides && spawnPayload.slides.length > 0) {
      const totalS = spawnPayload.slides.length;
      const target = Math.min(taskData.noImageSlidesCount, totalS);

      // Contar quantos a IA já marcou como text_only
      const currentTextOnly = spawnPayload.slides.filter(s => s.layout === 'text_only').length;

      if (currentTextOnly < target) {
        // Precisamos converter mais slides para text_only.
        // Ordem de prioridade de candidatos: PS > CTA > Síntese > slides do fim para o início
        const priority = ['PS', 'CTA', 'SINTESE', 'REFLEXÃO', 'SETUP'];
        const candidates = [];

        // Primeiro: slides com estado prioritário que ainda têm imagem
        for (const p of priority) {
          spawnPayload.slides.forEach((s, i) => {
            if (s.layout !== 'text_only' && s.estado?.toUpperCase().includes(p)) {
              candidates.push(i);
            }
          });
        }

        // Depois: slides do fim para o início que ainda têm imagem
        for (let i = totalS - 1; i >= 0; i--) {
          if (!candidates.includes(i) && spawnPayload.slides[i].layout !== 'text_only') {
            candidates.push(i);
          }
        }

        let remaining = target - currentTextOnly;
        for (const idx of candidates) {
          if (remaining <= 0) break;
          spawnPayload.slides[idx].layout = 'text_only';
          remaining--;
        }

      } else if (currentTextOnly > target) {
        // A IA gerou mais text_only do que o pedido — restaurar alguns para 'fullbleed'
        let excess = currentTextOnly - target;
        for (let i = totalS - 1; i >= 0 && excess > 0; i--) {
          if (spawnPayload.slides[i].layout === 'text_only') {
            spawnPayload.slides[i].layout = 'fullbleed';
            excess--;
          }
        }
      }

      logger.info('[QueueWorker]', `Distribuição final: ${spawnPayload.slides.filter(s => s.layout === 'text_only').length} slides fundo preto de ${totalS} totais (pedido: ${target})`);
    }

    return new Promise((resolve) => {
      let settled = false;
      const generatedSlides = [];
      let donePayload = null;
      let pipelineError = null;
      const persistentLogs = ['Iniciando pipeline de geração de imagens...'];

      const failToStart = async (err) => {
        if (settled) return;
        settled = true;
        const durationSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
        logger.error('[QueueWorker]', `Falha ao iniciar o pipeline para ${carouselId}: ${err.message}`);
        const job = generationJobs.get(carouselId);
        if (job) {
          job.status = 'error';
          job.logs.push(`[ERRO] Não foi possível iniciar a geração: ${err.message}`);
        }
        persistentLogs.push(`[ERRO] Não foi possível iniciar a geração: ${err.message}`);
        await updateCarouselFields(carouselId, {
          status: 'rascunho',
          generationTimeSeconds: durationSeconds,
          generationDuration: `${durationSeconds}s`,
          generationLogs: persistentLogs,
          generationError: err.message
        });
        generationJobs.delete(carouselId);
        broadcastSSE({
          type: 'done',
          carouselId,
          status: 'rascunho',
          error: 'Não foi possível iniciar a geração. Use Recriar para tentar novamente.'
        });
        ack();
        resolve();
      };

      let child;
      try {
        child = spawn(PYTHON, ['-X', 'utf8', PIPELINE, '--data-stdin'], {
          shell: false,
          cwd: path.join(__dirname, '..', '..'),
          env: {
            ...process.env,
            PYTHONPATH: [
              path.join(__dirname, '..', '..'),
              path.join(__dirname, '..', '..', 'python_packages'),
            ].join(process.platform === 'win32' ? ';' : ':'),
          },
        });
        child.stdin.end(JSON.stringify(spawnPayload));
      } catch (err) {
        void failToStart(err);
        return;
      }

      // Em falhas de criação do processo (por exemplo, permissão do sistema),
      // o evento `close` pode não ser emitido. Sem este tratamento, a interface
      // ficava em “gerando” indefinidamente.
      child.on('error', failToStart);

      child.stdout?.on('data', (buf) => {
        const text = buf.toString();
        text.split('\n').forEach(line => {
          if (!line.trim()) return;
          logger.info('[Generator-stdout]', line);
          persistentLogs.push(line);
          const job = generationJobs.get(carouselId);
          if (job) job.logs.push(line);
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === 'slide' && parsed.status === 'ok' && parsed.file) {
              const filename = path.basename(parsed.file);
              if (!generatedSlides.some(s => s.filename === filename)) {
                generatedSlides.push({ num: parsed.num, estado: parsed.estado, filename });
              }
            }
            if (parsed.type === 'done') {
              donePayload = parsed;
            }
            if (parsed.type === 'error') {
              pipelineError = parsed.msg || 'Falha não identificada no pipeline';
            }
            if (parsed.type === 'slide_ready' && parsed.slide) {
              if (job && !job.slides.includes(parsed.slide)) {
                job.slides.push(parsed.slide);
              }
              broadcastSSE({ type: 'slide_ready', carouselId, slide: parsed.slide, slideIndex: parsed.slideIndex });
            }
          } catch (e) {}
        });
      });

      child.stderr?.on('data', (buf) => {
        const text = buf.toString();
        text.split('\n').forEach(line => {
          if (!line.trim()) return;
          logger.warn('[Generator-stderr]', line);
          persistentLogs.push(`[ERR] ${line}`);
          const job = generationJobs.get(carouselId);
          if (job) job.logs.push(`[ERR] ${line}`);
        });
      });

      child.on('close', async (code) => {
        if (settled) return;
        settled = true;
        const durationSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
        const mins = Math.floor(durationSeconds / 60);
        const secs = durationSeconds % 60;
        const durationFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

        logger.info('[QueueWorker]', `✓ Processo finalizado para ${carouselId} com código ${code}. Duração: ${durationFormatted}`);

        const cRecord = await getCarouselById(carouselId);
        let finalStatus = 'rascunho';
        if (cRecord) {
          if (donePayload?.slides_dir) {
            cRecord.slidesDir = donePayload.slides_dir;
          }
          let slides = getSlidesForCarousel(cRecord);
          if (slides.length === 0 && generatedSlides.length > 0) {
            slides = generatedSlides.map(s => s.filename);
          }
          const isAllOk = code === 0 && donePayload && donePayload.total_ok === donePayload.total && slides.length > 0;
          finalStatus = isAllOk ? 'pronto' : 'rascunho';

          // Calcular custo das imagens geradas neste processamento
          const costDetails = getCarouselCostDetails(cRecord);
          const isRetry = Boolean(taskData.isRetry || (cRecord.retryCount && cRecord.retryCount > 0));
          const currentBatchCostUsd = Number(costDetails.cost) || 0;
          const currentBatchCostBrl = currentBatchCostUsd * 5.0;

          const updatedTotalCostUsd = (Number(cRecord.totalCostUsd) || 0) + (isRetry ? currentBatchCostUsd : currentBatchCostUsd);
          const updatedTotalCostBrl = updatedTotalCostUsd * 5.0;
          const updatedRetryCount = isRetry ? ((cRecord.retryCount || 0) + 1) : (cRecord.retryCount || 0);

          await updateCarouselFields(carouselId, {
            slidesDir: donePayload?.slides_dir || cRecord.slidesDir,
            totalSlides: slides.length,
            slides: slides,
            status: finalStatus,
            generationTimeSeconds: durationSeconds,
            generationDuration: durationFormatted,
            generationLogs: persistentLogs,
            generationError: finalStatus === 'pronto'
              ? null
              : (pipelineError || (code !== 0 ? `Pipeline encerrado com código ${code}` : 'Nenhum slide foi concluído')),
            totalCostUsd: updatedTotalCostUsd,
            totalCostBrl: updatedTotalCostBrl,
            retryCount: updatedRetryCount
          });

          // Registrar no extrato financeiro (usage_costs)
          await recordUsageCost({
            type: isRetry ? 'carousel_retry' : 'carousel_generation',
            itemId: carouselId,
            description: `${isRetry ? 'Recriação' : 'Geração'} de ${costDetails.paidSlides} slides para "${cRecord.title || 'Carrossel'}"`,
            model: cRecord.imageProvider || 'gpt-image-2',
            provider: cRecord.imageProvider || 'openai',
            costUsd: currentBatchCostUsd,
            costBrl: currentBatchCostBrl,
            quantity: costDetails.paidSlides,
            metadata: {
              title: cRecord.title,
              theme: cRecord.theme,
              totalSlides: slides.length,
              paidSlides: costDetails.paidSlides,
              freeSlides: costDetails.freeSlides,
              isRetry
            }
          });
        }

        generationJobs.delete(carouselId);

        broadcastSSE({ 
          type: 'done', 
          carouselId, 
          status: finalStatus, 
          generationDuration: durationFormatted, 
          generationTimeSeconds: durationSeconds 
        });

        ack(); // Confirma a conclusão da mensagem ao RabbitMQ para liberar o próximo da fila!
        resolve();
      });
    });
  });
}
