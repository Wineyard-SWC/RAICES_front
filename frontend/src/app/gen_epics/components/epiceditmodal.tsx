'use client';

import { Epic } from '@/types/epic';
import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

type Props = {
  open: boolean;
  onClose: () => void;
  epic: Pick<Epic, 'id' | 'idTitle' | 'title' | 'description' | 'relatedRequirements'>;
  onSave: (updated: Epic) => void;
};

const EpicEditModal = ({ open, onClose, epic, onSave }: Props) => {
  const [title, setTitle] = useState(epic.title);
  const [description, setDescription] = useState(epic.description);
  const [relatedRequirements, setRelatedRequirements] = useState(epic.relatedRequirements);

  const handleRequirementChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...relatedRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setRelatedRequirements(updated);
  };

  const handleAddRequirement = () => {
    setRelatedRequirements([...relatedRequirements, { idTitle: '', title: '', description: ''}]);
  };

  const handleSave = () => {
    onSave({
      id: epic.id,
      idTitle: epic.idTitle,
      title,
      description,
      relatedRequirements,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit Epic</DialogTitle>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Title</label>
            <input
              className="w-full border border-gray-300 rounded-md p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Epic title"
            />

            <label className="text-sm font-medium text-black">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 resize-y min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the epic"
            />

            <label className="text-sm font-medium text-black">Related Requirements</label>
            <div className="space-y-2">
              {relatedRequirements.map((req, index) => (
                <div key={index} className="space-y-1 border rounded-md p-2 bg-white">
                  <input
                    className="w-full border border-gray-300 rounded-md p-1 text-sm"
                    value={req.title}
                    onChange={(e) => handleRequirementChange(index, 'title', e.target.value)}
                    placeholder="Requirement title"
                  />
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-1 text-sm resize-y min-h-[60px]"
                    value={req.description}
                    onChange={(e) => handleRequirementChange(index, 'description', e.target.value)}
                    placeholder="Requirement description"
                  />
                </div>
              ))}
              <button
                className="text-sm text-[#4A2B4A] underline mt-1"
                onClick={handleAddRequirement}
              >
                + Add another requirement
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
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

export default EpicEditModal;
