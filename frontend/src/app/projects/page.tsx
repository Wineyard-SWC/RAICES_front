"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types/project"
import SearchBar from "@/components/search_bar"
import { useProjects } from "@/hooks/useProjects"
import { useUser } from "@/contexts/usercontext"
import { useCreateProject } from "@/hooks/useCreateProject"
import ProjectCard from "./components/projectcard"
import CreateProjectModal from "./components/create_project_modal"
import JoinProjectModal from "./components/join_project_modal"
import Navbar from "@/components/NavBar"
import { useRouter } from "next/navigation"
import { useKanban } from "@/contexts/unifieddashboardcontext"

export default function ProjectsPage() {
  // Obtén el userId desde el contexto de usuario
  const { userId, setUserId } = useUser()

  // Si no se tiene el userId, como fallback lo recuperamos del localStorage
  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        setUserId(storedUserId)
      }
    }
  }, [userId, setUserId])

  // Utiliza el hook para traer los proyectos del usuario
  const { projects: fetchedProjects, loading } = useProjects(userId)
  const { createProject, loading: creatingProject } = useCreateProject(userId)
  const {setCurrentProject} = useKanban();
  // Estados para búsqueda y filtro
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  

  // Actualiza la lista filtrada cada vez que cambian los proyectos, la búsqueda o el filtro
  useEffect(() => {
    filterProjects(searchQuery, statusFilter, fetchedProjects)
  }, [fetchedProjects, searchQuery, statusFilter])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterProjects(query, statusFilter, fetchedProjects)
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    filterProjects(searchQuery, status, fetchedProjects)
  }

  const [load, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);


  const filterProjects = (query: string, status: string, projectsList: Project[]) => {
    let filtered = projectsList

    if (query) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (status !== "All Status") {
      filtered = filtered.filter((project) => project.status === status)
    }

    setProjects(filtered)
  }

  const handleProjectSelect = (projectId: string) => {
    if (selectedProject && selectedProject !== projectId) {
    }
  
    setSelectedProject(projectId)
    localStorage.setItem("currentProjectId", projectId)
    setCurrentProject(projectId)
  }

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await createProject(projectData)
      if (newProject) {
        // Actualizar la lista de proyectos (opcional, también se actualizará en el siguiente fetch)
        setProjects([...projects, newProject])
      }
    } catch (error) {
      console.error("Error al crear el proyecto:", error)
    }
  }

  // Muestra un indicador de carga mientras se obtienen los proyectos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading projects...</p>
      </div>
    )
  }
      //<NavBar projectSelected={!!selectedProject||} />

  if (load) {
    return null; 
  }
    
  return (
    <div className="min-h-screen bg-[#EBE5EB]/30">
      <Navbar projectSelected={!!selectedProject} />

      <main className="container mx-auto px-4 py-10">
        <div>
          <h1 className="text-4xl font-bold text-[#1e1e1e]">Projects</h1>
          <p className="text-[#694969] mt-2">Manage and track all of your ongoing projects</p>
        </div>

        <SearchBar
          onSearch={handleSearch}
          onFilterChange={handleStatusChange}
          onNewProject={() => setIsCreateModalOpen(true)}
          onJoinProject={() => setIsJoinModalOpen(true)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects.map((project) => (
            <div key={project.id} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <ProjectCard {...project} />
            </div>
          ))}
        </div>

        {/* Modal para crear proyecto */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateProject={handleCreateProject}
        />

        {/* Modal para unirse a un proyecto */}
        <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      </main>
    </div>
  )
}
