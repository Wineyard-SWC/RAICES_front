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
import { print, printError } from "@/utils/debugLogger"

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
  
  // 🔥 SOLO TAREAS DEL POOL QUE FUERON CALIFICADAS 1-3 (necesitan revisión)
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

  // 🔥 NUEVO: Estado para almacenar tareas que van al pool (calificación 1-3)
  const [tasksForNextParticipants, setTasksForNextParticipants] = useState<string[]>([])

  // 🔥 NUEVOS ESTADOS PARA FASE INFORMATIVA
  const [showInfoPhase, setShowInfoPhase] = useState(true);
  const [infoTime, setInfoTime] = useState(20);
  const [isInfoActive, setIsInfoActive] = useState(true);

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

  // 🔥 USEEFFECT PARA MANEJAR COUNTDOWN DE INFORMACIÓN
  useEffect(() => {
    if (isInfoActive && infoTime > 0) {
      const timer = setTimeout(() => {
        setInfoTime((prevTime) => {
          print(`ℹ️ Task info time remaining: ${prevTime - 1}s`);
          
          if (prevTime <= 1) {
            // Terminar fase informativa y empezar evaluación
            setShowInfoPhase(false);
            setIsInfoActive(false);
            setTaskReadingTime(10);
            return 0;
          }
          
          return prevTime - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInfoActive, infoTime]);

  // Reading timer
  useEffect(() => {
    if (showInfoPhase || isInfoActive) return; // No empezar si estamos en fase info

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
  }, [taskReadingTime, pause, resume, showInfoPhase, isInfoActive]);

  useEffect(() => {
    if (showInfoPhase || isInfoActive) return; // No resetear durante info phase
    
    pause();
    setTaskReadingTime(10);
    setShowExplanation(false);
    setExplanationTime(30);
    setCurrentTaskRating(3);
    setTaskExplanation("");
  }, [currentTaskIndex, pause, showInfoPhase, isInfoActive]);

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
    // 🔥 CAMBIO PRINCIPAL: Solo enviar al pool si calificación es 1, 2 o 3
    const needsReview = currentTaskRating <= 3; // ≤ 3 necesita revisión
    const isRisk = currentTaskRating <= 3 || biometricData.stressLevel >= 0.5 // 🔥 Corregir lógica de riesgo

    pause();

    // 🔥 SOLO AGREGAR AL POOL PARA PRÓXIMOS PARTICIPANTES SI RATING ≤ 3
    if (needsReview) {
      // Solo agregar si es tarea propia del participante (no del pool)
      const isOwnTask = participantTasks.some(task => task.id === currentTask.id);
      
      if (isOwnTask) {
        setTasksForNextParticipants(prev => [...prev, currentTask.id]);
        print(`📋 Task "${currentTask.title}" added to review pool (rating: ${currentTaskRating}) - Will be evaluated by next participants`);
      } else {
        print(`📋 Pool task "${currentTask.title}" still needs review (rating: ${currentTaskRating}) - Already in pool`);
      }
    } else {
      print(`✅ Task "${currentTask.title}" well assigned (rating: ${currentTaskRating}) - No further review needed`);
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
      // 🔥 COMBINAR POOL ACTUAL + NUEVAS TAREAS QUE NECESITAN REVISIÓN
      const finalPoolForNextParticipants = [...new Set([
        ...replacementPool.filter(taskId => {
          // Mantener tareas del pool que SIGUEN necesitando revisión (≤ 3)
          const poolTaskResult = newResults.find(r => r.taskId === taskId);
          return poolTaskResult ? poolTaskResult.rating <= 3 : true;
        }),
        ...tasksForNextParticipants // Agregar nuevas tareas que necesitan revisión
      ])];
      
      handleParticipantComplete(newResults, updatedCapturedData, finalPoolForNextParticipants);
    }
  }

  // 🔥 MODIFICAR PARA INCLUIR TAREAS DEL POOL FILTRADAS
  const handleParticipantComplete = async (
    results: TaskResult[], 
    capturedData: TaskPacket[],
    poolTasksForNext: string[] = []
  ) => {
    // Enviar datos biométricos al backend
    const success = await submitParticipantSession(participant.id, capturedData);
    
    if (success) {
      print(`✅ Biometric data submitted for participant ${participant.name}`);
    } else {
      printError(`❌ Failed to submit biometric data for participant ${participant.name}`);
    }

    // 🔥 FILTRAR SOLO TAREAS QUE AÚN NECESITAN REVISIÓN
    const tasksStillNeedingReview = poolTasksForNext.filter(taskId => {
      const taskResult = results.find(r => r.taskId === taskId);
      return taskResult ? taskResult.rating <= 3 : true; // Si no se evaluó, mantener en pool
    });

    // Complete participant evaluation con las tareas filtradas
    const participantResult: ParticipantResult = {
      participantId: participant.id,
      taskResults: results,
      avgStress: results.reduce((sum, tr) => sum + tr.biometricData[0].stressLevel, 0) / results.length,
      dominantEmotion: "Focused",
      poolTasks: tasksStillNeedingReview // 🔥 SOLO TAREAS QUE SIGUEN NECESITANDO REVISIÓN
    }
    
    resetRestBaseline();
    print("🔄 Biometric context reset for next participant");
    print(`📋 Tasks still needing review for next participants: ${tasksStillNeedingReview.length} tasks`);
    print(`📊 Breakdown: ${tasksForNextParticipants.length} new + ${tasksStillNeedingReview.length - tasksForNextParticipants.length} from previous pool`);
    
    onComplete(participantResult);
  }

  const handleRatingComplete = () => {
    // 🔥 CAMBIO: Solo pedir explicación si calificación ≤ 3
    if (currentTaskRating <= 3) {
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
      
      {showInfoPhase ? (
        // 🔥 NUEVA FASE INFORMATIVA ANTES DE TASK EVALUATION
        <div className="text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 rounded-full bg-purple-50 flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="h-16 w-16 text-purple-600" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Task Evaluation Instructions
            </h3>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <p className="text-lg text-purple-900 leading-relaxed mb-4">
                You will now evaluate tasks that have been assigned to you. Please read each task carefully 
                and consider how well it matches your skills and comfort level.
              </p>
              
              <div className="text-sm text-purple-700 space-y-2">
                <p>
                  <strong>What to do:</strong> Rate each task from 1 (very difficult/poor match) to 5 (perfect fit for your skills)
                </p>
                <p>
                  <strong>Take your time:</strong> You'll have time to read each task thoroughly before rating it
                </p>
                <p>
                  <strong>Be honest:</strong> Your feedback helps optimize task assignments for everyone
                </p>
                {poolTasks.length > 0 && (
                  <p>
                    <strong>Note:</strong> You'll also review {poolTasks.length} task(s) that need reassignment evaluation
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-6xl font-bold text-purple-600 mb-4">{infoTime}s</div>
            
            <p className="text-gray-600 mb-6">
              Task evaluation will begin automatically when the countdown reaches zero.
            </p>
            
            {/* 🔥 BOTÓN PARA SALTAR INSTRUCCIONES */}
            <Button 
              onClick={() => {
                // Terminar fase informativa inmediatamente
                setShowInfoPhase(false);
                setIsInfoActive(false);
                setTaskReadingTime(10);
                setInfoTime(0);
              }}
              className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2"
            >
              Skip Instructions - Start Task Evaluation Now
            </Button>
            
            <div className="mt-6 text-sm text-gray-500">
              Total tasks to evaluate: <strong>{allTasksToEvaluate.length}</strong>
            </div>
            
            <div className="mt-2 text-sm text-gray-400">
              Click above if you're familiar with the evaluation process
            </div>
          </div>
        </div>
      ) : (
        // Existing task evaluation UI
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Task {currentTaskIndex + 1} of {allTasksToEvaluate.length}
              {poolTasks.length > 0 && currentTaskIndex >= participantTasks.length && (
                <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Needs Review (from previous evaluations)
                </span>
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
              <div className="flex items-center gap-2">
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
                
                {/* 🔥 MOSTRAR SI ES TAREA PROPIA O DEL POOL */}
                {poolTasks.some(task => task.id === currentTask.id) && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    Review Task
                  </span>
                )}
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
              <h3 className="font-medium mb-4">How suitable is this task assignment for you?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Rate from 1 (very difficult/poorly matched) to 5 (perfect fit for my skills)
              </p>
              
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

          {/* Explanation Phase - Solo si calificación ≤ 3 */}
          {showExplanation && (
            <div className="mb-6">
              {/* 🔥 CARD SEPARADA PARA LA EXPLICACIÓN */}
              <div className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <h3 className="font-medium text-lg text-gray-900">
                    Why do you feel this task is challenging for you?
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Your feedback will help us find a better match for this task. Please be specific about 
                  what makes this task difficult or unsuitable for your current skills and experience.
                </p>
                
                {/* 🔥 TEXTAREA MÁS GRANDE Y VISIBLE */}
                <div className="mb-4">
                  <Textarea
                    value={taskExplanation}
                    onChange={(e) => setTaskExplanation(e.target.value)}
                    placeholder="Example: 'This task requires advanced knowledge of React Native which I haven't worked with yet' or 'The timeline seems too tight for the complexity involved'..."
                    className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-lg resize-none 
                               focus:border-orange-500 focus:ring-2 focus:ring-orange-200 
                               bg-white text-gray-900 placeholder-gray-400 text-sm leading-relaxed
                               shadow-inner"
                    rows={6}
                  />
                  
                  {/* 🔥 CONTADOR DE CARACTERES */}
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{taskExplanation.length} characters</span>
                    <span>Optional but helpful for optimization</span>
                  </div>
                </div>
                
                {/* 🔥 TIMER Y BOTÓN MÁS PROMINENTES */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-orange-600">
                      Time remaining: {explanationTime}s
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    {/* 🔥 BOTÓN PARA SALTAR SI NO QUIERE DAR FEEDBACK */}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setTaskExplanation("No specific feedback provided");
                        handleTaskComplete();
                      }}
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Skip Feedback
                    </Button>
                    
                    <Button 
                      className="bg-orange-600 text-white hover:bg-orange-700 px-6"
                      onClick={handleTaskComplete}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* 🔥 TIPS ADICIONALES */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Helpful feedback examples:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• "Requires technologies I'm not familiar with (e.g., specific frameworks)"</li>
                  <li>• "Timeline seems unrealistic for the scope of work"</li>
                  <li>• "Dependencies on other tasks that might create bottlenecks"</li>
                  <li>• "Complexity level doesn't match my current experience"</li>
                </ul>
              </div>
            </div>
          )}

          {/* 🔥 DEBUG INFO (remover en producción) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
              <div>Current participant tasks: {participantTasks.length}</div>
              <div>Pool tasks to review: {poolTasks.length}</div>
              <div>Tasks marked for next participants: {tasksForNextParticipants.length}</div>
            </div>
          )} */}
        </>
      )}
    </div>
  )
}
