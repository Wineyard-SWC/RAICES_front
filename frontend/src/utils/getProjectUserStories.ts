// utils/getProjectUserStories.ts
import type { UserStory } from "@/types/userstory"
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export const getProjectUserStories = async (
  projectId: string
): Promise<UserStory[]> => {
  const res = await fetch(`${API_BASE}/projects/${projectId}/userstories`)
  if (!res.ok) {
    // lee el body como texto para tener el mensaje de error
    const text = await res.text()
    throw new Error(text || "Failed to fetch user stories")
  }
  return (await res.json()) as UserStory[]
}

