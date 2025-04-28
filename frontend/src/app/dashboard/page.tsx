"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import Navbar from "@/components/NavBar"
import SprintDetailsPage from "./components/sprintdetails/sprintdetails.view"
import DashboardMainPage from "./components/dashboard/dashboard.view"

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "sprint">("dashboard")
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

  if (loading) {
    return null 
  }

  return (
    <>
      <Navbar projectSelected={true} />
      <main className="min-h-screen py-6">
        <div className="container mx-auto px-4">
          
          {/*---------------------------------------DashboardView-----------------------------------------*/}
          {activeView === "dashboard" && (
            <DashboardMainPage onNavigateSprintDetails={() => setActiveView("sprint")} />
          )}
          {/*---------------------------------------DashboardView-----------------------------------------*/}

          {/*---------------------------------------SprintDetailsView-------------------------------------*/}
          {activeView === "sprint" && (
            <SprintDetailsPage onBack={() => setActiveView("dashboard")} />
          )}
          {/*---------------------------------------SprintDetailsView-------------------------------------*/}
          
          {/*---------------------------------------SprintPlanningView-------------------------------------*/}
        
          {/*---------------------------------------SprintPlanningView-------------------------------------*/}
          
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          
          {/*---------------------------------------SprintCalendarView-------------------------------------*/}
          
          {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          
          {/*---------------------------------------ProductBacklogView-------------------------------------*/}
          
          {/*---------------------------------------DetailTaskAssignmentView-------------------------------*/}
          
          {/*---------------------------------------DetailTaskAssignmentView-------------------------------*/}
          
        </div>
      </main>
    </>
  )
}