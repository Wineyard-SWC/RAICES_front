"use client";

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { RecurringMeeting } from './types';

interface RecurringMeetingsProps {
  meetings: RecurringMeeting[];
  onAddMeeting: () => void;
  onDeleteMeeting: (meetingId: string) => void;
  onViewMeetingDetails: (meetingId: string) => void;
}

export const RecurringMeetings: React.FC<RecurringMeetingsProps> = ({ 
  meetings, 
  onAddMeeting,
  onDeleteMeeting,
  onViewMeetingDetails
}) => {
  const getBadgeColor = (frequency: string) => {
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recurring Meetings</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="flex items-center justify-between">
              <div 
                className="flex-grow cursor-pointer" 
                onClick={() => onViewMeetingDetails(meeting.id)}
              >
                <h4 className="font-medium">{meeting.title}</h4>
                <p className="text-sm text-gray-600">{meeting.schedule}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getBadgeColor(meeting.frequency)}`}>
                  {meeting.frequency}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMeeting(meeting.id);
                  }}
                  className="text-gray-500 hover:text-red-600 p-1"
                  title="Delete meeting"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {meetings.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recurring meetings</p>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onAddMeeting}
          className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring Meeting
        </button>
      </div>
    </div>
  );
};