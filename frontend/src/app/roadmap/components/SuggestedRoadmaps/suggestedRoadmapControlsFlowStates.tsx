import React from 'react';
import { Loader2, Brain } from 'lucide-react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { SuggestedRoadmapsErrorProps } from './interfaces/suggestedRoadmapsProps';

export function SuggestedRoadmapsLoading() {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-[#694969] mr-2" />
          <Loader2 className="w-8 h-8 text-[#694969] animate-spin" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-black">Generating Roadmap Suggestions</h3>
        <p className="text-gray-600">Analyzing your user stories to create strategic phases...</p>
      </div>
    </div>
  );
}

export function SuggestedRoadmapsError({ error, onClose }: SuggestedRoadmapsErrorProps) {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-red-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <div>
          <div className="text-red-800 font-medium">Error generating suggestions</div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
