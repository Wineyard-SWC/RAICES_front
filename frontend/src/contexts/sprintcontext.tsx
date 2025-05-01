// app/providers/SprintProvider.tsx
"use client"

import React, { createContext, useContext, useState } from "react"
import type { Sprint } from "@/types/sprint"
import type { Task } from "@/types/task"

type SprintContextType = {
  sprint: Sprint | null
  tasks: Task[]
  setSprint: (s: Sprint) => void
  setTasks: (t: Task[]) => void
}

const SprintContext = createContext<SprintContextType | undefined>(undefined)

export const SprintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  return (
    <SprintContext.Provider value={{ sprint, tasks, setSprint, setTasks }}>
      {children}
    </SprintContext.Provider>
  )
}

export const useSprintContext = () => {
  const ctx = useContext(SprintContext)
  if (!ctx) throw new Error("useSprintContext must be inside SprintProvider")
  return ctx
}
