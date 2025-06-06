"use client";

import { useUserPermissions } from "@/contexts/UserPermissions";
import { useUserRoles } from "@/contexts/userRolesContext";

export const useMemberPermissions = () => {
  const { hasPermission } = useUserPermissions();
  const { userRoles } = useUserRoles();

  const PERMISSIONS = {
    MEMBER_MANAGE: 1 << 1,
  };

  // Verificar si un usuario puede ser editado
  const canEditMember = (memberRole: string, memberUserId: string, currentUserId: string) => {
    const hasMemberManagePermission = hasPermission(PERMISSIONS.MEMBER_MANAGE);
    
    if (!hasMemberManagePermission) {
      return false;
    }
    
    if (memberRole === "owner" || memberUserId === currentUserId) {
      return false;
    }
    
    return true;
  };

  // Roles disponibles (sin owner)
  const availableRoles = userRoles?.roles?.filter(role => 
    role.name.toLowerCase() !== "owner"
  ) || [];

  return {
    canEditMember,
    availableRoles,
    hasPermission,
    PERMISSIONS
  };
};