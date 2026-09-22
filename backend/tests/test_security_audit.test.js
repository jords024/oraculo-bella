/**
 * test_security_audit.test.js — Testes unitários para a automação de segurança e verificação pré-push
 * 
 * Regra: Todo novo recurso deve conter testes unitários automatizados.
 * Valida:
 * 1. Execução de runNpmAudit no backend e frontend
 * 2. Formato e categorização de severidades no relatório
 * 3. Resiliência de runNpmAudit ao lidar com diretórios inexistentes
 * 4. Detecção de segredos e chaves expostas por checkHardcodedSecrets
 * 5. Existência e integridade do hook .githooks/pre-push e .git/hooks/pre-push
 * 6. Execução de runSecurityAudit retornando indicador de vulnerabilidades
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  checkHardcodedSecrets,
  runNpmAudit,
  runSecurityAudit
} from '../scripts/security_check.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

test('runNpmAudit() — deve retornar estrutura padronizada para o Backend', () => {
  const backendPath = path.join(projectRoot, 'backend');
  const result = runNpmAudit(backendPath, 'Backend');

  assert.equal(result.target, 'Backend');
  assert.equal(typeof result.total, 'number');
  assert.equal(typeof result.critical, 'number');
  assert.equal(typeof result.high, 'number');
  assert.equal(typeof result.moderate, 'number');
  assert.equal(typeof result.low, 'number');
  assert.ok(Array.isArray(result.list), 'result.list deve ser um array');
});

test('runNpmAudit() — deve retornar estrutura padronizada para o Frontend', () => {
  const frontendPath = path.join(projectRoot, 'frontend');
  const result = runNpmAudit(frontendPath, 'Frontend');

  assert.equal(result.target, 'Frontend');
  assert.equal(typeof result.total, 'number');
  assert.equal(typeof result.critical, 'number');
  assert.equal(typeof result.high, 'number');
  assert.equal(typeof result.moderate, 'number');
  assert.equal(typeof result.low, 'number');
  assert.ok(Array.isArray(result.list), 'result.list deve ser um array');
});

test('runNpmAudit() — deve lidar com diretório sem package.json graciosamente', () => {
  const fakeDir = path.join(projectRoot, 'diretorio_fantasma_para_teste_seguranca');
  const result = runNpmAudit(fakeDir, 'Inexistente');

  assert.equal(result.target, 'Inexistente');
  assert.equal(result.total, 0);
  assert.deepEqual(result.vulnerabilities, []);
});

test('checkHardcodedSecrets() — não deve encontrar credenciais reais em arquivos rastreados', () => {
  const violations = checkHardcodedSecrets(projectRoot);
  assert.ok(Array.isArray(violations), 'violations deve ser um array');
  // Se houver algum segredo detectado em arquivos rastreados, o teste falha
  assert.equal(violations.length, 0, `Nenhum segredo real deve estar rastreado no git. Encontrados: ${JSON.stringify(violations)}`);
});

test('Git Pre-Push Hook — arquivos de hook devem existir e apontar para security_check.mjs', () => {
  const githookPath = path.join(projectRoot, '.githooks', 'pre-push');
  const dotGitHookPath = path.join(projectRoot, '.git', 'hooks', 'pre-push');

  assert.ok(fs.existsSync(githookPath), '.githooks/pre-push deve existir no repositório');
  const githookContent = fs.readFileSync(githookPath, 'utf8');
  assert.match(githookContent, /security_check\.mjs/, 'O hook .githooks/pre-push deve invocar security_check.mjs');

  assert.ok(fs.existsSync(dotGitHookPath), '.git/hooks/pre-push deve existir no repositório local');
  const dotGitContent = fs.readFileSync(dotGitHookPath, 'utf8');
  assert.match(dotGitContent, /security_check\.mjs/, 'O hook .git/hooks/pre-push deve invocar security_check.mjs');
});

test('runSecurityAudit() — executa verificação completa e detecta estado de segurança', () => {
  // exitOnError: false garante que a função retorne o resultado ao invés de matar o processo de teste
  const auditReport = runSecurityAudit({ exitOnError: false, silent: true });

  assert.ok(typeof auditReport.hasVulnerabilities === 'boolean');
  assert.ok(auditReport.backendAudit, 'Deve conter auditoria do backend');
  assert.ok(auditReport.frontendAudit, 'Deve conter auditoria do frontend');
  assert.ok(Array.isArray(auditReport.secretViolations), 'Deve conter lista de violações de segredos');
});
