import { isBug, isUserStory, TaskOrStory } from "@/types/taskkanban"

export function getStatusColor(status?: string) {
  switch (status) {
    case 'In Progress': return 'bg-yellow-100 text-yellow-800'
    case 'In Review': return 'bg-purple-100 text-purple-800'
    case 'Done': return 'bg-orange-100 text-orange-800'
    case 'To Do': return 'bg-blue-100 text-blue-800'
    default: return 'bg-green-100 text-green-800'
  }
}

export function getPriorityColor(priority?: string) {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800'
    case 'Medium': return 'bg-yellow-100 text-yellow-800'
    case 'Low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getTypeColor(task: TaskOrStory) {
  if (isBug(task)) return 'bg-red-100 text-red-800'
  if (isUserStory(task)) return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-800'
}

export function getTypeLabel(task: TaskOrStory) {
  if (isBug(task)) return 'Bug'
  if (isUserStory(task)) return 'Story'
  return 'Task'
}