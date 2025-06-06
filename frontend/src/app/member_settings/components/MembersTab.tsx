"use client"

import { Loader2 } from "lucide-react"
import MemberCard from "./MemberCard"
import EditRoleDialog from "./EditRoleDialog"
import DeleteMemberDialog from "./DeleteMemberDialog"
import { useProjectMembers } from "../hooks/useProjectMember"
import { useMemberOperations } from "../hooks/useMemberOperations"
import { useMemberDialogs } from "../hooks/useMemberDialog"
import { useMemberPermissions } from "../hooks/useMemberPermissions"

export default function MembersTab() {
  // Hook principal para datos de miembros
  const {
    currentProjectId,
    members,
    isLoading,
    getProjectUserRelation,
    refreshMembers,
    userId
  } = useProjectMembers();

  // Hook para operaciones CRUD
  const {
    updateMemberRole,
    deleteMember,
    isDeleting,
    isUpdatingRole
  } = useMemberOperations({
    getProjectUserRelation,
    refreshMembers,
    currentProjectId
  });

  // Hook para manejo de diálogos
  const {
    memberToDelete,
    memberToEdit,
    openEditDialog,
    openDeleteDialog,
    closeEditDialog,
    closeDeleteDialog
  } = useMemberDialogs();

  // Hook para permisos
  const {
    canEditMember,
    availableRoles,
    hasPermission,
    PERMISSIONS
  } = useMemberPermissions();

  // Handlers para eventos de UI
  const handleEditRole = (memberId: string) => {
    const member = members.find(m => m.userRef === memberId);
    if (member) {
      openEditDialog(memberId, member.role);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    const member = members.find(m => m.userRef === memberId);
    if (member) {
      openDeleteDialog(memberId, member.name);
    }
  };

  // Handler para guardar cambio de rol
  const handleSaveRoleChange = async (newRole: string) => {
    if (memberToEdit) {
      const success = await updateMemberRole(memberToEdit.id, newRole);
      if (success) {
        closeEditDialog();
      }
    }
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      const success = await deleteMember(memberToDelete.id);
      if (success) {
        closeDeleteDialog();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#4a2b4a]" />
        <span className="ml-2 text-lg">Loading members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de permisos */}
      {!hasPermission(PERMISSIONS.MEMBER_MANAGE) && (
        <div className="bg-amber-50 border border-amber-200 p-3 mb-4 rounded-md">
          <p className="text-amber-800 text-sm">
            You don't have permissions to manage project members.
            Contact the project owner if you need to make changes.
          </p>
        </div>
      )}
      
      {/* Lista de miembros */}
      <div className="grid gap-4">
        {members.length > 0 ? (
          members.map((member) => (
            <MemberCard
              key={member.userRef}
              member={member}
              isCurrentUser={member.userRef === userId}
              canEdit={canEditMember(member.role, member.userRef, userId)}
              onEditRole={handleEditRole}
              onDeleteMember={handleDeleteMember}
              isUpdatingRole={isUpdatingRole}
              isDeleting={isDeleting}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-md shadow-sm">
            <p className="text-gray-500">No members found in this project.</p>
          </div>
        )}
      </div>

      {/* Diálogos */}
      <EditRoleDialog
        isOpen={!!memberToEdit}
        onClose={closeEditDialog}
        onSave={handleSaveRoleChange}
        availableRoles={availableRoles}
        isLoading={isUpdatingRole}
        currentRole={memberToEdit?.currentRole}
      />

      <DeleteMemberDialog
        isOpen={!!memberToDelete}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        memberName={memberToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}