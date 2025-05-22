'use client';

import { useState } from 'react';

// Tipos
interface RoleDefinition {
  idRole: string;
  name: string;
  description?: string;
  bitmask: number;
  is_default: boolean;
}

interface InitializeRolesResponse {
  id: string;
  userRef: string;
  roles: RoleDefinition[];
  createdAt: string;
  updatedAt: string;
}

export const useInitializeUserRoles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const initializeUserRoles = async (userId: string): Promise<InitializeRolesResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found during role initialization');
        return null;
      }

      // Llamar al endpoint de inicialización - no necesita enviar los roles
      console.log(`Inicializando roles para usuario ${userId}`);
      const response = await fetch(`${API_URL}/user-roles/initialize/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        // No se envía body - el backend ya tiene los DEFAULT_ROLES
      });


      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Endpoint de inicialización no encontrado (404)');
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Roles inicializados correctamente:', data);
      return data;
    } catch (err: any) {
      console.error('Error initializing user roles:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initializeUserRoles,
    isLoading,
    error
  };
};