"use client";

import { useState } from "react";

interface MemberToDelete {
  id: string;
  name: string;
}

interface MemberToEdit {
  id: string;
  currentRole: string;
}

export const useMemberDialogs = () => {
  const [memberToDelete, setMemberToDelete] = useState<MemberToDelete | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<MemberToEdit | null>(null);

  // Handlers para abrir diálogos
  const openEditDialog = (memberId: string, currentRole: string) => {
    setMemberToEdit({ id: memberId, currentRole });
  };

  const openDeleteDialog = (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
  };

  // Handlers para cerrar diálogos
  const closeEditDialog = () => {
    setMemberToEdit(null);
  };

  const closeDeleteDialog = () => {
    setMemberToDelete(null);
  };

  return {
    // Estado
    memberToDelete,
    memberToEdit,
    
    // Acciones
    openEditDialog,
    openDeleteDialog,
    closeEditDialog,
    closeDeleteDialog
  };
};