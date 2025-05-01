"use client"

import Image from "next/image"
import { Progress } from "@/components/progress"
import type { SprintMember } from "@/types/sprint"
import type { Task } from "@/types/task"
import TaskCard from "./TaskCard"

interface TeamMemberTaskListProps {
  member: SprintMember
  tasks: Task[]
  availableTasks: Task[]
  onAssignTask: (taskId: string, memberId: string) => void
}

export default function TeamMemberTaskList({ member, tasks, availableTasks, onAssignTask }: TeamMemberTaskListProps) {
  const usedPercentage = Math.min(100, Math.round((member.allocated / member.capacity) * 100))

  // Get compatibility level for display
  const getCompatibilityBadge = () => {
    if (usedPercentage > 90) {
      return (
        <div className="inline-block bg-[#ffb8b8] text-[#730101] text-xs px-2 py-0.5 rounded mb-3">Overallocated</div>
      )
    } else if (usedPercentage > 70) {
      return (
        <div className="inline-block bg-[#ffecb8] text-[#735a01] text-xs px-2 py-0.5 rounded mb-3">
          Moderately Allocated
        </div>
      )
    } else {
      return <div className="inline-block bg-[#b8ffc4] text-[#0d7301] text-xs px-2 py-0.5 rounded mb-3">Available</div>
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={member.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
          alt={member.name}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h3 className="font-medium">{member.name}</h3>
          <p className="text-sm text-gray-500">{member.role}</p>
        </div>
        <div
          className={`ml-auto text-xs px-2 py-0.5 rounded ${
            usedPercentage > 90
              ? "bg-[#ffb8b8] text-[#730101]"
              : usedPercentage > 70
                ? "bg-[#ffecb8] text-[#735a01]"
                : "bg-[#b8ffc4] text-[#0d7301]"
          }`}
        >
          {usedPercentage}% allocated
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Capacity: {member.capacity}h</span>
          <span>
            {member.allocated}h used ({member.capacity - member.allocated}h available)
          </span>
        </div>
        <Progress
          value={usedPercentage}
          className="h-2 bg-gray-200"
          indicatorClassName={
            usedPercentage > 90 ? "bg-red-500" : usedPercentage > 70 ? "bg-yellow-500" : "bg-[#4a2b4a]"
          }
        />
      </div>

      {getCompatibilityBadge()}
      <p className="text-xs text-gray-500 mb-3">
        {usedPercentage > 90
          ? "This team member is overallocated"
          : usedPercentage > 70
            ? "This team member is nearing capacity"
            : "Best matches based on skills and role"}
      </p>

      {/* Assigned Tasks */}
      {tasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Assigned Tasks</h4>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} isAssigned={true} onAssign={() => {}} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tasks */}
      {availableTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Recommended Tasks</h4>
          <div className="space-y-3">
            {availableTasks.slice(0, 3).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isAssigned={false}
                onAssign={() => onAssignTask(task.id, member.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
