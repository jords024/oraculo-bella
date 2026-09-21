// ── Criador ────────────────────────────────────────────────────────────────
let criadorHistory = []; // [{role, content}]
let criadorStreaming = false;

// Persiste o último carrossel em sessionStorage (sobrevive a hard refresh)
let criadorLastCarousel = sessionStorage.getItem('criadorLastCarousel') || null;
function setCriadorLastCarousel(text) {
  criadorLastCarousel = text;
  try { sessionStorage.setItem('criadorLastCarousel', text); } catch {}
}

// Detecta intenção de criar/gerar o carrossel (pipeline de imagens)
// Regra: só intercepta quando é um COMANDO CURTO sem tema novo.
// Pedidos como "crie um conteúdo sobre X" vão sempre para o oráculo.
function isCriarIntent(text) {
  const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Sem carrossel salvo → NUNCA intercepta, tudo vai pro oráculo
  if (!criadorLastCarousel) return false;

  const verbo = /\b(criar|cria|crie|gerar|gera|gere|bora|faz|faca|fazer|produz|monta|execute|executa|dispara|ativa|roda|vai|cria)\b/;
  if (!verbo.test(t)) return false;

  // Se a mensagem sugere NOVO conteúdo / novo tema → vai pro oráculo
  // (ex: "crie um conteúdo sobre X", "gera outra versão", "faz um gancho")
  const novoConteudo = /\b(sobre|com a|relacionado|baseado|partindo|a partir|novo|nova|diferente|outra|outro|tema|ideia|versao|variacao|gancho|hook|roteiro|legenda|caption|copy|texto)\b/;
  if (novoConteudo.test(t)) return false;

  // Comando curto (até 6 palavras) + verbo = pipeline de imagens
  return t.trim().split(/\s+/).length <= 6;
}


function criadorSuggest(text) {
  document.getElementById('criador-input').value = text;
  document.getElementById('criador-input').style.height = 'auto';
  document.getElementById('criador-input').style.height =
    Math.min(document.getElementById('criador-input').scrollHeight, 160) + 'px';
  criadorSend();
}

function criadorKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    criadorSend();
  }
}

async function criadorSend() {
  if (criadorStreaming) return;
  const inp = document.getElementById('criador-input');
  const text = inp.value.trim();
  if (!text) return;

  // Limpa a tela de boas-vindas na primeira mensagem
  const welcome = document.querySelector('.criador-welcome');
  if (welcome) welcome.remove();

  inp.value = '';
  inp.style.height = 'auto';

  // ── Intenção de criar carrossel ──────────────────────────────────────────
  if (isCriarIntent(text)) {
    criadorAddMsg('user', text);
    const aiId = 'criador-ai-' + Date.now();
    if (!criadorLastCarousel) {
      criadorAddMsg('ai',
        '⚠ Ainda não há carrossel pronto para criar.\n\n' +
        'Me peça um tema primeiro — ex: *"carrossel sobre dinheiro e culpa bíblica"* — ' +
        'e quando eu entregar o carrossel completo, clique em **✦ Criar design** ' +
        'ou diga "gera" / "cria" / "vai".',
        aiId
      );
      return;
    }
    criadorAddMsg('ai', '✦ Iniciando criação das imagens...', aiId);
    await criadorAutoCreate(criadorLastCarousel, aiId);
    return;
  }

  // Adiciona mensagem do usuário
  criadorHistory.push({ role: 'user', content: text });
  criadorAddMsg('user', text);

  // Cria bolha da IA (vazia) e streaming
  const aiId = 'criador-ai-' + Date.now();
  criadorAddMsg('ai', '', aiId);
  criadorStreaming = true;
  document.getElementById('criador-send-btn').disabled = true;
  document.getElementById('criador-status').textContent = 'gerando...';

  let fullText = '';

  try {
    const res = await fetch('/api/criador/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: criadorHistory }),
    });

    if (!res.ok) {
      const err = await res.json();
      criadorSetBubble(aiId, '⚠ Erro: ' + (err.error || res.status));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(t.slice(6));
          if (json.error) { criadorSetBubble(aiId, '⚠ Erro: ' + json.error); return; }
          if (json.token) {
            fullText += json.token;
            criadorSetBubble(aiId, fullText, true); // true = ainda streamando
          }
          if (json.done) {
            criadorSetBubble(aiId, fullText, false); // remove cursor
            criadorShowActions(aiId, fullText);
          }
        } catch {}
      }
    }

    // Fallback: se chegou fim sem evento done
    if (fullText) {
      criadorSetBubble(aiId, fullText, false);
      criadorShowActions(aiId, fullText);
    }

    criadorHistory.push({ role: 'assistant', content: fullText });
    // Guarda como último carrossel disponível para criação (persiste em sessionStorage)
    if (fullText.includes('[S1') || fullText.includes('DISRUPÇÃO')) {
      setCriadorLastCarousel(fullText);
    }

  } catch (e) {
    criadorSetBubble(aiId, '⚠ Erro de rede: ' + e.message);
  } finally {
    criadorStreaming = false;
    document.getElementById('criador-send-btn').disabled = false;
    document.getElementById('criador-status').textContent = 'pronto';
  }
}

