'use client';

import { createPortal } from 'react-dom';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Epic } from '@/types/epic';
import { Requirement } from '@/types/requirement';
import { useEpicEditLogic } from '../hooks/useEpicEditLogic'; 

type Props = {
  open: boolean;
  onClose: () => void;
  epic: Pick<Epic, 'uuid'| 'id' | 'idTitle' | 'title' | 'description' | 'relatedRequirements'>;
  onSave: (updated: Epic) => void;
  onDelete: (uuid: string) => void;
  allRequirements?: Requirement[];
  onAddNewRequirement?: (r: Requirement) => void;
};

const EpicEditModal = ({
  open,
  onClose,
  epic,
  onSave,
  onDelete,
  allRequirements,
  onAddNewRequirement
}: Props) => {
  const logic = useEpicEditLogic(epic, allRequirements, onAddNewRequirement);

  const {
    title,
    description,
    relatedRequirements,
    searchTerm,
    searchResults,
    errors,
    hasChanges,
    showConfirmation,
    setTitle,
    setDescription,
    setSearchTerm,
    setShowConfirmation,
    handleRequirementChange,
    handleAddRequirement,
    handleAddExistingRequirement,
    handleRemoveRequirement,
    handleSave,
    resetForm
  } = logic;

  const handleTryClose = () => {
    if (hasChanges) setShowConfirmation(true);
    else onClose();
  };

  const handleConfirmClose = () => {
    resetForm();
    setShowConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => setShowConfirmation(false);

  const modalContent = (
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

                    <span className="text-sm font-semibold text-gray-600">{req.idTitle}</span>

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
                    <div className="mt-2">
                      <label className="text-sm font-medium text-black">Requirement Type</label>
                      <select 
                        value={req.category}
                        onChange={(e) => handleRequirementChange(index, 'category', e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-md p-2"
                        aria-label="Edit Requirement Category"
                      >
                        <option value="Funcional">Functional</option>
                        <option value="No Funcional">Non-Functional</option>
                      </select>
                    </div>
                  </div>
                  
                ))}
                <div className="flex justify-center">
                  <button
                    className="text-sm text-[#4A2B4A] underline mt-1"
                    onClick={handleAddRequirement}
                  >
                    + Add another requirement
                  </button>
                </div>
                
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-black">Add Existing Requirement</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search requirements by title"
                    className="w-full border border-gray-300 p-2 rounded-md bg-white"
                  />
                  {searchResults.length > 0 && (
                    <ul className="border border-gray-300 bg-white rounded-md mt-2 max-h-40 overflow-y-auto">
                      {searchResults.map((req) => (
                        <li
                          key={req.uuid}
                          className="px-3 py-2 text-sm hover:bg-purple-100 cursor-pointer"
                          onClick={() => handleAddExistingRequirement(req)}
                        >
                          <span className="font-semibold">{req.idTitle}</span>: {req.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this epic?")) {
                  onDelete(epic.uuid);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete Epic
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleTryClose}
                className="px-4 py-2 rounded-md border border-gray-300 text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => logic.handleSave(onSave, onClose)}
                className="px-4 py-2 rounded-md bg-[#4A2B4A] text-white"
              >
                Save
              </button>
            </div>
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

  const modalRoot = typeof window !== 'undefined' ? document.getElementById('modal-root') : null;
      
  return modalRoot ? createPortal(modalContent, modalRoot) : null;

};

export default EpicEditModal;
