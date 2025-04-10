'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Requirement } from '@/types/requirement';

type RequirementContextType = {
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>
};

const RequirementContext = createContext<RequirementContextType | undefined>(undefined);

export const RequirementProvider = ({ children }: { children: ReactNode }) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  return (
    <RequirementContext.Provider value={{ requirements, setRequirements }}>
      {children}
    </RequirementContext.Provider>
  );
};

export const useRequirementContext = () => {
  const context = useContext(RequirementContext);
  if (!context) throw new Error('useEpicContext must be used within EpicProvider');
  return context;
};
