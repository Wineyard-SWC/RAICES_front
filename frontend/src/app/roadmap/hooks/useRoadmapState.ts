import { useState, useRef, useEffect } from 'react';
import { XYPosition } from '@xyflow/react';
import { RoadmapItem, RoadmapPhase, RoadmapChanges } from '@/types/roadmap';

export const useRoadmapState = (
  availableData: RoadmapItem[] = [],
  initialItems: RoadmapItem[] = [],   
  initialPhases: RoadmapPhase[] = []
) => {
  const [availableItems,setAvailableItems] = useState<RoadmapItem[]>(availableData);
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

  useEffect(() => {
    if (initialItems.length > 0) {
      console.log('🔄 Actualizando roadmapItems con datos iniciales:', initialItems);
      setRoadmapItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    if (initialPhases.length > 0) {
      console.log('🔄 Actualizando roadmapPhases con datos iniciales:', initialPhases);
      setRoadmapPhases(initialPhases);
    }
  }, [initialPhases]);

  useEffect(() => {
    console.log('🔄 Actualizando availableItems:', availableData.length);
    setAvailableItems(availableData);
  }, [availableData]);

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