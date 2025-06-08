import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PhaseUserStoriesProps } from '../../hooks/interfaces/useSuggestedRoadmapsProps';

export default function PhaseUserStories({ userStories }: PhaseUserStoriesProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-black flex items-center gap-1">
        <ChevronRight className="w-3 h-3 text-[#694969]" />
        User Stories ({userStories.length}):
      </div>
      <div className="space-y-1">
        {userStories.map((story) => (
          <div
            key={story.id}
            className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-100"
            title={story.title}
          >
            {story.title}
          </div>
        ))}
      </div>
    </div>
  );
}
