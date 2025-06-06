import { UserStoryLayoutInfo } from "./UserStoryLayoutInfo";
import { XYPosition } from "@xyflow/react";
import { RoadmapItem } from "@/types/roadmap";

export interface RowInfo {
  rowIndex: number;
  userStories: UserStoryLayoutInfo[];
  maxHeight: number;    
  baseY: number;        
}

export interface TaskLayoutInfo {
  task: RoadmapItem;
  position: XYPosition;
  row: number;
  col: number;
  isBlockingConnection?: boolean; 
}