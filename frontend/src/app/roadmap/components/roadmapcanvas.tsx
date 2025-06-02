"use client";

import React, { forwardRef, useEffect, useState, useMemo ,useRef,useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant
} from '@xyflow/react';
import { 
  Target, 
  Plus, 
  FolderPlus, 
  Save, 
  Minus, 
  EyeOff,
  Layers,
  Settings,
  MousePointer,
  Trash2,
  FilterX,
  Filter
} from 'lucide-react';
import '@xyflow/react/dist/style.css';
import useCustomRoadmapLogic from '../hooks/useRoadmapLogic';
import RoadmapItemSelector from './roadmapitemselector';
import type { RoadmapPhase,RoadmapItem, RoadmapConnection } from '@/types/roadmap';
import { getItemId } from '@/types/roadmap';


type CustomRoadmapCanvasProps = {
  availableData: RoadmapItem[];
  onSave: (items: RoadmapItem[], connections: RoadmapConnection[], phases: RoadmapPhase[]) => Promise<void>;
};

const CustomRoadmapCanvas = forwardRef<HTMLDivElement, CustomRoadmapCanvasProps>(
  ({ availableData, onSave }, ref) => {
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [showPhaseCreator, setShowPhaseCreator] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDescription, setNewPhaseDescription] = useState('');
  const [showMainControls, setShowMainControls] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [selectedPhaseId, setSelectedPhaseId] = useState('')
  const [filterByPhase, setFilterByPhase] = useState(false);

  const {
    nodes,
    edges,
    selectedNode,
    isSaving,
    changes,
    roadmapItems,
    availableItems,
    roadmapPhases,
    collapsedItems,
    nodeTypes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgesDelete,
    onNodeClick,
    onNodeDoubleClick,
    createPhaseLayout,
    createUnifiedLayout,
    handleAddItemToRoadmap,
    handleRemoveItemFromRoadmap,
    handleCreatePhase,
    handleMoveItemToPhase,
    handleSave,
    handleCloseDetail,
    getMiniMapNodeColor,
    getItemsInPhase,
    getAvailableItemsByType,
    handleToggleItemCollapse,
  } = useCustomRoadmapLogic({ 
    availableData,
    onSave,
    filterByPhase,
    selectedPhaseId
  });

  useEffect(() => {
    const isUnified = !filterByPhase || !selectedPhaseId;
    
  }, [filterByPhase, selectedPhaseId]);

  const reactFlowInstance = useRef<any>(null);

  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  const filteredNodes = useMemo(() => {
    if (!filterByPhase || !selectedPhaseId) {
      return nodes;
    }

    const filtered = nodes.filter(node => {
      if (node.data?.type === 'phase') {
        return true;
      }
      
      const selectedPhase = roadmapPhases.find(p => p.id === selectedPhaseId);
      if (selectedPhase && node.data?.id) {
        return selectedPhase.items.includes(node.data.id);
      }
      
      return false;
    });
    return filtered;
  }, [nodes, filterByPhase, selectedPhaseId, roadmapPhases]);

  const filteredEdges = useMemo(() => {
    if (!filterByPhase || !selectedPhaseId) {
      return edges; 
    }

    const visibleNodeIds = new Set(filteredNodes.map(node => node.id));
    
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes, filterByPhase, selectedPhaseId]);

  const visibleUserStoryCount = filteredNodes.filter(node => node.data?.type === 'user-story').length;
  const visibleTaskCount = filteredNodes.filter(node => node.data?.type === 'task').length;
  const visibleBugCount = filteredNodes.filter(node => node.data?.type === 'bug').length;


  const userStoryCount = roadmapItems.filter(item => 'points' in item).length;
  const taskCount = roadmapItems.filter(item => 'story_points' in item).length;
  const bugCount = roadmapItems.filter(item => 'severity' in item).length;
  const collapsedCount = collapsedItems.size;

  const handleCreateNewPhase = () => {
    if (newPhaseName.trim()) {
      handleCreatePhase(newPhaseName.trim(), newPhaseDescription.trim() || undefined);
      setNewPhaseName('');
      setNewPhaseDescription('');
      setShowPhaseCreator(false);
    }
  };

  const handlePhaseSelection = (phaseId: string) => {
    if (selectedPhaseId === phaseId) {
      setSelectedPhaseId('');
      setFilterByPhase(false);
    } else {
      setSelectedPhaseId(phaseId);
    }
  };

  const handleTogglePhaseFilter = () => {
    if (selectedPhaseId) {
      setFilterByPhase(!filterByPhase);
      
      setTimeout(() => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({
            padding: 0.15,
            includeHiddenNodes: false,
            maxZoom: 1.2,
            duration: 800 
          });
        }
      }, 100);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] bg-gradient-to-br from-[#f5f0f1] to-[#ebe5eb] rounded-xl shadow-sm border border-[#c7a0b8] overflow-hidden">
      {/* Item Selector Modal */}
      <RoadmapItemSelector
        availableItems={availableItems}
        roadmapItems={roadmapItems}
        phases={roadmapPhases}
        onAddItem={(item, phaseId) => {
          const targetPhase = phaseId || selectedPhaseId;
          handleAddItemToRoadmap(item, targetPhase, true)
        }}
        onRemoveItem={handleRemoveItemFromRoadmap}
        isOpen={showItemSelector}
        onClose={() => setShowItemSelector(false)}
        selectedPhaseId={selectedPhaseId}
      />

      {/* Phase Creator Modal */}
      {showPhaseCreator && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-[#4a2b4a]">Create New Phase</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#694969] mb-2">
                  Phase Name
                </label>
                <input
                  type="text"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#c7a0b8] rounded-lg focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent"
                  placeholder="e.g., Frontend Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#694969] mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newPhaseDescription}
                  onChange={(e) => setNewPhaseDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-[#c7a0b8] rounded-lg focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent"
                  rows={3}
                  placeholder="Phase description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPhaseCreator(false)}
                className="px-4 py-2 text-[#694969] hover:text-[#4a2b4a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPhase}
                className="px-6 py-2 bg-[#7d5c85] text-white rounded-lg hover:bg-[#694969] transition-colors"
              >
                Create Phase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Panel */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`bg-white rounded-xl shadow-lg border border-[#c7a0b8] transition-all duration-300 ${
          showMainControls ? 'p-4' : 'p-2'
        }`}>
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-bold text-[#4a2b4a] flex items-center gap-2 ${
              showMainControls ? 'text-lg' : 'text-sm'
            }`}>
              <Target className="w-5 h-5" />
              {showMainControls && 'Roadmap Controls'}
            </h2>
            <button
              onClick={() => setShowMainControls(!showMainControls)}
              className="text-[#694969] hover:text-[#4a2b4a] transition-colors p-1 rounded hover:bg-[#ebe5eb]"
            >
              {showMainControls ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {showMainControls && (
            <>
             {/* Filter Status */}
              {filterByPhase && selectedPhaseId && (
                <div className="mb-4 p-3 bg-[#7d5c85] text-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Filtered View</div>
                      <div className="text-xs opacity-90">
                        Showing: {roadmapPhases.find(p => p.id === selectedPhaseId)?.name}
                      </div>
                    </div>
                    <button
                      aria-label="filter"
                      onClick={() => setFilterByPhase(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <FilterX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-[#f5f0f1] rounded-lg border border-[#ebe5eb]">
                  <div className="text-xl font-bold text-[#7d5c85]">
                    {filterByPhase ? visibleUserStoryCount : userStoryCount}
                    {filterByPhase && userStoryCount !== visibleUserStoryCount && (
                      <span className="text-xs text-[#694969]">/{userStoryCount}</span>
                    )}
                  </div>
                  <div className="text-xs text-[#694969]">User Stories</div>
                </div>
                <div className="text-center p-3 bg-[#f5f0f1] rounded-lg border border-[#ebe5eb]">
                  <div className="text-xl font-bold text-[#7d5c85]">
                    {filterByPhase ? visibleTaskCount : taskCount}
                    {filterByPhase && taskCount !== visibleTaskCount && (
                      <span className="text-xs text-[#694969]">/{taskCount}</span>
                    )}
                  </div>
                  <div className="text-xs text-[#694969]">Tasks</div>
                </div>
                <div className="text-center p-3 bg-[#f5f0f1] rounded-lg border border-[#ebe5eb]">
                  <div className="text-xl font-bold text-[#7d5c85]">
                    {filterByPhase ? visibleBugCount : bugCount}
                    {filterByPhase && bugCount !== visibleBugCount && (
                      <span className="text-xs text-[#694969]">/{bugCount}</span>
                    )}
                  </div>
                  <div className="text-xs text-[#694969]">Bugs</div>
                </div>
              </div>

              {/* Collapse Info */}
              {collapsedCount > 0 && (
                <div className="mb-4 p-2 bg-[#ebe5eb] border border-[#c7a0b8] rounded-lg">
                  <div className="text-xs text-[#694969] flex items-center gap-1">
                    <EyeOff className="w-3 h-3" />
                    {collapsedCount} items collapsed
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowItemSelector(true)}
                  className="w-full px-4 py-2 bg-[#7d5c85] text-white rounded-lg hover:bg-[#694969] transition-colors text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Elements
                </button>
                
                <button
                  onClick={() => setShowPhaseCreator(true)}
                  className="w-full px-4 py-2 bg-[#4a2b4a] text-white rounded-lg hover:bg-[#694969] transition-colors text-sm flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Phase
                </button>
              </div>

              {/* Available counts */}
              <div className="mt-4 pt-3 border-t border-[#c7a0b8]">
                <h4 className="text-xs font-semibold text-[#694969] mb-2 uppercase">Available</h4>
                <div className="text-xs text-[#694969] space-y-1">
                  <div className="flex justify-between">
                    <span>User Stories:</span>
                    <span className="font-medium">{getAvailableItemsByType('user-story').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasks:</span>
                    <span className="font-medium">{getAvailableItemsByType('task').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bugs:</span>
                    <span className="font-medium">{getAvailableItemsByType('bug').length}</span>
                  </div>
                </div>
              </div>

              {/* Phases Section */}
              <div className="mt-4 pt-3 border-t border-[#c7a0b8]">
                <h4 className="text-xs font-semibold text-[#694969] mb-2 uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Phases
                </h4>
                {selectedPhaseId && (
                    <button
                      onClick={handleTogglePhaseFilter}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        filterByPhase 
                          ? 'bg-[#7d5c85] text-white' 
                          : 'bg-[#ebe5eb] text-[#694969] hover:bg-[#c7a0b8]'
                      }`}
                    >
                      {filterByPhase ? <Filter className="w-3 h-3" /> : <FilterX className="w-3 h-3" />}
                    </button>
                  )}
                <div className="space-y-2">
                  {roadmapPhases.map(phase => (
                    <div
                      key={phase.id}
                      className={`flex items-center justify-between p-2 rounded border border-[#ebe5eb] hover:bg-[#f5f0f1] transition-colors cursor-pointer ${
                        selectedPhaseId === phase.id ? 'ring-2 ring-[#7d5c85] bg-[#f5f0f1]' : ''
                      }`}
                      onClick={() => handlePhaseSelection(phase.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: phase.color }}
                        ></div>
                        <span className="text-sm font-medium text-[#4a2b4a]">{phase.name}</span>
                      </div>
                      <span className="text-xs text-[#694969] bg-[#ebe5eb] px-2 py-1 rounded">
                        {phase.items.length}
                      </span>
                    </div>
                  ))}
                </div>
                
                {selectedPhaseId && (
                  <div className="mt-2 p-2 bg-[#7d5c85] text-white rounded-lg">
                    <div className="text-xs font-medium">
                      Selected: {roadmapPhases.find(p => p.id === selectedPhaseId)?.name}
                    </div>
                    <div className="text-xs opacity-90">
                      {filterByPhase ? 'Canvas filtered • ' : ''}New items will be added here
                    </div>
                  </div>
                )}
                
                {roadmapPhases.length === 0 && (
                  <div className="text-center py-4 text-[#694969] text-sm">
                    No phases available
                  </div>
                )}
              </div>

              {/* View Controls */}
              <div className="mt-4 pt-3 border-t border-[#c7a0b8]">
                <h4 className="text-xs font-semibold text-[#694969] mb-2 uppercase flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  View Options
                </h4>
                <div className="space-y-1">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={showMiniMap}
                      onChange={(e) => setShowMiniMap(e.target.checked)}
                      className="mr-2 accent-[#7d5c85]"
                    />
                    Show Mini Map
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      {changes.hasUnsavedChanges && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-[#ebe5eb] border border-[#c7a0b8] text-[#4a2b4a] px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Unsaved Changes</span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1 bg-[#7d5c85] text-white rounded text-xs hover:bg-[#694969] disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-12 z-10">
        <div className="bg-black/30 bg-opacity-80 text-white text-xs px-3 py-2 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MousePointer className="w-3 h-3" />
              <span>Double Click User Story to expand/collapse</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" />
              <span>Drag handles to connect items</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="w-3 h-3" />
              <span>Del to remove connections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div ref={ref} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          onInit={onInit}
          fitView
          fitViewOptions={{
            padding: 0.15,
            includeHiddenNodes: false,
            maxZoom: 1.2,
          }}
          attributionPosition="bottom-right"
          className="bg-transparent"
          deleteKeyCode={['Backspace', 'Delete']}
          snapToGrid={true}
          snapGrid={[20, 20]}
          connectionLineStyle={{ 
            strokeWidth: 3, 
            stroke: '#7d5c85',
            strokeDasharray: '8,8',
          }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2 }
          }}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            color="#c7a0b8" 
            gap={20} 
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls 
            className="bg-white shadow-xl rounded-xl border border-[#c7a0b8] overflow-hidden"
            showInteractive={false}
            showFitView={true}
            showZoom={true}
          />
          {showMiniMap && (
            <MiniMap 
              className="bg-white shadow-xl rounded-xl border border-[#c7a0b8] overflow-hidden"
              nodeColor={getMiniMapNodeColor}
              maskColor="rgba(74, 43, 74, 0.1)"
              pannable
              zoomable
              style={{
                backgroundColor: '#f5f0f1',
              }}
            />
          )}
        </ReactFlow>
      </div>
    </div>
  );
});

CustomRoadmapCanvas.displayName = "CustomRoadmapCanvas";
export default CustomRoadmapCanvas;