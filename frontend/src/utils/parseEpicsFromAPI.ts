import { Epic } from '@/types/epic';

export const parseEpicsFromAPI = (rawResponse: any): Epic[] => {
  if (!rawResponse || !Array.isArray(rawResponse.content)) return [];

  return rawResponse.content.map((item: any, index: number): Epic => ({
    id: item.id ?? `${index + 1}`,
    idTitle: item.id ?? `EPIC-${String(index + 1).padStart(3, '0')}`,
    title: item.title ?? '',
    description: item.description ?? '',
    relatedRequirements: Array.isArray(item.related_requirements)
      ? item.related_requirements.map((req: any) => ({
          idTitle: req.id || '',
          title: req.id ?.split(':')[0] || '', 
          description: req.description || '',
        }))
      : [],
  }));
};