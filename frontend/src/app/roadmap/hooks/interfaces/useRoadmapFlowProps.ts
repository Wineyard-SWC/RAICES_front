export interface UseRoadmapFlowProps {
  roadmapItems: any[];
  roadmapPhases: any[];
  collapsedItems: Set<string>;
  phaseLayoutManagers: Map<string, any>;
  savedPositionsRef: React.RefObject<Map<string, any>>;
  setRoadmapItems: React.Dispatch<React.SetStateAction<any[]>>;
  setCollapsedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}