function criadorAddMsg(role, text, id) {
  const msgs = document.getElementById('criador-msgs');
  const wrap = document.createElement('div');
  wrap.className = `criador-msg criador-msg--${role}`;
  if (id) wrap.id = id + '-wrap';

  const avatar = document.createElement('div');
  avatar.className = 'criador-avatar';
  avatar.textContent = role === 'user' ? '✦' : '◈';

  const bubble = document.createElement('div');
  bubble.className = 'criador-bubble';
  if (id) bubble.id = id;
  bubble.textContent = text;
  if (role === 'ai' && !text) {
    const cursor = document.createElement('span');
    cursor.className = 'criador-cursor';
    bubble.appendChild(cursor);
  }

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function criadorSetBubble(id, text, streaming) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  if (streaming) {
    const cursor = document.createElement('span');
    cursor.className = 'criador-cursor';
    el.appendChild(cursor);
  }
  const msgs = document.getElementById('criador-msgs');
  msgs.scrollTop = msgs.scrollHeight;
}

function criadorShowActions(id, text) {
  const wrap = document.getElementById(id + '-wrap');
  if (!wrap) return;
  const actions = document.createElement('div');
  actions.className = 'criador-msg-actions';

  // Botão copiar
  const btnCopy = document.createElement('button');
  btnCopy.className = 'criador-action-btn criador-action-btn--copy';
  btnCopy.textContent = '⎘ Copiar tudo';
  btnCopy.onclick = () => {
    navigator.clipboard.writeText(text);
    btnCopy.textContent = '✓ Copiado!';
    setTimeout(() => { btnCopy.textContent = '⎘ Copiar tudo'; }, 2000);
  };

  // Botão salvar rascunho
  const btnDraft = document.createElement('button');
  btnDraft.className = 'criador-action-btn';
  btnDraft.textContent = '+ Salvar rascunho';
  btnDraft.onclick = () => criadorSaveDraft(text, btnDraft);

  actions.appendChild(btnCopy);
  actions.appendChild(btnDraft);

  // Botão "Criar design" — só aparece quando a resposta tem carrossel completo
  const hasCarousel = text.includes('[S1') || text.includes('DISRUPÇÃO') || text.includes('SLIDES:');
  if (hasCarousel) {
    setCriadorLastCarousel(text); // garante que está salvo
    const btnCreate = document.createElement('button');
    btnCreate.className = 'criador-action-btn criador-action-btn--create';
    btnCreate.textContent = '✦ Criar design';
    btnCreate.onclick = async () => {
      btnCreate.disabled = true;
      btnCreate.textContent = '⟳ Iniciando...';
      const feedbackId = 'criador-ai-' + Date.now();
      criadorAddMsg('ai', '✦ Iniciando criação das imagens...', feedbackId);
      document.getElementById('criador-msgs').scrollTop = 99999;
      await criadorAutoCreate(text, feedbackId);
      btnCreate.disabled = false;
      btnCreate.textContent = '✦ Criar design';
    };
    actions.appendChild(btnCreate);
  }

  // Insere depois do wrap da mensagem AI
  wrap.after(actions);
}

