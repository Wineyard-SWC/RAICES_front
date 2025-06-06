"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Brain, 
  Download, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  Plus,
  Calendar,
  Users,
  Activity
} from "lucide-react";

import { Button } from "@/components/ui/button";
import CurrentState from "./components/CurrentState";
import BiometricTrends from "./components/BiometricTrends";
import TaskPerformance from "./components/TaskPerformance";
import SessionCreator from "./components/SessionCreator";
import BiometricMeetingWizard from "./components/biometric-meeting-wizard";
import { useBiometricData } from "./hooks/useBiometricData";
import { Card, CardContent } from "@/components/card";

export default function BiometricDashboard() {
  // Por ahora usaremos un userId fijo, después se puede obtener del contexto de autenticación
  const userId = "KwAlZKmIUuTSwux3lYKjLBcXZIh2";
  const { sessions, analytics, loading, error, refetch } = useBiometricData(userId);
  
  const [userName, setUserName] = useState("Usuario");
  const [view, setView] = useState<"dashboard" | "create_session">("dashboard");
  const [showMeetingWizard, setShowMeetingWizard] = useState(false);

  useEffect(() => {
    if (sessions.length > 0) {
      setUserName(sessions[0].user_name);
    }
  }, [sessions]);

  const handleCreateSession = (sessionData: any) => {
    console.log("Creating session:", sessionData);
    // Aquí implementarías la lógica para guardar la sesión
    setView("dashboard");
    // Refrescar datos después de crear la sesión
    refetch();
  };

  const handleMeetingComplete = (meetingData: any) => {
    console.log("Meeting created:", meetingData);
    setShowMeetingWizard(false);
    // Aquí implementarías la lógica para guardar la reunión
    refetch();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f3f7]">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/placeholder.svg?height=32&width=100" alt="RAICES Logo" width={100} height={32} />
            </Link>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#4a2b4a]" />
            <span className="text-lg">Cargando datos biométricos...</span>
            <span className="text-sm text-gray-500">
              Procesando tu historial de sesiones
            </span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f3f7]">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/placeholder.svg?height=32&width=100" alt="RAICES Logo" width={100} height={32} />
            </Link>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error al cargar datos</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={refetch} className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3f7]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/placeholder.svg?height=32&width=100" alt="RAICES Logo" width={100} height={32} />
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" className="text-sm font-medium">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Projects
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Roadmap
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Team
            </Button>
            <Button variant="ghost" className="flex items-center gap-1 text-sm font-medium">
              Generate
              <ChevronDown className="h-4 w-4" />
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <span className="sr-only">Notifications</span>
            <div className="relative">
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
            </div>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {view === "create_session" ? (
          <SessionCreator 
            onBack={() => setView("dashboard")} 
            onCreateSession={handleCreateSession}
          />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Volver</span>
                    </Button>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold">Dashboard Biométrico</h1>
                <p className="text-gray-600">
                  Análisis personalizado de bienestar para {userName}
                </p>
              </div>
              
              {analytics && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMeetingWizard(true)}
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Crear Reunión Biométrica
                  </Button>
                  <Button 
                    onClick={() => setView("create_session")}
                    className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Sesión Individual
                  </Button>
                  <Button variant="outline" onClick={refetch} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Datos
                  </Button>
                </div>
              )}
            </div>

            {analytics ? (
              <>
                {/* Estado Actual */}
                <div className="mb-8">
                  <CurrentState analytics={analytics} />
                </div>

                {/* Tendencias Biométricas */}
                <div className="mb-8">
                  <BiometricTrends analytics={analytics} />
                </div>

                {/* Performance de Tareas y Distribución Emocional */}
                <div className="mb-8">
                  <TaskPerformance analytics={analytics} />
                </div>

                {/* Footer con información adicional */}
                <div className="mt-12 p-6 bg-white rounded-lg border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Resumen de Actividad</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#4a2b4a]">{analytics.totalSessions}</div>
                        <div className="text-sm text-gray-600">Sesiones Completadas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(analytics.avgStress * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Estrés Promedio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.avgHeartRate.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">FC Promedio (bpm)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {analytics.taskPerformance.length}
                        </div>
                        <div className="text-sm text-gray-600">Tareas Evaluadas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* 👈 Estado sin datos - Placeholders */
              <div className="space-y-8">
                {/* Estado Actual - Placeholder */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Image
                          src="/placeholder.svg?height=64&width=64"
                          alt="Avatar placeholder"
                          width={64}
                          height={64}
                          className="rounded-full opacity-50"
                        />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">¡Bienvenido a tu Dashboard Biométrico!</h2>
                      <p className="text-gray-600 mb-6">
                        No tienes sesiones biométricas registradas por el momento.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                        <Card className="p-6 border-dashed border-2 border-gray-200">
                          <div className="text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                            <h3 className="font-semibold mb-2">Reuniones Biométricas</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Monitorea el bienestar de tu equipo durante reuniones
                            </p>
                            <Button 
                              onClick={() => setShowMeetingWizard(true)}
                              className="w-full bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Crear Reunión
                            </Button>
                          </div>
                        </Card>
                        
                        <Card className="p-6 border-dashed border-2 border-gray-200">
                          <div className="text-center">
                            <Brain className="h-12 w-12 mx-auto mb-4 text-[#4a2b4a]" />
                            <h3 className="font-semibold mb-2">Sesiones Individuales</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Evalúa tu estado emocional y nivel de estrés personal
                            </p>
                            <Button 
                              onClick={() => setView("create_session")}
                              className="w-full bg-[#4a2b4a] text-white hover:bg-[#694969]"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Crear Sesión
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tendencias - Placeholder */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-400">Tendencias Biométricas</h3>
                    </div>
                    <div className="text-center py-8">
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <p className="text-gray-500">Sin datos para mostrar gráficos</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Las tendencias aparecerán aquí una vez que completes tus primeras sesiones biométricas.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance - Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-400 mb-4">Rendimiento por Tarea</h3>
                      <div className="text-center py-8">
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <p className="text-gray-500">Sin tareas evaluadas</p>
                        </div>
                        <p className="text-xs text-gray-600">
                          Completa sesiones para ver tu rendimiento
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-400 mb-4">Distribución Emocional</h3>
                      <div className="text-center py-8">
                        <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                          <p className="text-gray-500">Sin emociones registradas</p>
                        </div>
                        <p className="text-xs text-gray-600">
                          Tus estados emocionales aparecerán aquí
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Footer stats - Placeholder */}
                <div className="mt-12 p-6 bg-white rounded-lg border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Resumen de Actividad</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-300">0</div>
                        <div className="text-sm text-gray-600">Sesiones Completadas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-300">--</div>
                        <div className="text-sm text-gray-600">Estrés Promedio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-300">--</div>
                        <div className="text-sm text-gray-600">FC Promedio (bpm)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-300">0</div>
                        <div className="text-sm text-gray-600">Tareas Evaluadas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Meeting Wizard Modal */}
      <BiometricMeetingWizard
        isOpen={showMeetingWizard}
        onClose={() => setShowMeetingWizard(false)}
        onComplete={handleMeetingComplete}
      />
    </div>
  );
}