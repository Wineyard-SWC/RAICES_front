"use client";

interface FrontendRole {
  id: string;
  name: string;
  description: string;
  bitmask: number;
  isDefault: boolean;
}

interface UseRoleOperationsProps {
  roles: FrontendRole[];
  setRoles: (roles: FrontendRole[]) => void;
  saveRolesToBackend: (roles: FrontendRole[]) => Promise<boolean>;
}

export const useRoleOperations = ({
  roles,
  setRoles,
  saveRolesToBackend
}: UseRoleOperationsProps) => {

  // Crear nuevo rol
  const createRole = async (name: string, description: string, bitmask: number) => {
    if (!name.trim()) return false;

    const newRole: FrontendRole = {
      id: `role-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      bitmask,
      isDefault: false,
    };

    const updatedRoles = [...roles, newRole];
    const success = await saveRolesToBackend(updatedRoles);
    
    if (success) {
      setRoles(updatedRoles);
    }
    
    return success;
  };

  // Editar rol existente
  const updateRole = async (roleId: string, name: string, description: string, bitmask: number) => {
    if (!name.trim()) return false;

    const updatedRoles = roles.map((role) => {
      if (role.id === roleId) {
        return {
          ...role,
          name: name.trim(),
          description: description.trim(),
          bitmask,
        };
      }
      return role;
    });

    const success = await saveRolesToBackend(updatedRoles);
    
    if (success) {
      setRoles(updatedRoles);
    }
    
    return success;
  };

  // Eliminar rol
  const deleteRole = async (roleId: string) => {
    const updatedRoles = roles.filter((role) => role.id !== roleId);
    const success = await saveRolesToBackend(updatedRoles);
    
    if (success) {
      setRoles(updatedRoles);
    }
    
    return success;
  };

  // Obtener rol por ID
  const getRoleById = (roleId: string) => {
    return roles.find((role) => role.id === roleId);
  };

  return {
    createRole,
    updateRole,
    deleteRole,
    getRoleById
  };
};