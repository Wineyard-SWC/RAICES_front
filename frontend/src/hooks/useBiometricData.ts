"use client";

import { useState, useEffect } from "react";
import { useKanban } from "@/contexts/unifieddashboardcontext"; // 👈 Agregar este import

const API_URL = process.env.NEXT_PUBLIC_AVATAR_API || 'http://localhost:8009';

export interface BiometricSession {
  session_id: string;
  context_type: string;
  created_at: string;
  session_avg_stress: number;
  session_emotion: string;
  session_arousal: number;
  session_valence: number;
  user_name: string;
  user_avatar_url: string;
  user_firebase_id: string;
  baseline: {
    baseline_eeg_theta_beta: number;
    baseline_hrv_lf_hf: number;
    baseline_hr: number;
  };
  tasks: Array<{
    task_id: string;
    task_name: string;
    normalized_stress: number;
    emotion_label: string;
    heart_rate: number | null;
    created_at: string;
  }>;
}

export interface BiometricAnalytics {
  totalSessions: number;
  avgStress: number;
  avgArousal: number;
  avgValence: number;
  avgHeartRate: number;
  mostCommonEmotion: string;
  stressHistory: number[];
  arousalHistory: number[];
  valenceHistory: number[];
  heartRateHistory: number[];
  emotionDistribution: Record<string, number>;
  taskPerformance: Array<{
    taskName: string;
    avgStress: number;
    emotion: string;
    occurrences: number;
  }>;
  dailyTrends: Array<{
    date: string;
    avgStress: number;
    avgArousal: number;
    avgValence: number;
    sessions: number;
  }>;
  currentState: {
    stress: number;
    emotion: string;
    arousal: number;
    valence: number;
    heartRate: number;
    avatarUrl: string;
  };
}

