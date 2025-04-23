import { Requirement } from "@/types/requirement";

const apiURL = process.env.NEXT_PUBLIC_API_URL!
export async function postRequirements(requirements: Omit<Requirement, 'id'>[], projectId: string) {
    
  
    const response = await fetch(apiURL+`/projects/${projectId}/requirements/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      requirements.map((r) => ({
        ...r,
        "projectRef": projectId,
        "epicRef": r.epicRef,
        "uuid": r.uuid
      }))
    ),
  });

  if (!response.ok) {
    throw new Error("Error saving the requirements");
  }

  return await response.json();
}
