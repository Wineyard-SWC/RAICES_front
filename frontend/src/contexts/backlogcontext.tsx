"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { TaskColumns, TaskOrStory } from "@/types/taskkanban"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { mergeUserStoriesIntoTasks } from "@/utils/mergeUserStoriesIntoTasks"
import { UserStory } from "@/types/userstory"

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
  
  useEffect(() => {
    const storedProjectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") : null
    if (storedProjectId) {
      setProjectId(storedProjectId)
    }
  }, [])

  const { tasks, setTasks, refreshTasks: refreshTasksHook } = useProjectTasks(projectId ?? "")

  const refreshStories = async () => {
    if (!projectId) return
    try {
      const updatedStories = await getProjectUserStories(projectId)
      setStories(updatedStories)
    } catch (error) {
      console.error("Failed to fetch user stories:", error)
    }
  }

  const refreshTasks = async () => {
    if (!projectId) return
    await refreshTasksHook()
  }

  const refreshAll = async () => {
    await refreshTasks()
    await refreshStories()
  }

  useEffect(() => {
    if (projectId) {
      refreshAll()
    }
  }, [projectId])

  const API_URL = process.env.NEXT_PUBLIC_API_URL!

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!projectId) return
    
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
      
      await refreshTasks()
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!projectId) return
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete task")
      }
      
      // Actualizar el estado local después de la eliminación exitosa
      await refreshTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const deleteStory = async (storyId: string) => {
    if (!projectId) return
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/user-stories/${storyId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete user story")
      }
      
      // Actualizar el estado local después de la eliminación exitosa
      setStories(prev => prev.filter(story => story.id !== storyId))
    } catch (error) {
      console.error("Error deleting user story:", error)
    }
  }

  // Combinamos tareas e historias para el Kanban
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