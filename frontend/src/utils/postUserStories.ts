import { UserStory } from "@/types/userstory";

const apiURL = process.env.NEXT_PUBLIC_API_URL!;



export async function postUserStories(
  stories: Omit<UserStory, 'id' | 'selected'>[],
  projectId: string,
  updateCache: (userStories: UserStory[]) => void   
  ) {
  const preparedStories = stories.map(s => {
    const completedCriteria = s.acceptanceCriteria?.filter(ac => ac.date_completed)?.length || 0;
    
    return {
      uuid: s.uuid,
      idTitle: s.idTitle,
      title: s.title,
      description: s.description,
      priority: s.priority,
      points: s.points || 0,
      acceptanceCriteria: s.acceptanceCriteria || [],
      epicRef: s.assigned_epic,
      projectRef: projectId,
      comments: s.comments || [],
      status_khanban: s.status_khanban || 'Backlog',
      total_tasks: s.total_tasks || 0,
      task_completed: s.task_completed || 0,
      completed_acceptanceCriteria: completedCriteria,
      total_acceptanceCriteria: s.acceptanceCriteria?.length || 0,
      deadline: s.deadline || '',
      date_completed: s.date_completed || '',
      assigned_sprint: s.assigned_sprint || '',
      assignee: s.assignee || [],
      task_list: s.task_list || []
    };
  });

  const response = await fetch(apiURL + `/projects/${projectId}/userstories/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preparedStories),
  });

  const responseData = await response.json();

  const enrichedUserStories: UserStory[] = responseData.map((res: any, idx: number) => ({
    ...preparedStories[idx], 
    id: res.id,             
    selected: false          
  }));

  
  updateCache(enrichedUserStories);


  if (!response.ok) {
    throw new Error("Error saving the user stories");
  }

  return responseData;
}