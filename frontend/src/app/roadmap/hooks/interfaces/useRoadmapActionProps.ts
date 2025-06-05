import { RoadmapItem, RoadmapPhase, RoadmapChanges } from "@/types/roadmap";

export interface UseRoadmapActionsProps {
  roadmapItems: RoadmapItem[];
  setRoadmapItems: React.Dispatch<React.SetStateAction<RoadmapItem[]>>;
  roadmapPhases: RoadmapPhase[];
  setRoadmapPhases: React.Dispatch<React.SetStateAction<RoadmapPhase[]>>;
  availableItems: RoadmapItem[];
  setChanges: React.Dispatch<React.SetStateAction<RoadmapChanges>>;
  setCollapsedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  savedPositionsRef: React.RefObject<Map<string, any>>;
}