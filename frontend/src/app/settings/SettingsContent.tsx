"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import Navbar from "@/components/NavBar"
import ProfileTab from "./components/ProfileTab"
import RolesTab from "./components/RolesTab"

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [loading, setLoading] = useState(true)

  // Manejar parámetros de URL para la pestaña activa
  useEffect(() => {
    if (tabParam && (tabParam === "profile" || tabParam === "roles")) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Verificar autenticación de forma segura (solo en el cliente)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Settings</h1>
            <p className="mt-2 text-[#694969]">Manage your account settings and preferences</p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        <Tabs defaultValue={activeTab} className="space-y-6" onValueChange={(value) => {
          setActiveTab(value)
          router.push(`/settings?tab=${value}`)
        }}>
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}