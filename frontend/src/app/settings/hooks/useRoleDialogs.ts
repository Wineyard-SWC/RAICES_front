"use client";

import { useState } from "react";

export const useRoleDialogs = () => {
  // Estados para el diálogo de crear/editar rol
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  
  // Estados para el formulario
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState(0);
  
  // Estados para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Abrir diálogo para crear nuevo rol
  const openCreateDialog = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRolePermissions(0);
    setEditingRole(null);
    setIsNewRoleDialogOpen(true);
  };

  // Abrir diálogo para editar rol
  const openEditDialog = (roleId: string, name: string, description: string, bitmask: number) => {
    setNewRoleName(name);
    setNewRoleDescription(description);
    setNewRolePermissions(bitmask);
    setEditingRole(roleId);
    setIsNewRoleDialogOpen(true);
  };

  // Cerrar diálogo de crear/editar
  const closeRoleDialog = () => {
    setIsNewRoleDialogOpen(false);
    setEditingRole(null);
    setNewRoleName("");
    setNewRoleDescription("");
    setNewRolePermissions(0);
  };

  // Abrir diálogo de confirmación de eliminación
  const openDeleteDialog = (roleId: string) => {
    setRoleToDelete(roleId);
    setIsDeleteDialogOpen(true);
  };

  // Cerrar diálogo de eliminación
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setRoleToDelete(null);
  };

  // Manejar cambio de permisos
  const handlePermissionChange = (permissionBit: number, checked: boolean) => {
    if (checked) {
      setNewRolePermissions(newRolePermissions | permissionBit);
    } else {
      setNewRolePermissions(newRolePermissions & ~permissionBit);
    }
  };

  return {
    // Estados del diálogo
    isNewRoleDialogOpen,
    editingRole,
    isDeleteDialogOpen,
    roleToDelete,
    
    // Estados del formulario
    newRoleName,
    newRoleDescription,
    newRolePermissions,
    
    // Setters del formulario
    setNewRoleName,
    setNewRoleDescription,
    
    // Acciones
    openCreateDialog,
    openEditDialog,
    closeRoleDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handlePermissionChange
  };
};