import { buildTasksPrompt } from "./prompt";

// utils/buildTasksPayload.ts
export const buildTasksPayload = (
    stories: { id: string; title: string; description: string }[]
  ) => ({
    prompt: buildTasksPrompt(),          // usa mismo placeholder
    data:   { user_stories: stories }    // nombre EXACTO
  });
  