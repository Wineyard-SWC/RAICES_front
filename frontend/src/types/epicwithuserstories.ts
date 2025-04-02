import { UserStory } from './userstory';

export interface EpicWithUserStories {
  id: number;
  idTitle: string; 
  userStories: UserStory[];
}