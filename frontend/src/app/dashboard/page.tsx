"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/NavBar"
import SprintDetailsPage from "./components/sprintdetails/sprintdetails.view"
import DashboardMainPage from "./components/dashboard/dashboard.view"
import ProductBacklogPage from "./components/productbacklog/productbacklog.view"
import CalendarPageView from "./components/sprintcalendar/sprintcalendar.view"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "details" | "planning" | "calendar">("dashboard")
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    } else {
      setLoading(false) 
    }
  }, [router])

  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setProjectId(storedProjectId);
    }
  }, []);

  if (loading) {
    return null 
  }
  
  return (
    <>
      <Navbar projectSelected={true} />
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          {/*---------------------------------------DashboardView-----------------------------------------*/}
          {activeView === "dashboard" && (
            <DashboardMainPage 
            onNavigateSprintDetails={() => setActiveView("details")}
            onNavigateCalendar={() => setActiveView("calendar")} 
            onNavigateProductBacklog={() => setActiveView("planning")}
            />
          )}
          {/*---------------------------------------DashboardView-----------------------------------------*/}

          {/*---------------------------------------SprintDetailsView-------------------------------------*/}
          {activeView === "details" && (
            <SprintDetailsPage onBack={() => setActiveView("dashboard")} />
          )}
          {/*---------------------------------------SprintDetailsView-------------------------------------*/}
          
          {/*---------------------------------------SprintPlanningView-------------------------------------*/}
        
          {/*---------------------------------------SprintPlanningView-------------------------------------*/}
          
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          {activeView === "calendar" && (
            <CalendarPageView onBack={() => setActiveView("dashboard")}/>
          )}
          {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          {/* Show ProductBacklogView when "backlog" is active */}
          {activeView === "planning" && projectId && (
            <ProductBacklogPage onBack={() => setActiveView("dashboard")} projectId={projectId} />
          )}
          {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          
          {/*---------------------------------------DetailTaskAssignmentView-------------------------------*/}
          
          {/*---------------------------------------DetailTaskAssignmentView-------------------------------*/}
          
        </div>
      </main>
    </>
  )
}