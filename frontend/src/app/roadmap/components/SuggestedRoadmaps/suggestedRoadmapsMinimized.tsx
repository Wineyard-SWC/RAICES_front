import React from 'react';
import { ChevronUp, X, Sparkles } from 'lucide-react';
import { SuggestedRoadmapsMinimizedProps } from './interfaces/suggestedRoadmapsProps';

export default function SuggestedRoadmapsMinimized({
  phasesCount,
  selectedCount,
  onMaximize,
  onClose
}: SuggestedRoadmapsMinimizedProps) {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#694969]" />
            <div>
              <h4 className="text-sm font-semibold text-black">
                AI Roadmap Suggestions ({phasesCount} phases)
              </h4>
              <p className="text-xs text-gray-600">
                {selectedCount > 0 ? `${selectedCount} phases selected` : 'Click to expand and select phases'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <span className="bg-[#694969] text-white text-xs px-2 py-1 rounded-full">
                {selectedCount}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize?.();
              }}
              className="text-[#694969] hover:text-black p-1 rounded-lg hover:bg-gray-200 transition-colors"
              title="Expand suggestions"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-[#694969] hover:text-black p-1 rounded-lg hover:bg-gray-200 transition-colors"
              title="Clear suggestions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
