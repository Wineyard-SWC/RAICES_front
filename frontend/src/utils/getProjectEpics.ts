import { Epic } from "@/types/epic";
import {v4 as uuidv4 } from 'uuid'

const apiURL = process.env.NEXT_PUBLIC_API_URL!


export async function getProjectEpics(projectId: string): Promise<Epic[]> {
  const response = await fetch(apiURL+`/projects/${projectId}/epics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error while obtaining the epics of the project");
  }

  const data = await response.json();

  return data
    .map((epic: any) => ({
      uuid: epic.uuid ?? '',
      id: epic.id,
      idTitle: epic.idTitle,
      title: epic.title,
      description: epic.description,
      projectRef: epic.projectRef,
      relatedRequirements: (epic.relatedRequirements ?? []).map((r: any) => ({
        idTitle: r.idTitle,
        title: r.title ?? '',
        description: r.description ?? '',
        uuid: r.uuid ?? '',
      })),
    }))
    .sort((a:any, b:any) => a.idTitle.localeCompare(b.idTitle));
}
