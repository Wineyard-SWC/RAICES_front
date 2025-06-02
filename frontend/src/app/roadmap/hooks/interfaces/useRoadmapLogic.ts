import { Node,Edge } from "@xyflow/react";
import { RoadmapItem, RoadmapConnection, RoadmapPhase, NodeData } from "@/types/roadmap";


export interface UseCustomRoadmapLogicProps {
  availableData?: RoadmapItem[]; 
  onSave?: (items: RoadmapItem[], connections: RoadmapConnection[], phases: RoadmapPhase[]) => Promise<void>;
  filterByPhase?: boolean;
  selectedPhaseId?:string;
}

export interface UseCustomRoadmapLogicReturn {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  isSaving: boolean;
  changes: any;
  
  roadmapItems: RoadmapItem[];
  availableItems: RoadmapItem[];
  roadmapPhases: RoadmapPhase[];
  collapsedItems: Set<string>;

  nodeTypes: { [key: string]: any };
  
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: any) => void;
  onEdgesDelete: (edgesToDelete: Edge[]) => void;
  onNodeClick: (event: MouseEvent, node: Node) => void;
  onNodeDoubleClick: (event: MouseEvent, node: Node) => void;
  createUnifiedLayout: (items: RoadmapItem[]) => Map<any,any>;
  createPhaseLayout: (items: RoadmapItem[], phaseId: string) => Map<any,any>;
  createAutoLayout: (items: RoadmapItem[], isFiltered: boolean, selectedPhaseId?: string) => Map<any,any>;

  handleAddItemToRoadmap: (item: RoadmapItem, phaseId?: string, addRelated?: boolean) => void;
  handleBatchAddItems: (items: RoadmapItem[], phaseId?: string, addRelated?: boolean) => void; 
  handleRemoveItemFromRoadmap: (itemId: string) => void;
  handleCreatePhase: (name: string, description?: string) => void;
  handleMoveItemToPhase: (itemId: string, phaseId: string) => void;
  handleSave: () => Promise<void>;
  handleCloseDetail: () => void;
  handleToggleItemCollapse: (itemId: string) => void;
  
  getMiniMapNodeColor: (node: Node) => string;
  getItemsInPhase: (phaseId: string) => RoadmapItem[];
  getAvailableItemsByType: (type: 'user-story' | 'task' | 'bug') => RoadmapItem[];
  
  setChanges: React.Dispatch<React.SetStateAction<any>>;
  setRoadmapPhases: React.Dispatch<React.SetStateAction<RoadmapPhase[]>>;
}
