'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const SelectedRequirementContext = createContext<{
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
} | undefined>(undefined);

export const SelectedRequirementProvider = ({ children }: { children: ReactNode }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  return (
    <SelectedRequirementContext.Provider value={{ selectedIds, setSelectedIds }}>
      {children}
    </SelectedRequirementContext.Provider>
  );
};

export const useSelectedRequirementContext = () => {
  const ctx = useContext(SelectedRequirementContext);
  if (!ctx) throw new Error('useSelectedRequirementContext must be used within SelectedRequirementProvider');
  return ctx;
};