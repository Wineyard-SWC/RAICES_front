import { SprintMember } from "./sprint"

export interface Project {
  id: string
  title: string
  description: string
  status: string
  priority: string
  progress: number
  startDate: string
  endDate: string
  invitationCode: string
  tasksCompleted: number
  totalTasks: number
  team: string
  teamSize: number
  teamMembers:SprintMember[]
  currentSprint?: string
  sprints?:string[]
  created_at?: string
  updated_at?: string
  createdBy?: string 
}
