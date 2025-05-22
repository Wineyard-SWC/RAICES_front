import type { Sprint } from "@/types/sprint"
import { UserStory } from "@/types/userstory"
import { Task } from "@/types/task"

const apiURL = process.env.NEXT_PUBLIC_API_URL!

export async function getProjectSprints(projectId: string): Promise<Sprint[]> {
  const response = await fetch(apiURL + `/projects/${projectId}/sprints`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error while obtaining the sprints of the project");
  }

  const data = await response.json();

  // Convert the API response to match our front-end Sprint type
  return data.map((sprint: any) => ({
    id: sprint.id,
    name: sprint.name,
    project_id: sprint.project_id,
    start_date: sprint.start_date,
    end_date: sprint.end_date,
    duration_weeks: sprint.duration_weeks,
    status: sprint.status,
    created_at: sprint.created_at,
    updated_at: sprint.updated_at,
    team_members: sprint.team_members.map((member: any) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      avatar: member.avatar,
      capacity: member.capacity,
      allocated: member.allocated,
    })),
    user_stories: sprint.user_stories.map((story: any) => {
      // Create a UserStory type from the data
      const userStory: UserStory = {
        uuid: story.id,
        id: story.id,
        idTitle: `US-${story.id.substring(0, 4)}`,
        title: story.title,
        description: story.description,
        priority: 'Medium', // Default priority if not specified
        acceptanceCriteria: Array.isArray(story.acceptance_criteria) 
          ? story.acceptance_criteria.map((criteria: string, index: number) => ({
              id: `${story.id}-ac-${index}`,
              description: criteria,
              date_completed: '',
              date_created: sprint.created_at,
              date_modified: sprint.updated_at,
              finished_by: ['', ''],
              created_by: ['RAICES_IA', 'RAICES_IA'],
              modified_by: ['RAICES_IA', 'RAICES_IA']
            }))
          : [],
        points: 0, // Default points
        assigned_epic: '',
      };

      // Create the SprintUserStory object
      return {
        id: story.id,
        userStory: userStory,
        tasks: [], // Tasks will need to be populated separately if needed
        selected: story.selected,
      };
    }),
  }));
}