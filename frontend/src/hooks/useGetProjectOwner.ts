"use client"

import { printError } from "@/utils/debugLogger"
import { useState, useEffect } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface ProjectOwner {
  id: string
  name: string
  email: string
  photoURL: string
  userRef: string
}

export const useGetProjectOwner = (projectId: string | null) => {
  const [owner, setOwner] = useState<ProjectOwner | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOwner = async () => {
      if (!projectId) return

      setLoading(true)
      setError(null)

      try {
        // Get all users associated with the project
        const response = await fetch(`${API_URL}/project_users/project/${projectId}`)

        if (!response.ok) {
          throw new Error("Error fetching project users")
        }

        const users = await response.json()

        // Find the owner (user with role "owner")
        const ownerUser = users.find((user: any) => 
          user.role.toLowerCase() === "owner"
        );        

        if (ownerUser) {
          setOwner({
            id: ownerUser.id,
            name: ownerUser.name,
            email: ownerUser.email,
            photoURL: ownerUser.photoURL || "",
            userRef: ownerUser.userRef
          })
        } else {
          setError("Could not find project owner")
        }
      } catch (err) {
        printError("Error fetching project owner:", err)
        setError("Could not fetch project owner information")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchOwner()
    }
  }, [projectId])

  return { owner, loading, error }
}
