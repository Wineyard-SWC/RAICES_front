import { UserStory } from "@/types/userstory";

const apiURL = process.env.NEXT_PUBLIC_API_URL!

export async function postUserStories(stories: Omit<UserStory, 'id' | 'selected'>[], projectId: string) {
  const response = await fetch(apiURL+`/projects/${projectId}/userstories/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      stories.map((s) => ({
        idTitle: s.idTitle,
        title: s.title,
        description: s.description,
        priority: s.priority,
        points: s.points,
        acceptanceCriteria: s.acceptance_criteria,
        epicRef: s.assigned_epic,
        projectRef: projectId
      }))
    ),
  });

  if (!response.ok) {
    throw new Error("Error saving the user stories");
  }

  return await response.json();
}
