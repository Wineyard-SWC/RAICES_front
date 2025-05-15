"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Task } from "@/types/task"

type TasksByProjectId = Record<string, {
  tasks: Task[],
  lastFetched: number
}>

export type TaskContextType = {
  getTasksForProject: (projectId: string) => Task[]
  isLoading: (projectId: string) => boolean
  hasError: (projectId: string) => string | null
  setTasksForProject: (projectId: string, tasks: Task[]) => void
  updateTasksForProject: (projectId: string, updateFn: (tasks: Task[]) => Task[]) => void
  addTaskToProject: (projectId: string, task: Task) => void
  updateTaskInProject: (projectId: string, taskId: string, updatedTask: Partial<Task>) => void
  removeTaskFromProject: (projectId: string, taskId: string) => void
  loadTasksIfNeeded: (
    projectId: string, 
    fetchFunction: (projectId: string) => Promise<Task[]>,
    maxAgeMs?: number
  ) => Promise<Task[]>
  refreshTasks: (
    projectId: string, 
    fetchFunction: (projectId: string) => Promise<Task[]>
  ) => Promise<Task[]>
  clearProjectCache: (projectId: string) => void
  clearAllCache: () => void
}

const DEFAULT_CACHE_MAX_AGE = 30 * 60 * 1000

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasksByProject, setTasksByProject] = useState<TasksByProjectId>({})
  
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
  
  const [errorState, setErrorState] = useState<Record<string, string | null>>({})

  const getTasksForProject = useCallback((projectId: string): Task[] => {
    return tasksByProject[projectId]?.tasks || []
  }, [tasksByProject])

  const isLoading = useCallback((projectId: string): boolean => {
    return !!loadingState[projectId]
  }, [loadingState])

  const hasError = useCallback((projectId: string): string | null => {
    return errorState[projectId] || null
  }, [errorState])

  const setTasksForProject = useCallback((projectId: string, tasks: Task[]) => {
    setTasksByProject(prev => ({
      ...prev,
      [projectId]: {
        tasks,
        lastFetched: Date.now()
      }
    }))
  }, [])

  const updateTasksForProject = useCallback((
    projectId: string, 
    updateFn: (tasks: Task[]) => Task[]
  ) => {
    setTasksByProject(prev => {
      const currentTasks = prev[projectId]?.tasks || [];
      const updatedTasks = updateFn(currentTasks);
      
      return {
        ...prev,
        [projectId]: {
          tasks: updatedTasks,
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const addTaskToProject = useCallback((projectId: string, task: Task) => {
    setTasksByProject(prev => {
      const currentTasks = prev[projectId]?.tasks || [];
      
      return {
        ...prev,
        [projectId]: {
          tasks: [...currentTasks, task],
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const updateTaskInProject = useCallback((
    projectId: string, 
    taskId: string, 
    updatedTask: Partial<Task>
  ) => {
    setTasksByProject(prev => {
      const currentTasks = prev[projectId]?.tasks || [];
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      );
      
      return {
        ...prev,
        [projectId]: {
          tasks: updatedTasks,
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const removeTaskFromProject = useCallback((projectId: string, taskId: string) => {
    setTasksByProject(prev => {
      const currentTasks = prev[projectId]?.tasks || [];
      const filteredTasks = currentTasks.filter(task => task.id !== taskId);
      
      return {
        ...prev,
        [projectId]: {
          tasks: filteredTasks,
          lastFetched: Date.now()
        }
      };
    });
  }, []);

  const loadTasksIfNeeded = useCallback(async (
    projectId: string,
    fetchFunction: (projectId: string) => Promise<Task[]>,
    maxAgeMs: number = DEFAULT_CACHE_MAX_AGE
  ): Promise<Task[]> => {
    if (!projectId) return []
    
    const cachedData = tasksByProject[projectId]
    const now = Date.now()
    
    if (cachedData?.tasks.length > 0 && (now - cachedData.lastFetched) < maxAgeMs) {
      return cachedData.tasks
    }
    
    setLoadingState(prev => ({ ...prev, [projectId]: true }))
    setErrorState(prev => ({ ...prev, [projectId]: null }))

    try {
      const fetchedTasks = await fetchFunction(projectId)
      
      setTasksByProject(prev => ({
        ...prev,
        [projectId]: {
          tasks: fetchedTasks,
          lastFetched: now
        }
      }))
      
      return fetchedTasks
    } catch (err) {
      console.error(`Error fetching tasks for project ${projectId}:`, err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load tasks"
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
      return cachedData?.tasks || []
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }))
    }
  }, [tasksByProject])

  const refreshTasks = useCallback(async (
    projectId: string,
    fetchFunction: (projectId: string) => Promise<Task[]>
  ): Promise<Task[]> => {
    if (!projectId) return []
    
    setLoadingState(prev => ({ ...prev, [projectId]: true }))
    setErrorState(prev => ({ ...prev, [projectId]: null }))

    try {
      const fetchedTasks = await fetchFunction(projectId)
      
      setTasksByProject(prev => ({
        ...prev,
        [projectId]: {
          tasks: fetchedTasks,
          lastFetched: Date.now()
        }
      }))
      
      return fetchedTasks
    } catch (err) {
      console.error(`Error refreshing tasks for project ${projectId}:`, err)
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh tasks"
      setErrorState(prev => ({ ...prev, [projectId]: errorMessage }))
      
      return tasksByProject[projectId]?.tasks || []
    } finally {
      setLoadingState(prev => ({ ...prev, [projectId]: false }))
    }
  }, [tasksByProject])

  const clearProjectCache = useCallback((projectId: string) => {
    setTasksByProject(prev => {
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
    setTasksByProject({})
    setLoadingState({})
    setErrorState({})
  }, [])

  return (
    <TaskContext.Provider value={{
      getTasksForProject,
      isLoading,
      hasError,
      setTasksForProject,
      updateTasksForProject,
      addTaskToProject,
      updateTaskInProject,
      removeTaskFromProject,
      loadTasksIfNeeded,
      refreshTasks,
      clearProjectCache,
      clearAllCache
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}