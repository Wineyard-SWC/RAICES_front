import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/usercontext';

interface ProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}