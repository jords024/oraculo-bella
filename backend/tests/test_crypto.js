/**
 * test_crypto.js — Testes unitários do módulo de criptografia AES-256
 *
 * Verifica:
 * 1. encrypt() gera string no formato "iv:encrypted"
 * 2. decrypt(encrypt(x)) === x (round-trip)
 * 3. Cada encrypt() gera resultado diferente (IV aleatório por operação)
 * 4. decrypt() com secret errada retorna string vazia
 * 5. Lida corretamente com valores vazios/nulos
 * 6. getSecret() lança erro se JWT_SECRET não estiver configurada
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

const { encrypt, decrypt, getSecret } = await import('../dashboard/crypto.js');

const SECRET = 'test-secret-key-32chars-for-aes256';

test('encrypt() — deve retornar string no formato iv:encrypted', () => {
  const result = encrypt('minha-api-key-secreta', SECRET);
  assert.ok(result, 'resultado não deve ser vazio');
  assert.match(result, /^[a-f0-9]+:[a-f0-9]+$/, 'formato deve ser hex:hex');
});

test('decrypt(encrypt(x)) === x — round-trip deve preservar o valor original', () => {
  const original = 'sk-proj-openai-key-abc123';
  const encrypted = encrypt(original, SECRET);
  const decrypted = decrypt(encrypted, SECRET);
  assert.equal(decrypted, original, 'valor descriptografado deve ser igual ao original');
});

test('encrypt() — IV aleatório: dois encrypts do mesmo valor devem ser diferentes', () => {
  const value = 'mesma-key-sempre';
  const enc1 = encrypt(value, SECRET);
  const enc2 = encrypt(value, SECRET);
  assert.notEqual(enc1, enc2, 'resultados devem ser diferentes devido ao IV aleatório');
  // Mas ambos devem descriptografar para o mesmo valor
  assert.equal(decrypt(enc1, SECRET), value);
  assert.equal(decrypt(enc2, SECRET), value);
});

test('decrypt() com secret errada deve retornar string vazia', () => {
  const encrypted = encrypt('valor-secreto', SECRET);
  const result = decrypt(encrypted, 'secret-errada-diferente');
  assert.equal(result, '', 'decrypt com secret errada deve retornar string vazia');
});

test('encrypt("") deve retornar string vazia', () => {
  assert.equal(encrypt('', SECRET), '', 'string vazia deve retornar string vazia');
});

test('decrypt("") deve retornar string vazia', () => {
  assert.equal(decrypt('', SECRET), '', 'string vazia deve retornar string vazia');
});

test('encrypt(null) deve retornar string vazia', () => {
  assert.equal(encrypt(null, SECRET), '', 'null deve retornar string vazia');
});

test('round-trip com valores especiais (URLs, tokens longos)', () => {
  const cases = [
    'https://s3.us-east-005.backblazeb2.com',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    'AIzaSyD-longGoogleKeyWith+SpecialChars=',
    '123456',
  ];
  for (const value of cases) {
    const enc = encrypt(value, SECRET);
    const dec = decrypt(enc, SECRET);
    assert.equal(dec, value, `round-trip falhou para: ${value.slice(0, 20)}...`);
  }
});

test('getSecret() deve lançar erro se JWT_SECRET não estiver configurada', () => {
  const original = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.throws(() => getSecret(), /JWT_SECRET/, 'deve lançar erro com mensagem sobre JWT_SECRET');
  process.env.JWT_SECRET = original;
});

test('getSecret() deve retornar a JWT_SECRET do ambiente', () => {
  process.env.JWT_SECRET = 'minha-secret-de-teste';
  const secret = getSecret();
  assert.equal(secret, 'minha-secret-de-teste');
});
