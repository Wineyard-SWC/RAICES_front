// utils/buildSprintPayload.ts
import type { Sprint } from "@/types/sprint";

/**
 * Convierte el Sprint que manejas en el Front
 * al formato que espera el endpoint FastAPI.
 */
export const buildSprintPayload = (s: Sprint) => ({
  name:           s.name,
  start_date:     s.start_date,
  end_date:       s.end_date,
  duration_weeks: s.duration_weeks,
  status:         s.status,

  /* -------- team -------- */
  team_members: s.team_members.map(m => ({
    id:        m.id,
    name:      m.name,
    role:      m.role,
    avatar:    m.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png",
    capacity:  m.capacity,
    allocated: m.allocated,
  })),

  /* ------ stories ------- */
  user_stories: s.user_stories.map(({ id, userStory, tasks, selected }) => ({
    id,
    title:               userStory.title,
    description:         userStory.description,
    acceptance_criteria: userStory.acceptanceCriteria,
    selected,
    tasks:               tasks.map(t => t.id),   // 👈  SOLO IDS
  })),
});
