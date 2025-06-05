import { RoadmapItem, getItemId, getItemType } from '@/types/roadmap';

export const getItemsInPhase = (
  phaseId: string, 
  roadmapPhases: any[], 
  roadmapItems: RoadmapItem[]
): RoadmapItem[] => {
  const phase = roadmapPhases.find(p => p.id === phaseId);
  if (!phase) return [];
  
  return roadmapItems.filter(item => phase.items.includes(getItemId(item)));
};

export const getAvailableItemsByType = (
  type: 'user-story' | 'task' | 'bug',
  availableItems: RoadmapItem[],
  roadmapItems: RoadmapItem[]
): RoadmapItem[] => {
  const roadmapItemIds = new Set(roadmapItems.map(item => getItemId(item)));
  
  return availableItems.filter(item => 
    getItemType(item) === type && !roadmapItemIds.has(getItemId(item))
  );
};