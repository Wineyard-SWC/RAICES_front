import { UserStory } from './userstory';

export interface EpicWithUserStories {
  id: string;
  idTitle: string; 
  userStories: UserStory[];
}