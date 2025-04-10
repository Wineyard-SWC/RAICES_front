'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const SelectedEpicsContext = createContext<{
  selectedEpicIds: string[];
  setSelectedEpicIds: React.Dispatch<React.SetStateAction<string[]>>;
} | undefined>(undefined);

export const SelectedEpicProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEpicIds, setSelectedEpicIds] = useState<string[]>([]);
  return (
    <SelectedEpicsContext.Provider value={{ selectedEpicIds, setSelectedEpicIds }}>
      {children}
    </SelectedEpicsContext.Provider>
  );
};

export const useSelectedEpicsContext = () => {
  const ctx = useContext(SelectedEpicsContext);
  if (!ctx) throw new Error('useSelectedEpicsContext must be used within SelectedRequirementProvider');
  return ctx;
};