import { comments } from "./userstory"

export interface BasicTask {
  id: string
  title: string
  description: string
  date: string
  comments: comments[];
  priority: 'High' | 'Medium' | 'Low'
  status_khanban: 'Backlog' | 'In Progress' | 'In Review' | 'To Do' | 'Done'
}


export interface Task extends BasicTask {
  user_story_id: string
  user_story_title?: string
  assignee: string
  assignee_id?: string
  sprint_id?: string
  sprint_name?: string
  story_points: number
  deadline?: string
  created_at: string
  updated_at: string
  selected?: boolean
}

export type TaskFormData = Omit<Task, "id" | "created_at" | "updated_at" | "comments"> & {
  id?: string
}