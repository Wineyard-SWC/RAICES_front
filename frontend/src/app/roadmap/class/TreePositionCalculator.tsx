import { RoadmapItem, getItemId, getItemType } from "@/types/roadmap";
import { UserStory } from "@/types/userstory";
import { XYPosition } from "@xyflow/react";

export interface LayoutConstants {
  ROOT_SPACING: number;
  TASK_GROUP_SPACING: number;
  MAX_USER_STORIES_PER_ROW: number;
  USER_STORY_LEVEL_Y: number;
  USER_STORY_ROW_SPACING: number;
  BUG_LEVEL_Y: number;
}

export class TreePositionCalculator {
  constructor(
    private basePosition: XYPosition,
    private constants: LayoutConstants,
    private findChildren: (parent: RoadmapItem) => RoadmapItem[]
  ) {}

  calculateUserStoryGrid(userStories: RoadmapItem[], allItems: RoadmapItem[]): Array<{
    userStory: RoadmapItem;
    position: XYPosition;
    row: number;
    col: number;
  }> {
    const layout: Array<{
      userStory: RoadmapItem;
      position: XYPosition;
      row: number;
      col: number;
    }> = [];

    userStories.forEach((userStory, index) => {
      const row = Math.floor(index / this.constants.MAX_USER_STORIES_PER_ROW);
      const col = index % this.constants.MAX_USER_STORIES_PER_ROW;

      const width = this.calculateUserStoryWidth(userStory);
      const spacing = Math.max(this.constants.ROOT_SPACING, width + 350);

      const x = this.basePosition.x + col * spacing;
      const y =
        this.basePosition.y +
        this.constants.USER_STORY_LEVEL_Y +
        row * this.constants.USER_STORY_ROW_SPACING +
        150;

      const priority = (userStory as UserStory).priority;
      const priorityOffset =
        priority === "High" ? -20 : priority === "Medium" ? -10 : 0;

      layout.push({
        userStory,
        position: { x, y: y + priorityOffset },
        row,
        col,
      });
    });

    return layout;
  }

  calculateTotalWidth(userStories: RoadmapItem[]): number {
    const rows = Math.ceil(userStories.length / this.constants.MAX_USER_STORIES_PER_ROW);
    const maxPerRow = Math.min(this.constants.MAX_USER_STORIES_PER_ROW, userStories.length);
    return maxPerRow * this.constants.ROOT_SPACING;
  }

  calculateUserStoryWidth(userStory: RoadmapItem): number {
    const tasks = this.findChildren(userStory).filter(
      (child) => getItemType(child) === "task"
    );

    if (tasks.length === 0) return 300;
    if (tasks.length <= 4) return tasks.length * this.constants.TASK_GROUP_SPACING;
    return 3 * this.constants.TASK_GROUP_SPACING;
  }

  sortUserStoriesByPriority(userStories: RoadmapItem[]): RoadmapItem[] {
    return [...userStories].sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const pa = priorityOrder[(a as UserStory).priority || "Low"];
      const pb = priorityOrder[(b as UserStory).priority || "Low"];
      return pb - pa;
    });
  }
}
