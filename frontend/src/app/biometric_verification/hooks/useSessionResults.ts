"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_AVATAR_API || 'http://localhost:8009';

interface Task {
  task_id: string;
  task_name: string;
  normalized_stress: number;
  emotion_label: string;
  heart_rate: number | null;
  created_at: string;
}

interface Baseline {
  baseline_eeg_theta_beta: number;
  baseline_hrv_lf_hf: number;
  baseline_hr: number;
}

interface Session {
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
  baseline: Baseline;
  tasks: Task[];
}

interface SessionResults {
  session_relation: string;
  total_participants: number;
  sessions: Session[];
}

export const useSessionResults = (sessionRelationId: string | null) => {
  const [data, setData] = useState<SessionResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchSessionResults = useCallback(async (forceRefresh = false) => {
    if (!sessionRelationId) {
      setData(null);
      return;
    }

    // Evitar llamadas muy frecuentes (mínimo 2 segundos entre llamadas)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 2000) {
      console.log("🔄 Skipping fetch, too soon since last call");
      return;
    }

    setLoading(true);
    setError(null);
    setLastFetchTime(now);

    try {
      console.log(`🔍 Fetching session results for: ${sessionRelationId}`);
      
      const response = await fetch(`${API_URL}/sessions/by-relation/${sessionRelationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agregar cache-busting
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const results = await response.json();
      
      console.log("📊 Session results loaded:", {
        total_participants: results.total_participants,
        sessions_found: results.sessions?.length || 0,
        session_relation: results.session_relation
      });
      
      // Log de cada sesión para debug
      results.sessions?.forEach((session, index) => {
        console.log(`📊 Session ${index + 1}: ${session.user_name} (${session.tasks.length} tasks)`);
      });
      
      setData(results);
    } catch (err) {
      console.error("❌ Error fetching session results:", err);
      setError(err instanceof Error ? err.message : "Failed to load session results");
    } finally {
      setLoading(false);
    }
  }, [sessionRelationId, lastFetchTime]);

  // Initial fetch
  useEffect(() => {
    if (sessionRelationId) {
      console.log("🚀 Initial fetch for session:", sessionRelationId);
      fetchSessionResults(true);
    }
  }, [sessionRelationId]);

  // Refetch function for manual calls
  const refetch = useCallback(() => {
    console.log("🔄 Manual refetch triggered");
    fetchSessionResults(true);
  }, [fetchSessionResults]);

  return { 
    data, 
    loading, 
    error, 
    refetch 
  };
};

export type { SessionResults, Session, Task, Baseline };