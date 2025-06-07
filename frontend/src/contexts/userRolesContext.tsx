'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useUser } from './usercontext';
import { print, printError } from '@/utils/debugLogger';

// Tipos para los roles y documentos
interface RoleDefinition {
  idRole: string;
  name: string;
  description?: string;
  bitmask: number;
  is_default: boolean;
}

interface UserRolesDocument {
  id?: string;
  userRef: string;
  roles: RoleDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface para el contexto
interface UserRolesContextType {
  userRoles: UserRolesDocument | null;
  isLoading: boolean;
  error: string | null;
  fetchUserRoles: () => Promise<void>;
  updateUserRoles: (roles: RoleDefinition[]) => Promise<boolean>;
  hasPermission: (permissionBit: number) => boolean;
  getCurrentProjectRole: () => string | null;
  resetRoles: () => void; // Nueva función para resetear roles
}

// Crear el contexto
const UserRolesContext = createContext<UserRolesContextType | undefined>(undefined);

// URL de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const UserRolesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRoles, setUserRoles] = useState<UserRolesDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener contexto de usuario
  const { userId } = useUser();

  // Función para resetear roles - nueva función
  const resetRoles = useCallback(() => {
    setUserRoles(null);
    setError(null);
    setIsLoading(false);
    print('Roles de usuario reseteados');
  }, []);

  // Función para obtener los roles del usuario
  const fetchUserRoles = useCallback(async () => {
    // No intentar cargar roles si no hay userId o token
    if (!userId || !localStorage.getItem('authToken')) {
      print('No se pueden cargar roles: falta userId o token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      print(`Intentando cargar roles para usuario ${userId}`);
      
      const response = await fetch(`${API_URL}/user-roles/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Arreglado: añadimos el token de autenticación
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        print('No se encontraron roles para el usuario, estableciendo array vacío');
        setUserRoles({ userRef: userId, roles: [] });
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data: UserRolesDocument = await response.json();
      setUserRoles(data);
    } catch (err: any) {
      printError('Error fetching user roles:', err);
      // No establecer error en el estado para no afectar la UI
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Función para actualizar los roles del usuario
  const updateUserRoles = useCallback(async (roles: RoleDefinition[]): Promise<boolean> => {
    if (!userId || !userRoles?.id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_URL}/user-roles/${userRoles.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roles: roles
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Failed to update user roles');
      }

      const updatedRoles = await response.json();
      setUserRoles(updatedRoles);
      return true;
    } catch (err: any) {
      printError('Error updating user roles:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, userRoles?.id, setIsLoading, setError, setUserRoles]);

  // Verificar si el usuario tiene un permiso específico basado en bitmask
  const hasPermission = useCallback((permissionBit: number): boolean => {
    if (!userRoles || !userRoles.roles || userRoles.roles.length === 0) {
      return false;
    }

    // Obtener el rol actual del proyecto
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (!currentProjectId) return false;

    // Buscar el rol correspondiente al proyecto actual
    const currentRole = userRoles.roles[0];
    if (!currentRole) return false;

    // Verificar si el bitmask del rol incluye el permiso
    return (currentRole.bitmask & permissionBit) === permissionBit;
  }, [userRoles]);

  // Obtener el rol actual del proyecto
  const getCurrentProjectRole = useCallback((): string | null => {
    if (!userRoles || !userRoles.roles || userRoles.roles.length === 0) {
      return null;
    }
    
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (!currentProjectId) return null;

    const currentRole = userRoles.roles[0];
    return currentRole ? currentRole.idRole : null;
  }, [userRoles]);

  // IMPORTANTE: No cargar roles automáticamente en el mount
  // Los roles se cargarán explícitamente durante el proceso de login
  
  return (
    <UserRolesContext.Provider
      value={{
        userRoles,
        isLoading,
        error,
        fetchUserRoles,
        updateUserRoles,
        hasPermission,
        getCurrentProjectRole,
        resetRoles, // Añadimos la nueva función
      }}
    >
      {children}
    </UserRolesContext.Provider>
  );
};

// Hook para usar el contexto
export const useUserRoles = () => {
  const context = useContext(UserRolesContext);
  if (!context) {
    throw new Error('useUserRoles must be used within a UserRolesProvider');
  }
  return context;
};