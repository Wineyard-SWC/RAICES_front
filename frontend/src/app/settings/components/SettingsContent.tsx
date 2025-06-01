"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import Navbar from "@/components/NavBar"
import ProfileTab from "./ProfileTab"
import RolesTab from "./RolesTab"
import { useSession } from "next-auth/react"
import { print } from '@/utils/debugLogger'

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Verificar si el usuario está autenticado usando NextAuth
  useEffect(() => {
    // If session is still loading, don't do anything yet
    if (status === "loading") return

    // If no session (not authenticated), redirect to login
    if (!session) {
      print("No session found, redirecting to login")
      router.push("/login")
      return
    }
    
    // If we have a session, update userId in your context if needed
    if (session.user?.uid) {
      // If you still need userId in localStorage for backward compatibility
      // This can be removed once all components use session instead
      if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", session.user.uid)
      }
    }
    
    // User is authenticated, stop loading
    setLoading(false)
  }, [session, status, router])

  // Manejar el botón de regreso
  const handleGoBack = () => {
    router.back()
  }

  // Show loading state while checking session
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#ebe5eb]/30 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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