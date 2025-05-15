"use client"

import { useState } from "react"
import { Clock, Calendar, Edit2, Trash2, Circle, Check } from "lucide-react"
import type { Task } from "@/types/task"
import TaskCardMeta from "./taskcardmeta"

interface TaskCardProps {
  task: Task
  editMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onUpdate?: (id: string, data: Partial<Task>) => void
  onSelect?: (id: string, data: Partial<Task>) => void
  userStoryTitle?: string
}

export default function TaskCard({
  task,
  editMode = false,
  onEdit,
  onDelete,
  onUpdate,
  onSelect,
  userStoryTitle,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "To Do":
        return { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" }
      case "In Progress":
        return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" }
      case "In Review":
        return { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" }
      case "Done":
        return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" }
    }
  }

  const getPriorityBadge = (priority: "High" | "Medium" | "Low") => {
  const styles = {
    High: "bg-red-100 text-red-800", 
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  } as const;
    return (
      <span className={`ml-2 rounded-full ${styles[priority]} px-2 py-0.5 text-sm font-medium`}>
        {priority}
      </span>
    );
  }


  const formatDate = (dateString: string) => {
    if (!dateString) return "No deadline"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTopBarColor = (points: number = 0) => {
    if (points <= 2) return "bg-[#ebe5eb]";
    if (points <= 5) return "bg-[#c7a0b8]";
    if (points <= 8) return "bg-[#7d5c85]";
    if (points <= 11) return "bg-[#694969]";
    return "bg-[#4a2b4a]";
  };

  const statusStyle = getStatusStyle(task.status_khanban)

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md  relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(task.id, { selected: !task.selected })}
    >
      {/* Top colored bar */}
      <div className={`h-1.5 w-full ${getTopBarColor(task.story_points)} rounded-t-lg`} />

      {/* Content */}
      <div className="p-4 flex flex-col h-full">
        {/* Header: Title + Priority */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-[#4A2B4D] text-lg line-clamp-1">{task.title}</h3>
          <div className="flex flex-wrap gap-2 items-center">
            {getPriorityBadge(task.priority || "Medium")}
            <span
              className={`px-2 py-0.5 rounded-md border ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text} text-sm font-medium`}
            >
              {task.status_khanban}
            </span>
            <span className={`px-2 py-0.5 rounded-md  ${getTopBarColor(task.story_points)} text-sm font-medium`}>
              {task.story_points || 0} pts
            </span>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-black" />
              <span className="text-sm">{formatDate(task.deadline || "")}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation() 
                onSelect?.(task.id, { selected: !task.selected })
              }}
              className="text-gray-500 hover:text-[#4A2B4D] transition-colors"
              aria-label="Toggle Select Task"
            >
              {task.selected ? (
                <Check size={16} className="text-[#4A2B4A] bg-[#4A2B4A] text-white rounded-full" />
              ) : (
                <Circle size={16} className="text-[#4A2B4A]" />
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-m text-gray-black line-clamp-3 mt-3 mb-3">{task.description}</p>

        {/* Footer: Meta + Deadline centrados */}
        <div className="flex items-center justify-between text-sm text-black gap-4">
          <TaskCardMeta
            createdBy={task.created_by}
            createdDate={task.date_created}
            modifiedBy={task.modified_by}
            modifiedDate={task.date_modified}
            completedBy={task.finished_by}
            completedDate={task.date_completed}
          />
        </div>
      </div>

      {/* Hover actions */}
      {editMode && (
        <div
          className={`absolute bottom-0 left-0 right-0 border-t border-gray-100  p-2 flex justify-end gap-2 `}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="p-1 text-gray-500 hover:text-[#4A2B4D] transition-colors"
            aria-label="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}