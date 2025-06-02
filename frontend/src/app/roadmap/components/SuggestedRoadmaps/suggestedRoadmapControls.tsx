import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { SuggestedRoadmapsControlsProps } from './interfaces/suggestedRoadmapsProps';

export default function SuggestedRoadmapsControls({
  selectedCount,
  totalCount,
  onSelectAll
}: SuggestedRoadmapsControlsProps) {
  const isAllSelected = selectedCount === totalCount;

  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
      <div className="text-sm text-gray-600">
        <span className="font-medium text-black">{selectedCount}</span> of <span className="font-medium text-black">{totalCount}</span> phases selected
      </div>
      <button
        onClick={onSelectAll}
        className="flex items-center gap-2 text-sm text-[#694969] hover:text-black font-medium transition-colors px-3 py-1 rounded-lg hover:bg-gray-50"
      >
        {isAllSelected ? (
          <CheckSquare className="w-4 h-4" />
        ) : (
          <Square className="w-4 h-4" />
        )}
        {isAllSelected ? 'Deselect All' : 'Select All'}
      </button>
    </div>
  );
}