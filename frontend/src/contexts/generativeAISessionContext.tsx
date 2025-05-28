'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type GenerativeAISessionContextType = {
  sessionId: string;
  setSessionId: (id: string) => void;
};

const GenerativeAISessionContext = createContext<GenerativeAISessionContextType | undefined>(undefined);

export const GenerativeAISessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState("");

  return (
    <GenerativeAISessionContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </GenerativeAISessionContext.Provider>
  );
};

export const useGenerativeAISession = () => {
  const context = useContext(GenerativeAISessionContext);
  if (!context) throw new Error('useGenerativeAISession must be used within a GenerativeAISessionProvider');
  return context;
};
