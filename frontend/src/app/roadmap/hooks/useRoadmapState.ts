import { useState, useRef } from 'react';
import { XYPosition } from '@xyflow/react';
import { RoadmapItem, RoadmapPhase, RoadmapChanges } from '@/types/roadmap';

export const useRoadmapState = (availableData: RoadmapItem[] = []) => {
  const [availableItems] = useState<RoadmapItem[]>(availableData);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhase[]>([]);

  const [changes, setChanges] = useState<RoadmapChanges>({
    addedConnections: [],
    removedConnections: [],
    modifiedItems: [],
    hasUnsavedChanges: false
  });

  const savedPositionsRef = useRef<Map<string, XYPosition>>(new Map());

  return {
    availableItems,
    roadmapItems,
    setRoadmapItems,
    collapsedItems,
    setCollapsedItems,
    roadmapPhases,
    setRoadmapPhases,
    changes,
    setChanges,
    savedPositionsRef,
  };
};