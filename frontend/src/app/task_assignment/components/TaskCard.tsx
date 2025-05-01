"use client"

import { Button } from "@/components/ui/button"
import type { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  isAssigned: boolean
  onAssign: () => void
}

export default function TaskCard({ task, isAssigned, onAssign }: TaskCardProps) {
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "High":
        return <span className="rounded bg-[#ffb8b8] px-2 py-0.5 text-xs font-medium text-[#730101]">high</span>
      case "Medium":
        return <span className="rounded bg-[#ffecb8] px-2 py-0.5 text-xs font-medium text-[#735a01]">medium</span>
      case "Low":
        return <span className="rounded bg-[#b8ffc4] px-2 py-0.5 text-xs font-medium text-[#0d7301]">low</span>
      default:
        return <span className="rounded bg-[#ffecb8] px-2 py-0.5 text-xs font-medium text-[#735a01]">medium</span>
    }
  }

  const getTypeBadge = () => {
    // In a real app, you'd determine if it's a story task or bug task
    return <span className="rounded bg-[#0029f9] px-2 py-0.5 text-xs font-medium text-white">TASK</span>
  }

  return (
    <div className="border border-gray-200 rounded-md p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {getTypeBadge()}
          {getPriorityBadge()}
        </div>
        <span className="text-xs text-gray-500">{task.story_points} points</span>
      </div>
      <h4 className="font-medium mb-1">{task.title}</h4>
      <p className="text-sm text-gray-500 mb-2">{task.description}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {task.user_story_title && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{task.user_story_title}</span>
        )}
      </div>
      {!isAssigned && (
        <Button size="sm" className="w-full bg-[#4a2b4a] text-white hover:bg-[#694969]" onClick={onAssign}>
          Assign
        </Button>
      )}
    </div>
  )
}
