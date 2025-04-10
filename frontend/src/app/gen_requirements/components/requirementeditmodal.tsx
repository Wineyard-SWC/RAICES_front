'use client';

import { Requirement } from "@/types/requirement";
import React, { useState } from 'react';
import { Dialog,DialogPanel, DialogTitle } from "@headlessui/react";
import { useEffect } from "react";

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
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    const changed = 
      requirement.title !== title ||
      requirement.description !== description ||
      requirement.priority !== priority;
    
    setHasChanges(changed);
  }, [title, description, priority, requirement]);
  
  const handleTryClose = () => {
    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };
  
  const handleConfirmClose = () => {
    setShowConfirmation(false);
    onClose();
  };
  
  const handleCancelClose = () => {
    setShowConfirmation(false);
  };
  
  const validateForm = () => {
    const newErrors: {title?: string; description?: string} = {};
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = "Title cannot be empty";
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = "Description cannot be empty";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;

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
    <Dialog open={open} onClose={handleTryClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit Requirement</DialogTitle>

          <div className="space-y-1">
            <label htmlFor="titleInput" className="text-sm font-medium text-black">Title</label>
            <input
              id="titleInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full border p-2 rounded-md bg-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter the title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="descriptionInput" className="text-sm font-medium text-black">Description</label>
            <textarea
                id="descriptionInput"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full border p-2 rounded-md resize-none min-h-[150px] bg-white ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                placeholder="Write a short description"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="prioritySelect" className="text-sm font-medium text-black">Priority</label>
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
              onClick={handleTryClose}
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

     {/* Diálogo de confirmación para cambios sin guardar */}
     {showConfirmation && (
        <Dialog open={showConfirmation} onClose={handleCancelClose} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
              <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Unsaved Changes</DialogTitle>
              <p className="my-4">You have unsaved changes. Are you sure you want to close without saving?</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={handleCancelClose} 
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Keep Editing
                </button>
                <button 
                  onClick={handleConfirmClose} 
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Discard Changes
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
};

export default RequirementEditModal;
