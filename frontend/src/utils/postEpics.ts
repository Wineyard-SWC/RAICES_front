import { Epic } from "@/types/epic";

const apiURL = process.env.NEXT_PUBLIC_API_URL!

export async function postEpics(epics: Omit<Epic, 'id'>[], projectId: string) {
  
  const response = await fetch(apiURL+`/projects/${projectId}/epics/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      epics.map((e) => ({
        idTitle: e.idTitle,
        title: e.title,
        description: e.description,
        projectRef: projectId,
        relatedRequirements: e.relatedRequirements.map((req) => ({
          idTitle: req.idTitle,
          description: req.description,
        })),
      }))
    ),
    
  });

  
  if (!response.ok) {
    throw new Error("Error saving the epics");
  }

  return await response.json();
}
