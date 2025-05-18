import { buildTasksPrompt } from "./prompt";

// utils/buildTasksPayload.ts
export const buildTasksPayload = (
    stories: { id: string; title: string; description: string }[]
  ) => ({
    prompt: buildTasksPrompt(),          
    data:   { user_stories: stories }    
  });
  