'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Epic } from '@/types/epic';

type EpicContextType = {
  epics: Epic[];
  setEpics: React.Dispatch<React.SetStateAction<Epic[]>>;
};

const EpicContext = createContext<EpicContextType | undefined>(undefined);

export const EpicProvider = ({ children }: { children: ReactNode }) => {
  const [epics, setEpics] = useState<Epic[]>([]);
  return (
    <EpicContext.Provider value={{ epics, setEpics }}>
      {children}
    </EpicContext.Provider>
  );
};

export const useEpicContext = () => {
  const context = useContext(EpicContext);
  if (!context) throw new Error('useEpicContext must be used within EpicProvider');
  return context;
};
