import { useState, useEffect, useCallback, useMemo } from 'react';
import { TreeLayoutManager } from '../class/TreeLayoutManager';
import { RoadmapPhase } from '@/types/roadmap';
import { RoadmapItem } from '@/types/roadmap';
import { getItemId } from '@/types/roadmap';

export const useRoadmapLayout = (
  roadmapPhases: RoadmapPhase[], 
  roadmapItems:RoadmapItem[],
  selectedPhaseId:string,
  filterByPhase:boolean,
) => {
  const [phaseLayoutManagers, setPhaseLayoutManagers] = useState<Map<string, TreeLayoutManager>>(new Map());

  const LAYOUT_CONSTANTS = {
    PHASE_WIDTH: 350,
    PHASE_HEIGHT: 200,
    PHASE_SPACING_X: 400, 
    ITEM_SPACING_Y: 120,
    ITEMS_START_Y: 300,
    ITEMS_PER_COLUMN: 4,
    UNIFIED_LAYOUT: {
      ITEMS_PER_ROW: 4,
      ITEM_WIDTH: 280,
      ITEM_HEIGHT: 120,
      ITEM_SPACING_X: 320,
      ITEM_SPACING_Y: 150,
      START_X: 100,
      START_Y: 300,
      PHASE_HEADER_HEIGHT: 100,
    }
  };

  const createUnifiedLayout = useCallback((items: RoadmapItem[]) => {
    const positions = new Map();
    const { ITEMS_PER_ROW, ITEM_SPACING_X, ITEM_SPACING_Y, START_X, START_Y } = LAYOUT_CONSTANTS.UNIFIED_LAYOUT;

    const itemsByPhase = new Map<string, RoadmapItem[]>();
    
    roadmapPhases.forEach(phase => {
      const phaseItems = items.filter(item => phase.items.includes(getItemId(item)));
      if (phaseItems.length > 0) {
        itemsByPhase.set(phase.id, phaseItems);
      }
    });

    const unassignedItems = items.filter(item => 
      !roadmapPhases.some(phase => phase.items.includes(getItemId(item)))
    );
    
    if (unassignedItems.length > 0) {
      itemsByPhase.set('unassigned', unassignedItems);
    }

    let currentRow = 0;
    let currentCol = 0;

    Array.from(itemsByPhase.entries()).forEach(([phaseId, phaseItems], phaseIndex) => {
      if (phaseIndex > 0 && currentCol > 0) {
        currentRow++;
        currentCol = 0;
      }

      phaseItems.forEach((item, itemIndex) => {
        const x = START_X + (currentCol * ITEM_SPACING_X);
        const y = START_Y + (currentRow * ITEM_SPACING_Y);
        
        positions.set(getItemId(item), { x, y });

        currentCol++;
        if (currentCol >= ITEMS_PER_ROW) {
          currentCol = 0;
          currentRow++;
        }
      });
    });

    return positions;
  }, [])
  
  const createPhaseLayout = useCallback((items: RoadmapItem[], phaseId: string) => {
    const positions = new Map();
    const { ITEMS_PER_ROW, ITEM_SPACING_X, ITEM_SPACING_Y, START_X, START_Y } = LAYOUT_CONSTANTS.UNIFIED_LAYOUT;

    const adjustedStartX = items.length <= ITEMS_PER_ROW ? 
      START_X + ((ITEMS_PER_ROW - items.length) * ITEM_SPACING_X / 2) : 
      START_X;

    items.forEach((item, index) => {
      const row = Math.floor(index / ITEMS_PER_ROW);
      const col = index % ITEMS_PER_ROW;
      
      const x = adjustedStartX + (col * ITEM_SPACING_X);
      const y = START_Y + (row * ITEM_SPACING_Y);
      
      positions.set(getItemId(item), { x, y });
    });

    return positions;
  }, []);
  
  const adjustedRoadmapPhases = useMemo(() => {
    return roadmapPhases.map((phase, index) => ({
      ...phase,
      position: {
        x: 100 + (index * LAYOUT_CONSTANTS.PHASE_SPACING_X),
        y: 50 
      }
    }));
  }, [roadmapPhases, LAYOUT_CONSTANTS.PHASE_SPACING_X]);
  

  const createAutoLayout = useCallback((
    items: RoadmapItem[], 
    isFiltered: boolean, 
    selectedPhaseId?: string
  ) => {
    if (isFiltered && selectedPhaseId) {
      return createPhaseLayout(items, selectedPhaseId);
    } else {
      return createUnifiedLayout(items);
    }
  }, [createPhaseLayout, createUnifiedLayout]);


  useEffect(() => {
    const newManagers = new Map<string, TreeLayoutManager>();
    newManagers.set('global', new TreeLayoutManager('global', { x: 100, y: 100 }));
    adjustedRoadmapPhases.forEach(phase => {
      newManagers.set(phase.id, new TreeLayoutManager(phase.id, phase.position));
    });
    setPhaseLayoutManagers(newManagers);
  }, [adjustedRoadmapPhases]);

  const calculateItemPositionInPhase = useCallback((
    phaseId: string, 
    itemIndex: number,
    offsetX = 0,
    offsetY = 0
  ) => {
    const phase = adjustedRoadmapPhases.find(p => p.id === phaseId);
    if (!phase) return { x: 0, y: 0 };

    const baseX = phase.position.x + offsetX;
    const baseY = LAYOUT_CONSTANTS.ITEMS_START_Y + offsetY + (itemIndex * LAYOUT_CONSTANTS.ITEM_SPACING_Y);

    return { x: baseX, y: baseY };
  }, [adjustedRoadmapPhases, LAYOUT_CONSTANTS]);

  return {
    phaseLayoutManagers,
    adjustedRoadmapPhases,
    LAYOUT_CONSTANTS,
    calculateItemPositionInPhase,
    createUnifiedLayout,    
    createPhaseLayout,
    createAutoLayout, 
  };
};