"use client"

import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useDeleteProject = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteProject = async (projectId: string) => {
    if (!projectId) {
      setError("ID de proyecto no válido")
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el proyecto")
      }

      return true
    } catch (err) {
      console.error("Error al eliminar el proyecto:", err)
      setError("No se pudo eliminar el proyecto")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteProject, loading, error }
}
