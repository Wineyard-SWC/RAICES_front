'use client';

import { Epic } from '@/types/epic';
import React, { useState , useEffect } from 'react';
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
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    relatedRequirements?: string[];
  }>({});

  useEffect(() => {
    const changed = 
      epic.title !== title ||
      epic.description !== description ||
      JSON.stringify(epic.relatedRequirements) !== JSON.stringify(relatedRequirements);
    
    setHasChanges(changed);
  }, [title, description, relatedRequirements, epic]);

  const handleRequirementChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...relatedRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setRelatedRequirements(updated);
  };

  const handleAddRequirement = () => {
    setRelatedRequirements([...relatedRequirements, { idTitle: '', title: '', description: ''}]);
  };

  const handleRemoveRequirement = (index: number) => {
    const updated = [...relatedRequirements];
    updated.splice(index, 1);
    setRelatedRequirements(updated);
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
    const newErrors: {
      title?: string;
      description?: string;
      relatedRequirements?: string[];
    } = {};
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = "Title cannot be empty";
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = "Description cannot be empty";
      isValid = false;
    }

    const reqErrors: string[] = [];
    relatedRequirements.forEach((req, index) => {
      if (!req.title.trim() || !req.description.trim()) {
        reqErrors[index] = "Title and description cannot be empty";
        isValid = false;
      }
    });
    
    if (reqErrors.length > 0) {
      newErrors.relatedRequirements = reqErrors;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    onSave({
      id: epic.id,
      idTitle: epic.idTitle,
      title,
      description,
      relatedRequirements: relatedRequirements.filter(
        req => req.title.trim() !== '' && req.description.trim() !== ''
      ),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleTryClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit Epic</DialogTitle>

          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Title</label>
              <input
                className={`w-full border p-2 rounded-md bg-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Epic title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-black">Description</label>
              <textarea
                className={`w-full border p-2 rounded-md resize-none min-h-[150px] bg-white ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the epic"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Related Requirements</label>
              <div className="space-y-2">
                {relatedRequirements.map((req, index) => (
                  <div key={index} className="space-y-1 border rounded-md p-2 bg-white relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-md"
                      aria-label="Remove requirement"
                    >
                      ✕
                    </button>
                    <input
                      className={`w-full border p-1 rounded-md text-sm bg-white ${errors.relatedRequirements?.[index] ? 'border-red-500' : 'border-gray-300'}`}
                      value={req.title}
                      onChange={(e) => handleRequirementChange(index, 'title', e.target.value)}
                      placeholder="Requirement title"
                    />
                    <textarea
                      className={`w-full border p-1 rounded-md text-sm resize-none min-h-[80px] bg-white ${errors.relatedRequirements?.[index] ? 'border-red-500' : 'border-gray-300'}`}
                      value={req.description}
                      onChange={(e) => handleRequirementChange(index, 'description', e.target.value)}
                      placeholder="Requirement description"
                    />
                    {errors.relatedRequirements?.[index] && (
                      <p className="text-red-500 text-xs">{errors.relatedRequirements[index]}</p>
                    )}
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
          </div>

          <div className="flex justify-end gap-2 pt-4">
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

export default EpicEditModal;
