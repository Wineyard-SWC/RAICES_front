"use client"

import { useState } from "react"

import Navbar from "@/components/NavBar"
import SprintDetailsPage from "./components/sprintdetails/sprintdetails.view"
import DashboardMainPage from "./components/dashboard/dashboard.view"

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "sprint">("dashboard")


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