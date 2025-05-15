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

export interface Workingusers {
  users: [string, string] //<- id del usuario participando y su nombre
}

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
  assignee?: Workingusers[]
  created_by?: [string, string]       
  modified_by?: [string, string]
  finished_by?: [string, string]
  date_created?: string
  date_modified?: string
  date_completed?: string
  user_story_id: string
  user_story_title?: string
  assignee_id?: string
  sprint_id?: string
  sprint_name?: string
  story_points: number
  deadline?: string
}

// ——————————————
// Tarea “completa”, ligada a historia y sprint
// ——————————————
export interface Task extends BasicTask {
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
  assignee: Workingusers[]
  sprint_id?: string
  status_khanban: KanbanStatus
  priority: "High" | "Medium" | "Low"
  story_points: number
  deadline?: string
  comments: Comment[]
  created_by?: [string, string]       
  modified_by?: [string, string]
  finished_by?: [string, string]
  date_created?: string
  date_modified?: string
  date_completed?: string
}


export interface CompletaTaskData {
  // 🔹 Identificación
  id: string
  title: string
  description: string

  // 🔹 Estado Kanban y prioridad
  status_khanban: KanbanStatus
  priority: "High" | "Medium" | "Low"
  selected?: boolean

  // 🔹 Usuario asignado y comentarios
  assignee?: Workingusers[]
  assignee_id?: string
  comments: Comment[]

  // 🔹 Vinculación con historia de usuario
  user_story_id: string
  user_story_title?: string

  // 🔹 Sprint
  sprint_id?: string
  sprint_name?: string
  assigned_sprint?: string
  deadline?: string

  // 🔹 Story Points
  story_points: number

  // 🔹 Auditoría de cambios
  created_at: string
  updated_at: string

  // 🔹 Trazabilidad del flujo de trabajo
  created_by?: [string, string]       
  modified_by?: [string, string]
  finished_by?: [string, string]

  date_created?: string
  date_modified?: string
  date_completed?: string
}