import { BasicTask} from './task';
import { UserStory } from './userstory';

export type TaskOrStory = BasicTask | UserStory

export interface TaskColumns {
  backlog: TaskOrStory[]
  todo: TaskOrStory[]
  inprogress: TaskOrStory[]
  inreview: TaskOrStory[]
  done: TaskOrStory[]
}