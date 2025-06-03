import React, { useState, useMemo } from 'react';
import { RoadmapItem, getItemType, getItemTitle, getItemId } from '@/types/roadmap';
import { Bug } from '@/types/bug';
import { Task } from '@/types/task';
import { UserStory } from '@/types/userstory';
import { BookOpen, CheckSquare, Bug as BugIcon, Search, X, Plus, Users, FolderOpen,Target } from 'lucide-react';
import { getItemIcon } from '../styles/items';
import AvailableItemsList from '../subcomponents/roadmapavailableitems';
import CurrentRoadmapItemsList from '../subcomponents/roadmapcurrentitemslist';
import RoadmapTreePreview from './RoadmapTreePreview';
import { RoadmapPhase } from '@/types/roadmap';


interface RoadmapItemSelectorProps {
  availableItems: RoadmapItem[];
  roadmapItems: RoadmapItem[];
  phases: RoadmapPhase[];
  onAddItem: (item: RoadmapItem, phaseId?: string) => void;
  onRemoveItem: (itemId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedPhaseId: string;
}

const RoadmapItemSelector: React.FC<RoadmapItemSelectorProps> = ({
  availableItems,
  roadmapItems,
  phases,
  onAddItem,
  onRemoveItem,
  isOpen,
  onClose,
  selectedPhaseId
  
}) => {
  const [selectedTab, setSelectedTab] = useState<'user-story' | 'task' | 'bug'>('user-story');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [addRelatedItems, setAddRelatedItems] = useState(true);
  const [previewItem,setPreviewItem] = useState<RoadmapItem | null>(null)
  const [filterBySelectedPhase, setFilterBySelectedPhase] = useState(true);

  const roadmapItemIds = useMemo(() => 
    new Set(roadmapItems.map(item => getItemId(item))), 
    [roadmapItems]
  );

  const availableByType = useMemo(() => {
    return availableItems.filter(item => 
    getItemType(item) === selectedTab && 
      !roadmapItemIds.has(getItemId(item)) &&
      (searchTerm === '' || 
      getItemTitle(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getItemId(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('description' in item && item.description?.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [availableItems, selectedTab, roadmapItemIds, searchTerm]);

 const currentRoadmapItems = useMemo(() => {
    const allItems = roadmapItems.filter(item => getItemType(item) === selectedTab);
    
    if ((selectedPhase || selectedPhaseId) && filterBySelectedPhase) {
      const targetPhaseId = selectedPhase || selectedPhaseId;
      const targetPhase = phases.find(p => p.id === targetPhaseId);
      
      if (targetPhase) {
        return allItems.filter(item => targetPhase.items.includes(getItemId(item)));
      }
    }
    
    return allItems;
  }, [roadmapItems, selectedTab, selectedPhase, selectedPhaseId, phases, filterBySelectedPhase]);


  const getRelatedItemsCount = (item: RoadmapItem): number => {
    const itemType = getItemType(item);
    const itemId = getItemId(item);
    let count = 0;

    if (itemType === 'user-story') {
      const userStory = item as UserStory;
      // Count related tasks
      if (userStory.task_list) {
        count += userStory.task_list.filter(taskId => 
          availableItems.some(availableItem => 
            getItemId(availableItem) === taskId && 
            getItemType(availableItem) === 'task' &&
            !roadmapItemIds.has(taskId)
          )
        ).length;
      }
      // Count related bugs
      count += availableItems.filter(availableItem => 
        getItemType(availableItem) === 'bug' && 
        (availableItem as Bug).userStoryRelated === itemId &&
        !roadmapItemIds.has(getItemId(availableItem))
      ).length;
    }

    if (itemType === 'task') {
      const task = item as Task;
      // Count parent user story
      if (task.user_story_id && 
        availableItems.some(availableItem => 
          getItemId(availableItem) === task.user_story_id && 
          !roadmapItemIds.has(task.user_story_id!))) {
          count += 1;
      }
        // Count related bugs
      count += availableItems.filter(availableItem => 
        getItemType(availableItem) === 'bug' && 
        (availableItem as Bug).taskRelated === itemId &&
        !roadmapItemIds.has(getItemId(availableItem))
        ).length;
    }

    if (itemType === 'bug') {
      const bug = item as Bug;

      if (bug.userStoryRelated && 
        availableItems.some(availableItem => 
          getItemId(availableItem) === bug.userStoryRelated && 
          !roadmapItemIds.has(bug.userStoryRelated!))) {
            count += 1;
          }

      if (bug.taskRelated && 
        availableItems.some(availableItem => 
          getItemId(availableItem) === bug.taskRelated && 
          !roadmapItemIds.has(bug.taskRelated!))) {
          count += 1;
        }
      }

      return count;
  };


  const handleAddItem = (item: RoadmapItem) => {
    const targetPhase = selectedPhase || selectedPhaseId || undefined;
    onAddItem(item, targetPhase);
  };

  const handleShowPreview = (item: RoadmapItem) => {
    setPreviewItem(item);
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 rounded-xl bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
        <div className={`bg-white rounded-xl shadow-2xl w-full h-[90vh] max-h-[90vh] flex flex-col mx-4 transition-all duration-300 ${
          previewItem ? 'max-w-7xl' : 'max-w-7xl'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[#f5f0f1] to-[#ebe5eb]">
          <div>
          <h2 className="text-2xl font-bold text-[#4a2b4a]">Customize Roadmap</h2>
          <p className="text-[#694969]">Select elements to include in your roadmap</p>
          </div>
          <button 
          aria-label='exit'
          onClick={onClose}
          className="text-[#694969] hover:text-[#4a2b4a] text-2xl font-bold p-2 hover:bg-[#ebe5eb] rounded-lg transition-colors"
          >
          <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b bg-[#f5f0f1]">
          <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Tabs */}
          <div className="flex bg-white rounded-xl p-1 border shadow-sm">
            {['user-story', 'task', 'bug'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTab(type as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedTab === type
                ? 'bg-[#7d5c85] text-white shadow-md'
                : 'text-[#694969] hover:bg-[#ebe5eb]'
              }`}
            >
              {getItemIcon(type)}
              <span className="capitalize">{type.replace('-', ' ')}</span>
            </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#694969] w-4 h-4" />
            <input
            type="text"
            placeholder="Search elements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 border border-[#c7a0b8] rounded-lg focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent shadow-sm"
            />
          </div>

          {/* Phase selector */}
          <select
            aria-label="phase"
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="px-4 py-2 bg-white border border-[#c7a0b8] rounded-lg focus:ring-2 focus:ring-[#7d5c85] shadow-sm"
          >
            <option value="">Select phase (optional)</option>
            {phases.map(phase => (
            <option key={phase.id} value={phase.id}>
              {phase.name}
            </option>
            ))}
          </select>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-[#694969]">
            <span>Available: <strong className="text-[#7d5c85]">{availableByType.length}</strong></span>
            <span>In roadmap: <strong className="text-[#4a2b4a]">{currentRoadmapItems.length}</strong></span>
            <span>Total: <strong className="text-[#694969]">{roadmapItems.length}</strong></span>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
            type="checkbox"
            checked={addRelatedItems}
            onChange={(e) => setAddRelatedItems(e.target.checked)}
            className="rounded border-[#c7a0b8] text-[#7d5c85] focus:ring-[#7d5c85]"
            />
            <span className="text-[#694969]">Auto-add related items</span>
          </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Available Items */}
          <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>{getItemIcon(selectedTab)}</span>
            Available {selectedTab.replace('-', ' ')}s ({availableByType.length})
          </h3>
          
          {availableByType.length === 0 ? (
            <div className="text-center py-12 text-[#694969]">
            <div className="text-4xl mb-4">
              <Target className="w-16 h-16 mx-auto text-[#c7a0b8]" />
            </div>
            <p className="text-lg font-medium">No available elements</p>
            <p className="text-sm">All {selectedTab.replace('-', ' ')}s are already in the roadmap</p>
            </div>
          ) : (
            <AvailableItemsList
            items={availableByType}
            addRelatedItems={addRelatedItems}
            getRelatedItemsCount={getRelatedItemsCount}
            onAddItem={handleAddItem}
            selectedTab={selectedTab}
            onShowPreview={handleShowPreview}
            />
          )}
          </div>

          {/* Current Roadmap Items */}
          <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#7d5c85]" />
            In Roadmap ({currentRoadmapItems.length})
          </h3>
          
          {currentRoadmapItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
            <div className="flex justify-center mb-2">
              <FolderOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p>No {selectedTab.replace('-', ' ')}s in roadmap</p>
            </div>
          ) : (
            <CurrentRoadmapItemsList
            items={currentRoadmapItems}
            onRemoveItem={onRemoveItem}
            />
          )}
          </div>
        </div>

  

        {/* Footer */}
        {!previewItem && (
          <div className="p-6 border-t bg-[#f5f0f1] flex justify-between items-center">
            <div className="text-sm text-[#694969] flex items-center gap-2">
              {!addRelatedItems && (
                <>
                  <BookOpen className="w-4 h-4 text-[#7d5c85]" />
                  <p>
                    <strong>Tip:</strong> Enable <em>"Auto-add related items"</em> to automatically include connected elements.
                  </p>
                </>
              )}            
              </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[#694969] rounded-lg border border-gray-300 shadow shadow-mb hover:text-[#4a2b4a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#7d5c85] text-white rounded-lg hover:bg-[#694969] transition-colors font-medium"
              >
                Done
              </button>
            </div>
        </div>
        )}
        
        
        {/* Panel lateral de Preview */}
          {previewItem && getItemType(previewItem) === 'user-story' && (
            <div className="border-l bg-white flex flex-col">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#f5f0f1] to-[#ebe5eb]">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#4a2b4a] truncate">Structure Preview</h3>
                  <p className="text-[#694969] text-sm truncate">
                    {getItemTitle(previewItem)}
                  </p>
                </div>
                <button
                  onClick={handleClosePreview}
                  className="text-[#694969] hover:text-[#4a2b4a] p-1 hover:bg-[#ebe5eb] rounded-lg transition-colors ml-2 flex-shrink-0"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[50vh] h-[50vh]">
                <div className="flex justify-center">
                  <RoadmapTreePreview userStory={previewItem as UserStory} allAvailableItems={availableItems} />
                </div>
              </div>

              {/* Preview Footer */}
              <div className="p-6 border-t bg-[#f5f0f1] flex justify-between items-center">
                <div className="text-sm text-[#694969] flex items-center gap-2">
                  This preview shows the hierarchical structure of the user story with its related tasks and bugs.
                </div>

                {/* Flex container alineado a la derecha */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleClosePreview}
                    className="px-4 py-2 text-[#694969] rounded-lg border border-gray-300 shadow shadow-mb hover:text-[#4a2b4a] transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleAddItem(previewItem);
                      handleClosePreview();
                    }}
                    className="px-4 py-2 bg-[#7d5c85] text-white rounded-lg hover:bg-[#694969] transition-colors font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default RoadmapItemSelector;