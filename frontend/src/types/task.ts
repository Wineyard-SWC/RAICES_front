export interface Task {
  id: string
  title: string
  description: string
  date: string
  comments: number
  priority: 'High' | 'Medium' | 'Low'
}