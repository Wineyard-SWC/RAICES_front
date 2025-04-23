import { UserStory } from "@/types/userstory";

export const reorderUserStoryIds = (userStories: UserStory[]): UserStory[] => {
    return userStories
      .sort((a, b) => a.idTitle.localeCompare(b.idTitle))
      .map((story, index) => ({
        ...story,
        idTitle: `US-${String(index + 1).padStart(3, '0')}`
      }));
};


export const generateNextUserStoryId = (stories: UserStory[]): string => {
    const usedIds = new Set(
      stories.map(story => parseInt(story.idTitle.replace('US-', ''), 10))
    );
    let next = 1;
    while (usedIds.has(next)) next++;
    return `US-${String(next).padStart(3, '0')}`;
  };