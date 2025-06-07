'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useUserRoles } from "./userRolesContext";
import { useUser } from "./usercontext";
import { print, printError } from "@/utils/debugLogger";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Interfaz para la información del permiso en un proyecto
interface ProjectPermission {
  projectId: string;
  role: string;
  bitmask: number;
  lastFetched: number;
}

// Tipo para almacenar permisos por proyecto
type PermissionsByProjectId = Record<string, ProjectPermission>;

// Interfaz para el contexto
interface UserPermissionsContextType {
  // Funciones de consulta
  getCurrentBitmask: () => number;
  getCurrentProjectRole: () => string | null;
  getProjectBitmask: (projectId: string) => number;
  getProjectRole: (projectId: string) => string | null;
  hasPermission: (bit: number, projectId?: string) => boolean;
  
  // Estado de carga y errores
  isLoading: (projectId: string) => boolean;
  hasError: (projectId: string) => string | null;
  
  // Funciones para cargar datos
  loadUserPermissionsIfNeeded: (userId: string, maxAgeMs?: number) => Promise<void>;
  refreshUserPermissions: (userId: string) => Promise<void>;
  
  // Control del proyecto actual
  setCurrentProjectPermissions: (projectId: string) => void;
  getCurrentProject: () => string | null;
  
  // Limpieza de caché
  clearPermissionsCache: () => void;
}

// Crear el contexto
const UserPermissionsContext = createContext<UserPermissionsContextType | undefined>(undefined);

// Constante para el tiempo de caché predeterminado (30 minutos)
const DEFAULT_CACHE_MAX_AGE = 30 * 60 * 1000;

