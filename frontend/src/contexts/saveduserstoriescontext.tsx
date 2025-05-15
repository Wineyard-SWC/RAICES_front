"use client";

import type React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import type { UserStory } from "@/types/userstory";

type UserStoriesByProjectId = Record<string, {
  userStories: UserStory[],
  lastFetched: number
}>

export type UserStoryContextType = {
  getUserStoriesForProject: (projectId: string) => UserStory[]
  isLoading: (projectId: string) => boolean
  hasError: (projectId: string) => string | null
  setUserStoriesForProject: (projectId: string, userStories: UserStory[]) => void
  updateUserStoriesForProject: (projectId: string, updateFn: (userStories: UserStory[]) => UserStory[]) => void
  addUserStoryToProject: (projectId: string, userStory: UserStory) => void
  updateUserStoryInProject: (projectId: string, userStoryId: string, updatedUserStory: Partial<UserStory>) => void
  removeUserStoryFromProject: (projectId: string, userStoryId: string) => void
  loadUserStoriesIfNeeded: (
    projectId: string, 
    fetchFunction: (projectId: string) => Promise<UserStory[]>,
    maxAgeMs?: number
  ) => Promise<UserStory[]>
  refreshUserStories: (
    projectId: string, 
    fetchFunction: (projectId: string) => Promise<UserStory[]>
  ) => Promise<UserStory[]>
  clearProjectCache: (projectId: string) => void
  clearAllCache: () => void
}

const DEFAULT_CACHE_MAX_AGE = 30 * 60 * 1000 // 30 minutos

const UserStoryContext = createContext<UserStoryContextType | undefined>(undefined)

export const UserStoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStoriesByProject, setUserStoriesByProject] = useState<UserStoriesByProjectId>({})
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
  const [errorState, setErrorState] = useState<Record<string, string | null>>({})

  const getUserStoriesForProject = useCallback((projectId: string): UserStory[] => {
    return userStoriesByProject[projectId]?.userStories || []
  }, [userStoriesByProject])

  const isLoading = useCallback((projectId: string): boolean => {
    return !!loadingState[projectId]
  }, [loadingState])

  const hasError = useCallback((projectId: string): string | null => {
    return errorState[projectId] || null
  }, [errorState])

  const setUserStoriesForProject = useCallback((projectId: string, userStories: UserStory[]) => {
    setUserStoriesByProject(prev => ({
      ...prev,
      [projectId]: {
        userStories,
        lastFetched: Date.now()
      }
    }))
  }, [])

  const updateUserStoriesForProject = useCallback((
    projectId: string, 
    updateFn: (userStories: UserStory[]) => UserStory[]
  ) => {
    setUserStoriesByProject(prev => {
      const currentUserStories = prev[projectId]?.userStories || [];
      const updatedUserStories = updateFn(currentUserStories);
      
      return {
        ...prev,
        [projectId]: {
          userStories: updatedUserStories,
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const addUserStoryToProject = useCallback((projectId: string, userStory: UserStory) => {
    setUserStoriesByProject(prev => {
      const currentUserStories = prev[projectId]?.userStories || [];
      
      return {
        ...prev,
        [projectId]: {
          userStories: [...currentUserStories, userStory],
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const updateUserStoryInProject = useCallback((
    projectId: string, 
    userStoryId: string, 
    updatedUserStory: Partial<UserStory>
  ) => {
    setUserStoriesByProject(prev => {
      const currentUserStories = prev[projectId]?.userStories || [];
      const updatedUserStories = currentUserStories.map(userStory => 
        userStory.id === userStoryId ? { ...userStory, ...updatedUserStory } : userStory
      );
      
      return {
        ...prev,
        [projectId]: {
          userStories: updatedUserStories,
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const removeUserStoryFromProject = useCallback((projectId: string, userStoryId: string) => {
    setUserStoriesByProject(prev => {
      const currentUserStories = prev[projectId]?.userStories || [];
      const filteredUserStories = currentUserStories.filter(userStory => userStory.uuid !== userStoryId);
      
      return {
        ...prev,
        [projectId]: {
          userStories: filteredUserStories,
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const loadUserStoriesIfNeeded = useCallback(async (
    projectId: string,
    fetchFunction: (projectId: string) => Promise<UserStory[]>,
    maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
  ): Promise<UserStory[]> => {
    if (!projectId) return []
    
    const cachedData = userStoriesByProject[projectId]
    const now = Date.now()
    
    // Si tenemos datos cacheados y no han expirado, devolverlos
    if (cachedData?.userStories.length > 0 && (now - cachedData.lastFetched) < maxAgeMs) {
      return cachedData.userStories
    }
    
    setLoadingState(prev => ({ ...prev, [projectId]: true }))
    setErrorState(prev => ({ ...prev, [projectId]: null }))

    try {
      const fetchedUserStories = await fetchFunction(projectId)
      
      setUserStoriesByProject(prev => ({
        ...prev,
        [projectId]: {
          userStories: fetchedUserStories,
          lastFetched: now
        }
      }))
      
      return fetchedUserStories
    } catch (err) {
      console.error(`Error fetching user stories for project ${projectId}:`, err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load user stories"
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
      return cachedData?.userStories || []
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }))
    }
  }, [userStoriesByProject])

  const refreshUserStories = useCallback(async (
    projectId: string,
    fetchFunction: (projectId: string) => Promise<UserStory[]>
  ): Promise<UserStory[]> => {
    if (!projectId) return []
    
    setLoadingState(prev => ({ ...prev, [projectId]: true }))
    setErrorState(prev => ({ ...prev, [projectId]: null }))

    try {
      const fetchedUserStories = await fetchFunction(projectId)
      
      setUserStoriesByProject(prev => ({
        ...prev,
        [projectId]: {
          userStories: fetchedUserStories,
          lastFetched: Date.now()
        }
      }))
      
      return fetchedUserStories
    } catch (err) {
      console.error(`Error refreshing user stories for project ${projectId}:`, err)
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh user stories"
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
      
      return userStoriesByProject[projectId]?.userStories || []
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }))
    }
  }, [userStoriesByProject])

  const clearProjectCache = useCallback((projectId: string) => {
    setUserStoriesByProject(prev => {
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
  }, [])

  const clearAllCache = useCallback(() => {
    setUserStoriesByProject({})
    setLoadingState({})
    setErrorState({})
  }, [])

  return (
    <UserStoryContext.Provider value={{
      getUserStoriesForProject,
      isLoading,
      hasError,
      setUserStoriesForProject,
      updateUserStoriesForProject,
      addUserStoryToProject,
      updateUserStoryInProject,
      removeUserStoryFromProject,
      loadUserStoriesIfNeeded,
      refreshUserStories,
      clearProjectCache,
      clearAllCache
    }}>
      {children}
    </UserStoryContext.Provider>
  )
}

export const useUserStories = () => {
  const context = useContext(UserStoryContext)
  if (context === undefined) {
    throw new Error("useUserStories must be used within a UserStoryProvider")
  }
  return context
}