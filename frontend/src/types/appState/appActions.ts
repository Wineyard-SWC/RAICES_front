import { AppState } from "./appState";
import { ProjectState } from "./appState";
import { Task } from "../task";
import { UserStory } from "../userstory";
import { Requirement } from "../requirement";
import { Epic } from "../epic";
import { Sprint } from "../sprint";
import { Bug } from "../bug";
import { KanbanStatus } from "../task";

export type KanbanItemType = 'tasks' | 'userStories' | 'bugs';
export const endpoints = {
  tasks:        (pid: string) => `/projects/${pid}/tasks`,
  userStories:  (pid: string) => `/projects/${pid}/userstories`,
  bugs:         (pid: string) => `/bugs/project/${pid}`,
  requirements: (pid: string) => `/projects/${pid}/requirements`,
  epics:        (pid: string) => `/projects/${pid}/epics`,
  sprints:      (pid: string) => `/projects/${pid}/sprints`,
} as const;

// types/actions.ts
export type AppAction = 
  // Usuario
  | { type: 'SET_USUARIO'; payload: AppState['usuario'] }
  | { type: 'LOGOUT_USUARIO' }
  
  // Proyectos
  | { type: 'SET_PROYECTOS'; payload: Record<string, ProjectState> }
  | { type: 'ADD_PROYECTO'; payload: ProjectState }
  | { type: 'UPDATE_PROYECTO'; payload: { id: string; proyecto: Partial<ProjectState> } }
  | { type: 'SELECT_PROYECTO'; payload: string }
  
  // Tasks
  | { type: 'SET_TASKS'; payload: { projectId: string; tasks: Record<string, Task> } }
  | { type: 'ADD_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'DELETE_TASK'; payload: { projectId: string; taskId: string } }

  // Kanban
  | { type: 'MOVE_KANBAN_ITEM'; payload: { projectId: string; itemId: string; newStatus: KanbanStatus; type: KanbanItemType } }

  // User Stories
  | { type: 'SET_USER_STORIES'; payload: { projectId: string; userStories: Record<string, UserStory> } }
  | { type: 'ADD_USER_STORY'; payload: { projectId: string; userStory: UserStory } }
  | { type: 'UPDATE_USER_STORY'; payload: { projectId: string; userStory: UserStory } }
  | { type: 'DELETE_USER_STORY'; payload: { projectId: string; userStoryId: string } }
  
  // Requirements
  | { type: 'SET_REQUIREMENTS'; payload: { projectId: string; requirements: Record<string, Requirement> } }
  | { type: 'ADD_REQUIREMENT'; payload: { projectId: string; requirement: Requirement } }
  | { type: 'UPDATE_REQUIREMENT'; payload: { projectId: string; requirement: Requirement } }
  | { type: 'DELETE_REQUIREMENT'; payload: { projectId: string; requirementId: string } }
  
  // Epics
  | { type: 'SET_EPICS'; payload: { projectId: string; epics: Record<string, Epic> } }
  | { type: 'ADD_EPIC'; payload: { projectId: string; epic: Epic } }
  | { type: 'UPDATE_EPIC'; payload: { projectId: string; epic: Epic } }
  | { type: 'DELETE_EPIC'; payload: { projectId: string; epicId: string } }

  // Sprints
  | { type: 'SET_SPRINTS'; payload: { projectId: string; sprints: Record<string, Sprint> } }
  | { type: 'ADD_SPRINT'; payload: { projectId: string; sprint: Sprint } }
  | { type: 'UPDATE_SPRINT'; payload: { projectId: string; sprint: Sprint } }
  | { type: 'DELETE_SPRINT'; payload: { projectId: string; sprintId: string } }

  // Bugs
  | { type: 'SET_BUGS'; payload: { projectId: string; bugs: Record<string, Bug> } }
  | { type: 'ADD_BUG'; payload: { projectId: string; bug: Bug } }
  | { type: 'UPDATE_BUG'; payload: { projectId: string; bug: Bug } }
  | { type: 'DELETE_BUG'; payload: { projectId: string; bugId: string } }

  // Estados generales
  | { type: 'INCREMENT_LOADING' }
  | { type: 'DECREMENT_LOADING' }
  | { type: 'SET_ERROR'; payload: { resource: keyof typeof endpoints; message: string } }
  | { 
    type: 'SET_RESOURCE'; 
    payload: { projectId: string; resource: keyof typeof endpoints; data: any } 
  }
