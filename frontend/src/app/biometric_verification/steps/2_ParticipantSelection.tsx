"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/types/task"

interface TeamMember {
  id: string
  name: string
}

interface ParticipantSelectionProps {
  teamMembers: TeamMember[]
  tasks: Task[]
  selectedParticipants: string[]
  onParticipantToggle: (participantId: string) => void
  onBack: () => void
  onNext: () => void
}

export default function ParticipantSelection({
  teamMembers,
  tasks,
  selectedParticipants,
  onParticipantToggle,
  onBack,
  onNext,
}: ParticipantSelectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Participant Selection</h2>
      <p className="text-gray-600 mb-6">Select team members who will participate in biometric verification.</p>

      <div className="space-y-3 mb-8">
        {teamMembers.map((member) => {
          const memberTasks = tasks.filter((t) => t.assignee_id === member.id)

          return (
            <div
              key={member.id}
              onClick={() => onParticipantToggle(member.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedParticipants.includes(member.id) ? "border-[#4a2b4a] bg-[#f5f0f5]" : "hover:border-[#4a2b4a]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox checked={selectedParticipants.includes(member.id)} className="mr-3" />
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-500">{memberTasks.length} assigned tasks</p>
                  </div>
                </div>

                {memberTasks.length === 0 && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">No tasks</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
          disabled={selectedParticipants.length === 0}
          onClick={onNext}
        >
          Start calibration
        </Button>
      </div>
    </div>
  )
}
