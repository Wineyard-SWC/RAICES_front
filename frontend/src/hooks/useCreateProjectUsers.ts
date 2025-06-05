"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProjectUserRelation {
  userRef: string;
  projectRef: string;
  role: string;
  joinedAt: string;
}

export const useCreateProjectUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProjectUsers = async (
    projectId: string,
    users: { id: string; role: string }[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
    //   console.log("[CREATE PROJECT USERS] Starting creation for projectId:", projectId);
    //   console.log("[CREATE PROJECT USERS] Users to create relations for:", users);

      const promises = users.map((user) =>
        fetch(`${API_URL}/project_users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userRef: user.id,
            projectRef: projectId,
            role: user.role,
            joinedAt: new Date().toISOString(),
          }),
        })
      );

      const responses = await Promise.all(promises);

    //   console.log("[CREATE PROJECT USERS] Responses from server:", responses);

      const failedResponses = responses.filter((res) => !res.ok);
      if (failedResponses.length > 0) {
        console.error("Failed responses:", failedResponses);
        throw new Error(
          `Failed to create ${failedResponses.length} project-user relations`
        );
      }

    //   console.log("[CREATE PROJECT USERS] All relations created successfully.");
      return true;
    } catch (err) {
      console.error("Error creating project-user relations:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createProjectUsers, loading, error };
};