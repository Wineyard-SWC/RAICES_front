'use client';
import { Project } from '@/types/project';
import { printError } from '@/utils/debugLogger';
import { createContext, useContext, useState, useCallback,ReactNode } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";


type ProjectsById = Record<string, {
  project: Project,
  lastFetched: number
}>

type ProjectsByUserId = Record<string, {
  projectIds: string[],
  lastFetched: number
}>

export type UserProjectsContextType = {
    getProject: (projectId: string) => Project | null
    getUserProjects: (userId: string) => string[]
    getAllCachedProjects: () => Project[]
    
    isLoading: (id: string) => boolean
    hasError: (id: string) => string | null
    
    setProject: (project: Project) => void
    updateProject: (projectId: string, updates: Partial<Project>) => void
    removeProject: (projectId: string) => void
    createProject: (userId: string, projectData: Omit<Project, "id">) => Promise<Project | null>

    setUserProjects: (userId: string, projectIds: string[]) => void
    addUserProject: (userId: string, projectId: string) => void
    removeUserProject: (userId: string, projectId: string) => void
    
    loadProjectIfNeeded: (
        projectId: string,
        maxAgeMs?: number
    ) => Promise<Project | null>
    
    loadUserProjectsIfNeeded: (
        userId: string,
        maxAgeMs?: number
    ) => Promise<string[]>
    
    refreshProject: (
        projectId: string,
    ) => Promise<Project | null>
    
    refreshUserProjects: (
        userId: string,
    ) => Promise<string[]>
    
    clearProjectCache: (projectId: string) => void
    clearUserProjectsCache: (userId: string) => void
    clearAllCache: () => void
}

const UserProjectsContext = createContext<UserProjectsContextType | undefined>(undefined);

export const useUserProjectContext = () => {
  const context = useContext(UserProjectsContext);
  if (!context) throw new Error('useUserProjectContext must be used within a ProjectProvider');
  return context;
};

