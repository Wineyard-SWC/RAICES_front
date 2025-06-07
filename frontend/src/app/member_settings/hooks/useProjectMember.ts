"use client";

import { useState, useEffect, useCallback } from "react";
import { useProjectUsers } from "@/contexts/ProjectusersContext";
import { useUser } from "@/contexts/usercontext";
import { printError } from "@/utils/debugLogger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const useProjectMembers = () => {
  const { userId } = useUser();
  const { getUsersForProject, loadUsersIfNeeded, refreshUsers, isLoading } = useProjectUsers();
  const [currentProjectId, setCurrentProjectId] = useState<string>("");

  // Obtener el ID del proyecto actual
  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setCurrentProjectId(storedProjectId);
      loadUsersIfNeeded(storedProjectId);
    }
  }, [loadUsersIfNeeded]);

  // Obtener miembros ordenados
  const getOrderedMembers = useCallback(() => {
    const members = getUsersForProject(currentProjectId);
    return [...members].sort((a, b) => {
      if (a.userRef === userId) return -1;
      if (b.userRef === userId) return 1;
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (b.role === "owner" && a.role !== "owner") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [getUsersForProject, currentProjectId, userId]);

  // Función para obtener la relación usuario-proyecto
  const getProjectUserRelation = useCallback(async (userId: string, projectId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/project_users/relation?user_id=${userId}&project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Error fetching project-user relation');
      }
      
      return await response.json();
    } catch (error) {
      printError('Error getting project-user relation:', error);
      throw error;
    }
  }, []);

  return {
    currentProjectId,
    members: getOrderedMembers(),
    isLoading: isLoading(currentProjectId),
    getProjectUserRelation,
    refreshMembers: () => refreshUsers(currentProjectId),
    userId
  };
};