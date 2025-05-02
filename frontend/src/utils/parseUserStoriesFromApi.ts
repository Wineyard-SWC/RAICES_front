import { UserStory } from "@/types/userstory";
import { v4 as uuidv4} from 'uuid'

export const parseUserStoriesFromAPI = (rawResponse: any): UserStory[] => {
  const normalizePriority = (priority: string): UserStory['priority'] => {
    const p = priority?.toLowerCase?.();
    if (p === 'alta') return 'High';
    if (p === 'media') return 'Medium';
    if (p === 'baja') return 'Low';
    return 'Medium';
  };

  if (!rawResponse || !Array.isArray(rawResponse.content)) return [];

  return rawResponse.content.map((item: any, index: number): UserStory => ({
    uuid: item.uuid || uuidv4(),
    id: item.id ?? `${index + 1}`,
    idTitle: item.idTitle ?? (item.id ? item.id : `US-${(index + 1).toString().padStart(3, '0')}`),
    title: item.title ?? '',
    description: item.description ?? '',
    priority: normalizePriority(item.priority),
    points: item.points ?? 0,
    acceptanceCriteria: Array.isArray(item.acceptance_criteria) ? item.acceptance_criteria : [],
    assigned_epic: item.assigned_epic ?? 'EPIC-###',
  }));
};

