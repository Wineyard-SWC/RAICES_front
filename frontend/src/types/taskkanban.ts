import { Task } from './task';
import { UserStory } from './userstory';

export type TaskOrStory = Task | UserStory

export interface TaskColumns {
  backlog: TaskOrStory[]
  todo: TaskOrStory[]
  inprogress: TaskOrStory[]
  inreview: TaskOrStory[]
  done: TaskOrStory[]
}

export function isTask(item: TaskOrStory): item is Task {
  return 'user_story_id' in item
}

export function isUserStory(item: TaskOrStory): item is UserStory {
  return 'uuid' in item && !('user_story_id' in item)
}