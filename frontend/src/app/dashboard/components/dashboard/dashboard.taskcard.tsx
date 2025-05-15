import { Button } from "@/components/ui/button"
import { MoreVertical, MessageSquare,Eye,Trash } from "lucide-react"
import TaskDetailModal from "./dashboard.taskdetails"
import { TaskOrStory } from "@/types/taskkanban"
import ConfirmDialog from "@/components/confimDialog"
import { useState, useEffect, useRef } from "react"
import { isUserStory } from "@/types/taskkanban"
import { useKanban } from "@/contexts/unifieddashboardcontext"


interface TaskCardProps {
  task: TaskOrStory;
  columnId: string;
  view?: string;
  usertype?: string;
  onDelete?: (id: string, columid:string) => void;
}

export const TaskCard = ({ task, columnId, view, usertype, onDelete}: TaskCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; columnId: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null) 

  const {tasks: kanbanTasks} = useKanban();

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
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

const getTasksTitlesByIds = (ids: string[]): string[] => {
  const foundTitles: string[] = []
  for (const column of Object.values(kanbanTasks)) {
    for (const item of column) {
      if (!isUserStory(item) && ids.includes(item.id)) {
        foundTitles.push(item.title)
      }
    }
  }
  return foundTitles
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
   

  const statusColorMap: Record<string, string> = {
    Backlog: "bg-green-100 text-green-800",
    "To Do": "bg-blue-100 text-blue-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "In Review": "bg-purple-100 text-purple-800",
    Done: "bg-orange-100 text-orange-800"
  }

  return (
    <div className="hover:bg-[#EBE5EB] cursor-pointer bg-white rounded-md p-4 shadow-sm border border-[#D3C7D3] mb-3 relative">
      <div className="absolute right-2 top-2" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#4A2B4A] hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false)
                setTimeout(() => setShowModal(true), 0)
              }}
            >
              <Eye className="h-4 w-4" /> View Details
            </button>

            {view !== "dashboard" && (
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false)
                  setTimeout(() => {
                    setItemToDelete({ id: task.id, columnId })
                    setShowDeleteConfirm(true)
                  }, 0)
                }}
              >
                <Trash className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Título */}
      <h2 className="font-medium text-gray-900 pr-6">{task.title}</h2>
       {/* Descripcion */}
      <div className=" mt-1">
        <span className="text-sm font-medium text-gray-900 pr-6">{task.description}</span>
      </div>
      
      {/* Info adicional */}
      <div className="text-xs text-gray-600 mt-1 space-y-1">
        {/* Asignado */}
        {Array.isArray(task.assignee) && task.assignee.length > 0 && (
          <div>Assigned to: <strong>{task.assignee[0].users[1]}</strong></div>
        )}

        {/* User Story relacionada si es Task */}
        {!isUserStory(task) && (
          <div>
            User Story: <em>{task.user_story_title || getUserStoryTitleByTaskId(task.id) || "—"}</em>
          </div>
        )}

        {/* Lista de tareas relacionadas si es UserStory */}
        {isUserStory(task) && Array.isArray(task.task_list) && task.task_list.length > 0 && (
          <div>
            <div className="text-xs text-gray-600">Linked Tasks:</div>
            <ul className="list-disc list-inside text-xs text-gray-800">
              {getTasksTitlesByIds(task.task_list).map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tipo */}
        <div className="text-blue-600 font-semibold">
          {isUserStory(task) ? "User Story" : "Task"}
        </div>
      </div>


      {/* Badges y metadata */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex flex-col gap-1">
          {/* Fecha */}
          {"date" in task && task.date && (
            <span>{task.date}</span>
          )}

          {/* Deadline */}
          {"deadline" in task && task.deadline && (
            <span className={isOverdue(task.deadline) ? "text-red-500" : ""}>
              Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Comentarios */}
          {Array.isArray(task.comments) && (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Puntos */}
          {"story_points" in task && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {task.story_points} pts
            </span>
          )}
          {/* Puntos */}
          {"points" in task && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {task.points} pts
            </span>
          )}

          {/* Status */}
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            {task.status_khanban}
          </span>

          {/* Prioridad */}
          <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Modal y confirmación */}
      {showModal && (
        <TaskDetailModal open={showModal} task={task} onClose={() => setShowModal(false)} />
      )}

      {showDeleteConfirm && itemToDelete && (
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