'use client';

import React, { createContext, useContext, useState, useRef,
  ReactNode,useEffect,useCallback } from 'react';
import { User } from '@/types/user';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Crear el contexto
const UserContext = createContext<{ 
  userId: string,
  setUserId: React.Dispatch<React.SetStateAction<string>>,
  userData: User | null,
  setUserData: React.Dispatch<React.SetStateAction<User|null>>  
  isLoading: boolean,
  error: string | null,
  refreshUserData: () => Promise<void>
} | undefined>(undefined);

// Crear el proveedor del contexto
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getUserData = useRef(async (uid: string): Promise<User> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found. Please log in again.');
      }

      const response = await fetch(`${API_URL}/users/${uid}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.detail || 'Failed to fetch user data.';
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err: any) {
      console.error('Error fetching user data:', err.message);
      throw err;
    }
  });

  // Función para refrescar los datos del usuario
   const refreshUserData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserData.current(userId);
      setUserData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error refreshing user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
      // Este efecto solo debe ejecutarse al montar el componente
      const token = localStorage.getItem('authToken');
      if (token && !userId) {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      }
  }, []); 

  // Effect para cargar datos cuando el userId cambia
  useEffect(() => {
    // Solo cargar datos si:
    // 1. Hay userId
    // 2. No hay userData
    // 3. No se está cargando
    if (userId && !userData && !isLoading) {
      refreshUserData();
    }
  }, [userId, refreshUserData]); 

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
      // Limpiar userData cuando se remueve userId
      setUserData(null);
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ 
      userId,
      setUserId, 
      userData, 
      setUserData,
      isLoading,
      error,
      refreshUserData
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};