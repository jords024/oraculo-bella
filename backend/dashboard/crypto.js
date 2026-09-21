// dashboard/crypto.js — Criptografia AES-256-CBC para valores sensíveis
// Usa apenas o módulo nativo 'crypto' do Node.js (sem dependências externas)

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size
const KEY_LENGTH = 32; // 256 bits

/**
 * Deriva uma chave AES de 32 bytes a partir da JWT_SECRET.
 * Usa SHA-256 para garantir tamanho fixo independente do tamanho da secret.
 * @param {string} secret
 * @returns {Buffer}
 */
function deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encripta um valor usando AES-256-CBC.
 * O IV aleatório é prefixado ao resultado (hex:hex) para permitir descriptografia.
 *
 * @param {string} text   — valor em texto puro
 * @param {string} secret — JWT_SECRET do ambiente
 * @returns {string}      — string cifrada no formato "iv_hex:encrypted_hex"
 */
export function encrypt(text, secret) {
  if (!text) return '';
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Descriptografa um valor cifrado pelo encrypt().
 *
 * @param {string} encryptedText — string no formato "iv_hex:encrypted_hex"
 * @param {string} secret        — JWT_SECRET do ambiente
 * @returns {string}             — valor original em texto puro
 */
export function decrypt(encryptedText, secret) {
  if (!encryptedText) return '';
  try {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !encryptedHex) return '';
    const key = deriveKey(secret);
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}

/**
 * Retorna a JWT_SECRET do ambiente.
 * Lança erro se não estiver configurada.
 * @returns {string}
 */
export function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurada no ambiente.');
  return secret;
}

export default { encrypt, decrypt, getSecret };
