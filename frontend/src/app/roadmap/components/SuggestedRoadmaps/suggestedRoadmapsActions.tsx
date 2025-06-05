import React from 'react';
import { Plus } from 'lucide-react';
import { SuggestedRoadmapsActionsProps } from './interfaces/suggestedRoadmapsProps';

export default function SuggestedRoadmapsActions({
  selectedCount,
  onClear,
  onUseSelected
}: SuggestedRoadmapsActionsProps) {
  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
      <button
        onClick={onClear}
        className="flex items-center border border-gray-200  gap-2 px-4 py-2 text-[#694969] hover:text-black transition-colors rounded-lg hover:bg-gray-50"
      >
        Clear Suggestions
      </button>
      <button
        onClick={onUseSelected}
        disabled={selectedCount === 0}
        className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border shadow-sm ${
          selectedCount > 0
            ? 'bg-[#694969] text-white hover:bg-black border-black'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
        }`}
      >
        <Plus className="w-4 h-4" />
        Create Dependency Map ({selectedCount} phases)
      </button>
    </div>
  );
}
