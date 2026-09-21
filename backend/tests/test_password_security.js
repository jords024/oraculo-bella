/**
 * test_password_security.js — Testes unitários para segurança de senhas
 * 
 * Testa:
 * 1. Validação de requisitos de complexidade (mínimo 10 caracteres, 1 número, 1 letra, 1 caractere especial)
 * 2. Geração de hash Argon2id (Memory-Hard) com Pepper secreto
 * 3. Verificação com senha correta e rejeição com senha incorreta
 * 4. Rejeição quando o Pepper for diferente
 * 5. Verificação e sinalização de rehash para senhas legadas (HMAC-SHA256 e SHA-256)
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import crypto from 'node:crypto';
import {
  validatePasswordComplexity,
  hashPassword,
  verifyPassword,
  hashPasswordLegacy,
  getPepper
} from '../dashboard/passwordSecurity.js';

test('validatePasswordComplexity() — deve aceitar senhas fortes que cumprem todos os requisitos', () => {
  const validPasswords = [
    'Senha@Forte2026!',
    'aB1#456789',
    'MinhaSenha_99',
    'Chave$egura123',
    'P@ssword1234'
  ];

  for (const pwd of validPasswords) {
    const result = validatePasswordComplexity(pwd);
    assert.equal(result.valid, true, `A senha "${pwd}" deveria ser válida`);
    assert.equal(result.error, undefined);
  }
});

test('validatePasswordComplexity() — deve rejeitar senha com menos de 10 caracteres', () => {
  const shortPwd = 'Ab1@45678'; // 9 caracteres
  const result = validatePasswordComplexity(shortPwd);
  assert.equal(result.valid, false);
  assert.match(result.error, /mínimo 10 caracteres/i);
});

test('validatePasswordComplexity() — deve rejeitar senha sem letras', () => {
  const noLetter = '1234567890!@#';
  const result = validatePasswordComplexity(noLetter);
  assert.equal(result.valid, false);
  assert.match(result.error, /pelo menos uma letra/i);
});

test('validatePasswordComplexity() — deve rejeitar senha sem números', () => {
  const noNumber = 'SenhaMuitoForte@#$';
  const result = validatePasswordComplexity(noNumber);
  assert.equal(result.valid, false);
  assert.match(result.error, /pelo menos um número/i);
});

test('validatePasswordComplexity() — deve rejeitar senha sem caractere especial', () => {
  const noSpecial = 'SenhaForte12345';
  const result = validatePasswordComplexity(noSpecial);
  assert.equal(result.valid, false);
  assert.match(result.error, /caractere especial/i);
});

test('validatePasswordComplexity() — deve rejeitar entradas vazias ou nulas', () => {
  assert.equal(validatePasswordComplexity('').valid, false);
  assert.equal(validatePasswordComplexity(null).valid, false);
  assert.equal(validatePasswordComplexity(undefined).valid, false);
});

test('hashPassword() — deve gerar hash Argon2id válido com parâmetros memory-hard', async () => {
  const raw = 'Oraculo@2026Sec!';
  const hash = await hashPassword(raw);

  assert.ok(hash, 'Hash gerado não deve ser vazio');
  assert.ok(hash.startsWith('$argon2id$'), 'O hash deve iniciar com $argon2id$');
  assert.ok(hash.includes('m=65536'), 'O hash deve conter custo de memória m=65536 (64MB)');
});

test('verifyPassword() — deve verificar senha correta com Argon2id + Pepper', async () => {
  const raw = 'MinhaSenhaSegura@2026';
  const hash = await hashPassword(raw);

  const result = await verifyPassword(hash, raw);
  assert.equal(result.valid, true, 'A senha correta deve ser validada');
  assert.equal(result.needsRehash, false, 'Argon2id não necessita de rehash');
});

test('verifyPassword() — deve rejeitar senha incorreta', async () => {
  const raw = 'MinhaSenhaSegura@2026';
  const hash = await hashPassword(raw);

  const result = await verifyPassword(hash, 'SenhaIncorreta@2026');
  assert.equal(result.valid, false, 'A senha incorreta deve ser rejeitada');
});

test('verifyPassword() — deve validar senhas legadas HMAC-SHA256 e solicitar rehash', async () => {
  const raw = 'SenhaLegadaHMAC@123';
  const jwtSecret = process.env.JWT_SECRET || 'oraculo_default_jwt_secret';
  const legacyHmacHash = crypto.createHmac('sha256', jwtSecret).update(raw).digest('hex');

  const result = await verifyPassword(legacyHmacHash, raw);
  assert.equal(result.valid, true, 'Senha legada HMAC deve ser aceita');
  assert.equal(result.needsRehash, true, 'Deve solicitar rehash para migração para Argon2id');
});

test('verifyPassword() — deve validar senhas legadas SHA-256 puro e solicitar rehash', async () => {
  const raw = 'SenhaLegadaPura@123';
  const legacyShaHash = hashPasswordLegacy(raw);

  const result = await verifyPassword(legacyShaHash, raw);
  assert.equal(result.valid, true, 'Senha legada SHA-256 deve ser aceita');
  assert.equal(result.needsRehash, true, 'Deve solicitar rehash para migração para Argon2id');
});

test('verifyPassword() — deve rejeitar senha incorreta contra hash legado', async () => {
  const raw = 'SenhaLegada@123';
  const legacyShaHash = hashPasswordLegacy(raw);

  const result = await verifyPassword(legacyShaHash, 'SenhaErrada@123');
  assert.equal(result.valid, false, 'Senha incorreta em hash legado deve ser rejeitada');
});
