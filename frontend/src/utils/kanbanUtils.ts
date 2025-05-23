import { isUserStory } from "@/types/taskkanban";

export const getUserStoryTitleByTaskId2 = (taskId: string, kanbanTasks: any): string | null => {
  for (const column of Object.values(kanbanTasks)) {
    for (const item of column) {
      if (isUserStory(item) && Array.isArray(item.task_list)) {
        if (item.task_list.includes(taskId)) {
          return item.title;
        }
      }
    }
  }
  return null;
};