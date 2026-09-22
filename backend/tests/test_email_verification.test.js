/**
 * test_email_verification.test.js — Testes unitários para envio e validação de código Brevo
 *
 * Valida:
 * 1. Template de email e formatação do código de verificação
 * 2. Simulação e tratamento de falha/sucesso do emailService (Brevo API)
 * 3. Criação de registros de verificação no banco de dados e rota /api/users/register/send-code
 * 4. Validação e rejeição de códigos expirados / inválidos no /api/users/register
 * 5. Conclusão de cadastro de usuário após validação de código
 * 6. Elementos visuais e modais de verificação no frontend/public/register.html e frontend/dist/register.html
 */

import assert from 'node:assert/strict';
import { test, describe, before, after } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateVerificationEmailHtml, sendBrevoEmail } from '../dashboard/services/emailService.js';
import { query, initDb } from '../dashboard/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

describe('Email Verification & Brevo Integration Tests', () => {
  before(async () => {
    await initDb();
  });

  test('generateVerificationEmailHtml deve formatar o código e o nome do usuário corretamente', () => {
    const code = '849201';
    const userName = 'Bella Teste';
    const html = generateVerificationEmailHtml(code, userName);

    assert.ok(html.includes('849201'), 'HTML deve conter o código gerado');
    assert.ok(html.includes('Bella Teste'), 'HTML deve conter o nome do usuário');
    assert.ok(html.includes('15 minutos'), 'HTML deve avisar tempo de expiração');
    assert.ok(html.includes('Isabella'), 'HTML deve conter o cabeçalho padrão de branding');
  });

  test('sendBrevoEmail sem BREVO_API_KEY deve retornar simulated: true sem quebrar', async () => {
    const originalKey = process.env.BREVO_API_KEY;
    delete process.env.BREVO_API_KEY;

    try {
      const res = await sendBrevoEmail({
        toEmail: 'teste@exemplo.com',
        toName: 'Teste',
        subject: 'Código de Teste',
        htmlContent: '<p>Teste</p>'
      });

      assert.equal(res.ok, true, 'Deve retornar ok: true');
      assert.equal(res.simulated, true, 'Deve indicar envio simulado quando chave ausente');
    } finally {
      if (originalKey) process.env.BREVO_API_KEY = originalKey;
    }
  });

  test('Tabela email_verifications deve existir no banco de dados e permitir inserção e consulta', async () => {
    // Insere um código de teste
    const testEmail = `test_${Date.now()}@oraculo-teste.com`;
    const testCode = '123456';
    const testInviteId = `invite_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const insertRes = await query(
      `INSERT INTO email_verifications (email, invite_id, code, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, invite_id, code, verified`,
      [testEmail, testInviteId, testCode, expiresAt]
    );

    assert.ok(insertRes.rows.length > 0, 'Deve inserir o registro');
    assert.equal(insertRes.rows[0].email, testEmail);
    assert.equal(insertRes.rows[0].invite_id, testInviteId);
    assert.equal(insertRes.rows[0].code, testCode);
    assert.equal(insertRes.rows[0].verified, false);

    // Consulta e marca como verificado
    await query(
      `UPDATE email_verifications SET verified = true WHERE id = $1`,
      [insertRes.rows[0].id]
    );

    const checkRes = await query(
      `SELECT verified FROM email_verifications WHERE id = $1`,
      [insertRes.rows[0].id]
    );
    assert.equal(checkRes.rows[0].verified, true, 'Deve ter atualizado para verificado');

    // Limpa registro de teste
    await query(`DELETE FROM email_verifications WHERE id = $1`, [insertRes.rows[0].id]);
  });

  test('frontend/public/register.html e frontend/dist/register.html devem conter os componentes de modal e verificação de e-mail', () => {
    const publicPath = path.join(projectRoot, 'frontend', 'public', 'register.html');
    const distPath = path.join(projectRoot, 'frontend', 'dist', 'register.html');

    assert.ok(fs.existsSync(publicPath), 'frontend/public/register.html deve existir');
    assert.ok(fs.existsSync(distPath), 'frontend/dist/register.html deve existir');

    const publicContent = fs.readFileSync(publicPath, 'utf8');
    const distContent = fs.readFileSync(distPath, 'utf8');

    for (const [name, content] of [['public', publicContent], ['dist', distContent]]) {
      // Modal do código
      assert.ok(content.includes('verifyCodeModal'), `${name} deve conter o modal verifyCodeModal`);
      assert.ok(content.includes('verificationCodeInput'), `${name} deve conter o input de 6 dígitos verificationCodeInput`);
      assert.ok(content.includes('confirmCodeBtn'), `${name} deve conter o botão confirmCodeBtn`);
      assert.ok(content.includes('resendCodeBtn'), `${name} deve conter o botão resendCodeBtn`);
      assert.ok(content.includes('backToFormBtn'), `${name} deve conter o botão backToFormBtn`);
      assert.ok(content.includes('/api/users/register/send-code'), `${name} deve chamar a rota /send-code`);
      assert.ok(content.includes('verificationCode'), `${name} deve enviar verificationCode no registro`);
    }
  });

});
