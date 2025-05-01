import type { Task } from "@/types/task"

const apiURL = process.env.NEXT_PUBLIC_API_URL!

export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
    const res = await fetch(apiURL + `/projects/${projectId}/tasks`)
    if (!res.ok) throw new Error("Failed to fetch tasks")
    return res.json()
  }
  