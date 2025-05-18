"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Bell, ChevronDown, Settings, LogOut, FolderOpen } from "lucide-react"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useUser } from "@/contexts/usercontext"
import { useProjects } from "@/hooks/useProjects"

type NavbarProps = {
  projectSelected: boolean
  onProjectSelect?: () => void
}

// Definimos las pestañas como constantes para evitar errores de tipeo
const TABS = ["Dashboard", "My Sprints", "Roadmap", "Team", "Generate"] as const
type TabType = (typeof TABS)[number]

// Mapa de rutas a pestañas para determinar la pestaña activa basada en la ruta
const PATH_TO_TAB: Record<string, TabType> = {
  "/dashboard": "Dashboard",
  "/sprints": "My Sprints",
  "/roadmap": "Roadmap",
  "/team": "Team",
  "/generate": "Generate",
  "/gen_requirements": "Generate",
  "/gen_epics": "Generate",
  "/gen_user_stories": "Generate",
  "/gen_tasks": "Generate",
}

const Navbar = ({ projectSelected = false }: NavbarProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const projectDropdownRef = useRef<HTMLDivElement>(null)

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("My Sprints")
  const [generateOpen, setGenerateOpen] = useState(false)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<string>("Seleccionar proyecto")

  const { userId } = useUser();
  const { projects, loading } = useProjects(userId);   // 🔄 misma query que en ProjectsPage
  const recentProjects = projects.slice(0, 3);

  // Efecto para sincronizar el estado activo con la ruta actual
  useEffect(() => {
    // Primero intentamos obtener la pestaña del parámetro de consulta
    const tabFromQuery = searchParams.get("tab") as TabType | null

    if (tabFromQuery && TABS.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery)
    } else {
      // Si no hay parámetro de consulta, determinamos la pestaña basada en la ruta
      const tabFromPath = PATH_TO_TAB[pathname] || "My Sprints"
      setActiveTab(tabFromPath)
    }

    // Verificamos si hay un proyecto seleccionado en localStorage
    const hasSelectedProject = !!localStorage.getItem("currentProjectId")
    const projectName = localStorage.getItem("currentProjectName")

    if (projectName) {
      setCurrentProject(projectName)
    }

    // Si estamos en una ruta que requiere un proyecto seleccionado pero no hay ninguno,
    // redirigimos a la página de proyectos
    if (!hasSelectedProject && pathname !== "/projects" && pathname !== "/") {
      router.push("/projects")
    }
  }, [pathname, searchParams, router])

  // Efecto para cerrar los menús desplegables al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setGenerateOpen(false)
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false)
      }
      if (!event.target || !(event.target as HTMLElement).closest(".avatar-menu")) {
        setAvatarMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const storedId = localStorage.getItem("currentProjectId");
    if (!storedId) return;

    // Si ya tenemos proyectos cargados…
    const found = projects.find(p => p.id === storedId);
    if (found && found.title !== currentProject) {
      setCurrentProject(found.title);
    }
  }, [projects]);

  // Función para manejar el clic en una pestaña
  const handleTabClick = (tab: TabType) => {
    // Si no hay proyecto seleccionado, no permitimos navegar
    if (!projectSelected) {
      return
    }

    // Para las pestañas, navegamos a la ruta correspondiente
    const currentProjectId = localStorage.getItem("currentProjectId")

    switch (tab) {
      case "My Sprints":
        if (currentProjectId) {
          router.push(`/sprints?projectId=${currentProjectId}`)
        }
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
    const isDisabled = !projectSelected
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

  // Función para cambiar de proyecto
  const handleProjectChange = (projectId: string, projectName: string) => {
    localStorage.setItem("currentProjectId", projectId)
    localStorage.setItem("currentProjectName", projectName)
    setCurrentProject(projectName)
    setProjectMenuOpen(false)
    router.push(`/dashboard?projectId=${projectId}`)
  }

  return (
    <nav className="relative flex items-center justify-between px-4 py-2 border-b border-black bg-[#EBE5EB]/30">
      {/* Logo */}
      <div className="flex-shrink-0 h-[60px] flex items-center w-1/4">
        <Link href="/projects" className="mr-4 flex items-center">
          <div className="flex items-center">
            <Image
              src="/img/raicesinvertido.png"
              alt="Logo RAICES"
              width={110}
              height={40}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Selector de proyecto */}
        <div className="relative" ref={projectDropdownRef}>
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            disabled={!projectSelected}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
              projectSelected
                ? "bg-[#4a2b4a]/10 text-[#4a2b4a] hover:bg-[#4a2b4a]/20"
                : "bg-[#4a2b4a]/5 text-[#694969]/50 cursor-not-allowed"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="font-medium truncate max-w-[150px]">{currentProject}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {projectMenuOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg z-20 py-1">
              <div className="px-3 py-2 text-xs font-semibold text-[#4a2b4a]/70 border-b">Recent projects</div>
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectChange(project.id, project.title)}
                  className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                >
                  {project.title}
                </button>
              ))}
              <div className="border-t mt-1 pt-1">
                <button
                  onClick={() => {
                    setProjectMenuOpen(false)
                    router.push("/projects")
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] font-medium hover:bg-[#ebe5eb]"
                >
                  View all my projects
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
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
                        <button
                          onClick={() => {
                            setGenerateOpen(false)
                            router.push(`/gen_tasks?projectId=${localStorage.getItem("currentProjectId")}`)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                          disabled={!projectSelected}
                        >
                          Generate Tasks
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <div key={tab} className="relative">
                <button className={getTabClasses(tab)} onClick={() => handleTabClick(tab)} disabled={!projectSelected}>
                  {tab}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notificaciones y Avatar */}
      <div className="flex items-center space-x-4 flex-shrink-0 w-1/4 justify-end">
        <button className="relative">
          <Bell className="h-6 w-6 text-[#4a2b4a]" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative avatar-menu">
          <button className="flex items-center" onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
            <div className="h-8 w-8 rounded-full bg-[#ebe5eb] overflow-hidden">
              <img
                src="https://cdn-icons-png.flaticon.com/512/921/921071.png"
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <ChevronDown className="ml-1 h-4 w-4 text-[#4a2b4a]" />
          </button>

          {avatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    setAvatarMenuOpen(false)
                    router.push("/settings")
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setAvatarMenuOpen(false)
                    router.push("/projects")
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Change Project</span>
                </button>

                <div className="border-t my-1"></div>

                <button
                  onClick={() => {
                    localStorage.removeItem("userId")
                    localStorage.removeItem("currentProjectId")
                    localStorage.removeItem("currentProjectName")
                    router.push("/login")
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
