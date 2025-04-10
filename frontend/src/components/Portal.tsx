"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface PortalProps {
  children: React.ReactNode
}

export function Portal({ children }: PortalProps) {
  // Montamos un flag para asegurarnos de que esto se ejecute solo en el lado cliente
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  // Buscamos el 'modal-root' que creamos en layout.tsx
  const modalRoot = document.getElementById("modal-root")
  if (!modalRoot) return null

  // Inyectamos los children en el 'modal-root'
  return createPortal(children, modalRoot)
}
