"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Bell, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

type NavbarProps = {
  projectSelected: boolean
  onProjectSelect?: () => void
}

// Definimos las pestañas como constantes para evitar errores de tipeo
const TABS = ["Dashboard", "Projects", "Roadmap", "Team", "Generate"] as const
type TabType = (typeof TABS)[number]

// Mapa de rutas a pestañas para determinar la pestaña activa basada en la ruta
const PATH_TO_TAB: Record<string, TabType> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/roadmap": "Roadmap",
  "/team": "Team",
  "/generate": "Generate",
  "/gen_requirements": "Generate",
  "/gen_epics": "Generate",
  "/gen_user_stories": "Generate",
}

const Navbar = ({ projectSelected = false }: NavbarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("Projects")
  const [generateOpen, setGenerateOpen] = useState(false)

  // Efecto para sincronizar el estado activo con la ruta actual
  useEffect(() => {
    // Primero intentamos obtener la pestaña del parámetro de consulta
    const tabFromQuery = searchParams.get("tab") as TabType | null

    if (tabFromQuery && TABS.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery)
    } else {
      // Si no hay parámetro de consulta, determinamos la pestaña basada en la ruta
      const tabFromPath = PATH_TO_TAB[pathname] || "Projects"
      setActiveTab(tabFromPath)
    }

    // Verificamos si hay un proyecto seleccionado en localStorage
    const hasSelectedProject = !!localStorage.getItem("currentProjectId")

    // Si estamos en una ruta que requiere un proyecto seleccionado pero no hay ninguno,
    // redirigimos a la página de proyectos
    if (!hasSelectedProject && pathname !== "/projects" && pathname !== "/") {
      router.push("/projects")
    }
  }, [pathname, searchParams, router])

  // Efecto para cerrar el menú desplegable al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setGenerateOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Función para manejar el clic en una pestaña
  const handleTabClick = (tab: TabType) => {
    // Si no hay proyecto seleccionado, solo permitimos navegar a "Projects"
    if (!projectSelected && tab !== "Projects") {
      return
    }

    // Para las pestañas, navegamos a la ruta correspondiente
    const currentProjectId = localStorage.getItem("currentProjectId")

    switch (tab) {
      case "Projects":
        router.push("/projects")
        break
      case "Dashboard":
        if (currentProjectId) {
          router.push(`/dashboard?projectId=${currentProjectId}`)
        }
        break
      case "Roadmap":
        if (currentProjectId) {
          router.push(`/roadmap?projectId=${currentProjectId}`)
        }
        break
      case "Team":
        if (currentProjectId) {
          router.push(`/team?projectId=${currentProjectId}`)
        }
        break
      case "Generate":
        if (currentProjectId) {
          router.push(`/generate?projectId=${currentProjectId}`)
        }
        break
    }

    // Actualizamos el estado activo
    setActiveTab(tab)
    // Cerramos el menú desplegable si está abierto
    setGenerateOpen(false)
  }

  // Función para determinar las clases de estilo de cada pestaña
  const getTabClasses = (tab: TabType) => {
    const isDisabled = !projectSelected && tab !== "Projects"
    // Generate siempre se muestra como activo si está habilitado
    const isActive = (tab === "Generate" && !isDisabled) || (activeTab === tab && !isDisabled)

    let classes = "flex items-center px-4 py-2 rounded-md transition-colors"

    if (isDisabled) {
      classes += " cursor-not-allowed text-[#694969]/50"
    } else if (isActive) {
      classes += " bg-[#4a2b4a] text-white"
    } else {
      classes += " text-[#694969] hover:bg-[#ebe5eb]"
    }

    return classes
  }

  // Función para manejar el clic en el botón de despliegue (Generate)
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGenerateOpen(!generateOpen)
  }

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b border-black bg-[#EBE5EB]/30">
      {/* Logo */}
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center">
        <Link href="/projects" className="mr-8 flex items-center justify-center">
          <div className="flex items-center justify-center">
            <Image
              src="/img/raicesinvertido.png"
              alt="Logo RAICES"
              width={110}
              height={40}
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex justify-center flex-grow">
        <div className="flex space-x-4">
          {TABS.map((tab) => {
            const isGenerate = tab === "Generate"

            if (isGenerate) {
              return (
                <div key={tab} className="relative inline-flex" ref={dropdownRef}>
                  {/* Botón principal (Generate) */}
                  <button
                    className={`${getTabClasses(tab)} rounded-r-none`}
                    onClick={() => handleTabClick(tab)}
                    disabled={!projectSelected}
                  >
                    {tab}
                  </button>

                  {/* Botón flecha desplegable */}
                  <button
                    className={`${getTabClasses(tab)} rounded-l-none px-2 border-l-0`}
                    onClick={handleDropdownToggle}
                    disabled={!projectSelected}
                    aria-label="Mostrar opciones de generación"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Menú desplegable */}
                  {generateOpen && (
                    <div className="absolute right-0 mt-10 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setGenerateOpen(false)
                            router.push(`/gen_requirements?projectId=${localStorage.getItem("currentProjectId")}`)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                          disabled={!projectSelected}
                        >
                          Generate Requirements
                        </button>
                        <button
                          onClick={() => {
                            setGenerateOpen(false)
                            router.push(`/gen_epics?projectId=${localStorage.getItem("currentProjectId")}`)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                          disabled={!projectSelected}
                        >
                          Generate Epics
                        </button>
                        <button
                          onClick={() => {
                            setGenerateOpen(false)
                            router.push(`/gen_user_stories?projectId=${localStorage.getItem("currentProjectId")}`)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                          disabled={!projectSelected}
                        >
                          Generate User Stories
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div key={tab} className="relative">
                <button
                  className={getTabClasses(tab)}
                  onClick={() => handleTabClick(tab)}
                  disabled={!projectSelected && tab !== "Projects"}
                >
                  {tab}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notificaciones y Avatar */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <button className="relative">
          <Bell className="h-6 w-6 text-[#4a2b4a]" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative">
          <button
            className="flex items-center"
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-[#ebe5eb] overflow-hidden">
              <img
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <ChevronDown className="ml-1 h-4 w-4 text-[#4a2b4a]" />
          </button>

          {avatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20">
              <button
                onClick={() => {
                  localStorage.removeItem("userId")
                  localStorage.removeItem("currentProjectId")
                  router.push("/login")
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
//
export default Navbar