/**
 * exportChat.js — Utilitário de Exportação de Chat em Arquivo HTML
 * Gera um arquivo HTML completo, autônomo e estilizado no tema dark do Oráculo
 */

export function exportChatToHtml(messages, title = 'Conversa — Criador Oráculo') {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Nenhuma mensagem para exportar.');
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const filename = `conversa-criador-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.html`;

  const escapeHtml = (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formattedMessagesHtml = messages
    .filter(m => m.role === 'user' || m.role === 'ai')
    .map(m => {
      const isUser = m.role === 'user';
      const roleName = isUser ? 'Você' : 'Oráculo (IA)';
      const roleIcon = isUser ? '✦' : '◈';
      const bubbleClass = isUser ? 'msg-user' : 'msg-ai';
      const contentHtml = escapeHtml(m.content || '').replace(/\n/g, '<br/>');

      let footerInfo = '';
      if (!isUser) {
        const time = m.timestamp || `${timeStr} de ${dateStr}`;
        const modelBadge = m.model ? `<span class="badge-model">${escapeHtml(m.model.toUpperCase())}</span>` : '';
        const costBadge = m.costUSD !== undefined 
          ? `<span class="badge-cost">$${m.costUSD.toFixed(4)} USD</span>` 
          : '';
        footerInfo = `
          <div class="msg-footer">
            <span>${escapeHtml(time)}</span>
            <div class="badges">${modelBadge}${costBadge}</div>
          </div>
        `;
      }

      return `
        <div class="msg-wrapper ${bubbleClass}">
          <div class="msg-avatar">${roleIcon}</div>
          <div class="msg-bubble">
            <div class="msg-header">
              <strong>${roleName}</strong>
            </div>
            <div class="msg-content">${contentHtml}</div>
            ${footerInfo}
          </div>
        </div>
      `;
    })
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #090a0f;
      --surface: #12141c;
      --surface-border: #1e2230;
      --gold: #c9a84c;
      --gold-light: #dfc168;
      --text: #ede8df;
      --text-muted: #8e95a5;
      --user-bg: #1a1e2b;
      --ai-bg: #151824;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 32px 16px;
      display: flex;
      justify-content: center;
    }
    .container {
      width: 100%;
      max-width: 860px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    header {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-meta {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .chat-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .msg-wrapper {
      display: flex;
      gap: 14px;
      width: 100%;
    }
    .msg-user {
      flex-direction: row-reverse;
    }
    .msg-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--gold);
      color: var(--gold);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
      margin-top: 4px;
    }
    .msg-bubble {
      background: var(--ai-bg);
      border: 1px solid var(--surface-border);
      border-radius: 14px;
      padding: 16px 20px;
      max-width: 82%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    .msg-user .msg-bubble {
      background: var(--user-bg);
      border-color: rgba(201, 168, 76, 0.25);
    }
    .msg-header {
      font-size: 12px;
      color: var(--gold);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .msg-content {
      font-size: 14.5px;
      white-space: pre-wrap;
      word-break: break-word;
      color: #f3f0e9;
    }
    .msg-footer {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badges {
      display: flex;
      gap: 6px;
    }
    .badge-model, .badge-cost {
      background: rgba(201, 168, 76, 0.12);
      border: 1px solid rgba(201, 168, 76, 0.3);
      color: var(--gold-light);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      padding: 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <div class="brand-title">✦ Oráculo · Histórico do Criador</div>
        <div class="brand-meta">Exportado em ${dateStr} às ${timeStr} · ${messages.length} mensagens</div>
      </div>
    </header>
    <main class="chat-container">
      ${formattedMessagesHtml}
    </main>
    <footer>
      Oráculo — Plataforma Interna de Inteligência e Produção de Conteúdo
    </footer>
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
