"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Brain, Download, RefreshCw, AlertCircle, Heart, Activity, TrendingUp, Target, Zap } from "lucide-react"
import { Canvas } from '@react-three/fiber'
import dynamic from 'next/dynamic'

import { Button } from "@/components/ui/button"
import Navbar from "@/components/NavBar"
import { useBiometricData } from "@/hooks/useBiometricData"
import { Card, CardContent, CardHeader, CardTitle } from "../settings/components/ui/card"
import { Badge } from "../settings/components/ui/badge"
import { Progress } from "@/components/progress"
import { useAvatar } from "@/contexts/AvatarContext"

// 🔥 IMPORTAR LOS COMPONENTES EXISTENTES
import TaskPerformance from "./components/TaskPerformance"
import BiometricTrends from "./components/BiometricTrends"

// 🔥 IMPORTACIÓN DINÁMICA DEL AVATAR ANIMADO
const DynamicAnimatedAvatar = dynamic(
  () => import('../dashboard/components/dashboard/avatarConfig/avatarAnimationsDashboard').then((mod) => mod.AnimatedAvatar),
  { ssr: false }
)

// Hook for emotion utils in English
const useEmotionUtils = () => ({
  getEmotionEmoji: (emotion: string) => {
    const emojiMap: Record<string, string> = {
      Relaxed: "😌",
      Happy: "😁", 
      Euphoric: "🤯",
      Calm: "😌",
      Excited: "🤩",
      Sad: "😢",
      Stressed: "😰",
      Neutral: "😐",
      Angry: "😠",
      Surprised: "😲",
    }
    return emojiMap[emotion] || "😐"
  },
  getStressLevel: (stress: number) => {
    if (stress < 0.3) return { level: "Low", color: "text-green-600" }
    if (stress < 0.6) return { level: "Moderate", color: "text-yellow-600" }
    if (stress < 0.8) return { level: "High", color: "text-orange-600" }
    return { level: "Very High", color: "text-red-600" }
  },
  // 🔥 NUEVA FUNCIÓN PARA ENERGY LEVEL
  getEnergyLevel: (arousal: number) => {
    if (arousal < -0.5) return { level: "Very Low", color: "text-blue-600" }
    if (arousal < -0.2) return { level: "Low", color: "text-cyan-600" }
    if (arousal < 0.2) return { level: "Moderate", color: "text-yellow-600" }
    if (arousal < 0.5) return { level: "High", color: "text-orange-600" }
    return { level: "Very High", color: "text-red-600" }
  },
})

