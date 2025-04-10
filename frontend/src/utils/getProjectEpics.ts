import { Epic } from "@/types/epic";

const apiURL = process.env.NEXT_PUBLIC_API_URL!


export async function getProjectEpics(projectId: string): Promise<Epic[]> {
  const response = await fetch(apiURL+`/projects/${projectId}/epics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al obtener las épicas del proyecto");
  }

  const data = await response.json();

  return data.map((epic: any) => ({
    id: epic.id,
    idTitle: epic.idTitle,
    title: epic.title,
    description: epic.description,
    projectRef: epic.projectRef,
    relatedRequirements: [], 
  }));
}
