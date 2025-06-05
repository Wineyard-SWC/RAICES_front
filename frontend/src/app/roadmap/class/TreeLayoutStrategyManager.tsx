import { XYPosition } from "@xyflow/react";
import { RoadmapItem, getItemId, getItemType } from "@/types/roadmap";
import { LayoutConstants } from "./TreePositionCalculator";
import { TreeItemResolver } from "./TreeItemResolver";
import { TaskLayoutInfo } from "./interfaces/RowInfo";

export class TaskLayoutStrategy {
  private connectionAwareness = {
    enabled: true,
    centerTaskOffset: 35,      // Offset hacia abajo para task central
    horizontalOffset: 0,      // Pequeño offset horizontal
    tasksPerRow: 3,            // Tasks por fila en grid
  };

  constructor(
    private constants: LayoutConstants,
    private basePosition: XYPosition,
    private resolver: TreeItemResolver
  ) {}

  positionTasks(
    tasks: RoadmapItem[],
    allItems: RoadmapItem[],
    collapsedItems: Set<string>,
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    centerX: number,
    baseY: number,
    userStoryRow: number = 0
  ) {
    if (tasks.length <= 4) {
      this.positionHorizontally(
        tasks,
        collapsedItems,
        positions,
        savedPositions,
        centerX,
        baseY,
        userStoryRow
      );
    } else {
      this.positionInGridWithConnectionAwareness(
        tasks,
        collapsedItems,
        positions,
        savedPositions,
        centerX,
        baseY,
        userStoryRow
      );
    }
  }

  private positionHorizontally(
    tasks: RoadmapItem[],
    collapsedItems: Set<string>,
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    centerX: number,
    baseY: number,
    userStoryRow: number
  ) {
    const spacing = this.constants.TASK_GROUP_SPACING;
    const totalWidth = (tasks.length - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    tasks.forEach((task, index) => {
      const taskId = getItemId(task);
      const saved = savedPositions.get(taskId);

      if (saved && (task as any).customPosition) {
        positions.set(taskId, saved);
      } else {
        const x = startX + index * spacing;
        const y = baseY;
        positions.set(taskId, { x, y });
        this.positionBugsUnderTask(task, collapsedItems, positions, savedPositions, x, userStoryRow);
      }
    });
  }

  private positionInGridWithConnectionAwareness(
    tasks: RoadmapItem[],
    collapsedItems: Set<string>,
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    centerX: number,
    baseY: number,
    userStoryRow: number
  ) {
    const taskLayouts = this.calculateTaskLayouts(tasks, centerX, baseY);
    
    if (this.connectionAwareness.enabled) {
      this.adjustConnectionBlockingTasks(taskLayouts);
    }
    
    taskLayouts.forEach(layout => {
      const taskId = getItemId(layout.task);
      const saved = savedPositions.get(taskId);

      if (saved && (layout.task as any).customPosition) {
        positions.set(taskId, saved);
      } else {
        positions.set(taskId, layout.position);
        this.positionBugsUnderTask(
          layout.task, 
          collapsedItems, 
          positions, 
          savedPositions, 
          layout.position.x, 
          userStoryRow
        );
      }
    });
  }

  
  private calculateTaskLayouts(
    tasks: RoadmapItem[], 
    centerX: number, 
    baseY: number
  ): TaskLayoutInfo[] {
    const layouts: TaskLayoutInfo[] = [];
    const perRow = this.connectionAwareness.tasksPerRow;
    const rowSpacing = 280;

    tasks.forEach((task, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      
      const tasksInCurrentRow = Math.min(perRow, tasks.length - row * perRow);
      const rowWidth = tasksInCurrentRow * this.constants.TASK_GROUP_SPACING;
      const startX = centerX - (rowWidth - this.constants.TASK_GROUP_SPACING) / 2;
      
      const x = startX + col * this.constants.TASK_GROUP_SPACING;
      const y = baseY + row * rowSpacing;

      layouts.push({
        task,
        position: { x, y },
        row,
        col,
        isBlockingConnection: false
      });
    });

    return layouts;
  }

  private adjustConnectionBlockingTasks(taskLayouts: TaskLayoutInfo[]): void {
    const perRow = this.connectionAwareness.tasksPerRow;
    
    const maxRow = Math.max(...taskLayouts.map(l => l.row));
    if (maxRow === 0) return;

    taskLayouts.forEach(layout => {
      const { row, col } = layout;
      const isFirstRow = row === 0;
      const isCenterColumn = col === Math.floor(perRow / 2);
      const hasTasksBelow = taskLayouts.some(other => other.row > row);
      
      if (isFirstRow && 
          isCenterColumn && 
          hasTasksBelow && 
          perRow % 2 === 1) {
        
        layout.isBlockingConnection = true;
        
        layout.position.y += this.connectionAwareness.centerTaskOffset;
        layout.position.x += this.connectionAwareness.horizontalOffset;
      }
    });
  }

  private positionBugsUnderTask(
    task: RoadmapItem,
    collapsedItems: Set<string>,
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    taskX: number,
    userStoryRow: number
  ) {
    const taskId = getItemId(task);
    if (collapsedItems.has(taskId)) return;

    const bugs = this.resolver.findDirectChildren(task).filter(i => getItemType(i) === "bug");
    if (bugs.length === 0) return;

    const spacing = 200;
    const totalWidth = (bugs.length - 1) * spacing;
    const startX = taskX - totalWidth / 2;
    const bugY = this.basePosition.y + this.constants.BUG_LEVEL_Y + userStoryRow * this.constants.USER_STORY_ROW_SPACING;

    bugs.forEach((bug, index) => {
      const bugId = getItemId(bug);
      const saved = savedPositions.get(bugId);

      if (saved && (bug as any).customPosition) {
        positions.set(bugId, saved);
      } else {
        const x = startX + index * spacing;
        positions.set(bugId, { x, y: bugY });
      }
    });
  }

  setConnectionAwareness(enabled: boolean): void {
    this.connectionAwareness.enabled = enabled;
  }

  setCenterTaskOffset(offset: number): void {
    this.connectionAwareness.centerTaskOffset = offset;
  }

  setHorizontalOffset(offset: number): void {
    this.connectionAwareness.horizontalOffset = offset;
  }

  setTasksPerRow(count: number): void {
    this.connectionAwareness.tasksPerRow = count;
  }

  getConnectionAwarenessConfig() {
    return { ...this.connectionAwareness };
  }

}
