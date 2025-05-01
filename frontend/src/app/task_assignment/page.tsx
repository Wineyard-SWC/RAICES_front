"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ArrowLeft, Users, ListFilter, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/NavBar"
import LoadingScreen from "@/components/animations/loading"
import { useSprintContext } from "@/contexts/sprintcontext"
import type { Task } from "@/types/task"
import { Progress } from "@/components/progress"

export default function TaskAssignmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId =
    searchParams.get("projectId") || (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) || ""
  const sprintId = searchParams.get("sprintId") || ""

  const safeSprintId = sprintId?.startsWith("temp-") ? "" : sprintId;

  // Sprint context
  const { sprint, tasks, setTasks } = useSprintContext()

  // UI state
  const [taskFilter, setTaskFilter] = useState<"all" | "unassigned" | "assigned">("all")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  if (!sprint) return <LoadingScreen isLoading generationType="tasks" />

  // Calculate total story points in the sprint for workload distribution
  const totalSprintPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0)
  
  const isUnassigned = (id?: string | null) => !id || id === "0";

  const filteredTasks = tasks.filter(task => {
    /* 1. estado asignación ------------------------------------------ */
    if (taskFilter === "assigned"   && isUnassigned(task.assignee_id)) return false;
    if (taskFilter === "unassigned" && !isUnassigned(task.assignee_id)) return false;
        
    /* 2. miembro (solo cuando se muestran *solo* asignadas) ---------- */
    if (taskFilter === "assigned" && selectedMember) {
      if (task.assignee_id !== selectedMember) return false;
    }
  
    /* 3. búsqueda ---------------------------------------------------- */
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
  
  // Calculate assignment progress
  const totalTasks = tasks.length
  const assignedTasksCount = tasks.filter((t) => t.assignee_id).length
  const assignmentProgress = totalTasks > 0 ? Math.round((assignedTasksCount / totalTasks) * 100) : 0

  // Calculate workload for each team member
  const teamWorkload = sprint.team_members.map((member) => {
    // Get tasks assigned to this member
    const memberTasks = tasks.filter((t) => t.assignee_id === member.id)

    // Calculate points assigned to this member
    const assignedPoints = memberTasks.reduce((sum, task) => sum + (task.story_points || 0), 0)

    // Calculate workload percentage (based on total sprint points)
    const workloadPercentage = totalSprintPoints > 0 ? Math.round((assignedPoints / totalSprintPoints) * 100) : 0

    // Determine workload status
    let statusColor = "bg-[#4a2b4a]"
    let statusBg = "bg-[#f5f0f1]"
    let statusText = "text-gray-700"
    let compatibility = "high"

    if (workloadPercentage > 40) {
      statusColor = "bg-red-500"
      statusBg = "bg-red-100"
      statusText = "text-red-700"
      compatibility = "low"
    } else if (workloadPercentage > 30) {
      statusColor = "bg-yellow-500"
      statusBg = "bg-yellow-100"
      statusText = "text-yellow-700"
      compatibility = "medium"
    }

    return {
      ...member,
      assignedPoints,
      workloadPercentage,
      statusColor,
      statusBg,
      statusText,
      compatibility,
    }
  })

  // Assign a task to a team member
  const assignTask = (taskId: string, memberId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, assignee_id: memberId, sprint_id: sprint?.id } : t)))
    setAssignModalOpen(false)
    setTaskToAssign(null)
  }

  // Open the assignment modal
  const openAssignModal = (task: Task) => {
    if (selectedMember && taskFilter === "unassigned") {
      assignTask(task.id, selectedMember);   // one-click assign
    } else {
      setTaskToAssign(task);
      setAssignModalOpen(true);
    }
    };

  // Remove assignment from a task
  const removeAssignment = (taskId: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, assignee_id: undefined } : t)))
  }

  // Save assignments and return to sprint planning
  const saveAssignments = async () => {
    // In a real app, you'd save the assignments to your backend
    // For now, we'll just navigate back
    router.push(`/sprint_planning?projectId=${projectId}${safeSprintId ? `&sprintId=${safeSprintId}` : ""}`)
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
              <div className="text-xs text-gray-500">View tasks for all team members</div>
            </button>

            {teamWorkload.map((member) => (
              <button
                key={member.id}
                className={`flex-shrink-0 rounded-lg border ${selectedMember === member.id ? "border-[#4a2b4a] bg-[#f5f0f1]" : "border-gray-200 bg-white"} p-3 min-w-[200px]`}
                onClick={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
              >
                <div className="flex items-center gap-2">
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
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Workload:</span>
                    <span className={member.workloadPercentage > 40 ? "text-red-600 font-medium" : ""}>
                      {member.assignedPoints} points ({member.workloadPercentage}%)
                    </span>
                  </div>
                  <Progress
                    value={member.workloadPercentage}
                    className={`h-2 ${member.statusBg}`}
                    indicatorClassName={member.statusColor}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Task List with Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="font-medium flex items-center">
              <ListFilter className="h-4 w-4 mr-2" /> Tasks
              {selectedMember && (
                <span className="ml-2 text-sm text-gray-500">
                  for {sprint.team_members.find((m) => m.id === selectedMember)?.name}
                </span>
              )}
            </h2>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-9 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={taskFilter === "all" ? "default" : "outline"}
                  size="sm"
                  className={taskFilter === "all" ? "bg-[#4a2b4a] text-white" : ""}
                  onClick={() => setTaskFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={taskFilter === "unassigned" ? "default" : "outline"}
                  size="sm"
                  className={taskFilter === "unassigned" ? "bg-[#4a2b4a] text-white" : ""}
                  onClick={() => setTaskFilter("unassigned")}
                >
                  Unassigned
                </Button>
                <Button
                  variant={taskFilter === "assigned" ? "default" : "outline"}
                  size="sm"
                  className={taskFilter === "assigned" ? "bg-[#4a2b4a] text-white" : ""}
                  onClick={() => setTaskFilter("assigned")}
                >
                  Assigned
                </Button>
              </div>
            </div>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-700">No tasks found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const assignedMember = sprint.team_members.find((m) => m.id === task.assignee_id)

                return (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                              {task.user_story_title}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        {assignedMember ? (
                          <div className="flex items-center gap-2 bg-[#f5f0f1] rounded-md px-3 py-1">
                            <img
                              src={assignedMember.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
                              alt={assignedMember.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span className="text-sm">{assignedMember.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                              onClick={() => removeAssignment(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
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
                )
              })}
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

            <h4 className="font-medium mb-2">Select Team Member</h4>
            <div className="space-y-2">
              {teamWorkload.map((member) => {
                // Calculate new workload if this task is assigned
                const newPoints = member.assignedPoints + (taskToAssign.story_points || 0)
                const newPercentage = totalSprintPoints > 0 ? Math.round((newPoints / totalSprintPoints) * 100) : 0
                const wouldOverload = newPercentage > 40

                return (
                  <button
                    key={member.id}
                    className={`w-full text-left border rounded-md p-3 hover:bg-gray-50 transition-colors ${
                      wouldOverload ? "border-red-300" : "border-gray-200"
                    }`}
                    onClick={() => assignTask(taskToAssign.id, member.id)}
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
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
