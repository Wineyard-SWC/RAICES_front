"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "./ui/dialog"
import ConfirmDialog from "@/components/confimDialog"
import { useRoles } from "../hooks/useRoles"
import { useRoleOperations } from "../hooks/useRoleOperations"
import { useRoleDialogs } from "../hooks/useRoleDialogs"
import { useRoleUtils } from "../hooks/useRoleUtils"
import RoleFormDialog from "./RoleFormDialog"
import RoleCard from "./RoleCard"

export default function RolesTab() {
  // Hook principal para datos de roles
  const {
    roles,
    setRoles,
    isSubmitting,
    saveRolesToBackend
  } = useRoles();

  // Hook para operaciones CRUD
  const {
    createRole,
    updateRole,
    deleteRole,
    getRoleById
  } = useRoleOperations({
    roles,
    setRoles,
    saveRolesToBackend
  });

  // Hook para manejo de diálogos
  const {
    isNewRoleDialogOpen,
    editingRole,
    isDeleteDialogOpen,
    roleToDelete,
    newRoleName,
    newRoleDescription,
    newRolePermissions,
    setNewRoleName,
    setNewRoleDescription,
    openCreateDialog,
    openEditDialog,
    closeRoleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handlePermissionChange
  } = useRoleDialogs();

  // Hook para utilidades
  const {
    expandedRoles,
    hasPermission,
    toggleRoleExpansion
  } = useRoleUtils();

  // Handlers para eventos de UI
  const handleCreateRole = async () => {
    const success = await createRole(newRoleName, newRoleDescription, newRolePermissions);
    if (success) {
      closeRoleDialog();
    }
  };

  const handleEditRole = (roleId: string) => {
    const role = getRoleById(roleId);
    if (role) {
      openEditDialog(roleId, role.name, role.description, role.bitmask);
    }
  };

  const handleSaveEditedRole = async () => {
    if (!editingRole) return;
    
    const success = await updateRole(editingRole, newRoleName, newRoleDescription, newRolePermissions);
    if (success) {
      closeRoleDialog();
    }
  };

  const handleDeleteRole = (roleId: string) => {
    openDeleteDialog(roleId);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    
    const success = await deleteRole(roleToDelete);
    if (success) {
      closeDeleteDialog();
    }
  };

  return (
    <div className="space-y-6">
      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Confirm Role Deletion"
        message="Are you sure you want to delete this role? This action cannot be undone."
        onCancel={closeDeleteDialog}
        onConfirm={confirmDeleteRole}
        cancelText="Cancel"
        confirmText="Delete Role"
        isLoading={isSubmitting}
      />
      
      {/* Header con botón de crear rol */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Roles</h2>
        <Dialog open={isNewRoleDialogOpen} onOpenChange={(open) => open ? openCreateDialog() : closeRoleDialog()}>
          <DialogTrigger asChild>
            <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
              <Plus className="mr-2 h-4 w-4" /> New Role
            </Button>
          </DialogTrigger>
          <RoleFormDialog
            isOpen={isNewRoleDialogOpen}
            onClose={closeRoleDialog}
            onSave={editingRole ? handleSaveEditedRole : handleCreateRole}
            isEditing={!!editingRole}
            isSubmitting={isSubmitting}
            roleName={newRoleName}
            roleDescription={newRoleDescription}
            rolePermissions={newRolePermissions}
            onNameChange={setNewRoleName}
            onDescriptionChange={setNewRoleDescription}
            onPermissionChange={handlePermissionChange}
            hasPermission={hasPermission}
          />
        </Dialog>
      </div>

      {/* Lista de roles */}
      <div className="space-y-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isExpanded={expandedRoles[role.id] || false}
            onToggleExpand={() => toggleRoleExpansion(role.id)}
            onEdit={() => handleEditRole(role.id)}
            onDelete={() => handleDeleteRole(role.id)}
            hasPermission={hasPermission}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    </div>
  )
}