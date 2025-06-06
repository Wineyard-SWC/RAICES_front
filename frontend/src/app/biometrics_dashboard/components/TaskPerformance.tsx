"use client";


import { CheckSquare, Activity, Brain } from "lucide-react";
import { useEmotionUtils } from "@/app/biometric_verification/hooks/useEmotionUtils";
import { BiometricAnalytics } from "../hooks/useBiometricData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Progress } from "@/components/progress";
import { Badge } from "@/app/settings/components/ui/badge";

interface TaskPerformanceProps {
  analytics: BiometricAnalytics;
}

export default function TaskPerformance({ analytics }: TaskPerformanceProps) {
  const { getEmotionEmoji, getStressLevel } = useEmotionUtils();
  const { taskPerformance, emotionDistribution } = analytics;

  // Ordenar tareas por nivel de estrés (mayor a menor)
  const sortedTasks = [...taskPerformance].sort((a, b) => b.avgStress - a.avgStress);

  // Ordenar emociones por frecuencia
  const sortedEmotions = Object.entries(emotionDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // Top 5 emociones

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Performance por Tarea */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#4a2b4a]" />
            Rendimiento por Tarea
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskPerformance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No hay datos de tareas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTasks.map((task, index) => {
                const stressInfo = getStressLevel(task.avgStress);
                
                return (
                  <div key={`${task.taskName}-${index}`} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.taskName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">{task.occurrences} evaluaciones</span>
                          <Badge variant="outline" className="text-xs">
                            {getEmotionEmoji(task.emotion)} {task.emotion}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${stressInfo.color}`}>
                          {Math.round(task.avgStress * 100)}%
                        </div>
                        <div className="text-xs text-gray-600">estrés promedio</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Progress 
                        value={task.avgStress * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Bajo estrés</span>
                        <span className={stressInfo.color}>{stressInfo.level}</span>
                        <span>Alto estrés</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribución Emocional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Distribución Emocional
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEmotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No hay datos emocionales disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEmotions.map(([emotion, count]) => {
                const percentage = (count / analytics.totalSessions) * 100;
                
                return (
                  <div key={emotion} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getEmotionEmoji(emotion)}</span>
                        <span className="font-medium">{emotion}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-sm text-gray-600 ml-1">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
              
              {/* Resumen */}
              <div className="pt-4 border-t mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#4a2b4a] mb-1">
                    {analytics.mostCommonEmotion}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tu estado emocional más frecuente
                  </div>
                  <div className="text-3xl mt-2">
                    {getEmotionEmoji(analytics.mostCommonEmotion)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}