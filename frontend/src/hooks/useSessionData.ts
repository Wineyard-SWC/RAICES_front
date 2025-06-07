"use client";

import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useMuse } from "./useMuse";
import { CHANNELS } from "@/utils/muse/channels";
import { useBiometricContext } from "@/contexts/BiometricContext";
import { useSessionRelation } from "./useSessionRelation";
import { useKanban } from "@/contexts/unifieddashboardcontext"; // 👈 Agregar este import
import { print } from "@/utils/debugLogger";

const AVATAR_API = process.env.NEXT_PUBLIC_AVATAR_API;

export interface TaskPacket {
  taskId: string;
  taskName: string;
  userRating: number;
  explanation?: string;
  eeg: { channel: (typeof CHANNELS)[number]; values: number[] }[];
  ppg: number[];
  hr: number[];
}

export function useSessionData() {
  const { data: session } = useSession();
  const { pause, resume, drainRawData } = useMuse();
  const { restBaseline, setRestBaseline } = useBiometricContext();
  const { sessionRelationId } = useSessionRelation();
  const { currentProject } = useKanban(); // 👈 Obtener currentProject del contexto

  const [isSubmitting, setSubmitting] = useState(false);

  const captureRestData = useCallback(() => {
    print("🔍 captureRestData: Starting baseline capture");
    pause();
    print("🔍 captureRestData: Pausing data capture");
    const raw = drainRawData();
    
    print("si estoy llegando acá -----------------------", raw);
    setRestBaseline(raw);
 
    print("🔍 captureRestData: Captured baseline data", JSON.stringify(raw));

    resume();
    return raw;
  }, [pause, resume, drainRawData, setRestBaseline]);

  const captureTaskData = useCallback(
    (id: string, name: string, rating: number, explanation?: string): TaskPacket => {
      pause();
      const raw = drainRawData();
      resume();
      return { taskId: id, taskName: name, userRating: rating, explanation, ...raw };
    },
    [pause, resume, drainRawData]
  );

  const submitParticipantSession = useCallback(
    async (participantId: string, tasks: TaskPacket[]) => {
      if (!session?.user?.uid) {
        print("no user id", session?.user?.uid);
        return false;
      }

      if (!restBaseline) {
        print("⚠️ No rest baseline data captured.", restBaseline);
        return false;
      }

      // 👈 Obtener projectId del contexto o localStorage como fallback
      const projectId = currentProject || localStorage.getItem("currentProjectId") || "default_project";
      
      print("🏗️ Using projectId for session:", projectId);

      setSubmitting(true);
      try {
        // 👈 Incluir projectId en el sessionId
        const sessionId = `session_${Date.now()}_${projectId}_${session.user.uid}`;
        
        const payload = {
          sessionId,
          userFirebaseId: participantId,
          participantId,
          contextType: "task_evaluation",
          restData: restBaseline,
          tasks,
          sessionRelation: sessionRelationId,
          projectId, // 👈 También enviarlo como campo separado para mayor claridad
        };

        print("📤 Sending biometric session payload:");
        print("🏗️ ProjectId included:", projectId);
        print("🆔 SessionId format:", sessionId);
        print(JSON.stringify(payload, null, 2));

        const res = await fetch(`${AVATAR_API}/biometrics/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
            console.error("Error submitting session:", res.status, res.statusText);
            print("Error payload:", payload);
            print("Detalles de validación:", await res.json());
        }

        return res.ok;
      } finally {
        setSubmitting(false);
      }
    },
    [session, restBaseline, sessionRelationId, currentProject] // 👈 Agregar currentProject a las dependencias
  );

  return {
    captureRestData,
    captureTaskData,
    submitParticipantSession,
    isSubmitting,
    restBaseline,
  };
}