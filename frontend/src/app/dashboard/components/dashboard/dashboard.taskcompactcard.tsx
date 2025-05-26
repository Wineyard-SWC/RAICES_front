"use client"

import { useState, useEffect, useRef } from "react"
import {
  MoreVertical,
  MessageSquare,
  Eye,
  Trash,
  Bug,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Users,
  Link,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { isBug, isTask, isUserStory, TaskOrStory } from "@/types/taskkanban"
import { useKanban } from "@/contexts/unifieddashboardcontext"

interface TaskCardCompactViewProps {
  task: TaskOrStory
  columnId: string
  view?: string
  usertype?: string
  compact?: boolean
  onDelete?: (id: string, columnId: string) => void
  onChangeStatus?: (task: TaskOrStory, newStatus: "Backlog" | "To Do" | "In Progress" | "In Review" | "Done") => void
  onViewDetails?: (task: TaskOrStory) => void
}

export const TaskCardCompactView = ({
  task,
  columnId,
  view,
  usertype,
  compact,
  onDelete,
  onChangeStatus,
  onViewDetails,
}: TaskCardCompactViewProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(task.status_khanban as any);
  const menuRef = useRef<HTMLDivElement>(null);
  const {tasks: kanbanTasks} = useKanban();

  
  const priorityColors = {
    Low: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    High: "bg-red-100 text-red-800 border-red-200",
  };
  
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
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleCardClick = () => {
    if (view === "dashboard") setShowChangeStatusModal(true)
    else if (view === "backlog" && onViewDetails) onViewDetails(task)
    else setShowChangeStatusModal(true)
  }

  const normalizeAssignees = (raw?: any[]) => {
    if (!raw) return []
    return raw.map((item) => (Array.isArray(item) ? { users: item } : item))
  }

  const assignees = normalizeAssignees(task.assignee)
  const cardType = isUserStory(task) ? "UserStory" : isBug(task) ? "Bug" : "Task"
  const getPoints = () => (isUserStory(task) ? task.points : isBug(task) ? 0 : task.story_points)

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 hover:shadow-md hover:border-gray-300 cursor-pointer relative" onClick={handleCardClick}>
      <div className="flex items-center justify-between w-full mb-3">
        {/* Tipo de tarjeta + puntos y prioridad */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700">
            {cardType === "UserStory" && <BookOpen className="h-3 w-3" />}
            {cardType === "Bug" && <Bug className="h-3 w-3" />}
            {cardType === "Task" && <CheckSquare className="h-3 w-3" />}
            <span>{cardType}</span>
          </div>

          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium border border-blue-200">
            {getPoints()} pts
          </span>

          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded-md shadow-lg z-20">
              <button 
              className="flex items-center gap-2 w-full px-3 py-2 text-lg text-gray-700 hover:bg-gray-100" 
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onViewDetails?.(task) }}>
                <Eye className="h-4 w-4" /> View Details
              </button>
              <button 
              className="flex items-center gap-2 w-full px-3 py-2 text-lg text-gray-700 hover:bg-gray-100" 
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShowChangeStatusModal(true) }}>
                <CheckSquare className="h-4 w-4" /> Change Status
              </button>
              {view !== "dashboard" && (
                <button 
                className="flex items-center gap-2 w-full px-3 py-2 text-lg text-red-600 hover:bg-gray-100" 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(task.id, columnId) }}>
                  <Trash className="h-4 w-4" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">{task.title}</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          {assignees.length > 0 && (<><Users className="h-3 w-3" /><span>{assignees[0].users[1]}</span></>)}
          {assignees.length === 0 && <span>Not assigned</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {expanded && ( 
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">        
          <p className="text-md text-gray-600 mb-3 line-clamp-2">{task.description}</p>

          {Array.isArray(task.comments) && task.comments.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Comments:</span>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-gray-700">{task.comments.length}</span>
              </div>
            </div>
          )}
          {!isUserStory(task) && !isBug(task) && (
            <div className="flex items-center gap-1.5">
              <Link className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">User Story:</span>
              <em className="text-sm text-black-700">{task.user_story_title || getUserStoryTitleByTaskId(task.id) || "—"}</em>
            </div>
          )}

          {isUserStory(task) && Array.isArray(task.task_list) && task.task_list.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium flex items-center gap-1.5 mb-1">
                <CheckSquare className="h-4 w-4 text-gray-500" /> Linked Tasks:
              </div>
              <ul className="space-y-1 text-sm text-gray-700 pl-1">
                {getTaskDetailsByIds(task.task_list).map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <span className={t.status === "Done" ? "line-through text-gray-500" : ""}>{t.title}</span>
                    {t.status === "Done" && <CheckSquare className="h-4 w-4 text-green-600" />}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showChangeStatusModal && (
        <Dialog open={showChangeStatusModal} onClose={() => setShowChangeStatusModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">Change Status</DialogTitle>
              <select 
                aria-label="Change Status"
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value as any)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4">
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowChangeStatusModal(false)}>Cancel</Button>
                <Button onClick={() => { onChangeStatus?.(task, selectedStatus); setShowChangeStatusModal(false) }}>Confirm</Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  )
}
