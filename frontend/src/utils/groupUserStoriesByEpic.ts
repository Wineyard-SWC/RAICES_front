import { UserStory } from "@/types/userstory";

export const groupUserStoriesByEpic = (
  stories: UserStory[]
): Record<string, UserStory[]> => {
  const grouped = {} as Record<string, UserStory[]>;
  
  // Agrupar las historias por épica
  stories.forEach(story => {
    const epicKey = story.assigned_epic || 'UNASSIGNED';
    if (!grouped[epicKey]) {
      grouped[epicKey] = [];
    }
    grouped[epicKey].push({...story});
  });
  
  return grouped;
};