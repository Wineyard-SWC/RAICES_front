"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Zap, RefreshCw, Clock, Brain, Activity, Heart, User } from "lucide-react"
import { useSessionRelation } from "@/hooks/useSessionRelation"
import { useSessionResults } from "../hooks/useSessionResults"
import { useEmotionUtils } from "../hooks/useEmotionUtils"
import ParticipantCard from "../components/ParticipantCard"
import EmotionalAvatarDisplay from "../components/EmotionalAvatarDisplay"
import type { Session, Task } from "../hooks/useSessionResults"

interface ResultsAndPoolProps {
  participantResults: any[]
  replacementPool: string[]
  tasks: any[]
  sprint: any
  onNext: () => void
}

export default function ResultsAndPool({
  participantResults,
  replacementPool,
  tasks,
  sprint,
  onNext,
}: ResultsAndPoolProps) {
  const { sessionRelationId } = useSessionRelation()
  const { data, loading, error, refetch } = useSessionResults(sessionRelationId)
  const { getEmotionExpression, getEmotionEmoji } = useEmotionUtils()
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [autoRefreshCount, setAutoRefreshCount] = useState(0)
  const [isWaitingForData, setIsWaitingForData] = useState(true)

  // Auto-refresh logic mejorada
  useEffect(() => {
    if (!data || loading) return;
    
    const expectedSessions = participantResults.length;
    const actualSessions = data.sessions.length;
    
    console.log(`📊 Expected: ${expectedSessions}, Actual: ${actualSessions}, Auto-refresh count: ${autoRefreshCount}`);
    
    if (actualSessions < expectedSessions && autoRefreshCount < 10) { // Máximo 10 intentos
      console.log("🔄 Auto-refreshing in 3 seconds...");
      setIsWaitingForData(true);
      
      const timeout = setTimeout(() => {
        setAutoRefreshCount(prev => prev + 1);
        refetch();
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else {
      setIsWaitingForData(false);
    }
  }, [data, participantResults.length, loading, refetch, autoRefreshCount]);

  // Reset auto-refresh counter when sessionRelationId changes
  useEffect(() => {
    setAutoRefreshCount(0);
    setIsWaitingForData(true);
    setSelectedSession(null);
    setSelectedTaskId(null);
  }, [sessionRelationId]);

  const handleTaskSelect = (session: Session, taskId: string) => {
    setSelectedSession(session)
    setSelectedTaskId(taskId)
  }

  const handleManualRefresh = () => {
    setAutoRefreshCount(0); // Reset counter
    setIsWaitingForData(true);
    refetch();
  }

  const selectedTask = selectedSession?.tasks.find(t => t.task_id === selectedTaskId)

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#4a2b4a] mb-4" />
        <span className="text-lg mb-2">Loading session results...</span>
        <span className="text-sm text-gray-500">
          Processing biometric data from {participantResults.length} participants
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <span className="text-red-600 mb-4">Error loading results: {error}</span>
        <Button 
          onClick={handleManualRefresh}
          className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No session data available</p>
        <Button 
          onClick={handleManualRefresh}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  // Check if we have incomplete data
  const expectedSessions = participantResults.length;
  const actualSessions = data.sessions.length;
  const isIncomplete = actualSessions < expectedSessions;
  const hasTimedOut = autoRefreshCount >= 10;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Biometric Verification Results</h2>
          <p className="text-gray-600">
            Session with {data.total_participants} participants • 
            Session ID: <span className="font-mono text-sm">{data.session_relation}</span>
          </p>
          
          {/* Status indicators mejorados */}
          {isIncomplete && !hasTimedOut && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">
                  Loading data from {expectedSessions} participants... ({actualSessions}/{expectedSessions} ready)
                </span>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Auto-refresh attempt {autoRefreshCount + 1}/10
              </div>
            </div>
          )}
          
          {isIncomplete && hasTimedOut && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Showing {actualSessions} of {expectedSessions} participants (some data may still be processing)
                </span>
              </div>
            </div>
          )}

          {!isIncomplete && actualSessions > 0 && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              ✅ All {actualSessions} participants loaded successfully
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Zap className="h-4 w-4" />
            <span>Real-time biometric analysis</span>
          </div>
          
          <Button 
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de participantes */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            Participants ({data.sessions.length})
            {isWaitingForData && !hasTimedOut && (
              <span className="text-sm font-normal text-blue-600 ml-2 animate-pulse">
                (Loading more...)
              </span>
            )}
          </h3>
          
          {data.sessions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-2">Waiting for participant data...</p>
              <p className="text-xs text-gray-400">
                Make sure all participants have completed their evaluations
              </p>
            </div>
          ) : (
            <>
              {data.sessions.map((session) => (
                <ParticipantCard
                  key={`session-${session.session_id}`} // 🔥 Asegurar key única para sesiones
                  session={session}
                  onTaskSelect={handleTaskSelect}
                  selectedTaskId={selectedTaskId}
                  selectedSessionId={selectedSession?.session_id || null}
                />
              ))}
              
              {/* Placeholder para participantes faltantes */}
              {isIncomplete && !hasTimedOut && Array.from({ 
                length: expectedSessions - actualSessions 
              }).map((_, index) => (
                <div 
                  key={`placeholder-${sessionRelationId}-${index}`} // 🔥 Key única para placeholders
                  className="mb-4 p-6 border-2 border-dashed border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Waiting for participant data...
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Panel de detalles mejorado */}
        <div className="lg:col-span-1">
          {selectedTask && selectedSession ? (
            <div className="sticky top-6 space-y-4">
              {/* Header con nombre y tarea */}
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
                  <User className="h-5 w-5 text-[#4a2b4a]" />
                  {selectedSession.user_name} - {selectedTask.task_name}
                </h4>
                
                <EmotionalAvatarDisplay
                  avatarUrl={selectedSession.user_avatar_url}
                  expression={getEmotionExpression(selectedTask.emotion_label)}
                  size={280}
                />
                
                <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <span className="text-2xl">{getEmotionEmoji(selectedTask.emotion_label)}</span>
                    <span className="font-medium text-purple-700">{selectedTask.emotion_label}</span>
                  </div>
                </div>
              </div>

              {/* Métricas detalladas con íconos mejorados */}
              <div className="bg-white border rounded-lg p-4 space-y-4">
                <h5 className="font-medium text-gray-900 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[#4a2b4a]" />
                  Biometric Analysis
                </h5>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-500" />
                      <span className="text-gray-700 font-medium">Stress Level</span>
                    </div>
                    <span className="font-bold text-red-600">
                      {Math.round(selectedTask.normalized_stress * 100)}%
                    </span>
                  </div>
                  
                  {selectedTask.heart_rate && (
                    <div className="flex items-center justify-between p-2 bg-pink-50 rounded border border-pink-100">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="text-gray-700 font-medium">Heart Rate</span>
                      </div>
                      <span className="font-bold text-pink-600">
                        {selectedTask.heart_rate.toFixed(1)} bpm
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">🕒</span>
                      <span className="text-gray-700 font-medium">Completed</span>
                    </div>
                    <span className="font-medium text-blue-600">
                      {new Date(selectedTask.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas de sesión general */}
              <div className="bg-white border rounded-lg p-4 space-y-4">
                <h5 className="font-medium text-gray-900 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  Session Overview
                </h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-purple-50 rounded border border-purple-100">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                      <Activity className="h-3 w-3 text-purple-500" />
                      Arousal
                    </div>
                    <div className="font-bold text-purple-600">
                      {selectedSession.session_arousal.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-indigo-50 rounded border border-indigo-100">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                      <Brain className="h-3 w-3 text-indigo-500" />
                      Valence
                    </div>
                    <div className="font-bold text-indigo-600">
                      {selectedSession.session_valence.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600 mb-1">
                    <Heart className="h-3 w-3 text-green-500" />
                    Baseline Heart Rate
                  </div>
                  <div className="font-bold text-green-600">
                    {selectedSession.baseline.baseline_hr.toFixed(1)} bpm
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Brain className="h-8 w-8 mx-auto mb-4 text-gray-300" />
              <p>Select a task to view detailed biometric analysis and avatar expression</p>
            </div>
          )}
        </div>
      </div>

      {/* Replacement Pool - arreglar duplicados */}
      {replacementPool.length > 0 && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Tasks Requiring Reassignment
          </h3>
          <p className="text-sm text-red-600 mb-3">
            {replacementPool.length} tasks were flagged for potential reassignment due to high complexity rating (&lt; 4).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* 🔥 Filtrar tareas duplicadas por nombre */}
            {replacementPool
              .map((taskId) => tasks.find((t) => t.id === taskId))
              .filter(Boolean) // Remover nulls
              .filter((task, index, array) => 
                // Solo mantener la primera ocurrencia de cada nombre de tarea
                array.findIndex(t => t.title === task.title) === index
              )
              .map((task, index) => (
                <div key={`pool-task-unique-${task.title}-${index}`} className="bg-white p-3 rounded border text-sm border-l-4 border-l-red-400">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-red-800">{task.title}</div>
                      <div className="text-gray-600 text-xs mt-1">{task.description}</div>
                      <div className="text-xs text-red-600 mt-1 font-medium">
                        ⚠️ High complexity - requires reassignment
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <Button 
          className="bg-[#4a2b4a] text-white hover:bg-[#694969]" 
          onClick={onNext}
          disabled={isIncomplete && !hasTimedOut}
        >
          {isIncomplete && !hasTimedOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Waiting for all participants... ({actualSessions}/{expectedSessions})
            </>
          ) : (
            "Continue to final review"
          )}
        </Button>
      </div>
    </div>
  )
}
