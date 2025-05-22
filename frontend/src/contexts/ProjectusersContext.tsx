"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { useUserRoles } from "./userRolesContext"

// API URL para endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AVATAR_API_URL = process.env.NEXT_PUBLIC_AVATAR_API;

// Tipo para representar un usuario del proyecto
export interface ProjectUser {
  id: string;
  userRef: string;
  projectRef: string;
  role: string;
  joinedAt: string;
  name: string;
  email: string;
  picture: string | null;
  bitmask?: number; // Campo que se añadirá dinámicamente
  avatarUrl?: string | null; // Campo para la URL del avatar desde la BD relacional
  gender?: string | null; // Campo para el género desde la BD relacional
}

// Tipo para almacenar usuarios por proyecto con caché
type UsersByProjectId = Record<string, {
  users: ProjectUser[];
  lastFetched: number;
}>

// Tiempo de caché por defecto (30 minutos)
const DEFAULT_CACHE_MAX_AGE = 30 * 60 * 1000;

// Tipo para el contexto
interface ProjectUsersContextType {
  getUsersForProject: (projectId: string) => ProjectUser[];
  isLoading: (projectId: string) => boolean;
  hasError: (projectId: string) => string | null;
  loadUsersIfNeeded: (projectId: string, maxAgeMs?: number) => Promise<ProjectUser[]>;
  refreshUsers: (projectId: string) => Promise<ProjectUser[]>;
  getUserById: (projectId: string, userId: string) => ProjectUser | undefined;
  clearProjectCache: (projectId: string) => void;
  clearAllCache: () => void;
}

// Crear el contexto
const ProjectUsersContext = createContext<ProjectUsersContextType | undefined>(undefined);

