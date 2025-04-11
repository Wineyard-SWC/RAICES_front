"use client"

import { useEffect, useState } from "react"
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
}

const Navbar = ({ projectSelected = false }: NavbarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

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

  // Función para manejar el clic en una pestaña
  const handleTabClick = (tab: TabType) => {
    // Si no hay proyecto seleccionado, solo permitimos navegar a "Projects"
    if (!projectSelected && tab !== "Projects") {
      return
    }

    // Si es la pestaña "Generate", solo mostramos el menú desplegable
    if (tab === "Generate") {
      setGenerateOpen(!generateOpen)
      return
    }

    // Para las demás pestañas, navegamos a la ruta correspondiente
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

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b border-[#ebe5eb] bg-white">
      {/* Logo */}
      <div className="flex-shrink-0 h-[60px] flex items-center justify-center">
        <Link href="/" className="mr-8 flex items-center justify-center">
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

            return (
              <div key={tab} className="relative">
                <button
                  className={getTabClasses(tab)}
                  onClick={() => handleTabClick(tab)}
                  disabled={!projectSelected && tab !== "Projects"}
                >
                  {tab}
                  {isGenerate && <ChevronDown className="ml-2 h-4 w-4" />}
                </button>

                {isGenerate && generateOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setGenerateOpen(false)
                          router.push(`/generate/report?projectId=${localStorage.getItem("currentProjectId")}`)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                        disabled={!projectSelected}
                      >
                        Generate Report
                      </button>
                      <button
                        onClick={() => {
                          setGenerateOpen(false)
                          router.push(`/generate/timeline?projectId=${localStorage.getItem("currentProjectId")}`)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                        disabled={!projectSelected}
                      >
                        Generate Timeline
                      </button>
                    </div>
                  </div>
                )}
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
          <button className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#ebe5eb] overflow-hidden">
              <img src="/placeholder.svg?height=32&width=32" alt="User avatar" className="h-full w-full object-cover" />
            </div>
            <ChevronDown className="ml-1 h-4 w-4 text-[#4a2b4a]" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
