import React, { useState, useEffect, useRef } from 'react';
import { parseCarouselText } from '../utils/carouselParser';
import { replaceSlideFields } from '../utils/scriptEditing';
import { exportChatToHtml } from '../utils/exportChat';
import { IDEAS_PROMPT, TEMPLATES, getTemplate, normalizeTemplateId } from './Criador/criadorConstants';
import CriadorTemplateBar from './Criador/CriadorTemplateBar';
import CriadorHistorySidebar from './Criador/CriadorHistorySidebar';
import CriadorChatList from './Criador/CriadorChatList';
import ModelExperienceSelector, { CREATOR_MODELS, REASONING_LEVELS } from './Criador/ModelExperienceSelector';
import NoImageSlidesSelector from './Criador/NoImageSlidesSelector';
import ImageSourceSelector from './Criador/ImageSourceSelector';
import PinterestBoardsPanel from './Criador/PinterestBoardsPanel';
import { customFetch } from '../utils/customFetch';
import OracleModeSelector from './Criador/OracleModeSelector';
import SlideCountSelector from './Criador/SlideCountSelector';

function buildRecentContentMemory(conversations, activeConversationId) {
  const memory = [];
  const ordered = [...(conversations || [])]
    .filter(conversation => conversation?.id !== activeConversationId)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  for (const conversation of ordered) {
    const assistantMessages = [...(conversation.messages || [])]
      .reverse()
      .filter(message => message?.role === 'ai' && typeof message.content === 'string');

    for (const message of assistantMessages) {
      const parsed = message.parsedPayload || parseCarouselText(message.content);
      const slides = parsed?.slides || (Array.isArray(parsed) ? parsed : []);
      if (slides.length < 2) continue;

      memory.push({
        title: String(conversation.title || 'Conteúdo recente').slice(0, 100),
        slides: slides.slice(0, 10).map((slide, index) => ({
          position: index + 1,
          state: String(slide.estado || slide.state || '').slice(0, 40),
          title: String(slide.title || slide.title_text || '').slice(0, 100),
          body: String(slide.body || slide.text || '').replace(/\s+/g, ' ').slice(0, 140)
        }))
      });
      break;
    }

    if (memory.length >= 6) break;
  }

  return memory;
}

