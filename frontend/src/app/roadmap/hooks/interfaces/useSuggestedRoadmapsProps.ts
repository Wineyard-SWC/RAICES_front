export interface UserStoryInput {
  id: string;
  title: string;
}

export interface PhaseUserStoriesProps {
  userStories: UserStoryInput[];
}

export interface SuggestedPhase {
  name: string;
  description: string;
  user_stories: { id: string; title: string }[];
}

export interface UseSuggestedRoadmapResult {
  loading: boolean;
  error: string | null;
  suggestedRoadmaps: SuggestedPhase[];
  generateSuggestedRoadmap: (stories: UserStoryInput[]) => SuggestedPhase[];
}