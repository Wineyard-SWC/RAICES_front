"use client"

import React, { createContext, useContext, useState, useMemo } from "react"
import type { Task } from "@/types/task"

interface GeneratedTasksContextType {
  tasks: Task[]
  addTasks: (newTasks: Task[], isManual?: boolean) => void
  clearTasks: () => void
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  handleSelectAll: () => void
  handleToggleSelectTask: (id:string) => void
}

const GeneratedTasksContext = createContext<GeneratedTasksContextType | undefined>(undefined)

export const GeneratedTasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([])

  const addTasks = (newTasks: Task[], isManual = false) => {
    setTasks(prev => {
        const updated = [...prev]
        const existingStoryIds = new Set(prev.map(t => t.user_story_id))
    
        for (const task of newTasks) {
          const isManual = task.id?.startsWith("temp-")
          const alreadyHasIA = prev.some(t => t.user_story_id === task.user_story_id && !t.id?.startsWith("temp-"))
    
          if (isManual || (!alreadyHasIA && !isManual)) {
            updated.push(task)
          }
        }
    
        return updated
    })
  }

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...data } : task))
    )
  }
  
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }
  
  const handleSelectAll = () => {
    setTasks((prev) => prev.map((task) => ({ ...task, selected: true })))
  }

  const clearTasks = () => setTasks([])

  const handleToggleSelectTask = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    updateTask(id, { selected: !task.selected })
  }

  const value = useMemo(() => ({ tasks, addTasks, clearTasks,updateTask, deleteTask, handleSelectAll,handleToggleSelectTask}), [tasks])


  return (
    <GeneratedTasksContext.Provider value={value}>
      {children}
    </GeneratedTasksContext.Provider>
  )
}

export const useGeneratedTasks = () => {
  const context = useContext(GeneratedTasksContext)
  if (!context) throw new Error("useGeneratedTasks must be used within a GeneratedTasksProvider")
  return context
}
