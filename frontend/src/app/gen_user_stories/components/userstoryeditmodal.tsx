'use client';

import { createPortal } from 'react-dom';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { UserStory } from "@/types/userstory";
import { useUserStoryEditLogic } from '../hooks/useUserStoryEditLogic';


type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (updated: UserStory) => void;
  userStory: UserStory;
  availableEpics: { uuid:string; id: string; title: string }[]; 
  onDelete: (uuid: string) => void;
};

const UserStoryEditModal = ({ open, onClose, userStory, onSave, availableEpics, onDelete }: Props) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    assigned_epic,
    setEpicId,
    acceptance_criteria,
    addCriterion,
    removeCriterion,
    updateCriterion,
    handleTryClose,
    handleConfirmClose,
    handleCancelClose,
    handleSave,
    handleDelete,
    showConfirmation,
    errors
  } = useUserStoryEditLogic(userStory, onSave, onClose, onDelete);

  const modalContent = (
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
                <option key={epic.uuid} value={epic.id}>
                  {epic.id} - {epic.title}
                </option>
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
                  onDelete(userStory.uuid);
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

  const modalRoot = typeof window !== 'undefined' ? document.getElementById('modal-root') : null;
    
  return modalRoot ? createPortal(modalContent, modalRoot) : null;

};

export default UserStoryEditModal;
