import { v4 as uuidv4} from 'uuid'
import { UserStory,Comments,AcceptanceCriteriaData, Workingusers } from "@/types/userstory";

const comments: Comments[] = []
const assignee: Workingusers[] = []

export const parseUserStoriesFromAPI = (rawResponse: any): UserStory[] => {
  const projectId = typeof window !== 'undefined' 
  ? localStorage.getItem("currentProjectId") 
  : null;
  
  const normalizePriority = (priority: string): UserStory['priority'] => {
    const p = priority?.toLowerCase?.();
    if (p === 'alta') return 'High';
    if (p === 'media') return 'Medium';
    if (p === 'baja') return 'Low';
    return 'Medium';
  };

  if (!rawResponse || !Array.isArray(rawResponse.content)) return [];

  return rawResponse.content.map((item: any, index: number): UserStory => {
    const now = new Date().toISOString();
    const acceptanceCriteria: AcceptanceCriteriaData[] = Array.isArray(item.acceptance_criteria) 
      ? item.acceptance_criteria.map((criterion: string): AcceptanceCriteriaData => ({
          id: uuidv4(),
          description: criterion,
          date_completed: '',
          date_created: now,
          date_modified: now,
          finished_by: ['', ''],
          created_by: ['RAICES_IA', 'RAICES_IA'],
          modified_by: ['RAICES_IA', 'RAICES_IA']
        }))
      : [];

    return {
      uuid: item.uuid || uuidv4(),
      id: item.id ?? `${index + 1}`,
      idTitle: item.idTitle ?? (item.id ? item.id : `US-${(index + 1).toString().padStart(3, '0')}`),
      title: item.title ?? '',
      description: item.description ?? '',
      priority: normalizePriority(item.priority),
      points: item.points ?? 0,
      acceptanceCriteria: acceptanceCriteria || [],
      assigned_epic: item.assigned_epic ?? 'EPIC-###',
      projectRef: projectId!,
      comments: item.comments || comments,
      status_khanban: item.status_khanban || 'Backlog',
      total_tasks: item.total_tasks || 0,
      task_completed: item.task_completed || 0,
      completed_acceptanceCriteria: 0,
      total_acceptanceCriteria: acceptanceCriteria.length,
      assigned_sprint: item.assigned_sprint?? '',
      assignee: item.assignee || assignee,
      deadline: item.deadline || '',
      task_list: [],
      date_completed: ''
    };
  });
};

export const parseUserStoriesFromDB = (rawResponse: any[]): UserStory[] => {
  return rawResponse.map((item: any): UserStory => ({
    ...item,
    assigned_epic: item.epicRef ?? 'UNASSIGNED'
  }));
};