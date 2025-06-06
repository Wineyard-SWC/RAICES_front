"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/types/task"
import type { BiometricData, TaskResult, ParticipantResult } from "../page"
import BiometricDisplay from "../components/BiometricDisplay"
import { Textarea } from "@headlessui/react"
import ComplexitySlider from "../components/ComplexitySlider"
import { TaskPacket, useSessionData } from "@/hooks/useSessionData"
import { useMuse } from "@/hooks/useMuse"
import { useBiometricContext } from "@/contexts/BiometricContext"

interface TeamMember {
  id: string
  name: string
}

interface Sprint {
  team_members: TeamMember[]
  user_stories: any[]
}

interface TaskEvaluationProps {
  participant: TeamMember
  tasks: Task[]
  sprint: Sprint
  replacementPool: string[]
  participantIndex: number
  onComplete: (results: ParticipantResult) => void
}

export default function TaskEvaluation({
  participant,
  tasks,
  sprint,
  replacementPool,
  participantIndex,
  onComplete,
}: TaskEvaluationProps) {
  
  const { captureTaskData, submitParticipantSession, isSubmitting } = useSessionData();
  const { pause, resume } = useMuse();
  const { resetRestBaseline } = useBiometricContext();

  // Get participant's tasks + pool tasks for subsequent participants
  const participantTasks = tasks.filter((t) => t.assignee_id === participant.id)
  
  // 🔥 SOLO TAREAS DEL POOL QUE FUERON CALIFICADAS < 4
  const poolTasks = participantIndex > 0 ? tasks.filter((t) => replacementPool.includes(t.id)) : []
  
  const allTasksToEvaluate = [...participantTasks, ...poolTasks]

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [taskReadingTime, setTaskReadingTime] = useState(10)
  const [currentTaskRating, setCurrentTaskRating] = useState(3)
  const [taskExplanation, setTaskExplanation] = useState("")
  const [biometricData, setBiometricData] = useState<BiometricData>({
    stressLevel: 0,
    emotion: "Focused",
    emotionConfidence: 0.8,
  })

  const [taskResults, setTaskResults] = useState<TaskResult[]>([])
  const [capturedTasksData, setCapturedTasksData] = useState<TaskPacket[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanationTime, setExplanationTime] = useState(30)

  // 🔥 NUEVO: Estado para almacenar tareas que van al pool
  const [tasksForPool, setTasksForPool] = useState<string[]>([])

  const currentTask = allTasksToEvaluate[currentTaskIndex]

  // Simulate biometric data
  useEffect(() => {
    const interval = setInterval(() => {
      const emotions: Array<"Happy" | "Focused" | "Bored" | "Stressed"> = ["Happy", "Focused", "Bored", "Stressed"]
      setBiometricData({
        stressLevel: Math.random(),
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        emotionConfidence: 0.6 + Math.random() * 0.4,
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Reading timer
  useEffect(() => {
    if (taskReadingTime === 10) {
      pause();
    }

    if (taskReadingTime > 0) {
      const timer = setTimeout(() => {
        setTaskReadingTime(p => p - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    resume();
  }, [taskReadingTime, pause, resume]);

  useEffect(() => {
    pause();
    setTaskReadingTime(10);
    setShowExplanation(false);
    setExplanationTime(30);
    setCurrentTaskRating(3);
    setTaskExplanation("");
  }, [currentTaskIndex, pause]);

  // Explanation timer
  useEffect(() => {
    if (showExplanation && explanationTime > 0) {
      const timer = setTimeout(() => {
        setExplanationTime((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showExplanation && explanationTime === 0) {
      handleTaskComplete()
    }
  }, [showExplanation, explanationTime])

  const handleTaskComplete = () => {
    const isRisk = currentTaskRating >= 4 || biometricData.stressLevel >= 0.5

    pause();

    // 🔥 AGREGAR AL POOL SI RATING < 4 (tarea difícil/compleja)
    if (currentTaskRating < 4) { // 👈 Cambiar de vuelta a < 4
      setTasksForPool(prev => [...prev, currentTask.id]);
      console.log(`📋 Task "${currentTask.title}" added to replacement pool (rating: ${currentTaskRating}) - Task is complex for this participant`);
    }

    // Capturar datos biométricos
    const taskPacket = captureTaskData(
      currentTask.id,
      currentTask.title,
      currentTaskRating,
      taskExplanation
    );
    
    const updatedCapturedData = [...capturedTasksData, taskPacket];
    setCapturedTasksData(updatedCapturedData);

    // Simulate emotion breakdown
    const emotionBreakdown = {
      Focused: 70,
      Happy: 20,
      Bored: 10,
      Stressed: 0,
    }

    const result: TaskResult = {
      taskId: currentTask.id,
      rating: currentTaskRating,
      explanation: taskExplanation,
      biometricData: [biometricData],
      dominantEmotion: "Focused",
      emotionBreakdown,
      isRisk,
    }

    const newResults = [...taskResults, result]
    setTaskResults(newResults)

    // Move to next task or complete
    if (currentTaskIndex < allTasksToEvaluate.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
      setTaskReadingTime(10)
      setCurrentTaskRating(3)
      setTaskExplanation("")
      setShowExplanation(false)
      setExplanationTime(30)
    } else {
      // 🔥 PASAR LAS TAREAS DEL POOL AL COMPLETAR
      handleParticipantComplete(newResults, updatedCapturedData, tasksForPool);
    }
  }

  // 🔥 MODIFICAR PARA INCLUIR TAREAS DEL POOL
  const handleParticipantComplete = async (
    results: TaskResult[], 
    capturedData: TaskPacket[],
    poolTasks: string[] = []
  ) => {
    // Enviar datos biométricos al backend
    const success = await submitParticipantSession(participant.id, capturedData);
    
    if (success) {
      console.log(`✅ Biometric data submitted for participant ${participant.name}`);
    } else {
      console.error(`❌ Failed to submit biometric data for participant ${participant.name}`);
    }

    // Complete participant evaluation con las tareas del pool
    const participantResult: ParticipantResult = {
      participantId: participant.id,
      taskResults: results,
      avgStress: results.reduce((sum, tr) => sum + tr.biometricData[0].stressLevel, 0) / results.length,
      dominantEmotion: "Focused",
      poolTasks // 🔥 AGREGAR TAREAS DEL POOL
    }
    
    resetRestBaseline();
    console.log("🔄 Biometric context reset for next participant");
    console.log(`📋 Pool tasks for next participants: ${poolTasks.length} tasks`);
    
    onComplete(participantResult);
  }

  const handleRatingComplete = () => {
    if (currentTaskRating < 4) { // 👈 También cambiar aquí a < 4
      setShowExplanation(true)
    } else {
      handleTaskComplete()
    }
  }

  if (!currentTask) return null

  return (
    <div>
      {/* Mostrar indicador de envío */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <p>Sending biometric data...</p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-2">Task Evaluation - {participant.name}</h2>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          Task {currentTaskIndex + 1} of {allTasksToEvaluate.length}
          {poolTasks.length > 0 && currentTaskIndex >= participantTasks.length && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">From replacement pool</span>
          )}
        </p>

        <BiometricDisplay
          biometricData={biometricData}
          showToUser={false}
        />
      </div>

      {/* Task Card */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-medium text-lg mb-2">{currentTask.title}</h3>
        <p className="text-gray-600 mb-4">{currentTask.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                currentTask.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : currentTask.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {currentTask.priority}
            </span>
          </div>

          {taskReadingTime > 0 ? (
            <div className="text-sm text-gray-500">Reading... {taskReadingTime}s</div>
          ) : showExplanation ? (
            <div className="text-sm text-gray-500">Thinking... {explanationTime}s</div>
          ) : (
            <div className="text-sm text-gray-500">Rating phase</div>
          )}
        </div>
      </div>

      {/* Complexity Slider */}
      {taskReadingTime === 0 && !showExplanation && (
        <div className="mb-6">
          <h3 className="font-medium mb-4">How complex does this task seem to you?</h3>
          
          <ComplexitySlider
            value={currentTaskRating}
            onValueChange={setCurrentTaskRating}
            className="mb-6"
          />
          
          <div className="flex justify-end mt-4">
            <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]" onClick={handleRatingComplete}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Explanation Phase */}
      {showExplanation && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Briefly describe the steps to complete this task:</h3>
          <Textarea
            value={taskExplanation}
            onChange={(e) => setTaskExplanation(e.target.value)}
            placeholder="Think about the steps while we monitor your stress levels..."
            className="min-h-[100px]"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">Time remaining: {explanationTime}s</span>
            <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]" onClick={handleTaskComplete}>
              Submit response
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
