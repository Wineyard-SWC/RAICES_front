import { XYPosition } from "@xyflow/react";
import { RoadmapItem, getItemType, getItemId } from "@/types/roadmap";
import { TreeItemResolver } from "./TreeItemResolver";
import { TreeItemConnector } from "./TreeItemConnector";
import { TaskLayoutStrategy } from "./TreeLayoutStrategyManager";
import { TreePositionCalculator, LayoutConstants } from "./TreePositionCalculator";
import { UserStoryLayoutInfo } from "./interfaces/UserStoryLayoutInfo";
import { RowInfo } from "./interfaces/RowInfo";

export class TreeLayoutManager {
  private phaseId: string;
  private basePosition: XYPosition;
  private constants: LayoutConstants = {
    ROOT_SPACING: 1000,
    TASK_GROUP_SPACING: 250,
    MAX_USER_STORIES_PER_ROW: 3,
    USER_STORY_LEVEL_Y: 350,
    USER_STORY_ROW_SPACING: 900, 
    BUG_LEVEL_Y: 1050,
  };

  private dynamicConstants = {
    MIN_ROW_SPACING: 500,        // Espaciado mínimo entre filas
    TASK_ROW_HEIGHT: 280,        // Altura de cada fila de tasks
    BUG_SPACING: 150,            // Espacio para bugs bajo tasks
    PADDING_BETWEEN_ROWS: 100,   // Padding extra entre filas de user stories
    MIN_COLUMN_WIDTH: 600,      // Ancho mínimo por columna
    TASK_HORIZONTAL_SPACING: 250, // Espacio entre tasks horizontalmente
    ADAPTIVE_SPACING: true,           
  };

  private resolver!: TreeItemResolver;
  private connector!: TreeItemConnector;
  private taskStrategy!: TaskLayoutStrategy;
  private positionCalculator!: TreePositionCalculator;

  constructor(phaseId: string, basePosition: XYPosition) {
    this.phaseId = phaseId;
    this.basePosition = basePosition;
  }

  private initializeDependencies(items: RoadmapItem[]): void {
    this.resolver = new TreeItemResolver(items);
    this.connector = new TreeItemConnector(items);
    this.taskStrategy = new TaskLayoutStrategy(
      this.constants,
      this.basePosition,
      this.resolver
    );
    this.positionCalculator = new TreePositionCalculator(
      this.basePosition,
      this.constants,
      (parent) => this.resolver.findDirectChildren(parent)
    );
  }

  calculateTreePositions(
    items: RoadmapItem[],
    collapsedItems: Set<string>,
    savedPositions: Map<string, XYPosition> = new Map()
  ): Map<string, XYPosition> {
    this.initializeDependencies(items);

    const userStories = items.filter(item => getItemType(item) === 'user-story');
    const positions = new Map<string, XYPosition>();
    
    const sortedUserStories = this.positionCalculator.sortUserStoriesByPriority(userStories);
    
    const userStoryLayouts = this.calculateUserStoryLayouts(sortedUserStories, items);
    
    if (this.dynamicConstants.ADAPTIVE_SPACING) {
      this.adjustAdaptiveSpacing(userStoryLayouts);
    }

    const rowsInfo = this.calculateDynamicRowPositions(userStoryLayouts);
    
    rowsInfo.forEach(rowInfo => {
      rowInfo.userStories.forEach(layout => {
        this.positionUserStoryAndChildren(
          layout,
          items,
          collapsedItems,
          positions,
          savedPositions,
          rowInfo.baseY
        );
      });
    });
    
    const lastRowInfo = rowsInfo[rowsInfo.length - 1];
    const orphanStartY = lastRowInfo ? lastRowInfo.baseY + lastRowInfo.maxHeight + 200 : this.basePosition.y;
    this.positionOrphanItems(userStories, positions, savedPositions, orphanStartY);
    
    return positions;
  }

