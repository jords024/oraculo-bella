import React, { useState } from 'react';

export default function AgentPromptList({
  prompts,
  selectedPromptId,
  handleSelectPrompt,
  handleRenamePrompt
}) {
  const [editingListId, setEditingListId] = useState(null);
  const [listTempName, setListTempName] = useState('');

  const categorizePrompt = (id) => {
    const textCopyIds = [
      'criador', 'copywriter', 'gancho-viral', 'humanizer', 'cta-desbloqueio-neural',
      'AG00-diretor-bella', 'AG01-arqueologo-bella', 'AG02-arquiteto-bella',
      'AG03-ferreiro-bella', 'AG04-maestro-bella', 'AG05-artesao-bella',
      'AG06-porteiro-bella', 'AG07-destilador-bella', 'AG08-guardiao-bella'
    ];
    const designVisualIds = [
      'canalizador-visual', 'diretor-de-arte', 'diretor-artistico-bella-v2', 'visual-dna',
      'AG09-tradutor-bella', 'AG10-curador-bella', 'AG11-alquimista-bella',
      'AG12-arquiteto-canvas-bella', 'diretor_cena', 'diretor_artistico'
    ];
    
    if (textCopyIds.includes(id)) return 'Texto & Copy (T.A.F.A)';
    if (designVisualIds.includes(id)) return 'Design & Visual (Direção Viva)';
    return 'Mestres & Diretrizes';
  };

  const groupedPrompts = {
    'Texto & Copy (T.A.F.A)': [],
    'Design & Visual (Direção Viva)': [],
    'Mestres & Diretrizes': []
  };

  prompts.forEach(p => {
    const category = categorizePrompt(p.id);
    if (!groupedPrompts[category]) groupedPrompts[category] = [];
    groupedPrompts[category].push(p);
  });

  const handleSaveListRename = async (id) => {
    if (!listTempName.trim()) return;
    await handleRenamePrompt(id, listTempName.trim());
    setEditingListId(null);
  };

  return (
    <div
      className="prompts-list-panel"
      style={{
        width: '280px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto'
      }}
    >
      {Object.entries(groupedPrompts).map(([categoryName, items]) => (
        <div key={categoryName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: '700',
              color: 'var(--text-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '4px 8px 6px'
            }}
          >
            {categoryName}
          </div>
          {items.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: selectedPromptId === p.id ? 'var(--crimson-d)' : 'transparent',
                borderRadius: '6px',
                padding: '2px 4px',
                transition: 'background 0.15s'
              }}
            >
              {editingListId === p.id ? (
                <div style={{ display: 'flex', gap: '4px', width: '100%', alignItems: 'center', padding: '4px' }}>
                  <input
                    type="text"
                    value={listTempName}
                    onChange={(e) => setListTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveListRename(p.id);
                      if (e.key === 'Escape') setEditingListId(null);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      background: '#09090b',
                      color: '#fff',
                      border: '1px solid var(--gold)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                  />
                  <button
                    className="btn btn-gold"
                    style={{ padding: '3px 8px', fontSize: '10px' }}
                    onClick={() => handleSaveListRename(p.id)}
                    title="Salvar Nome"
                  >
                    ✓
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '3px 8px', fontSize: '10px' }}
                    onClick={() => setEditingListId(null)}
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleSelectPrompt(p.id)}
                    onDoubleClick={() => {
                      handleSelectPrompt(p.id);
                      setEditingListId(p.id);
                      setListTempName(p.name);
                    }}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      background: 'transparent',
                      color: selectedPromptId === p.id ? 'var(--crimson)' : 'var(--text-2)',
                      border: 'none',
                      padding: '8px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={`${p.name} (Dar duplo clique para editar)`}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPrompt(p.id);
                      setEditingListId(p.id);
                      setListTempName(p.name);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: selectedPromptId === p.id ? 'var(--gold)' : 'var(--text-3)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 0.2s, color 0.2s'
                    }}
                    title={`Editar nome do agente "${p.name}"`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
