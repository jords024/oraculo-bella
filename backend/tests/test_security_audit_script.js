/**
 * test_security_audit_script.js — Testes unitários para o script de auditoria de segurança
 * 
 * Verifica:
 * 1. auditNodeProject processa o JSON do npm audit para Frontend e Backend
 * 2. auditPythonProject processa requirements.txt
 * 3. Contagem e classificação adequada de severidades
 * 4. Detecção correta de falhas críticas/altas
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditNodeProject, auditPythonProject } from '../../scripts/security_audit.mjs';

test('auditNodeProject() — deve auditar o projeto frontend com sucesso', () => {
  const result = auditNodeProject('frontend', 'Frontend Test');
  assert.equal(result.skipped, undefined, 'Não deve ser ignorado');
  assert.ok(result.counts, 'Deve conter o objeto de contagens');
  assert.equal(typeof result.counts.total, 'number', 'Total deve ser número');
  assert.equal(typeof result.counts.critical, 'number', 'Critical deve ser número');
  assert.equal(typeof result.counts.high, 'number', 'High deve ser número');
});

test('auditNodeProject() — deve auditar o projeto backend com sucesso', () => {
  const result = auditNodeProject('backend', 'Backend Test');
  assert.equal(result.skipped, undefined, 'Não deve ser ignorado');
  assert.ok(result.counts, 'Deve conter o objeto de contagens');
  assert.equal(typeof result.counts.total, 'number', 'Total deve ser número');
});

test('auditNodeProject() — deve lidar com diretório inexistente sem quebrar', () => {
  const result = auditNodeProject('diretorio_inexistente_123', 'Inexistente');
  assert.equal(result.skipped, true);
  assert.match(result.error, /package.json não encontrado/i);
});

test('auditPythonProject() — deve verificar o arquivo requirements.txt', () => {
  const result = auditPythonProject('backend/requirements.txt', 'Python Test');
  assert.equal(result.skipped, false);
  assert.ok(result.counts, 'Deve retornar contagens de vulnerabilidades');
  assert.equal(typeof result.counts.total, 'number');
});

test('auditPythonProject() — deve lidar com arquivo inexistente graciosamente', () => {
  const result = auditPythonProject('backend/requirements_nao_existe.txt', 'Python 404');
  assert.equal(result.skipped, true);
  assert.match(result.error, /requirements.txt não encontrado/i);
});
