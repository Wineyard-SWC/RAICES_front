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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Referencia para almacenar el último término de búsqueda
  const lastSearchRef = useRef<string>("")
  // Referencia para el timeout de debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Referencia para el controlador de aborto
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función de búsqueda con debounce
  const searchUsers = useCallback((searchTerm: string) => {
    lastSearchRef.current = searchTerm

    // Cancelar timer si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Cancelar solicitud en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // No buscar si el término es muy corto
    if (!searchTerm || searchTerm.length < 3) {
      setUsers([])
      setLoading(false)
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (searchTerm !== lastSearchRef.current) return

      setLoading(true)
      setError(null)

      // Crear un nuevo AbortController para esta solicitud
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        // Usamos el endpoint /users/search para filtrar por nombre
        const response = await fetch(
          `${API_URL}/users/users/search?search=${encodeURIComponent(searchTerm)}`,
          { signal }
        )

        if (signal.aborted) return

        if (!response.ok) {
          throw new Error("Error al buscar usuarios")
        }

        const data: User[] = await response.json()

        if (searchTerm === lastSearchRef.current) {
          setUsers(data)
        }
      } catch (err) {
        // Solo establecer error si no es cancelación
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
    }, 500) // Debounce de 500ms
  }, [])

  // Limpiar recursos cuando el componente se desmonte
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

/*
"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface User {
  id: string
  uid: string
  name: string
  email: string
  photoURL: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Referencia para almacenar la última solicitud
  const lastSearchRef = useRef<string>("")
  // Referencia para el timeout de debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Referencia para el controlador de aborto
  const abortControllerRef = useRef<AbortController | null>(null)

  // Función de búsqueda con debounce mejorado
  const searchUsers = useCallback((searchTerm: string) => {
    // Guardar el término de búsqueda actual
    lastSearchRef.current = searchTerm

    // Si hay un timer de debounce activo, cancelarlo
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Si hay una solicitud en curso, cancelarla
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // No hacer nada si el término de búsqueda es muy corto
    if (!searchTerm || searchTerm.length < 2) {
      setUsers([])
      setLoading(false)
      return
    }

    // Configurar un nuevo debounce
    debounceTimerRef.current = setTimeout(async () => {
      // Verificar si el término de búsqueda sigue siendo el mismo
      if (searchTerm !== lastSearchRef.current) return

      setLoading(true)
      setError(null)

      // Crear un nuevo controlador de aborto para esta solicitud
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        // Aquí usamos la API para buscar usuarios por nombre
        const response = await fetch(`${API_URL}/users?search=${encodeURIComponent(searchTerm)}`, { signal })

        // Si se abortó la solicitud, no hacer nada
        if (signal.aborted) return

        if (!response.ok) {
          throw new Error("Error al buscar usuarios")
        }

        const data: User[] = await response.json()

        // Verificar nuevamente si el término de búsqueda sigue siendo el mismo
        if (searchTerm === lastSearchRef.current) {
          setUsers(data)
        }
      } catch (err) {
        // Solo establecer el error si no fue una cancelación
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Error al buscar usuarios:", err)
          setError("No se pudieron cargar los usuarios")
          setUsers([])
        }
      } finally {
        // Solo cambiar el estado de carga si el término sigue siendo el mismo
        if (searchTerm === lastSearchRef.current) {
          setLoading(false)
        }
      }
    }, 500) // Debounce de 500ms
  }, [])

  // Limpiar recursos cuando el componente se desmonte
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
*/