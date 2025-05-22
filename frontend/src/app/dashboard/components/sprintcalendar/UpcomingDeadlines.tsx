"use client";

import React from 'react';
import { Deadline } from './types';

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines }) => {
  const getBadgeColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'bg-red-100 text-red-800';
    if (daysLeft <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {/* TODO: Replace with dynamic deadlines data */}
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{deadline.title}</h4>
                <p className="text-sm text-gray-600">{deadline.date}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(deadline.daysLeft)}`}>
                {deadline.daysLeft} day{deadline.daysLeft !== 1 ? 's' : ''} left
              </span>
            </div>
          ))}
          {deadlines.length === 0 && (
            <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
          )}
        </div>
      </div>
    </div>
  );
};