const DEFAULT_CACHE_MAX_AGE = 10 * 60 * 1000 

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projectsById, setProjectsById] = useState<ProjectsById>({})
    const [projectsByUserId, setProjectsByUserId] = useState<ProjectsByUserId>({})
      
    const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
    const [errorState, setErrorState] = useState<Record<string, string | null>>({})

    const fetchProject = useCallback(async (projectId: string): Promise<Project> => {
        if (!projectId) throw new Error("ID de proyecto no válido")
        
        const response = await fetch(`${API_URL}/projects/${projectId}`)
        
        if (!response.ok) {
            throw new Error(`Error al obtener el proyecto: ${response.status}`)
        }
        
        return await response.json()
    }, [])

    const fetchUserProjects = useCallback(async (userId: string): Promise<Project[]> => {
        if (!userId) throw new Error("ID de usuario no válido")
        
        const response = await fetch(`${API_URL}/project_users/user/${userId}`)
        
        if (!response.ok) {
            throw new Error(`Error al obtener proyectos del usuario: ${response.status}`)
        }
        
        return await response.json()
    }, [])

    const getProject = useCallback((projectId: string): Project | null => {
        return projectsById[projectId]?.project || null
    }, [projectsById])

    const getUserProjects = useCallback((userId: string): string[] => {
        return projectsByUserId[userId]?.projectIds || []
    }, [projectsByUserId])

     const getAllCachedProjects = useCallback((): Project[] => {
        return Object.values(projectsById).map(entry => entry.project)
    }, [projectsById])

    const isLoading = useCallback((id: string): boolean => {
        return !!loadingState[id]
    }, [loadingState])

    const hasError = useCallback((id: string): string | null => {
        return errorState[id] || null
    }, [errorState])

    const setProject = useCallback((project: Project) => {
        setProjectsById(prev => ({
        ...prev,
        [project.id]: {
            project,
            lastFetched: Date.now()
        }
        }))
    }, [])

    const createProject = useCallback(async (
        userId: string, 
        projectData: Omit<Project, "id">
    ): Promise<Project | null> => {
        if (!userId) {
            setErrorState(prev => ({ ...prev, [userId]: "Usuario no autenticado" }))
            return null
        }

        setLoadingState(prev => ({ ...prev, [userId]: true }))
        setErrorState(prev => ({ ...prev, [userId]: null }))

        try {
            const projectResponse = await fetch(`${API_URL}/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(projectData),
            })

            if (!projectResponse.ok) {
                throw new Error("Error al crear el proyecto")
            }

            const newProject = await projectResponse.json()
            
            await fetch(`${API_URL}/project_users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userRef: userId,
                    projectRef: newProject.id,
                    role: "owner",
                    joinedAt: new Date().toISOString(),
                }),
            })
            
            setProject(newProject)
            addUserProject(userId, newProject.id)
            
            return newProject
        } 
        catch (err) 
        {
            printError("Error al crear el proyecto:", err)
            const errorMessage = err instanceof Error ? err.message : "No se pudo crear el proyecto"
            setErrorState(prev => ({ ...prev, [userId]: errorMessage }))
            return null
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [userId]: false }))
        }
    }, [])

    const updateProject = useCallback(async (
        projectId: string, 
        updates: Partial<Project>
    ): Promise<Project | null> => {
        if (!projectId) {
            setErrorState(prev => ({ ...prev, [projectId]: "ID de proyecto no válido" }))
            return null
        }

        setLoadingState(prev => ({ ...prev, [projectId]: true }))
        setErrorState(prev => ({ ...prev, [projectId]: null }))

        try {
            const response = await fetch(`${API_URL}/projects/${projectId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                throw new Error("Error al actualizar el proyecto")
            }

            const updatedProject = await response.json()
            
            setProjectsById(prev => {
                const currentProject = prev[projectId]?.project
                if (!currentProject) return prev

                return {
                    ...prev,
                    [projectId]: {
                        project: updatedProject,
                        lastFetched: Date.now()
                    }
                }
            })
            
            return updatedProject
        } 
        catch (err) 
        {
            printError("Error al actualizar el proyecto:", err)
            const errorMessage = err instanceof Error ? err.message : "No se pudo actualizar el proyecto"
            setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
            return projectsById[projectId]?.project || null
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [projectId]: false }))
        }
    }, [projectsById])

    const removeProject = useCallback(async (projectId: string): Promise<boolean> => {
        if (!projectId) {
            setErrorState(prev => ({ ...prev, [projectId]: "ID de proyecto no válido" }))
            return false
        }

        setLoadingState(prev => ({ ...prev, [projectId]: true }))
        setErrorState(prev => ({ ...prev, [projectId]: null }))

        try {
            const response = await fetch(`${API_URL}/projects/${projectId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Error al eliminar el proyecto")
            }
            
            setProjectsById(prev => {
                const newState = { ...prev }
                delete newState[projectId]
                return newState
            })
            
            setProjectsByUserId(prev => {
                const newState = { ...prev }
                
                Object.keys(newState).forEach(userId => {
                    const userProjects = newState[userId]
                    if (userProjects && userProjects.projectIds.includes(projectId)) {
                        newState[userId] = {
                            ...userProjects,
                            projectIds: userProjects.projectIds.filter(id => id !== projectId)
                        }
                    }
                })
                
                return newState
            })
            
            return true
        } 
        catch (err) 
        {
            printError("Error al eliminar el proyecto:", err)
            const errorMessage = err instanceof Error ? err.message : "No se pudo eliminar el proyecto"
            setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
            return false
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [projectId]: false }))
        }
    }, [])

    const setUserProjects = useCallback((userId: string, projectIds: string[]) => {
        setProjectsByUserId(prev => ({
        ...prev,
        [userId]: {
            projectIds,
            lastFetched: Date.now()
        }
        }))
    }, [])

    const addUserProject = useCallback((userId: string, projectId: string) => {
        setProjectsByUserId(prev => {
        const currentIds = prev[userId]?.projectIds || []
        if (currentIds.includes(projectId)) return prev

        return {
            ...prev,
            [userId]: {
            projectIds: [...currentIds, projectId],
            lastFetched: Date.now()
            }
        }
        })
    }, [])

    const removeUserProject = useCallback((userId: string, projectId: string) => {
        setProjectsByUserId(prev => {
        const currentIds = prev[userId]?.projectIds || []
        
        return {
            ...prev,
            [userId]: {
            projectIds: currentIds.filter(id => id !== projectId),
            lastFetched: Date.now()
            }
        }
        })
    }, [])


    const loadProjectIfNeeded = useCallback(async (
        projectId: string,
        maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
    ): Promise<Project | null> => {
        if (!projectId) return null
        
        const cachedData = projectsById[projectId]
        const now = Date.now()
        
        if (cachedData && (now - cachedData.lastFetched) < maxAgeMs) 
        {
            return cachedData.project
        }
        
        setLoadingState(prev => ({ ...prev, [projectId]: true }))
        setErrorState(prev => ({ ...prev, [projectId]: null }))

        try 
        {
            const fetchedProject = await fetchProject(projectId)
            
            setProjectsById(prev => ({
                ...prev,
                [projectId]: {
                project: fetchedProject,
                lastFetched: now
                }
            }))
            
            return fetchedProject

        } 
        catch (err) 
        {
            printError(`Error fetching project ${projectId}:`, err)
            const errorMessage = err instanceof Error ? err.message : "Failed to load project"
            setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
            return cachedData?.project || null
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [projectId]: false }))
        }
    }, [projectsById, fetchProject])

    const loadUserProjectsIfNeeded = useCallback(async (
        userId: string,
        maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
    ): Promise<string[]> => {
        if (!userId) return []
        
        const cachedData = projectsByUserId[userId]
        const now = Date.now()
        
        if (cachedData && (now - cachedData.lastFetched) < maxAgeMs) 
        {
            return cachedData.projectIds
        }
        
        setLoadingState(prev => ({ ...prev, [userId]: true }))
        setErrorState(prev => ({ ...prev, [userId]: null }))

        try 
        {
            const fetchedProjects = await fetchUserProjects(userId)
            const fetchedProjectIds = fetchedProjects.map(p => p.id)
            
            const projectUpdates: ProjectsById = {}
            fetchedProjects.forEach(project => {
                projectUpdates[project.id] = {
                project,
                lastFetched: now
                }
            })
            
            setProjectsById(prev => ({
                ...prev,
                ...projectUpdates
            }))
            
            setProjectsByUserId(prev => ({
                ...prev,
                [userId]: {
                projectIds: fetchedProjectIds,
                lastFetched: now
                }
            }))
            
            return fetchedProjectIds
        } 
        catch (err) 
        {
            printError(`Error fetching projects for user ${userId}:`, err)
            const errorMessage = err instanceof Error ? err.message : "Failed to load user projects"
            setErrorState(prev => ({ ...prev, [userId]: errorMessage }))
            return cachedData?.projectIds || []
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [userId]: false }))
        }
    }, [projectsByUserId, fetchUserProjects])

    const refreshProject = useCallback(async (
        projectId: string
    ): Promise<Project | null> => {
        if (!projectId) return null
        
        setLoadingState(prev => ({ ...prev, [projectId]: true }))
        setErrorState(prev => ({ ...prev, [projectId]: null }))

        try 
        {
            const fetchedProject = await fetchProject(projectId)
            
            setProjectsById(prev => ({
                ...prev,
                [projectId]: {
                project: fetchedProject,
                lastFetched: Date.now()
                }
            }))
            
            return fetchedProject
        } 
        catch (err) 
        {
            printError(`Error refreshing project ${projectId}:`, err)
            const errorMessage = err instanceof Error ? err.message : "Failed to refresh project"
            setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
            return projectsById[projectId]?.project || null
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [projectId]: false }))
        }
    }, [projectsById, fetchProject])

    const refreshUserProjects = useCallback(async (
        userId: string
    ): Promise<string[]> => {
        if (!userId) return []
        
        setLoadingState(prev => ({ ...prev, [userId]: true }))
        setErrorState(prev => ({ ...prev, [userId]: null }))

        try 
        {
            const fetchedProjects = await fetchUserProjects(userId)
            const fetchedProjectIds = fetchedProjects.map(p => p.id)
            
            const projectUpdates: ProjectsById = {}
            fetchedProjects.forEach(project => {
                projectUpdates[project.id] = {
                project,
                lastFetched: Date.now()
                }
            })
            
            setProjectsById(prev => ({
                ...prev,
                ...projectUpdates
            }))
            
            setProjectsByUserId(prev => ({
                ...prev,
                [userId]: {
                projectIds: fetchedProjectIds,
                lastFetched: Date.now()
                }
            }))
            
            return fetchedProjectIds
        } 
        catch (err) 
        {
            printError(`Error refreshing projects for user ${userId}:`, err)
            const errorMessage = err instanceof Error ? err.message : "Failed to refresh user projects"
            setErrorState(prev => ({ ...prev, [userId]: errorMessage }))
            return projectsByUserId[userId]?.projectIds || []
        } 
        finally 
        {
            setLoadingState(prev => ({ ...prev, [userId]: false }))
        }
    }, [projectsByUserId, fetchUserProjects])

    const clearProjectCache = useCallback((projectId: string) => {
        setProjectsById(prev => {
            const newState = { ...prev }
            delete newState[projectId]
            return newState
        })
        
        setErrorState(prev => {
            const newState = { ...prev }
            delete newState[projectId]
            return newState
        })
        
        setLoadingState(prev => {
            const newState = { ...prev }
            delete newState[projectId]
            return newState
        })
    }, [])

    const clearUserProjectsCache = useCallback((userId: string) => {
        setProjectsByUserId(prev => {
            const newState = { ...prev }
            delete newState[userId]
            return newState
        })
        
        setErrorState(prev => {
            const newState = { ...prev }
            delete newState[userId]
            return newState
        })
        
        setLoadingState(prev => {
            const newState = { ...prev }
            delete newState[userId]
            return newState
        })
    }, [])

    const clearAllCache = useCallback(() => {
        setProjectsById({})
        setProjectsByUserId({})
        setLoadingState({})
        setErrorState({})
    }, [])



    return (
        <UserProjectsContext.Provider value={{ 
            getProject,
            getUserProjects,
            getAllCachedProjects,
            
            isLoading,
            hasError,
            
            setProject,
            updateProject,
            removeProject,
            createProject,

            setUserProjects,
            addUserProject,
            removeUserProject,
            
            loadProjectIfNeeded,
            loadUserProjectsIfNeeded,
            refreshProject,
            refreshUserProjects,
            
            clearProjectCache,
            clearUserProjectsCache,
            clearAllCache
        }}>
        {children}
        </UserProjectsContext.Provider>
    );
};

