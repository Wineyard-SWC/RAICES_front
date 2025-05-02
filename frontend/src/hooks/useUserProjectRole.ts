"use client"

import { useState, useEffect } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useUserProjectRole = (userId: string | null, projectId: string) => {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!userId || !projectId) return

      setLoading(true)
      setError(null)

      try {
        const url = `${API_URL}/project_users/relation?user_id=${userId}&project_id=${projectId}`
        const response = await fetch(url)

        if (!response.ok) {
          // Si da 404 => no existe relación o user/project no hallados
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        // data.role es el rol guardado en Firestore
        setRole(data.role || null)
      } catch (err) {
        console.error("Error fetching user-project relation:", err)
        setError("Could not determine user role in project")
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [userId, projectId])

  return {
    role,
    isOwner: role === "owner",
    isMember: role === "member",
    loading,
    error,
  }
}
