import React, { useState, useEffect } from 'react';

export default function GeneralTab({
  settingsData,
  pendingUpdates,
  setPendingUpdates,
  setSettingsData,
  showToast,
  currentUser
}) {
  const [activeCategory, setActiveCategory] = useState('provedores');
  const [openaiBalance, setOpenaiBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  useEffect(() => {
    if (isSuperAdmin && activeCategory === 'provedores') {
      loadOpenAIBalance();
    }
  }, [isSuperAdmin, activeCategory]);

  const loadOpenAIBalance = async () => {
    setBalanceLoading(true);
    try {
      const token = localStorage.getItem('fo_token');
      const res = await fetch('/api/settings/openai-balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOpenaiBalance(data);
    } catch (e) {
      setOpenaiBalance({
        ok: false,
        error: 'Erro de rede.',
        billingUrl: 'https://platform.openai.com/settings/organization/billing/overview'
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  const toggleVisibility = (key) => {
    const input = document.getElementById(`key-${key}`);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  };

  const selectProvider = (selectedProv, isConfigured, keyName) => {
    if (!isConfigured) {
      if (showToast) showToast(`⚠️ A chave ${keyName} ainda não está configurada. Insira sua chave na aba "Chaves de Imagem & IA".`, 'error');
      setActiveCategory('imagem');
      return;
    }
    setPendingUpdates(prev => ({ ...prev, ACTIVE_IMAGE_PROVIDER: selectedProv }));
    setSettingsData(prev => ({ ...prev, activeProvider: selectedProv }));
    const providerNames = {
      'gpt-image-2': 'GPT Image 2 (DALL-E 3)',
      'gpt-image-1-mini': 'GPT Image 1 Mini (Econômico)',
      'fal': 'Fal.ai (Flux / SDXL)',
      'gemini': 'Gemini Imagen'
    };
    if (showToast) showToast(`✓ ${providerNames[selectedProv] || selectedProv} selecionado! Clique em "Salvar Configurações" no topo para aplicar.`, 'info');
  };

  const keysMap = {};
  if (settingsData && settingsData.keys) {
    settingsData.keys.forEach(k => { keysMap[k.key] = k; });
  }

  const openaiSet = !!(keysMap['OPENAI_API_KEY'] && keysMap['OPENAI_API_KEY'].set);
  const falSet = !!(keysMap['FAL_KEY'] && keysMap['FAL_KEY'].set);
  const geminiSet = !!(keysMap['GEMINI_API_KEY'] && keysMap['GEMINI_API_KEY'].set);

  const provider = pendingUpdates?.ACTIVE_IMAGE_PROVIDER || settingsData?.activeProvider || 'gpt-image-2';

  const groups = {};
  if (settingsData?.keys) {
    settingsData.keys.forEach(k => {
      if (!groups[k.group]) groups[k.group] = [];
      groups[k.group].push(k);
    });
  }

  const categoryMapping = {
    imagem: 'Geração de Imagem',
    audio: 'Áudio',
    publicacao: 'Publicação',
    integracoes: 'Integrações'
  };

  const filteredGroups = Object.entries(groups).filter(([groupName]) => {
    if (categoryMapping[activeCategory]) {
      return groupName === categoryMapping[activeCategory];
    }
    return false;
  });

  const formatUSD = (value) => {
    if (value === null || value === undefined) return '—';
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <div className="section">
      {/* Navegação por Sub-abas de Categorias */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'provedores' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('provedores')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          ⚡ Provedores &amp; Modelos
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'imagem' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('imagem')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          🖼️ Chaves de Imagem &amp; IA
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'audio' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('audio')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          🎙️ Áudio
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'publicacao' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('publicacao')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          ✈️ Publicação &amp; Social
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeCategory === 'integracoes' ? 'btn-gold' : 'btn-outline'}`}
          onClick={() => setActiveCategory('integracoes')}
          style={{ borderRadius: '20px', fontSize: '11px', padding: '6px 14px', letterSpacing: '0.3px' }}
        >
          🔌 Integrações
        </button>
      </div>

      {/* Conteúdo da Aba: Provedores & Modelos */}
      {activeCategory === 'provedores' && (
        <>
          <div className="settings-group">
            <div className="settings-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Provedor de Geração de Imagens
            </div>
            <div className="settings-group-sub">Escolha qual API será usada para gerar as imagens dos slides</div>
            <div className="provider-selector">
              <div
                className={`provider-card ${provider === 'gpt-image-2' ? 'active' : ''} ${!openaiSet ? 'disabled-card' : ''}`}
                onClick={() => selectProvider('gpt-image-2', openaiSet, 'OPENAI_API_KEY')}
                style={{ opacity: openaiSet ? 1 : 0.6, cursor: 'pointer' }}
                title={openaiSet ? 'Clique para selecionar GPT Image 2' : 'Requer OPENAI_API_KEY'}
              >
                <div className="provider-icon">🤖</div>
                <div className="provider-name">GPT Image 2</div>
                <div className="provider-desc">OpenAI · DALL-E 3 · ~$0.08/img</div>
                {!openaiSet && <div style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px' }}>⚠️ Chave não configurada</div>}
              </div>
              <div
                className={`provider-card ${provider === 'gpt-image-1-mini' ? 'active' : ''} ${!openaiSet ? 'disabled-card' : ''}`}
                onClick={() => selectProvider('gpt-image-1-mini', openaiSet, 'OPENAI_API_KEY')}
                style={{ opacity: openaiSet ? 1 : 0.6, cursor: 'pointer' }}
                title={openaiSet ? 'Clique para selecionar GPT Image 1 Mini' : 'Requer OPENAI_API_KEY'}
              >
                <div className="provider-icon">🖼️</div>
                <div className="provider-name">GPT Image 1 Mini</div>
                <div className="provider-desc">OpenAI · Econômico · ~$0.02/img</div>
                {!openaiSet && <div style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px' }}>⚠️ Chave não configurada</div>}
              </div>
              <div
                className={`provider-card ${provider === 'fal' ? 'active' : ''} ${!falSet ? 'disabled-card' : ''}`}
                onClick={() => selectProvider('fal', falSet, 'FAL_KEY')}
                style={{ opacity: falSet ? 1 : 0.6, cursor: 'pointer' }}
                title={falSet ? 'Clique para selecionar Fal.ai' : 'Requer FAL_KEY'}
              >
                <div className="provider-icon">⚡</div>
                <div className="provider-name">Fal.ai</div>
                <div className="provider-desc">Flux / SDXL · Rápido · ~$0.003/img</div>
                {!falSet && <div style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px' }}>⚠️ Chave não configurada</div>}
              </div>
              <div
                className={`provider-card ${provider === 'gemini' ? 'active' : ''} ${!geminiSet ? 'disabled-card' : ''}`}
                onClick={() => selectProvider('gemini', geminiSet, 'GEMINI_API_KEY')}
                style={{ opacity: geminiSet ? 1 : 0.6, cursor: 'pointer' }}
                title={geminiSet ? 'Clique para selecionar Gemini Imagen' : 'Requer GEMINI_API_KEY'}
              >
                <div className="provider-icon">✦</div>
                <div className="provider-name">Gemini Imagen</div>
                <div className="provider-desc">Google · Experimental · Pré-pago</div>
                {!geminiSet && <div style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px' }}>⚠️ Chave não configurada</div>}
              </div>
            </div>
          </div>

          <div className="settings-group" style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div className="settings-group-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Modelo de Escrita da Copy
            </div>
            <div className="settings-group-sub">Escolha qual modelo de inteligência artificial será usado para escrever a copy dos carrosséis</div>
            <div style={{ marginTop: '12px' }}>
              <select
                className="key-input"
                value={settingsData?.activeCopyModel || 'gpt-5.6-terra'}
                onChange={(e) => {
                  const val = e.target.value;
                  setPendingUpdates(prev => ({ ...prev, COPY_GENERATION_MODEL: val }));
                  setSettingsData(prev => ({ ...prev, activeCopyModel: val }));
                }}
                style={{ width: '100%', maxWidth: '400px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="gpt-5.6-sol">GPT-5.6 Sol — Máxima qualidade</option>
                <option value="gpt-5.6-terra">GPT-5.6 Terra — Equilíbrio recomendado</option>
                <option value="gpt-5.6-luna">GPT-5.6 Luna — Ágil e econômico</option>
              </select>
            </div>
          </div>

          {/* Card de Saldo OpenAI — Visível apenas para Super Admin */}
          {isSuperAdmin && (
            <div
              id="openai-balance-card"
              className="settings-group"
              style={{
                marginTop: '24px',
                background: 'linear-gradient(135deg, rgba(16,163,127,0.08) 0%, rgba(0,0,0,0) 100%)',
                border: '1px solid rgba(16,163,127,0.25)',
                borderRadius: '12px',
                padding: '20px 24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(16,163,127,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px'
                  }}>💰</div>
                  <div>
                    <div className="settings-group-title" style={{ marginBottom: '2px' }}>Saldo OpenAI</div>
                    <div className="settings-group-sub" style={{ margin: 0 }}>
                      Créditos disponíveis na sua conta · Visível apenas para Super Admin
                    </div>
                  </div>
                </div>
                <button
                  id="btn-refresh-openai-balance"
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={loadOpenAIBalance}
                  disabled={balanceLoading}
                  style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px' }}
                >
                  {balanceLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Atualizando...
                    </span>
                  ) : '↻ Atualizar'}
                </button>
              </div>

              {balanceLoading && !openaiBalance ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-3)', fontSize: '13px', padding: '8px 0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Consultando a OpenAI...
                </div>
              ) : openaiBalance?.ok ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Créditos Totais', value: formatUSD(openaiBalance.totalGranted), icon: '📦', color: '#a1a1aa' },
                    { label: 'Já Utilizado', value: formatUSD(openaiBalance.totalUsed), icon: '📤', color: '#f87171' },
                    { label: 'Disponível', value: formatUSD(openaiBalance.totalAvailable), icon: '✅', color: '#10a37f' },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '14px 16px'
                    }}>
                      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color, letterSpacing: '-0.5px' }}>{value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              ) : openaiBalance ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                      Não foi possível consultar o saldo automaticamente
                    </div>
                    <div style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: '1.6', marginBottom: '10px' }}>
                      {openaiBalance.error} A OpenAI não oferece um endpoint oficial de saldo. Você pode verificar diretamente no painel deles.
                    </div>
                    <a
                      id="btn-openai-billing-link"
                      href={openaiBalance.billingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: '#fbbf24', fontSize: '12px', fontWeight: '600',
                        textDecoration: 'none', padding: '6px 12px',
                        background: 'rgba(251,191,36,0.1)', borderRadius: '6px',
                        border: '1px solid rgba(251,191,36,0.2)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Abrir Painel de Faturamento OpenAI
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      {/* Conteúdo das Categorias de Chaves */}
      {filteredGroups.map(([groupName, keys]) => (
        <div className="key-group" key={groupName}>
          <div className="key-group-title">{groupName}</div>
          {keys.filter(k => k.key !== 'ACTIVE_IMAGE_PROVIDER' && k.key !== 'COPY_GENERATION_MODEL').map(k => {
            const isEditing = pendingUpdates && pendingUpdates[k.key] !== undefined;
            const hasNewValue = isEditing && pendingUpdates[k.key] !== '';

            return (
              <div className="key-row" key={k.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="key-label" style={{ minWidth: '220px' }}>
                  <span className={`key-status ${k.set ? 'set' : ''}`}></span>
                  {k.label}
                  {k.set && (
                    <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '6px', fontWeight: 600 }}>
                      🔒 Protegida
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    className="key-input"
                    id={`key-${k.key}`}
                    type="password"
                    value={pendingUpdates?.[k.key] !== undefined ? pendingUpdates[k.key] : ''}
                    placeholder={k.set ? `🔒 ${k.masked} (Criptografada)` : 'Cole a chave aqui para configurar...'}
                    autoComplete="new-password"
                    onChange={(e) => setPendingUpdates(prev => ({ ...prev, [k.key]: e.target.value }))}
                    style={{ width: '100%', fontFamily: k.set && !hasNewValue ? 'monospace' : 'inherit' }}
                  />
                </div>
                {k.set && !hasNewValue && (
                  <button
                    type="button"
                    className="key-reveal"
                    onClick={() => {
                      const input = document.getElementById(`key-${k.key}`);
                      if (input) {
                        input.value = '';
                        input.focus();
                      }
                      setPendingUpdates(prev => ({ ...prev, [k.key]: '' }));
                    }}
                    title="Clique para substituir a chave atual por uma nova"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    ✏️ Trocar Chave
                  </button>
                )}
                {hasNewValue && (
                  <button
                    type="button"
                    className="key-reveal"
                    onClick={() => {
                      setPendingUpdates(prev => {
                        const copy = { ...prev };
                        delete copy[k.key];
                        return copy;
                      });
                    }}
                    style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)', whiteSpace: 'nowrap' }}
                    title="Cancelar alteração"
                  >
                    ✖ Cancelar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
