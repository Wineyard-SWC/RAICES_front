'use client';

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/card"
import Navbar from "@/components/NavBar"
import SprintChartsSection from "./components/sprintchartssection";
import { SprintComparison } from "./components/SprintComparison"
import { SprintHealth } from "./components/SprintHealth";
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SprintDetailsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    // Acceder a localStorage de forma segura solo en el cliente
    const userId = localStorage.getItem("userId")
    const projectId = localStorage.getItem("currentProjectId")
    
    setCurrentProjectId(projectId)
    
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
    <div className="min-h-screen bg-[#f0ebf7]">
      <Navbar projectSelected={true} />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Sprint Details</h1>
          <p className="text-gray-600 mb-1">Track sprint progress and manage tasks</p>
          <button
            onClick={() => router.push(`/dashboard?projectId=${currentProjectId}`)}
            className="text-[#4A2B4A] text-sm font-medium hover:underline"
          >
            {"<- Go back "}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <h2 className="text-xl font-semibold mb-3">Current Sprint Progress</h2>
            <SprintChartsSection />
          </Card>
          <Card>
            <h2 className="text-xl font-semibold mb-3">Sprint Health</h2>
            <SprintHealth />
          </Card>
        </div>

        <div className="mb-6">
          <Card>
            <h2 className="text-xl font-semibold mb-3">Sprint Comparison</h2>
            <SprintComparison />
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-[#4A2B4A] hover:bg-[#5d3b5d]"
            onClick={() => router.push(`/sprint_planning?projectId=${currentProjectId}`)}
          >
            Plan Next Sprint
          </Button>
        </div>
      </main>
    </div>
  )
}