'use client';

import { useState } from "react";
import { Epic, EpicResponse } from "@/types/epic";
import { Requirement } from "@/types/requirement";
import { useSessionContext } from "@/contexts/sessioncontext";
import { useLanguageContext } from "@/contexts/languagecontext";

export const useGenerateEpics = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<EpicResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { sessionId} = useSessionContext();
    const { language} = useLanguageContext();

    // Use relative URL to your API route proxy
    const apiUrl = '/api/proxy/epics';  

    const currentSession_id = sessionId
    const lang = language

    const generate = async (requirementDescription: {
      funcionales: any[];
      no_funcionales: any[];
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              "requirements_description": requirementDescription,
              "session_id": currentSession_id,
              "lang": lang || "en"
          })
      
      });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.error || `API responded with status: ${response.status}`
            );
        }
        
        const data = await response.json();

        setGeneratedOutput({
          content: data.content
        });

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