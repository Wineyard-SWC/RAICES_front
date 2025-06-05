'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AvatarContextType {
  avatarUrl: string | null;
  gender: string | null;
  isLoading: boolean;
  error: string | null;
  fetchAvatar: (userId: string) => Promise<string | null>;
  updateAvatarUrl: (url: string, gender?: string | null) => void;
  resetAvatar: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const AVATAR_API = process.env.NEXT_PUBLIC_AVATAR_API!;

  const fetchAvatar = useCallback(async (userId: string): Promise<string | null> => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${AVATAR_API}/users/${userId}`);
      
      if (response.status === 404) {
        console.log(`Usuario ${userId} no encontrado en API de avatar`);
        setAvatarUrl(null);
        setGender(null);
        return null;
      }
      
      if (!response.ok) {
        throw new Error(response.statusText || 'Error fetching avatar');
      }
      
      const userData = await response.json();
      
      setAvatarUrl(userData.avatar_url);
      setGender(userData.gender);

      return userData.avatar_url;
    } catch (err) {
      console.error('Error fetching avatar:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [AVATAR_API]); 

  const updateAvatarUrl = (url: string, newGender: string | null = null) => {
    setAvatarUrl(url);
    if (newGender !== null) {
      setGender(newGender);
    }
  };
  
  const resetAvatar = () => {
    setAvatarUrl(null);
    setGender(null);
    setError(null);
  };

  return (
    <AvatarContext.Provider
      value={{
        avatarUrl,
        gender,
        isLoading,
        error,
        fetchAvatar,
        updateAvatarUrl,
        resetAvatar
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};