import { Workingusers } from "./userstory"
import { Comments } from "./userstory"

export type BugPriority = "High" | "Medium" | "Low"
export type BugSeverity = 'Blocker' | 'Critical' | 'Major' | 'Minor' | 'Trivial'
export type BugStatus = 'New' | 'Triaged' | 'In_progress' | 'Testing' | 'Reopened' | 'Resolved' | 'Closed'
export type BugType = 'Functional' | 'Visual' | 'Performance' | 'Security' | 'Compatibility' | 'Usability' | 'Other'
export type KanbanStatus =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "In Review"
  | "Done"

export interface Bug {
  // Identificación básica
  id: string
  title: string
  description: string
  
  // Clasificación del bug
  type?: BugType
  severity: BugSeverity
  priority: BugPriority
  status_khanban: KanbanStatus
  bug_status:BugStatus
  // Relaciones con otras entidades
  projectId: string
  taskRelated?: string             // ID de la tarea relacionada
  userStoryRelated?: string        // ID de la user story relacionada
  sprintId?: string                // ID del sprint en el que se genero el bug
  
  // Asignaciones
  reportedBy:  Workingusers        // <- lista de id del usuario participando y su nombre
  assignee:  Workingusers[];      // <- lista de id del usuario participando y su nombre
  
  // Seguimiento temporal
  createdAt: string                // Fecha de creación (ISO string)
  modifiedAt: string               // Última actualización (ISO string)
  triageDate?: string              // Fecha de clasificación inicial (ISO string)
  startedAt?: string               // Fecha en que se comenzó a trabajar (ISO string)
  finishedAt?: string              // Fecha de resolución (ISO string)
  closedAt?: string                // Fecha de cierre (distinta de la resolución) (ISO string)
  
  // Detalles técnicos
  environment?: {                  // Entorno donde se reproduce
    browser?: string
    os?: string
    device?: string
    version?: string
    otherDetails?: string
  }
  stepsToReproduce?: string[]
  expectedBehavior?: string
  actualBehavior?: string
  
  comments?: Comments[];
  
  resolution?: {
    status: 'Fixed' | 'Wont_fix' | 'Duplicate' | 'Cannot_reproduce' | 'Not_a_bug' | 'Deferred'
    description: string
    commitId?: string              // Referencia al commit que solucionó el bug
    pullRequestUrl?: string        // URL del PR que contiene la solución
    resolvedBy: string             // ID del usuario que resolvió el bug
    resolvedAt: string             // Timestamp de resolución
  }
  
  // Métricas
  timeToPrioritize?: number        // Tiempo en horas desde createdAt hasta triageDate
  timeToAssign?: number            // Tiempo en horas hasta la primera asignación
  timeToFix?: number               // Tiempo en horas hasta resolvedAt
  reopenCount?: number             // Número de veces que el bug fue reabierto
  
  // Etiquetas y clasificación adicional
  tags?: string[]
  isRegression?: boolean           // ¿Es una regresión de un bug anterior?
  relatedBugs?: string[]           // IDs de bugs relacionados
  duplicateOf?: string             // ID del bug del cual este es duplicado
  
  // Impacto y visibilidad
  affectedComponents?: string[]    // Componentes afectados por el bug
  affectedUsers?: number           // Estimación de usuarios afectados
  visibleToCustomers: boolean      // ¿Es visible para los usuarios finales?
}