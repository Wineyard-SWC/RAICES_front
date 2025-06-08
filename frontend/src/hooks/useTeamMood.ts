"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { printError, print } from "@/utils/debugLogger";

interface MemberMoodData {
  memberId: string;
  memberName: string;
  mood: number;
  valence: number;
  stress: number;
  sessionCount: number;
  lastSessionDate: string | null;
  mostCommonEmotion: string;
  moodInterpretation: {
    emoji: string;
    label: string;
    color: string;
  };
}

interface TeamMoodData {
  averageMood: number;
  memberCount: number;
  memberMoods: MemberMoodData[];
  moodInterpretation: {
    emoji: string;
    label: string;
    color: string;
  };
}

const API_URL = "https://raices-hq.onrender.com/api";

// 🔥 CACHE PARA EVITAR LLAMADAS REPETITIVAS
const moodCache = new Map<string, { data: TeamMoodData; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minuto

export const useTeamMood = (teamMembers: any[], projectId: string | null) => {
  const [teamMood, setTeamMood] = useState<TeamMoodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔥 REFS PARA EVITAR RE-EJECUCIONES
  const isLoadingRef = useRef(false);
  const lastFetchRef = useRef<string>("");

  // 🔥 MEMOIZAR TEAM MEMBERS PARA EVITAR CAMBIOS CONSTANTES
  const stableTeamMembers = useMemo(() => {
    if (!teamMembers?.length) return [];
    return teamMembers.map(member => ({
      id: member.id,
      name: member.name
    }));
  }, [teamMembers?.length, teamMembers?.map(m => m.id).join(',')]);

  // 🔥 CREAR CACHE KEY ESTABLE
  const cacheKey = useMemo(() => {
    if (!projectId || !stableTeamMembers.length) return null;
    const memberIds = stableTeamMembers.map(m => m.id).sort().join(',');
    return `${projectId}-${memberIds}`;
  }, [projectId, stableTeamMembers]);

  useEffect(() => {
    // 🔥 VALIDACIONES TEMPRANAS
    if (!projectId || !stableTeamMembers.length) {
      setTeamMood(null);
      setLoading(false);
      return;
    }

    if (!cacheKey) return;

    // 🔥 EVITAR LLAMADAS DUPLICADAS
    if (isLoadingRef.current || lastFetchRef.current === cacheKey) {
      return;
    }

    // 🔥 VERIFICAR CACHE PRIMERO
    const cached = moodCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      print("🎯 Using cached team mood data");
      setTeamMood(cached.data);
      setLoading(false);
      return;
    }

    // 🔥 MARCAR COMO LOADING Y FETCH KEY
    isLoadingRef.current = true;
    lastFetchRef.current = cacheKey;
    setLoading(true);
    setError(null);

    const fetchTeamMood = async () => {
      try {
        print(`🎯 Fetching team mood for ${stableTeamMembers.length} members`);

        // 🔥 FETCH CON TIMEOUT Y MEJOR MANEJO DE ERRORES
        const memberPromises = stableTeamMembers.map(async (member) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const url = `${API_URL}/sessions/user/${member.id}?project_id=${projectId}`;
            const response = await fetch(url, { 
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/json',
              }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              // 🔥 NO LOGUEAR ERROR PARA 404 (miembro sin sesiones)
              if (response.status !== 404) {
                printError(`Failed to fetch data for member ${member.name}:`, response.statusText);
              }
              return createDefaultMemberMood(member);
            }
            
            const sessions = await response.json();
            
            if (!sessions?.length) {
              return createDefaultMemberMood(member);
            }

            return processMemberSessions(member, sessions);

          } catch (err) {
            // 🔥 MANEJO SILENCIOSO DE ERRORES PARA MIEMBROS SIN DATOS
            if (err.name === 'AbortError') {
              print(`⏱️ Request timeout for member ${member.name}`);
            } else {
              print(`⚠️ Error fetching data for member ${member.name}: ${err.message}`);
            }
            return createDefaultMemberMood(member);
          }
        });

        const memberMoods = await Promise.all(memberPromises);
        const validMoods = memberMoods.filter(Boolean);

        if (!validMoods.length) {
          throw new Error("No valid mood data found for any team member");
        }

        // Calcular promedios del equipo
        const totalMood = validMoods.reduce((sum, mood) => sum + mood.mood, 0);
        const averageMood = Math.round(totalMood / validMoods.length);

        const teamMoodData: TeamMoodData = {
          averageMood,
          memberCount: validMoods.length,
          memberMoods: validMoods,
          moodInterpretation: getMoodInterpretation(averageMood / 100 * 2 - 1, 0) // Convert to valence range
        };

        // 🔥 GUARDAR EN CACHE
        moodCache.set(cacheKey, {
          data: teamMoodData,
          timestamp: Date.now()
        });

        setTeamMood(teamMoodData);
        print(`✅ Team mood loaded successfully for ${validMoods.length} members`);

      } catch (err) {
        printError("Error fetching team mood:", err);
        setError(err.message);
        setTeamMood(null);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    fetchTeamMood();
  }, [cacheKey]); // 🔥 SOLO DEPENDE DE CACHE KEY ESTABLE

  return { teamMood, loading, error };
};

