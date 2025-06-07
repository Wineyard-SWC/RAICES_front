"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types/project"
import { printError } from "@/utils/debugLogger"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useGetProjectByCode = (invitationCode: string) => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!invitationCode) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_URL}/projects?invitationCode=${invitationCode}`)

        if (!response.ok) {
          throw new Error("Error fetching project")
        }

        const data = await response.json()

        // If we get an array, find the project with matching invitation code
        if (Array.isArray(data) && data.length > 0) {
          const foundProject = data.find((p) => p.invitationCode === invitationCode)
          if (foundProject) {
            setProject(foundProject)
          } else {
            setError("Invalid invitation code")
          }
        } else if (data && !Array.isArray(data)) {
          // If we get a single project object
          setProject(data)
        } else {
          setError("Invalid invitation code")
        }
      } catch (err) {
        printError("Error fetching project:", err)
        setError("Could not find project with this invitation code")
      } finally {
        setLoading(false)
      }
    }

    if (invitationCode && invitationCode.length > 0) {
      fetchProject()
    }
  }, [invitationCode])

  return { project, loading, error }
}
