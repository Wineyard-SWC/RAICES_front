"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Loader2, AlertTriangle, CheckCircle, UserCheck, ArrowRight, TrendingDown, TrendingUp } from "lucide-react"
import { useSessionRelation } from "@/hooks/useSessionRelation"
import { useSessionResults } from "../hooks/useSessionResults"
import { useEmotionUtils } from "../hooks/useEmotionUtils"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
import type { Session } from "../hooks/useSessionResults"

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
    complexity_rating: number // Rating que le dio a la tarea
  }
  alternative_assignees: Array<{
    user_id: string
    name: string
    avatar_url: string
    stress_level: number
    emotion: string
    complexity_rating?: number
    compatibility_score: number
    reason: string
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
  onFinish: () => void
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

  // Generar recomendaciones basadas en los datos biométricos
  useEffect(() => {
    if (!sessionRelationId || !data || !data.sessions.length) return

    const generateRecommendations = () => {
      setLoadingRecommendations(true)
      
      try {
        const taskRecommendations: TaskRecommendation[] = []
        
        // Para cada tarea en el pool de reemplazo (calificadas < 4)
        replacementPool.forEach(taskId => {
          const task = tasks.find(t => t.id === taskId)
          if (!task) return
          
          // Encontrar quién tiene la tarea asignada actualmente
          const currentAssignee = sprint.team_members.find(m => m.id === task.assignee_id)
          if (!currentAssignee) return
          
          // Encontrar la sesión del asignado actual
          const currentSession = data.sessions.find(s => s.user_firebase_id === currentAssignee.id)
          if (!currentSession) return
          
          // Encontrar la evaluación de esta tarea por el asignado actual
          const currentTaskEvaluation = currentSession.tasks.find(t => t.task_id === taskId)
          if (!currentTaskEvaluation) return
          
          // Solo recomendar si el actual tuvo alto estrés o emoción negativa
          const currentStress = currentTaskEvaluation.normalized_stress
          const isHighStress = currentStress > 0.6
          const hasNegativeEmotion = ['Stressed', 'Sad'].includes(currentTaskEvaluation.emotion_label)
          
          if (!isHighStress && !hasNegativeEmotion) return
          
          // Buscar alternativas: otros participantes que evaluaron la misma tarea
          const alternatives = data.sessions
            .filter(session => session.user_firebase_id !== currentAssignee.id) // No el actual
            .map(session => {
              const taskEval = session.tasks.find(t => t.task_id === taskId)
              if (!taskEval) return null
              
              const teamMember = sprint.team_members.find(m => m.id === session.user_firebase_id)
              if (!teamMember) return null
              
              // Calcular score de compatibilidad
              const stressDiff = currentStress - taskEval.normalized_stress
              const hasPositiveEmotion = ['Happy', 'Relaxed', 'Calm', 'Excited'].includes(taskEval.emotion_label)
              const lowStress = taskEval.normalized_stress < 0.4
              
              let compatibilityScore = 0
              let reason = ""
              
              if (stressDiff > 0.2) {
                compatibilityScore += 0.4
                reason += `${Math.round(stressDiff * 100)}% less stress. `
              }
              
              if (hasPositiveEmotion) {
                compatibilityScore += 0.3
                reason += `Showed ${taskEval.emotion_label.toLowerCase()} emotion. `
              }
              
              if (lowStress) {
                compatibilityScore += 0.3
                reason += "Maintained low stress levels. "
              }
              
              return {
                user_id: session.user_firebase_id,
                name: session.user_name,
                avatar_url: session.user_avatar_url,
                stress_level: taskEval.normalized_stress,
                emotion: taskEval.emotion_label,
                compatibility_score: Math.min(compatibilityScore, 1),
                reason: reason.trim()
              }
            })
            .filter(Boolean)
            .filter(alt => alt.compatibility_score > 0.3) // Solo alternativas viables
            .sort((a, b) => b.compatibility_score - a.compatibility_score) // Mejores primero
            .slice(0, 3) // Top 3 alternativas
          
          if (alternatives.length === 0) return
          
          // Determinar la fuerza de la recomendación
          const bestScore = alternatives[0].compatibility_score
          const stressDifference = currentStress - alternatives[0].stress_level
          
          let strength: 'high' | 'medium' | 'low' = 'low'
          if (bestScore > 0.7 && stressDifference > 0.3) strength = 'high'
          else if (bestScore > 0.5 && stressDifference > 0.2) strength = 'medium'
          
          const recommendation: TaskRecommendation = {
            task_id: taskId,
            task_name: task.title,
            current_assignee: {
              user_id: currentAssignee.id,
              name: currentSession.user_name,
              avatar_url: currentSession.user_avatar_url,
              stress_level: currentStress,
              emotion: currentTaskEvaluation.emotion_label,
              complexity_rating: 3 // Asumimos < 4 por estar en el pool
            },
            alternative_assignees: alternatives,
            recommendation_strength: strength,
            reason: `Current assignee showed ${Math.round(currentStress * 100)}% stress and ${currentTaskEvaluation.emotion_label.toLowerCase()} emotion when evaluating this task.`
          }
          
          taskRecommendations.push(recommendation)
        })
        
        // Ordenar por fuerza de recomendación
        const sortedRecommendations = taskRecommendations.sort((a, b) => {
          const strengthOrder = { high: 3, medium: 2, low: 1 }
          return strengthOrder[b.recommendation_strength] - strengthOrder[a.recommendation_strength]
        })
        
        setRecommendations(sortedRecommendations)
        console.log("🎯 Generated recommendations:", sortedRecommendations)
        
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

    setIsApplying(true)
    try {
      const reassignments = Array.from(selectedRecommendations).map(key => {
        const [taskId, newAssigneeId] = key.split('-')
        const rec = recommendations.find(r => r.task_id === taskId)
        const newAssignee = rec?.alternative_assignees.find(a => a.user_id === newAssigneeId)
        return { taskId, newAssigneeId, rec, newAssignee }
      }).filter(r => r.rec && r.newAssignee)
      
      console.log("🔄 Applying reassignments:", reassignments)
      
      // Simular API calls (implementar según tu backend)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("✅ Reassignments applied successfully")
      
      setTimeout(() => {
        onFinish()
      }, 1500)
      
    } catch (error) {
      console.error("Error applying reassignments:", error)
    } finally {
      setIsApplying(false)
    }
  }

  if (sessionLoading || loadingRecommendations) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#4a2b4a]" />
        <span className="ml-2">
          {sessionLoading ? "Loading session data..." : "Analyzing biometric data for recommendations..."}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Smart Task Reassignment</h2>
        <p className="text-gray-600">
          Based on biometric analysis, here are personalized task reassignment recommendations
        </p>
      </div>

      {/* Resumen de la sesión */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#4a2b4a]">{data.total_participants}</div>
              <div className="text-sm text-gray-600">Participants Evaluated</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.sessions.reduce((sum, s) => sum + s.tasks.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Task Evaluations</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Smart Recommendations</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recomendaciones inteligentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Biometric-Based Recommendations</h3>
          {recommendations.length > 0 && (
            <div className="text-sm text-gray-500">
              {selectedRecommendations.size} of {recommendations.length} selected
            </div>
          )}
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <Card key={rec.task_id} className="overflow-hidden">
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
                  {/* Asignado actual */}
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-red-800 mb-2">Current Assignment (High Stress)</div>
                    <div className="flex items-center gap-3">
                      <AvatarProfileIcon 
                        avatarUrl={rec.current_assignee.avatar_url}
                        size={48}
                        borderWidth={2}
                        borderColor="#ef4444"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{rec.current_assignee.name}</div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            {Math.round(rec.current_assignee.stress_level * 100)}% stress
                          </span>
                          <span>
                            {getEmotionEmoji(rec.current_assignee.emotion)} {rec.current_assignee.emotion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alternativas recomendadas */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Recommended Alternatives (Better Compatibility)
                    </div>
                    <div className="space-y-2">
                      {rec.alternative_assignees.map((alt, index) => {
                        const isSelected = selectedRecommendations.has(`${rec.task_id}-${alt.user_id}`)
                        
                        return (
                          <div
                            key={alt.user_id}
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
                                    #1
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium">{alt.name}</div>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-green-600">
                                    <TrendingDown className="h-3 w-3" />
                                    {Math.round(alt.stress_level * 100)}% stress
                                  </span>
                                  <span>
                                    {getEmotionEmoji(alt.emotion)} {alt.emotion}
                                  </span>
                                  <span className="text-blue-600 font-medium">
                                    {Math.round(alt.compatibility_score * 100)}% match
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {alt.reason}
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
            <h3 className="text-lg font-medium mb-2">Optimal Task Distribution</h3>
            <p className="text-gray-600">
              All tasks are well-matched to team members based on biometric analysis
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
              onClick={applyReassignments}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying Smart Reassignments...
                </>
              ) : (
                `Apply ${selectedRecommendations.size} Smart Reassignments`
              )}
            </Button>
          )}
          
          <Button
            variant={recommendations.length === 0 ? "default" : "outline"}
            className={recommendations.length === 0 ? "bg-[#4a2b4a] text-white hover:bg-[#694969]" : ""}
            onClick={onFinish}
            disabled={isApplying}
          >
            {recommendations.length === 0 ? "Complete Session" : "Keep Current Assignments"}
          </Button>
        </div>
      </div>
    </div>
  )
}
