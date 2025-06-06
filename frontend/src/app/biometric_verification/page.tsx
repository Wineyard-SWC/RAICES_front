"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { useSprintContext } from "@/contexts/sprintcontext"
import DefaultLoading from "@/components/animations/DefaultLoading"

// Import step components
import DeviceSelection from "./steps/1_DeviceSelection"
import ParticipantSelection from "./steps/2_ParticipantSelection"
import Calibration from "./steps/3_Calibration"
import TaskEvaluation from "./steps/4_TaskEvaluation"
import ResultsAndPool from "./steps/5_ResultsAndPool"
import FinalReview from "./steps/6_FinalReview"
import ParticipantTransition from "./components/ParticipantTransition"

// Types
export interface BiometricData {
  stressLevel: number
  emotion: "Happy" | "Focused" | "Bored" | "Stressed"
  emotionConfidence: number
}

export interface TaskResult {
  taskId: string
  rating: number
  explanation?: string
  biometricData: BiometricData[]
  dominantEmotion: string
  emotionBreakdown: Record<string, number>
  isRisk: boolean
}

export interface ParticipantResult {
  participantId: string
  taskResults: TaskResult[]
  avgStress: number
  dominantEmotion: string
}

export default function BiometricVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId") || ""
  const sprintId = searchParams.get("sprintId") || ""

  // Main flow states
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0)
  const [replacementPool, setReplacementPool] = useState<string[]>([])
  const [participantResults, setParticipantResults] = useState<ParticipantResult[]>([])
  const [showTransition, setShowTransition] = useState(false)

  // Contexts
  const { sprint, tasks } = useSprintContext()

  const updateProgress = () => {
    const totalSteps = 6
    const newProgress = Math.round((currentStep / totalSteps) * 100)
    setProgress(newProgress)
  }

  useEffect(() => {
    updateProgress()
  }, [currentStep])

  if (!sprint) {
    return <DefaultLoading text="biometric verification" />
  }

  const selectedParticipantObjects = sprint.team_members.filter((member) => selectedParticipants.includes(member.id))

  const currentParticipant = selectedParticipantObjects[currentParticipantIndex]

  const handleParticipantComplete = (results: ParticipantResult) => {
    setParticipantResults([...participantResults, results])

    // Add risk tasks to replacement pool
    const riskTasks = results.taskResults.filter((tr) => tr.isRisk).map((tr) => tr.taskId)
    setReplacementPool([...replacementPool, ...riskTasks])

    // Check if there are more participants
    if (currentParticipantIndex < selectedParticipantObjects.length - 1) {
      setShowTransition(true)
    } else {
      setCurrentStep(5) // Go to results
    }
  }

  const handleNextParticipant = () => {
    setShowTransition(false)
    setCurrentParticipantIndex(currentParticipantIndex + 1)
    setCurrentStep(3) // Back to calibration for next participant
  }

  const finishAndReturn = () => {
    router.push(`/sprint_planning?projectId=${projectId}&sprintId=${sprintId}`)
  }

  const stepTitles = ["Devices", "Participants", "Calibration", "Evaluation", "Processing", "Review"]

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#1e1e1e]">Biometric Verification</h1>
            <p className="text-[#694969] mt-2">Evaluate stress and perceived complexity for each team member</p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/task_assignment?projectId=${projectId}&sprintId=${sprintId}`)}
          >
            <X className="h-4 w-4" /> Cancel verification
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Sprint Verification Wizard</h2>
            <span className="text-sm font-medium">{progress}% completed</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" indicatorClassName="bg-[#4a2b4a]" />

          {/* Horizontal Stepper */}
          <div className="flex justify-between mt-4">
            {stepTitles.map((title, index) => {
              const step = index + 1
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      step < currentStep
                        ? "bg-[#4a2b4a] text-white"
                        : step === currentStep
                          ? "bg-[#f0e6f0] border-2 border-[#4a2b4a] text-[#4a2b4a]"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">{title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {showTransition && (
            <ParticipantTransition
              currentParticipant={currentParticipant}
              nextParticipant={selectedParticipantObjects[currentParticipantIndex + 1]}
              onNext={handleNextParticipant}
            />
          )}

          {!showTransition && currentStep === 1 && (
            <DeviceSelection
              selectedDevices={selectedDevices}
              onDeviceToggle={(device) => {
                if (selectedDevices.includes(device)) {
                  setSelectedDevices(selectedDevices.filter((d) => d !== device))
                } else {
                  setSelectedDevices([...selectedDevices, device])
                }
              }}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {!showTransition && currentStep === 2 && (
            <ParticipantSelection
              teamMembers={sprint.team_members}
              tasks={tasks}
              selectedParticipants={selectedParticipants}
              onParticipantToggle={(participantId) => {
                if (selectedParticipants.includes(participantId)) {
                  setSelectedParticipants(selectedParticipants.filter((p) => p !== participantId))
                } else {
                  setSelectedParticipants([...selectedParticipants, participantId])
                }
              }}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {!showTransition && currentStep === 3 && currentParticipant && (
            <Calibration participant={currentParticipant} onComplete={() => setCurrentStep(4)} />
          )}

          {!showTransition && currentStep === 4 && currentParticipant && (
            <TaskEvaluation
              participant={currentParticipant}
              tasks={tasks}
              sprint={sprint}
              replacementPool={replacementPool}
              participantIndex={currentParticipantIndex}
              onComplete={handleParticipantComplete}
            />
          )}

          {!showTransition && currentStep === 5 && (
            <ResultsAndPool
              participantResults={participantResults}
              replacementPool={replacementPool}
              tasks={tasks}
              sprint={sprint}
              onNext={() => setCurrentStep(6)}
            />
          )}

          {!showTransition && currentStep === 6 && (
            <FinalReview
              participantResults={participantResults}
              replacementPool={replacementPool}
              tasks={tasks}
              sprint={sprint}
              onBack={() => setCurrentStep(5)}
              onFinish={finishAndReturn}
            />
          )}
        </div>
      </div>
    </div>
  )
}
