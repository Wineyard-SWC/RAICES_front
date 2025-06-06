"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Heart, Brain } from "lucide-react";
import { BiometricAnalytics } from "../hooks/useBiometricData";
import { Card } from "@/app/settings/components/ui/card";
import { CardContent, CardHeader, CardTitle } from "@/components/card";

interface BiometricTrendsProps {
  analytics: BiometricAnalytics;
}

export default function BiometricTrends({ analytics }: BiometricTrendsProps) {
  const { stressHistory, arousalHistory, valenceHistory, heartRateHistory } = analytics;

  const renderChart = (data: number[], label: string, color: string, max: number, min: number) => {
    if (data.length === 0) {
      return (
        <div className="h-[200px] flex items-center justify-center text-gray-500">
          No hay datos suficientes para mostrar
        </div>
      );
    }

    return (
      <div className="h-[200px] w-full relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full px-4">
            <div className="relative h-[150px] w-full">
              {/* Grid lines */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
              <div className="absolute bottom-[33%] left-0 w-full h-[1px] bg-gray-200"></div>
              <div className="absolute bottom-[66%] left-0 w-full h-[1px] bg-gray-200"></div>

              {/* Bars */}
              <div className="absolute bottom-0 left-0 w-full h-full flex items-end gap-1">
                {data.map((value, index) => {
                  const normalizedValue = max !== min ? ((value - min) / (max - min)) : 0.5;
                  const height = Math.max(normalizedValue * 100, 2); // Mínimo 2% para visibilidad
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 rounded-t"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: color,
                        opacity: 0.8
                      }}
                      title={`Sesión ${index + 1}: ${value.toFixed(3)}`}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-muted-foreground">{min.toFixed(2)}</span>
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground">{max.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStats = (data: number[]) => {
    if (data.length === 0) return { avg: 0, max: 0, min: 0 };
    
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    
    return { avg, max, min };
  };

  const stressStats = getStats(stressHistory);
  const arousalStats = getStats(arousalHistory);
  const valenceStats = getStats(valenceHistory);
  const heartRateStats = getStats(heartRateHistory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tendencias Biométricas (Últimas {Math.max(stressHistory.length, arousalHistory.length, valenceHistory.length, heartRateHistory.length)} sesiones)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stress" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stress">Estrés</TabsTrigger>
            <TabsTrigger value="arousal">Activación</TabsTrigger>
            <TabsTrigger value="valence">Valencia</TabsTrigger>
            <TabsTrigger value="heart-rate">Frecuencia Cardíaca</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stress" className="pt-4">
            {renderChart(stressHistory, "Nivel de Estrés (0-1)", "#8b5cf6", stressStats.max, stressStats.min)}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Promedio:</span>{" "}
                <span className="font-medium">{stressStats.avg.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pico:</span>{" "}
                <span className="font-medium">{stressStats.max.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mínimo:</span>{" "}
                <span className="font-medium">{stressStats.min.toFixed(3)}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="arousal" className="pt-4">
            {renderChart(arousalHistory, "Nivel de Activación (-1 a 1)", "#f59e0b", arousalStats.max, arousalStats.min)}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Promedio:</span>{" "}
                <span className="font-medium">{arousalStats.avg.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pico:</span>{" "}
                <span className="font-medium">{arousalStats.max.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mínimo:</span>{" "}
                <span className="font-medium">{arousalStats.min.toFixed(3)}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="valence" className="pt-4">
            {renderChart(valenceHistory, "Valencia Emocional (-1 a 1)", "#10b981", valenceStats.max, valenceStats.min)}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Promedio:</span>{" "}
                <span className="font-medium">{valenceStats.avg.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pico:</span>{" "}
                <span className="font-medium">{valenceStats.max.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mínimo:</span>{" "}
                <span className="font-medium">{valenceStats.min.toFixed(3)}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="heart-rate" className="pt-4">
            {renderChart(heartRateHistory, "Frecuencia Cardíaca (bpm)", "#ef4444", heartRateStats.max, heartRateStats.min)}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div>
                <span className="text-muted-foreground">Promedio:</span>{" "}
                <span className="font-medium">{heartRateStats.avg.toFixed(1)} bpm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pico:</span>{" "}
                <span className="font-medium">{heartRateStats.max.toFixed(1)} bpm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mínimo:</span>{" "}
                <span className="font-medium">{heartRateStats.min.toFixed(1)} bpm</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}