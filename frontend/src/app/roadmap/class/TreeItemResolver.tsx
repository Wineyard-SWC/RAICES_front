import { RoadmapItem, getItemId, getItemType } from "@/types/roadmap";
import { UserStory } from "@/types/userstory";
import { Task } from "@/types/task";
import { Bug } from "@/types/bug";

export class TreeItemResolver {
  constructor(private allItems: RoadmapItem[]) {}

  findDirectChildren(parent: RoadmapItem): RoadmapItem[] {
    const parentId = getItemId(parent);
    const parentType = getItemType(parent);
    const children: RoadmapItem[] = [];

    if (parentType === "user-story") {
      const userStory = parent as UserStory;

      if (Array.isArray(userStory.task_list)) {
        userStory.task_list.forEach(taskId => {
          const task = this.allItems.find(item => getItemId(item) === taskId);
          if (task) children.push(task);
        });
      }

      if (children.length === 0) {
        this.allItems.forEach(item => {
          if (getItemType(item) === "task" && (item as Task).user_story_id === parentId) {
            children.push(item);
          }
        });
      }

      this.allItems.forEach(item => {
        if (getItemType(item) === "bug") {
          const bug = item as Bug;
          if (bug.userStoryRelated === parentId && !bug.taskRelated) {
            children.push(bug);
          }
        }
      });
    }

    if (parentType === "task") {
      this.allItems.forEach(item => {
        if (getItemType(item) === "bug" && (item as Bug).taskRelated === parentId) {
          children.push(item);
        }
      });
    }

    return children.sort((a, b) => {
      const typeA = getItemType(a);
      const typeB = getItemType(b);
      return typeA === "task" && typeB === "bug" ? -1 : typeA === "bug" && typeB === "task" ? 1 : 0;
    });
  }

  findOrphanTasks(usedUserStoryIds: Set<string>): Task[] {
    return this.allItems.filter(item => {
      if (getItemType(item) !== "task") return false;
      const task = item as Task;
      return !task.user_story_id || !usedUserStoryIds.has(task.user_story_id);
    }) as Task[];
  }

  findOrphanBugs(usedUserStoryIds: Set<string>): Bug[] {
    return this.allItems.filter(item => {
      if (getItemType(item) !== "bug") return false;
      const bug = item as Bug;
      const hasUserStory = bug.userStoryRelated && usedUserStoryIds.has(bug.userStoryRelated);
      const hasTask = bug.taskRelated && this.allItems.some(t => getItemId(t) === bug.taskRelated);
      return !hasUserStory && !hasTask;
    }) as Bug[];
  }
}
