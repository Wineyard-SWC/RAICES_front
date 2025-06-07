'use client'

import { printError } from '@/utils/debugLogger';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AssignmentMap = Record<string, string>;

interface AssignmentContextType {
  assignmentMap: AssignmentMap;
  saveAssignment: (storyUuid: string, epicIdTitle: string) => void;
  removeAssignment: (storyUuid: string) => void;
  getAssignment: (storyUuid: string) => string | undefined;
  hasStoriesForEpic: (epicIdTitle: string) => boolean;
}

const defaultValue: AssignmentContextType = {
  assignmentMap: {},
  saveAssignment: () => {},
  removeAssignment: () => {},
  getAssignment: () => undefined,
  hasStoriesForEpic: () => false
};

const AssignmentContext = createContext<AssignmentContextType>(defaultValue);

export const useAssignmentContext = () => useContext(AssignmentContext);

export const AssignmentProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [assignmentMap, setAssignmentMap] = useState<AssignmentMap>({});

  useEffect(() => {
    const savedAssignments = localStorage.getItem('previousAssignments');
    if (savedAssignments) {
      try {
        const parsed = JSON.parse(savedAssignments);
        setAssignmentMap(parsed);
      } catch (error) {
        printError("Error al cargar asignaciones:", error);
      }
    }
  }, []);

  const saveAssignment = (storyUuid: string, epicIdTitle: string) => {
    setAssignmentMap(prev => {
      const updated = { ...prev, [storyUuid]: epicIdTitle };
      localStorage.setItem('previousAssignments', JSON.stringify(updated));
      return updated;
    });
  };

  const removeAssignment = (storyUuid: string) => {
    setAssignmentMap(prev => {
      const updated = { ...prev };
      delete updated[storyUuid];
      localStorage.setItem('previousAssignments', JSON.stringify(updated));
      return updated;
    });
  };

  const getAssignment = (storyUuid: string) => assignmentMap[storyUuid];

  const hasStoriesForEpic = (epicIdTitle: string) => {
    return Object.values(assignmentMap).some(epicId => epicId === epicIdTitle);
  };

  return (
    <AssignmentContext.Provider 
      value={{ 
        assignmentMap, 
        saveAssignment, 
        removeAssignment, 
        getAssignment,
        hasStoriesForEpic
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};