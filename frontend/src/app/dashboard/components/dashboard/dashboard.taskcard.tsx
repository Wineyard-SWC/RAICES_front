import { Button } from "@/components/ui/button"
import {
  MoreVertical,
  MessageSquare,
  Eye,
  Trash,
  Bug,
  BookOpen,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Clock,
  Users,
  Link,
  Tag,
} from "lucide-react"
import { Dialog, DialogPanel,DialogTitle } from "@headlessui/react"
import TaskDetailModal from "./dashboard.taskdetails"
import { isBug, TaskOrStory } from "@/types/taskkanban"
import ConfirmDialog from "@/components/confimDialog"
import { useState, useEffect, useRef } from "react"
import { isUserStory } from "@/types/taskkanban"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { useUserPermissions } from "@/contexts/UserPermissions" // Importar hook de permisos

// Definir constantes para los permisos
const PERMISSION_REQ_MANAGE = 1 << 2;  // Gestión de items (crear/editar/eliminar)

interface TaskCardProps {
  task: TaskOrStory;
  columnId: string;
  view?: string;
  usertype?: string;
  onDelete?: (id: string, columid:string) => void;
  onChangeStatus?: (task:TaskOrStory, newStatus:"Backlog" | "To Do" | "In Progress" | "In Review" | "Done") => void;
  onViewDetails?: (task: TaskOrStory) => void; 

}

