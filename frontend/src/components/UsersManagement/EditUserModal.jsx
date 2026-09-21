import React from 'react';

export default function EditUserModal({
  isOpen,
  onClose,
  editingUser,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editRole,
  setEditRole,
  editPermissions,
  setEditPermissions,
  editSubmitting,
  onSubmit,
  PAGES_TO_CONTROL
}) {
  if (!isOpen || !editingUser) return null;

  return (
    <div className="form-modal open">
      <div className="form-box" style={{ maxWidth: '480px' }}>
        <h3 className="form-title">Editar Usuário</h3>
        <form onSubmit={onSubmit} style={{ marginTop: '16px' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Nome Completo</label>
            <input type="text" className="form-input" value={editName} onChange={e => setEditName(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">E-mail (Login)</label>
            <input type="email" className="form-input" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Cargo / Permissão</label>
            <select className="form-select" value={editRole} onChange={e => setEditRole(e.target.value)}>
              <option value="user">Usuário comum (Colaborador)</option>
              <option value="admin">Administrador (Admin)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Permissões de Acesso por Página</label>
            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-1)' }}>Página</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-1)', width: '60px' }}>Bloqueada</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-1)', width: '60px' }}>Liberada</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-1)', width: '60px' }}>Em Breve</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-1)', width: '70px' }}>Conclusão (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {PAGES_TO_CONTROL.map((page, idx) => {
                    const val = editPermissions[page.id] || 'liberado';
                    return (
                      <tr key={page.id} style={{ borderBottom: idx === PAGES_TO_CONTROL.length - 1 ? 'none' : '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 10px', color: 'var(--text-2)', fontWeight: '500' }}>{page.label}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <input 
                            type="radio" 
                            name={`edit-${page.id}`} 
                            checked={val === 'bloqueado'} 
                            onChange={() => setEditPermissions(prev => ({ ...prev, [page.id]: 'bloqueado' }))}
                            style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <input 
                            type="radio" 
                            name={`edit-${page.id}`} 
                            checked={val === 'liberado'} 
                            onChange={() => setEditPermissions(prev => ({ ...prev, [page.id]: 'liberado' }))}
                            style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <input 
                            type="radio" 
                            name={`edit-${page.id}`} 
                            checked={val === 'em_breve'} 
                            onChange={() => setEditPermissions(prev => ({ ...prev, [page.id]: 'em_breve', [`${page.id}_pct`]: editPermissions[`${page.id}_pct`] || 90 }))}
                            style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          {val === 'em_breve' ? (
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={editPermissions[`${page.id}_pct`] !== undefined ? editPermissions[`${page.id}_pct`] : 90} 
                              onChange={(e) => {
                                const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                setEditPermissions(prev => ({ ...prev, [`${page.id}_pct`]: v }));
                              }}
                              style={{
                                width: '50px',
                                background: '#09090b',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                color: '#fff',
                                fontSize: '11px',
                                textAlign: 'center'
                              }}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-3)' }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-gold" disabled={editSubmitting}>
              {editSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
