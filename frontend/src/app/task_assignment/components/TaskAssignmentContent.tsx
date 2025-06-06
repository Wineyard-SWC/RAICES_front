"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ArrowLeft, Users, X, AlertCircle, Brain, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/NavBar"

import { useSprintContext } from "@/contexts/sprintcontext"
import type { Task } from "@/types/task"
import { Progress } from "@/components/progress"
import DefaultLoading from "@/components/animations/DefaultLoading"
import { useTasks } from "@/contexts/taskcontext"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/settings/components/ui/dialog"
import { useSessionRelation } from "@/hooks/useSessionRelation" // 👈 Agregar import

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export default function TaskAssignmentContent() {
  // Obtener parámetros de la URL y configurar router
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId") || ""
  const sprintId = searchParams.get("sprintId") || ""
  const safeSprintId = sprintId || ""

  // Hook para manejo de session relation
  const { generateSessionRelationId } = useSessionRelation() // 👈 Agregar hook

  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [taskFilter, setTaskFilter] = useState("all") // "all", "unassigned", "assigned"
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para el modal de verificación biométrica
  const [biometricModalOpen, setBiometricModalOpen] = useState(false)

  // Contextos
  const { sprint, tasks, setTasks } = useSprintContext()
  const { updateTaskInProject } = useTasks()

  // Si no hay sprint o está cargando, mostrar pantalla de carga
  if (!sprint) {
    return <DefaultLoading text="sprint tasks" />
  }

  // 1) Extraer IDs de user stories seleccionadas
  const selectedStoryIds = sprint.user_stories.filter((story) => story.selected).map((story) => story.id)

  // 2) Filtrar tareas que pertenecen a esas user stories
  const sprintTasks = tasks.filter((task) => {
    // Verificar si la tarea pertenece a una user story seleccionada
    if (!task.user_story_id || !selectedStoryIds.includes(task.user_story_id)) {
      return false
    }

    // filtro de no asignadas
    if (taskFilter === "unassigned" && task.assignee_id) return false

    // filtro de asignadas
    if (taskFilter === "assigned" && !task.assignee_id) return false

    // si assigned y hay miembro seleccionado
    if (taskFilter === "assigned" && selectedMember) {
      if (task.assignee_id !== selectedMember) return false
    }
    // búsqueda libre
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      const inTitle = task.title.toLowerCase().includes(q)
      const inDesc = task.description.toLowerCase().includes(q)
      if (!inTitle && !inDesc) return false
    }
    return true
  })

  // 4) Cálculo de progreso y totales sobre sprintTasks
  const totalTasks = sprintTasks.length
  const assignedTasksCount = sprintTasks.filter((t) => t.assignee_id).length
  const assignmentProgress = totalTasks > 0 ? Math.round((assignedTasksCount / totalTasks) * 100) : 0

  // 5) Cargar capacidad de cada miembro según sprintTasks
  const teamWorkload = sprint.team_members
    .map((member) => {
      // Contar tareas asignadas a este miembro
      const memberTasks = sprintTasks.filter((t) => t.assignee_id === member.id)
      const tasksCount = memberTasks.length

      // Contar puntos asignados a este miembro (con verificación de seguridad)
      const storyPoints = memberTasks.reduce((sum, task) => {
        const userStory = sprint.user_stories.find((us) => us.id === task.user_story_id)
        return sum + (userStory?.userStory?.points || 0)
      }, 0)

      // Calcular capacidad utilizada
      const capacity = member.capacity || 0
      const usedCapacity = (storyPoints / (capacity || 1)) * 100

      return {
        ...member,
        tasksCount,
        storyPoints,
        usedCapacity: Math.min(usedCapacity, 100), // Limitar a 100%
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // Resetear filtros
  const resetFilters = () => {
    setTaskFilter("all")
    setSelectedMember(null)
    setSearchTerm("")
  }

  // Asignar tarea
  const assignTask = (task: Task) => {
    if (isSaving) {
      return
    }
    setTaskToAssign(task)
    setAssignModalOpen(true)
  }

  // Remover asignación
  const removeAssignment = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, assignee_id: undefined, assignee: undefined } : t)))
  }

  // Guardar asignaciones temporalmente en el backend
  const saveAssignmentsToBackend = async () => {
    if (!safeSprintId || safeSprintId.startsWith("temp-")) {
      // Actualiza el contexto global de tareas para que SprintPlanning vea los cambios
      sprintTasks.forEach((t) => {
        updateTaskInProject(projectId, t.id, t)
      })

      // Luego navega de regreso
      router.push(`/sprint_planning?projectId=${projectId}${safeSprintId ? `&sprintId=${safeSprintId}` : ``}`)
      return
    }

    setIsSaving(true)
    try {
      const tasksToUpdate = sprintTasks.map((t) => {
        const member = sprint.team_members.find((m) => m.id === t.assignee_id)
        return {
          id: t.id,
          title: t.title || "",
          description: t.description || "",
          user_story_id: t.user_story_id || "",
          priority: t.priority || "Medium",
          status_khanban: t.status_khanban || "To Do",
          story_points: t.story_points ?? 0,
          // NO incluyas assignee_id
          ...(t.assignee_id && member ? { assignee: [[t.assignee_id, member.name]] } : {}),
        }
      })
      console.log("[TASK ASSIGNMENT] Tareas a actualizar (payload):", tasksToUpdate)

      // Actualizar tareas en el backend
      const taskRes = await fetch(`${API_URL}/projects/${projectId}/tasks/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tasksToUpdate),
      })

      if (!taskRes.ok) {
        const taskErrorText = await taskRes.text()
        console.error("Error updating tasks:", taskErrorText)
        throw new Error(`Tasks update failed: ${taskRes.status} - ${taskErrorText}`)
      }

      const updatedFromServer: Task[] = await taskRes.json()
      console.log("[TASK ASSIGNMENT] Respuesta del backend (tareas actualizadas):", updatedFromServer)

      updatedFromServer.forEach((u) => {
        updateTaskInProject(projectId, u.id, u)
      })

      console.log("Task assignments saved successfully")
    } catch (error) {
      console.error("Error saving task assignments:", error)
      // Aún así permitir navegar de vuelta aunque falle el guardado
    } finally {
      setIsSaving(false)
    }

    // Volver a sprint planning
    router.push(`/sprint_planning?projectId=${projectId}${safeSprintId ? `&sprintId=${safeSprintId}` : ``}`)
  }

  // Mostrar modal de verificación biométrica
  const showBiometricModal = () => {
    setBiometricModalOpen(true)
  }

  // Continuar con asignación normal
  const continueWithNormalAssignment = () => {
    setBiometricModalOpen(false)
    saveAssignmentsToBackend()
  }

  // Iniciar verificación biométrica
  const startBiometricVerification = () => {
    setBiometricModalOpen(false)
    
    // Generar nuevo ID de sesión de investigación
    const sessionRelationId = generateSessionRelationId()
    console.log("🔗 Generated session relation ID for biometric verification:", sessionRelationId)
    
    // Navegar al flujo de verificación biométrica
    router.push(`/biometric_verification?projectId=${projectId}&sprintId=${safeSprintId}`)
  }

  // Guardar y volver a planificación
  const saveAssignments = () => {
    // Mostrar modal de verificación biométrica en lugar de guardar directamente
    showBiometricModal()
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <Navbar projectSelected />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Detailed Task Assignment</h1>
            <p className="text-[#694969] mt-2">Match team members with the most suitable tasks</p>
          </div>
          <Link
            href={`/sprint_planning?projectId=${projectId}${safeSprintId ? `&sprintId=${safeSprintId}` : ""}`}
            passHref
          >
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Sprint Planning
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Assignment Progress</h2>
            <span className="text-sm font-medium">
              {assignedTasksCount} / {totalTasks} tasks assigned
            </span>
          </div>
          <Progress
            value={assignmentProgress}
            className="h-2 bg-gray-200"
            indicatorClassName={
              assignmentProgress < 50 ? "bg-red-500" : assignmentProgress < 100 ? "bg-yellow-500" : "bg-green-500"
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Members Sidebar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-fit">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-[#4a2b4a] mr-2" />
              <h2 className="text-lg font-medium">Team Members</h2>
            </div>

            <ul className="space-y-3">
              {teamWorkload.map((member) => (
                <li
                  key={member.id}
                  onClick={() => {
                    if (selectedMember === member.id) {
                      setSelectedMember(null)
                      setTaskFilter("all")
                    } else {
                      setSelectedMember(member.id)
                      setTaskFilter("assigned")
                    }
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMember === member.id
                      ? "border-[#4a2b4a] bg-[#f5f0f5]"
                      : "border-gray-200 hover:border-[#4a2b4a]/50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{member.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        member.usedCapacity >= 100
                          ? "bg-red-100 text-red-800"
                          : member.usedCapacity >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {member.tasksCount} tasks
                    </span>
                  </div>
                  <div>
                    <Progress
                      value={member.usedCapacity}
                      className="h-1.5 bg-gray-200 mt-1"
                      indicatorClassName={
                        member.usedCapacity >= 100
                          ? "bg-red-500"
                          : member.usedCapacity >= 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">{Math.round(member.usedCapacity)}% capacity</span>
                      <span className="text-gray-500">{member.storyPoints} story points</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Task List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={taskFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTaskFilter("all")}
                    className={taskFilter === "all" ? "bg-[#4a2b4a]" : ""}
                  >
                    All
                  </Button>
                  <Button
                    variant={taskFilter === "unassigned" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTaskFilter("unassigned")
                      setSelectedMember(null)
                    }}
                    className={taskFilter === "unassigned" ? "bg-[#4a2b4a]" : ""}
                  >
                    Unassigned
                  </Button>
                  <Button
                    variant={taskFilter === "assigned" && !selectedMember ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setTaskFilter("assigned")
                      setSelectedMember(null)
                    }}
                    className={taskFilter === "assigned" && !selectedMember ? "bg-[#4a2b4a]" : ""}
                  >
                    Assigned
                  </Button>

                  {(taskFilter !== "all" || searchTerm || selectedMember) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-gray-500">
                      <X className="h-4 w-4 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Task Cards */}
              {sprintTasks.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No tasks match your filter criteria</p>
                  <Button variant="link" onClick={resetFilters} className="mt-2">
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sprintTasks.map((task) => {
                    // Find the user story that this task belongs to
                    const userStory = sprint.user_stories.find((us) => us.id === task.user_story_id)

                    // Find team member if assigned
                    const assignedMember = task.assignee_id
                      ? sprint.team_members.find((m) => m.id === task.assignee_id)
                      : null

                    // Obtener el título de la user story de forma segura
                    const userStoryTitle = userStory?.userStory?.title ?? "Sin título"
                    const userStoryPoints = userStory?.userStory?.points ?? 0

                    return (
                      <div key={task.id} className="border rounded-lg p-3 hover:border-[#4a2b4a]/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                task.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {task.priority}
                            </span>

                            {userStory && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                SP: {userStoryPoints}
                              </span>
                            )}
                          </div>
                        </div>

                        {userStory && (
                          <p className="text-sm text-gray-500 mb-2">
                            <span className="font-medium">User Story:</span> {userStoryTitle}
                          </p>
                        )}

                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                        <div className="flex items-center justify-between">
                          <div>
                            {assignedMember ? (
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Assigned to:</span>
                                <span className="text-sm font-medium">{assignedMember.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAssignment(task.id)}
                                  className="ml-2 text-red-500 h-7 px-2"
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Unassigned</span>
                            )}
                          </div>

                          <div>
                            {!assignedMember && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => assignTask(task)}
                                className="bg-[#4a2b4a] text-white hover:bg-[#5d3b5d]"
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]" onClick={saveAssignments} disabled={isSaving}>
            {isSaving ? "Saving..." : "Complete Assignment & Return to Planning"}
          </Button>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModalOpen && taskToAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Assign Task</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAssignModalOpen(false)
                  setTaskToAssign(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium">{taskToAssign.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{taskToAssign.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Select team member:</h4>

              <div className="space-y-2">
                {teamWorkload.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      // Assign task to this member
                      const updatedTasks = tasks.map((t) =>
                        t.id === taskToAssign.id
                          ? {
                              ...t,
                              assignee_id: member.id,
                              // NO agregues el campo assignee aquí, déjalo que lo maneje el backend
                            }
                          : t,
                      )
                      console.log("Asignando tarea:", taskToAssign.id, "a miembro:", member.id, member.name)
                      console.log("Tareas después de asignar:", updatedTasks)
                      setTasks(updatedTasks)
                      setAssignModalOpen(false)
                      setTaskToAssign(null)
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:border-[#4a2b4a]/50 ${
                      member.usedCapacity >= 100 ? "bg-red-50" : member.usedCapacity >= 75 ? "bg-yellow-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs">{Math.round(member.usedCapacity)}% capacity used</span>
                    </div>
                    <Progress
                      value={member.usedCapacity}
                      className="h-1.5 bg-gray-200 mt-2"
                      indicatorClassName={
                        member.usedCapacity >= 100
                          ? "bg-red-500"
                          : member.usedCapacity >= 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {member.tasksCount} tasks · {member.storyPoints} story points
                    </div>

                    {member.usedCapacity >= 100 && (
                      <div className="flex items-center mt-2 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Member is at full capacity</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Verification Modal */}
      <Dialog open={biometricModalOpen} onOpenChange={setBiometricModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">¿Verificar con biométricos?</DialogTitle>
            <DialogDescription className="pt-2">
              Selecciona cómo deseas proceder con la asignación de tareas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div
              onClick={continueWithNormalAssignment}
              className="flex flex-col items-center justify-center p-6 border rounded-lg cursor-pointer hover:border-[#4a2b4a] hover:bg-[#f5f0f5] transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="font-medium text-center">Continuar con asignación normal</h3>
              <p className="text-sm text-gray-500 text-center mt-2">Guardar asignaciones sin verificación adicional</p>
            </div>

            <div
              onClick={startBiometricVerification}
              className="flex flex-col items-center justify-center p-6 border rounded-lg cursor-pointer hover:border-[#4a2b4a] hover:bg-[#f5f0f5] transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-[#f0e6f0] flex items-center justify-center mb-3">
                <Brain className="h-6 w-6 text-[#4a2b4a]" />
              </div>
              <h3 className="font-medium text-center">Verificar con biométricos</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                Evaluar el estrés y complejidad percibida por cada miembro
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