  private calculateUserStoryLayouts(
    userStories: RoadmapItem[],
    allItems: RoadmapItem[]
  ): UserStoryLayoutInfo[] {
    return userStories.map((userStory, index) => {
      const row = Math.floor(index / this.constants.MAX_USER_STORIES_PER_ROW);
      const col = index % this.constants.MAX_USER_STORIES_PER_ROW;
      
      const children = this.resolver.findDirectChildren(userStory);
      const tasks = children.filter(child => getItemType(child) === 'task');
      const directBugs = children.filter(child => getItemType(child) === 'bug');
      
      const taskRows = tasks.length <= 4 ? 1 : Math.ceil(tasks.length / 3);
      
      const taskHeight = taskRows * this.dynamicConstants.TASK_ROW_HEIGHT;
      const bugHeight = (tasks.length > 0 || directBugs.length > 0) ? this.dynamicConstants.BUG_SPACING : 0;
      const totalHeight = taskHeight + bugHeight;
      
      const tasksPerRow = Math.min(3, tasks.length);
      const requiredWidth = Math.max(
        this.dynamicConstants.MIN_COLUMN_WIDTH,
        tasksPerRow * this.dynamicConstants.TASK_HORIZONTAL_SPACING
      );

      const baseX = this.basePosition.x + (col * this.constants.ROOT_SPACING);
      const baseY = this.basePosition.y + this.constants.USER_STORY_LEVEL_Y;
      
      return {
        userStory,
        position: { x: baseX, y: baseY }, 
        row,
        col,
        taskRows,
        totalHeight,
        maxBugY: baseY + taskHeight + bugHeight,
        requiredWidth,
        taskCount: tasks.length
      };
    });
  }

  private adjustAdaptiveSpacing(userStoryLayouts: UserStoryLayoutInfo[]): void {
    const rowsMap = new Map<number, UserStoryLayoutInfo[]>();
    userStoryLayouts.forEach(layout => {
      if (!rowsMap.has(layout.row)) {
        rowsMap.set(layout.row, []);
      }
      rowsMap.get(layout.row)!.push(layout);
    });

    rowsMap.forEach((layoutsInRow, rowIndex) => {
      const maxWidthInRow = Math.max(
        ...layoutsInRow.map(layout => layout.requiredWidth || this.dynamicConstants.MIN_COLUMN_WIDTH)
      );
      
      const requiredSpacing = Math.max(
        this.constants.ROOT_SPACING,
        maxWidthInRow + 100 
      );
      
      layoutsInRow.forEach((layout, colIndex) => {
        layout.position.x = this.basePosition.x + (colIndex * requiredSpacing);
      });
    });
  }


  private calculateDynamicRowPositions(userStoryLayouts: UserStoryLayoutInfo[]): RowInfo[] {
    const rowsMap = new Map<number, UserStoryLayoutInfo[]>();
    
    userStoryLayouts.forEach(layout => {
      if (!rowsMap.has(layout.row)) {
        rowsMap.set(layout.row, []);
      }
      rowsMap.get(layout.row)!.push(layout);
    });
    
    const rowsInfo: RowInfo[] = [];
    let currentY = this.basePosition.y + this.constants.USER_STORY_LEVEL_Y;
    
    for (let rowIndex = 0; rowIndex < rowsMap.size; rowIndex++) {
      const userStoriesInRow = rowsMap.get(rowIndex) || [];
      
      const maxHeight = Math.max(
        this.dynamicConstants.MIN_ROW_SPACING,
        ...userStoriesInRow.map(layout => layout.totalHeight)
      );
      
      userStoriesInRow.forEach(layout => {
        layout.position.y = currentY;
      });
      
      rowsInfo.push({
        rowIndex,
        userStories: userStoriesInRow,
        maxHeight,
        baseY: currentY
      });
      
      currentY += maxHeight + this.dynamicConstants.PADDING_BETWEEN_ROWS;
    }
    
    return rowsInfo;
  }

  private positionUserStoryAndChildren(
    layout: UserStoryLayoutInfo,
    allItems: RoadmapItem[],
    collapsedItems: Set<string>,
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    rowBaseY: number
  ): void {
    const { userStory, position } = layout;
    const userStoryId = getItemId(userStory);
    
    const savedPosition = savedPositions.get(userStoryId);
    if (savedPosition && (userStory as any).customPosition) {
      positions.set(userStoryId, savedPosition);
    } else {
      positions.set(userStoryId, position);
    }
    
    if (collapsedItems.has(userStoryId)) return;

    const children = this.resolver.findDirectChildren(userStory);
    const tasks = children.filter(child => getItemType(child) === 'task');
    const directBugs = children.filter(child => getItemType(child) === 'bug');
    
    if (tasks.length > 0) {
      const taskBaseY = position.y + 350; 
      
      this.taskStrategy.positionTasks(
        tasks,
        allItems,
        collapsedItems,
        positions,
        savedPositions,
        position.x,
        taskBaseY,
        layout.row
      );
    }

    if (directBugs.length > 0) {
      this.positionDirectUserStoryBugs(
        directBugs,
        positions,
        savedPositions,
        position,
        layout.taskRows
      );
    }
  }

  