const plainText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Reconhece pedidos como "use a pasta Luz e silêncio" ou "usar as pastas X, Y". Devolve null se não for esse comando.
function parseBoardCommand(text, boards) {
  const match = String(text || '').trim().match(/^(?:ok[, ]+|certo[, ]+|ent[aã]o[, ]+)?(?:use|usa|usar|utilize|utilizar|pegue|pega|puxe|puxar|quero usar)\s+(?:as?\s+|nas?\s+|das?\s+)?(?:imagens?\s+d[aeo]s?\s+)?pastas?\s+(?:d[oa]\s+pinterest\s+)?(.+?)[.!\s]*$/i);
  if (!match) return null;
  const names = match[1].replace(/\s+(?:para|pra|nas?|no)\s+(?:as\s+)?(?:imagens?|carrossel|fotos?).*$/i, '').split(/\s*(?:,|;|\be\b)\s*/i).map(name => name.replace(/^["“”']+|["“”']+$/g, '').trim()).filter(Boolean);
  const matched = [];
  const missing = [];
  names.forEach(name => {
    const wanted = plainText(name);
    const found = wanted.length >= 2 && (
      boards.find(board => plainText(board.name) === wanted)
      || boards.find(board => plainText(board.name).includes(wanted) || (wanted.length >= 4 && wanted.includes(plainText(board.name))))
      || boards.find(board => wanted.split(' ').filter(token => token.length > 2).every(token => plainText(board.name).includes(token)))
    );
    if (found && !matched.includes(found)) matched.push(found); else if (!found) missing.push(name);
  });
  return { matched, missing };
}

export default function Criador({ onStartGeneration, showToast, initialMessages, isReadOnly, isMockFlow }) {
  const [input, setInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    try { return normalizeTemplateId(sessionStorage.getItem('criador_selected_template') || 'bella_tipografico'); } catch { return 'bella_tipografico'; }
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    try {
      const saved = sessionStorage.getItem('criador_selected_model');
      return CREATOR_MODELS.some(item => item.id === saved) ? saved : 'gpt-5.6-terra';
    } catch { return 'gpt-5.6-terra'; }
  });

  const [reasoningEffort, setReasoningEffort] = useState(() => {
    try {
      const saved = sessionStorage.getItem('criador_reasoning_effort');
      return REASONING_LEVELS.some(item => item.id === saved) ? saved : 'medium';
    } catch { return 'medium'; }
  });

  const [totalSlides, setTotalSlides] = useState(() => {
    try {
      const saved = Number(sessionStorage.getItem('criador_total_slides'));
      return [3, 5, 7, 10].includes(saved) ? saved : 5;
    } catch { return 5; }
  });

  const [noImageSlides, setNoImageSlides] = useState(() => {
    try {
      const saved = Number(sessionStorage.getItem('criador_no_image_slides'));
      return Number.isInteger(saved) && saved >= 0 ? saved : 0;
    } catch { return 0; }
  });

  const [imageSource, setImageSource] = useState(() => {
    try {
      const saved = sessionStorage.getItem('criador_image_source');
      return saved === 'pinterest' || saved === 'pasta' ? saved : 'ia';
    } catch { return 'ia'; }
  });

  // "Minhas pastas": pastas públicas do Pinterest do próprio usuário (conectadas no painel ou pelo chat).
  const inputRef = useRef(null);
  // A caixa de escrita cresce com o texto (até ~8 linhas) e volta ao tamanho de uma linha depois de enviar.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const [boards, setBoards] = useState([]);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [selectedBoardIds, setSelectedBoardIds] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('criador_board_ids') || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  const selectedBoards = boards.filter(board => selectedBoardIds.includes(board.id));
  const saveSelectedBoards = ids => {
    setSelectedBoardIds(ids);
    try { localStorage.setItem('criador_board_ids', JSON.stringify(ids)); } catch {}
  };
  useEffect(() => {
    let cancelled = false;
    customFetch('/api/pinterest/boards').then(res => res.json()).then(data => {
      if (!cancelled && data?.ok) setBoards(data.boards || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const callBoards = async (path, options) => {
    try {
      const res = await customFetch(path, options);
      const data = await res.json();
      if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Não foi possível concluir. Tente de novo.' };
      return data;
    } catch { return { ok: false, error: 'Falha de conexão com o servidor.' }; }
  };
  const jsonPost = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  // Prévia: mostra o que existe no link colado, sem salvar nada.
  const previewBoards = input => callBoards('/api/pinterest/preview', jsonPost({ input }));
  // Adiciona só as pastas escolhidas na prévia; as novas já entram marcadas para uso.
  const addBoards = async items => {
    const data = await callBoards('/api/pinterest/boards', jsonPost({ items }));
    if (data.ok) {
      setBoards(data.boards);
      saveSelectedBoards([...new Set([...selectedBoardIds, ...data.added.map(board => board.id)])]);
    }
    return data;
  };
  const syncBoards = async user => {
    const data = await callBoards('/api/pinterest/sync', jsonPost({ user }));
    if (data.ok) {
      setBoards(data.boards);
      saveSelectedBoards(selectedBoardIds.filter(id => data.boards.some(board => board.id === id)));
    }
    return data;
  };
  const disconnectProfile = async user => {
    const data = await callBoards(`/api/pinterest/profile?user=${encodeURIComponent(user)}`, { method: 'DELETE' });
    if (data.ok) { setBoards(data.boards); saveSelectedBoards(selectedBoardIds.filter(id => data.boards.some(board => board.id === id))); }
  };
  const removeBoard = async id => {
    const data = await callBoards(`/api/pinterest/boards?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (data.ok) { setBoards(data.boards); saveSelectedBoards(selectedBoardIds.filter(item => item !== id)); }
  };
  const toggleBoard = id => saveSelectedBoards(selectedBoardIds.includes(id) ? selectedBoardIds.filter(item => item !== id) : [...selectedBoardIds, id]);
  const chooseImageSource = value => {
    setImageSource(value);
    try { sessionStorage.setItem('criador_image_source', value); } catch {}
  };

  const [oracleMode, setOracleMode] = useState(() => {
    try { return sessionStorage.getItem('criador_oracle_mode') === 'simples' ? 'simples' : 'atual'; } catch { return 'atual'; }
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('criador_conversations_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    const initialSavedMsgs = (() => {
      try {
        const s = sessionStorage.getItem('criador_chat_messages');
        return s ? JSON.parse(s) : [];
      } catch { return []; }
    })();
    return [{
      id: 'conv-1',
      title: initialSavedMsgs.length > 0 ? (initialSavedMsgs[0]?.content?.slice(0, 32) || 'Conversa Inicial') : 'Oráculo — Bella Dalcin',
      messages: initialSavedMsgs,
      templateId: 'bella_tipografico',
      model: 'gpt-5.6-terra',
      reasoningEffort: 'medium',
      totalSlides,
      noImageSlides,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false
    }];
  });

  const [activeConversationId, setActiveConversationId] = useState(() => {
    try { return sessionStorage.getItem('criador_active_conv_id') || 'conv-1'; } catch { return 'conv-1'; }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [messages, setMessages] = useState(() => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    try {
      const saved = sessionStorage.getItem('criador_chat_messages');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [generating, setGenerating] = useState(false);
  const [conversationSync, setConversationSync] = useState('loading');
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [startingCarousel, setStartingCarousel] = useState(false);
  const [lastCarouselText, setLastCarouselText] = useState(() => sessionStorage.getItem('criadorLastCarousel') || null);
  const msgsRef = useRef(null);
  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('criador_conversations_v2', JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  useEffect(() => {
    let active = true;
    fetch('/api/criador/conversations')
      .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then(data => {
        if (!active) return;
        const serverConversations = Array.isArray(data.conversations) ? data.conversations : [];
        if (serverConversations.length > 0) {
          setConversations(serverConversations);
          const nextId = serverConversations.some(item => item.id === data.activeConversationId)
            ? data.activeConversationId : serverConversations[0].id;
          const next = serverConversations.find(item => item.id === nextId) || serverConversations[0];
          setActiveConversationId(next.id);
          setMessages(next.messages || []);
          if (next.templateId) setSelectedTemplate(normalizeTemplateId(next.templateId));
          setSelectedModel(CREATOR_MODELS.some(item => item.id === next.model) ? next.model : 'gpt-5.6-terra');
          setReasoningEffort(REASONING_LEVELS.some(item => item.id === next.reasoningEffort) ? next.reasoningEffort : 'medium');
          setTotalSlides([3, 5, 7, 10].includes(Number(next.totalSlides)) ? Number(next.totalSlides) : 5);
          setNoImageSlides(Math.max(0, Math.min(Number(next.noImageSlides) || 0, [3, 5, 7, 10].includes(Number(next.totalSlides)) ? Number(next.totalSlides) : 5)));
        }
        setConversationSync('saved');
      })
      .catch(() => active && setConversationSync('offline'))
      .finally(() => active && setConversationsLoaded(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!conversationsLoaded) return undefined;
    setConversationSync('saving');
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/criador/conversations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversations, activeConversationId })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setConversationSync('saved');
      } catch {
        setConversationSync('offline');
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [conversations, activeConversationId, conversationsLoaded]);

  useEffect(() => {
    if (!activeConversationId) return;
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        let newTitle = c.title;
        if ((!newTitle || newTitle === 'Nova Conversa' || newTitle === 'Conversa Inicial') && messages.length > 0) {
          const firstUserMsg = messages.find(m => m.role === 'user');
          if (firstUserMsg && typeof firstUserMsg.content === 'string') {
            newTitle = firstUserMsg.content.trim().slice(0, 36) + (firstUserMsg.content.length > 36 ? '...' : '');
          }
        }
        return {
          ...c,
          title: newTitle,
          messages,
          templateId: selectedTemplate,
          model: selectedModel,
          reasoningEffort,
          totalSlides,
          noImageSlides,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
    try { sessionStorage.setItem('criador_chat_messages', JSON.stringify(messages)); } catch {}
  }, [messages, activeConversationId, selectedTemplate, selectedModel, reasoningEffort, totalSlides, noImageSlides]);

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    try { sessionStorage.setItem('criador_selected_template', templateId); } catch {}
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (tpl) showToast?.(`✓ Template ativo: ${tpl.label}`);
  };

  const handleNewConversation = () => {
    const newId = 'conv-' + Date.now();
    const newConv = {
      id: newId,
      title: 'Nova Conversa',
      messages: [],
      templateId: selectedTemplate,
      model: selectedModel,
      reasoningEffort,
      totalSlides,
      noImageSlides,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    setMessages([]);
    setInput('');
    setLastCarouselText(null);
    try {
      sessionStorage.setItem('criador_active_conv_id', newId);
      sessionStorage.removeItem('criador_chat_messages');
      sessionStorage.removeItem('criadorLastCarousel');
    } catch {}
    showToast?.('✦ Nova conversa iniciada');
  };

  const handleSelectConversation = (id) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    setActiveConversationId(id);
    setMessages(conv.messages || []);
    if (conv.templateId) setSelectedTemplate(normalizeTemplateId(conv.templateId));
    const conversationModel = CREATOR_MODELS.some(item => item.id === conv.model) ? conv.model : 'gpt-5.6-terra';
    const conversationEffort = REASONING_LEVELS.some(item => item.id === conv.reasoningEffort) ? conv.reasoningEffort : 'medium';
    const conversationSlides = [3, 5, 7, 10].includes(Number(conv.totalSlides)) ? Number(conv.totalSlides) : 5;
    setSelectedModel(conversationModel);
    setReasoningEffort(conversationEffort);
    setTotalSlides(conversationSlides);
    setNoImageSlides(Math.max(0, Math.min(Number(conv.noImageSlides) || 0, conversationSlides)));
    try {
      sessionStorage.setItem('criador_active_conv_id', id);
      sessionStorage.setItem('criador_chat_messages', JSON.stringify(conv.messages || []));
      sessionStorage.setItem('criador_selected_model', conversationModel);
      sessionStorage.setItem('criador_reasoning_effort', conversationEffort);
      sessionStorage.setItem('criador_total_slides', String(conversationSlides));
    } catch {}
  };

  const handleDeleteConversation = (id) => {
    const updated = conversations.filter(c => c.id !== id);
    if (updated.length === conversations.length) return;

    setConversations(updated);
    try { localStorage.setItem('criador_conversations_v2', JSON.stringify(updated)); } catch {}

    if (activeConversationId === id) {
      const next = updated[0];
      if (next) {
        setActiveConversationId(next.id);
        setMessages(next.messages || []);
        setSelectedTemplate(normalizeTemplateId(next.templateId || 'bella_tipografico'));
        setSelectedModel(CREATOR_MODELS.some(item => item.id === next.model) ? next.model : 'gpt-5.6-terra');
        setReasoningEffort(REASONING_LEVELS.some(item => item.id === next.reasoningEffort) ? next.reasoningEffort : 'medium');
        setTotalSlides([3, 5, 7, 10].includes(Number(next.totalSlides)) ? Number(next.totalSlides) : 5);
          setNoImageSlides(Math.max(0, Math.min(Number(next.noImageSlides) || 0, [3, 5, 7, 10].includes(Number(next.totalSlides)) ? Number(next.totalSlides) : 5)));
        try {
          sessionStorage.setItem('criador_active_conv_id', next.id);
          sessionStorage.setItem('criador_chat_messages', JSON.stringify(next.messages || []));
        } catch {}
      } else {
        setActiveConversationId(null);
        setMessages([]);
        setInput('');
        setLastCarouselText(null);
        try {
          sessionStorage.removeItem('criador_active_conv_id');
          sessionStorage.removeItem('criador_chat_messages');
          sessionStorage.removeItem('criadorLastCarousel');
        } catch {}
      }
    }
    showToast?.('Conversa excluída');
  };

  const handleRenameConversation = (id, newTitle) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c));
    showToast?.('Conversa renomeada');
  };

  const handleTogglePinConversation = (id) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text || generating) return;

    // "Use a pasta X": escolhe as pastas do Pinterest do usuário sem passar pelo modelo.
    const boardCommand = parseBoardCommand(text, boards);
    if (boardCommand) {
      setInput('');
      if (boardCommand.matched.length) {
        saveSelectedBoards(boardCommand.matched.map(board => board.id));
        chooseImageSource('pasta');
      }
      let reply;
      if (!boards.length) { reply = 'Você ainda não conectou nenhuma pasta do Pinterest. Abri o painel: cole o seu usuário ou o link de uma pasta pública e depois peça de novo.'; setBoardsOpen(true); }
      else if (!boardCommand.matched.length) reply = `Não encontrei uma pasta com esse nome. Suas pastas: ${boards.map(board => `“${board.name}”`).join(', ')}.`;
      else reply = `Combinado: as imagens deste carrossel virão ${boardCommand.matched.length > 1 ? 'das pastas' : 'da pasta'} ${boardCommand.matched.map(board => `“${board.name}”`).join(' e ')}.${boardCommand.missing.length ? ` (Não achei: ${boardCommand.missing.join(', ')}.)` : ''} Quando as imagens não servirem, a lâmina é gerada por IA.`;
      setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'ai', content: reply, id: 'ai-' + Date.now(), streaming: false }]);
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setGenerating(true);

    const aiMessageId = 'ai-' + Date.now();
    setMessages(prev => [...prev, {
      role: 'ai', content: '', id: aiMessageId, streaming: true,
      activities: [], activityStartedAt: Date.now()
    }]);

    const currentTpl = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
    let promptToSend = text;
    const isThemeSelection = /(?:^\d+[\.\)]\s*tema:|^tema:|^t[ií]tulo:)/i.test(text) || (text.includes('Tema:') && text.includes('Título:'));
    const isNumberedThemeSelection = /(?:tema|ideia|op[cç][aã]o|pauta)\s*(?:n[º°o.]?\s*)?#?\s*\d{1,2}\b|\b(?:primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa])\s+(?:tema|ideia|op[cç][aã]o|pauta)\b/i.test(text);
    const editorialIntent = (isThemeSelection || isNumberedThemeSelection)
      ? 'production'
      : (text === IDEAS_PROMPT ? 'ideas' : 'auto');
    if (isThemeSelection && !text.toLowerCase().includes('sugira') && !text.toLowerCase().includes('ideias')) {
      promptToSend = `Quero criar o carrossel com este tema selecionado no Template ${currentTpl.label} (Formato: ${currentTpl.format} | Preset: ${currentTpl.id}):\n${text}\n\nGere agora o roteiro completo de exatamente ${totalSlides} slides ([S1] até [S${totalSlides}]) com títulos completos e profundos (nunca use '...'), cópias com voz madura e acolhedora de Isabella Dalcin, Método T.A.F.A, e no slide final CTA oficial 'COMENTE BELLA' para a Academia Sete.`;
    }

    let fullText = '';
    let responseModel = selectedModel;
    let responseEffort = reasoningEffort;
    let costUsd = 0;
    let streamError = '';
    let orchestrationStages = [];
    let researchMode = '';
    try {
      const chatHistory = messages.filter(m => m.role !== 'form');
      const recentContentMemory = buildRecentContentMemory(conversations, activeConversationId);
      const res = await fetch('/api/criador/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatHistory, { role: 'user', content: promptToSend }],
          totalSlides,
          noImageSlidesCount: Math.min(noImageSlides, totalSlides),
          modoOraculo: oracleMode,
          template: selectedTemplate,
          format: currentTpl.format,
          model: selectedModel,
          reasoningEffort,
          recentContentMemory,
          editorialIntent
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.token) {
              fullText += data.token;
              setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullText } : m));
            }
            if (data.stage) {
              orchestrationStages = [...new Set([...orchestrationStages, data.stage])];
              setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, stage: data.stage, stageLabel: data.label || 'Construindo narrativa editorial' } : m));
            }
            if (data.activity && typeof data.activity === 'object') {
              setMessages(prev => prev.map(m => {
                if (m.id !== aiMessageId) return m;
                const activities = Array.isArray(m.activities) ? [...m.activities] : [];
                const activityIndex = activities.findIndex(item => item.id === data.activity.id);
                if (activityIndex >= 0) activities[activityIndex] = { ...activities[activityIndex], ...data.activity };
                else activities.push(data.activity);
                return { ...m, activities };
              }));
            }
            if (data.researchMode) researchMode = data.researchMode;
            if (Array.isArray(data.stages)) orchestrationStages = data.stages;
            if (data.costUSD !== undefined) costUsd = data.costUSD;
            if (data.model) responseModel = data.model;
            if (data.reasoningEffort) responseEffort = data.reasoningEffort;
            if (data.error) streamError = data.error;
            if (data.done && data.content) {
              fullText = data.content;
              setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: fullText } : m));
            }
          } catch {}
        }
      }
      if (streamError) throw new Error(streamError);
    } catch (err) {
      const connectionFailure = err instanceof TypeError || /failed to fetch|network|load failed/i.test(String(err?.message || ''));
      fullText = connectionFailure
        ? 'O Oráculo ficou temporariamente sem conexão com o estúdio de criação. Sua mensagem foi preservada — tente enviar novamente em alguns segundos.'
        : `Não consegui concluir esta resposta agora. Motivo: ${err.message || 'falha inesperada'}. Tente novamente.`;
    } finally {
      const parsed = parseCarouselText(fullText);
      const slidesList = parsed?.slides || (Array.isArray(parsed) ? parsed : []);
      const isCarousel = slidesList.length >= 2 || fullText.includes('[S1') || fullText.includes('[S01');
      if (isCarousel) {
        setLastCarouselText(fullText);
        sessionStorage.setItem('criadorLastCarousel', fullText);
      }
      setMessages(prev => prev.map(m => m.id === aiMessageId ? {
        ...m,
        content: fullText,
        streaming: false,
        activityFinishedAt: Date.now(),
        isCarousel,
        parsedPayload: parsed,
        parsedSlides: slidesList,
        model: responseModel,
        reasoningEffort: responseEffort,
        costUSD: costUsd,
        orchestrationStages,
        researchMode,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' de ' + new Date().toLocaleDateString('pt-BR')
      } : m));
      setGenerating(false);
    }
  };

  // Edição do roteiro: grava título/texto de um slide de volta no texto bruto da mensagem (fonte da verdade da geração).
  const handleSaveSlide = (index, num, fields) => {
    const message = messages[index];
    const next = message ? replaceSlideFields(message.content, num, fields) : null;
    if (!next) { showToast?.('Não consegui salvar esta edição. Tente de novo.'); return false; }
    const parsed = parseCarouselText(next);
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, content: next, parsedPayload: parsed, parsedSlides: parsed?.slides?.length ? parsed.slides : m.parsedSlides, edited: true } : m));
    if (message.isCarousel) {
      setLastCarouselText(next);
      try { sessionStorage.setItem('criadorLastCarousel', next); } catch {}
    }
    showToast?.(`Slide ${num} atualizado.`);
    return true;
  };

  // Pede ao Oráculo para reescrever um trecho (ou o slide inteiro) conforme o que a Isabella escreveu.
  const handleRewrite = async request => {
    try {
      const res = await customFetch('/api/criador/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, model: selectedModel, usesMarkup: /\[\[[^\]]+\]\]/.test(`${request.title}\n${request.body}`) })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Não consegui ajustar agora. Tente de novo.' };
      return data;
    } catch { return { ok: false, error: 'Falha de conexão com o servidor.' }; }
  };

  const handleCreateCarousel = async (carouselText, slides) => {
    if (!carouselText || startingCarousel) return;
    const currentTpl = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
    if (typeof onStartGeneration === 'function') {
      setStartingCarousel(true);
      try {
        await onStartGeneration(carouselText, null, {
          slides,
          preset: selectedTemplate,
          template: selectedTemplate,
          format: currentTpl.format,
          totalSlides,
          noImageSlidesCount: Math.min(noImageSlides, totalSlides),
          imageSource,
          pinterestBoards: imageSource === 'pasta' ? selectedBoards.map(board => ({ url: board.url, name: board.name })) : undefined
        });
      } finally {
        setStartingCarousel(false);
      }
    }
  };

  const activeTemplate = getTemplate(selectedTemplate);

  return (
    <div className="main-view active" id="view-criador" style={{ '--creator-accent': activeTemplate.color, '--creator-accent-rgb': activeTemplate.accentRgb, display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      <CriadorHistorySidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        isOpen={isHistoryOpen}
        onToggleOpen={() => setIsHistoryOpen(prev => !prev)}
        syncStatus={conversationSync}
      />

      <div className="criador-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        
        <div className="creator-toolbar">
          <div className="creator-toolbar-primary">
            <CriadorTemplateBar selectedTemplate={selectedTemplate} onSelectTemplate={handleSelectTemplate} disabled={generating} />
            <span className="creator-template-context">{activeTemplate.desc}</span>
          </div>

          <div className="creator-toolbar-actions">
            <ModelExperienceSelector
              model={selectedModel}
              effort={reasoningEffort}
              disabled={generating}
              onModelChange={(value) => {
                setSelectedModel(value);
                try { sessionStorage.setItem('criador_selected_model', value); } catch {}
                const item = CREATOR_MODELS.find(model => model.id === value);
                showToast?.(`Modelo ativo: ${item?.name || value}`);
              }}
              onEffortChange={(value) => {
                setReasoningEffort(value);
                try { sessionStorage.setItem('criador_reasoning_effort', value); } catch {}
                const item = REASONING_LEVELS.find(level => level.id === value);
                showToast?.(`Profundidade: ${item?.label || value}`);
              }}
            />

            <SlideCountSelector
              value={totalSlides}
              disabled={generating}
              onChange={(value) => {
                setTotalSlides(value);
                try { sessionStorage.setItem('criador_total_slides', String(value)); } catch {}
                if (noImageSlides > value) {
                  setNoImageSlides(value);
                  try { sessionStorage.setItem('criador_no_image_slides', String(value)); } catch {}
                }
                showToast?.(`${value} lâminas selecionadas`);
              }}
            />

            <OracleModeSelector
              value={oracleMode}
              disabled={generating}
              onChange={(value) => {
                setOracleMode(value);
                try { sessionStorage.setItem('criador_oracle_mode', value); } catch {}
                showToast?.(value === 'simples' ? 'Oráculo: versão simples (teste)' : 'Oráculo: versão completa');
              }}
            />

            <ImageSourceSelector
              value={imageSource}
              disabled={generating}
              selectedBoards={selectedBoards}
              onManageBoards={() => setBoardsOpen(true)}
              onChange={(value) => {
                chooseImageSource(value);
                showToast?.(value === 'pasta' ? 'Imagens: das suas pastas do Pinterest' : value === 'pinterest' ? 'Imagens: curadoria Pinterest (teste)' : 'Imagens: geradas por IA');
              }}
            />
            {boardsOpen && (
              <PinterestBoardsPanel
                boards={boards}
                selectedIds={selectedBoardIds}
                onToggle={toggleBoard}
                onPreview={previewBoards}
                onAdd={addBoards}
                onSync={syncBoards}
                onDisconnect={disconnectProfile}
                onRemove={removeBoard}
                onClose={() => setBoardsOpen(false)}
              />
            )}

            <NoImageSlidesSelector
              value={Math.min(noImageSlides, totalSlides)}
              total={totalSlides}
              disabled={generating}
              onChange={(value) => {
                setNoImageSlides(value);
                try { sessionStorage.setItem('criador_no_image_slides', String(value)); } catch {}
                showToast?.(value === 0 ? 'Todas as lâminas com imagem' : `${value} lâmina(s) só com fundo de cor · ${totalSlides - value} com imagem`);
              }}
            />

            <button onClick={handleNewConversation} className="creator-icon-action" title="Nova conversa" aria-label="Nova conversa">
              +
            </button>
            <button onClick={() => { exportChatToHtml(messages); showToast?.('Chat exportado para HTML!'); }} className="creator-text-action">
              Exportar
            </button>
          </div>
        </div>

        <CriadorChatList
          messages={messages}
          generating={generating}
          isMockFlow={isMockFlow}
          onSend={handleSend}
          onCopy={(text) => { navigator.clipboard.writeText(text); showToast?.('Texto copiado!'); }}
          onCreateCarousel={handleCreateCarousel}
          onSaveSlide={handleSaveSlide}
          onRewrite={handleRewrite}
          startingCarousel={startingCarousel}
          msgsRef={msgsRef}
          scrollAnchorRef={scrollAnchorRef}
          IDEAS_PROMPT={IDEAS_PROMPT}
          selectedTemplate={selectedTemplate}
        />

        <div className="creator-composer">
          <div className="criador-input-box">
            <button className="criador-ideias-btn" onClick={() => handleSend(IDEAS_PROMPT)} disabled={generating} title="Pedir 5 ideias de temas validados para Isabella Dalcin">
              ✦ <span>Inspirar tema</span>
            </button>
            <button className="criador-ideias-btn criador-pastas-btn" onClick={() => setBoardsOpen(true)} disabled={generating} title="Conectar suas pastas do Pinterest e usar as imagens delas nos carrosséis">
              📌 <span>Minhas pastas{imageSource === 'pasta' && selectedBoards.length ? ` (${selectedBoards.length})` : ''}</span>
            </button>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <textarea
                ref={inputRef}
                rows={1}
                className="criador-input-field"
                placeholder={generating ? "Gerando roteiro..." : "Digite o tema do carrossel ou faça uma pergunta..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter envia; Shift+Enter quebra a linha (e a caixa cresce junto). Não envia no meio de uma composição de acento.
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); handleSend(); }
                }}
                disabled={generating}
                aria-label="Mensagem para o Oráculo. Enter envia, Shift+Enter quebra a linha."
              />
              <button className="criador-send-button" onClick={() => handleSend()} disabled={generating || !input.trim()} title="Enviar">
                {generating ? '⏳' : '➤'}
              </button>
            </div>
          </div>
          <div className="criador-input-hint"><kbd>Enter</kbd> envia · <kbd>Shift</kbd> + <kbd>Enter</kbd> quebra a linha</div>
        </div>
      </div>
    </div>
  );
}
