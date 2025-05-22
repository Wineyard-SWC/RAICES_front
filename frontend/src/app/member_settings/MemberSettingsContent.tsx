"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/NavBar"
import MembersTab from "./components/MembersTab"
import { useRouter, useSearchParams } from "next/navigation"

export default function MemberSettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Verificar si hay un proyecto seleccionado
  useEffect(() => {
    const currentProjectId = localStorage.getItem("currentProjectId")
    if (!currentProjectId) {
      // Si no hay proyecto seleccionado, redirigir a la página de proyectos
      router.push("/projects")
    }
  }, [router])
  
  // Función para manejar el botón de regreso
  const handleGoBack = () => {
    router.back() // Esto devuelve a la página anterior del historial
  }
  
  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected={true} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Member Settings</h1>
            <p className="mt-2 text-[#694969]">Manage project members and their roles</p>
          </div>
          {/* Reemplazar el Link con un Button que use router.back() */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleGoBack}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#4a2b4a]" />
            <h2 className="text-2xl font-semibold text-[#4a2b4a]">Project Members</h2>
          </div>
          
          <MembersTab />
        </div>
      </div>
    </div>
  )
}