export const TaskCard = ({ task, columnId, view, usertype, onDelete,onChangeStatus, onViewDetails}: TaskCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangeStatusModal,setShowChangeStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<"Backlog" | "To Do" | "In Progress" | "In Review" | "Done">(task.status_khanban as any);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; columnId: string } | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);


  // Obtener la función hasPermission del contexto
  const { hasPermission } = useUserPermissions();
  
  // Verificar si el usuario tiene los permisos necesarios
  const canManageItems = hasPermission(PERMISSION_REQ_MANAGE);  // Para Delete

  const menuRef = useRef<HTMLDivElement>(null) 

  const {tasks: kanbanTasks} = useKanban();

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  }

  const bugSeverityColors = {
    Blocker: "bg-red-100 text-red-800 border-red-200",
    Critical: "bg-red-100 text-red-800 border-red-200",
    Major: "bg-orange-100 text-orange-800 border-orange-200",
    Minor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Trivial: "bg-green-100 text-green-800 border-green-200",
  }

  const cardTypeColors = {
    UserStory: "border-l-4 border-l-blue-500",
    Bug: "border-l-4 border-l-red-500",
    Task: "border-l-4 border-l-purple-500",
  }

  const getUserStoryTitleByTaskId = (taskId: string): string | null => {
  for (const column of Object.values(kanbanTasks)) {
    for (const item of column) {
      if (isUserStory(item) && Array.isArray(item.task_list)) {
        if (item.task_list.includes(taskId)) {
          return item.title
        }
      }
    }
  }
  return null
}

  const getTaskDetailsByIds = (ids: string[]): { id: string; title: string; status: string }[] => {
    const details: { id: string; title: string; status: string }[] = []
    for (const column of Object.values(kanbanTasks)) {
      for (const item of column) {
        if (!isUserStory(item) && ids.includes(item.id)) {
          details.push({
            id: item.id,
            title: item.title,
            status: item.status_khanban
          })
        }
      }
    }
    return details
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  const isOverdue = (deadline?: string) => {
    return deadline ? new Date(deadline) < new Date() : false
  }
   
  const getCardType = () => {
    if (isUserStory(task)) return "UserStory"
    if (isBug(task)) return "Bug"
    return "Task"
  }
  
  const cardType = getCardType()


  const statusColorMap: Record<string, string> = {
    Backlog: "bg-green-100 text-green-800",
    "To Do": "bg-blue-100 text-blue-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "In Review": "bg-purple-100 text-purple-800",
    Done: "bg-orange-100 text-orange-800"
  }

  const handleViewDetails = () => {
    setMenuOpen(false);
    if (onViewDetails) {
      onViewDetails(task);
    }
  };

  const handleViewDetailsFromMenu = () => {
    setMenuOpen(false);
    
    if (view === "backlog" && onViewDetails) {
      onViewDetails(task);
    }
    else {
      setShowModal(true);
    }
  };

  const handleCardClick = () => {
    if (view === "dashboard") {
      setShowModal(true);
    }
    else if (view === "backlog" && onViewDetails) {
      onViewDetails(task);
    }
    else {
      setShowModal(true);
    }
  };

  type RawAssignee = { users: [string,string] } | [string,string]

  function normalizeAssignees(raw?: RawAssignee[]): { users: [string,string] }[] {
    if (!raw) return []
    return raw.map(item => {
      if (Array.isArray(item)) {
        return { users: item }
      }
      return item
    })
  } 

  const assignees = normalizeAssignees(task.assignee)


   return (
    <div
      className={`hover:bg-[#EBE5EB] cursor-pointer bg-white rounded-md p-5 shadow-sm 
                    ${cardTypeColors[cardType]} border-t border-r border-b border-[#D3C7D3] 
                    mb-4 relative transition-all duration-200 hover:shadow-md w-full h-full`}
    
      onClick={handleCardClick}
    >
      {/* Card Type Indicator */}
      <div
        className="absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-md rounded-tr-md 
                    flex items-center gap-1.5"
        style={{
          backgroundColor: cardType === "UserStory" ? "#EBF5FF" : cardType === "Bug" ? "#FFF1F0" : "#F3E8FF",
          color: cardType === "UserStory" ? "#1E40AF" : cardType === "Bug" ? "#B91C1C" : "#6B21A8",
        }}
      >
        {cardType === "UserStory" && <BookOpen className="h-3.5 w-3.5" />}
        {cardType === "Bug" && <Bug className="h-3.5 w-3.5" />}
        {cardType === "Task" && <CheckSquare className="h-3.5 w-3.5" />}
        <span>{cardType}</span>
      </div>

      <div className="absolute right-2 top-8 mt-1" ref={menuRef}>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}>
          <MoreVertical className="h-5 w-5" />
        </Button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20">
            {/* View Details siempre está disponible para todos los usuarios */}
            <button
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#4A2B4A] hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetailsFromMenu();
              }}
            >
              <Eye className="h-4 w-4" /> View Details
            </button>

            {/* Change Status solo si tiene permiso ITEM_REVIEW */}
            {canManageItems && (
              <button
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#4A2B4A] hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setShowChangeStatusModal(true);
                }}
              >
                <CheckSquare className="h-4 w-4" /> Change Status
              </button>
            )}

            {/* Delete solo si tiene permiso REQ_MANAGE y no está en dashboard */}
            {view !== "dashboard" && canManageItems && (
              <button
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setTimeout(() => {
                    setItemToDelete({ id: task.id, columnId });
                    setShowDeleteConfirm(true);
                  }, 0);
                }}
              >
                <Trash className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Título */}
      <h2 className="font-semibold text-gray-900 pr-6 text-lg mb-2 mt-5">{task.title}</h2>

      {/* Descripcion */}
      <div className="mt-2 mb-3">
        <span className="text-sm text-gray-700">{task.description}</span>
      </div>

      {/* Info adicional */}
      <div className="text-sm text-gray-600 mt-3 space-y-2.5">
        {/* Asignado */}
        {Array.isArray(assignees) && assignees.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Assigned to:</span> {assignees[0].users[1]}
          </div>
        )}

        {/* User Story relacionada si es Task */}
        {!isUserStory(task) && !isBug(task) && (
          <div className="flex items-center gap-1.5">
            <Link className="h-4 w-4 text-gray-500" />
            <span className="font-medium">User Story:</span>
            <em className="text-blue-700">{task.user_story_title || getUserStoryTitleByTaskId(task.id) || "—"}</em>
          </div>
        )}

        {/* Lista de tareas relacionadas si es UserStory */}
        {isUserStory(task) && Array.isArray(task.task_list) && task.task_list.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-medium flex items-center gap-1.5 mb-1">
              <CheckSquare className="h-4 w-4 text-gray-500" /> Linked Tasks:
            </div>
            <ul className="space-y-1 text-sm text-gray-700 pl-1">
              {getTaskDetailsByIds(task.task_list).map((t) => (
               <li key={t.id} className="flex items-center gap-2">
                <span className={t.status === "Done" ? "line-through text-gray-500" : ""}>
                  {t.title}
                </span>
                {t.status === "Done" && <CheckSquare className="h-4 w-4 text-green-600" />}
              </li>
              ))}
            </ul>
          </div>
        )}

        {/* Si es un bug, mostrar info adicional */}
        {isBug(task) && (
          <div className="space-y-2 mt-2 bg-red-50 p-3 rounded-md">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium">Bug Status:</span> {task.bug_status}
            </div>

            {task.severity && (
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-red-600" />
                <span className="font-medium">Severity:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${bugSeverityColors[task.severity]}`}>
                  {task.severity}
                </span>
              </div>
            )}

            {task.affectedComponents && task.affectedComponents.length > 0 && (
              <div className="flex items-start gap-1.5">
                <Tag className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium">Affects:</span>
                  <span className="text-gray-700">{task.affectedComponents.join(", ")}</span>
                </div>
              </div>
            )}

            {task.relatedBugs && task.relatedBugs.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Link className="h-4 w-4 text-red-600" />
                <span className="font-medium">Related Bugs:</span> {task.relatedBugs.length}
              </div>
            )}

            {task.visibleToCustomers && (
              <div className="flex items-center gap-1.5 text-red-600 font-medium">
                <AlertTriangle className="h-4 w-4" /> Visible to Customers
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badges y metadata */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex flex-col gap-1.5">
          {/* Fecha */}
          {"date" in task && task.date && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{task.date}</span>
            </div>
          )}

          {/* Deadline */}
          {"deadline" in task && task.deadline && (
            <div className={`flex items-center gap-1.5 ${isOverdue(task.deadline) ? "text-red-600" : "text-gray-600"}`}>
              <Clock className="h-4 w-4" />
              <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}

          {/* Fecha de resolución (bugs) */}
          {isBug(task) && task.finishedAt && (
            <div className="flex items-center gap-1.5 text-green-700">
              <CheckSquare className="h-4 w-4" />
              <span>Resolved: {new Date(task.finishedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Comentarios */}
          {Array.isArray(task.comments) && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">{task.comments.length}</span>
            </div>
          )}

          {/* Puntos */}
          {"story_points" in task && (
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
              {task.story_points} pts
            </span>
          )}
          {"points" in task && (
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
              {task.points} pts
            </span>
          )}

          {/* Status */}
          <span
            className={`px-2.5 py-1 rounded-full text-sm font-medium border ${statusColorMap[task.status_khanban!] || "bg-gray-100 text-gray-800 border-gray-200"}`}
          >
            {task.status_khanban}
          </span>

          {/* Prioridad */}
          <span className={`px-2.5 py-1 rounded-full text-sm font-medium border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Modal y confirmación */}
      {showModal && <TaskDetailModal open={showModal} task={task} onClose={() => setShowModal(false)} />}

      {showChangeStatusModal && canManageItems && (
        <Dialog open={showChangeStatusModal} onClose={() => {
          setShowChangeStatusModal(false)
          setWarningMessage(null)
        }} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-[#F5F0F1] rounded-lg shadow-lg p-6 w-full max-w-lg">
              <DialogTitle className="text-xl font-semibold text-[#4A2B4A] mb-4">
                Change Task Status
              </DialogTitle>

              <label className="block text-black mb-2 font-medium">Select New Status:</label>
              <select
                aria-label="status select"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value as
                      | "Backlog"
                      | "To Do"
                      | "In Progress"
                      | "In Review"
                      | "Done"
                  )
                }
                className="w-full bg-white px-4 py-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>

              {warningMessage && (
                <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
                  {warningMessage}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowChangeStatusModal(false)
                    setWarningMessage(null)
                  }}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
                  onClick={async () => {
                    try {
                      if (
                        isUserStory(task) &&
                        Array.isArray(task.task_list) &&
                        (selectedStatus === "Done" || selectedStatus === "In Review")
                      ) {
                        const pendingTasks = task.task_list
                          .map(taskId =>
                            Object.values(kanbanTasks)
                              .flat()
                              .find(t => t.id === taskId && t.status_khanban !== "Done")
                          )
                          .filter(Boolean)

                        if (pendingTasks.length > 0) {
                          setWarningMessage("⚠️ You must complete all linked tasks before progressing this User Story.")
                          return
                        }
                      }

                      if (task && onChangeStatus) {
                        await onChangeStatus(task, selectedStatus)
                      }

                      setShowChangeStatusModal(false)
                      setWarningMessage(null)
                    } catch (err) {
                      console.error("Error updating status:", err)
                    }
                  }}
                >
                  Confirm
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
      
      {showDeleteConfirm && itemToDelete && canManageItems && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          onCancel={() => {
            setShowDeleteConfirm(false)
            setItemToDelete(null)
          }}
          onConfirm={() => {
            if (itemToDelete && onDelete) {
              onDelete(itemToDelete.id, itemToDelete.columnId)
            }
            setShowDeleteConfirm(false)
            setItemToDelete(null)
          }}
        />
      )}
    </div>
  )
}