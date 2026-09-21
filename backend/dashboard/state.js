import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { logger } from "./logger.js";

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('[AUTH]', '❌ JWT_SECRET não definido em produção — encerrando servidor por segurança.');
    process.exit(1);
  }
  logger.warn('[AUTH]', '⚠️  JWT_SECRET não definido. Usando chave temporária (APENAS para desenvolvimento).');
  return "fonte-oculta-dev-secret-CHANGE-ME";
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Gera um token JWT contendo payload do usuário
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verifica e decodifica o token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const IS_PROD = process.env.NODE_ENV === "production";

let b2Instance = null;
try {
  b2Instance = await import("./b2.js");
  logger.info('[B2]', 'Módulo B2/MinIO carregado com sucesso');
} catch (err) {
  logger.error('[B2]', 'Erro ao carregar módulo B2/MinIO:', err);
}
export { b2Instance as b2 };

function loadClientConfig() {
  try {
    const p = path.join(__dirname, '..', 'client.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch (e) {
    logger.error('[CONFIG]', 'Erro ao carregar client.json:', e);
  }
  return null;
}
export const CLIENT = loadClientConfig();

export const DATA_FILE = path.join(__dirname, "data", "carousels.json");
export const PUBLIC_DIR = IS_PROD
  ? path.join(__dirname, "..", "..", "frontend", "dist")  // Em produção: build compilado pelo Dockerfile
  : path.join(__dirname, "..", "..", "frontend", "dist"); // Em dev: também usa o dist (nginx serve em dev)
export const COMPOSE_SCRIPT = path.join(__dirname, "..", "core", "util", "compose-slide.py");
export const REGEN_SCRIPT = path.join(__dirname, "..", "regen-slide.py");
export const REELS_HISTORY_FILE = path.join(__dirname, "data", "reels_history.json");
export const ZIP_SCRIPT = path.join(__dirname, "..", "zip-carousels.py");

export const generationJobs = new Map();
export const sseClients = new Set();

// Re-exporta funções de segurança e hashing de senhas (Argon2id + Pepper + Validação)
export { 
  hashPassword, 
  verifyPassword, 
  validatePasswordComplexity, 
  hashPasswordLegacy,
  getPepper
} from "./passwordSecurity.js";

// Helper para obter e-mail do Super Admin
export function getSuperAdminEmail() {
  return process.env.DASHBOARD_USER || 'jordao';
}

// Helper para verificar se um e-mail pertence ao Super Admin
export function isUserSuperAdmin(email) {
  const superAdminUser = getSuperAdminEmail();
  const secondAdminEnabled = !!process.env.DASHBOARD_PASS2;
  return email === superAdminUser || (secondAdminEnabled && (email === 'afonteoculta@gmail.com' || email === 'afonteoculta'));
}

// Auth middleware
export function requireAuth(req, res, next) {
  const publicPaths = [
    '/login.html', '/login',
    '/auth/login', '/auth/logout',
    '/api/settings/branding',
    '/register.html', '/register',
    '/api/users/register'
  ];
  if (publicPaths.includes(req.path)) return next();

  if (req.path.startsWith('/api/users/invitations/') && req.path.endsWith('/verify')) {
    return next();
  }

  // Permite acesso a imagens da biblioteca e geradas
  if (req.path.match(/^\/api\/library\/\d+\/image/) || req.path.startsWith('/api/library/generated/')) {
    return next();
  }

  // Se NÃO for uma rota de API (ex: /, /dashboard, arquivos estáticos), permite passar.
  // O React Router no frontend cuidará do roteamento e validação via /api/me.
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  req.user = decoded;
  return next();
}

// Middleware para restringir rotas apenas ao Super Admin
export function requireSuperAdmin(req, res, next) {
  if (req.user && isUserSuperAdmin(req.user.email)) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas o Super Admin tem acesso.' });
}

// Middleware para permitir acesso de Admin ou Super Admin
export function requireAdminOrSuperAdmin(req, res, next) {
  if (req.user && (isUserSuperAdmin(req.user.email) || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Apenas Administradores têm acesso.' });
}

// Memória para armazenar tentativas e limites de Rate Limit
const rateLimitsMap = new Map();

// Coletor de lixo (Garbage Collector) rodando a cada 10 minutos em background
// para apagar IPs expirados e evitar memory leaks em servidores de produção
setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of rateLimitsMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitsMap.delete(key);
    }
  }
}, 600000); // 10 minutos (600.000 ms)

// Middleware de Rate Limit paramétrico
export function rateLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const key = `${ip}:${req.baseUrl || ''}${req.path || ''}`;

    if (!rateLimitsMap.has(key)) {
      rateLimitsMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const limit = rateLimitsMap.get(key);

    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return next();
    }

    limit.count++;
    if (limit.count > maxRequests) {
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
    }

    return next();
  };
}
