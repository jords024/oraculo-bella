import React from 'react';

export default function InviteModal({
  isOpen,
  onClose,
  inviteRole,
  setInviteRole,
  inviteHours,
  setInviteHours,
  invitePermissions,
  setInvitePermissions,
  inviteSubmitting,
  onSubmit,
  generatedLink,
  setGeneratedLink,
  handleCopyLink,
  PAGES_TO_CONTROL
}) {
  if (!isOpen) return null;

  return (
    <div className="form-modal open">
      <div className="form-box" style={{ maxWidth: '480px' }}>
        <h3 className="form-title">Gerar Novo Convite</h3>
        
        {generatedLink ? (
          <div style={{ margin: '16px 0 24px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '8px' }}>Link de cadastro exclusivo gerado:</p>
            <div style={{ background: '#09090b', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--gold)', wordBreak: 'break-all', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{generatedLink}</span>
              <button className="btn btn-gold btn-sm" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={handleCopyLink}>Copiar</button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>Envie este link para o novo membro realizar o cadastro.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Cargo do Novo Usuário</label>
              <select className="form-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="user">Colaborador (Usuário comum — Criação/Ferramentas)</option>
                <option value="admin">Administrador (Admin — Acessos completos)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Prazo de Expiração do Link</label>
              <select className="form-select" value={inviteHours} onChange={e => setInviteHours(e.target.value)}>
                <option value="12">12 horas</option>
                <option value="24">24 horas</option>
                <option value="48">48 horas</option>
                <option value="72">72 horas</option>
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
                      const val = invitePermissions[page.id] || 'liberado';
                      return (
                        <tr key={page.id} style={{ borderBottom: idx === PAGES_TO_CONTROL.length - 1 ? 'none' : '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px', color: 'var(--text-2)', fontWeight: '500' }}>{page.label}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`invite-${page.id}`} 
                              checked={val === 'bloqueado'} 
                              onChange={() => setInvitePermissions(prev => ({ ...prev, [page.id]: 'bloqueado' }))}
                              style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`invite-${page.id}`} 
                              checked={val === 'liberado'} 
                              onChange={() => setInvitePermissions(prev => ({ ...prev, [page.id]: 'liberado' }))}
                              style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <input 
                              type="radio" 
                              name={`invite-${page.id}`} 
                              checked={val === 'em_breve'} 
                              onChange={() => setInvitePermissions(prev => ({ ...prev, [page.id]: 'em_breve', [`${page.id}_pct`]: invitePermissions[`${page.id}_pct`] || 90 }))}
                              style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            {val === 'em_breve' ? (
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={invitePermissions[`${page.id}_pct`] !== undefined ? invitePermissions[`${page.id}_pct`] : 90} 
                                onChange={(e) => {
                                  const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                  setInvitePermissions(prev => ({ ...prev, [`${page.id}_pct`]: v }));
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
              <button type="button" className="btn btn-outline" onClick={onClose}>Fechar</button>
              <button type="submit" className="btn btn-gold" disabled={inviteSubmitting}>
                {inviteSubmitting ? 'Gerando...' : 'Gerar Convite'}
              </button>
            </div>
          </form>
        )}

        {generatedLink && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => { onClose(); setGeneratedLink(''); }}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}
