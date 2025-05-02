"use client"

import { useState } from "react"
import { Clock, Calendar, Edit2, Trash2 } from "lucide-react"
import type { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  editMode?: boolean
  onEdit?: () => void
  onDelete?: () => void
  userStoryTitle?: string
}

export default function TaskCard({
  task,
  editMode = false,
  onEdit,
  onDelete,
  userStoryTitle,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // GitHub Projects–style status colors
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs font-medium">
            High
          </span>
        )
      case "Medium":
        return (
          <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">
            Medium
          </span>
        )
      case "Low":
        return (
          <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
            Low
          </span>
        )
      default:
        return (
          <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium">
            {priority}
          </span>
        )
    }
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

  const statusStyle = getStatusStyle(task.status)

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top colored bar */}
      <div className={`h-1.5 w-full ${statusStyle.bg} rounded-t-lg`} />

      {/* Content area */}
      <div className="p-4 flex flex-col justify-between h-full">
        {/* Title and description */}
        <div>
          <h3 className="font-medium text-[#4A2B4D] line-clamp-1 mb-2">{task.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {getPriorityBadge(task.priority || "Medium")}
            {userStoryTitle && (
              <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-medium truncate max-w-[150px]">
                {userStoryTitle}
              </span>
            )}
          </div>
        </div>

        {/* Footer metrics and status badge */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              {task.story_points || 0} points
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {formatDate(task.deadline || "")}
            </div>
          </div>
          {/* Status badge moved to bottom right */}
          <div className="flex justify-end">
            <span
              className={`px-2 py-0.5 rounded-md border ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text} text-xs font-medium`}
            >
              {task.status}
            </span>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      {editMode && (
        <div
          className={`border-t border-gray-100 bg-gray-50 p-2 flex justify-end gap-2 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit && onEdit()
            }}
            className="p-1 text-gray-500 hover:text-[#4A2B4D] transition-colors"
            aria-label="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete && onDelete()
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
