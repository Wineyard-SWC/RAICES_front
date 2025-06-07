import { Task, Workingusers } from "@/types/task";
import { v4 as uuidv4} from 'uuid'
import { printError } from "./debugLogger";

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
    printError("JSON.parse failed", cleaned);
    return [];
  }

  const now = new Date().toISOString();
// utils/parseTasksFromApi.ts
  return arr.map((t: any): Task => ({
    id: uuidv4(),
    date: t.date,
    title: t.title,
    description: t.description,
    user_story_id: t.user_story_id,
    status_khanban: "To Do",
    priority: t.priority,
    story_points: t.story_points,
    assignee: t.assignee && Array.isArray(t.assignee)
    ? t.assignee.map((u: any) => [u.id, u.name] as [string, string])
    : [],
    created_at: now,
    updated_at: now,
    comments:t.comments ?? [],  
    selected: true,
    created_by: ["RAICES_IA", "RAICES_IA"],
    modified_by: ["RAICES_IA", "RAICES_IA"],
    finished_by: ["", ""],
    date_created: now,
    date_modified: now,
    date_completed: "",
  }));
};

