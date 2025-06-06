"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Heart, Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/app/settings/components/ui/card";
import { CardContent, CardHeader, CardTitle } from "@/components/card";
import { BiometricAnalytics } from "@/hooks/useBiometricData";
import { Badge } from "@/app/settings/components/ui/badge";

interface BiometricTrendsProps {
  analytics: BiometricAnalytics;
}

export default function BiometricTrends({ analytics }: BiometricTrendsProps) {
  const { stressHistory, arousalHistory, valenceHistory, heartRateHistory } = analytics;

  // 🔥 FUNCIÓN PARA INTERPRETAR LOS VALORES
  const getInterpretation = (value: number, type: 'stress' | 'arousal' | 'valence' | 'heartRate') => {
    switch (type) {
      case 'stress':
        if (value < 0.3) return { 
          status: 'Good', 
          color: 'bg-green-100 text-green-800', 
          icon: TrendingDown,
          description: 'Low stress levels indicate good emotional regulation'
        };
        if (value < 0.6) return { 
          status: 'Moderate', 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: Minus,
          description: 'Moderate stress is normal during challenging tasks'
        };
        if (value < 0.8) return { 
          status: 'High', 
          color: 'bg-orange-100 text-orange-800', 
          icon: TrendingUp,
          description: 'High stress may affect performance and well-being'
        };
        return { 
          status: 'Very High', 
          color: 'bg-red-100 text-red-800', 
          icon: TrendingUp,
          description: 'Very high stress requires attention and stress management'
        };

      case 'arousal':
        if (value < -0.5) return { 
          status: 'Very Low', 
          color: 'bg-blue-100 text-blue-800', 
          icon: TrendingDown,
          description: 'Low energy may indicate fatigue or relaxation'
        };
        if (value < -0.2) return { 
          status: 'Low', 
          color: 'bg-cyan-100 text-cyan-800', 
          icon: TrendingDown,
          description: 'Calm and focused state, good for detailed work'
        };
        if (value < 0.2) return { 
          status: 'Balanced', 
          color: 'bg-green-100 text-green-800', 
          icon: Minus,
          description: 'Optimal energy balance for sustained productivity'
        };
        if (value < 0.5) return { 
          status: 'High', 
          color: 'bg-orange-100 text-orange-800', 
          icon: TrendingUp,
          description: 'High energy and engagement, great for creative tasks'
        };
        return { 
          status: 'Very High', 
          color: 'bg-red-100 text-red-800', 
          icon: TrendingUp,
          description: 'Very high arousal may lead to overstimulation'
        };

      case 'valence':
        if (value < -0.3) return { 
          status: 'Negative', 
          color: 'bg-red-100 text-red-800', 
          icon: TrendingDown,
          description: 'Negative mood may affect motivation and performance'
        };
        if (value < 0.3) return { 
          status: 'Neutral', 
          color: 'bg-gray-100 text-gray-800', 
          icon: Minus,
          description: 'Neutral emotional state, baseline mood'
        };
        return { 
          status: 'Positive', 
          color: 'bg-green-100 text-green-800', 
          icon: TrendingUp,
          description: 'Positive mood enhances creativity and collaboration'
        };

      case 'heartRate':
        if (value < 60) return { 
          status: 'Low', 
          color: 'bg-blue-100 text-blue-800', 
          icon: TrendingDown,
          description: 'Below normal resting heart rate'
        };
        if (value < 100) return { 
          status: 'Normal', 
          color: 'bg-green-100 text-green-800', 
          icon: Minus,
          description: 'Healthy resting heart rate range'
        };
        return { 
          status: 'Elevated', 
          color: 'bg-orange-100 text-orange-800', 
          icon: TrendingUp,
          description: 'Elevated heart rate may indicate stress or physical activity'
        };

      default:
        return { 
          status: 'Unknown', 
          color: 'bg-gray-100 text-gray-800', 
          icon: Minus,
          description: 'Unable to interpret this value'
        };
    }
  };

  const renderChart = (data: number[], label: string, color: string, max: number, min: number) => {
    if (data.length === 0) {
      return (
        <div className="h-[200px] flex items-center justify-center text-gray-500">
          Not enough data to display
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
                  const height = Math.max(normalizedValue * 100, 2); // Minimum 2% for visibility
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 rounded-t"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: color,
                        opacity: 0.8
                      }}
                      title={`Session ${index + 1}: ${value.toFixed(3)}`}
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
    if (!data || data.length === 0) return { avg: 0, max: 0, min: 0 };
    
    const validData = data.filter(val => 
      val !== null && 
      val !== undefined && 
      !isNaN(val) && 
      isFinite(val)
    );
    
    if (validData.length === 0) return { avg: 0, max: 0, min: 0 };
    
    const avg = validData.reduce((sum, val) => sum + val, 0) / validData.length;
    const max = Math.max(...validData);
    const min = Math.min(...validData);
    
    return { avg, max, min };
  };

  // 🔥 INTERPRETACIONES PARA CADA MÉTRICA
  const stressStats = getStats(stressHistory);
  const arousalStats = getStats(arousalHistory);
  const valenceStats = getStats(valenceHistory);
  const heartRateStats = getStats(heartRateHistory);

  const stressInterpretation = getInterpretation(stressStats.avg, 'stress');
  const arousalInterpretation = getInterpretation(arousalStats.avg, 'arousal');
  const valenceInterpretation = getInterpretation(valenceStats.avg, 'valence');
  const heartRateInterpretation = getInterpretation(heartRateStats.avg, 'heartRate');

  return (
    <Card className="mt-8"> {/* 🔥 MOVER EL MARGEN AQUÍ, DIRECTAMENTE EN LA CARD */}
      <CardHeader className="pt-8 pb-6"> {/* 🔥 AUMENTAR PADDING SUPERIOR DEL HEADER */}
        <CardTitle className="flex items-center gap-2 text-[#4A2B4A]">
          <BarChart3 className="h-5 w-5" />
          Biometric Trends
          <span className="text-sm font-normal text-[#694969]">
            (Last {Math.max(stressHistory.length, arousalHistory.length, valenceHistory.length, heartRateHistory.length)} sessions)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="stress" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="stress">Stress</TabsTrigger>
            <TabsTrigger value="arousal">Energy Level</TabsTrigger>
            <TabsTrigger value="valence">Mood</TabsTrigger>
            <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stress" className="pt-4 space-y-6">
            {renderChart(stressHistory, "Stress Level (0-1)", "#8b5cf6", stressStats.max, stressStats.min)}
            
            {/* 🔥 SECCIÓN DE INTERPRETACIÓN */}
            <div className="bg-[#EBE5EB]/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <stressInterpretation.icon className="h-5 w-5 text-[#4A2B4A]" />
                <h4 className="font-semibold text-[#4A2B4A]">Stress Level Analysis</h4>
                <Badge className={stressInterpretation.color}>
                  {stressInterpretation.status}
                </Badge>
              </div>
              <p className="text-sm text-[#694969] mb-4">
                {stressInterpretation.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-muted-foreground block">Average</span>
                  <span className="font-medium text-[#4A2B4A]">
                    {isFinite(stressStats.avg) ? stressStats.avg.toFixed(3) : '0.000'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Peak</span>
                  <span className="font-medium text-[#4A2B4A]">
                    {isFinite(stressStats.max) ? stressStats.max.toFixed(3) : '0.000'}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Minimum</span>
                  <span className="font-medium text-[#4A2B4A]">
                    {isFinite(stressStats.min) ? stressStats.min.toFixed(3) : '0.000'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="arousal" className="pt-4 space-y-6">
            {renderChart(arousalHistory, "Energy Level (-1 to 1)", "#f59e0b", arousalStats.max, arousalStats.min)}
            
            <div className="bg-[#EBE5EB]/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <arousalInterpretation.icon className="h-5 w-5 text-[#4A2B4A]" />
                <h4 className="font-semibold text-[#4A2B4A]">Energy Level Analysis</h4>
                <Badge className={arousalInterpretation.color}>
                  {arousalInterpretation.status}
                </Badge>
              </div>
              <p className="text-sm text-[#694969] mb-4">
                {arousalInterpretation.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-muted-foreground block">Average</span>
                  <span className="font-medium text-[#4A2B4A]">{arousalStats.avg.toFixed(3)}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Peak</span>
                  <span className="font-medium text-[#4A2B4A]">{arousalStats.max.toFixed(3)}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Minimum</span>
                  <span className="font-medium text-[#4A2B4A]">{arousalStats.min.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="valence" className="pt-4 space-y-6">
            {renderChart(valenceHistory, "Emotional Mood (-1 to 1)", "#10b981", valenceStats.max, valenceStats.min)}
            
            <div className="bg-[#EBE5EB]/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <valenceInterpretation.icon className="h-5 w-5 text-[#4A2B4A]" />
                <h4 className="font-semibold text-[#4A2B4A]">Mood Analysis</h4>
                <Badge className={valenceInterpretation.color}>
                  {valenceInterpretation.status}
                </Badge>
              </div>
              <p className="text-sm text-[#694969] mb-4">
                {valenceInterpretation.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-muted-foreground block">Average</span>
                  <span className="font-medium text-[#4A2B4A]">{valenceStats.avg.toFixed(3)}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Peak</span>
                  <span className="font-medium text-[#4A2B4A]">{valenceStats.max.toFixed(3)}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Minimum</span>
                  <span className="font-medium text-[#4A2B4A]">{valenceStats.min.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="heart-rate" className="pt-4 space-y-6">
            {renderChart(heartRateHistory, "Heart Rate (bpm)", "#ef4444", heartRateStats.max, heartRateStats.min)}
            
            <div className="bg-[#EBE5EB]/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <heartRateInterpretation.icon className="h-5 w-5 text-[#4A2B4A]" />
                <h4 className="font-semibold text-[#4A2B4A]">Heart Rate Analysis</h4>
                <Badge className={heartRateInterpretation.color}>
                  {heartRateInterpretation.status}
                </Badge>
              </div>
              <p className="text-sm text-[#694969] mb-4">
                {heartRateInterpretation.description}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-muted-foreground block">Average</span>
                  <span className="font-medium text-[#4A2B4A]">{heartRateStats.avg.toFixed(1)} bpm</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Peak</span>
                  <span className="font-medium text-[#4A2B4A]">{heartRateStats.max.toFixed(1)} bpm</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground block">Minimum</span>
                  <span className="font-medium text-[#4A2B4A]">{heartRateStats.min.toFixed(1)} bpm</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}