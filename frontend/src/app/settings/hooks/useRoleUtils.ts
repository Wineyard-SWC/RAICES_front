"use client";

import { useState } from "react";

export const useRoleUtils = () => {
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  // Verificar si un permiso está activo en un bitmask
  const hasPermission = (bitmask: number, permissionBit: number) => {
    return (bitmask & permissionBit) === permissionBit;
  };

  // Alternar expansión de rol
  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  return {
    expandedRoles,
    hasPermission,
    toggleRoleExpansion
  };
};