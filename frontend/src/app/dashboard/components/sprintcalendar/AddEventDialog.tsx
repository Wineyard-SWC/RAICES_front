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

  const toggleRelatedItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      relatedItems: prev.relatedItems.includes(id)
        ? prev.relatedItems.filter(item => item !== id)
        : [...prev.relatedItems, id]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Event Type</label>
            <div className="col-span-3 flex gap-4">
              {['meeting', 'task-review', 'other'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="eventType"
                    value={type}
                    checked={formData.eventType === type}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <span className="capitalize">{type.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Date</label>
            <div className="col-span-3 relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Time</label>
            <div className="col-span-3 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Start</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">End</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right"></div>
            <div className="col-span-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>This is a recurring event</span>
              </label>
            </div>
          </div>

          {/* Recurring Options */}
          {formData.recurring && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Frequency</label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <select
                    value={formData.days}
                    onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="weekdays">Weekdays only</option>
                    <option value="all">All days</option>
                    <option value="custom">Custom days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-right font-medium pt-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Add notes or description for this event"
              rows={3}
            />
          </div>

          {/* Participants */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right font-medium">Participants</label>
            <select
              value={formData.participants}
              onChange={(e) => setFormData(prev => ({ ...prev, participants: e.target.value }))}
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select participants</option>
              <option value="all">All team members</option>
              <option value="dev">Development team</option>
              <option value="design">Design team</option>
              <option value="custom">Custom selection</option>
            </select>
          </div>

          {/* Related Items */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-right font-medium pt-2">Related Items</label>
            <div className="col-span-3">
              <div className="border border-gray-300 rounded-md p-3 max-h-[200px] overflow-y-auto">
                {/* User Stories */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium mb-2">User Stories</h4>
                  {/* TODO: Replace with dynamic sprintItems */}
                  {sprintItems.filter(item => item.type === 'user-story').map((item) => (
                    <label key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.relatedItems.includes(item.id)}
                        onChange={() => toggleRelatedItem(item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </label>
                  ))}
                </div>

                {/* Tasks */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium mb-2">Tasks</h4>
                  {sprintItems.filter(item => item.type === 'task').map((item) => (
                    <label key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.relatedItems.includes(item.id)}
                        onChange={() => toggleRelatedItem(item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </label>
                  ))}
                </div>

                {/* Bugs */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium mb-2">Bugs</h4>
                  {sprintItems.filter(item => item.type === 'bug').map((item) => (
                    <label key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.relatedItems.includes(item.id)}
                        onChange={() => toggleRelatedItem(item.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};