'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const SelectedUserStoriesContext = createContext<{
  selectedUserStoriesIds: string[];
  setSelectedUserStoriesIds: React.Dispatch<React.SetStateAction<string[]>>;
} | undefined>(undefined);

export const SelectedUserStoriesProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUserStoriesIds, setSelectedUserStoriesIds] = useState<string[]>([]);
  return (
    <SelectedUserStoriesContext.Provider value={{ selectedUserStoriesIds, setSelectedUserStoriesIds }}>
      {children}
    </SelectedUserStoriesContext.Provider>
  );
};

export const useSelectedUserStoriesContext = () => {
  const ctx = useContext(SelectedUserStoriesContext);
  if (!ctx) throw new Error('useSelectedUserStoriesContext must be used within SelectedUserStoriesProvider ');
  return ctx;
};