// 🔥 FUNCIONES HELPER PARA REDUCIR DUPLICACIÓN
function createDefaultMemberMood(member: any): MemberMoodData {
  return {
    memberId: member.id,
    memberName: member.name,
    mood: 50,
    valence: 0,
    stress: 0,
    sessionCount: 0,
    lastSessionDate: null,
    mostCommonEmotion: 'neutral',
    moodInterpretation: { emoji: '😐', label: 'No Data', color: 'text-gray-500' }
  };
}

function processMemberSessions(member: any, sessions: any[]): MemberMoodData {
  // Calcular promedios para este miembro
  const validValence = sessions
    .map(s => s.session_valence)
    .filter(v => v !== null && v !== undefined);
  
  const validStress = sessions
    .map(s => s.session_avg_stress)
    .filter(s => s !== null && s !== undefined && s >= 0);

  const avgValence = validValence.length > 0 
    ? validValence.reduce((sum, v) => sum + v, 0) / validValence.length 
    : 0;
  
  const avgStress = validStress.length > 0 
    ? validStress.reduce((sum, s) => sum + s, 0) / validStress.length 
    : 0;

  // Calcular emoción más común
  const emotionCounts = {};
  sessions.forEach(session => {
    const emotion = session.session_emotion || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const mostCommonEmotion = Object.entries(emotionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

  // Calcular mood score
  const moodScore = ((avgValence + 1) / 2) * 100;
  const adjustedMood = Math.max(0, moodScore - (avgStress * 50));

  // Última sesión
  const lastSession = sessions.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  return {
    memberId: member.id,
    memberName: member.name,
    mood: Math.round(adjustedMood),
    valence: avgValence,
    stress: avgStress,
    sessionCount: sessions.length,
    lastSessionDate: lastSession?.created_at || null,
    mostCommonEmotion,
    moodInterpretation: getMoodInterpretation(avgValence, avgStress)
  };
}

function getMoodInterpretation(valence: number, stress: number) {
  if (valence > 0.3 && stress < 0.3) {
    return { emoji: "😊", label: "Great", color: "text-green-600" };
  } else if (valence > 0 && stress < 0.5) {
    return { emoji: "🙂", label: "Good", color: "text-green-500" };
  } else if (valence > -0.2 && stress < 0.7) {
    return { emoji: "😐", label: "Neutral", color: "text-yellow-500" };
  } else if (valence < -0.2 || stress > 0.7) {
    return { emoji: "😟", label: "Stressed", color: "text-red-500" };
  } else {
    return { emoji: "😔", label: "Poor", color: "text-red-600" };
  }
}