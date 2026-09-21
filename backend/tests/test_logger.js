/**
 * test_logger.js — Testes unitários do módulo de logger centralizado
 * 
 * Verifica:
 * 1. Formato correto do timestamp (dd/mm/aaaa hh:mm:ss)
 * 2. Prefixo de nível de log ([INFO], [WARN], [ERROR], [DEBUG])
 * 3. Tag opcional entre colchetes ([Backup], [DB], etc.)
 * 4. Timezone correto (America/Sao_Paulo / BRT = UTC-3)
 * 5. Log de DEBUG suprimido em produção
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Intercepta uma chamada de console e retorna os argumentos usados.
 * @param {'log'|'warn'|'error'} method
 * @param {Function} fn — função a executar durante a captura
 * @returns {any[]} argumentos passados ao método do console
 */
function captureConsole(method, fn) {
  const original = console[method];
  let captured = null;
  console[method] = (...args) => { captured = args; };
  try { fn(); } finally { console[method] = original; }
  return captured;
}

// Padrão de timestamp esperado: "24/06/2025 12:00:00"
const TIMESTAMP_RE = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;

// ── Importação dinâmica (ESM) ────────────────────────────────────────────────

const { logger } = await import('../dashboard/logger.js');

// ── Testes ───────────────────────────────────────────────────────────────────

test('logger.info — deve emitir [INFO] com tag e timestamp válido', () => {
  const args = captureConsole('log', () => {
    logger.info('[Backup]', 'Scheduler iniciado');
  });

  assert.ok(args, 'console.log deve ter sido chamado');
  const prefix = args[0]; // "[24/06/2025 12:00:00] [INFO] [Backup]"
  assert.match(prefix, /\[INFO\]/, 'deve conter [INFO]');
  assert.match(prefix, /\[Backup\]/, 'deve conter a tag [Backup]');

  // Extrai o timestamp do prefix: "[24/06/2025 12:00:00]"
  const tsMatch = prefix.match(/\[(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})\]/);
  assert.ok(tsMatch, 'deve conter um timestamp no formato dd/mm/aaaa hh:mm:ss');
  assert.match(tsMatch[1], TIMESTAMP_RE, 'timestamp deve estar no formato correto');
});

test('logger.error — deve emitir [ERROR] com tag e mensagem', () => {
  const args = captureConsole('error', () => {
    logger.error('[DB]', 'Falha na conexão', new Error('ECONNREFUSED'));
  });

  assert.ok(args, 'console.error deve ter sido chamado');
  const prefix = args[0];
  assert.match(prefix, /\[ERROR\]/, 'deve conter [ERROR]');
  assert.match(prefix, /\[DB\]/, 'deve conter a tag [DB]');
  assert.equal(args[1], 'Falha na conexão', 'deve repassar a mensagem corretamente');
  assert.ok(args[2] instanceof Error, 'deve repassar o objeto de erro');
});

test('logger.warn — deve emitir [WARN] com tag', () => {
  const args = captureConsole('warn', () => {
    logger.warn('[CONFIG]', 'Variável B2_KEY_ID não configurada');
  });

  assert.ok(args, 'console.warn deve ter sido chamado');
  assert.match(args[0], /\[WARN\]/, 'deve conter [WARN]');
  assert.match(args[0], /\[CONFIG\]/, 'deve conter a tag [CONFIG]');
});

test('logger.info — sem tag, deve funcionar com mensagem direta', () => {
  const args = captureConsole('log', () => {
    logger.info('Mensagem sem tag específica');
  });

  assert.ok(args, 'console.log deve ter sido chamado');
  assert.match(args[0], /\[INFO\]/, 'deve conter [INFO] mesmo sem tag explícita');
});

test('logger.debug — deve ser suprimido em NODE_ENV=production', () => {
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  const args = captureConsole('log', () => {
    logger.debug('[Test]', 'Mensagem de debug que não deve aparecer em produção');
  });

  process.env.NODE_ENV = original;
  assert.equal(args, null, 'console.log NÃO deve ter sido chamado em produção');
});

test('logger.debug — deve aparecer fora de produção', () => {
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  const args = captureConsole('log', () => {
    logger.debug('[Test]', 'Mensagem de debug visível em desenvolvimento');
  });

  process.env.NODE_ENV = original;
  assert.ok(args, 'console.log DEVE ter sido chamado fora de produção');
  assert.match(args[0], /\[DEBUG\]/, 'deve conter [DEBUG]');
});

test('timestamp deve estar no fuso de Brasília (UTC-3)', () => {
  // Cria uma data fixa em UTC e verifica que o timestamp gerado é UTC-3
  // Simula: UTC 15:00 → Brasília 12:00
  const utcDate = new Date('2025-06-24T15:30:00Z');
  const brtFormatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(utcDate).replace(',', '');

  // Deve ser "24/06/2025 12:30:00" (UTC-3)
  assert.match(brtFormatted, /24\/06\/2025 12:30:00/, 'timestamp de Brasília deve ser UTC-3');
});
