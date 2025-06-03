import React from 'react';
import { FileText, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { SuggestedPhaseCardProps } from './interfaces/suggestedRoadmapsProps';
import PhaseUserStories from './suggestedPhaseUserStories';

export default function SuggestedPhaseCard({
  phase,
  index,
  isSelected,
  onToggle
}: SuggestedPhaseCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      className={`border rounded-lg transition-all ${
        isSelected
          ? 'border-[#694969] bg-[#f8f6f8] shadow-md'
          : 'border-gray-200 hover:border-[#694969] hover:shadow-sm'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <input
            aria-label="selected"
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="mt-1 h-5 w-5 text-[#694969] rounded border-gray-300 accent-[#694969] focus:ring-[#694969]"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-[#694969] flex-shrink-0" />
              <h4 className="text-base font-semibold text-black cursor-pointer" onClick={onToggle}>
                {phase.name}
              </h4>
              <span className="bg-gray-100 text-[#694969] text-xs px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                <Users className="w-3 h-3" />
                {phase.user_stories.length}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">
              {phase.description}
            </p>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-[#694969] hover:text-black transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Hide user stories
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show user stories
                </>
              )}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pl-8">
            <PhaseUserStories userStories={phase.user_stories} />
          </div>
        )}
      </div>
    </div>
  );
}