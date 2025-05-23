"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/NavBar"
import DashboardMainPage from "./dashboard/dashboard.view"
import ProductBacklogPage from "./productbacklog/productbacklog.view"
import CalendarPageView from "./sprintcalendar/sprintcalendar.view"
import { useRouter } from "next/navigation"
// Importar contextos necesarios
import { useUser } from "@/contexts/usercontext"
import { useUserPermissions } from "@/contexts/UserPermissions"
import { useAvatar } from "@/contexts/AvatarContext"

export default function DashboardContent() {
  const [activeView, setActiveView] = useState<"dashboard" | "details" | "planning" | "calendar">("dashboard")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Obtener información del usuario actual
  const { userId } = useUser()
  
  // Obtener contexto de avatar
  const { avatarUrl, fetchAvatar } = useAvatar()
  
  // Obtener contexto de permisos
  const { 
    loadUserPermissionsIfNeeded, 
    setCurrentProjectPermissions, 
    getCurrentProject
  } = useUserPermissions()
  
  // Estado para almacenar el ID del proyecto
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  
  // Cargar datos iniciales: verificar autenticación y obtener proyecto
  useEffect(() => {
    // Verificar autenticación
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/login")
      return
    }
    
    // Obtener ID del proyecto actual
    const projectId = localStorage.getItem("currentProjectId")
    setCurrentProjectId(projectId)
    
    setLoading(false)
  }, [userId, router])
  
  // Cargar avatar si no está disponible
  useEffect(() => {
    if (userId && !avatarUrl) {
      fetchAvatar(userId).catch(err => {
        console.error("Error cargando avatar en dashboard:", err)
      })
    }
  }, [userId, avatarUrl, fetchAvatar])
  
  // Actualizar el proyecto actual en el contexto de permisos
  useEffect(() => {
    if (currentProjectId) {
      // Verificar si es diferente del proyecto actual en el contexto
      const currentContextProject = getCurrentProject()
      if (currentContextProject !== currentProjectId) {
        console.log("Actualizando proyecto actual en contexto de permisos:", currentProjectId)
        setCurrentProjectPermissions(currentProjectId)
      }
      
      // Cargar permisos para este proyecto si el usuario está autenticado
      if (userId) {
        loadUserPermissionsIfNeeded(userId).catch(err => {
          console.error("Error cargando permisos en dashboard:", err)
        })
      }
    }
  }, [currentProjectId, userId, getCurrentProject, setCurrentProjectPermissions, loadUserPermissionsIfNeeded])

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected={true} />
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          {/*---------------------------------------DashboardView-----------------------------------------*/}
          {activeView === "dashboard" && (
            <DashboardMainPage 
              onNavigateSprintDetails={() => router.push(`/sprint_details?projectId=${currentProjectId}`)}
              onNavigateCalendar={() => setActiveView("calendar")} 
              onNavigateProductBacklog={() => setActiveView("planning")}
            />
          )}
          {/*---------------------------------------DashboardView-----------------------------------------*/}
                    
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          {activeView === "calendar" && (
            <CalendarPageView onBack={() => setActiveView("dashboard")}/>
          )}
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          
        </div>
          {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          {activeView === "planning" && (
            <ProductBacklogPage onBack={() => setActiveView("dashboard")} />
          )}
        {/*---------------------------------------ProductBacklogView-------------------------------------*/}
      </main>
    </div>
  )
}