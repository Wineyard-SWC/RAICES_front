import React from 'react';
import { SuggestedPhase } from '../../hooks/interfaces/useSuggestedRoadmapsProps';
import { SuggestedPhaseGridProps } from './interfaces/suggestedRoadmapsProps';
import SuggestedPhaseCard from './suggestedPhaseCard';


export default function SuggestedPhaseGrid({
  phases,
  selectedPhases,
  onTogglePhase
}: SuggestedPhaseGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {phases.map((phase, index) => (
        <SuggestedPhaseCard
          key={index}
          phase={phase}
          index={index}
          isSelected={selectedPhases.has(index)}
          onToggle={() => onTogglePhase(index)}
        />
      ))}
    </div>
  );
}