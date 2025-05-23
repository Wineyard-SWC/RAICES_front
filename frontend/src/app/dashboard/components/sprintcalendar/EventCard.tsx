// EventCard.tsx
"use client";

import React from 'react';
import { Clock, Calendar, Users, Flag, Repeat, X, Check, AlertTriangle } from 'lucide-react';
import { Event, EventPriority } from './CalendarContext';

interface EventCardProps {
  event: Event;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const priorityIcons = {
  high: <AlertTriangle className="h-4 w-4 text-red-500" />,
  medium: <Flag className="h-4 w-4 text-yellow-500" />,
  low: <Flag className="h-4 w-4 text-green-500" />,
};

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete, onComplete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`border rounded-lg p-4 mb-3 ${event.type === 'meeting' ? 'bg-purple-50 border-purple-200' : event.type === 'task' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{event.title}</h3>
          <p className="text-gray-600 text-sm">{event.description}</p>
        </div>
        <div className="flex space-x-2">
          {onComplete && (
            <button onClick={() => onComplete(event.id)} className="text-green-600 hover:text-green-800">
              <Check className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(event.id)} className="text-red-600 hover:text-red-800">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(event.start_date)}
        </div>
        {!event.is_all_day && (
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(event.start_date)} - {formatTime(event.end_date)}
          </div>
        )}
        {event.participants.length > 0 && (
          <div className="flex items-center text-gray-700">
            <Users className="h-4 w-4 mr-2" />
            {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-center text-gray-700">
          {priorityIcons[event.priority]}
          <span className="ml-2 capitalize">{event.priority}</span>
        </div>
        {event.is_recurring && (
          <div className="flex items-center text-gray-700 col-span-2">
            <Repeat className="h-4 w-4 mr-2" />
            Recurring {event.recurrence?.frequency}
            {event.recurrence?.end_date && ` until ${formatDate(event.recurrence.end_date)}`}
          </div>
        )}
      </div>
    </div>
  );
};