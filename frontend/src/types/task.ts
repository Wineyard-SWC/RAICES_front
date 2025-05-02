// types/task.ts

// ——————————————
// Comentarios en las tareas
// ——————————————
export interface Comment {
  id: string
  user_id: string
  user_name: string
  text: string
  timestamp: string
}

// ——————————————
// Estados del Kanban
// ——————————————
export type KanbanStatus =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Done"

// ——————————————
// Tarea básica (lo que ve el kanban)
// ——————————————
export interface BasicTask {
  id: string
  title: string
  description: string
  date: string
  comments: Comment[]
  priority: "High" | "Medium" | "Low"
  status: KanbanStatus
  assignee?: string
}

// ——————————————
// Tarea extendida (con relación a user story, sprint, historia)
// ——————————————
export interface Task extends BasicTask {
  user_story_id: string
  user_story_title?: string
  assignee_id?: string
  sprint_id?: string
  sprint_name?: string
  story_points: number
  deadline?: string
  created_at: string
  updated_at: string
  selected?: boolean
}

// ——————————————
// Datos para enviar/editar una tarea
// ——————————————
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
