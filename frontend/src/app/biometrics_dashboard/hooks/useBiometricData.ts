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

    // Ordenar sesiones por fecha (más reciente primero)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calcular promedios
    const avgStress = sessions.reduce((sum, s) => sum + s.session_avg_stress, 0) / sessions.length;
    const avgArousal = sessions.reduce((sum, s) => sum + s.session_arousal, 0) / sessions.length;
    const avgValence = sessions.reduce((sum, s) => sum + s.session_valence, 0) / sessions.length;
    
    // Calcular promedio de heart rate de todas las tareas
    const allHeartRates = sessions
      .flatMap(s => s.tasks.map(t => t.heart_rate))
      .filter(hr => hr !== null) as number[];
    const avgHeartRate = allHeartRates.length > 0 
      ? allHeartRates.reduce((sum, hr) => sum + hr, 0) / allHeartRates.length 
      : 0;

    // Distribución de emociones
    const emotionDistribution: Record<string, number> = {};
    sessions.forEach(s => {
      emotionDistribution[s.session_emotion] = (emotionDistribution[s.session_emotion] || 0) + 1;
    });

    const mostCommonEmotion = Object.entries(emotionDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Unknown";

    // Historiales (últimas 14 sesiones)
    const recentSessions = sortedSessions.slice(0, 14).reverse();
    const stressHistory = recentSessions.map(s => s.session_avg_stress);
    const arousalHistory = recentSessions.map(s => s.session_arousal);
    const valenceHistory = recentSessions.map(s => s.session_valence);
    const heartRateHistory = recentSessions.map(s => s.baseline.baseline_hr);

    // Performance por tarea
    const taskStats: Record<string, {stress: number[], emotions: string[], count: number}> = {};
    
    sessions.forEach(session => {
      session.tasks.forEach(task => {
        if (!taskStats[task.task_name]) {
          taskStats[task.task_name] = { stress: [], emotions: [], count: 0 };
        }
        taskStats[task.task_name].stress.push(task.normalized_stress);
        taskStats[task.task_name].emotions.push(task.emotion_label);
        taskStats[task.task_name].count++;
      });
    });

    const taskPerformance = Object.entries(taskStats).map(([taskName, stats]) => ({
      taskName,
      avgStress: stats.stress.reduce((sum, s) => sum + s, 0) / stats.stress.length,
      emotion: stats.emotions.sort((a, b) => 
        stats.emotions.filter(e => e === b).length - stats.emotions.filter(e => e === a).length
      )[0],
      occurrences: stats.count
    }));

    // Tendencias diarias (últimos 7 días)
    const dailyStats: Record<string, {stress: number[], arousal: number[], valence: number[], count: number}> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { stress: [], arousal: [], valence: [], count: 0 };
      }
      dailyStats[date].stress.push(session.session_avg_stress);
      dailyStats[date].arousal.push(session.session_arousal);
      dailyStats[date].valence.push(session.session_valence);
      dailyStats[date].count++;
    });

    const dailyTrends = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        avgStress: stats.stress.reduce((sum, s) => sum + s, 0) / stats.stress.length,
        avgArousal: stats.arousal.reduce((sum, s) => sum + s, 0) / stats.arousal.length,
        avgValence: stats.valence.reduce((sum, s) => sum + s, 0) / stats.valence.length,
        sessions: stats.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    // Estado actual (sesión más reciente)
    const latestSession = sortedSessions[0];
    const currentState = {
      stress: latestSession.session_avg_stress,
      emotion: latestSession.session_emotion,
      arousal: latestSession.session_arousal,
      valence: latestSession.session_valence,
      heartRate: latestSession.baseline.baseline_hr,
      avatarUrl: latestSession.user_avatar_url
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