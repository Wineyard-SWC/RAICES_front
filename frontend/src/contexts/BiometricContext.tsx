// 1. Crear un nuevo contexto
// filepath: c:\Users\fer61\OneDrive\Escritorio\RAICES\MyBranch\CookieSettings\frontend\src\contexts\BiometricContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CHANNELS } from "@/utils/muse/channels";
import { print } from "@/utils/debugLogger";

interface RestData {
  eeg: { channel: (typeof CHANNELS)[number]; values: number[] }[];
  ppg: number[];
  hr: number[];
}

interface BiometricContextType {
  restBaseline: RestData | null;
  setRestBaseline: (data: RestData) => void;
  resetRestBaseline: () => void;
}

const BiometricContext = createContext<BiometricContextType | undefined>(undefined);

export function BiometricProvider({ children }: { children: ReactNode }) {
  const [restBaseline, setRestBaseline] = useState<RestData | null>(null);

  // Función para resetear los datos cuando cambias de participante
  const resetRestBaseline = () => {
    print("🔄 Resetting biometric baseline data");
    setRestBaseline(null);
  };

  return (
    <BiometricContext.Provider value={{ 
      restBaseline, 
      setRestBaseline,
      resetRestBaseline 
    }}>
      {children}
    </BiometricContext.Provider>
  );
}

export function useBiometricContext() {
  const context = useContext(BiometricContext);
  if (context === undefined) {
    throw new Error("useBiometricContext must be used within a BiometricProvider");
  }
  return context;
}