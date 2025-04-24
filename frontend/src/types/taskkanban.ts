import { Task } from './task';

export interface TaskColumns {
  inProgress: Task[]
  inReview: Task[]
  completed: Task[]
}