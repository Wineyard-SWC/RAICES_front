"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Mail, Save, Lock, AlertCircle, Edit } from "lucide-react"
import { useAvatar } from "@/contexts/AvatarContext"
import { useUser } from "@/contexts/usercontext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/ui/input"
import SettingsAvatar from "./avatar/SettingsAvatar"
import { Label } from "./ui/label"

export default function ProfileTab() {
  // Usar datos del contexto
  const { avatarUrl, gender } = useAvatar()
  const { userData, refreshUserData } = useUser()
  
  // Estado local para edición
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: ""
  })

  // Actualizar formulario cuando los datos del usuario cambian
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        email: userData.email || ""
      })
    }
  }, [userData])

  // Manejar cambios del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  // Manejar guardar cambios
  const handleSaveProfile = async () => {
    console.log("Guardando cambios del perfil:", profileForm)
    await refreshUserData()
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Your profile image in the project</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative mb-4 h-[200px] w-[200px] rounded-full overflow-hidden bg-[#4891E0] border-[4px] border-[#C7A0B8]">
            {avatarUrl ? (
              <SettingsAvatar 
                avatarUrl={avatarUrl} 
                gender={gender === 'female' ? 'feminine' : 'masculine'}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User className="h-20 w-20 text-white opacity-50" />
              </div>
            )}
          </div>
          {/* Botón principal de customización */}
          <Link 
            href={`/avatar_editor${avatarUrl ? `?avatarUrl=${encodeURIComponent(avatarUrl)}` : ''}`} 
            passHref
          >
            <Button className="w-full bg-[#4a2b4a] text-white hover:bg-[#694969]">
              {avatarUrl ? "Edit Avatar" : "Create Avatar"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="name"
                value={profileForm.name}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
            onClick={handleSaveProfile}
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Password Change */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input id="current-password" type="password" className="pl-10" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input id="new-password" type="password" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input id="confirm-password" type="password" className="pl-10" />
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Security requirements:</p>
              <ul className="mt-1 list-inside list-disc">
                <li>Minimum 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
            <Lock className="mr-2 h-4 w-4" /> Update Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}