  private positionDirectUserStoryBugs(
    directBugs: RoadmapItem[],
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    userStoryPosition: XYPosition,
    taskRows: number
  ): void {
    const bugBaseY = userStoryPosition.y + 350 + 
                     (taskRows * this.dynamicConstants.TASK_ROW_HEIGHT) +
                     50;
    
    const bugSpacing = 200;
    const totalBugWidth = (directBugs.length - 1) * bugSpacing;
    const bugStartX = userStoryPosition.x - totalBugWidth / 2;
    
    directBugs.forEach((bug, index) => {
      const bugId = getItemId(bug);
      const savedPosition = savedPositions.get(bugId);
      
      if (savedPosition && (bug as any).customPosition) {
        positions.set(bugId, savedPosition);
      } else {
        const bugX = bugStartX + (index * bugSpacing);
        positions.set(bugId, { x: bugX, y: bugBaseY });
      }
    });
  }

  private positionOrphanItems(
    userStories: RoadmapItem[],
    positions: Map<string, XYPosition>,
    savedPositions: Map<string, XYPosition>,
    startY: number
  ): void {
    const userStoryIds = new Set(userStories.map(us => getItemId(us)));
    
    const orphanTasks = this.resolver.findOrphanTasks(userStoryIds);
    const orphanBugs = this.resolver.findOrphanBugs(userStoryIds);
    
    const startX = this.basePosition.x + 
                   (this.constants.MAX_USER_STORIES_PER_ROW * this.constants.ROOT_SPACING) + 100;
    
    orphanTasks.forEach((task, index) => {
      const taskId = getItemId(task);
      const savedPosition = savedPositions.get(taskId);
      
      if (savedPosition && (task as any).customPosition) {
        positions.set(taskId, savedPosition);
      } else {
        positions.set(taskId, {
          x: startX + (index * this.constants.TASK_GROUP_SPACING),
          y: startY
        });
      }
    });
    
    orphanBugs.forEach((bug, index) => {
      const bugId = getItemId(bug);
      const savedPosition = savedPositions.get(bugId);
      
      if (savedPosition && (bug as any).customPosition) {
        positions.set(bugId, savedPosition);
      } else {
        positions.set(bugId, {
          x: startX + (index * this.constants.TASK_GROUP_SPACING),
          y: startY + 300 
        });
      }
    });
  }

  calculateTotalWidth(userStories: RoadmapItem[]): number {
    this.initializeDependencies(userStories);
    return this.positionCalculator.calculateTotalWidth(userStories);
  }

  generateConnections(items: RoadmapItem[]) {
    this.initializeDependencies(items);
    return this.connector.generateConnections();
  }

  updateConstants(newConstants: Partial<LayoutConstants>): void {
    this.constants = { ...this.constants, ...newConstants };
  }

  updateDynamicConstants(newConstants: Partial<typeof this.dynamicConstants>): void {
    this.dynamicConstants = { ...this.dynamicConstants, ...newConstants };
  }

  setHorizontalSpacing(spacing: number): void {
    this.constants.ROOT_SPACING = spacing;
  }

  setAdaptiveSpacing(enabled: boolean): void {
    this.dynamicConstants.ADAPTIVE_SPACING = enabled;
  }

  setMinColumnWidth(width: number): void {
    this.dynamicConstants.MIN_COLUMN_WIDTH = width;
  }

  getResolver(): TreeItemResolver | undefined {
    return this.resolver;
  }

  getConnector(): TreeItemConnector | undefined {
    return this.connector;
  }

  getTaskStrategy(): TaskLayoutStrategy | undefined {
    return this.taskStrategy;
  }

  getPositionCalculator(): TreePositionCalculator | undefined {
    return this.positionCalculator;
  }
}

export const generateTreeConnections = (items: RoadmapItem[]) => {
  const connector = new TreeItemConnector(items);
  return connector.generateConnections();
};