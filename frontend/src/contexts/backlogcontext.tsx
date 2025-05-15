"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { TaskColumns } from "@/types/taskkanban"
import { UserStory } from "@/types/userstory"
import { useBacklogData } from "@/hooks/useBacklogData"
import { mergeUserStoriesIntoTasks } from "@/utils/mergeUserStoriesIntoTasks"

interface BacklogContextType {
  // State
  tasks: TaskColumns
  stories: UserStory[]
  isLoading: boolean
  error: Error | null
  searchTerm: string
  
  // Actions
  setSearchTerm: (term: string) => void
  refreshAll: (force?: boolean) => Promise<void>
  refreshTasks: () => Promise<void>
  refreshStories: () => Promise<void>
  setTasks: React.Dispatch<React.SetStateAction<TaskColumns>>
  setStories: React.Dispatch<React.SetStateAction<UserStory[]>>
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deleteStory: (storyId: string) => Promise<void>
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined)

export const useBacklogContext = () => {
  const context = useContext(BacklogContext)
  if (!context) throw new Error("useBacklogContext must be used within BacklogProvider")
  return context
}

export const BacklogProvider = ({ children }: { children: ReactNode }) => {
  const { 
    tasks: rawTasks,
    stories,
    isLoading,
    error,
    setTasks,
    setStories,
    refreshData,
    updateTaskStatus,
    deleteTask,
    deleteStory 
  } = useBacklogData()

  const [searchTerm, setSearchTerm] = useState('')

  const tasks = mergeUserStoriesIntoTasks(rawTasks, stories)

  const refreshAll = (force = false) => refreshData(force)
  const refreshTasks = () => Promise.resolve() 
  const refreshStories = () => refreshData(true)

  return (
    <BacklogContext.Provider value={{ 
      tasks, 
      stories,
      isLoading,
      error,
      searchTerm,
      
      setSearchTerm,
      refreshAll, 
      refreshTasks,
      refreshStories,
      setTasks,
      setStories,
      updateTaskStatus,
      deleteTask,
      deleteStory
    }}>
      {children}
    </BacklogContext.Provider>
  )
}