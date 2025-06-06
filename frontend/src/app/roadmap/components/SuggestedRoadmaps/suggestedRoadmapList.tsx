import React from 'react';
import { ExtendedSuggestedRoadmapsListProps } from './interfaces/suggestedRoadmapsProps';
import { SuggestedRoadmapsLoading } from './suggestedRoadmapControlsFlowStates';
import { SuggestedRoadmapsError } from './suggestedRoadmapControlsFlowStates';
import SuggestedRoadmapsControls from './suggestedRoadmapControls';
import SuggestedRoadmapsHeader from './suggestedRoadmapsHeader';
import SuggestedPhaseGrid from './suggestedPhaseGrid';
import SuggestedRoadmapsActions from './suggestedRoadmapsActions';
import SuggestedRoadmapsMinimized from './suggestedRoadmapsMinimized';

export default function SuggestedRoadmapsList({
  suggestedRoadmaps,
  onSelectPhases,
  onClose,
  loading,
  error,
  isMinimized = false,
  onMinimize,
  onMaximize
}: ExtendedSuggestedRoadmapsListProps ) {
  const [selectedPhases, setSelectedPhases] = React.useState<Set<number>>(new Set());

  const togglePhase = (index: number) => {
    const newSelected = new Set(selectedPhases);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPhases(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPhases.size === suggestedRoadmaps.length) {
      setSelectedPhases(new Set());
    } else {
      setSelectedPhases(new Set(Array.from({ length: suggestedRoadmaps.length }, (_, i) => i)));
    }
  };

  const handleUseSelected = () => {
    const selected = Array.from(selectedPhases).map(index => {
      return suggestedRoadmaps[index];
    });
    
    const selectedItems = selected.flatMap(phase => {
      return phase.user_stories;
    });

    onSelectPhases(selected, selectedItems);
    setSelectedPhases(new Set());
  };

  const handleClearSuggestions = () => {
    setSelectedPhases(new Set());
    onClose();
  };

  if (loading) {
    return <SuggestedRoadmapsLoading />;
  }

  if (error) {
    return <SuggestedRoadmapsError error={error} onClose={onClose} />;
  }

  if (suggestedRoadmaps.length === 0) {
    return null;
  }

  if (isMinimized) {
    return (
      <SuggestedRoadmapsMinimized
        phasesCount={suggestedRoadmaps.length}
        selectedCount={selectedPhases.size}
        onMaximize={onMaximize}
        onClose={handleClearSuggestions}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#694969] flex flex-col h-full">
      <SuggestedRoadmapsHeader 
        onClose={onMinimize || handleClearSuggestions}
        onMinimize={onMinimize}
        showMinimizeButton={!!onMinimize}
      />

      <div className="px-6 py-4">
        <SuggestedRoadmapsControls
          selectedCount={selectedPhases.size}
          totalCount={suggestedRoadmaps.length}
          onSelectAll={handleSelectAll}
        />
      </div>

      

      <div className="flex-1 px-6 py-4 ">
        <div className="overflow-y-auto min-h-[300px] h-[300px]">
          <SuggestedPhaseGrid
            phases={suggestedRoadmaps}
            selectedPhases={selectedPhases}
            onTogglePhase={togglePhase}
          />
        </div>
      </div>
      
      <div className="px-6 py-6">
        <SuggestedRoadmapsActions
          selectedCount={selectedPhases.size}
          onClear={handleClearSuggestions}
          onUseSelected={handleUseSelected}
        />
      </div>
    </div>
  );
}