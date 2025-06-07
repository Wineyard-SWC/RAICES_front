"use client";

import { printError } from "@/utils/debugLogger";
import { useState } from "react";

export interface Question {
  id: string;
  type: "open" | "scale" | "multiple_choice";
  question: string;
  description?: string;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: {
    min: string;
    max: string;
  };
  options?: string[];
  category: "stress" | "mood" | "cognitive_load" | "general";
  expected_stress_level: "low" | "medium" | "high";
}

export interface GenerateQuestionsPayload {
  session_objective: string;
  target_stress_levels: string[];
  participant_count: number;
  session_duration: number;
  question_types: string[];
  focus_areas: string[];
  context_description: string; // 👈 Nuevo campo para el texto del usuario
}

// 👈 Función similar a buildTasksPrompt
export const buildQuestionsPrompt = (): string => {
  return `You are an expert in creating biometric session questions for stress and mood evaluation in workplace settings.

Generate a set of questions for a biometric monitoring session based on the provided context and requirements.

QUESTION TYPES:
- "open": Open-ended questions that encourage detailed responses and introspection
- "scale": Likert scale questions (1-5 or 1-7) for quantifiable emotional/stress responses  
- "multiple_choice": Questions with 3-5 predefined answer options

CATEGORIES:
- "stress": Questions designed to induce, measure, or explore stress responses
- "mood": Questions to assess current emotional state and general well-being
- "cognitive_load": Questions about mental effort, focus, and cognitive demands
- "general": General questions about work environment, session experience

STRESS LEVELS (expected biometric response):
- "low": Questions that should maintain calm or reduce stress (baseline/recovery questions)
- "medium": Questions that may create moderate cognitive load or mild stress
- "high": Questions designed to induce higher stress responses for measurement

REQUIREMENTS:
- Questions must be professionally appropriate for workplace biometric sessions
- Include variety of question types based on session objectives
- Questions should be culturally sensitive and inclusive
- Provide clear, concise wording that's easy to understand in a session setting
- For scale questions, include meaningful min/max labels
- For multiple choice, provide 3-5 relevant, distinct options
- Consider the session context and tailor questions accordingly
- Balance between measurement questions and stress-inducing questions

RESPONSE FORMAT (JSON only, no markdown):
{
  "questions": [
    {
      "id": "unique_question_id",
      "type": "scale|open|multiple_choice",
      "question": "Clear, direct question text",
      "description": "Optional context or instructions for the participant",
      "scale_min": 1,
      "scale_max": 5,
      "scale_labels": {
        "min": "Not at all/Very low",
        "max": "Extremely/Very high"
      },
      "options": ["Option 1", "Option 2", "Option 3"],
      "category": "stress|mood|cognitive_load|general",
      "expected_stress_level": "low|medium|high"
    }
  ]
}`;
};

// 👈 Función similar a buildTasksPayload
export const buildQuestionsPayload = (payload: GenerateQuestionsPayload) => ({
  prompt: buildQuestionsPrompt(),
  data: {
    session_context: {
      objective: payload.session_objective,
      context_description: payload.context_description,
      duration_minutes: payload.session_duration,
      participant_count: payload.participant_count
    },
    question_requirements: {
      target_stress_levels: payload.target_stress_levels,
      question_types: payload.question_types,
      focus_areas: payload.focus_areas
    }
  }
});

// 👈 Función similar a parseTasksFromApi
export const parseQuestionsFromApi = (raw: string): Question[] => {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "");

  let data: any;
  try {
    data = JSON.parse(cleaned);
  } catch (e) {
    printError("JSON.parse failed for questions", cleaned);
    return [];
  }

  if (!data.questions || !Array.isArray(data.questions)) {
    printError("Invalid questions format", data);
    return [];
  }

  return data.questions.map((q: any): Question => ({
    id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: q.type || "scale",
    question: q.question || "",
    description: q.description,
    scale_min: q.scale_min || 1,
    scale_max: q.scale_max || 5,
    scale_labels: q.scale_labels || { min: "Low", max: "High" },
    options: q.options || [],
    category: q.category || "general",
    expected_stress_level: q.expected_stress_level || "medium"
  }));
};

export const useGenerateQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async (payload: GenerateQuestionsPayload): Promise<Question[]> => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = buildQuestionsPayload(payload);

      console.log("🤖 Generating questions with payload:", requestBody);

      const response = await fetch("https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("🔄 Raw API response:", responseData);

      if (!responseData.success) {
        throw new Error(responseData.error || "Generation failed");
      }

      const questions = parseQuestionsFromApi(responseData.data);
      console.log("✅ Parsed questions:", questions);

      return questions;
    } catch (err) {
      printError("Error generating questions:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate questions";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuestions,
    loading,
    error
  };
};