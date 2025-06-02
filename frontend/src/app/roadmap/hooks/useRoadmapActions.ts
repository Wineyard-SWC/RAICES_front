import { useCallback } from 'react';
import { RoadmapItem, RoadmapPhase, getItemId } from '@/types/roadmap';
import { findRelatedItems } from '../utils/roadmapRelations';
import { UseRoadmapActionsProps } from './interfaces/useRoadmapActionProps';

export const useRoadmapActions = ({
  roadmapItems,
  setRoadmapItems,
  roadmapPhases,
  setRoadmapPhases,
  availableItems,
  setChanges,
  setCollapsedItems,
  savedPositionsRef,
}: UseRoadmapActionsProps) => {

  const handleAddItemToRoadmap = useCallback((item: RoadmapItem, phaseId?: string, addRelated: boolean = true) => {
    const itemId = getItemId(item);
    
    if (roadmapItems.find(existingItem => getItemId(existingItem) === itemId)) {
      return;
    }

    const itemsToAdd: RoadmapItem[] = [item];
    
    if (addRelated) {
      const relatedItems = findRelatedItems(item, availableItems);
      relatedItems.forEach(relatedItem => {
        const relatedId = getItemId(relatedItem);
        if (!roadmapItems.find(existingItem => getItemId(existingItem) === relatedId)) {
          itemsToAdd.push(relatedItem);
        }
      });
    }

    const targetPhaseId = phaseId || (roadmapPhases.length > 0 ? roadmapPhases[0].id : 'phase-1');

    setRoadmapItems(prev => [...prev, ...itemsToAdd]);

    const newItemIds = itemsToAdd.map(getItemId);

    setRoadmapPhases(prev => prev.map(phase => {
      if (phase.id === targetPhaseId) {
        const updatedItems = [...phase.items, ...newItemIds];
        return { 
          ...phase, 
          items: updatedItems,
          itemCount: updatedItems.length
        };
      }
      return phase;
    }));

    setChanges(prev => ({
      ...prev,
      modifiedItems: [...prev.modifiedItems, ...itemsToAdd],
      hasUnsavedChanges: true
    }));
  }, [roadmapItems, availableItems, setRoadmapItems, setRoadmapPhases, setChanges]);

  const handleBatchAddItems = useCallback((
    items: RoadmapItem[], 
    phaseId?: string, 
    addRelated: boolean = true
  ) => {
    let itemsToAdd: RoadmapItem[] = [...items];
    
    if (addRelated) {
      const allRelatedItems: RoadmapItem[] = [];
      
      items.forEach(item => {
        const relatedItems = findRelatedItems(item, availableItems);
        relatedItems.forEach(relatedItem => {
          const relatedId = getItemId(relatedItem);
          if (!roadmapItems.find(existing => getItemId(existing) === relatedId) &&
              !itemsToAdd.find(toAdd => getItemId(toAdd) === relatedId)) {
            allRelatedItems.push(relatedItem);
          }
        });
      });
      
      itemsToAdd = [...itemsToAdd, ...allRelatedItems];
    }

    const newItems = itemsToAdd.filter(item => 
      !roadmapItems.find(existing => getItemId(existing) === getItemId(item))
    );

    if (newItems.length === 0) return;

    setRoadmapItems(prev => [...prev, ...newItems]);

    const targetPhaseId = phaseId || (roadmapPhases.length > 0 ? roadmapPhases[0].id : 'phase-1');


    if (phaseId) {
      const newItemIds = newItems.map(getItemId);
      setRoadmapPhases(prev => prev.map(phase => 
        phase.id === phaseId 
          ? { 
              ...phase, 
              items: [...phase.items, ...newItemIds],
              itemCount: phase.items.length + newItemIds.length
            }
          : phase
      ));
    }

    setChanges(prev => ({
      ...prev,
      modifiedItems: [...prev.modifiedItems, ...newItems],
      hasUnsavedChanges: true
    }));
  }, [roadmapItems, availableItems, setRoadmapItems, setRoadmapPhases, setChanges]);

  const handleRemoveItemFromRoadmap = useCallback((itemId: string) => {
    setRoadmapItems(prev => prev.filter(item => getItemId(item) !== itemId));
    
    setRoadmapPhases(prev => prev.map(phase => ({
      ...phase,
      items: phase.items.filter(id => id !== itemId),
      itemCount: phase.items.filter(id => id !== itemId).length
    })));

    setCollapsedItems(prev => {
      const newCollapsed = new Set(prev);
      newCollapsed.delete(itemId);
      return newCollapsed;
    });

    savedPositionsRef.current.delete(itemId);

    setChanges(prev => ({
      ...prev,
      hasUnsavedChanges: true
    }));
  }, [setRoadmapItems, setRoadmapPhases, setCollapsedItems, savedPositionsRef, setChanges]);

  const handleCreatePhase = useCallback((name: string, description?: string) => {
    const newPhase: RoadmapPhase = {
      id: `phase-${Date.now()}`,
      name,
      description,
      color: '#6B7280',
      position: { 
        x: roadmapPhases.length * 400 + 100, 
        y: 100 
      },
      items: [],
      itemCount: 0
    };

    setRoadmapPhases(prev => [...prev, newPhase]);
    setChanges(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, [roadmapPhases.length, setRoadmapPhases, setChanges]);

  const handleMoveItemToPhase = useCallback((itemId: string, targetPhaseId: string) => {
    setRoadmapPhases(prev => prev.map(phase => {
      if (phase.items.includes(itemId)) {
        return { 
          ...phase, 
          items: phase.items.filter(id => id !== itemId),
          itemCount: phase.items.filter(id => id !== itemId).length
        };
      } else if (phase.id === targetPhaseId) {
        return { 
          ...phase, 
          items: [...phase.items, itemId],
          itemCount: phase.items.length + 1
        };
      }
      return phase;
    }));

    setChanges(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, [setRoadmapPhases, setChanges]);

  return {
    handleAddItemToRoadmap,
    handleBatchAddItems,
    handleRemoveItemFromRoadmap,
    handleCreatePhase,
    handleMoveItemToPhase,
  };
};