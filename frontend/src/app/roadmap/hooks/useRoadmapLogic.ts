import { useState, useCallback } from 'react';
import TaskCard from '../components/roadmapcard';
import PhaseCard from '../components/roadmapphasecard';
import { useUser } from '@/contexts/usercontext';
import { useRoadmapState } from './useRoadmapState';
import { useRoadmapLayout } from './useRoadmapLayout';
import { useRoadmapActions } from './useRoadmapActions';
import { useRoadmapFlow } from './useRoadmapFlow';
import { RoadmapConnection } from '@/types/roadmap';
import { getItemsInPhase, getAvailableItemsByType } from '../utils/roadmapHelpers';
import { getMiniMapNodeColor } from '../styles/minimap';
import { UseCustomRoadmapLogicProps, UseCustomRoadmapLogicReturn } from './interfaces/useRoadmapLogic';

export const useCustomRoadmapLogic = ({ 
  availableData = [], 
  onSave,
  filterByPhase = false,
  selectedPhaseId = '',
  initialItems = [],     
  initialPhases = [],
}: UseCustomRoadmapLogicProps): UseCustomRoadmapLogicReturn => {
  
  const nodeTypes = {
    taskNode: TaskCard,
    phaseNode: PhaseCard, 
  };

  const [isSaving, setIsSaving] = useState(false);
  const { userId, userData } = useUser();

  const {
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
  } = useRoadmapState(availableData,initialItems,initialPhases);

  const { 
    phaseLayoutManagers, 
    adjustedRoadmapPhases,
    LAYOUT_CONSTANTS,
    createUnifiedLayout,
    createPhaseLayout,
    createAutoLayout 
  } = useRoadmapLayout(roadmapPhases, roadmapItems, selectedPhaseId, filterByPhase);


  const {
    handleAddItemToRoadmap,
    handleBatchAddItems,
    handleRemoveItemFromRoadmap,
    handleCreatePhase,
    handleMoveItemToPhase,
  } = useRoadmapActions({
    roadmapItems,
    setRoadmapItems,
    roadmapPhases: adjustedRoadmapPhases,
    setRoadmapPhases,
    availableItems,
    setChanges,
    setCollapsedItems,
    savedPositionsRef,
  });

  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgesDelete,
    onNodeClick,
    onNodeDoubleClick,
    handleToggleItemCollapse,
  } = useRoadmapFlow({
    roadmapItems,
    roadmapPhases: adjustedRoadmapPhases,
    collapsedItems,
    phaseLayoutManagers,
    savedPositionsRef,
    setRoadmapItems,
    setCollapsedItems,
    createUnifiedLayout, 
    isUnifiedLayout: !filterByPhase || !selectedPhaseId,
  });

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      const currentConnections: RoadmapConnection[] = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: (edge.data?.connectionType as "relation" | "dependency" | "parent-child") || "relation"
      }));

      await onSave(roadmapItems, currentConnections, roadmapPhases);
      
      setChanges({
        addedConnections: [],
        removedConnections: [],
        modifiedItems: [],
        hasUnsavedChanges: false
      });
      
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, edges, roadmapItems, roadmapPhases, setChanges]);

  const handleCloseDetail = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const getItemsInPhaseHelper = useCallback((phaseId: string) => 
    getItemsInPhase(phaseId, roadmapPhases, roadmapItems), 
    [roadmapPhases, roadmapItems]
  );

  const getAvailableItemsByTypeHelper = useCallback((type: 'user-story' | 'task' | 'bug') => 
    getAvailableItemsByType(type, availableItems, roadmapItems), 
    [availableItems, roadmapItems]
  );

  return {
    nodes,
    edges,
    selectedNode,
    isSaving,
    changes,
    roadmapItems,
    availableItems,
    roadmapPhases: adjustedRoadmapPhases,
    collapsedItems,
    createUnifiedLayout,
    createPhaseLayout,
    createAutoLayout,
    
    nodeTypes,
    
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgesDelete,
    onNodeClick,
    onNodeDoubleClick,
    
    handleAddItemToRoadmap,
    handleBatchAddItems,
    handleRemoveItemFromRoadmap,
    handleCreatePhase,
    handleMoveItemToPhase,
    handleSave,
    handleCloseDetail,
    handleToggleItemCollapse,
    
    getMiniMapNodeColor,
    getItemsInPhase: getItemsInPhaseHelper,
    getAvailableItemsByType: getAvailableItemsByTypeHelper,
    
    setChanges,
    setRoadmapPhases,
  };
};

export default useCustomRoadmapLogic;