// ── Parser robusto do output do Criador ──────────────────────────────────────
function criadorParseOutput(text) {
  // Normaliza quebras de linha
  const t = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const temaMatch    = t.match(/TEMA:\s*(.+)/i);
  const praçaMatch   = t.match(/PRA[ÇC]A:\s*(.+)/i);
  const bigIdea      = t.match(/BIG IDEA:\s*(.+)/i);
  const revisorMatch = t.match(/TOTAL:\s*([\d]+\/15)/i);
  const captionMatch = t.match(/CAPTION[^:\n]*:\s*\n([\s\S]+?)(?=\nCTA TRIBAL|━)/i);
  const ctaMatch     = t.match(/CTA TRIBAL:\s*"?([^"\n]+)"?/i);

  const title   = temaMatch   ? temaMatch[1].trim().slice(0, 80)   : 'Carrossel Fonte Oculta';
  const caption = (captionMatch?.[1] || bigIdea?.[1] || '').trim().slice(0, 800);

  // ── Parser linha-a-linha (robusto a variações de formato do modelo) ──────
  const slides = [];
  const lines  = t.split('\n');

  // Detecta início de bloco de slide: [S1 ...] ou [S1— ...] etc.
  const slideHeader = /^\[S(\d+)\s*[—–\-]+\s*([^\]|]+?)(?:\s*\|\s*layout:\s*(\w+))?\s*\]/i;

  let current = null;
  let field   = null; // 'titulo' | 'corpo' | 'visual'

  const flush = () => {
    if (current && current.title) {
      slides.push({
        num:    current.num,
        estado: current.estado,
        layout: current.layout,
        title:  current.title.trim(),
        body:   current.body.trim(),
        prompt: current.prompt.trim(),
      });
    }
    current = null;
    field   = null;
  };

  for (const raw of lines) {
    const line = raw.trim();

    // Novo bloco de slide
    const hm = line.match(slideHeader);
    if (hm) {
      flush();
      current = {
        num:    hm[1].padStart(2, '0'),
        estado: hm[2].trim().replace(/[^\w\s]/g, '').trim().toUpperCase(),
        layout: (hm[3] || 'fullbleed').trim(),
        title:  '',
        body:   '',
        prompt: '',
      };
      field = null;
      continue;
    }

    if (!current) continue;

    // Detecta campos — aceita com e sem acento
    if (/^T[IÍ]TULO:\s*/i.test(line)) {
      field = 'title';
      current.title = line.replace(/^T[IÍ]TULO:\s*/i, '');
      continue;
    }
    if (/^CORPO:\s*/i.test(line)) {
      field = 'body';
      current.body = line.replace(/^CORPO:\s*/i, '');
      continue;
    }
    if (/^VISUAL:\s*/i.test(line)) {
      field = 'prompt';
      current.prompt = line.replace(/^VISUAL:\s*/i, '');
      continue;
    }

    // Continuação de campo (linha em branco reseta)
    if (line === '') {
      if (field === 'prompt') field = null; // VISUAL termina em linha em branco
      continue;
    }

    if (field === 'title')  current.title  += '\n' + line;
    if (field === 'body')   current.body   += '\n' + line;
    if (field === 'prompt') current.prompt += ' '  + line;
  }
  flush();

  return {
    title,
    theme:         title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').slice(0, 48),
    format:        praçaMatch?.[1]?.trim().slice(0, 20) || 'B',
    caption,
    notes:         ctaMatch?.[1]?.trim() || '',
    revisor_score: revisorMatch?.[1] || '',
    slides,
  };
}

// Criação automática ao detectar intenção
async function criadorAutoCreate(text, feedbackId) {
  const payload = criadorParseOutput(text);

  if (payload.slides.length === 0) {
    criadorSetBubble(feedbackId,
      '⚠ Não consegui extrair os slides.\n\n' +
      'O carrossel precisa estar no formato completo com [S1 — DISRUPÇÃO | layout: ...] antes de criar.\n' +
      'Peça "gera o carrossel completo sobre [tema]" e depois diga "criar esse carrossel".'
    );
    return;
  }

  criadorSetBubble(feedbackId,
    `✦ Iniciando geração de ${payload.slides.length} slides...\n` +
    `Tema: ${payload.title}\n\nIsso vai levar alguns minutos. Acompanhe o progresso abaixo:`
  );

  // Barra de progresso
  const progWrap = document.createElement('div');
  progWrap.style.cssText = 'padding:12px 12px 12px 44px;';
  const progBar = document.createElement('div');
  progBar.style.cssText = 'background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px 16px;font-size:12px;color:var(--text-2);font-family:monospace;white-space:pre-wrap;max-height:200px;overflow-y:auto;';
  progWrap.appendChild(progBar);

  const aiWrap = document.getElementById(feedbackId + '-wrap');
  if (aiWrap) aiWrap.after(progWrap);
  document.getElementById('criador-msgs').scrollTop = 99999;

  function logProg(line) {
    progBar.textContent += line + '\n';
    progBar.scrollTop = progBar.scrollHeight;
    document.getElementById('criador-msgs').scrollTop = 99999;
  }

  try {
    const res = await fetch('/api/criador/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      criadorSetBubble(feedbackId, '⚠ Erro ao iniciar pipeline: ' + (err.error || res.status));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let carouselId = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data: ')) continue;
        try {
          const obj = JSON.parse(t.slice(6));

          if (obj.type === 'start') {
            logProg(`▶ Iniciando — ${obj.total} slides — ${obj.title}`);
          } else if (obj.type === 'slide') {
            const icon = obj.status === 'ok' ? '✓' : obj.status === 'erro' ? '✗' : '⟳';
            logProg(`${icon} S${String(obj.num).padStart(2,'0')} [${obj.estado}] — ${obj.status}${obj.msg ? ': ' + obj.msg : ''}`);
          } else if (obj.type === 'done') {
            // Local: Python registrou e enviou o id
            if (obj.id) carouselId = obj.id;
            logProg(`\n✦ Geração concluída! ${obj.total_ok}/${obj.total} slides.${obj.id ? '\nID: ' + obj.id : ' Enviando para B2...'}`);
          } else if (obj.type === 'registered') {
            // Render: Node.js fez upload B2 e registrou
            carouselId = obj.id;
            logProg(`\n✦ Carrossel ${obj.id} registrado no B2!`);
          } else if (obj.type === 'error') {
            logProg(`✗ ERRO: ${obj.msg}`);
          } else if (obj.type === 'log') {
            // logs internos — mostra tudo (inclui progresso do B2)
            if (obj.msg) logProg(`  ${obj.msg}`);
          }
        } catch {}
      }
    }

    // Finaliza
    if (carouselId) {
      criadorSetBubble(feedbackId,
        `✦ Carrossel gerado com sucesso!\n"${payload.title}"\n\nNavegando para Carrosséis...`
      );
      await loadCarousels();
      setTimeout(() => {
        switchMainTab('carrosseis', document.querySelector('.nav-item[data-tab="carrosseis"]'));
        showToast(`✦ "${payload.title}" gerado com sucesso!`);
        setTimeout(() => {
          const card = document.querySelector(`[data-id="${carouselId}"]`);
          if (card) card.click();
        }, 500);
      }, 1000);
    } else {
      criadorSetBubble(feedbackId, '⚠ Pipeline encerrou sem registrar o carrossel. Verifique os logs acima.');
    }

  } catch (e) {
    criadorSetBubble(feedbackId, '⚠ Erro de rede: ' + e.message);
  }
}

