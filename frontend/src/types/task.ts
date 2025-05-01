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
  status: "To Do" | "In Progress" | "In Review" | "Done"
  priority: "High" | "Medium" | "Low"
  story_points: number
  deadline?: string
  created_at: string
  updated_at: string
  comments: {
    id: string
    user_id: string
    user_name: string
    text: string
    timestamp: string
  }[]
  selected?: boolean
}

export type TaskFormData = Omit<Task, "id" | "created_at" | "updated_at" | "comments"> & {
  id?: string
}
