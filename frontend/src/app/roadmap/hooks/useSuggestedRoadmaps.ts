"use-client";

import {useState} from "react"
import { UserStoryInput, SuggestedPhase, UseSuggestedRoadmapResult } from "./interfaces/useSuggestedRoadmapsProps"
import { roadmapPrompt } from "../utils/roadmappropmt"

const parseRoadmapResponse = (raw: string) => {

        if (typeof raw !== 'string') {
            console.error("parseRoadmapResponse received non-string:", typeof raw, raw);
            return [];
        }

        const cleaned = raw
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/\s*```$/i, "");
    
        let arr: any;
        try {
            arr = JSON.parse(cleaned);
            
            // Si es string escapado, parsear de nuevo
            if (typeof arr === 'string') {
                arr = JSON.parse(arr);
            }
        } catch (e) {
            console.error("JSON.parse failed", e, "Cleaned:", cleaned);
            return [];
        }
        
        // Validar estructura
        if (!arr.phases || !Array.isArray(arr.phases)) {
            console.error("Invalid structure - missing phases array", arr);
            return [];
        }
        
        return arr.phases;
    };

export function useSuggestedRoadmap(): UseSuggestedRoadmapResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedRoadmaps, setSuggestedRoadmaps] = useState<SuggestedPhase[]>([]);

    const generateSuggestedRoadmap = async (mappedstories: UserStoryInput[]) => {
        setLoading(true);
        setError(null);

        const payload = {
            prompt: roadmapPrompt(),
            data: {
                stories: mappedstories
            }
        };

        try {
            const response = await fetch("https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseText = await response.text();
            
            let apiResult;
            try {
                apiResult = JSON.parse(responseText);
            } catch (jsonError) {
                console.error("Failed to parse API response as JSON:");
                throw new Error("API returned invalid JSON");
            }

            let aiResponseText = null;
            
            if (apiResult.success && apiResult.data) {
                aiResponseText = apiResult.data;
            } else if (typeof apiResult === 'string') {
                aiResponseText = apiResult;
            } else if (apiResult.content) {
                aiResponseText = apiResult.content;
            } else if (apiResult.response) {
                aiResponseText = apiResult.response;
            } else if (apiResult.choices && apiResult.choices[0]?.message?.content) {
                aiResponseText = apiResult.choices[0].message.content;
            } else if (apiResult.phases) {
                setSuggestedRoadmaps(apiResult.phases);
                return;
            } else {
                console.error("Unexpected API response format:");
                throw new Error("Unexpected API response format");
            }

            if (!aiResponseText) {
                throw new Error("No content found in API response");
            }

            const phases = parseRoadmapResponse(aiResponseText);
            
            if (phases.length === 0) {
                throw new Error("Failed to parse roadmap phases");
            }

            setSuggestedRoadmaps(phases);

            return phases 
        } catch (err: any) {
            console.error("Generation error:", err);
            setError(`Failed to generate roadmap`);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, suggestedRoadmaps, generateSuggestedRoadmap };
}