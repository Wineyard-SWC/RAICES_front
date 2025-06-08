"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, User, Heart, Brain, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/card";
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay";
import { useEmotionUtils } from "../hooks/useEmotionUtils";
import type { Session } from "../hooks/useSessionResults";

interface ParticipantCardProps {
  session: Session;
  onTaskSelect: (session: Session, taskId: string) => void;
  selectedTaskId: string | null;
  selectedSessionId: string | null;
}

export default function ParticipantCard({
  session,
  onTaskSelect,
  selectedTaskId,
  selectedSessionId
}: ParticipantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getEmotionEmoji, getStressLevel, getHeartRateStatus } = useEmotionUtils();

  // Funciones para determinar colores y estados de las métricas
  const getArousalStatus = (arousal: number) => {
    if (arousal > 0.6) return { color: "#ef4444", icon: TrendingUp, label: "High", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (arousal > 0.4) return { color: "#f59e0b", icon: Minus, label: "Medium", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    return { color: "#10b981", icon: TrendingDown, label: "Low", bgColor: "bg-green-50", borderColor: "border-green-200" };
  };

  const getValenceStatus = (valence: number) => {
    if (valence > 0.6) return { color: "#10b981", icon: TrendingUp, label: "Positive", bgColor: "bg-green-50", borderColor: "border-green-200" };
    if (valence > 0.4) return { color: "#f59e0b", icon: Minus, label: "Neutral", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    return { color: "#ef4444", icon: TrendingDown, label: "Negative", bgColor: "bg-red-50", borderColor: "border-red-200" };
  };

  const getHeartRateStatusColor = (hr: number, baseline: number) => {
    const diff = hr - baseline;
    if (Math.abs(diff) <= 5) return { color: "#10b981", icon: Heart, label: "Normal", bgColor: "bg-green-50", borderColor: "border-green-200" };
    if (diff > 5) return { color: "#ef4444", icon: TrendingUp, label: "Elevated", bgColor: "bg-red-50", borderColor: "border-red-200" };
    return { color: "#3b82f6", icon: TrendingDown, label: "Below Baseline", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
  };

  const stressInfo = getStressLevel(session.session_avg_stress);
  const arousalStatus = getArousalStatus(session.session_arousal);
  const valenceStatus = getValenceStatus(session.session_valence);
  const heartRateStatus = getHeartRateStatusColor(session.baseline.baseline_hr, session.baseline.baseline_hr);

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarProfileIcon 
              avatarUrl={session.user_avatar_url}
              size={48}
              borderWidth={2}
              borderColor={stressInfo.color}
            />
            
            <div>
              <h3 className="font-semibold text-lg">{session.user_name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Session: {session.session_emotion} {getEmotionEmoji(session.session_emotion)}
                </span>
                <span className="flex items-center gap-1" style={{ color: stressInfo.color }}>
                  <Activity className="h-3 w-3" />
                  {Math.round(session.session_avg_stress * 100)}% stress
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{session.tasks.length} tasks</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Métricas generales de la sesión con íconos y colores mejorados */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
            {/* Arousal con indicador de estado */}
            <div className={`text-center p-3 rounded-lg border ${arousalStatus.bgColor} ${arousalStatus.borderColor}`}>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                <arousalStatus.icon className="h-4 w-4" style={{ color: arousalStatus.color }} />
                <span className="font-medium">Energy Level</span>
              </div>
              <div className="font-bold text-lg" style={{ color: arousalStatus.color }}>
                {session.session_arousal.toFixed(2)}
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: arousalStatus.color }}>
                {arousalStatus.label}
              </div>
            </div>
            
            {/* Valence con indicador de estado */}
            <div className={`text-center p-3 rounded-lg border ${valenceStatus.bgColor} ${valenceStatus.borderColor}`}>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                <valenceStatus.icon className="h-4 w-4" style={{ color: valenceStatus.color }} />
                <span className="font-medium">Mood</span>
              </div>
              <div className="font-bold text-lg" style={{ color: valenceStatus.color }}>
                {session.session_valence.toFixed(2)}
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: valenceStatus.color }}>
                {valenceStatus.label}
              </div>
            </div>
            
            {/* Heart Rate con indicador de estado */}
            <div className={`text-center p-3 rounded-lg border ${heartRateStatus.bgColor} ${heartRateStatus.borderColor}`}>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-2">
                <Heart className="h-4 w-4" style={{ color: heartRateStatus.color }} />
                <span className="font-medium">Heart Rate</span>
              </div>
              <div className="font-bold text-lg" style={{ color: heartRateStatus.color }}>
                {session.baseline.baseline_hr.toFixed(1)} 
              </div>
              <div className="text-xs font-medium mt-1" style={{ color: heartRateStatus.color }}>
                {heartRateStatus.label} • <span className="font-normal">bpm</span>
              </div>
            </div>
          </div>

          {/* Lista de tareas */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#4a2b4a]" />
              Task Results ({session.tasks.length})
            </h4>
            <div className="space-y-2">
              {session.tasks.map((task, taskIndex) => {
                const taskStress = getStressLevel(task.normalized_stress);
                const hrStatus = getHeartRateStatus(task.heart_rate, session.baseline.baseline_hr);
                const isSelected = selectedTaskId === task.task_id && selectedSessionId === session.session_id;

                return (
                  <div
                    key={`${session.session_id}-${task.task_id}-${taskIndex}`}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#4a2b4a] bg-[#4a2b4a]/5' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onTaskSelect(session, task.task_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>{task.task_name}</span>
                          {isSelected && <span className="text-[#4a2b4a]">◉</span>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            {getEmotionEmoji(task.emotion_label)}
                            <span className="font-medium">{task.emotion_label}</span>
                          </span>
                          <span className="flex items-center gap-1" style={{ color: taskStress.color }}>
                            <Activity className="h-3 w-3" />
                            <span className="font-medium">{Math.round(task.normalized_stress * 100)}%</span>
                          </span>
                          {task.heart_rate && (
                            <span className="flex items-center gap-1" style={{ color: hrStatus.color }}>
                              <Heart className="h-3 w-3" />
                              <span className="font-medium">{task.heart_rate.toFixed(1)} bpm</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        {new Date(task.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}