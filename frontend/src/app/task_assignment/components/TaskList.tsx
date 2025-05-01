"use client"

import { Button } from "@/components/ui/button"
import type { Task } from "@/types/task"
import type { SprintMember } from "@/types/sprint"
import Image from "next/image"

interface TaskListProps {
  task: Task
  teamMembers: SprintMember[]
  onAssign: (taskId: string, memberId: string) => void
}

export default function TaskList({ task, teamMembers, onAssign }: TaskListProps) {
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

  // Sort team members by compatibility (in a real app, this would be more sophisticated)
  const sortedMembers = [...teamMembers].sort((a, b) => {
    // Sort by available capacity (descending)
    return b.capacity - b.allocated - (a.capacity - a.allocated)
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {getTypeBadge()}
          {getPriorityBadge()}
          <span className="text-xs text-gray-500">{task.story_points} points</span>
        </div>
        <div className="text-xs text-red-500 font-medium">
          {task.assignee_id ? "Assigned to " + task.assignee : "Unassigned"}
        </div>
      </div>
      <h3 className="font-medium text-lg mb-1">{task.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{task.description}</p>

      <h4 className="font-medium text-sm mb-2">Recommended Team Members</h4>
      <div className="space-y-3">
        {sortedMembers.slice(0, 3).map((member) => {
          const availableHours = member.capacity - member.allocated
          const isHighlyCompatible = availableHours >= (task.story_points || 0) * 2
          const isGoodMatch = availableHours > 0

          return (
            <div key={member.id} className="border border-gray-200 rounded-md p-3 flex items-center">
              <img
                src={member.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
                alt={member.name}
                width={32}
                height={32}
                className="rounded-full mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <h5 className="font-medium">{member.name}</h5>
                  <div
                    className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      isHighlyCompatible
                        ? "bg-[#b8ffc4] text-[#0d7301]"
                        : isGoodMatch
                          ? "bg-[#ffecb8] text-[#735a01]"
                          : "bg-[#ffb8b8] text-[#730101]"
                    }`}
                  >
                    {isHighlyCompatible ? "Highly Compatible" : isGoodMatch ? "Good match" : "Overallocated"}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {member.role} • {availableHours}h available
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                onClick={() => onAssign(task.id, member.id)}
                disabled={availableHours <= 0}
              >
                Assign
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
