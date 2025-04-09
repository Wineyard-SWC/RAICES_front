import { UserStory } from "@/types/userstory";

export const groupUserStoriesByEpic = (
  stories: UserStory[]
): Record<string, UserStory[]> => {
  return stories.reduce((acc, story) => {
    const epicKey = story.assigned_epic;
    if (!acc[epicKey]) {
      acc[epicKey] = [];
    }
    acc[epicKey].push(story);
    return acc;
  }, {} as Record<string, UserStory[]>);
};