import express from 'express';
import { query } from '../db.js';
import { logger } from '../logger.js';

const router = express.Router();
const WORKSPACE = 'bella';
const MAX_CONVERSATIONS = 100;
const MAX_MESSAGES = 160;
const ALLOWED_SLIDE_COUNTS = new Set([3, 5, 7, 10]);

function userEmail(req) {
  return String(req.user?.email || req.user?.user || 'local@bella').slice(0, 255);
}

function cleanMessage(message) {
  if (!message || !['user', 'ai', 'form'].includes(message.role)) return null;
  return {
    ...message,
    id: message.id ? String(message.id).slice(0, 120) : undefined,
    role: message.role,
    content: typeof message.content === 'string' ? message.content.slice(0, 120000) : '',
    streaming: false
  };
}

function cleanConversation(conversation) {
  if (!conversation || typeof conversation.id !== 'string') return null;
  const slideCount = Number(conversation.totalSlides);
  return {
    id: conversation.id.slice(0, 120),
    title: String(conversation.title || 'Nova conversa').slice(0, 120),
    messages: (Array.isArray(conversation.messages) ? conversation.messages : [])
      .slice(-MAX_MESSAGES).map(cleanMessage).filter(Boolean),
    templateId: String(conversation.templateId || 'bella_essencial').slice(0, 80),
    model: String(conversation.model || 'gpt-5.6-terra').slice(0, 80),
    reasoningEffort: ['low', 'medium', 'high'].includes(conversation.reasoningEffort)
      ? conversation.reasoningEffort : 'medium',
    totalSlides: ALLOWED_SLIDE_COUNTS.has(slideCount) ? slideCount : 5,
    createdAt: conversation.createdAt || new Date().toISOString(),
    updatedAt: conversation.updatedAt || new Date().toISOString(),
    isPinned: Boolean(conversation.isPinned)
  };
}

router.get('/api/criador/conversations', async (req, res) => {
  try {
    const result = await query(
      'SELECT conversations, active_conversation_id, updated_at FROM creator_chats WHERE user_email=$1 AND workspace=$2',
      [userEmail(req), WORKSPACE]
    );
    const row = result.rows[0];
    res.json({
      conversations: row?.conversations || [],
      activeConversationId: row?.active_conversation_id || null,
      updatedAt: row?.updated_at || null
    });
  } catch (error) {
    logger.error('[CreatorChats]', error.message);
    res.status(500).json({ error: 'Não foi possível carregar as conversas.' });
  }
});

router.put('/api/criador/conversations', async (req, res) => {
  try {
    const conversations = (Array.isArray(req.body?.conversations) ? req.body.conversations : [])
      .slice(0, MAX_CONVERSATIONS).map(cleanConversation).filter(Boolean);
    const activeId = conversations.some(item => item.id === req.body?.activeConversationId)
      ? req.body.activeConversationId : conversations[0]?.id || null;
    await query(`INSERT INTO creator_chats (user_email,workspace,conversations,active_conversation_id,updated_at)
      VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP)
      ON CONFLICT (user_email,workspace) DO UPDATE SET
        conversations=EXCLUDED.conversations,
        active_conversation_id=EXCLUDED.active_conversation_id,
        updated_at=CURRENT_TIMESTAMP`,
      [userEmail(req), WORKSPACE, JSON.stringify(conversations), activeId]);
    res.json({ ok: true, count: conversations.length, activeConversationId: activeId, updatedAt: new Date().toISOString() });
  } catch (error) {
    logger.error('[CreatorChats]', error.message);
    res.status(500).json({ error: 'Não foi possível salvar as conversas.' });
  }
});

export default router;
