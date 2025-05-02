// types/task.ts

// ——————————————
// Comentarios de cada tarea
// ——————————————
export interface Comment {
  id: string
  user_id: string
  user_name: string
  text: string
  timestamp: string
}

// ——————————————
// Estados válidos en el Kanban
// ——————————————
export type KanbanStatus =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Done"

// ——————————————
// Tarea básica para el tablero Kanban
// ——————————————
export interface BasicTask {
  id: string
  title: string
  description: string
  date: string
  comments: Comment[]
  priority: "High" | "Medium" | "Low"
  status_khanban: KanbanStatus
  assignee?: string
}

// ——————————————
// Tarea “completa”, ligada a historia y sprint
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
// Forma de los datos al crear o editar
// ——————————————
export type TaskFormData = {
  id?: string
  title: string
  description: string
  user_story_id: string
  assignee: string
  sprint_id?: string
  status_khanban: KanbanStatus
  priority: "High" | "Medium" | "Low"
  story_points: number
  deadline?: string
  comments: Comment[]
}