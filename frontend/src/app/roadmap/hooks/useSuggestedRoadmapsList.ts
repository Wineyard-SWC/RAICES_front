import { useState } from 'react';

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



  return {
    showSuggestions,
    isMinimized,
    showSuggestedRoadmaps,
    hideSuggestedRoadmaps,
    minimizeSuggestions,
    maximizeSuggestions,
    toggleMinimized,
  };
}