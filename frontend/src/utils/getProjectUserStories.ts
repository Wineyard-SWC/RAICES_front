import { UserStory } from "@/types/userstory";

const apiURL = process.env.NEXT_PUBLIC_API_URL!;

export async function getProjectUserStories(projectId: string): Promise<UserStory[]> {
  console.log(`Calling API to fetch user stories for projectId: ${projectId}`);

  const response = await fetch(`${apiURL}/projects/${projectId}/userstories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("API call failed with status:", response.status);
    throw new Error("Error while obtaining the user stories of the project");
  }

  const data: UserStory[] = await response.json();

  console.log("API response data:", data);

  // Verifica si la respuesta es un arreglo
  if (!Array.isArray(data)) {
    console.error("Unexpected API response format:", data);
    return [];
  }

  return data;
}