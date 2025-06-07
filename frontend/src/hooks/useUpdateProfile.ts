"use client"

import { useState } from 'react'
import { 
  updatePassword, 
  updateProfile as updateFirebaseProfile, 
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { auth } from '@/utils/firebaseConfig'
import { useUser } from '@/contexts/usercontext'
import { print } from '@/utils/debugLogger'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface UpdateProfileData {
  name?: string
  currentPassword?: string
  newPassword?: string
}

interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

// 🔥 FIX: Actualizar el tipo para incluir el mensaje de error
interface UpdateProfileResult {
  success: boolean;
  errorMessage?: string;
}

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refreshUserData, userId } = useUser()

  // Validar requisitos de contraseña
  const validatePassword = (password: string): PasswordRequirements => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  }

  // Verificar si la contraseña cumple todos los requisitos
  const isPasswordValid = (password: string): boolean => {
    const requirements = validatePassword(password)
    return Object.values(requirements).every(req => req)
  }

  // Re-autenticar usuario antes de cambios sensibles
  const reauthenticateUser = async (currentPassword: string): Promise<{success: boolean, errorMessage?: string}> => {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        return {success: false, errorMessage: 'User not authenticated'}
      }

      print('🔍 [DEBUG] Attempting re-authentication for:', user.email)
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      print('✅ [DEBUG] Re-authentication successful')
      return {success: true}
    } catch (error: any) {
      console.error('❌ [DEBUG] Re-authentication failed:', error)
      
      let errorMessage: string
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Current password is incorrect. Please check your password and try again.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please wait a few minutes before trying again.'
      } else if (error.code === 'auth/user-mismatch') {
        errorMessage = 'Authentication error occurred. Please log out and log back in.'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User account not found. Please contact support.'
      } else {
        errorMessage = 'Unable to verify password. Please check your connection and try again.'
      }
      
      setError(errorMessage) // Para mantener compatibilidad
      return {success: false, errorMessage}
    }
  }

  // Actualizar contraseña
  const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<{success: boolean, errorMessage?: string}> => {
    try {
      const user = auth.currentUser
      if (!user) return {success: false, errorMessage: 'User not authenticated'}

      // 1. Validar nueva contraseña
      if (!isPasswordValid(newPassword)) {
        const errorMessage = 'New password does not meet security requirements'
        setError(errorMessage)
        return {success: false, errorMessage}
      }

      // 2. Re-autenticar usuario
      const authResult = await reauthenticateUser(currentPassword)
      if (!authResult.success) {
        return authResult // Propaga el error
      }

      // 3. Actualizar contraseña en Firebase Auth
      await updatePassword(user, newPassword)
      print('Password updated in Firebase Auth')

      return {success: true}
    } catch (error: any) {
      console.error('Error updating password:', error)
      
      let errorMessage: string
      if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak'
      } else {
        errorMessage = error.message || 'Failed to update password'
      }
      
      setError(errorMessage)
      return {success: false, errorMessage}
    }
  }

  // Actualizar nombre en Firebase Auth y nuestra base de datos
  const updateUserName = async (newName: string): Promise<UpdateProfileResult> => {
    print('🔍 [DEBUG] Starting updateUserName with:', {
      newName,
      userId,
      API_URL,
      userEmail: auth.currentUser?.email
    })
    
    try {
      const user = auth.currentUser
      if (!user) return {success: false, errorMessage: 'User not authenticated'}

      // 1. Actualizar en Firebase Auth
      await updateFirebaseProfile(user, { displayName: newName }) 
      print('Name updated in Firebase Auth')

      // 2. Actualizar en nuestra base de datos
      const token = localStorage.getItem('authToken')
      if (!token) return {success: false, errorMessage: 'No auth token found'}

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newName,
          email: user.email, // Mantener email actual
          role: 'user' // Mantener rol por defecto
        })
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch (e) {
          console.error('Error parsing response:', e)
        }
        
        return {success: false, errorMessage}
      }

      const result = await response.json()
      print('Name updated in database:', result)
      
      return {success: true}
    } catch (error: any) {
      console.error('Error updating name:', error)
      setError(error.message || 'Failed to update name')
      return {success: false, errorMessage: error.message || 'Failed to update name'}
    }
  }

  // 🔥 FIX: Función principal que devuelve el error directamente
  const updateUserProfile = async (data: UpdateProfileData): Promise<UpdateProfileResult> => {
    setIsLoading(true)
    setError(null)
    
    try {
      let success = true
      let errorMessage: string | undefined = undefined

      // Actualizar nombre si se proporciona
      if (data.name && data.name.trim()) {
        const result = await updateUserName(data.name.trim())
        if (!result.success) {
          success = false
          errorMessage = result.errorMessage
        }
      }

      // Actualizar contraseña si se proporciona
      if (data.newPassword && data.currentPassword) {
        const result = await updateUserPassword(data.currentPassword, data.newPassword)
        if (!result.success) {
          success = false
          errorMessage = result.errorMessage
        }
      }

      // Refrescar datos del usuario si hubo éxito
      if (success) {
        await refreshUserData()
      } else if (errorMessage) {
        setError(errorMessage) // Para mantener compatibilidad con código existente
      }

      return { success, errorMessage }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const message = error.message || 'An unexpected error occurred'
      setError(message)
      return { success: false, errorMessage: message }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateProfile: updateUserProfile, 
    validatePassword,
    isPasswordValid,
    isLoading,
    error,
    setError
  }
}