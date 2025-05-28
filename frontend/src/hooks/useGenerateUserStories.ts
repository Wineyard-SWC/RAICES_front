'use client';
import { useState } from "react";
import { UserStoryResponse } from "@/types/userstory";
import { useGenerativeAISession } from "@/contexts/generativeAISessionContext"; // Updated import
import { useLanguageContext } from "@/contexts/languagecontext";


export const useGenerateUserStories = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<UserStoryResponse| null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sessionId} = useGenerativeAISession(); // Updated hook
  const { language} = useLanguageContext();
  

  const route = process.env.NEXT_PUBLIC_USER_STORY_ROUTE!
  
  const currentSession_id = sessionId
  const lang = language


  const generate = async (epicDescription: {
    content: any[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(route, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "epic_description": epicDescription,
          "session_id": currentSession_id || "",
          "lang": "en"
      })
      });
    
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
            errorData?.error || `API responded with status: ${response.status}`
        )
      };
        
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