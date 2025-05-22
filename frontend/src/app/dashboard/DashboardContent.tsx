"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/NavBar"
import DashboardMainPage from "./components/dashboard/dashboard.view"
import ProductBacklogPage from "./components/productbacklog/productbacklog.view"
import CalendarPageView from "./components/sprintcalendar/sprintcalendar.view"
import { useRouter } from "next/navigation"

export default function DashboardContent() {
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<"dashboard" | "backlog" | "calendar">("dashboard")
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    } else {
      setLoading(false)
    }

    // Escuchar eventos para cambiar de vista
    const handleChangeView = (e: CustomEvent) => {
      const view = e.detail.view
      if (view === "dashboard" || view === "backlog" || view === "calendar") {
        setActiveView(view)
      }
    }

    window.addEventListener("changeView" as any, handleChangeView)
    return () => {
      window.removeEventListener("changeView" as any, handleChangeView)
    }
  }, [router])

  const handleBackToDashboard = () => {
    setActiveView("dashboard")
  }

  if (loading) {
    return null
  }

  return (
    <>
      <Navbar projectSelected={true} />
      
      {activeView === "dashboard" && <DashboardMainPage />}
      {activeView === "backlog" && <ProductBacklogPage onBack={handleBackToDashboard} />}
      {activeView === "calendar" && <CalendarPageView onBack={handleBackToDashboard} />}
    </>
  )
}