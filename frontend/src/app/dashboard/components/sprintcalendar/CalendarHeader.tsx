"use client";

import React from 'react';
import { Plus } from 'lucide-react';

interface CalendarHeaderProps {
  currentPeriod: string;
  onPrevious: () => void;
  onNext: () => void;
  onAddEvent: () => void;
  selectedSprint: string;
  onSprintChange: (sprint: string) => void;
  onBack: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentPeriod,
  onPrevious,
  onNext,
  onAddEvent,
  selectedSprint,
  onSprintChange,
  onBack
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Sprint Calendar</h1>
        <p className="text-sm text-gray-600">View and manage sprint tasks by date</p>
        <button
            onClick={onBack}
            className="text-[#4A2B4A] text-sm font-medium hover:underline"
          > {"<- Go back "}
          </button>
      </div>
      <div className="flex items-center gap-2">
        <select 
          value={selectedSprint}
          onChange={(e) => onSprintChange(e.target.value)}
          className="w-[180px] px-3 py-2 border border-gray-300 rounded-md"
        >
          {/* TODO: Replace with dynamic sprint options */}
          <option value="current">Current Sprint</option>
          <option value="previous">Previous Sprint</option>
          <option value="next">Next Sprint</option>
        </select>
        <button
          onClick={onAddEvent}
          className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </button>
      </div>
    </div>
  );
};