export default function ImprovedBiometricDashboard() {
  const { data: session } = useSession()
  const userIdFromSession = session?.user?.uid
  const userId = userIdFromSession || ""

  const { sessions, analytics, loading, error, refetch } = useBiometricData(userId)
  const { getEmotionEmoji, getStressLevel, getEnergyLevel } = useEmotionUtils()
  
  // 🔥 OBTENER AVATAR Y GÉNERO DESDE EL CONTEXTO
  const { avatarUrl, gender } = useAvatar()

  const [userName, setUserName] = useState("User")

  useEffect(() => {
    if (sessions.length > 0) {
      setUserName(sessions[0].user_name)
    }
  }, [sessions])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBE5EB]/30">
        <Navbar projectSelected={false} />
        <main className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#C7A0B8] border-t-[#4A2B4A] rounded-full animate-spin"></div>
            <span className="text-xl font-semibold text-[#4A2B4A]">Loading your dashboard...</span>
            <span className="text-sm text-[#694969]">Analyzing your biometric data</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#EBE5EB]/30">
        <Navbar projectSelected={false} />
        <main className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-2xl bg-white shadow-lg border-0"> {/* 🔥 HACER MÁS ANCHO Y MEJORAR SOMBRA */}
            <CardContent className="pt-8 pb-8 px-8"> {/* 🔥 MÁS PADDING */}
              <div className="flex flex-col items-center text-center">
                
                {/* 🔥 AVATAR CON EMOCIÓN TRISTE */}
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-b from-[#4A2B4A] to-[#694969] p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-purple-50 to-blue-50 overflow-hidden">
                      {avatarUrl ? (
                        <Canvas camera={{ position: [0, 0.2, 2.5], fov: 30 }}>
                          <ambientLight intensity={0.8} />
                          <directionalLight position={[1, 2, 1.5]} intensity={1.2} />
                          <Suspense fallback={
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-4xl">😢</div>
                            </div>
                          }>
                            <DynamicAnimatedAvatar
                              avatarUrl={avatarUrl}
                              gender={gender === 'female' ? 'feminine' : 'masculine'}
                              minDelay={5000}
                              maxDelay={10000}
                              idleTime={8000}
                              emotion="Sad"
                              expressionIntensity={0.9}
                            />
                          </Suspense>
                        </Canvas>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-5xl">😢</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🔥 TÍTULO MEJORADO */}
                <h2 className="text-2xl font-bold mb-3 text-[#4A2B4A]">
                  No Biometric Data Yet
                </h2>
                
                {/* 🔥 MENSAJE EXPLICATIVO MEJORADO */}
                <div className="space-y-4 mb-6 max-w-lg">
                  <p className="text-[#694969] text-lg leading-relaxed">
                    You haven't participated in any biometric verification sessions to collect wellness data yet.
                  </p>
                  
                  <div className="bg-[#EBE5EB]/30 rounded-lg p-4 text-left">
                    <h3 className="font-semibold text-[#4A2B4A] mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      How to start collecting data:
                    </h3>
                    <ul className="text-sm text-[#694969] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-[#4A2B4A] mt-0.5">1.</span>
                        <span>Create a new sprint in your project dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-[#4A2B4A] mt-0.5">2.</span>
                        <span>Enable biometric verification when setting up your sprint</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-[#4A2B4A] mt-0.5">3.</span>
                        <span>Complete tasks with biometric monitoring active</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium text-[#4A2B4A] mt-0.5">4.</span>
                        <span>Return here to view your wellness insights and trends</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm text-[#694969] italic">
                    Once you start participating in biometric sessions, you'll see detailed analytics about your stress levels, energy patterns, and emotional states.
                  </p>
                </div>

                {/* 🔥 BOTONES DE ACCIÓN MEJORADOS */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full bg-[#4A2B4A] hover:bg-[#694969] text-white">
                      <Target className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    onClick={refetch}
                    disabled={loading}
                    className="flex-1 border-[#C7A0B8] text-[#4A2B4A] hover:bg-[#F7F0F7]"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Check Again
                  </Button>
                </div>

                {/* 🔥 ESTADÍSTICAS PLACEHOLDER */}
                <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
                  <div className="text-center p-3 bg-[#EBE5EB]/20 rounded-lg">
                    <div className="text-lg font-bold text-[#4A2B4A]">0</div>
                    <div className="text-xs text-[#694969]">Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-[#EBE5EB]/20 rounded-lg">
                    <div className="text-lg font-bold text-[#4A2B4A]">--</div>
                    <div className="text-xs text-[#694969]">Avg Stress</div>
                  </div>
                  <div className="text-center p-3 bg-[#EBE5EB]/20 rounded-lg">
                    <div className="text-lg font-bold text-[#4A2B4A]">--</div>
                    <div className="text-xs text-[#694969]">Energy</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const stressInfo = getStressLevel(analytics.currentState.stress)
  const energyInfo = getEnergyLevel(analytics.currentState.arousal) // 🔥 NUEVA VARIABLE

  return (
    <div className="min-h-screen bg-[#EBE5EB]/30">
      <Navbar projectSelected={false} />

      <main className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1 text-[#1e1e1e]">Biometric Dashboard</h1>
          <p className="text-[#694969] mb-1">Personal wellness analytics for {userName}</p>
          <Link href="/dashboard" className="text-[#4A2B4A] text-sm font-medium hover:underline">
            ← Go back
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* 🔥 USER PROFILE CARD CON AVATAR ANIMADO */}
          <div className="lg:col-span-4">
            <Card className="h-full bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  {/* 🔥 AVATAR ANIMADO EN LUGAR DE IMAGEN ESTÁTICA */}
                  <div className="w-50 h-50 mx-auto rounded-full bg-gradient-to-b from-[#4A2B4A] to-[#694969] p-1 shadow-lg">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-purple-50 to-blue-50 overflow-hidden">
                      {avatarUrl ? (
                        <Canvas camera={{ position: [0, 0.2, 2.5], fov: 30 }}>
                          <ambientLight intensity={0.8} />
                          <directionalLight position={[1, 2, 1.5] } intensity={1.2} />
                          <Suspense fallback={null}>
                            <DynamicAnimatedAvatar
                              avatarUrl={avatarUrl || analytics.currentState.avatarUrl}
                              gender={gender === 'female' ? 'feminine' : 'masculine'}
                              minDelay={4000}
                              maxDelay={8000}
                              idleTime={6000}
                              emotion={analytics.mostCommonEmotion} // 🔥 EMOCIÓN ACTUAL
                              expressionIntensity={1.0} // 🔥 INTENSIDAD DE LA EXPRESIÓN
                            />
                          </Suspense>
                        </Canvas>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl">{getEmotionEmoji(analytics.currentState.emotion)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 🔥 BADGE CON MOST COMMON STATE */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#C7A0B8] text-[#4A2B4A] border-0 px-3 py-1">
                      <span className="mr-1">{getEmotionEmoji(analytics.mostCommonEmotion)}</span>
                      {analytics.mostCommonEmotion}
                    </Badge>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-[#4A2B4A] mb-2">Hello, {userName}!</h2>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-4">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#694969]">Completed Sessions</p>
                    <p className="text-2xl font-bold text-[#4A2B4A]">{analytics.totalSessions}</p>
                    <p className="text-xs text-[#694969] mt-1">Total recorded</p>
                  </div>
                  <div className="p-2 bg-[#EBE5EB]/30 rounded-full">
                    <Target className="h-6 w-6 text-[#4A2B4A]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#694969]">Average Stress</p>
                    <p className="text-2xl font-bold text-[#4A2B4A]">{Math.round(analytics.avgStress * 100)}%</p>
                    <p className="text-xs text-[#694969] mt-1">Recent sessions</p>
                  </div>
                  <div className="p-2 bg-[#EBE5EB]/30 rounded-full">
                    <Brain className="h-6 w-6 text-[#4A2B4A]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 🔥 REEMPLAZAR MOST COMMON STATE CON AVERAGE ENERGY LEVEL */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#694969]">Average Energy Level</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-2xl font-bold ${energyInfo.color}`}>
                        {analytics.avgArousal.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-[#694969] mt-1">{energyInfo.level}</p>
                  </div>
                  <div className="p-2 bg-[#EBE5EB]/30 rounded-full">
                    <Activity className="h-6 w-6 text-[#4A2B4A]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#694969]">Average HR</p>
                    <p className="text-2xl font-bold text-[#4A2B4A]">{Math.round(analytics.avgHeartRate)}</p>
                    <p className="text-xs text-[#694969] mt-1">beats per minute</p>
                  </div>
                  <div className="p-2 bg-[#EBE5EB]/30 rounded-full">
                    <Heart className="h-6 w-6 text-[#4A2B4A]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 🔥 USAR LOS COMPONENTES EXISTENTES */}
        <div className="space-y-8"> {/* 🔥 MANTENER ESPACIO CONSISTENTE */}
          {/* Biometric Trends Component - YA TIENE SU PROPIO MARGEN SUPERIOR */}
          <BiometricTrends analytics={analytics} />
          
          {/* Task Performance Component */}
          <TaskPerformance analytics={analytics} />
        </div>
      </main>
    </div>
  )
}
