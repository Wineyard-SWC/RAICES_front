"use client"

import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ProjectData {
  title: string
  description: string
  status: string
  priority: string
  progress: number
  startDate: string
  endDate: string
  invitationCode: string
  tasksCompleted: number
  totalTasks: number
  team: string
  teamSize: number
  members?: string[]
}

export const useCreateProject = (userId: string | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProject = async (projectData: ProjectData) => {
    if (!userId) {
      setError("Usuario no autenticado")
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Crear el proyecto
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
          userRef: userId,          // instead of userId, use userRef
          projectRef: newProject.id, // instead of projectId, use projectRef
          role: "owner",
          joinedAt: new Date().toISOString(), // include joinedAt
        }),
      });
      
      return newProject
    } catch (err) {
      console.error("Error al crear el proyecto:", err)
      setError("No se pudo crear el proyecto")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createProject, loading, error }
}
