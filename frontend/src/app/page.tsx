// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useKanban } from '@/contexts/unifieddashboardcontext';

export default function Home() {
  const router = useRouter();
  const {reset} = useKanban();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {      
        reset(); 
        localStorage.removeItem('currentProjectId');
        router.push('/projects');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}