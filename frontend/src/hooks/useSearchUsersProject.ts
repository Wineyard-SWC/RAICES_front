"use client"

import { printError } from "@/utils/debugLogger"
import { useState, useEffect, useRef, useCallback } from "react"

export interface User {
  id: string
  uid: string
  name: string
  email: string
  photoURL: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useSearchUsersProject = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastSearchRef = useRef<string>("")
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función de búsqueda genérica
  const searchUsers = useCallback((searchTerm: string, projectId?: string) => {
    lastSearchRef.current = searchTerm

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!searchTerm || searchTerm.length < 2) {
      setUsers([])
      setLoading(false)
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (searchTerm !== lastSearchRef.current) return

      setLoading(true)
      setError(null)

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        let url: string
        if (projectId) {
          url = `${API_URL}/users/projects/${projectId}/users/search?search=${encodeURIComponent(searchTerm)}`
        } else {
          url = `${API_URL}/users/users/search?search=${encodeURIComponent(searchTerm)}`
        }

        const response = await fetch(url, { signal })

        if (signal.aborted) return

        if (!response.ok) {
          throw new Error("Error al buscar usuarios")
        }

        const data: User[] = await response.json()

        if (searchTerm === lastSearchRef.current) {
          setUsers(data)
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          printError("Error al buscar usuarios:", err)
          setError("No se pudieron cargar los usuarios")
          setUsers([])
        }
      } finally {
        if (searchTerm === lastSearchRef.current) {
          setLoading(false)
        }
      }
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return { users, loading, error, searchUsers }
}