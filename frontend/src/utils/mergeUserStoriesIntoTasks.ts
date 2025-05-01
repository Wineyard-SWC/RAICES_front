import { TaskColumns, TaskOrStory } from "@/types/taskkanban"
import { UserStory } from "@/types/userstory"

export function mergeUserStoriesIntoTasks(
  tasks: TaskColumns,
  stories: UserStory[]
): TaskColumns {
  const result: TaskColumns = {
    backlog: [...tasks.backlog],
    todo: [...tasks.todo],
    inprogress: [...tasks.inprogress],
    inreview: [...tasks.inreview],
    done: [...tasks.done],
  };

  for (const story of stories) {
    const normalized: TaskOrStory = {
      ...story,
      date: "", 
      comments: story.comments || [],
    };

    const status = story.status_khanban?.toLowerCase().replace(/\s/g, "") ?? "backlog";

    switch (status) {
      case "todo":
        result.todo.push(normalized);
        break;
      case "inprogress":
        result.inprogress.push(normalized);
        break;
      case "inreview":
        result.inreview.push(normalized);
        break;
      case "done":
        result.done.push(normalized);
        break;
      default:
        result.backlog.push(normalized);
        break;
    }
  }

  return result;
}