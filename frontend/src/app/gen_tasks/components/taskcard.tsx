"use client"

import { useState } from "react"
import { Clock, Calendar, User, Edit2, Trash2 } from "lucide-react"
import type { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-200 text-gray-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "No deadline"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-[#4A2B4D] line-clamp-1">{task.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>

        <div className="flex flex-wrap gap-y-2">
          <div className="w-1/2 flex items-center text-xs text-gray-500">
            <Clock size={14} className="mr-1" />
            {task.story_points || 0} points
          </div>
          <div className="w-1/2 flex items-center text-xs text-gray-500">
            <Calendar size={14} className="mr-1" />
            {formatDate(task.deadline)}
          </div>
          <div className="w-full flex items-center text-xs text-gray-500 mt-1">
            <User size={14} className="mr-1" />
            {task.assignee || "Unassigned"}
          </div>
        </div>
      </div>

      {/* Action buttons that appear on hover */}
      <div
        className={`border-t border-gray-100 bg-gray-50 p-2 flex justify-end gap-2 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-1 text-gray-500 hover:text-[#4A2B4D] transition-colors"
          aria-label="Edit task"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
