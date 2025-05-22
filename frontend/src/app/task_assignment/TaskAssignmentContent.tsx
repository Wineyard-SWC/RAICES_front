"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ArrowLeft, Users, ListFilter, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/NavBar"

import { useSprintContext } from "@/contexts/sprintcontext"
import type { Task } from "@/types/task"
import { Progress } from "@/components/progress"
import DefaultLoading from "@/components/animations/DefaultLoading"

export default function TaskAssignmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId =
    searchParams.get("projectId") || (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) || ""
  const sprintId = searchParams.get("sprintId") || ""

  const safeSprintId = sprintId?.startsWith("temp-") ? "" : sprintId;

  // UI state
  const [taskFilter, setTaskFilter] = useState<"all" | "unassigned" | "assigned">("all")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [selectedMemberName, setselectedMemberName] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Sprint context
  const { sprint, tasks, setTasks } = useSprintContext()

  if (!sprint) return <DefaultLoading text="tasks and members" />

  // 1) Extraer sólo las tareas de las historias seleccionadas
  const sprintTasks = tasks.filter(t =>
    sprint.user_stories.some(us => us.selected && us.id === t.user_story_id)
  )

  // 2) Calcular puntos totales basados en sprintTasks
  const totalSprintPoints = sprintTasks.reduce((sum, t) => sum + (t.story_points || 0), 0)

  // 3) Filtrar por estado, asignación y búsqueda
  const filteredTasks = sprintTasks.filter((task) => {
    // filtro unassigned
    if (taskFilter === "unassigned" && task.assignee_id) return false
    // filtro assigned
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
  const assignedTasksCount = sprintTasks.filter(t => t.assignee_id).length
  const assignmentProgress = totalTasks > 0 ? Math.round((assignedTasksCount / totalTasks) * 100) : 0

  // 5) Cargar capacidad de cada miembro según sprintTasks
  const teamWorkload = sprint.team_members.map(member => {
    const memberTasks = sprintTasks.filter(t => t.assignee_id === member.id)
    const assignedPoints = memberTasks.reduce((sum, t) => sum + (t.story_points || 0), 0)
    const workloadPercentage = totalSprintPoints > 0
      ? Math.round((assignedPoints / totalSprintPoints) * 100)
      : 0
    
    return {
      ...member,
      assignedPoints,
      workloadPercentage
    }
  })

  // Abrir modal de asignación
  const openAssignModal = (task: Task) => {
    setTaskToAssign(task)
    setAssignModalOpen(true)
  }

  // Asignar tarea a miembro
  const assignTaskToMember = (taskId: string, memberId: string, memberName: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, assignee_id: memberId, assignee: [memberId, memberName] } : t
    ))
    setAssignModalOpen(false)
    setTaskToAssign(null)
  }

  // Remover asignación
  const removeAssignment = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, assignee_id: undefined, assignee: undefined } : t
    ))
  }

  // Guardar y volver a planificación
  const saveAssignments = () => {
    router.push(
      `/sprint_planning?projectId=${projectId}${safeSprintId ? `&sprintId=${safeSprintId}` : ``}`
    )
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
          <Link href={`/sprint_planning?projectId=${projectId}${safeSprintId ? `&sprintId=${safeSprintId}` : ""}`} passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Sprint Planning
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">Assignment Progress</h2>
            <span className="text-sm text-gray-500">
              {assignedTasksCount} of {totalTasks} tasks assigned ({assignmentProgress}%)
            </span>
          </div>
          <Progress value={assignmentProgress} className="h-2 bg-gray-200" indicatorClassName="bg-[#4a2b4a]" />
        </div>

        {/* Team Members Horizontal Scroll */}
        <div className="mb-6">
          <h2 className="font-medium mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" /> Team Members
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            <button
              className={`flex-shrink-0 rounded-lg border ${selectedMember === null ? "border-[#4a2b4a] bg-[#f5f0f1]" : "border-gray-200 bg-white"} p-3 min-w-[200px]`}
              onClick={() => setSelectedMember(null)}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                <div className="font-medium">All Members</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Tasks:</span>
                  <span className="font-medium">{sprintTasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Assigned:</span>
                  <span className="font-medium">{assignedTasksCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Unassigned:</span>
                  <span className="font-medium">{sprintTasks.length - assignedTasksCount}</span>
                </div>
              </div>
            </button>

            {teamWorkload.map((member) => (
              <button
                key={member.id}
                className={`flex-shrink-0 rounded-lg border ${selectedMember === member.id ? "border-[#4a2b4a] bg-[#f5f0f1]" : "border-gray-200 bg-white"} p-3 min-w-[200px]`}
                onClick={() => {
                  if (selectedMember === member.id) {
                    setSelectedMember(null)
                    setselectedMemberName(null)
                  } else {
                    setSelectedMember(member.id)
                    setselectedMemberName(member.name)
                  }
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={member.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
                    alt={member.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Workload:</span>
                    <span className="font-medium">{member.workloadPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tasks:</span>
                    <span className="font-medium">{sprintTasks.filter(t => t.assignee_id === member.id).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Points:</span>
                    <span className="font-medium">{member.assignedPoints}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Task Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-1 items-center bg-white rounded-lg border border-gray-200 px-3 py-2">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              type="text"
              placeholder="Search tasks..."
              className="border-0 focus-visible:ring-0 p-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 flex">
            <Button
              variant="ghost"
              className={`${taskFilter === "all" ? "bg-[#f5f0f1] text-[#4a2b4a]" : ""}`}
              onClick={() => setTaskFilter("all")}
            >
              All
            </Button>
            <Button
              variant="ghost"
              className={`${taskFilter === "unassigned" ? "bg-[#f5f0f1] text-[#4a2b4a]" : ""}`}
              onClick={() => setTaskFilter("unassigned")}
            >
              Unassigned
            </Button>
            <Button
              variant="ghost"
              className={`${taskFilter === "assigned" ? "bg-[#f5f0f1] text-[#4a2b4a]" : ""}`}
              onClick={() => setTaskFilter("assigned")}
            >
              Assigned
            </Button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium flex items-center">
              <ListFilter className="h-5 w-5 mr-2" />
              {taskFilter === "all" && "All Tasks"}
              {taskFilter === "unassigned" && "Unassigned Tasks"}
              {taskFilter === "assigned" && "Assigned Tasks"}
              {selectedMember && selectedMemberName && ` for ${selectedMemberName}`}
            </h2>
            <span className="text-sm text-gray-500">{filteredTasks.length} tasks</span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No tasks match your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-[#f5f0f1] transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="rounded bg-[#0029f9] px-2 py-0.5 text-xs font-medium text-white">TASK</span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-[#ffb8b8] text-[#730101]"
                              : task.priority === "Medium"
                                ? "bg-[#ffecb8] text-[#735a01]"
                                : "bg-[#b8ffc4] text-[#0d7301]"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.story_points} points</span>
                      </div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      {task.user_story_title && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            Story: {task.user_story_title}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end items-center">
                      {task.assignee_id ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{task.assignee?.[1] || "Assigned"}</span>
                            <img
                              src={teamWorkload.find(m => m.id === task.assignee_id)?.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
                              alt={task.assignee?.[1] || "Assigned"}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-200"
                              onClick={() => removeAssignment(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                          onClick={() => openAssignModal(task)}
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]" onClick={saveAssignments}>
            Complete Assignment & Return to Planning
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
                className="h-8 w-8 p-0"
                onClick={() => {
                  setAssignModalOpen(false)
                  setTaskToAssign(null)
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium">{taskToAssign.title}</h4>
              <p className="text-sm text-gray-500">{taskToAssign.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded bg-[#0029f9] px-2 py-0.5 text-xs font-medium text-white">TASK</span>
                <span className="text-xs text-gray-500">{taskToAssign.story_points} points</span>
              </div>
            </div>

            <h4 className="font-medium mb-2">Team Members</h4>
            <div className="space-y-3">
              {teamWorkload.map((member) => {
                const memberTasks = sprintTasks.filter(t => t.assignee_id === member.id)
                const assignedPoints = memberTasks.reduce((sum, t) => sum + (t.story_points || 0), 0)
                const newPoints = assignedPoints + (taskToAssign.story_points || 0)
                const newPercentage = totalSprintPoints > 0
                  ? Math.round((newPoints / totalSprintPoints) * 100)
                  : 0
                const wouldOverload = newPercentage > 100
                
                return (
                  <div
                    key={member.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-[#f5f0f1] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Current: {member.workloadPercentage}%</span>
                              <span>
                                +{taskToAssign.story_points} points
                                {wouldOverload && <span className="text-red-500 ml-1">(overload)</span>}
                              </span>
                            </div>
                            <Progress
                              value={newPercentage}
                              className="h-2 bg-gray-200"
                              indicatorClassName={wouldOverload ? "bg-red-500" : "bg-[#4a2b4a]"}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                        onClick={() => assignTaskToMember(taskToAssign.id, member.id, member.name)}
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}