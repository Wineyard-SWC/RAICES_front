import { RoadmapItem, getItemId, getItemType } from "@/types/roadmap";
import { UserStory } from "@/types/userstory";
import { Bug } from "@/types/bug";
import { Task } from "@/types/task";

export type TreeConnection = {
  source: string;
  target: string;
  type: "parent-child" | "relation";
  sourceHandle:string;
  targetHandle:string;
};

export class TreeItemConnector {
  private itemMap: Map<string, RoadmapItem>;

  constructor(private items: RoadmapItem[]) {
    this.itemMap = new Map<string, RoadmapItem>(
      items.map((item) => [getItemId(item), item])
    );
  }

  generateConnections(): TreeConnection[] {
    const connections: TreeConnection[] = [];

    for (const item of this.items) {
      const itemType = getItemType(item);
      const itemId = getItemId(item);

      if (itemType === "user-story") {
        connections.push(...this.getUserStoryConnections(item as UserStory, itemId));
      }

      if (itemType === "task") {
        connections.push(...this.getTaskBugRelations(itemId));
      }
    }

    return connections;
  }

  private getUserStoryConnections(userStory: UserStory, itemId: string): TreeConnection[] {
    const connections: TreeConnection[] = [];

    userStory.task_list?.forEach((taskId) => {
      if (this.itemMap.has(taskId)) {
        connections.push({
          source: itemId,
          target: taskId,
          sourceHandle: 'bottom-source',
          targetHandle: 'top-target',
          type: "parent-child",
        });
      }
    });

    for (const [, item] of this.itemMap) {
      if (getItemType(item) === "bug") {
        const bug = item as Bug;
        if (bug.userStoryRelated === itemId && !bug.taskRelated) {
          connections.push({
            source: itemId,
            target: getItemId(bug),
            sourceHandle: 'bottom-source',
            targetHandle: 'top-target',
            type: "parent-child",
          });
        }
      }
    }

    return connections;
  }

  private getTaskBugRelations(taskId: string): TreeConnection[] {
    const connections: TreeConnection[] = [];

    for (const [, item] of this.itemMap) {
      if (getItemType(item) === "bug") {
        const bug = item as Bug;
        if (bug.taskRelated === taskId) {
          connections.push({
            source: taskId,
            target: getItemId(bug),
            sourceHandle: 'top-source',
            targetHandle: 'bottom-target',
            type: "parent-child",
          });
        }
      }
    }

    return connections;
  }
}
