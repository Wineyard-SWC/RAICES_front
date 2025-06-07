"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/settings/components/ui/card"
import { Loader2, AlertTriangle, CheckCircle, UserCheck, ArrowRight, TrendingDown, TrendingUp, Star, X } from "lucide-react"
import { useSessionRelation } from "@/hooks/useSessionRelation"
import { useSessionResults } from "../hooks/useSessionResults"
import { useEmotionUtils } from "../hooks/useEmotionUtils"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
import type { Session } from "../hooks/useSessionResults"
import { print } from "@/utils/debugLogger"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

interface TaskRecommendation {
  task_id: string
  task_name: string
  current_assignee: {
    user_id: string
    name: string
    avatar_url: string
    stress_level: number
    emotion: string
    complexity_rating: number
    explanation: string
  }
  alternative_assignees: Array<{
    user_id: string
    name: string
    avatar_url: string
    stress_level: number
    emotion: string
    complexity_rating: number
    compatibility_score: number
    reason: string
    performance_summary: string
  }>
  recommendation_strength: 'high' | 'medium' | 'low'
  reason: string
}

interface FinalReviewProps {
  participantResults: any[]
  replacementPool: string[]
  tasks: any[]
  sprint: any
  onBack: () => void
  onFinish: (reassignments?: TaskReassignment[]) => void // 🔥 Agregar parámetro opcional
}

// 🔥 NUEVA INTERFACE PARA LAS REASIGNACIONES
interface TaskReassignment {
  taskId: string
  taskName: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  reason: string
  improvementData: {
    ratingImprovement: number
    stressReduction: number
    compatibilityScore: number
  }
}

