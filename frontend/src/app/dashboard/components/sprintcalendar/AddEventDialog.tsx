"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SprintItem } from './types';

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  sprintItems: SprintItem[];
}

export const AddEventDialog: React.FC<AddEventDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sprintItems
}) => {
  const [formData, setFormData] = useState({
    eventType: 'meeting',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    recurring: false,
    frequency: 'daily',
    days: 'weekdays',
    endDate: '',
    description: '',
    participants: '',
    relatedItems: [] as string[]
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };



  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Add New Event</h2>
            <p className="text-gray-600">Create a new event in your sprint calendar. Fill out the details below.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Event Type</label>
            <div className="flex gap-6">
              {['meeting', 'task-review', 'other'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="eventType"
                    value={type}
                    checked={formData.eventType === type}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                  />
                  <span className="text-sm font-medium capitalize">{type.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Time</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Start</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">End</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-900">This is a recurring event</span>
              </label>
            </div>

            {/* Recurring Options */}
            {formData.recurring && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-100">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Frequency</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <select
                      value={formData.days}
                      onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="weekdays">Weekdays only</option>
                      <option value="all">All days</option>
                      <option value="custom">Custom days</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Select an end date"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Add notes or description for this event"
              rows={3}
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Participants</label>
            <select
              value={formData.participants}
              onChange={(e) => setFormData(prev => ({ ...prev, participants: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select participants</option>
              <option value="all">All team members</option>
              <option value="dev">Development team</option>
              <option value="design">Design team</option>
              <option value="custom">Custom selection</option>
            </select>
          </div>



          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};