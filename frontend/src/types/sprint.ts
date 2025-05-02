import type { Task } from "./task"
import type { UserStory } from "./userstory"

export interface SprintMember {
  id: string
  name: string
  role: string
  avatar?: string
  capacity: number
  allocated: number
}

export interface SprintUserStory {
  id: string
  userStory: UserStory
  tasks: Task[]
  selected: boolean
}

export interface Sprint {
  id: string
  name: string
  project_id: string
  start_date: string
  end_date: string
  duration_weeks: number
  status: "planning" | "active" | "completed" | "cancelled"
  team_members: SprintMember[]
  user_stories: SprintUserStory[]
  created_at: string
  updated_at: string
}

export type SprintFormData = Omit<Sprint, "id" | "created_at" | "updated_at" | "user_stories" | "team_members"> & {
  id?: string
}
