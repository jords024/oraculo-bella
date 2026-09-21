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

export default function UsersTable({
  paginatedUsers,
  usersPage,
  setUsersPage,
  usersPerPage,
  setUsersPerPage,
  totalUsersPages,
  totalUsersCount,
  selectedUserIds = [],
  onToggleSelectUser,
  onToggleSelectAllUsers,
  isAllSelected,
  openEditModal,
  setDeletingUser,
  setDeleteUserModalOpen
}) {
  const paginationItems = getPaginationItems(usersPage, totalUsersPages);

  return (
    <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-3)' }}>
            <th style={{ width: '40px', padding: '12px 16px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAllUsers}
                title="Selecionar Todos os Usuários"
                style={{ cursor: 'pointer', accentColor: '#ef4444', width: '16px', height: '16px' }}
              />
            </th>
            <th style={{ padding: '12px 16px' }}>Nome</th>
            <th style={{ padding: '12px 16px' }}>E-mail (Login)</th>
            <th style={{ padding: '12px 16px' }}>Cargo</th>
            <th style={{ padding: '12px 16px' }}>Data de Criação</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map(u => {
            const isSelected = selectedUserIds.includes(u.id);
            return (
              <tr
                key={u.id}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  color: 'var(--text-2)',
                  background: isSelected ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  {u.isSuperAdmin ? (
                    <span style={{ fontSize: '12px', opacity: 0.3 }} title="Super Admin Protegido">🔒</span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectUser && onToggleSelectUser(u.id)}
                      style={{ cursor: 'pointer', accentColor: '#ef4444', width: '16px', height: '16px' }}
                    />
                  )}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: '500', color: 'var(--text)' }}>
                  {u.name}
                  {u.isSuperAdmin && (
                    <span style={{ fontSize: '9px', background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>
                      SUPER ADMIN
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>{u.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '11px',
                    color: u.role === 'admin' ? 'var(--cyan)' : 'var(--text-3)',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {u.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>{new Date(u.created_at || u.createdAt).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  {u.isSuperAdmin ? (
                    <span style={{ fontSize: '11px', color: 'var(--text-3)', fontStyle: 'italic', paddingRight: '8px' }}>🔐 Protegido</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(u)}>Editar</button>
                      <button className="btn-danger btn-sm" onClick={() => { setDeletingUser(u); setDeleteUserModalOpen(true); }}>Excluir</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginação de Usuários */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-2)' }}>
          <span>Mostrar</span>
          <select
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value));
              setUsersPage(1);
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
          {typeof totalUsersCount === 'number' && (
            <span style={{ color: 'var(--text-3)', marginLeft: '8px' }}>
              • {totalUsersCount.toLocaleString('pt-BR')} {totalUsersCount === 1 ? 'usuário' : 'usuários'} no total
            </span>
          )}
        </div>
        
        <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            className="page-btn"
            disabled={usersPage === 1}
            onClick={() => setUsersPage(usersPage - 1)}
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
                className={`page-btn ${usersPage === p ? 'active' : ''}`}
                onClick={() => setUsersPage(p)}
                style={{
                  backgroundColor: usersPage === p ? 'var(--gold, #C9A84C)' : '',
                  borderColor: usersPage === p ? 'var(--gold, #C9A84C)' : '',
                  color: usersPage === p ? '#000' : ''
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            className="page-btn"
            disabled={usersPage === totalUsersPages}
            onClick={() => setUsersPage(usersPage + 1)}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