// Proveedor del contexto
export const ProjectUsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usersByProject, setUsersByProject] = useState<UsersByProjectId>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [errorState, setErrorState] = useState<Record<string, string | null>>({});
  const { userRoles } = useUserRoles();

  // Función para obtener usuarios de un proyecto
  const getUsersForProject = useCallback((projectId: string): ProjectUser[] => {
    return usersByProject[projectId]?.users || [];
  }, [usersByProject]);

  // Función para verificar si está cargando
  const isLoading = useCallback((projectId: string): boolean => {
    return !!loadingState[projectId];
  }, [loadingState]);

  // Función para verificar si hay error
  const hasError = useCallback((projectId: string): string | null => {
    return errorState[projectId] || null;
  }, [errorState]);

  // Función para obtener un usuario específico por ID
  const getUserById = useCallback((projectId: string, userId: string): ProjectUser | undefined => {
    const users = usersByProject[projectId]?.users || [];
    return users.find(user => user.userRef === userId);
  }, [usersByProject]);

  // Función para cargar usuarios y enriquecerlos con bitmask y datos adicionales
  const loadProjectUsers = useCallback(async (projectId: string): Promise<ProjectUser[]> => {
    if (!projectId) return [];

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found');

      // 1. Obtener usuarios del proyecto
      const response = await fetch(`${API_URL}/project_users/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project users: ${response.status}`);
      }

      const users: ProjectUser[] = await response.json();
      
      // 2. Obtener datos adicionales y enriquecer con bitmasks
      const enrichedUsers = await Promise.all(users.map(async (user) => {
        // Variables para almacenar datos adicionales
        let avatarUrl: string | null = null;
        let gender: string | null = null;
        let bitmask = 0;
        
        try {
          // Obtener datos del usuario desde la BD relacional
          const userDataResponse = await fetch(`${AVATAR_API_URL}/users/${user.userRef}`, {
            headers: {
              'application': 'json',
            }
          });
          
          if (userDataResponse.ok) {
            const userData = await userDataResponse.json();

            console.log(`Datos obtenidos JSON para ${user.name}:`, userData);

            avatarUrl = userData.avatar_url;
            gender = userData.gender;
            
            console.log(`Datos adicionales obtenidos para ${user.name}:`, { avatarUrl, gender });
          } else {
            console.warn(`No se pudieron obtener datos adicionales para el usuario ${user.userRef}`);
          }
          
          // Obtener bitmask del rol
          if (user.role) {
            if (userRoles && userRoles.roles) {
              const userRole = userRoles.roles.find(r => 
                r.name.toLowerCase() === user.role.toLowerCase()
              );
              
              if (userRole) {
                bitmask = userRole.bitmask;
              } else {
                // Si no encontramos el rol localmente, hacemos una petición al API
                const bitmaskResponse = await fetch(`${API_URL}/bitmask/${encodeURIComponent(user.role)}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (bitmaskResponse.ok) {
                  bitmask = await bitmaskResponse.json();
                }
              }
            }
          }
          
          // Retornar usuario enriquecido con todos los datos
          return { 
            ...user, 
            bitmask,
            avatarUrl,
            gender
          };
        } catch (error) {
          console.warn(`Error enriqueciendo datos para el usuario ${user.userRef}:`, error);
          return { 
            ...user, 
            bitmask: 0,
            avatarUrl: null,
            gender: null
          };
        }
      }));

      return enrichedUsers;
    } catch (error) {
      console.error("Error loading project users:", error);
      throw error;
    }
  }, [userRoles]);

  // Función para cargar usuarios si es necesario (usando caché)
  const loadUsersIfNeeded = useCallback(async (
    projectId: string,
    maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
  ): Promise<ProjectUser[]> => {
    if (!projectId) return [];
    
    const cachedData = usersByProject[projectId];
    const now = Date.now();
    
    // Mejorar el logging para depuración
    console.log(`Verificando caché para proyecto ${projectId}:`);
    console.log(`- Datos en caché:`, cachedData ? 'Sí' : 'No');
    
    if (cachedData?.users.length > 0) {
      const cacheAge = now - cachedData.lastFetched;
      console.log(`- Edad de la caché: ${(cacheAge/1000).toFixed(1)}s (máx: ${(maxAgeMs/1000).toFixed(1)}s)`);
      
      // Si tenemos datos en caché y no están expirados, los devolvemos
      if (cacheAge < maxAgeMs) {
        console.log(`- Usando datos en caché (${cachedData.users.length} usuarios)`);
        return cachedData.users;
      }
      console.log(`- Caché expirada, refrescando datos`);
    } else {
      console.log(`- No hay datos en caché, cargando por primera vez`);
    }
    
    // Evitar solicitudes duplicadas para el mismo projectId
    if (loadingState[projectId]) {
      console.log(`- Ya hay una solicitud en curso para este proyecto, esperando...`);
      // Esperar a que la solicitud existente termine
      const maxWait = 5000; // 5 segundos máximo de espera
      const startWait = Date.now();
      
      while (loadingState[projectId] && (Date.now() - startWait < maxWait)) {
        await new Promise(r => setTimeout(r, 100)); // Esperar 100ms
      }
      
      // Si tenemos datos después de esperar, devolverlos
      if (usersByProject[projectId]?.users) {
        return usersByProject[projectId].users;
      }
    }
    
    setLoadingState(prev => ({ ...prev, [projectId]: true }));
    setErrorState(prev => ({ ...prev, [projectId]: null }));

    try {
      console.log(`- Iniciando carga de datos para proyecto ${projectId}`);
      const fetchedUsers = await loadProjectUsers(projectId);
      
      setUsersByProject(prev => ({
        ...prev,
        [projectId]: {
          users: fetchedUsers,
          lastFetched: now
        }
      }));
      
      console.log(`- Datos cargados: ${fetchedUsers.length} usuarios`);
      return fetchedUsers;
    } catch (err) {
      console.error(`Error fetching users for project ${projectId}:`, err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load project users";
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }));
      return cachedData?.users || [];
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }));
    }
  }, [loadProjectUsers, usersByProject, loadingState]);

  // Función para refrescar usuarios (ignorando caché)
  const refreshUsers = useCallback(async (projectId: string): Promise<ProjectUser[]> => {
    if (!projectId) return [];
    
    setLoadingState(prev => ({ ...prev, [projectId]: true }));
    setErrorState(prev => ({ ...prev, [projectId]: null }));

    try {
      const fetchedUsers = await loadProjectUsers(projectId);
      
      setUsersByProject(prev => ({
        ...prev,
        [projectId]: {
          users: fetchedUsers,
          lastFetched: Date.now()
        }
      }));
      
      return fetchedUsers;
    } catch (err) {
      console.error(`Error refreshing users for project ${projectId}:`, err);
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh project users";
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }));
      
      return usersByProject[projectId]?.users || [];
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }));
    }
  }, [loadProjectUsers, usersByProject]);

  // Función para limpiar la caché de un proyecto específico
  const clearProjectCache = useCallback((projectId: string) => {
    setUsersByProject(prev => {
      const newState = { ...prev };
      delete newState[projectId];
      return newState;
    });
    
    setErrorState(prev => {
      const newState = { ...prev };
      delete newState[projectId];
      return newState;
    });
    
    setLoadingState(prev => {
      const newState = { ...prev };
      delete newState[projectId];
      return newState;
    });
  }, []);

  // Función para limpiar toda la caché
  const clearAllCache = useCallback(() => {
    setUsersByProject({});
    setLoadingState({});
    setErrorState({});
  }, []);

  return (
    <ProjectUsersContext.Provider value={{
      getUsersForProject,
      isLoading,
      hasError,
      loadUsersIfNeeded,
      refreshUsers,
      getUserById,
      clearProjectCache,
      clearAllCache
    }}>
      {children}
    </ProjectUsersContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useProjectUsers = () => {
  const context = useContext(ProjectUsersContext);
  if (context === undefined) {
    throw new Error("useProjectUsers must be used within a ProjectUsersProvider");
  }
  return context;
};