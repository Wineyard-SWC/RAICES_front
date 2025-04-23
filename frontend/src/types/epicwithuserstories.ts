import { UserStory } from './userstory';

export interface EpicWithUserStories {
  uuid:string;
  id: string;
  idTitle: string; 
  userStories: UserStory[];
}