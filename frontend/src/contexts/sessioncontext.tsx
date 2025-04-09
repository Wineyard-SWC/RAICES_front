'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SessionContextType = {
  sessionId: string;
  setSessionId: (id: string) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState("");

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSessionContext must be used within a SessionProvider');
  return context;
};
