import { useState, useEffect } from 'react';
import UsersModals from './UsersManagement/UsersModals';
import UsersTable from './UsersManagement/UsersTable';
import InvitationsTable from './UsersManagement/InvitationsTable';
import UsersBatchBanner from './UsersManagement/UsersBatchBanner';
import UsersSubTabsHeader from './UsersManagement/UsersSubTabsHeader';
import { defaultPermissions, PAGES_TO_CONTROL } from './UsersManagement/constants';

export default function UsersManagement({ showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' ou 'invitations'
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Seleção em Lote
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedInviteIds, setSelectedInviteIds] = useState([]);

  // Estados de Modais
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState('user');
  const [inviteHours, setInviteHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [invitePermissions, setInvitePermissions] = useState(defaultPermissions);

  // Estados de Edição de Usuário
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editPermissions, setEditPermissions] = useState(defaultPermissions);

  // Estados de Deleção de Usuário
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [batchDeleteUserModalOpen, setBatchDeleteUserModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Estados de Deleção de Convite
  const [deleteInviteModalOpen, setDeleteInviteModalOpen] = useState(false);
  const [batchDeleteInviteModalOpen, setBatchDeleteInviteModalOpen] = useState(false);
  const [deletingInvite, setDeletingInvite] = useState(null);
  const [deleteInviteSubmitting, setDeleteInviteSubmitting] = useState(false);

  // Estados de Paginação
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [invitesPage, setInvitesPage] = useState(1);
  const [invitesPerPage, setInvitesPerPage] = useState(5);

  useEffect(() => {
    setSelectedUserIds([]);
    setSelectedInviteIds([]);
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'users') {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (res.ok) setUsers(data);
      } else {
        const res = await fetch('/api/users/invitations');
        const data = await res.json();
        if (res.ok) setInvitations(data);
      }
    } catch (e) {
      showToast('Erro ao carregar dados de gestão.');
    } finally {
      setLoading(false);
    }
  };

  // Funções de Seleção de Usuários
  const deletableUsers = users.filter(u => !u.isSuperAdmin);
  const isAllUsersSelected = deletableUsers.length > 0 && selectedUserIds.length === deletableUsers.length;

  const handleToggleSelectUser = (id) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllUsers = () => {
    if (isAllUsersSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(deletableUsers.map(u => u.id));
    }
  };

  // Funções de Seleção de Convites
  const isAllInvitesSelected = invitations.length > 0 && selectedInviteIds.length === invitations.length;

  const handleToggleSelectInvite = (id) => {
    setSelectedInviteIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllInvites = () => {
    if (isAllInvitesSelected) {
      setSelectedInviteIds([]);
    } else {
      setSelectedInviteIds(invitations.map(inv => inv.id));
    }
  };

  // Gerar Convite
  const handleCreateInvite = async (e) => {
    e.preventDefault();
    setInviteSubmitting(true);
    try {
      const res = await fetch('/api/users/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: inviteRole, hours: inviteHours, permissions: invitePermissions })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        const link = `${window.location.protocol}//${window.location.host}/register.html?invite=${data.inviteId}`;
        setGeneratedLink(link);
        showToast('Convite gerado com sucesso!');
        loadData();
      } else {
        showToast(data.error || 'Erro ao gerar convite.');
      }
    } catch (err) {
      showToast('Erro de rede ao gerar convite.');
    } finally {
      setInviteSubmitting(false);
    }
  };

  // Abrir modal de convite limpando dados
  const openInviteModal = () => {
    setGeneratedLink('');
    setInvitePermissions(defaultPermissions);
    setInviteModalOpen(true);
  };

  // Copiar link
  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    showToast('Link copiado para a área de transferência!');
  };

  // Abrir Modal de Edição
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPermissions(user.permissions || defaultPermissions);
    setEditUserModalOpen(true);
  };

  // Salvar Edição
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail, role: editRole, permissions: editPermissions })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast('Usuário atualizado com sucesso.');
        setEditUserModalOpen(false);
        loadData();
      } else {
        showToast(data.error || 'Erro ao atualizar usuário.');
      }
    } catch (err) {
      showToast('Erro de rede ao atualizar usuário.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Confirmar Deleção Individual de Usuário
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Usuário excluído com sucesso.');
        setDeleteUserModalOpen(false);
        setSelectedUserIds(prev => prev.filter(id => id !== deletingUser.id));
        loadData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao excluir usuário.');
      }
    } catch (e) {
      showToast('Erro de rede ao excluir usuário.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Confirmar Deleção em Lote de Usuários
  const handleConfirmBatchDeleteUsers = async () => {
    if (selectedUserIds.length === 0) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch('/api/users/delete-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedUserIds })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(`${data.count || selectedUserIds.length} usuário(s) excluído(s) com sucesso!`);
        setBatchDeleteUserModalOpen(false);
        setSelectedUserIds([]);
        loadData();
      } else {
        showToast(data.error || 'Erro ao excluir usuários em lote.');
      }
    } catch (e) {
      showToast('Erro de rede ao excluir usuários em lote.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Confirmar Deleção Individual de Convite
  const handleConfirmDeleteInvite = async () => {
    if (!deletingInvite) return;
    setDeleteInviteSubmitting(true);
    try {
      const res = await fetch(`/api/users/invitations/${deletingInvite.id}/revoke`, { method: 'POST' });
      if (res.ok) {
        showToast('Convite excluído com sucesso.');
        setDeleteInviteModalOpen(false);
        setSelectedInviteIds(prev => prev.filter(id => id !== deletingInvite.id));
        loadData();
      } else {
        showToast('Erro ao excluir convite.');
      }
    } catch (e) {
      showToast('Erro de rede ao excluir convite.');
    } finally {
      setDeleteInviteSubmitting(false);
    }
  };

  // Confirmar Deleção em Lote de Convites
  const handleConfirmBatchDeleteInvites = async () => {
    if (selectedInviteIds.length === 0) return;
    setDeleteInviteSubmitting(true);
    try {
      const res = await fetch('/api/users/invitations/delete-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedInviteIds })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast(`${data.count || selectedInviteIds.length} convite(s) excluído(s) com sucesso!`);
        setBatchDeleteInviteModalOpen(false);
        setSelectedInviteIds([]);
        loadData();
      } else {
        showToast(data.error || 'Erro ao excluir convites em lote.');
      }
    } catch (e) {
      showToast('Erro de rede ao excluir convites em lote.');
    } finally {
      setDeleteInviteSubmitting(false);
    }
  };

  // Paginação de Usuários
  const totalUsersPages = Math.ceil(users.length / usersPerPage) || 1;
  const paginatedUsers = users.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);

  // Paginação de Convites
  const totalInvitesPages = Math.ceil(invitations.length / invitesPerPage) || 1;
  const paginatedInvitations = invitations.slice((invitesPage - 1) * invitesPerPage, invitesPage * invitesPerPage);

  return (
    <div>
      <UsersSubTabsHeader
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {activeSubTab === 'users' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>Lista de usuários cadastrados no estúdio</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {deletableUsers.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleToggleSelectAllUsers}
                >
                  {isAllUsersSelected ? 'Desmarcar Todos' : `☑️ Selecionar Todos (${deletableUsers.length})`}
                </button>
              )}
              <button className="btn btn-gold btn-sm" onClick={openInviteModal}>+ Novo Usuário</button>
            </div>
          </div>

          <UsersBatchBanner
            selectedCount={selectedUserIds.length}
            totalCount={deletableUsers.length}
            itemLabel="usuário(s)"
            onSelectAll={handleToggleSelectAllUsers}
            onClearSelection={() => setSelectedUserIds([])}
            onOpenBatchDelete={() => setBatchDeleteUserModalOpen(true)}
          />

          {loading ? (
            <div className="empty">
              <div className="spinner"></div>
              <div className="empty-text">Carregando usuários...</div>
            </div>
          ) : (
            <UsersTable
              paginatedUsers={paginatedUsers}
              usersPage={usersPage}
              setUsersPage={setUsersPage}
              usersPerPage={usersPerPage}
              setUsersPerPage={setUsersPerPage}
              totalUsersPages={totalUsersPages}
              totalUsersCount={users.length}
              selectedUserIds={selectedUserIds}
              onToggleSelectUser={handleToggleSelectUser}
              onToggleSelectAllUsers={handleToggleSelectAllUsers}
              isAllSelected={isAllUsersSelected}
              openEditModal={openEditModal}
              setDeletingUser={setDeletingUser}
              setDeleteUserModalOpen={setDeleteUserModalOpen}
            />
          )}
        </div>
      )}

      {activeSubTab === 'invitations' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>Histórico de convites para cadastro no estúdio</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {invitations.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleToggleSelectAllInvites}
                >
                  {isAllInvitesSelected ? 'Desmarcar Todos' : `☑️ Selecionar Todos (${invitations.length})`}
                </button>
              )}
              <button className="btn btn-gold btn-sm" onClick={openInviteModal}>+ Novo Convite</button>
            </div>
          </div>

          <UsersBatchBanner
            selectedCount={selectedInviteIds.length}
            totalCount={invitations.length}
            itemLabel="convite(s)"
            onSelectAll={handleToggleSelectAllInvites}
            onClearSelection={() => setSelectedInviteIds([])}
            onOpenBatchDelete={() => setBatchDeleteInviteModalOpen(true)}
          />

          {loading ? (
            <div className="empty">
              <div className="spinner"></div>
              <div className="empty-text">Carregando convites...</div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✉</div>
              <div className="empty-text">Nenhum convite gerado.</div>
              <div className="empty-sub">Clique em &quot;+ Novo Convite&quot; para liberar acesso para um novo colaborador.</div>
            </div>
          ) : (
            <InvitationsTable
              paginatedInvitations={paginatedInvitations}
              invitesPage={invitesPage}
              setInvitesPage={setInvitesPage}
              invitesPerPage={invitesPerPage}
              setInvitesPerPage={setInvitesPerPage}
              totalInvitesPages={totalInvitesPages}
              totalInvitesCount={invitations.length}
              selectedInviteIds={selectedInviteIds}
              onToggleSelectInvite={handleToggleSelectInvite}
              onToggleSelectAllInvites={handleToggleSelectAllInvites}
              isAllSelected={isAllInvitesSelected}
              setDeletingInvite={setDeletingInvite}
              setDeleteInviteModalOpen={setDeleteInviteModalOpen}
              showToast={showToast}
            />
          )}
        </div>
      )}

      <UsersModals
        inviteModalOpen={inviteModalOpen}
        setInviteModalOpen={setInviteModalOpen}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
        inviteHours={inviteHours}
        setInviteHours={setInviteHours}
        invitePermissions={invitePermissions}
        setInvitePermissions={setInvitePermissions}
        inviteSubmitting={inviteSubmitting}
        handleCreateInvite={handleCreateInvite}
        generatedLink={generatedLink}
        setGeneratedLink={setGeneratedLink}
        handleCopyLink={handleCopyLink}
        pagesToControl={PAGES_TO_CONTROL}
        editUserModalOpen={editUserModalOpen}
        setEditUserModalOpen={setEditUserModalOpen}
        editingUser={editingUser}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editRole={editRole}
        setEditRole={setEditRole}
        editPermissions={editPermissions}
        setEditPermissions={setEditPermissions}
        editSubmitting={editSubmitting}
        handleSaveEdit={handleSaveEdit}
        deleteUserModalOpen={deleteUserModalOpen}
        setDeleteUserModalOpen={setDeleteUserModalOpen}
        deletingUser={deletingUser}
        handleConfirmDelete={handleConfirmDelete}
        deleteSubmitting={deleteSubmitting}
        batchDeleteUserModalOpen={batchDeleteUserModalOpen}
        setBatchDeleteUserModalOpen={setBatchDeleteUserModalOpen}
        selectedUserIds={selectedUserIds}
        handleConfirmBatchDeleteUsers={handleConfirmBatchDeleteUsers}
        deleteInviteModalOpen={deleteInviteModalOpen}
        setDeleteInviteModalOpen={setDeleteInviteModalOpen}
        deletingInvite={deletingInvite}
        handleConfirmDeleteInvite={handleConfirmDeleteInvite}
        deleteInviteSubmitting={deleteInviteSubmitting}
        batchDeleteInviteModalOpen={batchDeleteInviteModalOpen}
        setBatchDeleteInviteModalOpen={setBatchDeleteInviteModalOpen}
        selectedInviteIds={selectedInviteIds}
        handleConfirmBatchDeleteInvites={handleConfirmBatchDeleteInvites}
      />
    </div>
  );
}
