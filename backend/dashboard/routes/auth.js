import express from "express";
import crypto from "crypto";
import { query } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  getSuperAdminEmail,
  isUserSuperAdmin,
  generateToken
} from "../state.js";
import { logger } from '../logger.js';

const router = express.Router();

// Comparação em tempo constante para não vazar a senha por diferença de tempo de resposta.
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// ── Rotas de Auth ─────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. Super Admin definido só por variáveis de ambiente. Não existe senha padrão no código:
  // se DASHBOARD_PASS (ou DASHBOARD_PASS2) não estiver definida, esse acesso fica desligado.
  const superAdminUser = getSuperAdminEmail();
  const superAdminPass = process.env.DASHBOARD_PASS;
  const secondAdminPass = process.env.DASHBOARD_PASS2;

  const isSuper = (!!superAdminPass && username === superAdminUser && safeEqual(password, superAdminPass)) ||
                  (!!secondAdminPass && (username === 'afonteoculta@gmail.com' || username === 'afonteoculta') && safeEqual(password, secondAdminPass));

  if (isSuper) {
    const payload = {
      user: username,
      userName: 'Super Admin',
      email: username,
      role: 'admin'
    };
    const token = generateToken(payload);
    return res.json({
      token,
      user: {
        name: 'Super Admin',
        email: username,
        role: 'admin',
        isSuperAdmin: true
      }
    });
  }

  // 2. Verifica contra o banco de dados (tabela dashboard_users) com Argon2id + Pepper e rehash automático
  try {
    const dbUserRes = await query(
      "SELECT * FROM dashboard_users WHERE email = $1",
      [username]
    );

    if (dbUserRes.rows.length > 0) {
      const u = dbUserRes.rows[0];
      const { valid, needsRehash } = await verifyPassword(u.password, password);

      if (valid) {
        // Se a senha foi autenticada via formato legado, migra de forma transparente para Argon2id + Pepper
        if (needsRehash) {
          try {
            const upgradedHash = await hashPassword(password);
            await query("UPDATE dashboard_users SET password = $1 WHERE id = $2", [upgradedHash, u.id]);
            logger.info('[Auth]', `Senha do usuário ${u.email} atualizada automaticamente para Argon2id + Pepper.`);
          } catch (rehashErr) {
            logger.error('[Auth]', `Erro ao rehashear senha legada para Argon2id:`, rehashErr?.message);
          }
        }

        const payload = {
          user: u.email,
          userName: u.name,
          email: u.email,
          role: u.role
        };
        const token = generateToken(payload);
        return res.json({
          token,
          user: {
            name: u.name,
            email: u.email,
            role: u.role,
            isSuperAdmin: false
          }
        });
      }
    }
  } catch (err) {
    logger.error('[Auth]', "Erro ao validar login no banco:", err);
  }

  return res.status(401).json({ detail: "Usuário ou senha incorretos." });
});

router.get('/auth/logout', (req, res) => {
  res.json({ success: true, message: "Desconectado com sucesso. Remova o token localmente." });
});

// Obter usuário atual logado
router.get('/api/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  const email = req.user.email || req.user.user;
  const isSuper = isUserSuperAdmin(email);
  
  let permissions = {};
  if (isSuper) {
    permissions = {
      carrosseis: 'liberado',
      criador: 'liberado',
      calendario: 'liberado',
      biblioteca: 'liberado',
      financeiro: 'liberado',
      reels: 'liberado',
      fabrica: 'liberado',
      oraculo: 'liberado',
      radar: 'liberado'
    };
  } else {
    try {
      const dbUserRes = await query("SELECT permissions FROM dashboard_users WHERE email = $1", [email]);
      if (dbUserRes.rows.length > 0) {
        permissions = dbUserRes.rows[0].permissions || {};
      }
    } catch (err) {
      logger.error('[Auth]', "Erro ao buscar permissões do usuário:", err);
    }
  }

  res.json({
    name: isSuper ? (process.env.DASHBOARD_USER_NAME || 'Super Admin') : (req.user.userName || email),
    email: email,
    isSuperAdmin: isSuper,
    role: isSuper ? 'admin' : (req.user.role || 'user'),
    permissions
  });
});

export default router;
