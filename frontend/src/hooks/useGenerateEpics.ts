'use client';

import { useState } from "react";

export const useGenerateEpics = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const route = process.env.EPIC_ROUTE!  
    
    const generate = async (requirementDescription: string) => {
      setIsLoading(true);
      setError(null);
  
      try {
        const response = await fetch(route, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: "Generate a list of {epics} in a SCRUM methodology from {requirements}",
            data: {
              epics: "concise and simple",
              requirements: requirementDescription
            }
          }),
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to generate epics');
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