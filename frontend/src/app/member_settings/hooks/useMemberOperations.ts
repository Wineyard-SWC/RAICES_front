"use client";

import { useState } from "react";
import useToast from "@/hooks/useToast";
import { printError } from "@/utils/debugLogger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface UseMemberOperationsProps {
  getProjectUserRelation: (userId: string, projectId: string) => Promise<any>;
  refreshMembers: () => Promise<void>;
  currentProjectId: string;
}

export const useMemberOperations = ({
  getProjectUserRelation,
  refreshMembers,
  currentProjectId
}: UseMemberOperationsProps) => {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Actualizar rol de miembro
  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (!currentProjectId || !memberId) return false;
    
    setIsUpdatingRole(true);
    try {
      const relation = await getProjectUserRelation(memberId, currentProjectId);
      const relationId = relation.id;
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/project_users/${relationId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update member role');
      }
      
      showToast("Role updated successfully", "success");
      await refreshMembers();
      return true;
    } catch (error) {
      printError('Error updating role:', error);
      showToast("Failed to update role", "error");
      return false;
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Eliminar miembro
  const deleteMember = async (memberId: string) => {
    if (!currentProjectId || !memberId) return false;
    
    setIsDeleting(true);
    try {
      const relation = await getProjectUserRelation(memberId, currentProjectId);
      const relationId = relation.id;
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/project_users/${relationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove member from project');
      }
      
      showToast("Member removed successfully", "success");
      await refreshMembers();
      return true;
    } catch (error) {
      printError('Error deleting member:', error);
      showToast("Failed to remove member", "error");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    updateMemberRole,
    deleteMember,
    isDeleting,
    isUpdatingRole
  };
};