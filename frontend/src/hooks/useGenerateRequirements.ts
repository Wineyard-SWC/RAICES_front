'use client';

import { useState } from "react";
import { useSessionContext } from "@/contexts/sessioncontext";
import { useLanguageContext } from "@/contexts/languagecontext";


export const useGenerateRequirements = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { sessionId,setSessionId} = useSessionContext();
    const { language,setLanguage} = useLanguageContext();

    // Use relative URL to your API route proxy instead of the direct HTTP URL
    const apiUrl = '/api/proxy/requirements';

   
    const lang = language || "en"


    const generate = async (projectDescription: string) => {
      setIsLoading(true);
      setError(null);

      if (!apiUrl) {
        setError("API configuration error: URL not defined");
        return;
      }


      try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "message": projectDescription,
                "session_id": sessionId || "",
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
            
            
            setSessionId(data.session_id)

            setGeneratedOutput({
                content: data.message.content
            });
            
        } catch (err: any) {
            console.error("Error in API call:", err);
            setError(err.message || "Failed to communicate with the API");
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