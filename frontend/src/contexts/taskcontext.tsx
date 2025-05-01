"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { Task } from "@/types/task"
import { getProjectTasks } from "@/utils/getProjectTasks"

type TaskContextType = {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  loading: boolean
  error: string | null
  refreshTasks: (projectId: string) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTasks = async (projectId: string) => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const fetchedTasks = await getProjectTasks(projectId)
      setTasks(fetchedTasks)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <TaskContext.Provider value={{ tasks, setTasks, loading, error, refreshTasks }}>{children}</TaskContext.Provider>
  )
}

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