// Proveedor del contexto
export const UserPermissionsProvider = ({ children }: { children: ReactNode }) => {
  // Estado para almacenar permisos por proyecto
  const [permissionsByProject, setPermissionsByProject] = useState<PermissionsByProjectId>({});
  // Estado para el proyecto actual
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  // Estados para gestionar carga y errores
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [errorState, setErrorState] = useState<Record<string, string | null>>({});
  
  // Obtener el contexto de roles para buscar bitmasks y el ID de usuario
  const { userRoles } = useUserRoles();
  const { userId } = useUser();
  
  // Efecto para obtener el proyecto actual del localStorage
  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setCurrentProjectId(storedProjectId);
    }
  }, []);
  
  // Función para obtener todas las relaciones de proyectos del usuario
  const fetchUserProjectRelations = useCallback(async (userId: string) => {
    if (!userId) throw new Error("Se requiere un ID de usuario válido");
    
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Se requiere un token de autenticación");
    
    const response = await fetch(`${API_URL}/project_users/user/${userId}/relations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener relaciones de proyectos: ${response.status}`);
    }
    
    return await response.json();
  }, []);
  
  // Función para obtener el bitmask de un rol específico
  const fetchRoleBitmask = useCallback(async (roleName: string) => {
    if (!roleName) return 0;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Se requiere un token de autenticación");
      
      const response = await fetch(`${API_URL}/user-roles/bitmask/${encodeURIComponent(roleName)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      print("Respuesta de la API para bitmask:----------------------------------", response);
      
      if (!response.ok) {
        throw new Error(`Error al obtener bitmask para rol ${roleName}: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      printError("Error obteniendo bitmask:", error);
      return 0;
    }
  }, []);
  
  // Función para encontrar el bitmask de un rol en los roles locales
  const findLocalBitmask = useCallback((roleName: string): number => {
    if (!userRoles?.roles || !roleName) return 0;
    
    const matchingRole = userRoles.roles.find(
      r => r.name.toLowerCase() === roleName.toLowerCase()
    );
    
    return matchingRole?.bitmask || 0;
  }, [userRoles]);
  
  // Función para cargar los permisos del usuario si son necesarios (con caché)
  const loadUserPermissionsIfNeeded = useCallback(async (
    userId: string,
    maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
  ): Promise<void> => {
    if (!userId) return;
    
    // Verificar si todos los proyectos tienen permisos actualizados
    const now = Date.now();
    const needsRefresh = Object.values(permissionsByProject).some(
      perm => (now - perm.lastFetched) > maxAgeMs
    );
    
    // Si tenemos permisos recientes, no recargar
    if (Object.keys(permissionsByProject).length > 0 && !needsRefresh) {
      return;
    }
    
    setLoadingState(prev => ({ ...prev, [userId]: true }));
    setErrorState(prev => ({ ...prev, [userId]: null }));
    
    try {
      // 1. Obtener todas las relaciones del usuario con proyectos
      const relations = await fetchUserProjectRelations(userId);
      
      // 2. Procesar cada relación para obtener su bitmask
      const permissionsMap: PermissionsByProjectId = {};
      
      await Promise.all(relations.map(async (relation: any) => {
        const { projectRef, role } = relation;
        
        // Primero intentar encontrar el bitmask en los roles locales
        let bitmask = findLocalBitmask(role);
        
        // Si no se encuentra localmente, buscar en la API
        if (bitmask === 0 && role) {
          print("Buscando bitmask en API para rol:", role);
          bitmask = await fetchRoleBitmask(role);
          print("Bitmask encontrado:", bitmask);
        }
        
        permissionsMap[projectRef] = {
          projectId: projectRef,
          role,
          bitmask,
          lastFetched: now
        };
      }));
      
      // 3. Actualizar el estado con todos los permisos
      setPermissionsByProject(prev => ({
        ...prev,
        ...permissionsMap
      }));

      print("Permisos cargados:", permissionsMap);
      
    } catch (error) {
      printError("Error cargando permisos del usuario:", error);
      setErrorState(prev => ({
        ...prev,
        [userId]: error instanceof Error ? error.message : "Error desconocido al cargar permisos"
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, [userId]: false }));
    }
  }, [fetchUserProjectRelations, fetchRoleBitmask, findLocalBitmask, permissionsByProject]);
  
  // Función para refrescar los permisos (ignorando la caché)
  const refreshUserPermissions = useCallback(async (userId: string): Promise<void> => {
    if (!userId) return;
    
    setLoadingState(prev => ({ ...prev, [userId]: true }));
    setErrorState(prev => ({ ...prev, [userId]: null }));
    
    try {
      // Obtener todas las relaciones nuevamente
      const relations = await fetchUserProjectRelations(userId);
      
      // Procesar cada relación para obtener su bitmask
      const now = Date.now();
      const permissionsMap: PermissionsByProjectId = {};
      
      await Promise.all(relations.map(async (relation: any) => {
        const { projectRef, role } = relation;
        
        // Primero intentar encontrar el bitmask en los roles locales
        let bitmask = findLocalBitmask(role);
        
        // Si no se encuentra localmente, buscar en la API
        if (bitmask === 0 && role) {
          bitmask = await fetchRoleBitmask(role);
        }
        
        permissionsMap[projectRef] = {
          projectId: projectRef,
          role,
          bitmask,
          lastFetched: now
        };
      }));
      
      // Actualizar el estado con todos los permisos (reemplazando los anteriores)
      setPermissionsByProject(permissionsMap);
      
    } catch (error) {
      printError("Error refrescando permisos del usuario:", error);
      setErrorState(prev => ({
        ...prev,
        [userId]: error instanceof Error ? error.message : "Error desconocido al refrescar permisos"
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, [userId]: false }));
    }
  }, [fetchUserProjectRelations, fetchRoleBitmask, findLocalBitmask]);
  
  // Establecer el proyecto actual
  const setCurrentProjectPermissions = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
    localStorage.setItem("currentProjectId", projectId);
  }, []);
  
  // Obtener el proyecto actual
  const getCurrentProject = useCallback(() => {
    return currentProjectId;
  }, [currentProjectId]);
  
  // Obtener el bitmask del proyecto actual
  const getCurrentBitmask = useCallback(() => {
    if (!currentProjectId) return 0;
    return permissionsByProject[currentProjectId]?.bitmask || 0;
  }, [currentProjectId, permissionsByProject]);
  
  // Obtener el rol del proyecto actual
  const getCurrentProjectRole = useCallback(() => {
    if (!currentProjectId) return null;
    return permissionsByProject[currentProjectId]?.role || null;
  }, [currentProjectId, permissionsByProject]);
  
  // Obtener el bitmask de un proyecto específico
  const getProjectBitmask = useCallback((projectId: string) => {
    return permissionsByProject[projectId]?.bitmask || 0;
  }, [permissionsByProject]);
  
  // Obtener el rol de un proyecto específico
  const getProjectRole = useCallback((projectId: string) => {
    return permissionsByProject[projectId]?.role || null;
  }, [permissionsByProject]);
  
  // Verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((bit: number, projectId?: string) => {
    const bitmask = projectId 
      ? getProjectBitmask(projectId) 
      : getCurrentBitmask();
    
    return (bitmask & bit) === bit;
  }, [getCurrentBitmask, getProjectBitmask]);
  
  // Verificar si está cargando para un ID específico
  const isLoading = useCallback((id: string) => {
    return !!loadingState[id];
  }, [loadingState]);
  
  // Verificar si hay error para un ID específico
  const hasError = useCallback((id: string) => {
    return errorState[id] || null;
  }, [errorState]);
  
  // Limpiar toda la caché de permisos
  const clearPermissionsCache = useCallback(() => {
    setPermissionsByProject({});
    setLoadingState({});
    setErrorState({});
  }, []);
  
  // Cargar permisos automáticamente cuando se monta el componente
  useEffect(() => {
    if (userId) {
      loadUserPermissionsIfNeeded(userId);
    }
  }, [userId, loadUserPermissionsIfNeeded]);
  
  // Valor del contexto
  const contextValue = {
    getCurrentBitmask,
    getCurrentProjectRole,
    getProjectBitmask,
    getProjectRole,
    hasPermission,
    
    isLoading,
    hasError,
    
    loadUserPermissionsIfNeeded,
    refreshUserPermissions,
    
    setCurrentProjectPermissions,
    getCurrentProject,
    
    clearPermissionsCache
  };
  
  return (
    <UserPermissionsContext.Provider value={contextValue}>
      {children}
    </UserPermissionsContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUserPermissions = () => {
  const context = useContext(UserPermissionsContext);
  if (!context) {
    throw new Error("useUserPermissions debe usarse dentro de UserPermissionsProvider");
  }
  return context;
};