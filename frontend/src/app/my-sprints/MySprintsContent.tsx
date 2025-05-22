"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SprintMetric, getProjectSprintMetrics, getCurrentSprintMetric } from "@/utils/getProjectSprintMetrics"
import { useUser } from "@/contexts/usercontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { formatDate } from "@/utils/dateUtils"
import Navbar from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CalendarClock, FileText, Bug, Users, ChevronRight, PenSquare } from "lucide-react"
import { Progress } from "@/components/progress"

export default function MySprintsContent() {
  const { userId } = useUser()
  const { currentProjectId } = useKanban()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId") || currentProjectId || ""
  
  const [loading, setLoading] = useState(true)
  const [sprints, setSprints] = useState<SprintMetric[]>([])
  const [currentSprint, setCurrentSprint] = useState<SprintMetric | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Si no hay un proyecto seleccionado, redireccionar a la página de proyectos
    if (!projectId) {
      router.push("/projects")
      return
    }
    
    localStorage.setItem("currentProjectId", projectId)

    async function fetchSprints() {
      try {
        setLoading(true)
        // Obtener métricas de sprint para el proyecto actual
        const sprintMetrics = await getProjectSprintMetrics(projectId)
        setSprints(sprintMetrics)
        
        // Establecer el sprint actual
        const activeSprint = sprintMetrics.find(s => s.status === "active") || 
                            (sprintMetrics.length > 0 ? sprintMetrics[0] : null)
        setCurrentSprint(activeSprint)
      } catch (error) {
        console.error("Error cargando sprints:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSprints()
  }, [projectId, router])

  // Filtrar sprints por estado
  const filteredSprints = sprints.filter(sprint => {
    if (activeTab === "all") return true
    return sprint.status === activeTab
  })

  // Función para crear un nuevo sprint
  const handleCreateSprint = () => {
    router.push(`/sprint_planning?projectId=${projectId}`)
  }

  // Función para ver detalles de un sprint
  const handleViewDetails = (sprintId: string) => {
    router.push(`/sprint_details?projectId=${projectId}&sprintId=${sprintId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EBE5EB]/30">
      <Navbar projectSelected={true} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">My Sprints</h1>
            <p className="text-[#694969] mt-2">Manage and track all your sprints</p>
          </div>
          <Button 
            onClick={handleCreateSprint} 
            className="bg-[#4a2b4a] hover:bg-[#694969] text-white"
          >
            <span className="mr-2">+</span> Create Sprint
          </Button>
        </div>

        {currentSprint ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-yellow-500 mr-2">★</span>
              Current Sprint
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <StatusBadge status={currentSprint.status} />
                    <h3 className="text-2xl font-bold ml-4">Sprint {currentSprint.sprintName.split(' ').pop()}</h3>
                  </div>
                  <p className="text-[#694969] mt-2">{currentSprint.selectedStories[0]?.description || "Focus on user authentication and dashboard improvements"}</p>
                  
                  <div className="mt-4 flex items-center text-[#694969]">
                    <CalendarClock size={16} className="mr-1" />
                    <span>{formatDate(currentSprint.startDate)} - {formatDate(currentSprint.endDate)}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <FileText size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{currentSprint.selectedStories.length}</div>
                        <div className="text-sm text-[#694969]">User Stories</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <Bug size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-[#694969]">Bugs</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <Users size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{currentSprint.teamSize}</div>
                        <div className="text-sm text-[#694969]">Team Members</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex">
                    <Button 
                      variant="secondary" 
                      className="flex items-center"
                      onClick={() => handleViewDetails(currentSprint.sprintId)}
                    >
                      <span>View Details</span>
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="ml-3 flex items-center"
                      onClick={() => router.push(`/sprint_planning?projectId=${projectId}&sprintId=${currentSprint.sprintId}`)}
                    >
                      <PenSquare size={16} className="mr-2" />
                      <span>Edit Sprint</span>
                    </Button>
                  </div>
                </div>
                
                <div className="w-64 flex flex-col items-center">
                  <div className="text-center mb-2">
                    <h4 className="font-medium">Sprint Progress</h4>
                  </div>
                  <SprintProgressCircle 
                    percentage={currentSprint.completionPercentage} 
                    size={150} 
                    strokeWidth={15} 
                  />
                  
                  <div className="w-full mt-6">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Story Points</span>
                      <span className="text-sm font-medium">{currentSprint.completedPoints}/{currentSprint.totalPoints}</span>
                    </div>
                    <Progress 
                      value={currentSprint.completionPercentage} 
                      className="h-2 bg-gray-200" 
                      indicatorClassName="bg-[#4a2b4a]"
                    />
                    
                    <div className="flex justify-between mt-4 mb-1">
                      <span className="text-sm">Days Remaining</span>
                      <span className="text-sm font-medium">{currentSprint.daysRemaining}/{currentSprint.totalDuration}</span>
                    </div>
                    <Progress
                      value={100 - (currentSprint.daysRemaining / currentSprint.totalDuration * 100)}
                      className="h-2 bg-gray-200" 
                      indicatorClassName="bg-[#4a2b4a]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-[#694969]">No active sprint found</p>
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={handleCreateSprint}
            >
              Create Your First Sprint
            </Button>
          </div>
        )}
        
        <div className="mt-12">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All Sprints</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search sprints..."
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] focus:border-transparent"
                />
              </div>
            </div>
            
            <TabsContent value={activeTab}>
              {filteredSprints.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredSprints.map((sprint) => (
                    <div 
                      key={sprint.sprintId} 
                      className="bg-white border rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(sprint.sprintId)}
                    >
                      <div className="flex items-center">
                        <StatusBadge status={sprint.status} />
                        <div className="ml-4">
                          <h3 className="font-semibold">{sprint.sprintName}</h3>
                          <p className="text-sm text-[#694969]">
                            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="mr-8 text-right">
                          <div className="font-medium">Progress</div>
                          <div className="text-2xl font-bold">{sprint.completionPercentage}%</div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                  <p className="text-[#694969]">No sprints found with the current filters</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Componentes auxiliares
function SprintProgressCircle({ 
  percentage, 
  size = 120, 
  strokeWidth = 10 
}: {
  percentage: number,
  size: number,
  strokeWidth: number
}) {
  const [progress, setProgress] = useState(0)
  
  // Efecto animado de progreso
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [percentage])
  
  // Calcular propiedades del círculo
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Círculo de fondo */}
        <circle
          className="text-gray-200"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Círculo de progreso */}
        <circle
          className="text-[#4a2b4a]"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: "stroke-dashoffset 0.5s ease 0s" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold">{progress}%</span>
      </div>
      
      {/* Modificación: Aumentar la separación con translate-y-4 */}
      <span className="absolute bottom-0 left-0 right-0 text-center text-sm text-[#694969] translate-y-6">
        Completed
      </span>
    </div>
  )
}

// Componente para mostrar el estado con colores adecuados
function StatusBadge({ status }: { status: string }) {
  let bgColor = "bg-gray-200 text-gray-800";
  
  switch (status) {
    case "active":
      bgColor = "bg-green-100 text-green-800";
      break;
    case "completed":
      bgColor = "bg-blue-100 text-blue-800";
      break;
    case "upcoming":
      bgColor = "bg-purple-100 text-purple-800";
      break;
  }
  
  return (
    <span className={`${bgColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}