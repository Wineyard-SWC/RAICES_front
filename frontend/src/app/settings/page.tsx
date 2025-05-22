"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Importar useRouter
import { ChevronLeft, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import Navbar from "@/components/NavBar"
import ProfileTab from "./components/ProfileTab"
import RolesTab from "./components/RolesTab"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()

  const handleGoBack = () => {
    router.back() // Esto devuelve a la página anterior del historial
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected={!!localStorage.getItem("currentProjectId")} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Settings</h1>
            <p className="mt-2 text-[#694969]">Manage your profile and project roles</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="text-[#4a2b4a]">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-[#4a2b4a]">
              <Shield className="mr-2 h-4 w-4" /> Roles
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
