// app/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) return redirect("/projects");
  return redirect("/login");
}

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { auth } from '@/utils/firebaseConfig';
// import { onAuthStateChanged } from 'firebase/auth';
// import { useKanban } from '@/contexts/unifieddashboardcontext';

// export default function Home() {
//   const router = useRouter();
//   const {reset} = useKanban();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {      
//         reset(); 
//         localStorage.removeItem('currentProjectId');
//         router.push('/projects');
//       } else {
//         router.push('/login');
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   return null;
// }