import { SuggestedPhase } from "@/app/roadmap/hooks/interfaces/useSuggestedRoadmapsProps";

export interface SuggestedRoadmapsBasicProps {
  onClose: () => void;
}

export interface SuggestedRoadmapsErrorProps extends SuggestedRoadmapsBasicProps {
  error: string;
}

export interface SuggestedRoadmapsHeaderProps extends SuggestedRoadmapsBasicProps{
  onMinimize?: () => void;
  showMinimizeButton?: boolean;
}

export interface SuggestedPhaseGridProps {
  phases: SuggestedPhase[];
  selectedPhases: Set<number>;
  onTogglePhase: (index: number) => void;
}

export interface SuggestedRoadmapsControlsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
}

export interface SuggestedPhaseCardProps {
  phase: SuggestedPhase;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}

export interface SuggestedRoadmapsActionsProps {
  selectedCount: number;
  onClear: () => void;
  onUseSelected: () => void;
}

export interface SuggestedRoadmapsListProps extends SuggestedRoadmapsBasicProps {
  suggestedRoadmaps: SuggestedPhase[];
  onSelectPhases: (selectedPhases: SuggestedPhase[]) => void;
  loading: boolean;
  error: string | null;
}

export interface ExtendedSuggestedRoadmapsListProps extends SuggestedRoadmapsListProps {
  isMinimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}


export interface SuggestedRoadmapsMinimizedProps extends SuggestedRoadmapsBasicProps {
  phasesCount: number;
  selectedCount: number;
  onMaximize?: () => void;
}
