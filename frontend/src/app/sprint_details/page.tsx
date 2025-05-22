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

export default function SprintDetails() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const projectId = localStorage.getItem("currentProjectId")

    if (!userId) {
      router.push("/login")
    } else {
      setCurrentProjectId(projectId)
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
          > {"<- Go back "}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
            <div className="lg:col-span-3 h-full">
              <Card className="h-full bg-white shadow-sm p-4">
                <SprintHealth />
              </Card>
            </div>

           <div className="lg:col-span-9 h-full">
            <Card className="h-full bg-white shadow-sm p-4">
              <SprintChartsSection />
            </Card>
          </div>
        </div>

        <SprintComparison />
      </main>
    </div>
  )
}
