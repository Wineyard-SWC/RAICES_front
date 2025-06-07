"use client"

import { printError } from "@/utils/debugLogger"
import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useLeaveProject = (userId: string | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Deja el proyecto con ID `projectId`, paso a paso:
   * 1) Busca la relación en /project_users/relation?user_id=xxx&project_id=yyy
   * 2) Borra ese doc con DELETE /project_users/{doc.id}
   * 3) Actualiza el proyecto (teamSize)
   */
  const leaveProject = async (projectId: string) => {
    if (!userId) {
      setError("User not authenticated")
      return false
    }
    if (!projectId) {
      setError("Invalid project ID")
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // 1) Buscar la relación doc.id
      const relationResp = await fetch(
        `${API_URL}/project_users/relation?user_id=${userId}&project_id=${projectId}`
      )
      if (!relationResp.ok) {
        throw new Error("Error fetching relationship")
      }

      const relationData = await relationResp.json()
      // relationData.id es el ID del documento en project_users

      // 2) Borramos la relación
      const deleteResp = await fetch(
        `${API_URL}/project_users/${relationData.id}`,
        { method: "DELETE" }
      )
      if (!deleteResp.ok) {
        throw new Error("Error deleting relationship")
      }

      // 3) Actualizar el proyecto
      // Primero buscamos sus datos
      const projectResp = await fetch(`${API_URL}/projects/${projectId}`)
      if (!projectResp.ok) {
        throw new Error("Error fetching project data")
      }
      const projectData = await projectResp.json()

      // Luego le restamos 1 al teamSize
      const newTeamSize = Math.max(0, projectData.teamSize - 1)

      const updateResp = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectData,
          teamSize: newTeamSize,
        }),
      })
      if (!updateResp.ok) {
        throw new Error("Error updating project team size")
      }

      return true
    } catch (err) {
      printError("Error leaving the project:", err)
      setError("Could not leave the project")
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    leaveProject,
    loading,
    error,
  }
}
