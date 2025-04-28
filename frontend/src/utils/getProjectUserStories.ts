import { UserStory } from "@/types/userstory";
import { v4 as uuidv4 } from 'uuid';

const apiURL = process.env.NEXT_PUBLIC_API_URL!;

export async function getProjectUserStories(projectId: string): Promise<UserStory[]> {
  const response = await fetch(apiURL + `/projects/${projectId}/userstories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error while obtaining the userstories of the project");
  }

  const data = await response.json();

  return data
    .map((s: any) => ({
      id: s.id,
      uuid: s.uuid || uuidv4(),
      idTitle: s.idTitle,
      title: s.title,
      description: s.description,
      epicRef: s.epicRef,
      priority: s.priority,
      projectRef: s.projectRef,
      acceptanceCriteria: s.acceptanceCriteria || [], 
      comments: s.comments || [], 
      lastUpdated: s.lastUpdated, 
      points: s.points || 0, 
      status: s.status, 
    }))
    .sort((a: any, b: any) => a.idTitle.localeCompare(b.idTitle));
}
