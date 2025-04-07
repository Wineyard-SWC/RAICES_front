'use client';
import { useState } from "react";

export const useGenerateRequirements = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const route = process.env.REQUIREMENT_ROUTE!
    
    const generate = async (projectDescription: string) => {
      setIsLoading(true);
      setError(null);
      /*
      try {
        const response = await fetch(route, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "message": projectDescription,
                "session_id": "",
                "save_to_kb": false
            })
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to generate user stories');
        
        setGeneratedOutput(data.data);*/

        try {
          await new Promise((res) => setTimeout(res, 1000)); 
      
          const mockedResponse = {
            content: {
              funcionales: [
                {
                  id: "REQ-001",
                  title: "Inicio de sesión",
                  description: "El sistema debe permitir a los usuarios iniciar sesión.",
                  category: "Funcional",
                  priority: "Alta",
                },
              ],
              no_funcionales: [
                {
                  id: "REQ-NF-001",
                  title: "Interfaz amigable",
                  description: "La interfaz debe ser intuitiva y fácil de usar.",
                  category: "No Funcional",
                  priority: "Media",
                },
              ],
            }
          };
      
        setGeneratedOutput(mockedResponse);

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