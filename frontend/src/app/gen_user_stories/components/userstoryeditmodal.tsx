'use client';

import { UserStory } from "@/types/userstory";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (updated: UserStory) => void;
  userStory: UserStory;
  availableEpics: string[]; 
  onDelete: (id: string) => void;
};

const UserStoryEditModal = ({ open, onClose, userStory, onSave, availableEpics, onDelete }: Props) => {
  const [title, setTitle] = useState(userStory.title);
  const [description, setDescription] = useState(userStory.description);
  const [priority, setPriority] = useState<UserStory['priority']>(userStory.priority);
  const [acceptance_criteria, setAcceptanceCriteria] = useState(userStory.acceptance_criteria);
  const [assigned_epic, setEpicId] = useState(userStory.assigned_epic);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    const originalValues = {
      title: userStory.title,
      description: userStory.description,
      priority: userStory.priority,
      acceptance_criteria: userStory.acceptance_criteria,
      assigned_epic: userStory.assigned_epic
    };

    const currentValues = {
      title,
      description,
      priority,
      acceptance_criteria,
      assigned_epic
    };
    
    const changed = 
      originalValues.title !== currentValues.title ||
      originalValues.description !== currentValues.description ||
      originalValues.priority !== currentValues.priority ||
      JSON.stringify(originalValues.acceptance_criteria) !== JSON.stringify(currentValues.acceptance_criteria) ||
      originalValues.assigned_epic !== currentValues.assigned_epic;
    
    setHasChanges(changed);
  }, [title, description, priority, acceptance_criteria, assigned_epic, userStory]);

  const addCriterion = () => {
    setAcceptanceCriteria([...acceptance_criteria, '']);
  };
  
  const removeCriterion = (index: number) => {
    const updated = [...acceptance_criteria];
    updated.splice(index, 1);
    setAcceptanceCriteria(updated);
  };

  const updateCriterion = (index: number, value: string) => {
    const updated = [...acceptance_criteria];
    updated[index] = value;
    setAcceptanceCriteria(updated);
  };

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
    
    const hasEmptyCriteria = acceptance_criteria.some(c => !c.trim());
    if (hasEmptyCriteria) {
      alert("Please complete or remove empty acceptance criteria");
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    onSave({
      ...userStory,
      title,
      description,
      priority,
      acceptance_criteria: acceptance_criteria.filter(c => c.trim() !== ''),
      assigned_epic,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleTryClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit User Story</DialogTitle>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Title</label>
            <input 
              className={`w-full border p-2 rounded-md bg-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              aria-label="Edit title" 
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Description</label>
            <textarea
              className={`w-full border p-2 rounded-md resize-none min-h-[150px] bg-white ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Edit description" 
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Priority</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md bg-white"
              value={priority} 
              onChange={(e) => setPriority(e.target.value as UserStory['priority'])}
              aria-label="Edit priority" 
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Epic</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md bg-white"
              value={assigned_epic} 
              onChange={(e) => setEpicId(e.target.value)}
              aria-label="Edit epic relationship"
            >
              {availableEpics.map((epic) => (
                <option key={epic} value={epic}>{epic}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Acceptance Criteria</label>
            <div className="space-y-2">
              {acceptance_criteria.map((criterion, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className="flex-1 border border-gray-300 p-2 rounded-md bg-white"
                    value={criterion}
                    onChange={(e) => updateCriterion(i, e.target.value)}
                    aria-label="Edit acceptance criteria"
                  />
                  <button 
                    onClick={() => removeCriterion(i)}
                    className="text-red-500 p-1 hover:bg-red-50 rounded-md"
                    aria-label="Remove criterion"
                  >
                    ✕
                  </button>
                </div>
              ))}
               <div className="flex justify-center">  
                <button
                  onClick={addCriterion}
                  className="text-sm text-[#4A2B4A] underline mt-1"
                >
                  + Add another criterion
                </button>
               </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this user story?")) {
                  onDelete(userStory.id);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleTryClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
      
      {/* Diálogo de confirmación */}
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

export default UserStoryEditModal;
