"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserRoles } from "@/contexts/userRolesContext";
import useToast from "@/hooks/useToast";
import { printError } from "@/utils/debugLogger";

// Tipos
interface FrontendRole {
  id: string;
  name: string;
  description: string;
  bitmask: number;
  isDefault: boolean;
}

interface ApiRole {
  idRole: string;
  name: string;
  description?: string;
  bitmask: number;
  is_default: boolean;
}

// Funciones de conversión
const apiToFrontendRole = (role: ApiRole): FrontendRole => ({
  id: role.idRole,
  name: role.name,
  description: role.description || '',
  bitmask: role.bitmask,
  isDefault: role.is_default
});

const frontendToApiRole = (role: FrontendRole): ApiRole => ({
  idRole: role.id,
  name: role.name,
  description: role.description,
  bitmask: role.bitmask,
  is_default: role.isDefault
});

export const useRoles = () => {
  const { userRoles, updateUserRoles } = useUserRoles();
  const { showToast } = useToast();
  
  const [roles, setRoles] = useState<FrontendRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar roles desde el contexto cuando esté disponible
  useEffect(() => {
    if (userRoles && userRoles.roles) {
      setRoles(userRoles.roles.map(apiToFrontendRole));
    }
  }, [userRoles]);

  // Función para guardar roles en el backend
  const saveRolesToBackend = useCallback(async (updatedRoles: FrontendRole[]) => {
    if (!userRoles?.id) {
      showToast("No se puede actualizar: documento de roles no encontrado", "error");
      return false;
    }

    setIsSubmitting(true);

    try {
      const apiRoles = updatedRoles.map(frontendToApiRole);
      const success = await updateUserRoles(apiRoles);
      
      if (success) {
        showToast("Roles actualizados correctamente", "success");
        return true;
      } else {
        showToast("Error al actualizar roles", "error");
        return false;
      }
    } catch (error) {
      printError("Error actualizando roles:", error);
      showToast("Error al actualizar roles", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userRoles?.id, updateUserRoles, showToast]);

  return {
    roles,
    setRoles,
    isSubmitting,
    saveRolesToBackend
  };
};