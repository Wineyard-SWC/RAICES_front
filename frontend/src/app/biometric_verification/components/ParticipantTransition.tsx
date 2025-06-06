"use client"

import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

interface TeamMember {
  id: string
  name: string
}

interface ParticipantTransitionProps {
  currentParticipant: TeamMember
  nextParticipant?: TeamMember
  onNext: () => void
}

export default function ParticipantTransition({
  currentParticipant,
  nextParticipant,
  onNext,
}: ParticipantTransitionProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Evaluation Complete</h2>
      <p className="text-gray-600 mb-6">{currentParticipant.name}'s evaluation has been completed successfully.</p>

      {nextParticipant ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="font-medium mr-2">Next participant:</span>
            <ArrowRight className="h-4 w-4 mx-2 text-blue-600" />
            <span className="font-medium">{nextParticipant.name}</span>
          </div>
          <p className="text-sm text-blue-600">
            Please ensure {nextParticipant.name} is ready to begin their evaluation.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">All participants have completed their evaluations.</p>
        </div>
      )}

      <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]" onClick={onNext}>
        {nextParticipant ? `Start ${nextParticipant.name}'s evaluation` : "View results"}
      </Button>
    </div>
  )
}
