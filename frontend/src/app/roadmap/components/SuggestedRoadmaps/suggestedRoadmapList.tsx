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
    const selected = Array.from(selectedPhases).map(index => suggestedRoadmaps[index]);
    onSelectPhases(selected);
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
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
      <SuggestedRoadmapsHeader 
        onClose={onMinimize || handleClearSuggestions}
        onMinimize={onMinimize}
        showMinimizeButton={!!onMinimize}
      />
      
      <div className="p-6">
        <SuggestedRoadmapsControls
          selectedCount={selectedPhases.size}
          totalCount={suggestedRoadmaps.length}
          onSelectAll={handleSelectAll}
        />
        
        <SuggestedPhaseGrid
          phases={suggestedRoadmaps}
          selectedPhases={selectedPhases}
          onTogglePhase={togglePhase}
        />
        
        <SuggestedRoadmapsActions
          selectedCount={selectedPhases.size}
          onClear={handleClearSuggestions}
          onUseSelected={handleUseSelected}
        />
      </div>
    </div>
  );
}