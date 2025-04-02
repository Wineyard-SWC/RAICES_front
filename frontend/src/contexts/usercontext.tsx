'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Crear el contexto
const UserContext = createContext<{ userId: string, setUserId: React.Dispatch<React.SetStateAction<string>> } | undefined>(undefined);

// Crear el proveedor del contexto
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>('');

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};