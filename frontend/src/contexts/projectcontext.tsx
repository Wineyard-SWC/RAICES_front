'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type ProjectContextType = {
  projectDescription: string;
  setProjectDescription: (desc: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectDescription, setProjectDescription] = useState('');

  return (
    <ProjectContext.Provider value={{ projectDescription, setProjectDescription }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjectContext must be used within a ProjectProvider');
  return context;
};