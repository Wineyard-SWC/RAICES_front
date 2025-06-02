import { useState } from 'react';
import { SuggestedPhase } from './interfaces/useSuggestedRoadmapsProps';

export function useSuggestedRoadmapsList() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const showSuggestedRoadmaps = () => {
    setShowSuggestions(true);
    setIsMinimized(false);
  };

  const hideSuggestedRoadmaps = () => {
    setShowSuggestions(false);
    setIsMinimized(false);
  };

  const minimizeSuggestions = () => {
    setIsMinimized(true);
  };

  const maximizeSuggestions = () => {
    setIsMinimized(false);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  const handlePhaseSelection = (
    selectedPhases: SuggestedPhase[],
    onCreateRoadmap: (phases: SuggestedPhase[]) => void
  ) => {
    onCreateRoadmap(selectedPhases);
    hideSuggestedRoadmaps();
  };

  return {
    showSuggestions,
    isMinimized,
    showSuggestedRoadmaps,
    hideSuggestedRoadmaps,
    minimizeSuggestions,
    maximizeSuggestions,
    toggleMinimized,
    handlePhaseSelection
  };
}