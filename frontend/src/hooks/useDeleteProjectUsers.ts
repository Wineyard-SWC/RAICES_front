"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useDeleteProjectUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProjectUsers = async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
    //   console.log("[DELETE PROJECT USERS] Deleting relations for projectId:", projectId);

      const response = await fetch(`${API_URL}/project_users/project/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project-user relations");
      }

      const result = await response.json();
    //   console.log("[DELETE PROJECT USERS] Response from server:", result);

      return true;
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProjectUsers, loading, error };
};