export const useBiometricData = (userId: string) => {
  const { currentProject } = useKanban(); // 👈 Obtener currentProject del contexto
  const [sessions, setSessions] = useState<BiometricSession[]>([]);
  const [analytics, setAnalytics] = useState<BiometricAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSessions = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // 👈 Obtener projectId del contexto o localStorage como fallback
      const projectId = currentProject || localStorage.getItem("currentProjectId");
      
      // 👈 Construir URL con query parameter si hay projectId
      let url = `${API_URL}/sessions/user/${userId}`;
      if (projectId) {
        url += `?project_id=${projectId}`;
        console.log("🔍 Fetching biometric sessions for project:", projectId);
      } else {
        console.log("🔍 Fetching all biometric sessions (no project filter)");
      }

      console.log("📡 API URL:", url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: BiometricSession[] = await response.json();
      console.log("📊 Received biometric sessions:", data.length);
      
      setSessions(data);
      
      // Procesar analytics
      const processedAnalytics = processSessionData(data);
      setAnalytics(processedAnalytics);
      
    } catch (err) {
      console.error("Error fetching biometric data:", err);
      setError(err instanceof Error ? err.message : "Failed to load biometric data");
    } finally {
      setLoading(false);
    }
  };

  // Modificar la función processSessionData para manejar correctamente los nulls específicos:

  const processSessionData = (sessions: BiometricSession[]): BiometricAnalytics => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgStress: 0,
        avgArousal: 0,
        avgValence: 0,
        avgHeartRate: 0,
        mostCommonEmotion: "Unknown",
        stressHistory: [],
        arousalHistory: [],
        valenceHistory: [],
        heartRateHistory: [],
        emotionDistribution: {},
        taskPerformance: [],
        dailyTrends: [],
        currentState: {
          stress: 0,
          emotion: "Unknown",
          arousal: 0,
          valence: 0,
          heartRate: 0,
          avatarUrl: ""
        }
      };
    }

    // 🔥 FUNCIÓN HELPER PARA VALIDAR NÚMEROS
    const safeNumber = (value: any, fallback: number = 0): number => {
      if (value === null || value === undefined) return fallback;
      const num = parseFloat(value.toString());
      return isNaN(num) ? fallback : num;
    };

    // Ordenar sesiones por fecha (más reciente primero)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // 🔥 CALCULAR PROMEDIOS CON VALIDACIÓN DE NULLS
    const validStress = sessions.map(s => safeNumber(s.session_avg_stress)).filter(s => s >= 0);
    const validArousal = sessions.map(s => safeNumber(s.session_arousal));
    const validValence = sessions
      .map(s => safeNumber(s.session_valence)) // Esto manejará el session_valence: null
      .filter(v => v !== 0 || sessions.some(s => s.session_valence === 0)); // Mantener 0s reales, excluir fallbacks

    const avgStress = validStress.length > 0 ? validStress.reduce((sum, s) => sum + s, 0) / validStress.length : 0;
    const avgArousal = validArousal.length > 0 ? validArousal.reduce((sum, s) => sum + s, 0) / validArousal.length : 0;
    const avgValence = validValence.length > 0 ? validValence.reduce((sum, s) => sum + s, 0) / validValence.length : 0;
    
    // 🔥 CALCULAR HEART RATE CON VALIDACIÓN DE NULLS
    const allHeartRates = sessions
      .flatMap(s => s.tasks.map(t => safeNumber(t.heart_rate))) // Esto manejará heart_rate: null
      .filter(hr => hr > 0); // Solo heart rates válidos (mayor a 0)
      
    const avgHeartRate = allHeartRates.length > 0 
      ? allHeartRates.reduce((sum, hr) => sum + hr, 0) / allHeartRates.length 
      : 0;

    // Distribución de emociones
    const emotionDistribution: Record<string, number> = {};
    sessions.forEach(s => {
      const emotion = s.session_emotion || "Unknown";
      emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;
    });

    const mostCommonEmotion = Object.entries(emotionDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Unknown";

    // 🔥 HISTORIALES CON VALIDACIÓN (últimas 14 sesiones)
    const recentSessions = sortedSessions.slice(0, 14).reverse();
    const stressHistory = recentSessions.map(s => safeNumber(s.session_avg_stress));
    const arousalHistory = recentSessions.map(s => safeNumber(s.session_arousal));
    const valenceHistory = recentSessions.map(s => safeNumber(s.session_valence)); // Maneja nulls
    const heartRateHistory = recentSessions.map(s => safeNumber(s.baseline?.baseline_hr));

    // Performance por tarea
    const taskStats: Record<string, {stress: number[], emotions: string[], count: number}> = {};
    
    sessions.forEach(session => {
      session.tasks.forEach(task => {
        const taskName = task.task_name || "Unknown Task";
        if (!taskStats[taskName]) {
          taskStats[taskName] = { stress: [], emotions: [], count: 0 };
        }
        taskStats[taskName].stress.push(safeNumber(task.normalized_stress));
        taskStats[taskName].emotions.push(task.emotion_label || "Unknown");
        taskStats[taskName].count++;
      });
    });

    const taskPerformance = Object.entries(taskStats).map(([taskName, stats]) => ({
      taskName,
      avgStress: stats.stress.length > 0 ? stats.stress.reduce((sum, s) => sum + s, 0) / stats.stress.length : 0,
      emotion: stats.emotions.filter(e => e !== "Unknown").sort((a, b) => 
        stats.emotions.filter(e => e === b).length - stats.emotions.filter(e => e === a).length
      )[0] || "Unknown",
      occurrences: stats.count
    }));

    // 🔥 TENDENCIAS DIARIAS CON VALIDACIÓN
    const dailyStats: Record<string, {stress: number[], arousal: number[], valence: number[], count: number}> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { stress: [], arousal: [], valence: [], count: 0 };
      }
      dailyStats[date].stress.push(safeNumber(session.session_avg_stress));
      dailyStats[date].arousal.push(safeNumber(session.session_arousal));
      dailyStats[date].valence.push(safeNumber(session.session_valence)); // Maneja nulls
      dailyStats[date].count++;
    });

    const dailyTrends = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        avgStress: stats.stress.length > 0 ? stats.stress.reduce((sum, s) => sum + s, 0) / stats.stress.length : 0,
        avgArousal: stats.arousal.length > 0 ? stats.arousal.reduce((sum, s) => sum + s, 0) / stats.arousal.length : 0,
        avgValence: stats.valence.length > 0 ? stats.valence.reduce((sum, s) => sum + s, 0) / stats.valence.length : 0,
        sessions: stats.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    // 🔥 ESTADO ACTUAL CON VALIDACIÓN (sesión más reciente)
    const latestSession = sortedSessions[0];
    const currentState = {
      stress: safeNumber(latestSession.session_avg_stress),
      emotion: latestSession.session_emotion || "Unknown",
      arousal: safeNumber(latestSession.session_arousal),
      valence: safeNumber(latestSession.session_valence), // Maneja null
      heartRate: safeNumber(latestSession.baseline?.baseline_hr),
      avatarUrl: latestSession.user_avatar_url || ""
    };

    return {
      totalSessions: sessions.length,
      avgStress,
      avgArousal,
      avgValence,
      avgHeartRate,
      mostCommonEmotion,
      stressHistory,
      arousalHistory,
      valenceHistory,
      heartRateHistory,
      emotionDistribution,
      taskPerformance,
      dailyTrends,
      currentState
    };
  };

  useEffect(() => {
    fetchUserSessions();
  }, [userId, currentProject]); // 👈 Agregar currentProject como dependencia para refetch cuando cambie

  return {
    sessions,
    analytics,
    loading,
    error,
    refetch: fetchUserSessions,
    currentProject // 👈 Exponer el currentProject para debugging si es necesario
  };
};