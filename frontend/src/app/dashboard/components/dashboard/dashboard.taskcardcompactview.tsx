"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
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
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { isBug, isTask, isUserStory, TaskOrStory } from "@/types/taskkanban"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { getAssigneeName } from "../../utils/secureAssigneeFormat"

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
  const cardRef = useRef<HTMLDivElement>(null);
  const {tasks: kanbanTasks } = useKanban();
  const [expandedPosition, setExpandedPosition] = useState({ top: 0, left: 0, width: 0 });

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

  const calculateExpandedPosition = () => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const expandedWidth = 400; 
    
    let left = rect.left;
    let top = rect.top;

    if (left + expandedWidth > viewportWidth - 20) {
      left = viewportWidth - expandedWidth - 20;
    }
    
    if (top + 300 > viewportHeight - 20) { 
      top = Math.max(20, viewportHeight - 320);
    }

    setExpandedPosition({
      top: top + window.scrollY,
      left: Math.max(20, left),
      width: rect.width
    });
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expanded) {
      calculateExpandedPosition();
    }
    setExpanded(!expanded);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleCardClickexpand = () => {
    if (view === "dashboard") setShowChangeStatusModal(true)
    else if (view === "backlog" && onViewDetails) onViewDetails(task)
    else setShowChangeStatusModal(true)
  }

  const normalizeAssignees = (raw?: any[]) => {
    if (!raw || !Array.isArray(raw)) return []
    
    return raw.map((item) => {
      // Si ya tiene el formato correcto { users: [id, name] }
      if (item && typeof item === 'object' && 'users' in item && Array.isArray(item.users)) {
        return item
      }
      // Si es una tupla [id, name]
      if (Array.isArray(item) && item.length >= 2) {
        return { users: [item[0], item[1]] }
      }
      // Si es un objeto { id, name }
      if (item && typeof item === 'object' && 'id' in item && 'name' in item) {
        return { users: [item.id, item.name] }
      }
      if (typeof item === 'string') {
        return { users: [item, item] }
      }
      // Fallback para datos inválidos
      return null
    }).filter(Boolean) // Eliminar elementos nulos
  }

  const assignees = normalizeAssignees(task.assignee)
  
  const getFirstAssigneeName = () => {
    if (!task.assignee || !Array.isArray(task.assignee) || task.assignee.length === 0) {
      return null;
    }
    
    return getAssigneeName(task.assignee[0]);
  }

  const cardType = isUserStory(task) ? "UserStory" : isBug(task) ? "Bug" : "Task"
  const getPoints = () => (isUserStory(task) ? task.points : isBug(task) ? 0 : task.story_points)


   const ExpandedCard = () => (
    <div 
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-300 p-6 z-50 max-w-md"
      style={{
        top: `${expandedPosition.top}px`,
        left: `${expandedPosition.left}px`,
        minWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header con botón cerrar */}
      <div className="flex items-center justify-between mb-4">
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
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => setExpanded(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Título */}
      <h3 className="font-semibold text-gray-900 text-lg mb-3">{task.title}</h3>

      {/* Descripción */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Description:</h4>
        <p className="text-md text-gray-600">{task.description || "No description provided."}</p>
      </div>

      {/* Assignees */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned to:</h4>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          {(() => {
            const assigneeName = getFirstAssigneeName();
            if (assigneeName) {
              return (
                <>
                  <Users className="h-3 w-3" />
                  <span>{assigneeName}</span>
                  {assignees.length > 1 && (
                    <span className="ml-1 text-xs">+{assignees.length - 1} more</span>
                  )}
                </>
              )
            }
            return <span className="text-gray-500 italic">Not assigned</span>
          })()}
        </div>
      </div>

      {/* Comments */}
      {Array.isArray(task.comments) && task.comments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Comments:</h4>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-gray-500" />
              <span className="text-sm text-gray-700">{task.comments.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* User Story Link para Tasks y Bugs */}
      {!isUserStory(task) && !isBug(task) && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5">
            <Link className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">User Story:</span>
            <em className="text-sm text-gray-600">{task.user_story_title || getUserStoryTitleByTaskId(task.id) || "Not linked"}</em>
          </div>
        </div>
      )}

      {/* Linked Tasks para User Stories */}
      {isUserStory(task) && Array.isArray(task.task_list) && task.task_list.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
            <CheckSquare className="h-4 w-4 text-gray-500" /> Linked Tasks:
          </div>
          <ul className="space-y-2 text-sm">
            {getTaskDetailsByIds(task.task_list).map((t) => (
              <li key={t.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className={t.status === "Done" ? "line-through text-gray-500" : "text-gray-700 flex-1"}>
                  {t.title}
                </span>
                {t.status === "Done" && <CheckSquare className="h-4 w-4 text-green-600" />}
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setExpanded(false); onViewDetails?.(task); }}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setExpanded(false); setShowChangeStatusModal(true); }}
          className="flex-1"
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Change Status
        </Button>
      </div>
    </div>
  );


  return (
    <>
    <div 
      ref={cardRef}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 hover:shadow-md hover:border-gray-300 cursor-pointer relative"
      onClick={handleCardClickexpand}
      >
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
          {(() => {
            const assigneeName = getFirstAssigneeName();
            if (assigneeName) {
              return (
                <>
                  <Users className="h-3 w-3" />
                  <span>{assigneeName}</span>
                  {assignees.length > 1 && (
                    <span className="ml-1 text-xs">+{assignees.length - 1}</span>
                  )}
                </>
              )
            }
            return <span>Not assigned</span>
          })()}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>

      {expanded && typeof window !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setExpanded(false)}
          />
          <ExpandedCard />
        </>,
        document.body
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
    </>
  )
}