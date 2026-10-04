import React, { useState } from 'react';

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
  const [showResetSection, setShowResetSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  if (!isOpen || !editingUser) return null;

  // Gerador de senha forte aleatória
  const generateStrongPassword = () => {
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLower = 'abcdefghijkmnopqrstuvwxyz';
    const charsNums = '23456789';
    const charsSymbols = '@#$%&*!+-=';

    let pass = '';
    pass += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    pass += charsLower[Math.floor(Math.random() * charsLower.length)];
    pass += charsNums[Math.floor(Math.random() * charsNums.length)];
    pass += charsSymbols[Math.floor(Math.random() * charsSymbols.length)];

    const all = charsUpper + charsLower + charsNums + charsSymbols;
    for (let i = 0; i < 8; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    // Embaralha
    const shuffled = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setNewPassword(shuffled);
    setShowPasswordText(true);
    setResetStatus(null);
  };

  const handleResetPasswordAction = async () => {
    if (!newPassword || newPassword.length < 10) {
      setResetStatus({ type: 'error', message: 'A senha deve conter no mínimo 10 caracteres.' });
      return;
    }

    setResetSubmitting(true);
    setResetStatus(null);

    try {
      const res = await fetch(`/api/users/${editingUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          notifyEmail
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setResetStatus({
          type: 'success',
          message: data.emailNotified
            ? '✅ Senha redefinida e enviada por e-mail com sucesso!'
            : '✅ Senha redefinida com sucesso!'
        });
        setNewPassword('');
      } else {
        setResetStatus({ type: 'error', message: data.error || 'Erro ao redefinir senha.' });
      }
    } catch (err) {
      setResetStatus({ type: 'error', message: 'Erro de rede ao redefinir senha.' });
    } finally {
      setResetSubmitting(false);
    }
  };

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

          {/* Seção: Redefinição de Senha */}
          {!editingUser.isSuperAdmin && (
            <div style={{
              marginTop: '18px',
              marginBottom: '20px',
              padding: '14px 16px',
              background: 'rgba(201,168,76,0.04)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px' }}>🔑</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>Redefinição de Senha</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Redefina a senha de acesso deste colaborador</div>
                  </div>
                </div>
                <button
                  type="button"
                  id="toggleResetPassBtn"
                  onClick={() => setShowResetSection(prev => !prev)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: 'var(--gold)',
                    cursor: 'pointer'
                  }}
                >
                  {showResetSection ? 'Ocultar' : 'Redefinir Senha'}
                </button>
              </div>

              {showResetSection && (
                <div id="resetPasswordContainer" style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Nova Senha</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          id="newPasswordInput"
                          type={showPasswordText ? "text" : "password"}
                          className="form-input"
                          placeholder="Digite a nova senha..."
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setResetStatus(null);
                          }}
                          style={{ paddingRight: '36px', fontSize: '12px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordText(prev => !prev)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-dim)',
                            fontSize: '13px'
                          }}
                          title={showPasswordText ? "Ocultar" : "Mostrar"}
                        >
                          {showPasswordText ? '👁️' : '🔒'}
                        </button>
                      </div>
                      <button
                        type="button"
                        id="generateStrongPassBtn"
                        onClick={generateStrongPassword}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '0 10px',
                          color: 'var(--text-2)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                        title="Gerar uma senha segura aleatória"
                      >
                        ⚡ Gerar Forte
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '10px' }}>
                    Requisitos: Mínimo 10 caracteres, com letras, números e caractere especial (@#$%...).
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id="notifyEmailCheck"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: 'var(--gold)' }}
                    />
                    <label htmlFor="notifyEmailCheck" style={{ fontSize: '11px', color: 'var(--text-2)', cursor: 'pointer' }}>
                      Notificar nova senha para o e-mail via Brevo
                    </label>
                  </div>

                  {resetStatus && (
                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      marginBottom: '10px',
                      background: resetStatus.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${resetStatus.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: resetStatus.type === 'success' ? 'var(--green)' : '#f87171'
                    }}>
                      {resetStatus.message}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      id="submitResetPasswordBtn"
                      className="btn btn-gold btn-sm"
                      onClick={handleResetPasswordAction}
                      disabled={resetSubmitting || !newPassword}
                      style={{ fontSize: '11px', padding: '6px 14px' }}
                    >
                      {resetSubmitting ? 'Redefinindo...' : 'Aplicar Nova Senha'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
