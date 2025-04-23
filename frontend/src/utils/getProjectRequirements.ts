import { Requirement } from "@/types/requirement";
import { v4 as uuidv4 } from 'uuid';


const apiURL = process.env.NEXT_PUBLIC_API_URL!


export async function getProjectRequirements(projectId: string): Promise<Requirement[]> {
  const response = await fetch(apiURL+`/projects/${projectId}/requirements`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error while obtaining the requirements of the project");
  }

  const data = await response.json();

  const normalizePriority = (value: string): Requirement["priority"] => {
    const val = value.toLowerCase();
    if (val === "high") return "High";
    if (val === "medium") return "Medium";
    if (val === "low") return "Low";
    return "Medium"; 
  };

  return data
    .map((r: any) => ({
      id: r.id,
      uuid: r.uuid ||uuidv4(),
      idTitle: r.idTitle,
      title: r.title,
      description: r.description,
      epicRef: r.epicRef,
      priority: normalizePriority(r.priority),
      projectRef: r.projectRef,
    }))
    .sort((a:any, b:any) => a.idTitle.localeCompare(b.idTitle));
}