'use client';

import { Requirement } from "@/types/requirement";
import React, { useState } from 'react';
import { Dialog,DialogPanel, DialogTitle } from "@headlessui/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (updated: Requirement) => void;
  requirement: Pick<Requirement, 'id' | 'idTitle' | 'title' | 'description' | 'priority'>;
};

const RequirementEditModal = ({ open, onClose, requirement, onSave }: Props) => {
  const [title, setTitle] = useState(requirement.title);
  const [description, setDescription] = useState(requirement.description);
  const [priority, setPriority] = useState<Requirement['priority']>(requirement.priority);

  const handleSave = () => {
    //Aqui se va a incluir la parte del hook de los requerimientos del proyecto 
    const updatedRequirement: Requirement = {
        ...requirement,
        title,
        description,
        priority,
    };

    onSave(updatedRequirement);
    
    onClose();
};

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5f0f1] rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit Requirement</DialogTitle>

          <div className="space-y-2">
            <label htmlFor="titleInput" className="text-sm font-medium text-black">Title</label>
            <input
              id="titleInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter the title"
            />

            <label htmlFor="descriptionInput" className="text-sm font-medium text-black">Description</label>
            <textarea
                id="descriptionInput"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 resize-y min-h-[80px]"
                rows={3}
                placeholder="Write a short description"
            />

            <label  htmlFor="prioritySelect" className="text-sm font-medium text-black">Priority</label>
            <select
              id="prioritySelect"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Requirement['priority'])}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-black"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#4A2B4A] text-white"
            >
              Save
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default RequirementEditModal;
