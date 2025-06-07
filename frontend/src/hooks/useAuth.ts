'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/usercontext';
import { useAvatar } from '@/contexts/AvatarContext'; // Importar contexto de avatar
import { useUserRoles } from '@/contexts/userRolesContext'; // Importar contexto de roles
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../utils/firebaseConfig';
import { useKanban } from '@/contexts/unifieddashboardcontext';
import { useRequirementContext } from "@/contexts/requirementcontext"
import { useEpicContext } from "@/contexts/epiccontext"
import { useUserStoryContext } from "@/contexts/userstorycontext"
import { useSelectedRequirementContext } from "@/contexts/selectedrequirements"
import { useSelectedEpicsContext } from "@/contexts/selectedepics"
import { useSelectedUserStoriesContext } from "@/contexts/selecteduserstories"
import { useGeneratedTasks } from "@/contexts/generatedtaskscontext"
import { registerAvatarUser } from '@/utils/Avatar/userConfig';
import { useInitializeUserRoles } from '@/hooks/usePostDefaultRoles'; // Importar inicialización de roles
import { useProjectUsers } from '@/contexts/ProjectusersContext';
import { useUserPermissions } from '@/contexts/UserPermissions';
import { signIn } from "next-auth/react";
import { signOut } from "next-auth/react";
import { print } from '@/utils/debugLogger';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const AVATAR_API_URL = process.env.NEXT_PUBLIC_AVATAR_API!;
  
  // Contextos
  const { setUserId, userData, isLoading: userLoading } = useUser();
  const { resetAvatar, fetchAvatar } = useAvatar(); // Para cargar datos de avatar
  const { fetchUserRoles, resetRoles } = useUserRoles(); // Para cargar roles
  const { initializeUserRoles } = useInitializeUserRoles(); // Para inicializar roles
  const { clearAllCache } = useProjectUsers(); // Añadir el hook para ProjectUsers
  const { clearPermissionsCache } = useUserPermissions(); // Añadir este hook para los permisos de usuario
  
  // Contextos para reset de datos
  const {setRequirements} = useRequirementContext()
  const {setSelectedIds} = useSelectedRequirementContext()
  const {setEpics} = useEpicContext()
  const {setSelectedEpicIds} = useSelectedEpicsContext();
  const {setUserStories} = useUserStoryContext();
  const {setSelectedUserStoriesIds} = useSelectedUserStoriesContext();
  const {clearTasks} = useGeneratedTasks()
  const {reset} = useKanban();

  const firebaseErrorMap: { [key: string]: string } = {
    'auth/user-not-found': 'No user found with this email address.',
    'auth/wrong-password': 'Incorrect email or password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/account-exists-with-different-credential': 'Account already in use in other method'
  };

  const resetdata = () => {
    setRequirements([])
    setSelectedIds([])
    setEpics([])
    setSelectedEpicIds([])
    setUserStories([])
    setSelectedUserStoriesIds([])
    clearTasks()
  }

  // Función para verificar si un usuario existe y tiene avatar
  const checkUserAvatar = async (userId: string): Promise<{ exists: boolean, hasAvatar: boolean }> => {
    try {
      print(`Verificando si el usuario ${userId} existe y tiene avatar...`);
      const token = localStorage.getItem('authToken');
      
      // Verificar si el usuario existe en la API de avatar
      const response = await fetch(`${AVATAR_API_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          print(`Usuario ${userId} no existe en la API de avatar`);
          return { exists: false, hasAvatar: false };
        }
        
        throw new Error(`Error al verificar usuario: ${response.status}`);
      }
      
      const userData = await response.json();
      const hasAvatar = !!userData.avatar_url; // Convierte a booleano
      
      print(`Usuario ${userId} existe. Tiene avatar: ${hasAvatar}`);
      return { exists: true, hasAvatar };
    } catch (error) {
      console.error("Error al verificar usuario y avatar:", error);
      return { exists: false, hasAvatar: false };
    }
  };

  // Función común para manejar la post-autenticación
  const handlePostAuthentication = async (userId: string, isNewUser = false) => {
    try {
      print(`Manejando post-autenticación para usuario ${userId}. ¿Es nuevo? ${isNewUser}`);
      
      // Siempre establecer ID de usuario en el contexto
      setUserId(userId);
      
      // Si es un usuario nuevo, inicializar roles
      if (isNewUser) {
        print("Inicializando roles para usuario nuevo...");
        print("usuario a inicializar", userId);
        await initializeUserRoles(userId);
      }
      
      // Verificar si el usuario tiene avatar - NO usar el contexto aquí
      const { exists, hasAvatar } = await checkUserAvatar(userId);
      
      // Solo si tiene avatar, cargar datos en contextos
      // De lo contrario, ir directamente a crear avatar
      if (exists && hasAvatar) {
        print("Usuario con avatar, cargando datos en contextos...");
        try {
          // Intentar cargar datos en contextos (si falla, no debe interrumpir el flujo)
          await fetchAvatar(userId);
          await fetchUserRoles();
        } catch (err) {
          console.warn("Error cargando datos en contextos:", err);
        }

        print("avatar obtenido del avatar context: " + userData.avatar_url);
        
        print("Redirigiendo a proyectos...");
        router.push('/projects');
      } else {
        print("Usuario sin avatar, redirigiendo a creador de avatar...");
        router.push('/avatar_creator');
      }
    } catch (error) {
      console.error("Error en post-autenticación:", error);
      setError("Error preparing your account. Please try again.");
    }
  };

  const validateTokenWithBackend = async (token: string) => {
    const response = await fetch(`${API_URL}/token`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData?.detail || 'Failed to validate session. Please log in again.'
      throw new Error(errorMessage)
    }

    return response.json();
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        await auth.signOut();
        return;
      }

      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.uid);

      await signIn("credentials", { 
        email: email,
        password: password,
        redirect: false // Important: prevent NextAuth from redirecting
      });

      await validateTokenWithBackend(token);
      
      // Procesar post-autenticación (usuario existente)
      await handlePostAuthentication(user.uid, false);
    } catch (err: any) {
      const code = err?.code || ''
      setError(firebaseErrorMap[code] || err.message || 'Something went wrong. Please try again.')
    } finally {
      reset();
      resetdata();
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const token = await user.getIdToken();

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.uid);

      await signIn("credentials", { 
        email: user.email || '',
        password: '', // No password needed for Google sign-in
        redirect: false // Important: prevent NextAuth from redirecting
      });

      await validateTokenWithBackend(token);
      
      // Verificar si el usuario ya existe en nuestra API de avatar
      const { exists } = await checkUserAvatar(user.uid);
      
      if (!exists) {
        // Es un usuario nuevo, registrarlo
        print("Registrando nuevo usuario de Google en la API de avatar...");
        await registerAvatarUser({
          firebase_id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
          avatar_url: null,
          gender: null
        });
      }
      
      // Manejar post-autenticación (indicando si es usuario nuevo)
      await handlePostAuthentication(user.uid, !exists);
    } catch (err: any) {
      const code = err?.code || ''
      setError(firebaseErrorMap[code] || err.message || 'Something went wrong. Please try again.')
    } finally {
      reset();
      resetdata();
      setIsLoading(false);
    }
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.uid);

      await validateTokenWithBackend(token);
      
      // Verificar si el usuario ya existe en nuestra API de avatar
      const { exists } = await checkUserAvatar(user.uid);
      
      if (!exists) {
        // Es un usuario nuevo, registrarlo
        print("Registrando nuevo usuario de GitHub en la API de avatar...");
        await registerAvatarUser({
          firebase_id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'GitHub User',
          avatar_url: null,
          gender: null
        });
      }
      
      // Manejar post-autenticación (indicando si es usuario nuevo)
      await handlePostAuthentication(user.uid, !exists);
    } catch (err: any) {
      const code = err?.code || ''
      setError(firebaseErrorMap[code] || err.message || 'Something went wrong. Please try again.')
    } finally {
      reset();
      resetdata();
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      reset(); // Limpia KanbanContext
      resetdata();

      await auth.signOut();
      await signOut({ redirect: false });

      setUserId('');
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('currentProjectId');

      // Limpiar datos de avatar y roles
      resetAvatar();
      resetRoles(); 
      
      // Limpiar datos de usuarios de proyectos
      clearAllCache();
      
      // Limpiar caché de permisos de usuario
      clearPermissionsCache();

      router.push('/login');
    } catch (err: any) {
      setError('Error during logout: ' + err.message);
    }
  };

  return {
    loginWithEmail,
    loginWithGoogle,
    loginWithGithub,
    logout,
    isLoading: isLoading || userLoading,
    error,
    userData,
  };
};