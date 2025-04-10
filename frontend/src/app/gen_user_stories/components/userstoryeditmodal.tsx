'use client';

import { UserStory } from "@/types/userstory";
import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (updated: UserStory) => void;
  userStory: UserStory;
  availableEpics: string[]; 
};

const UserStoryEditModal = ({ open, onClose, userStory, onSave, availableEpics }: Props) => {
  const [title, setTitle] = useState(userStory.title);
  const [description, setDescription] = useState(userStory.description);
  const [priority, setPriority] = useState<UserStory['priority']>(userStory.priority);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(userStory.acceptanceCriteria);
  const [epicId, setEpicId] = useState(userStory.epicId);

  const updateCriterion = (index: number, value: string) => {
    const updated = [...acceptanceCriteria];
    updated[index] = value;
    setAcceptanceCriteria(updated);
  };

  const handleSave = () => {
    onSave({
      ...userStory,
      title,
      description,
      priority,
      acceptanceCriteria,
      epicId,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5f0f1] rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit User Story</DialogTitle>

          <label className="text-sm font-medium text-black">Title</label>
          <input className="w-full border p-2 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Edit title" />

          <label className="text-sm font-medium text-black">Description</label>
          <textarea 
            className="w-full border p-2 rounded-md resize-y min-h-[80px]" 
            value={description} onChange={(e) => setDescription(e.target.value)} 
            aria-label="Edit description" />

          <label className="text-sm font-medium text-black">Priority</label>
          <select 
            className="w-full border p-2 rounded-md" 
            value={priority} onChange={(e) => setPriority(e.target.value as UserStory['priority'])}
            aria-label="Edit priority" >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <label className="text-sm font-medium text-black">Epic</label>
          <select 
            className="w-full border p-2 rounded-md" 
            value={epicId} onChange={(e) => setEpicId(e.target.value)}
            aria-label="Edit epic relationship"
            >
            {availableEpics.map((epic) => (
              <option key={epic} value={epic}>{epic}</option>
            ))}
          </select>

          <label className="text-sm font-medium text-black">Acceptance Criteria</label>
          <ul className="space-y-2">
            {acceptanceCriteria.map((criterion, i) => (
              <li key={i}>
                <input
                  className="w-full border p-2 rounded-md"
                  value={criterion}
                  onChange={(e) => updateCriterion(i, e.target.value)}
                  aria-label="Edit acceptance criterias"
                />
              </li>
            ))}
          </ul>

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md">Save</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default UserStoryEditModal;
