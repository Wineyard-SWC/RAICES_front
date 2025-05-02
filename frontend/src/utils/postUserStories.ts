import { UserStory, comments} from "@/types/userstory";

const apiURL = process.env.NEXT_PUBLIC_API_URL!
const Comments: comments[] = []

export async function postUserStories(stories: Omit<UserStory, 'id' | 'selected'>[], projectId: string) {
  
  const response = await fetch(apiURL+`/projects/${projectId}/userstories/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      stories.map((s) => ({
        uuid: s.uuid,
        idTitle: s.idTitle,
        title: s.title,
        description: s.description,
        priority: s.priority,
        points: s.points,
        acceptanceCriteria: s.acceptanceCriteria,
        epicRef: s.assigned_epic,
        projectRef: projectId,
        comments: s.comments || Comments,
        status_khanban: s.status_khanban || 'Backlog',
        total_tasks: s.total_tasks || 0,
        task_completed: s.task_completed || 0
      }))
    ),
  });

  if (!response.ok) {
    throw new Error("Error saving the user stories");
  }

  return await response.json();
}
