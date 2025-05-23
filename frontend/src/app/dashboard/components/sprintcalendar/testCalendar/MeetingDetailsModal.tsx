"use client";

import React from 'react';
import { X, Trash2, Clock, Calendar, MapPin, Users, RefreshCw } from 'lucide-react';
import { Event } from '../types';

interface MeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Event | null;
  onDelete: () => void;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onDelete
}) => {
  if (!isOpen || !meeting) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getRecurrenceText = () => {
    if (!meeting.isRecurring || !meeting.recurrence) return 'Not recurring';
    
    const frequency = meeting.recurrence.frequency;
    const endDate = meeting.recurrence.endDate ? 
      ` until ${formatDate(meeting.recurrence.endDate)}` : 
      ' (no end date)';
    
    return `${frequency.charAt(0).toUpperCase() + frequency.slice(1)}${endDate}`;
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">{meeting.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(meeting.startDate)}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {formatTime(meeting.startDate)} - {formatTime(meeting.endDate)}
            </span>
          </div>

          {meeting.location && (
            <div className="flex items-center text-gray-700">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{meeting.location}</span>
            </div>
          )}

          {meeting.isRecurring && (
            <div className="flex items-center text-gray-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>{getRecurrenceText()}</span>
            </div>
          )}

          {meeting.participants && meeting.participants.length > 0 && (
            <div className="flex items-start text-gray-700">
              <Users className="h-4 w-4 mr-2 mt-1" />
              <div>
                <p className="mb-1">Participants:</p>
                <ul className="list-disc pl-5 text-sm">
                  {meeting.participants.map((participant, index) => (
                    <li key={index}>{participant}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {meeting.description && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{meeting.description}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onDelete}
            className="flex items-center px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Meeting
          </button>
        </div>
      </div>
    </div>
  );
};