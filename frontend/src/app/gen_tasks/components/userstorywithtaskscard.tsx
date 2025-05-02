"use client"

import type React from "react"

import { useState } from "react"
import type { Task } from "@/types/task"
import TaskCard from "./taskcard"
import { ChevronDown, ChevronUp, Plus } from "lucide-react"

interface UserStoryWithTasksCardProps {
  id: string
  title: string
  tasks: Task[]
  editMode: boolean
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
  onAddTask: () => void
}

const UserStoryWithTasksCard: React.FC<UserStoryWithTasksCardProps> = ({
  id,
  title,
  tasks,
  editMode,
  onUpdate,
  onDelete,
  onEdit,
  onAddTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-[#F5F0F1] rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-gray-200"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-[#4A2B4D]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#4A2B4D]" />
            )}
          </button>
          <h2 className="text-lg font-semibold text-[#4A2B4D]">{title}</h2>
        </div>

        {editMode && (
          <button onClick={onAddTask} className="flex items-center gap-1 text-sm text-[#4A2B4D] hover:underline">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                editMode={editMode}
                onUpdate={() => {onUpdate}}
                onDelete={() => {onDelete}}
                onEdit={() => {onEdit}}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No tasks for this user story yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default UserStoryWithTasksCard
