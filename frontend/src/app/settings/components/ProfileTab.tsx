"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Mail, Save, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { useAvatar } from "@/contexts/AvatarContext"
import { useUser } from "@/contexts/usercontext"
import { useUpdateProfile } from "@/hooks/useUpdateProfile"
import useToast from "@/hooks/useToast"  
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/ui/input"
import SettingsAvatar from "./avatar/SettingsAvatar"
import { Label } from "./ui/label"
import Toast from "@/components/toast"  
import { print } from "@/utils/debugLogger"

export default function ProfileTab() {
  // Contextos
  const { avatarUrl, gender, fetchAvatar, isLoading: isAvatarLoading } = useAvatar()
  const { userData, refreshUserData, userId } = useUser()
  const { updateProfile, validatePassword, isPasswordValid, isLoading, error, setError } = useUpdateProfile()
  
  // 🔥 FIX: Agregar toast local
  const { toast, showToast, hideToast } = useToast()

  // Estados simplificados
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Estados para formularios
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: ""
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Estados para mostrar/ocultar contraseñas
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Estados de validación
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // 🔥 FIX: Estado para capturar errores de manera síncrona
  const [lastError, setLastError] = useState<string | null>(null)
  
  // 🔥 FIX: Capturar cambios en error inmediatamente
  useEffect(() => {
    if (error) {
      setLastError(error)
      print('🔍 [DEBUG] Captured error:', error)
    }
  }, [error])

  // 🔥 FIX: Limpiar errores cuando el usuario empieza a escribir
  useEffect(() => {
    if (profileError) {
      setProfileError(null)
    }
  }, [profileForm.name])

  useEffect(() => {
    if (passwordError) {
      setPasswordError(null)
    }
  }, [passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword])

  // Cargar avatar si no está disponible
  useEffect(() => {
    if (userId && (!avatarUrl || avatarUrl === '')) {
      print("Avatar no encontrado en contexto, cargando para usuario:", userId);
      fetchAvatar(userId).catch(err => {
        console.error("Error cargando avatar:", err);
      });
    }
  }, [userId, avatarUrl, fetchAvatar]);

  // Actualizar formulario cuando los datos del usuario cambian
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        email: userData.email || ""
      })
    }
  }, [userData])

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (passwordForm.newPassword) {
      const requirements = validatePassword(passwordForm.newPassword)
      const errors: string[] = []
      
      if (!requirements.minLength) errors.push("Minimum 8 characters")
      if (!requirements.hasUppercase) errors.push("At least one uppercase letter")
      if (!requirements.hasNumber) errors.push("At least one number")
      if (!requirements.hasSpecialChar) errors.push("At least one special character")
      
      setPasswordErrors(errors)
    } else {
      setPasswordErrors([])
    }
  }, [passwordForm.newPassword])

  // Manejar cambios del formulario de perfil
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    // 🔥 FIX: Solo permitir cambios en el nombre
    if (id === 'name') {
      setProfileForm((prev) => ({
        ...prev,
        [id]: value
      }))
    }
  }

  // Manejar cambios del formulario de contraseña
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  // 🔥 FIX: Guardar cambios de perfil con toast local
  const handleSaveProfile = async () => {
    setProfileError(null)
    setError(null)
    
    // Validar que haya cambios solo en el nombre
    const hasNameChange = profileForm.name !== (userData?.name || "")
    
    if (!hasNameChange) {
      setProfileError("No changes detected")
      return
    }

    // Validar que el nombre no esté vacío
    if (!profileForm.name.trim()) {
      setProfileError("Name cannot be empty")
      return
    }

    const result = await updateProfile({
      name: profileForm.name.trim()
    })

    if (!result.success) {
      if (result.errorMessage) {
        setProfileError(result.errorMessage)
      } else {
        setProfileError("Failed to update name. Please try again.")
      }
      setError(null)
    } else {
      // 🔥 FIX: Esta línea es necesaria para usar showToast
      showToast("Name updated successfully!", "success")
      print("✅ Name updated successfully")
    }
  }

  // Guardar cambios de contraseña simplificado
  const handleSavePassword = async () => {
    print('🔍 [DEBUG] Starting handleSavePassword');
    setPasswordError(null);
    setLastError(null);

    // Validaciones
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (!isPasswordValid(passwordForm.newPassword)) {
      setPasswordError("New password does not meet security requirements");
      return;
    }

    print('🔍 [DEBUG] Calling updateProfile...');
    
    const result = await updateProfile({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    
    print('🔍 [DEBUG] updateProfile direct result:', result);

    if (!result.success) {
      // 🔥 FIX: Usar el error directo del resultado
      const errorMessage = result.errorMessage || "Failed to update password. Please try again.";
      print('🔍 [DEBUG] Error from result:', errorMessage);
      
      if (errorMessage.includes('password is incorrect') || 
          errorMessage.includes('invalid-credential') || 
          errorMessage.includes('wrong-password')) {
        setPasswordError(errorMessage);
        print('🔍 [DEBUG] Set passwordError to:', errorMessage);
      } else {
        showToast(errorMessage, "error");
        print('🔍 [DEBUG] Showed toast with error:', errorMessage);
      }
      
      setError(null);
      setLastError(null);
    } else {
      // Éxito
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      showToast("Password updated successfully!", "success");
      print("✅ Password updated successfully")
      setError(null);
      setLastError(null);
    }
  }

  // Toggle visibilidad de contraseñas
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // 🔥 DEBUG: Mejorar el monitoring de errores
  useEffect(() => {
    print('🔍 [DEBUG] Error state changed:', { 
      globalError: error, 
      profileError, 
      passwordError,
      timestamp: new Date().toISOString()
    })
  }, [error, profileError, passwordError])

  useEffect(() => {
    print('🔍 [DEBUG] isLoading state changed:', isLoading)
  }, [isLoading])

  return (
    <>
      {/* 🔥 FIX: Agregar Toast al render */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Your profile image in the project</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-4 h-[200px] w-[200px] rounded-full overflow-hidden bg-[#4891E0] border-[4px] border-[#C7A0B8]">
              {isAvatarLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                </div>
              ) : avatarUrl ? (
                <SettingsAvatar 
                  avatarUrl={avatarUrl} 
                  gender={gender === 'female' ? 'feminine' : 'masculine'}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="h-20 w-20 text-white opacity-50" />
                  {userId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="absolute bottom-2 bg-white/20 text-white hover:bg-white/30"
                      onClick={() => fetchAvatar(userId)}
                    >
                      Refresh
                    </Button>
                  )}
                </div>
              )}
            </div>
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
            {/* Error específico para perfil */}
            {profileError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" />
                {profileError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={handleProfileInputChange}
                  className="pl-10"
                  placeholder="Enter your name"
                />
              </div>
            </div>
            
            {/* 🔥 FIX: Email solo lectura con estilo deshabilitado */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-500">Email (Read-only)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  className="pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Email address"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
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
            {/* Error específico para contraseña */}
            {passwordError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="pl-10 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    className="pl-10 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="pl-10 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Password Requirements */}
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Security requirements:</p>
                <ul className="mt-1 space-y-1">
                  {passwordErrors.length > 0 ? (
                    passwordErrors.map((error, index) => (
                      <li key={index} className="flex items-center gap-1 text-red-600">
                        <span className="text-xs">❌</span> {error}
                      </li>
                    ))
                  ) : passwordForm.newPassword ? (
                    <li className="flex items-center gap-1 text-green-600">
                      <span className="text-xs">✅</span> All requirements met
                    </li>
                  ) : (
                    <>
                      <li>• Minimum 8 characters</li>
                      <li>• At least one uppercase letter</li>
                      <li>• At least one number</li>
                      <li>• At least one special character</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
              onClick={handleSavePassword}
              disabled={isLoading || passwordErrors.length > 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Update Password
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}