// backend/dashboard/passwordSecurity.js
// Segurança de Senhas — Argon2id (Memory-Hard contra ataques GPU/ASIC), Pepper secreto e Validador de Complexidade

import argon2 from 'argon2';
import crypto from 'crypto';
import { logger } from './logger.js';

/**
 * Obtém a chave Pepper secreta do ambiente.
 * O Pepper adiciona uma camada de segurança extra mesmo que o banco de dados seja vazado.
 * @returns {string}
 */
export function getPepper() {
  const pepper = process.env.PASSWORD_PEPPER;
  if (!pepper) {
    logger.warn('[AuthSecurity]', 'AVISO: PASSWORD_PEPPER não definido no .env. Usando pepper interno padrão.');
    return 'oraculo_default_internal_pepper_secret_2026';
  }
  return pepper;
}

/**
 * Valida os requisitos de complexidade da senha:
 * - Mínimo de 10 caracteres
 * - Pelo menos 1 letra (maiúscula ou minúscula)
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 * 
 * @param {string} password 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePasswordComplexity(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'A senha é obrigatória.' };
  }

  if (password.length < 10) {
    return { valid: false, error: 'A senha deve conter no mínimo 10 caracteres.' };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos uma letra.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos um número.' };
  }

  // Verifica qualquer caractere que não seja letra nem número (especial/símbolo/pontuação)
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: 'A senha deve conter pelo menos um caractere especial (ex: !@#$%&*).' };
  }

  return { valid: true };
}

/**
 * Gera o hash da senha usando Argon2id (Memory-Hard) com Pepper secreto.
 * 
 * Parâmetros de segurança:
 * - Tipo: Argon2id (híbrido resistente a side-channel e GPU/ASIC)
 * - memoryCost: 65536 KiB (64 MB de RAM por hash para inviabilizar ataque paralelo em GPU)
 * - timeCost: 3 iterações
 * - parallelism: 4 threads
 * - secret: Buffer do Pepper secreto do servidor
 * 
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const pepper = getPepper();
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    secret: Buffer.from(pepper)
  });
}

/**
 * Verifica a senha fornecida contra o hash armazenado.
 * Suporta Argon2id com Pepper, com fallback transparente para hashes legados
 * (HMAC-SHA256 e SHA-256 puro), sinalizando quando for necessária a re-criptografia.
 * 
 * @param {string} storedHash 
 * @param {string} rawPassword 
 * @returns {Promise<{ valid: boolean, needsRehash: boolean }>}
 */
export async function verifyPassword(storedHash, rawPassword) {
  if (!storedHash || !rawPassword) {
    return { valid: false, needsRehash: false };
  }

  const pepper = getPepper();

  // 1. Formato Argon2id ($argon2id$...)
  if (storedHash.startsWith('$argon2')) {
    try {
      const isValid = await argon2.verify(storedHash, rawPassword, {
        secret: Buffer.from(pepper)
      });
      return { valid: isValid, needsRehash: false };
    } catch (err) {
      logger.error('[AuthSecurity]', 'Falha ao verificar hash Argon2:', err?.message);
      return { valid: false, needsRehash: false };
    }
  }

  // 2. Fallback: HMAC-SHA256 anterior (com JWT_SECRET)
  const jwtSecret = process.env.JWT_SECRET || 'oraculo_default_jwt_secret';
  const hmac = crypto.createHmac('sha256', jwtSecret).update(rawPassword).digest('hex');
  if (storedHash === hmac) {
    return { valid: true, needsRehash: true };
  }

  // 3. Fallback: SHA-256 puro legado
  const sha = crypto.createHash('sha256').update(rawPassword).digest('hex');
  if (storedHash === sha) {
    return { valid: true, needsRehash: true };
  }

  return { valid: false, needsRehash: false };
}

/**
 * Hash legado para fallback e testes
 */
export function hashPasswordLegacy(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
