"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarTabsProps {
  activeTab: 'week' | 'month';
  onTabChange: (tab: 'week' | 'month') => void;
  currentPeriod: string;
  onPrevious: () => void;
  onNext: () => void;
}

export const CalendarTabs: React.FC<CalendarTabsProps> = ({
  activeTab,
  onTabChange,
  currentPeriod,
  onPrevious,
  onNext
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sprint Timeline</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">{currentPeriod}</span>
            <button
              onClick={onNext}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 w-fit">
          {(['week', 'month'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};