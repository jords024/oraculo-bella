import React, { useState, useEffect } from 'react';
import GeneralTab from './Settings/GeneralTab';
import PromptsTab from './Settings/PromptsTab';
import BrandingTab from './Settings/BrandingTab';

export default function Settings({ showToast, onLoadBranding, currentUser }) {
  const [settingsData, setSettingsData] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('general'); // 'general', 'prompts' ou 'branding'

  // Estados dos Prompts
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [promptSaving, setPromptSaving] = useState(false);

  // Estados de Visualização & Edição Adicional
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  // Branding
  const [brandingData, setBrandingData] = useState({
    companyName: 'FONTE OCULTA',
    logoText: 'FONTE OCULTA',
    logoSub: 'PRODUÇÃO',
    logoSize: '13px',
    logoColor: '#ffffff',
    carouselTextSize: '15px',
    carouselTextColor: '#e4e4e7',
    titleTextSize: '40px',
    bodyTextSize: '24px',
    titleTextColor: '#ffffff',
    bodyTextColor: '#e4e4e7',
    logoPosition: 'left'
  });

  useEffect(() => {
    loadSettings();
    loadPrompts();
    loadBrandingData();
  }, []);

  const loadBrandingData = async () => {
    try {
      const res = await fetch('/api/settings/branding');
      const data = await res.json();
      if (data) setBrandingData(data);
    } catch (e) {
      showToast('Erro ao carregar identidade visual.');
    }
  };

  const handleSaveBranding = async () => {
    try {
      const res = await fetch('/api/settings/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingData)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✓ Identidade Visual salva com sucesso!');
        if (onLoadBranding) onLoadBranding();
      } else {
        showToast('Erro ao salvar identidade visual.');
      }
    } catch (e) {
      showToast('Erro de rede ao salvar identidade visual.');
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/keys');
      const data = await res.json();
      setSettingsData(data);
    } catch (e) {
      showToast('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      const res = await fetch('/api/settings/prompts');
      const data = await res.json();
      if (data.prompts) {
        setPrompts(data.prompts);
        if (data.prompts.length > 0) {
          setSelectedPromptId(data.prompts[0].id);
          setPromptContent(data.prompts[0].content);
        }
      }
    } catch (e) {
      showToast('Erro ao carregar prompts dos agentes.');
    }
  };

  const handleSelectPrompt = (id) => {
    setSelectedPromptId(id);
    const p = prompts.find(pr => pr.id === id);
    setPromptContent(p ? p.content : '');
    setIsRenaming(false);
  };

  const handleSavePrompt = async () => {
    if (!selectedPromptId) return;
    setPromptSaving(true);
    try {
      const res = await fetch('/api/settings/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPromptId, content: promptContent })
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✓ Prompt do agente salvo com sucesso!');
        setPrompts(prev => prev.map(p => p.id === selectedPromptId ? { ...p, content: promptContent } : p));
      } else {
        showToast('Erro ao salvar prompt: ' + data.error);
      }
    } catch (e) {
      showToast('Erro de rede ao salvar prompt.');
    } finally {
      setPromptSaving(false);
    }
  };

  const handleRenamePrompt = async (targetId, newName) => {
    const idToRename = targetId || selectedPromptId;
    const nameToSave = (newName !== undefined ? newName : tempName).trim();
    if (!idToRename || !nameToSave) return;
    try {
      const res = await fetch('/api/settings/prompts/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idToRename, name: nameToSave })
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✓ Nome do agente atualizado!');
        setPrompts(prev => prev.map(p => p.id === idToRename ? { ...p, name: nameToSave } : p));
        setIsRenaming(false);
      } else {
        showToast('Erro ao renomear: ' + data.error);
      }
    } catch (e) {
      showToast('Erro de rede ao renomear.');
    }
  };

  const handleSave = async () => {
    const updates = {};
    for (const [k, v] of Object.entries(pendingUpdates)) {
      if (v && v.trim()) updates[k] = v.trim();
    }
    if (Object.keys(updates).length === 0) {
      showToast('Nenhuma alteração para salvar.');
      return;
    }
    try {
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`✓ ${data.updated.length} chave(s) salva(s) com sucesso!`);
        setPendingUpdates({});
        loadSettings();
      } else {
        showToast('Erro: ' + data.error);
      }
    } catch (e) {
      showToast('Erro de rede ao salvar configurações.');
    }
  };

  if (loading) {
    return (
      <div className="empty">
        <div className="empty-icon">⏳</div>
        <div className="empty-text">Carregando chaves...</div>
      </div>
    );
  }

  const activePrompt = prompts.find(p => p.id === selectedPromptId);

  const editorStyles = isMaximized ? {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
    background: '#09090b',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  } : {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px'
  };

  return (
    <div>
      <div className="oraculo-header">
        <div>
          <div className="oraculo-title">CONFIGURAÇÕES</div>
          <div className="oraculo-subtitle">Gerencie suas chaves, provedores de imagem e prompts dos agentes</div>
        </div>
        {subTab === 'general' ? (
          <button className="btn btn-gold" onClick={handleSave}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Salvar Configurações
          </button>
        ) : subTab === 'prompts' ? (
          <button className="btn btn-gold" onClick={handleSavePrompt} disabled={promptSaving}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {promptSaving ? 'Salvando...' : 'Salvar Prompt'}
          </button>
        ) : (
          <button className="btn btn-gold" onClick={handleSaveBranding}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Salvar Identidade
          </button>
        )}
      </div>

      <div className="inner-tabs" style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', paddingLeft: '16px' }}>
        <button 
          className={`inner-tab-btn ${subTab === 'general' ? 'active' : ''}`} 
          onClick={() => setSubTab('general')}
          style={{
            background: subTab === 'general' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: subTab === 'general' ? '1px solid var(--border)' : '1px solid transparent',
            color: subTab === 'general' ? 'var(--text)' : 'var(--text-3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Configurações Gerais
        </button>
        <button 
          className={`inner-tab-btn ${subTab === 'prompts' ? 'active' : ''}`} 
          onClick={() => setSubTab('prompts')}
          style={{
            background: subTab === 'prompts' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: subTab === 'prompts' ? '1px solid var(--border)' : '1px solid transparent',
            color: subTab === 'prompts' ? 'var(--text)' : 'var(--text-3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Prompts dos Agentes
        </button>
        <button 
          className={`inner-tab-btn ${subTab === 'branding' ? 'active' : ''}`} 
          onClick={() => setSubTab('branding')}
          style={{
            background: subTab === 'branding' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: subTab === 'branding' ? '1px solid var(--border)' : '1px solid transparent',
            color: subTab === 'branding' ? 'var(--text)' : 'var(--text-3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Identidade Visual
        </button>
      </div>

      {subTab === 'general' && (
        <GeneralTab
          settingsData={settingsData}
          pendingUpdates={pendingUpdates}
          setPendingUpdates={setPendingUpdates}
          setSettingsData={setSettingsData}
          showToast={showToast}
          currentUser={currentUser}
        />
      )}

      {subTab === 'prompts' && (
        <PromptsTab
          prompts={prompts}
          selectedPromptId={selectedPromptId}
          promptContent={promptContent}
          setPromptContent={setPromptContent}
          promptSaving={promptSaving}
          handleSelectPrompt={handleSelectPrompt}
          handleSavePrompt={handleSavePrompt}
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
          isRenaming={isRenaming}
          setIsRenaming={setIsRenaming}
          tempName={tempName}
          setTempName={setTempName}
          handleRenamePrompt={handleRenamePrompt}
          activePrompt={activePrompt}
          editorStyles={editorStyles}
          showToast={showToast}
        />
      )}

      {subTab === 'branding' && (
        <BrandingTab
          brandingData={brandingData}
          setBrandingData={setBrandingData}
        />
      )}
    </div>
  );
}
