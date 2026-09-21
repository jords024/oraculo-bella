function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

export default function InvitationsTable({
  paginatedInvitations,
  invitesPage,
  setInvitesPage,
  invitesPerPage,
  setInvitesPerPage,
  totalInvitesPages,
  totalInvitesCount,
  selectedInviteIds = [],
  onToggleSelectInvite,
  onToggleSelectAllInvites,
  isAllSelected,
  setDeletingInvite,
  setDeleteInviteModalOpen,
  showToast
}) {
  const paginationItems = getPaginationItems(invitesPage, totalInvitesPages);

  return (
    <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-3)' }}>
            <th style={{ width: '40px', padding: '12px 16px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAllInvites}
                title="Selecionar Todos os Convites"
                style={{ cursor: 'pointer', accentColor: '#ef4444', width: '16px', height: '16px' }}
              />
            </th>
            <th style={{ padding: '12px 16px' }}>Link / Código</th>
            <th style={{ padding: '12px 16px' }}>Cargo Concedido</th>
            <th style={{ padding: '12px 16px' }}>Expira em</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvitations.map(inv => {
            const inviteUrl = `${window.location.protocol}//${window.location.host}/register.html?invite=${inv.id}`;
            const isSelected = selectedInviteIds.includes(inv.id);
            return (
              <tr
                key={inv.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  color: 'var(--text-2)',
                  background: isSelected ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectInvite && onToggleSelectInvite(inv.id)}
                    style={{ cursor: 'pointer', accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                </td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '11px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl);
                      showToast('Link do convite copiado!');
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer', textAlign: 'left', outline: 'none' }}
                    title="Copiar Link"
                  >
                    🔗 {inv.id.substring(0, 18)}... (copiar)
                  </button>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: inv.role === 'admin' ? 'var(--cyan)' : 'var(--text-3)',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {inv.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>{new Date(inv.expires_at).toLocaleString('pt-BR')}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    border: '1px solid',
                    borderColor: inv.status === 'accepted' ? '#22c55e' : inv.status === 'pending' ? 'var(--gold)' : '#f43f5e',
                    color: inv.status === 'accepted' ? '#22c55e' : inv.status === 'pending' ? 'var(--gold)' : '#f43f5e',
                    background: inv.status === 'accepted' ? 'rgba(34,197,94,0.08)' : inv.status === 'pending' ? 'rgba(201,168,76,0.08)' : 'rgba(244,63,94,0.08)'
                  }}>
                    {inv.status === 'accepted' ? 'Aceito' : inv.status === 'pending' ? 'Pendente' : 'Expirado'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button className="btn-danger btn-sm" onClick={() => { setDeletingInvite(inv); setDeleteInviteModalOpen(true); }}>Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginação de Convites */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
          <span>Mostrar</span>
          <select
            value={invitesPerPage}
            onChange={(e) => {
              setInvitesPerPage(Number(e.target.value));
              setInvitesPage(1);
            }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              color: 'var(--text-2)',
              padding: '4px 8px',
              borderRadius: '5px',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>por página</span>
          {typeof totalInvitesCount === 'number' && (
            <span style={{ color: 'var(--text-3)', marginLeft: '8px' }}>
              • {totalInvitesCount.toLocaleString('pt-BR')} {totalInvitesCount === 1 ? 'convite' : 'convites'} no total
            </span>
          )}
        </div>
        
        <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            className="page-btn"
            disabled={invitesPage === 1}
            onClick={() => setInvitesPage(invitesPage - 1)}
          >
            Anterior
          </button>
          {paginationItems.map((p) => {
            if (typeof p === 'string') {
              return (
                <span key={p} style={{ padding: '0 6px', color: 'var(--text-3)', fontSize: '13px', userSelect: 'none' }}>
                  ...
                </span>
              );
            }
            return (
              <button
                key={p}
                className={`page-btn ${invitesPage === p ? 'active' : ''}`}
                onClick={() => setInvitesPage(p)}
                style={{
                  backgroundColor: invitesPage === p ? 'var(--gold, #C9A84C)' : '',
                  borderColor: invitesPage === p ? 'var(--gold, #C9A84C)' : '',
                  color: invitesPage === p ? '#000' : ''
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            className="page-btn"
            disabled={invitesPage === totalInvitesPages}
            onClick={() => setInvitesPage(invitesPage + 1)}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
