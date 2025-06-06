import { RoadmapItem } from "@/types/roadmap";
import { XYPosition } from "@xyflow/react";

export interface UserStoryLayoutInfo {
  userStory: RoadmapItem;
  position: XYPosition;
  row: number;
  col: number;
  taskRows: number;     
  totalHeight: number;   
  maxBugY: number;  
  requiredWidth:number    
}
