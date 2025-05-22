"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/NavBar"
import DashboardMainPage from "./components/dashboard/dashboard.view"
import ProductBacklogPage from "./components/productbacklog/productbacklog.view"
import CalendarPageView from "./components/sprintcalendar/sprintcalendar.view"
import { useRouter } from "next/navigation"


export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "details" | "planning" | "calendar">("dashboard")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const currentProjectId = localStorage.getItem("currentProjectId")

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    } else {
      setLoading(false) 
    }
  }, [router])

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
    </>
  )
}