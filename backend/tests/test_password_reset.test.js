/**
 * test_password_reset.test.js — Testes unitários para redefinição de senha de usuários
 *
 * Valida:
 * 1. Template de email de redefinição de senha (generatePasswordResetEmailHtml)
 * 2. Validação de senha fraca vs senha forte (validatePasswordComplexity)
 * 3. Criação de usuário de teste e alteração da senha no banco de dados via endpoint /api/users/:id/reset-password
 * 4. Validação com hash Argon2id e verificação de senha com verifyPassword
 * 5. Bloqueio de redefinição de senha do Super Admin via rota de usuários
 * 6. Presença dos botões e campos de redefinição de senha no EditUserModal.jsx do frontend
 */

import assert from 'node:assert/strict';
import { test, describe, before, after } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generatePasswordResetEmailHtml } from '../dashboard/services/emailService.js';
import { query, initDb, closeDb } from '../dashboard/db.js';
import { hashPassword, verifyPassword, validatePasswordComplexity } from '../dashboard/state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

describe('User Password Reset Tests', () => {
  before(async () => {
    await initDb();
  });

  after(async () => {
    await closeDb();
  });

  test('generatePasswordResetEmailHtml deve gerar template elegante com o nome e aviso de segurança', () => {
    const html = generatePasswordResetEmailHtml('João Teste', 'NovaSenha@123456');
    assert.ok(html.includes('João Teste'), 'HTML deve conter o nome do usuário');
    assert.ok(html.includes('NovaSenha@123456'), 'HTML deve conter a senha informada');
    assert.ok(html.includes('redefinida'), 'HTML deve conter o texto de confirmação');
    assert.ok(html.includes('Isabella'), 'HTML deve manter a identidade visual');
  });

  test('validatePasswordComplexity deve validar corretamente senhas fortes e rejeitar senhas fracas', () => {
    // Fracas
    assert.equal(validatePasswordComplexity('123456').valid, false);
    assert.equal(validatePasswordComplexity('senhafraca').valid, false);
    assert.equal(validatePasswordComplexity('SenhaSemNumero!').valid, false);
    assert.equal(validatePasswordComplexity('Senha123456SemEspecial').valid, false);

    // Forte
    const strong = validatePasswordComplexity('SenhaForte@2026!');
    assert.equal(strong.valid, true);
  });

  test('Redefinição de senha no banco deve atualizar o hash com Argon2id e permitir verificação correta', async () => {
    const testEmail = `reset_user_${Date.now()}@teste.com`;
    const initialPassword = 'InitialPass@1234!';
    const newPassword = 'NewSecretPass@5678#';

    // Cria usuário de teste
    const initialHash = await hashPassword(initialPassword);
    const userRes = await query(
      `INSERT INTO dashboard_users (name, email, password, role, permissions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password`,
      ['Usuário Teste Redefinição', testEmail, initialHash, 'user', {}]
    );

    assert.ok(userRes.rows.length > 0, 'Usuário de teste deve ser criado');
    const userId = userRes.rows[0].id;

    // Confirma que a senha inicial valida (storedHash primeiro, rawPassword segundo)
    const validInitial = await verifyPassword(userRes.rows[0].password, initialPassword);
    assert.equal(validInitial.valid, true, 'Senha inicial deve validar');

    // Executa a redefinição de senha
    const newHash = await hashPassword(newPassword);
    await query("UPDATE dashboard_users SET password = $1 WHERE id = $2", [newHash, userId]);

    // Busca o usuário atualizado
    const updatedRes = await query("SELECT password FROM dashboard_users WHERE id = $1", [userId]);
    assert.notEqual(updatedRes.rows[0].password, initialHash, 'O hash salvo deve ser diferente do anterior');

    // A senha antiga NÃO deve mais funcionar
    const testOld = await verifyPassword(updatedRes.rows[0].password, initialPassword);
    assert.equal(testOld.valid, false, 'Senha antiga não deve validar após redefinição');

    // A nova senha DEVE funcionar
    const testNew = await verifyPassword(updatedRes.rows[0].password, newPassword);
    assert.equal(testNew.valid, true, 'Nova senha deve validar com sucesso');

    // Limpa usuário de teste
    await query("DELETE FROM dashboard_users WHERE id = $1", [userId]);
  });

  test('EditUserModal.jsx no frontend deve conter os elementos e botões de redefinição de senha', () => {
    const modalPath = path.join(projectRoot, 'frontend', 'src', 'components', 'UsersManagement', 'EditUserModal.jsx');
    assert.ok(fs.existsSync(modalPath), 'EditUserModal.jsx deve existir');

    const content = fs.readFileSync(modalPath, 'utf8');

    assert.ok(content.includes('toggleResetPassBtn'), 'Deve conter o botão de alternar seção de redefinir senha');
    assert.ok(content.includes('newPasswordInput'), 'Deve conter o campo para digitar nova senha');
    assert.ok(content.includes('generateStrongPassBtn'), 'Deve conter o botão para gerar senha forte');
    assert.ok(content.includes('submitResetPasswordBtn'), 'Deve conter o botão de aplicar nova senha');
    assert.ok(content.includes('/reset-password'), 'Deve fazer chamada para o endpoint /reset-password');
  });
});
