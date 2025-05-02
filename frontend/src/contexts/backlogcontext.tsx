"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { TaskColumns, TaskOrStory } from "@/types/taskkanban"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { mergeUserStoriesIntoTasks } from "@/utils/mergeUserStoriesIntoTasks"
import { UserStory } from "@/types/userstory"


const API_URL = process.env.NEXT_PUBLIC_API_URL!
const CACHE_EXPIRATION_MS = 10 * 60 * 1000 

interface BacklogContextType {
  tasks: TaskColumns
  stories: UserStory[]
  refreshAll: () => Promise<void>
  refreshTasks: () => Promise<void>
  refreshStories: () => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<TaskColumns>>
  setStories: React.Dispatch<React.SetStateAction<UserStory[]>>
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deleteStory: (storyId: string) => Promise<void>
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined)

export const useBacklogContext = () => {
  const context = useContext(BacklogContext)
  if (!context) throw new Error("useBacklogContext must be used within BacklogProvider")
  return context
}

export const BacklogProvider = ({ children }: { children: React.ReactNode }) => {
  const [projectId, setProjectId] = useState<string | null>(null)
  const [stories, setStories] = useState<UserStory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  
  //console.log('BacklogProvider rendering, projectId:', projectId)


  useEffect(() => {
    const storedProjectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null
    if (storedProjectId) {
      //console.log('Setting project ID from localStorage:', storedProjectId)
      setProjectId(storedProjectId)
    }
  }, [])

  // Obtenemos las tareas, su setter y la función para refrescarlas del hook
  const { tasks, setTasks, refreshTasks: refreshTasksHook } = useProjectTasks(projectId ?? "")

  // Función para generar claves de caché específicas para el proyecto actual
  const getCacheKeys = (pId: string) => ({
    tasks: `cachedTasks_${pId}`,
    stories: `cachedStories_${pId}`,
    timestamp: `cachedTime_${pId}`
  })

  // Guardar en caché
  const updateCache = (pId: string, currentTasks: TaskColumns, currentStories: UserStory[]) => {
    if (!pId) return
    
    const cacheKeys = getCacheKeys(pId)
    const now = Date.now()

    //console.log('Updating cache for project:', pId, 'at:', new Date(now).toLocaleTimeString())

    sessionStorage.setItem(cacheKeys.tasks, JSON.stringify(currentTasks))
    sessionStorage.setItem(cacheKeys.stories, JSON.stringify(currentStories))
    sessionStorage.setItem(cacheKeys.timestamp, now.toString())
  }

  // Obtener del caché
  const getFromCache = (pId: string) => {
    if (!pId) return null
    
    const cacheKeys = getCacheKeys(pId)
    const now = Date.now()
    
    const cachedTasks = sessionStorage.getItem(cacheKeys.tasks)
    const cachedStories = sessionStorage.getItem(cacheKeys.stories)
    const cachedTime = sessionStorage.getItem(cacheKeys.timestamp)
    
    const isCacheValid = 
      cachedTasks && 
      cachedStories && 
      cachedTime && 
      now - parseInt(cachedTime) < CACHE_EXPIRATION_MS
    
    //console.log('Cache check for project:', pId)
    //console.log('- Cache exists:', !!cachedTasks && !!cachedStories && !!cachedTime)
    
    if (cachedTime) {
      const cacheAge = now - parseInt(cachedTime)
      //console.log('- Cache age:', Math.round(cacheAge / 1000), 'seconds')
      //console.log('- Cache valid:', isCacheValid)
      //console.log('- Cache expires in:', Math.round((CACHE_EXPIRATION_MS - cacheAge) / 1000), 'seconds')
    }
    
    if (isCacheValid) {
      //console.log('Using cached data from:', new Date(parseInt(cachedTime)).toLocaleTimeString())
      return {
        tasks: JSON.parse(cachedTasks),
        stories: JSON.parse(cachedStories)
      }
    }
    
    //console.log('Cache invalid or not found, will fetch fresh data')
    return null
  }

  // Función interna que devuelve los datos
  const _fetchStories = async (): Promise<UserStory[] | null> => {
    if (!projectId) return null
    try {
      //console.log('Fetching stories from API for project:', projectId, 'at:', new Date().toLocaleTimeString())

      const updatedStories = await getProjectUserStories(projectId)
      setStories(updatedStories)
      return updatedStories
    } catch (error) {
      //console.error("Failed to fetch user stories:", error)
      return null
    }
  }

  // Función interna que devuelve los datos
  const _fetchTasks = async (): Promise<TaskColumns | null> => {
    if (!projectId) return null
    //console.log('Fetching tasks from API for project:', projectId, 'at:', new Date().toLocaleTimeString())
    // Llamamos a refreshTasksHook que no devuelve los datos actualizados
    await refreshTasksHook()
    //console.log('Tasks fetch completed via hook')
    // Como refreshTasksHook no devuelve datos pero actualiza tasks, simplemente retornamos tasks
    return tasks
  }

  // Función pública que cumple con el tipo Promise<void>
  const refreshStories = async (): Promise<void> => {
    //console.log('Manual refreshStories called')
    await _fetchStories()
  }

  // Función pública que cumple con el tipo Promise<void>
  const refreshTasks = async (): Promise<void> => {
    //console.log('Manual refreshTasks called')
    await _fetchTasks()
  }

  const refreshAll = async (): Promise<void> => {
    if (!projectId) return
    
    const now = Date.now()
    //console.log('refreshAll called at:', new Date(now).toLocaleTimeString())
    
    // Verificar si el último fetch fue hace poco tiempo para evitar fetches redundantes
    if (lastFetchTime && now - lastFetchTime < 5000) {
      //console.log('Skipping redundant fetch - last fetch was only', Math.round((now - lastFetchTime) / 1000), 'seconds ago')
      return
    }
    
    setLastFetchTime(now)
    
    try {
      //console.log('Starting API fetch for both tasks and stories')
      const [updatedTasks, updatedStories] = await Promise.all([
        _fetchTasks(),
        _fetchStories()
      ])
      
      // Solo actualizamos el caché si ambas peticiones fueron exitosas
      if (updatedTasks && updatedStories) {
        //console.log('Both fetches successful, updating cache')
        updateCache(projectId, updatedTasks, updatedStories)
      }
    } catch (error) {
      //console.error("Error refreshing data:", error)
    }
  }

  // Efecto para cargar datos iniciales y manejar el caché
  useEffect(() => {
    if (!projectId) return
    //console.log('Project ID changed or initialized:', projectId)

    const cachedData = getFromCache(projectId)
    
    if (cachedData) {
      // Usamos el caché si es válido
      //console.log('Using cached data instead of fetching')
      setTasks(cachedData.tasks)
      setStories(cachedData.stories)
    } else {
      //console.log('No valid cache found, fetching fresh data')
      // Si no hay caché válido, cargamos datos frescos
      refreshAll()
    }
  }, [projectId])


  useEffect(() => {
    //console.log('Tasks state updated, current columns:', Object.keys(tasks).join(', '))
  }, [tasks])
  
  useEffect(() => {
    //console.log('Stories state updated, count:', stories.length)
  }, [stories])


  // Actualizar estado de una tarea
  const updateTaskStatus = async (taskId: string, newStatus: string): Promise<void> => {
    if (!projectId) return
    
    //console.log('Updating task status:', taskId, 'to', newStatus)
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status_khanban: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update task status")
      }
      
      //console.log('Task status update successful, refreshing tasks')
      
      // Refrescamos las tareas y actualizamos el caché
      const updatedTasks = await _fetchTasks()
      if (updatedTasks) {
        updateCache(projectId, updatedTasks, stories)
      }
    } catch (error) {
      //console.error("Error updating task status:", error)
    }
  }

  // Eliminar una tarea
  const deleteTask = async (taskId: string): Promise<void> => {
    if (!projectId) return
    
    //console.log('Deleting task:', taskId)
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete task")
      }
      
      //console.log('Task deleted successfully, refreshing tasks')
      
      // Actualizamos el estado local y el caché
      const updatedTasks = await _fetchTasks()
      if (updatedTasks) {
        updateCache(projectId, updatedTasks, stories)
      }
    } catch (error) {
      //console.error("Error deleting task:", error)
    }
  }

  // Eliminar una historia de usuario
  const deleteStory = async (storyId: string): Promise<void> => {
    if (!projectId) return
    
    //console.log('Deleting user story:', storyId)
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/user-stories/${storyId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete user story")
      }
      
      //console.log('Story deleted successfully, updating state locally')
      
      // Actualizamos el estado local
      const updatedStories = stories.filter(story => story.id !== storyId)
      setStories(updatedStories)
      
      // Actualizamos el caché
      updateCache(projectId, tasks, updatedStories)
    } catch (error) {
      //console.error("Error deleting user story:", error)
    }
  }

  const combined = mergeUserStoriesIntoTasks(tasks, stories)

  return (
    <BacklogContext.Provider value={{ 
      tasks: combined, 
      stories,
      refreshAll, 
      refreshTasks,
      refreshStories,
      setTasks,
      setStories,
      updateTaskStatus,
      deleteTask,
      deleteStory,
      searchTerm,
      setSearchTerm
    }}>
      {children}
    </BacklogContext.Provider>
  )
}