// Salva rascunho estruturado (usado no Render onde não tem pipeline Python)
async function criadorSaveFullDraft(payload, feedbackId) {
  const notesText = `=== SLIDES ===\n` + payload.slides.map(s =>
    `[S${s.num} — ${s.estado} | layout: ${s.layout}]\nTÍTULO: ${s.title}\nCORPO: ${s.body}\nVISUAL: ${s.prompt}`
  ).join('\n\n') + `\n\n=== CAPTION ===\n${payload.caption}\n\n=== CTA ===\n${payload.notes}`;

  try {
    const res = await fetch('/api/carousels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:   payload.title,
        theme:   payload.theme,
        notes:   notesText,
        status:  'rascunho',
        caption: payload.caption,
        format:  payload.format,
      }),
    });
    if (res.ok) {
      const carousel = await res.json();
      criadorSetBubble(feedbackId,
        `✦ Rascunho salvo!\n"${payload.title}"\n${payload.slides.length} slides com copy e prompts de imagem.\n\n` +
        `Para gerar as imagens: rode o servidor local e abra este rascunho lá.`
      );
      await loadCarousels();
      setTimeout(() => {
        switchMainTab('carrosseis', document.querySelector('.nav-item[data-tab="carrosseis"]'));
        showToast(`✦ "${payload.title}" salvo como rascunho!`);
      }, 800);
    } else {
      const err = await res.json();
      criadorSetBubble(feedbackId, '⚠ Erro ao salvar: ' + (err.error || res.status));
    }
  } catch (e) {
    criadorSetBubble(feedbackId, '⚠ Erro de rede: ' + e.message);
  }
}

async function criadorSaveDraft(text, btn) {
  // Extrai título das primeiras linhas (procura TEMA: ou pega as primeiras palavras)
  const temaMatch = text.match(/TEMA:\s*(.+)/i);
  const bigIdeaMatch = text.match(/BIG IDEA:\s*(.+)/i);
  const title = temaMatch
    ? temaMatch[1].trim().slice(0, 80)
    : text.slice(0, 60).replace(/\n/g, ' ') + '...';

  try {
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    const res = await fetch('/api/carousels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        theme: temaMatch?.[1]?.trim() || '',
        notes: text,
        status: 'rascunho',
        caption: bigIdeaMatch?.[1]?.trim() || '',
      }),
    });
    if (res.ok) {
      btn.textContent = '✓ Salvo!';
      showToast('Rascunho salvo em Carrosséis ✦');
      loadCarousels(); // atualiza lista
    } else {
      btn.textContent = '✗ Erro';
    }
    setTimeout(() => { btn.textContent = '+ Salvar rascunho'; btn.disabled = false; }, 2500);
  } catch (e) {
    btn.textContent = '✗ Erro de rede';
    setTimeout(() => { btn.textContent = '+ Salvar rascunho'; btn.disabled = false; }, 2500);
  }
}