"use client";

import { printError } from "@/utils/debugLogger";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProjectData {
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  startDate: string;
  endDate: string;
  invitationCode: string;
  tasksCompleted: number;
  totalTasks: number;
  team: string;
  teamSize: number;
  members?: string[];
}

export const useCreateProject = (userId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (projectData: ProjectData): Promise<string | null> => {
    if (!userId) {
      setError("Usuario no autenticado");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const projectResponse = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!projectResponse.ok) {
        throw new Error("Error al crear el proyecto");
      }

      const newProject = await projectResponse.json();

      // Crear la relación entre el usuario y el proyecto
      const relationResponse = await fetch(`${API_URL}/project_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userRef: userId,
          projectRef: newProject.id,
          role: "Owner",
          joinedAt: new Date().toISOString(),
        }),
      });

      if (!relationResponse.ok) {
        throw new Error("Error al crear la relación usuario-proyecto");
      }

      return newProject.id; // Devuelve el ID del proyecto
    } catch (err) {
      printError("Error al crear el proyecto:", err);
      setError("No se pudo crear el proyecto");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createProject, loading, error };
};
