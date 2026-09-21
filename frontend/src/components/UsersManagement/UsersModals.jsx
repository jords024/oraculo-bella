import React from 'react';
import InviteModal from './InviteModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import DeleteInviteModal from './DeleteInviteModal';

export default function UsersModals({
  // Invite Modal
  inviteModalOpen,
  setInviteModalOpen,
  inviteRole,
  setInviteRole,
  inviteHours,
  setInviteHours,
  invitePermissions,
  setInvitePermissions,
  inviteSubmitting,
  handleCreateInvite,
  generatedLink,
  setGeneratedLink,
  handleCopyLink,
  pagesToControl,

  // Edit User Modal
  editUserModalOpen,
  setEditUserModalOpen,
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
  handleSaveEdit,

  // Delete User Modal (Individual)
  deleteUserModalOpen,
  setDeleteUserModalOpen,
  deletingUser,
  handleConfirmDelete,
  deleteSubmitting,

  // Delete Users Modal (Batch)
  batchDeleteUserModalOpen,
  setBatchDeleteUserModalOpen,
  selectedUserIds,
  handleConfirmBatchDeleteUsers,

  // Delete Invite Modal (Individual)
  deleteInviteModalOpen,
  setDeleteInviteModalOpen,
  deletingInvite,
  handleConfirmDeleteInvite,
  deleteInviteSubmitting,

  // Delete Invites Modal (Batch)
  batchDeleteInviteModalOpen,
  setBatchDeleteInviteModalOpen,
  selectedInviteIds,
  handleConfirmBatchDeleteInvites
}) {
  return (
    <>
      {/* Modal: Novo Convite */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
        inviteHours={inviteHours}
        setInviteHours={setInviteHours}
        invitePermissions={invitePermissions}
        setInvitePermissions={setInvitePermissions}
        inviteSubmitting={inviteSubmitting}
        onSubmit={handleCreateInvite}
        generatedLink={generatedLink}
        setGeneratedLink={setGeneratedLink}
        handleCopyLink={handleCopyLink}
        PAGES_TO_CONTROL={pagesToControl}
      />

      {/* Modal: Editar Usuário */}
      <EditUserModal
        isOpen={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
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
        onSubmit={handleSaveEdit}
        PAGES_TO_CONTROL={pagesToControl}
      />

      {/* Modal: Excluir Usuário Individual */}
      <DeleteUserModal
        isOpen={deleteUserModalOpen}
        onClose={() => setDeleteUserModalOpen(false)}
        deletingUser={deletingUser}
        count={1}
        onSubmit={handleConfirmDelete}
        deleteSubmitting={deleteSubmitting}
      />

      {/* Modal: Excluir Usuários em Lote */}
      <DeleteUserModal
        isOpen={batchDeleteUserModalOpen}
        onClose={() => setBatchDeleteUserModalOpen(false)}
        count={selectedUserIds.length}
        onSubmit={handleConfirmBatchDeleteUsers}
        deleteSubmitting={deleteSubmitting}
      />

      {/* Modal: Excluir Convite Individual */}
      <DeleteInviteModal
        isOpen={deleteInviteModalOpen}
        onClose={() => setDeleteInviteModalOpen(false)}
        deletingInvite={deletingInvite}
        count={1}
        onSubmit={handleConfirmDeleteInvite}
        deleteInviteSubmitting={deleteInviteSubmitting}
      />

      {/* Modal: Excluir Convites em Lote */}
      <DeleteInviteModal
        isOpen={batchDeleteInviteModalOpen}
        onClose={() => setBatchDeleteInviteModalOpen(false)}
        count={selectedInviteIds.length}
        onSubmit={handleConfirmBatchDeleteInvites}
        deleteInviteSubmitting={deleteInviteSubmitting}
      />
    </>
  );
}
