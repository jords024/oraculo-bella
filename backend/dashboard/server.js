import "./loadEnv.js";
// dashboard/server.js — Oráculo Manager Content Dashboard
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";
import { initDb } from "./db.js";
import { logger } from "./logger.js";

// Import modules
import { 
  IS_PROD, 
  PUBLIC_DIR, 
  sseClients, 
  requireAuth,
  rateLimiter
} from "./state.js";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import carouselsRouter from "./routes/carousels.js";
import servicesRouter from "./routes/services.js";
import backupsRouter from "./routes/backups.js";
import libraryRouter from "./routes/library.js";
import creatorChatsRouter from "./routes/creatorChats.js";
import { resetBackupScheduler } from "./backupManager.js";

import { initCarouselQueueWorker } from "./services/carouselQueueWorker.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3131;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Garante a existência da pasta persistente de carrosséis
const storageDir = path.join(__dirname, "..", "storage", "carousels");
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
  logger.info('[SERVER]', `Diretório criado: ${storageDir}`);
}

// ── Middleware global de Log de Requisições HTTP ──────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('[HTTP]', `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Necessário para obter IPs reais atrás de um proxy reverso
app.set('trust proxy', 1);

// Configura CORS baseado na variável de ambiente
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Se não houver origin (como apps mobile ou curl) ou se as allowedOrigins estiverem vazias, permite
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true
}));

// Apply global authentication check
app.use(requireAuth);

// ── Rate Limiting por segmento de rota ──────────────────────────────────────────
// 1. Auth/Login: mínimo de 100 requisições por minuto
app.use('/auth', rateLimiter(100, 60000));

// 2. Geração e Backups (carousels, services, backups): mínimo de 100/150/300 requisições por minuto
const carouselsRecomposeLimiter = rateLimiter(600, 60000, '/api/carousels:recompose'); // endpoint interativo de preview
const carouselsMediaLimiter = rateLimiter(300, 60000, '/api/carousels:media');
const carouselsGeneralLimiter = rateLimiter(150, 60000, '/api/carousels:general');
app.use('/api/carousels', (req, res, next) => {
  const isRecompose = /\/recompose$/.test(req.path);
  const isMediaRoute = /\/(image|download)\/|\/meta$/.test(req.path);
  if (isRecompose) return carouselsRecomposeLimiter(req, res, next);
  return isMediaRoute
    ? carouselsMediaLimiter(req, res, next)
    : carouselsGeneralLimiter(req, res, next);
});
app.use('/api/services', rateLimiter(100, 60000));
app.use('/api/backups', rateLimiter(100, 60000));
app.use('/api/library', rateLimiter(150, 60000));

// 3. Outras rotas gerais do dashboard (ex: users, etc): 100 requisições por minuto
app.use('/api/users', rateLimiter(100, 60000));

// 4. Oráculo e Radar: mínimo de 100 requisições por minuto
app.use('/api/oraculo', rateLimiter(100, 60000));
app.use('/api/radar', rateLimiter(100, 60000));

// 5. Criador (geração de IA): 100 requisições por minuto
app.use('/api/criador', rateLimiter(100, 60000));

// 6. Outros endpoints de API sem rate limit anterior: mínimo de 100 requisições por minuto
app.use('/api/escala', rateLimiter(100, 60000));
app.use('/api/events', rateLimiter(100, 60000));

// ── Register Routers ─────────────────────────────────────────────────────────
app.use(authRouter);
app.use(usersRouter);
app.use(carouselsRouter);
app.use(servicesRouter);
app.use(backupsRouter);
app.use(libraryRouter);
app.use(creatorChatsRouter);

app.use(express.static(PUBLIC_DIR, { extensions: ['html', 'htm'] }));

// ── Catch-all SPA — serve index.html para qualquer rota não encontrada ──────
// Necessário para que rotas do frontend (/login, /dashboard, etc) funcionem
// sem o sufixo .html em produção (o React Router cuida do roteamento interno)
// Nota: usa app.use em vez de app.get('*') por compatibilidade com path-to-regexp v8+
app.use((req, res, next) => {
  // Não intercepta rotas de API nem de auth
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) return next();
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// ── Global SSE ─────────────────────────────────────────────────────────────────
app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  sseClients.add(sendEvent);
  req.on("close", () => sseClients.delete(sendEvent));
});

app.post("/api/events/broadcast", (req, res) => {
  sseClients.forEach(send => send(req.body));
  res.json({ ok: true });
});

// ── Cron Job: Publicador Automático ──────────────────────────────────────────
setInterval(async () => {
  try {
    const PUB_SCRIPT = path.join(__dirname, "..", "publisher.py");
    const { stdout } = await execFileAsync("python", ["-X", "utf8", PUB_SCRIPT]);
    if (stdout && stdout.includes("Post:")) {
      logger.info('[CRON]', 'Publicador executou:\n' + stdout);
    }
  } catch (e) {
    if (e.stdout && e.stdout.includes("Post:")) {
       logger.warn('[CRON]', 'Publicador executou (mas retornou código de saída não-zero):\n' + e.stdout);
    }
  }
}, 60000); // Roda a cada 60 segundos

// ── Start ────────────────────────────────────────────────────────────────────
initDb().then(() => {
  resetBackupScheduler();
  initCarouselQueueWorker();
  app.listen(PORT, () => {
    const env = process.env.NODE_ENV || 'development';
    logger.info('[SERVER]', `✅ Oráculo Dashboard iniciado — porta: ${PORT} | ambiente: ${env}`);
  });
}).catch(err => {
  logger.error('[SERVER]', '❌ Falha crítica ao inicializar banco de dados:', err);
  process.exit(1);
});
