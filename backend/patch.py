
with open('dashboard/public/index.html', encoding='utf-8') as f:
    content = f.read()

# 1. Injetar a nova aba
if 'switchMainTab(\'fabrica\'' not in content:
    content = content.replace(
        '<div class="main-tab" onclick="switchMainTab(\'radar\', this)">📡 Radar de Descobertas</div>',
        '<div class="main-tab" onclick="switchMainTab(\'radar\', this)">📡 Radar de Descobertas</div>\n  <div class="main-tab" onclick="switchMainTab(\'fabrica\', this)">🏭 Fábrica de Vídeos</div>'
    )

# 2. Injetar a VIEW
view_html = '''
<!-- VIEW: Fábrica de Vídeos -->
<div class="main-view" id="view-fabrica">
  <div class="oraculo-header">
    <div>
      <div class="oraculo-title">FÁBRICA DE VÍDEOS (Seedance 2.0 + ElevenLabs)</div>
      <div class="oraculo-subtitle">Gere vídeos completos (12s) com narração misteriosa e cena Dark Fantasy. Os arquivos serão salvos em campanhas/reels/temp/</div>
    </div>
  </div>
  <div class="section" style="display:flex; gap:20px; align-items:flex-start;">
    <div style="flex:1; background:var(--card); padding:20px; border-radius:10px; border:1px solid var(--gray-dim);">
      <div class="form-group">
        <label class="form-label">Tema do Vídeo</label>
        <div style="display:flex; gap:10px;">
          <input type="text" id="video-tema" class="form-input" style="flex:1" placeholder="Ex: O verdadeiro motivo pelo qual colocam flúor na água..." />
          <button class="btn btn-gold" id="btn-video-run" onclick="runVideoFactory()">🚀 Produzir Vídeo</button>
        </div>
      </div>
      <div style="margin-top:20px;">
        <label class="form-label">Progresso da IA (Terminal)</label>
        <div id="video-terminal" style="background:#0a0a0a; border:1px solid #333; border-radius:6px; padding:10px; height:350px; overflow-y:auto; font-family:monospace; font-size:12px; color:#3ACC7A; display:flex; flex-direction:column; gap:6px; line-height: 1.4;">
          <div style="color:#666;">Aguardando inserção de tema...</div>
        </div>
      </div>
    </div>
  </div>
</div>
'''
if 'id="view-fabrica"' not in content:
    content = content.replace('<!-- VIEW: Oráculo -->', view_html + '\n<!-- VIEW: Oráculo -->')

# 3. Injetar a função JS
js_html = '''
function runVideoFactory() {
  const tema = document.getElementById('video-tema').value.trim();
  if (!tema) return alert('Insira um tema!');
  const btn = document.getElementById('btn-video-run');
  btn.disabled = true;
  btn.textContent = 'Processando...';
  const term = document.getElementById('video-terminal');
  term.innerHTML = '';
  const d = document.createElement('div');
  d.textContent = `> Iniciando fábrica para: ${tema}`;
  term.appendChild(d);
  const eventSource = new EventSource(`/api/video/generate?tema=${encodeURIComponent(tema)}`);
  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'log' || data.type === 'error') {
      const line = document.createElement('div');
      line.textContent = `> ${data.message}`;
      if(data.type === 'error') line.style.color = '#CC4455';
      term.appendChild(line);
      term.scrollTop = term.scrollHeight;
    } else if (data.type === 'done') {
      eventSource.close();
      btn.disabled = false;
      btn.textContent = '🚀 Produzir Vídeo';
      const line = document.createElement('div');
      line.textContent = '> -----------------------------------------------------';
      line.style.color = 'var(--gold)';
      const line2 = document.createElement('div');
      line2.textContent = '> PROCESSO CONCLUÍDO COM SUCESSO!';
      line2.style.color = 'var(--gold)';
      line2.style.fontWeight = 'bold';
      term.appendChild(line);
      term.appendChild(line2);
      term.scrollTop = term.scrollHeight;
    }
  };
  eventSource.onerror = function() {
    eventSource.close();
    btn.disabled = false;
    btn.textContent = '🚀 Produzir Vídeo';
  };
}
'''
if 'function runVideoFactory' not in content:
    content = content.replace('// ── Global SSE Events (Progress) ──', js_html + '\n// ── Global SSE Events (Progress) ──')

with open('dashboard/public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML patched successfully!")
