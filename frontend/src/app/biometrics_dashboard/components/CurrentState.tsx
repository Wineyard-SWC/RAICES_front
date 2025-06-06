
import { Activity, Heart, Brain, TrendingUp, TrendingDown, Badge } from "lucide-react";
import { useEmotionUtils } from "@/app/biometric_verification/hooks/useEmotionUtils";
import EmotionalAvatarDisplay from "@/app/biometric_verification/components/EmotionalAvatarDisplay";
import { BiometricAnalytics } from "../hooks/useBiometricData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Progress } from "@/components/progress";

interface CurrentStateProps {
  analytics: BiometricAnalytics;
}

export default function CurrentState({ analytics }: CurrentStateProps) {
  const { getEmotionEmoji, getEmotionExpression, getStressLevel } = useEmotionUtils();
  
  const { currentState } = analytics;
  const stressInfo = getStressLevel(currentState.stress);

  const getArousalStatus = (arousal: number) => {
    if (arousal > 0.3) return { level: "Alto", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (arousal > -0.3) return { level: "Medio", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    return { level: "Bajo", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" };
  };

  const getValenceStatus = (valence: number) => {
    if (valence > 0.1) return { level: "Positivo", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", icon: TrendingUp };
    if (valence > -0.1) return { level: "Neutro", color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200", icon: Activity };
    return { level: "Negativo", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", icon: TrendingDown };
  };

  const arousalStatus = getArousalStatus(currentState.arousal);
  const valenceStatus = getValenceStatus(currentState.valence);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Avatar y Estado Emocional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#4a2b4a]" />
            Estado Emocional Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-6">
            <EmotionalAvatarDisplay
              avatarUrl={currentState.avatarUrl}
              expression={getEmotionExpression(currentState.emotion)}
              size={200}
            />
          </div>
          
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
              <span className="text-3xl">{getEmotionEmoji(currentState.emotion)}</span>
              <span className={stressInfo.color}>{currentState.emotion}</span>
            </div>
            <Badge className="text-sm px-3 py-1">
              Estado basado en tu última sesión biométrica
            </Badge>
          </div>

          <div className="w-full space-y-3">
            <div className={`p-3 rounded-lg border ${arousalStatus.bgColor} ${arousalStatus.borderColor}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Nivel de Activación</span>
                <span className={`text-sm font-bold ${arousalStatus.color}`}>
                  {arousalStatus.level}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Bajo</span>
                <span className="font-medium">{currentState.arousal.toFixed(3)}</span>
                <span>Alto</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${valenceStatus.bgColor} ${valenceStatus.borderColor}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <valenceStatus.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">Valencia Emocional</span>
                </div>
                <span className={`text-sm font-bold ${valenceStatus.color}`}>
                  {valenceStatus.level}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Negativo</span>
                <span className="font-medium">{currentState.valence.toFixed(3)}</span>
                <span>Positivo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Biométricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Métricas Biométricas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nivel de Estrés */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nivel de Estrés Actual</span>
              <span className={`text-2xl font-bold ${stressInfo.color}`}>
                {Math.round(currentState.stress * 100)}%
              </span>
            </div>
            <Progress 
              value={currentState.stress * 100} 
              className="h-3"
            />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Relajado</span>
              <span className={`font-medium ${stressInfo.color}`}>{stressInfo.level}</span>
              <span>Muy Estresado</span>
            </div>
          </div>

          {/* Frecuencia Cardíaca */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Frecuencia Cardíaca</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {currentState.heartRate.toFixed(0)}
              </span>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">bpm (línea base)</span>
            </div>
          </div>

          {/* Resumen General */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Resumen de Bienestar</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{analytics.totalSessions}</div>
                <div className="text-xs text-gray-600">Sesiones Totales</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(analytics.avgStress * 100)}%
                </div>
                <div className="text-xs text-gray-600">Estrés Promedio</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}