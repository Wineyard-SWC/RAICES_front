"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SprintMetric, getProjectSprintMetrics } from "@/utils/getProjectSprintMetrics"
import { useUser } from "@/contexts/usercontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { formatDate } from "@/utils/dateUtils"
import Navbar from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CalendarClock, FileText, Bug, Users, PenSquare, CheckSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/components/progress"
import { useUserPermissions } from "@/contexts/UserPermissions"
import { Task } from "@/types/task"

// Definir las constantes de permisos
const PERMISSIONS = {
  SPRINT_PLAN: 1 << 3, // Permiso para planificación de sprints
};

export default function MySpritsContent() {
  const { userId } = useUser()
  const { currentProjectId } = useKanban()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId") || currentProjectId || ""
  
  // Añadir hook de permisos
  const { hasPermission } = useUserPermissions();
  
  // Verificar si el usuario puede planificar sprints
  const canPlanSprints = hasPermission(PERMISSIONS.SPRINT_PLAN);
  
  const [loading, setLoading] = useState(true)
  const [sprints, setSprints] = useState<SprintMetric[]>([])
  const [currentSprint, setCurrentSprint] = useState<SprintMetric | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [showTasks, setShowTasks] = useState(false) 

  useEffect(() => {
    // Si no hay un proyecto seleccionado, redireccionar a la página de proyectos
    if (!projectId) {
      router.push("/projects")
      return
    }

    // Establecer el ID del proyecto actual en el localStorage
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
  const filteredSprints = activeTab === "all" 
    ? sprints 
    : sprints.filter(sprint => 
        activeTab === "active" ? sprint.status === "active" :
        activeTab === "planned" ? sprint.status === "planning" :
        activeTab === "completed" ? sprint.status === "completed" : true
      )

  const handleCreateSprint = () => {
    router.push(`/sprint_planning?projectId=${projectId}`)
  }

  const handleViewDetails = (sprintId: string) => {
    router.push(`/sprint_planning?projectId=${projectId}&sprintId=${sprintId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBE5EB]/30">
        <Navbar projectSelected={true} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EBE5EB]/30">
      <Navbar projectSelected={true} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Project Sprints</h1>
            <p className="text-[#694969] mt-2">Manage and track all your sprints</p>
          </div>
          {/* Botón de Crear Sprint - visible solo con permiso */}
          {canPlanSprints && (
            <Button 
              onClick={handleCreateSprint} 
              className="bg-[#4a2b4a] hover:bg-[#694969] text-white"
            >
              <span className="mr-2">+</span> Create Sprint
            </Button>
          )}
        </div>

        {currentSprint ? (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-5 flex items-center">
              <span className="text-yellow-500 mr-2">★</span>
              Current Sprint
            </h2>
            <div className="bg-white rounded-lg shadow-md p-8 border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <StatusBadge status={currentSprint.status} />
                    <h3 className="text-2xl font-bold ml-4">Sprint {currentSprint.sprintName.split(' ').pop()}</h3>
                  </div>
                  
                  <div className="mt-4 mb-6 flex items-center text-[#694969]">
                    <CalendarClock size={16} className="mr-2" />
                    <span>{formatDate(currentSprint.startDate)} - {formatDate(currentSprint.endDate)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
                    <div className="bg-gray-50 p-5 rounded-lg flex items-center">
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <FileText size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold">
                          {currentSprint.completedStories.length}/{currentSprint.selectedStories.length}
                        </div>
                        <div className="text-sm text-[#694969]">User Stories</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {currentSprint.selectedStories.length > 0 
                            ? `${Math.round((currentSprint.completedStories.length / currentSprint.selectedStories.length) * 100)}% completed`
                            : 'No stories'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Módulo de Tasks */}
                    <div 
                      className="bg-gray-50 p-5 rounded-lg flex items-center cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setShowTasks(!showTasks)}
                    >
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <CheckSquare size={20} className="text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-2xl font-bold">
                          {currentSprint.completedTasks.length}/{currentSprint.tasksCount || 0}
                        </div>
                        <div className="text-sm text-[#694969]">Tasks</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {currentSprint.tasksCount > 0 
                            ? `${Math.round((currentSprint.completedTasks.length / currentSprint.tasksCount) * 100)}% completed`
                            : 'No tasks'
                          }
                        </div>
                      </div>
                      <div className="ml-2">
                        {showTasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg flex items-center">
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <Bug size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{currentSprint.bugsCount || 0}</div>
                        <div className="text-sm text-[#694969]">Bugs</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg flex items-center">
                      <div className="bg-[#4a2b4a] p-2 rounded-full">
                        <Users size={20} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold">{currentSprint.teamSize}</div>
                        <div className="text-sm text-[#694969]">Team Members</div>
                      </div>
                    </div>
                  </div>

                  {/* Panel expandible de Tasks */}
                  {showTasks && currentSprint.sprintTasks && currentSprint.sprintTasks.length > 0 && (
                    <TasksExpandedPanel 
                      tasks={currentSprint.sprintTasks} 
                      userStories={currentSprint.selectedStories}
                    />
                  )}
                  
                  <div className="mt-8">
                    {/* Solo mostrar botón de edición si tiene permiso */}
                    {canPlanSprints && (
                      <Button 
                        variant="outline" 
                        className="flex items-center"
                        onClick={() => router.push(`/sprint_planning?projectId=${projectId}&sprintId=${currentSprint.sprintId}`)}
                      >
                        <PenSquare size={16} className="mr-2" />
                        <span>Edit Sprint</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="w-72 flex flex-col items-center">
                  <div className="text-center mb-3">
                    <h4 className="font-medium text-lg">Sprint Progress</h4>
                  </div>
                  
                  <SprintProgressCircle 
                    percentage={currentSprint.completionPercentage} 
                    size={160} 
                    strokeWidth={15} 
                  />
                  
                  <div className="w-full mt-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Story Points</span>
                      <span className="text-sm font-medium">{currentSprint.completedPoints}/{currentSprint.totalPoints}</span>
                    </div>
                    <Progress 
                      value={currentSprint.completionPercentage} 
                      className="h-2.5 bg-gray-200" 
                      indicatorClassName="bg-[#4a2b4a]"
                    />
                    
                    <div className="flex justify-between mt-6 mb-2">
                      <span className="text-sm">Days Remaining</span>
                      <span className="text-sm font-medium">{currentSprint.daysRemaining}/{currentSprint.totalDuration}</span>
                    </div>
                    <Progress
                      value={100 - (currentSprint.daysRemaining / currentSprint.totalDuration * 100)}
                      className="h-2.5 bg-gray-200" 
                      indicatorClassName="bg-[#4a2b4a]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10 p-8 border rounded-lg bg-gray-50 text-center">
            <h3 className="font-semibold text-xl mb-3">No Active Sprint</h3>
            <p className="text-[#694969] mb-6">You don't have any active sprints at the moment</p>
            {canPlanSprints && (
              <Button 
                onClick={handleCreateSprint}
                className="bg-[#4a2b4a] hover:bg-[#694969] text-white"
              >
                Create Your First Sprint
              </Button>
            )}
          </div>
        )}

        <div className="mt-10">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-[#ebe5eb]/50">
              <TabsTrigger value="all">All Sprints</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="planned">Planned</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-64">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search sprints..."
                    className="pl-10 pr-4 py-2.5 w-full border rounded-md"
                  />
                </div>
                
                <div className="relative">
                  <Button variant="outline" className="flex items-center">
                    <span>All Statuses</span>
                    <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              {filteredSprints.length > 0 ? (
                <div className="grid grid-cols-1 gap-5">
                  {filteredSprints.map((sprint) => (
                    <div 
                      key={sprint.sprintId} 
                      className="bg-white border rounded-lg p-5 flex justify-between items-center hover:shadow-md transition-shadow"
                      onClick={() => canPlanSprints ? handleViewDetails(sprint.sprintId) : null}
                      style={{ cursor: canPlanSprints ? 'pointer' : 'default' }}
                    >
                      <div className="flex items-center">
                        <StatusBadge status={sprint.status} />
                        <div className="ml-4">
                          <h3 className="font-semibold">{sprint.sprintName}</h3>
                          <p className="text-sm text-[#694969] mt-1">
                            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="mr-8 text-right">
                          <div className="font-medium">Progress</div>
                          <div className="text-2xl font-bold">{sprint.completionPercentage}%</div>
                        </div>
                        
                        {canPlanSprints && (
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-md">
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
      
      {/* Mejorado el espaciado */}
      <span className="absolute bottom-0 left-0 right-0 text-center text-sm text-[#694969] translate-y-8">
        Completed
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "";
  let text = "";
  
  switch (status) {
    case "planning":
      color = "bg-blue-100 text-blue-800";
      text = "Planning";
      break;
    case "active":
      color = "bg-green-100 text-green-800";
      text = "Active";
      break;
    case "completed":
      color = "bg-purple-100 text-purple-800";
      text = "Completed";
      break;
    default:
      color = "bg-gray-100 text-gray-800";
      text = "Unknown";
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  )
}

// Nuevo componente para el panel expandible de tasks
function TasksExpandedPanel({ 
  tasks, 
  userStories 
}: { 
  tasks: Task[], 
  userStories: any[] 
}) {
  const userStoriesMap = new Map(
    userStories.flatMap(story => {
      const entries: [string, any][] = [];
      if (story.id) entries.push([story.id, story]);
      if (story.uuid) entries.push([story.uuid, story]);
      return entries;
    })
  );

  // Agrupar tasks por user story
  const tasksByUserStory = tasks.reduce((acc, task) => {
    const userStoryId = task.user_story_id || 'unassigned';
    if (!acc[userStoryId]) {
      acc[userStoryId] = [];
    }
    acc[userStoryId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="mt-6 bg-white border rounded-lg p-4">
      <h4 className="text-lg font-semibold text-[#4a2b4a] mb-4 flex items-center">
        <CheckSquare size={18} className="mr-2" />
        Sprint Tasks
      </h4>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(tasksByUserStory).map(([userStoryId, taskList]) => {
          const userStory = userStoriesMap.get(userStoryId);
          const completedTasks = taskList.filter(task => task.status_khanban === 'Done').length;
          
          return (
            <div key={userStoryId} className="border-l-4 border-[#4a2b4a] pl-4">
              <div className="mb-2">
                <h5 className="font-medium text-gray-900">
                  {userStory ? userStory.title : 'Unassigned Tasks'}
                </h5>
                <span className="text-sm text-gray-500">
                  {completedTasks}/{taskList.length} completed
                </span>
              </div>
              
              <div className="space-y-2">
                {taskList.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center justify-between p-2 rounded ${
                      task.status_khanban === 'Done' 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        task.status_khanban === 'Done' 
                          ? 'bg-green-500' 
                          : task.status_khanban === 'In Progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`} />
                      <span className={`text-sm ${
                        task.status_khanban === 'Done' ? 'line-through' : ''
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.story_points && (
                        <span className="px-2 py-1 bg-[#4a2b4a] text-white text-xs rounded">
                          {task.story_points} pts
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.status_khanban === 'Done' 
                          ? 'bg-green-100 text-green-700'
                          : task.status_khanban === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status_khanban || 'Backlog'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {Object.keys(tasksByUserStory).length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p>No tasks found for this sprint</p>
          </div>
        )}
      </div>
    </div>
  );
}