import { Task } from "@/types/task";

// utils/parseTasksFromApi.ts
export const parseTasksFromApi = (raw: string): Task[] => {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "");

  let arr: any[];
  try {
    arr = JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON.parse failed", cleaned);
    return [];
  }

  const now = new Date().toISOString();
// utils/parseTasksFromApi.ts
  return arr.map((t: any): Task => ({
    id: crypto.randomUUID(),
    title: t.title,
    description: t.description,
    user_story_id: t.user_story_id,
    status_khanban: "To Do",
    priority: t.priority,
    story_points: t.story_points,
    assignee: "",
    created_at: now,
    updated_at: now,
    comments:      t.comments      ?? [],   // ⬅⬅⬅
    subtasks:      t.subtasks      ?? [],   // (si aplica)
    attachments:   t.attachments   ?? [],
    selected: true
  }));
};

