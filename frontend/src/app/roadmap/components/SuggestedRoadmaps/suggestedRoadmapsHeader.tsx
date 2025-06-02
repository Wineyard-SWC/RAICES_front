import React from 'react';
import { X, Sparkles, Minus } from 'lucide-react';
import { SuggestedRoadmapsHeaderProps } from './interfaces/suggestedRoadmapsProps';


export default function SuggestedRoadmapsHeader({ 
  onClose, 
  onMinimize,
  showMinimizeButton = false 
}: SuggestedRoadmapsHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#694969]" />
          <div>
            <h3 className="text-lg font-bold text-black">AI-Generated Roadmap Suggestions</h3>
            <p className="text-gray-600 text-sm mt-1">
              Select the phases you want to include in your roadmap
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {showMinimizeButton && onMinimize && (
            <button
              onClick={onMinimize}
              className="text-[#694969] hover:text-black p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Minimize suggestions"
            >
              <Minus className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#694969] hover:text-black p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title="Clear suggestions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}