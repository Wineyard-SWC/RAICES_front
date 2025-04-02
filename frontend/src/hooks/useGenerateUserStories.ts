'use client';
import { useState } from "react";

export const useGenerateUserStories = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const route = process.env.EPIC_ROUTE!
  
  const generate = async (epicDescription: string) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch(route, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Generate a list of {user-stories} in a SCRUM methodology from {epics}",
          data: {
            "user-stories": "concise and simple",
            epics: epicDescription
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate user stories');
      setGeneratedOutput(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    isLoading,
    generatedOutput,
    error,
  };
};