export default function FinalReview({
  participantResults,
  replacementPool,
  tasks,
  sprint,
  onBack,
  onFinish,
}: FinalReviewProps) {
  const { sessionRelationId } = useSessionRelation()
  const { data, loading: sessionLoading } = useSessionResults(sessionRelationId)
  const { getEmotionEmoji, getStressLevel } = useEmotionUtils()
  
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set())
  const [isApplying, setIsApplying] = useState(false)

  // 🔥 NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [pendingReassignments, setPendingReassignments] = useState<{
    reassignments: TaskReassignment[]
    reassignmentsList: string[]
  }>({ reassignments: [], reassignmentsList: [] })

  // Generar recomendaciones basadas en los datos biométricos
  useEffect(() => {
    if (!sessionRelationId || !data || !data.sessions.length) return

    const generateRecommendations = () => {
      setLoadingRecommendations(true)
      
      try {
        const taskRecommendations: TaskRecommendation[] = []
        
        // 🔥 FILTRAR TAREAS ÚNICAS POR NOMBRE PARA EVITAR DUPLICADOS
        const uniqueTasksInPool = replacementPool
          .map(taskId => tasks.find(t => t.id === taskId))
          .filter(Boolean) // Remover nulls
          .filter((task, index, array) => 
            // Solo mantener la primera ocurrencia de cada nombre de tarea
            array.findIndex(t => t.title === task.title) === index
          )

        print(`🔍 Processing ${uniqueTasksInPool.length} unique tasks from ${replacementPool.length} pool tasks`)
        
        // 🔥 SOLO ANALIZAR TAREAS ÚNICAS DEL POOL DE REVISIÓN (calificadas ≤ 3)
        uniqueTasksInPool.forEach(task => {
          if (!task) return
          
          // Encontrar quién tiene la tarea asignada actualmente
          const currentAssignee = sprint.team_members.find(m => m.id === task.assignee_id)
          if (!currentAssignee) return
          
          // Encontrar la sesión del asignado actual
          const currentSession = data.sessions.find(s => s.user_firebase_id === currentAssignee.id)
          if (!currentSession) return
          
          // 🔥 BUSCAR LA TAREA POR NOMBRE en lugar de ID (para manejar múltiples evaluaciones)
          const currentTaskEvaluation = currentSession.tasks.find(t => {
            const taskFromList = tasks.find(taskItem => taskItem.id === t.task_id)
            return taskFromList && taskFromList.title === task.title
          })
          if (!currentTaskEvaluation) return
          
          // 🔥 SOLO PROCESAR SI CALIFICACIÓN ≤ 3 (necesita reasignación)
          if (currentTaskEvaluation.complexity_rating > 3) {
            print(`✅ Task "${task.title}" well assigned (rating: ${currentTaskEvaluation.complexity_rating}) - Skipping`)
            return
          }

          print(`📋 Analyzing task "${task.title}" for reassignment (rating: ${currentTaskEvaluation.complexity_rating})`)
          
          // 🔥 BUSCAR ALTERNATIVAS: todos los que evaluaron una tarea con el mismo NOMBRE
          const alternatives = data.sessions
            .filter(session => session.user_firebase_id !== currentAssignee.id) // No el actual
            .map(session => {
              // Buscar si esta persona evaluó una tarea con el mismo nombre
              const taskEval = session.tasks.find(t => {
                const taskFromList = tasks.find(taskItem => taskItem.id === t.task_id)
                return taskFromList && taskFromList.title === task.title // 🔥 Comparar por nombre
              })
              if (!taskEval) return null
              
              const teamMember = sprint.team_members.find(m => m.id === session.user_firebase_id)
              if (!teamMember) return null
              
              // 🔥 CALCULAR SCORE MEJORADO basado en rendimiento real
              const currentRating = currentTaskEvaluation.complexity_rating
              const altRating = taskEval.complexity_rating
              const currentStress = currentTaskEvaluation.normalized_stress
              const altStress = taskEval.normalized_stress
              
              let compatibilityScore = 0
              let reason = ""
              let performanceSummary = ""
              
              // Mayor peso a mejor calificación
              if (altRating > currentRating) {
                const ratingDiff = altRating - currentRating
                compatibilityScore += ratingDiff * 0.3 // 30% por cada punto de diferencia
                reason += `Rated ${ratingDiff} points higher (${altRating}/5 vs ${currentRating}/5). `
                performanceSummary += `${ratingDiff}+ rating improvement`
              }
              
              // Menor estrés es mejor
              if (altStress < currentStress) {
                const stressDiff = currentStress - altStress
                compatibilityScore += stressDiff * 0.4 // 40% peso al estrés
                reason += `${Math.round(stressDiff * 100)}% less stress. `
                performanceSummary += performanceSummary ? `, ${Math.round(stressDiff * 100)}% less stress` : `${Math.round(stressDiff * 100)}% less stress`
              }
              
              // Emoción positiva suma puntos
              const hasPositiveEmotion = ['Happy', 'Relaxed', 'Calm', 'Excited', 'Focused'].includes(taskEval.emotion_label)
              if (hasPositiveEmotion) {
                compatibilityScore += 0.2
                reason += `Showed positive emotion (${taskEval.emotion_label.toLowerCase()}). `
                performanceSummary += performanceSummary ? `, positive emotion` : `Positive emotion`
              }
              
              // Bonus si calificación es 4 o 5 (muy buena)
              if (altRating >= 4) {
                compatibilityScore += 0.1
                reason += "High task suitability. "
                performanceSummary += performanceSummary ? `, excellent fit` : `Excellent fit`
              }
              
              return {
                user_id: session.user_firebase_id,
                name: session.user_name,
                avatar_url: session.user_avatar_url,
                stress_level: taskEval.normalized_stress,
                emotion: taskEval.emotion_label,
                complexity_rating: taskEval.complexity_rating,
                compatibility_score: Math.min(compatibilityScore, 1),
                reason: reason.trim(),
                performance_summary: performanceSummary || "Similar performance"
              }
            })
            .filter(Boolean)
            .filter(alt => alt.compatibility_score > 0.1) // Solo mejores opciones
            .sort((a, b) => {
              // Ordenar primero por calificación, luego por score total
              if (a.complexity_rating !== b.complexity_rating) {
                return b.complexity_rating - a.complexity_rating
              }
              return b.compatibility_score - a.compatibility_score
            })
            .slice(0, 3) // Top 3 alternativas
          
          if (alternatives.length === 0) {
            print(`❌ No better alternatives found for task "${task.title}"`)
            return
          }
          
          // 🔥 DETERMINAR FUERZA DE RECOMENDACIÓN basada en mejora real
          const bestAlternative = alternatives[0]
          const ratingImprovement = bestAlternative.complexity_rating - currentTaskEvaluation.complexity_rating
          const stressImprovement = currentTaskEvaluation.normalized_stress - bestAlternative.stress_level
          
          let strength: 'high' | 'medium' | 'low' = 'low'
          if (ratingImprovement >= 2 && stressImprovement > 0.3) strength = 'high'
          else if (ratingImprovement >= 1 && stressImprovement > 0.2) strength = 'medium'
          else if (ratingImprovement >= 1 || stressImprovement > 0.1) strength = 'low'
          
          // 🔥 USAR NOMBRE DE TAREA COMO ID ÚNICO PARA EVITAR DUPLICADOS
          const recommendation: TaskRecommendation = {
            task_id: `unique-${task.title.replace(/\s+/g, '-').toLowerCase()}`, // 🔥 ID único basado en nombre
            task_name: task.title,
            current_assignee: {
              user_id: currentAssignee.id,
              name: currentSession.user_name,
              avatar_url: currentSession.user_avatar_url,
              stress_level: currentTaskEvaluation.normalized_stress,
              emotion: currentTaskEvaluation.emotion_label,
              complexity_rating: currentTaskEvaluation.complexity_rating,
              explanation: currentTaskEvaluation.explanation || "No specific feedback provided"
            },
            alternative_assignees: alternatives,
            recommendation_strength: strength,
            reason: `Current assignee rated this task ${currentTaskEvaluation.complexity_rating}/5 and showed ${Math.round(currentTaskEvaluation.normalized_stress * 100)}% stress. Better matches available.`
          }
          
          taskRecommendations.push(recommendation)
          print(`✅ Generated recommendation for task "${task.title}" with ${alternatives.length} alternatives`)
        })
        
        // Ordenar por fuerza de recomendación y mejora potencial
        const sortedRecommendations = taskRecommendations.sort((a, b) => {
          const strengthOrder = { high: 3, medium: 2, low: 1 }
          if (strengthOrder[a.recommendation_strength] !== strengthOrder[b.recommendation_strength]) {
            return strengthOrder[b.recommendation_strength] - strengthOrder[a.recommendation_strength]
          }
          // Si misma fuerza, ordenar por mayor mejora de calificación
          const aImprovement = a.alternative_assignees[0]?.complexity_rating - a.current_assignee.complexity_rating
          const bImprovement = b.alternative_assignees[0]?.complexity_rating - b.current_assignee.complexity_rating
          return bImprovement - aImprovement
        })
        
        setRecommendations(sortedRecommendations)
        print(`🎯 Generated ${sortedRecommendations.length} unique recommendations for tasks needing reassignment`)
        
      } catch (error) {
        console.error("Error generating recommendations:", error)
      } finally {
        setLoadingRecommendations(false)
      }
    }

    generateRecommendations()
  }, [sessionRelationId, data, replacementPool, tasks, sprint.team_members])

  // Alternar selección de recomendación
  const toggleRecommendation = (taskId: string, newAssigneeId: string) => {
    const key = `${taskId}-${newAssigneeId}`
    const newSelected = new Set(selectedRecommendations)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      // Remover otras selecciones para la misma tarea
      Array.from(newSelected).forEach(selectedKey => {
        if (selectedKey.startsWith(`${taskId}-`)) {
          newSelected.delete(selectedKey)
        }
      })
      newSelected.add(key)
    }
    setSelectedRecommendations(newSelected)
  }

  // Aplicar reasignaciones seleccionadas
  const applyReassignments = async () => {
    if (selectedRecommendations.size === 0) return

    // 🔥 PREPARAR DATOS PARA EL MODAL EN LUGAR DE window.confirm
    const reassignmentsList = Array.from(selectedRecommendations).map(key => {
      const [taskId, newAssigneeId] = key.split('-')
      const rec = recommendations.find(r => r.task_id === taskId)
      const newAssignee = rec?.alternative_assignees.find(a => a.user_id === newAssigneeId)
      return rec && newAssignee ? `${rec.task_name}: ${rec.current_assignee.name} → ${newAssignee.name}` : null
    }).filter(Boolean)

    const reassignments: TaskReassignment[] = Array.from(selectedRecommendations).map(key => {
      const [taskId, newAssigneeId] = key.split('-')
      const rec = recommendations.find(r => r.task_id === taskId)
      const newAssignee = rec?.alternative_assignees.find(a => a.user_id === newAssigneeId)
      
      if (!rec || !newAssignee) return null

      const realTask = tasks.find(t => t.title === rec.task_name)
      
      return {
        taskId: realTask?.id || taskId,
        taskName: rec.task_name,
        fromUserId: rec.current_assignee.user_id,
        fromUserName: rec.current_assignee.name,
        toUserId: newAssignee.user_id,
        toUserName: newAssignee.name,
        reason: newAssignee.reason,
        improvementData: {
          ratingImprovement: newAssignee.complexity_rating - rec.current_assignee.complexity_rating,
          stressReduction: rec.current_assignee.stress_level - newAssignee.stress_level,
          compatibilityScore: newAssignee.compatibility_score
        }
      }
    }).filter(Boolean) as TaskReassignment[]

    // 🔥 GUARDAR DATOS Y MOSTRAR MODAL DE CONFIRMACIÓN
    setPendingReassignments({ reassignments, reassignmentsList })
    setShowConfirmationModal(true)
  }

  // 🔥 NUEVA FUNCIÓN PARA CONFIRMAR DESDE EL MODAL
  const confirmReassignments = async () => {
    setShowConfirmationModal(false)
    setIsApplying(true)
    
    try {
      const { reassignments } = pendingReassignments
      
      print("🔄 User confirmed - Applying reassignments:", reassignments)
      
      // Guardar en localStorage
      if (reassignments.length > 0) {
        localStorage.setItem("biometricReassignments", JSON.stringify(reassignments))
        print("💾 Reassignments saved to localStorage for transfer")
      }
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      print("✅ Reassignments prepared successfully")
      
      setTimeout(() => {
        onFinish(reassignments)
      }, 1500)
      
    } catch (error) {
      console.error("Error preparing reassignments:", error)
      onFinish()
    } finally {
      setIsApplying(false)
    }
  }

  // 🔥 FUNCIÓN PARA CANCELAR DESDE EL MODAL
  const cancelReassignments = () => {
    setShowConfirmationModal(false)
    setPendingReassignments({ reassignments: [], reassignmentsList: [] })
    print("❌ User cancelled biometric reassignments")
  }

  // 🔥 AGREGAR FUNCIÓN PARA FINALIZAR SIN CAMBIOS
  const finishWithoutChanges = () => {
    print("✅ Biometric verification completed without changes")
    onFinish() // Sin parámetros = sin cambios
  }

  if (sessionLoading || loadingRecommendations) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#4a2b4a]" />
        <span className="ml-2">
          {sessionLoading ? "Loading session data..." : "Analyzing task performance for optimal assignments..."}
        </span>
      </div>
    )
  }

  const wellAssignedTasks = replacementPool.length > 0 ? 
    data?.sessions.reduce((count, session) => {
      return count + session.tasks.filter(t => t.complexity_rating >= 4).length
    }, 0) || 0 : 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Smart Task Reassignment Analysis</h2>
        <p className="text-gray-600">
          Based on performance ratings and biometric data, here are optimal reassignment recommendations
        </p>
      </div>

      {/* Resumen de la sesión */}
      {/* {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4a2b4a]">{data.total_participants}</div>
              <div className="text-sm text-gray-600">Participants Evaluated</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{wellAssignedTasks}</div>
              <div className="text-sm text-gray-600">Well Assigned (4-5 rating)</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{replacementPool.length}</div>
              <div className="text-sm text-gray-600">Need Review (1-3 rating)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Reassignment Options</div>
            </CardContent>
          </Card>
        </div>
      )} */}

      {/* Recomendaciones inteligentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance-Based Reassignment Recommendations</h3>
          {recommendations.length > 0 && (
            <div className="text-sm text-gray-500">
              {selectedRecommendations.size} of {recommendations.length} selected for reassignment
            </div>
          )}
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <Card key={rec.task_id} className="overflow-hidden"> {/* 🔥 Ahora task_id es único */}
                <CardHeader className={`pb-2 ${
                  rec.recommendation_strength === 'high' 
                    ? 'bg-red-50 border-l-4 border-l-red-500'
                    : rec.recommendation_strength === 'medium'
                      ? 'bg-yellow-50 border-l-4 border-l-yellow-500'
                      : 'bg-blue-50 border-l-4 border-l-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{rec.task_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.recommendation_strength === 'high' 
                          ? 'bg-red-100 text-red-700'
                          : rec.recommendation_strength === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.recommendation_strength} priority
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{rec.reason}</p>
                </CardHeader>
                
                <CardContent className="p-4">
                  {/* Asignado actual con feedback */}
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-red-800 mb-2">
                      Current Assignment (Needs Improvement)
                    </div>
                    <div className="flex items-start gap-3">
                      <AvatarProfileIcon 
                        avatarUrl={rec.current_assignee.avatar_url}
                        size={48}
                        borderWidth={2}
                        borderColor="#ef4444"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{rec.current_assignee.name}</div>
                        <div className="flex items-center gap-3 text-sm mb-2">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-gray-400" />
                            {rec.current_assignee.complexity_rating}/5 rating
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <TrendingUp className="h-3 w-3" />
                            {Math.round(rec.current_assignee.stress_level * 100)}% stress
                          </span>
                          <span>
                            {getEmotionEmoji(rec.current_assignee.emotion)} {rec.current_assignee.emotion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alternativas recomendadas con mejor rendimiento */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Recommended Alternatives (Better Performance)
                    </div>
                    <div className="space-y-2">
                      {rec.alternative_assignees.map((alt, index) => {
                        const isSelected = selectedRecommendations.has(`${rec.task_id}-${alt.user_id}`)
                        const ratingImprovement = alt.complexity_rating - rec.current_assignee.complexity_rating
                        
                        return (
                          <div
                            key={`${rec.task_id}-${alt.user_id}-${index}`} // 🔥 Key única para alternativas
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                            }`}
                            onClick={() => toggleRecommendation(rec.task_id, alt.user_id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <AvatarProfileIcon 
                                  avatarUrl={alt.avatar_url}
                                  size={48}
                                  borderWidth={2}
                                  borderColor={isSelected ? "#10b981" : "#6b7280"}
                                />
                                {index === 0 && (
                                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1 rounded-full font-bold">
                                    Best
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium">{alt.name}</div>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <Star className="h-3 w-3" />
                                    {alt.complexity_rating}/5 
                                    {ratingImprovement > 0 && (
                                      <span className="text-xs">
                                        (+{ratingImprovement})
                                      </span>
                                    )}
                                  </span>
                                  <span className="flex items-center gap-1 text-green-600">
                                    <TrendingDown className="h-3 w-3" />
                                    {Math.round(alt.stress_level * 100)}% stress
                                  </span>
                                  <span>
                                    {getEmotionEmoji(alt.emotion)} {alt.emotion}
                                  </span>
                                  <span className="text-blue-600 font-medium">
                                    {Math.round(alt.compatibility_score * 100)}% fit
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  <strong>Performance:</strong> {alt.performance_summary}
                                </div>
                              </div>
                              
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Excellent Task Distribution!</h3>
            <p className="text-gray-600">
              All tasks are optimally assigned based on performance ratings and biometric analysis. 
              {wellAssignedTasks > 0 && (
                <span className="block mt-2 font-medium text-green-600">
                  {wellAssignedTasks} tasks received ratings of 4-5/5 ✨
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back to Results
        </Button>
        
        <div className="flex gap-3">
          {recommendations.length > 0 && selectedRecommendations.size > 0 && (
            <Button
              className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
              onClick={applyReassignments} // 🔥 Ahora muestra el modal
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying Reassignments...
                </>
              ) : (
                `Apply ${selectedRecommendations.size} Biometric Optimizations`
              )}
            </Button>
          )}
          
          <Button
            variant={recommendations.length === 0 ? "default" : "outline"}
            className={recommendations.length === 0 ? "bg-[#4a2b4a] text-white hover:bg-[#694969]" : ""}
            onClick={finishWithoutChanges}
            disabled={isApplying}
          >
            {recommendations.length === 0 ? "Complete Session" : "Keep Current Assignments"}
          </Button>
        </div>
      </div>

      {/* 🔥 MODAL DE CONFIRMACIÓN BONITO */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#4a2b4a] p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Confirm Biometric Optimizations</h2>
                <p className="text-sm text-gray-600">Review the changes before applying</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  You are about to apply {selectedRecommendations.size} task reassignments
                </span>
              </div>
              <p className="text-sm text-blue-700">
                This action will update task assignments based on biometric analysis and redirect you to Sprint Planning.
              </p>
            </div>

            {/* Expected improvements summary */}
            {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-sm font-medium text-green-800 mb-3">Expected Performance Improvements:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">
                    +{Math.round(pendingReassignments.reassignments.reduce((sum, r) => sum + r.improvementData.ratingImprovement, 0) / pendingReassignments.reassignments.length * 10) / 10} avg rating
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">
                    -{Math.round(pendingReassignments.reassignments.reduce((sum, r) => sum + r.improvementData.stressReduction, 0) / pendingReassignments.reassignments.length * 100)}% avg stress
                  </span>
                </div>
              </div>
            </div> */}

            {/* Task reassignments list */}
            {/* <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Task Reassignments:</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {pendingReassignments.reassignments.map((reassignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{reassignment.taskName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          {reassignment.fromUserName}
                        </span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {reassignment.toUserName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-green-600 font-medium">
                        +{reassignment.improvementData.ratingImprovement} rating
                      </div>
                      <div className="text-xs text-green-600">
                        -{Math.round(reassignment.improvementData.stressReduction * 100)}% stress
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={cancelReassignments}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                className="bg-[#4a2b4a] text-white hover:bg-[#694969] flex items-center gap-2"
                onClick={confirmReassignments}
              >
                <CheckCircle className="h-4 w-4" />
                Apply {selectedRecommendations.size} Optimizations
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              This will update your sprint assignments and take you to Sprint Planning
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
