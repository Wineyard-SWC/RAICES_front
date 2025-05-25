"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import Navbar from "@/components/NavBar"
import ProfileTab from "./ProfileTab"
import RolesTab from "./RolesTab"

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  }, [router])

  // Manejar el botón de regreso
  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected={false} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Button 
            variant="outline" 
            className="mr-4"
            onClick={handleGoBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-[#1e1e1e]">Settings</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RolesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}