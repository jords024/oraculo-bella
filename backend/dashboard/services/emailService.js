// dashboard/services/emailService.js — Serviço de envio de e-mails via Brevo API
import { logger } from '../logger.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Envia e-mail transacional usando a API v3 do Brevo
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} [options.toName]
 * @param {string} options.subject
 * @param {string} options.htmlContent
 * @returns {Promise<{ ok: boolean, messageId?: string, error?: string }>}
 */
export async function sendBrevoEmail({ toEmail, toName, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.DASHBOARD_USER || 'contato@aryaraj.shop';
  const senderName = process.env.BREVO_SENDER_NAME || 'Oráculo Bella';

  if (!apiKey) {
    logger.error('[EMAIL]', `❌ BREVO_API_KEY não configurada no servidor. Tentativa de envio para ${toEmail} abortada.`);
    return {
      ok: false,
      configured: false,
      error: 'O serviço de envio de e-mails (Brevo) não foi configurado no servidor (BREVO_API_KEY ausente). Entre em contato com o administrador do sistema.'
    };
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: toEmail,
        name: toName || toEmail
      }
    ],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data.message || `HTTP ${response.status} ao enviar e-mail pelo Brevo`;
      logger.error('[EMAIL]', `Erro Brevo API: ${errMsg}`);
      return { ok: false, error: errMsg };
    }

    logger.info('[EMAIL]', `✅ E-mail enviado com sucesso para ${toEmail} via Brevo. ID: ${data.messageId || 'OK'}`);
    return { ok: true, messageId: data.messageId };
  } catch (err) {
    logger.error('[EMAIL]', `Exceção de rede ao enviar e-mail via Brevo: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

/**
 * Gera um template HTML elegante para código de verificação
 * @param {string} code
 * @param {string} userName
 * @returns {string}
 */
export function generateVerificationEmailHtml(code, userName = 'Usuário') {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Código de Verificação</title>
  </head>
  <body style="background-color: #080808; color: #EDE8DF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 520px; margin: 0 auto; background: #0E0E0E; border: 1px solid rgba(201,168,76,0.25); border-radius: 8px; padding: 40px 30px; text-align: center;">
      <h3 style="color: #C9A84C; font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 8px;">ESTÚDIO DE CONTEÚDO</h3>
      <h1 style="color: #EDE8DF; font-size: 26px; font-weight: 300; margin: 0 0 16px 0;">Isabella <span style="color: #C9A84C; font-style: italic;">Dalcin</span></h1>
      <div style="width: 36px; height: 1px; background: #C9A84C; opacity: 0.4; margin: 0 auto 24px auto;"></div>
      
      <p style="font-size: 15px; color: #EDE8DF; line-height: 1.6; margin-bottom: 24px;">
        Olá, <strong>${userName}</strong>! Use o código de segurança abaixo para confirmar seu e-mail e concluir o seu registro na plataforma.
      </p>

      <div style="background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.3); border-radius: 6px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #C9A84C; font-family: monospace;">${code}</span>
      </div>

      <p style="font-size: 12px; color: rgba(237,232,223,0.5); line-height: 1.5; margin-bottom: 0;">
        Este código é de uso único e expira em <strong>15 minutos</strong>.<br>
        Se você não solicitou este cadastro, desconsidere esta mensagem.
      </p>
    </div>
  </body>
  </html>
  `;
}
