import { UserStory, Comments, AcceptanceCriteriaData, Workingusers } from "@/types/userstory";
import { v4 as uuidv4 } from 'uuid';

export async function getProjectUserStories(projectId: string): Promise<UserStory[]> {
  const apiURL = process.env.NEXT_PUBLIC_API_URL!;
  const comments : Comments[] = [];
  const assignee : Workingusers[] = [];
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
    .map((s: any) => {

      let acceptanceCriteria: AcceptanceCriteriaData[] = [];
      
      if (Array.isArray(s.acceptanceCriteria)) {
        if (s.acceptanceCriteria.length > 0 && typeof s.acceptanceCriteria[0] === 'object' && 'description' in s.acceptanceCriteria[0]) {
          acceptanceCriteria = s.acceptanceCriteria;
        }
        else if (s.acceptanceCriteria.length > 0 && typeof s.acceptanceCriteria[0] === 'string') {
          const now = new Date().toISOString();
          acceptanceCriteria = s.acceptanceCriteria.map((desc: string) => ({
            id: uuidv4(),
            description: desc,
            date_completed: '',
            date_created: now,
            date_modified: now,
            finished_by: ['', ''],
            created_by: ['RAICES_IA', 'RAICES_IA'],
            modified_by: ['RAICES_IA', 'RAICES_IA']
          }));
        }
      }
      
      const completedCriteria = acceptanceCriteria.filter(ac => ac.date_completed).length;

      
      return {
        id: s.id,
        uuid: s.uuid || uuidv4(),
        idTitle: s.idTitle,
        title: s.title,
        description: s.description,
        epicRef: s.epicRef,
        assigned_epic: s.epicRef,
        priority: s.priority,
        projectRef: s.projectRef,
        acceptanceCriteria: s.acceptanceCriteria || [], 
        comments: s.comments || comments, 
        lastUpdated: s.lastUpdated, 
        points: s.points || 0, 
        status: s.status, 
        status_khanban: s.status_khaban || 'Backlog',
        total_tasks: s.total_tasks || 0,
        task_completed: s.task_completed || 0,
        completed_acceptanceCriteria: completedCriteria,
        total_acceptanceCriteria: acceptanceCriteria.length,
        task_list: s.task_list || [],
        assigned_sprint: s.assigned_sprint,
        date_completed: s.date_completed,
        deadline: s.deadline,
        assignee: s.assignee || assignee,
      };
    })
    .sort((a: any, b: any) => a.idTitle.localeCompare(b.idTitle));
}
