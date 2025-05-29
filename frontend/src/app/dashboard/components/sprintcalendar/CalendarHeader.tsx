// CalendarHeader.tsx
"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Sprint } from './types';

interface CalendarHeaderProps {
  currentPeriod: string;
  onPrevious: () => void;
  onNext: () => void;
  onAddEvent: () => void;
  selectedSprint: string;
  onSprintChange: (sprint: string) => void;
  onBack: () => void;
  sprints: Sprint[];
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentPeriod,
  onPrevious,
  onNext,
  onAddEvent,
  selectedSprint,
  onSprintChange,
  onBack,
  sprints
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-gray-600">View and manage tasks by date</p>
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
          {sprints.map(sprint => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
        <button
          onClick={onAddEvent}
          className="inline-flex items-center px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-gray-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </button>
      </div>
    </div>
  );
};