"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types/project"
import SearchBar from "@/components/search_bar"
import { useProjects } from "@/hooks/useProjects"
import { useUser } from "@/contexts/usercontext"
import { useAvatar } from "@/contexts/AvatarContext" // Importar el contexto del avatar
import { useCreateProject } from "@/hooks/useCreateProject"
import ProjectCard from "./components/projectcard"
import CreateProjectModal from "./components/create_project_modal"
import JoinProjectModal from "./components/join_project_modal"
import Navbar from "@/components/NavBar"
import { useRouter } from "next/navigation"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { print } from "@/utils/debugLogger"

export default function ProjectsPage() {
  // Obtén el userId desde el contexto de usuario
  const { userId, setUserId } = useUser()
  const router = useRouter()
  
  // Obtén el avatar desde el contexto
  const { avatarUrl, fetchAvatar } = useAvatar()

  // Si no se tiene el userId, como fallback lo recuperamos del localStorage
  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        setUserId(storedUserId)
      }
    }
  }, [userId, setUserId])
  
  // Refrescar el contexto del avatar si no existe
  useEffect(() => {
    if (userId && !avatarUrl) {
      print("No avatar URL found, refreshing avatar context")
      fetchAvatar(userId)
    }
  }, [userId, avatarUrl, fetchAvatar])

  // Utiliza el hook para traer los proyectos del usuario
  const { projects: fetchedProjects, loading } = useProjects(userId)
  const { createProject, loading: creatingProject } = useCreateProject(userId)
  const {setCurrentProject} = useKanban()
  
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

  const handleCreateProject = async (projectData: any): Promise<string | null> => {
    try {
      print("[PAGE] Creating project with data:", projectData);
      const projectId = await createProject(projectData); // Devuelve el ID del proyecto
      if (projectId) {
        print("[PAGE] Project created with ID:", projectId);
        setProjects((prevProjects) => [
          ...prevProjects,
          { ...projectData, id: projectId },
        ]);
      } else {
        console.error("[PAGE] Failed to create project or get projectId.");
      }
      return projectId;
    } catch (error) {
      console.error("[PAGE] Error creating project:", error);
      return null;
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

        <div className="mt-6">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="cursor-pointer transition-transform hover:scale-[1.02]">
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-center max-w-md">
                <svg 
                  className="mx-auto h-20 w-20 text-[#C7A0B8] mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                  />
                </svg>
                <h3 className="text-2xl font-bold text-[#4A2B4A] mb-2">No projects found</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any projects yet. Create a new project or join an existing one to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#4A2B4A] text-white py-2 px-6 rounded-lg hover:bg-[#694969] transition-colors"
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="border border-[#4A2B4A] text-[#4A2B4A] py-2 px-6 rounded-lg hover:bg-[#F7F0F7] transition-colors"
                  >
                    Join Project
                  </button>
                </div>
              </div>
            </div>
          )}
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
