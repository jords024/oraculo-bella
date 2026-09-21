import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from '../logger.js';
import { readDataAsync, writeDataAsync, updateCarouselFields } from '../helpers.js';
import { sseClients } from '../state.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON = process.platform === 'win32' ? 'python' : 'python3';

export function broadcastSSE(data) {
  sseClients.forEach(send => {
    try {
      send(data);
    } catch (e) {}
  });
}

/**
 * Worker de Serviço para Publicar / Verificar Carrosséis Agendados.
 * Roda periodicamente a cada 60 segundos buscando carrosséis no banco de dados.
 */
export function initScheduledPublisherWorker(intervalMs = 60000) {
  logger.info('[ScheduledWorker]', `🚀 Iniciando Worker de Carrosséis Agendados (Intervalo: ${intervalMs / 1000}s)...`);

  const checkAndPublishScheduledCarousels = async () => {
    try {
      const all = await readDataAsync();
      const now = Date.now();
      const nowSeconds = Math.floor(now / 1000);

      // Filtra carrosséis que estão no status "agendado", "pronto" ou "aprovado" com agendamento pendente
      const pendingCarousels = all.filter(c => {
        if (c.status === 'agendado') return true;
        if ((c.status === 'pronto' || c.status === 'aprovado') && (c.scheduledTimestamp || c.scheduledDate)) {
          return true;
        }
        return false;
      });

      if (pendingCarousels.length === 0) return;

      for (const carousel of pendingCarousels) {
        let isDue = false;

        if (carousel.scheduledTimestamp) {
          // Se tiver timestamp UNIX gravado, compara diretamente
          if (nowSeconds >= carousel.scheduledTimestamp) {
            isDue = true;
          }
        } else if (carousel.scheduledDate && carousel.scheduledTime) {
          // Modo legados de agendamento por string (data + hora)
          try {
            const timeClean = carousel.scheduledTime.replace('h', ':');
            const targetDate = new Date(`${carousel.scheduledDate}T${timeClean}:00`);
            if (!isNaN(targetDate.getTime()) && now >= targetDate.getTime()) {
              isDue = true;
            }
          } catch (err) {}
        }

        if (isDue) {
          logger.info('[ScheduledWorker]', `⏰ Executando disparo agendado para o carrossel: "${carousel.title}" (ID: ${carousel.id})`);

          const PUBLISH_SCRIPT = path.join(__dirname, '..', '..', 'infra', 'social', 'publish_instagram.py');
          const caption = carousel.caption || '';

          const args = [
            '-X', 'utf8', PUBLISH_SCRIPT,
            '--id', carousel.id
          ];
          if (caption) {
            args.push('--caption', caption);
          }

          try {
            const { stdout, stderr } = await execFileAsync(PYTHON, args, {
              timeout: 300000,
              cwd: path.join(__dirname, '..', '..'),
              env: {
                ...process.env,
                PYTHONPATH: [
                  path.join(__dirname, '..', '..'),
                  path.join(__dirname, '..', '..', 'python_packages'),
                ].join(process.platform === 'win32' ? ';' : ':'),
              }
            });

            logger.info('[ScheduledWorker]', `✅ Disparo efetuado com sucesso para ${carousel.id}:\n${stdout.trim()}`);
            if (stderr) logger.error('[ScheduledWorker]', `Avisos/Stderr para ${carousel.id}:\n${stderr.trim()}`);

            // Atualiza o estado no banco de dados atomicamente e notifica via SSE
            await updateCarouselFields(carousel.id, {
              status: 'publicado',
              publishedAt: new Date().toISOString()
            });

            broadcastSSE({ type: 'status_change', id: carousel.id, status: 'publicado' });
            broadcastSSE({ type: 'toast', message: `🎉 Carrossel "${carousel.title}" foi publicado automaticamente!`, toastType: 'success' });
          } catch (pubErr) {
            const stdoutStr = pubErr.stdout || '';
            const wasPublished = stdoutStr.includes('PUBLICADO COM SUCESSO') || stdoutStr.includes('AGENDADO COM SUCESSO');

            if (wasPublished) {
              // Publicação confirmada no stdout mesmo com exit code != 0
              logger.info('[ScheduledWorker]', `✅ Publicação confirmada no stdout para ${carousel.id} (exit code != 0). Atualizando status...`);
              try {
                await updateCarouselFields(carousel.id, {
                  status: 'publicado',
                  publishedAt: new Date().toISOString()
                });
                broadcastSSE({ type: 'status_change', id: carousel.id, status: 'publicado' });
                broadcastSSE({ type: 'toast', message: `🎉 Carrossel "${carousel.title}" foi publicado automaticamente!`, toastType: 'success' });
              } catch (updateErr) {
                logger.error('[ScheduledWorker]', `Erro ao atualizar status após publicação confirmada ${carousel.id}:`, updateErr.message);
              }
            } else {
              logger.error('[ScheduledWorker]', `❌ Erro ao publicar carrossel agendado ${carousel.id}:`, pubErr.message || pubErr.stderr);

              await updateCarouselFields(carousel.id, { status: 'erro-publicacao' });

              broadcastSSE({ type: 'status_change', id: carousel.id, status: 'erro-publicacao' });
              broadcastSSE({ type: 'toast', message: `⚠️ Falha na publicação agendada do carrossel "${carousel.title}"`, toastType: 'error' });
            }
          }
        }
      }
    } catch (err) {
      logger.error('[ScheduledWorker]', 'Erro durante execução do worker de agendamentos:', err.message);
    }
  };

  // Executa uma vez no boot e configura o loop de intervalo
  checkAndPublishScheduledCarousels();
  const timer = setInterval(checkAndPublishScheduledCarousels, intervalMs);
  return timer;
}
