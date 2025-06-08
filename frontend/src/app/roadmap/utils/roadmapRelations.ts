import { RoadmapItem, getItemType, getItemId } from '@/types/roadmap';
import { Bug } from '@/types/bug';
import { Task } from '@/types/task';
import { UserStory } from '@/types/userstory';

export const findRelatedItems = (item: RoadmapItem, availableItems: RoadmapItem[]): RoadmapItem[] => {
  const relatedItems: RoadmapItem[] = [];
  const itemType = getItemType(item);
  const itemId = getItemId(item);

  if (itemType === 'user-story') {
    const userStory = item as UserStory;
    
    if (userStory.task_list) {
      userStory.task_list.forEach(taskId => {
        const relatedTask = availableItems.find(availableItem => 
          getItemId(availableItem) === taskId && getItemType(availableItem) === 'task'
        );
        if (relatedTask) relatedItems.push(relatedTask);
      });
    }

    availableItems.forEach(availableItem => {
      if (getItemType(availableItem) === 'bug') {
        const bug = availableItem as Bug;
        if (bug.userStoryRelated === itemId) {
          relatedItems.push(bug);
        }
      }
    });
  }

  if (itemType === 'task') {
    const task = item as Task;
    
    if (task.user_story_id) {
      const parentUserStory = availableItems.find(availableItem => 
        getItemId(availableItem) === task.user_story_id && getItemType(availableItem) === 'user-story'
      );
      if (parentUserStory) relatedItems.push(parentUserStory);
    }

    availableItems.forEach(availableItem => {
      if (getItemType(availableItem) === 'bug') {
        const bug = availableItem as Bug;
        if (bug.taskRelated === itemId) {
          relatedItems.push(bug);
        }
      }
    });
  }

  if (itemType === 'bug') {
    const bug = item as Bug;
    
    if (bug.userStoryRelated) {
      const parentUserStory = availableItems.find(availableItem => 
        getItemId(availableItem) === bug.userStoryRelated && getItemType(availableItem) === 'user-story'
      );
      if (parentUserStory) relatedItems.push(parentUserStory);
    }

    if (bug.taskRelated) {
      const relatedTask = availableItems.find(availableItem => 
        getItemId(availableItem) === bug.taskRelated && getItemType(availableItem) === 'task'
      );
      if (relatedTask) relatedItems.push(relatedTask);
    }
  }

  return relatedItems;
};

export const isItemVisible = (item: RoadmapItem, collapsedItems: Set<string>): boolean => {
  const itemType = getItemType(item);

  if (itemType === 'user-story') return true;

  if (itemType === 'task') {
    const task = item as Task;
    if (task.user_story_id && collapsedItems.has(task.user_story_id)) {
      return false;
    }
  }

  if (itemType === 'bug') {
    const bug = item as Bug;
    if (bug.userStoryRelated && collapsedItems.has(bug.userStoryRelated)) {
      return false;
    }
    if (bug.taskRelated && collapsedItems.has(bug.taskRelated)) {
      return false;
    }
  }

  return true;
};
