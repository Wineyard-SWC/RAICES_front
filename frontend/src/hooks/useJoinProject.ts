"use client"

import { useState } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useJoinProject = (userId: string | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const joinProject = async (projectId: string) => {
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
      // 1. Create the user-project relationship
      const relationResponse = await fetch(`${API_URL}/project_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userRef: userId,
          projectRef: projectId,
          role: "Developer",
          joinedAt: new Date().toISOString(),
        }),
      })
      
      if (!relationResponse.ok) {
        throw new Error("Error joining project")
      }


      // 2. Get the current project data
      const projectResponse = await fetch(`${API_URL}/projects/${projectId}`)

      if (!projectResponse.ok) {
        throw new Error("Error fetching project data")
      }

      const projectData = await projectResponse.json()

      // 3. Update the project's teamSize
      const updateResponse = await fetch(`${API_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...projectData,
          teamSize: projectData.teamSize + 1,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Error updating project team size")
      }

      return true
    } catch (err) {
      console.error("Error joining project:", err)
      setError("Could not join the project")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { joinProject, loading, error }
}
