"use client"

import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ProjectData {
  title: string
  description: string
  status: string
  priority: string
  startDate: string
  endDate: string
  invitationCode?: string
  progress?: number
  tasksCompleted?: number
  totalTasks?: number
  team?: string
  teamSize?: number
}

export const useUpdateProject = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProject = async (projectId: string, projectData: ProjectData) => {
    if (!projectId) {
      setError("ID de proyecto no válido")
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el proyecto")
      }

      const updatedProject = await response.json()
      return updatedProject
    } catch (err) {
      console.error("Error al actualizar el proyecto:", err)
      setError("No se pudo actualizar el proyecto")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateProject, loading, error }
}
