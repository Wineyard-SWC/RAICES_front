// types/task.ts
export interface Comment {
  id: string
  user_id: string
  user_name: string
  text: string
  timestamp: string
}

export type KanbanStatus =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Done"

export interface Task {
  id: string
  title: string
  description: string
  user_story_id: string
  user_story_title?: string
  assignee: string
  assignee_id?: string
  sprint_id?: string
  sprint_name?: string
  status: KanbanStatus
  priority: "High" | "Medium" | "Low"
  story_points: number
  deadline?: string
  created_at: string
  updated_at: string
  comments: Comment[]
  selected?: boolean
}

export type TaskFormData = {
  id?: string
  title: string
  description: string
  user_story_id: string
  assignee: string
  sprint_id?: string
  status: KanbanStatus
  priority: "High" | "Medium" | "Low"
  story_points: number
  deadline?: string
  comments: Comment[]
}
