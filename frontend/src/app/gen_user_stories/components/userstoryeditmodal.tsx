'use client';

import { createPortal } from 'react-dom';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { UserStory } from "@/types/userstory";
import { useUserStoryEditLogic } from '../hooks/useUserStoryEditLogic';
import { useState } from 'react';
import ConfirmDialog from '@/components/confimDialog';

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
    points,
    setPoints,
    assigned_epic,
    setEpicId,
    acceptanceCriteria,
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  const formatDateOrDefault = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const modalContent = (
    <Dialog open={open} onClose={handleTryClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit User Story</DialogTitle>
          
          <div className="space-y-1 text-lg">
            <label className="text-lg font-medium text-black">Title</label>
            <input 
              className={`w-full border p-2 rounded-md bg-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              aria-label="Edit title" 
            />
            {errors.title && <p className="text-red-500 text-lg mt-1">{errors.title}</p>}
          </div>
          
          <div className="space-y-1 text-lg ">
            <label className="text-lg font-medium text-black">Description</label>
            <textarea
              className={`w-full border p-2 rounded-md resize-none min-h-[150px] bg-white ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Edit description" 
            />
            {errors.description && <p className="text-red-500 text-lg mt-1">{errors.description}</p>}
          </div>
          
          <div className="space-y-1 text-lg">
            <label className="text-lg font-medium text-black">Priority</label>
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
          
          <div className="space-y-1 text-lg">
            <label className="text-lg font-medium text-black">Epic</label>
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
          
          <div className="space-y-1 text-lg">
            <label className="text-lg font-medium text-black">Story Points</label>
            <input 
              type="number"
              min="0"
              className={`w-full border p-2 rounded-md bg-white ${errors.points ? 'border-red-500' : 'border-gray-300'}`} 
              value={points} 
              onChange={(e) => setPoints(Number(e.target.value))} 
              aria-label="Edit points" 
            />
            {errors.points && <p className="text-red-500 text-lg mt-1">{errors.points}</p>}
          </div>

          <div className="space-y-2 text-lg">
            <label className="text-lg font-medium text-black">Acceptance Criteria</label>
            <div className="space-y-4">
              {acceptanceCriteria.map((criterion, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      className="text-lg flex-1 border border-gray-300 p-2 rounded-md bg-white"
                      value={criterion.description}
                      onChange={(e) => updateCriterion(i, e.target.value)}
                      aria-label="Edit acceptance criteria"
                      placeholder="Enter acceptance criteria description"
                    />
                    <button 
                      onClick={() => removeCriterion(i)}
                      className="text-lg text-red-500 p-1 hover:bg-red-50 rounded-md"
                      aria-label="Remove criterion"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* Metadata fields in smaller text */}
                  <div className="text-xs text-gray-500 space-y-1 mt-1">
                    <div className="flex justify-between">
                      <span>Created: {formatDateOrDefault(criterion.date_created)}</span>
                      <span>By: {criterion.created_by[1]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modified: {formatDateOrDefault(criterion.date_modified)}</span>
                      <span>By: {criterion.modified_by[1]}</span>
                    </div>
                    {criterion.date_completed && (
                      <div className="flex justify-between">
                        <span>Completed: {formatDateOrDefault(criterion.date_completed)}</span>
                        <span>By: {criterion.finished_by[1]}</span>
                      </div>
                    )}
                  </div>
                </div> 
              ))}
              
              {errors.acceptanceCriteria && (
                <p className="text-red-500 text-lg mt-1">{errors.acceptanceCriteria}</p>
              )}
              
              <div className="text-lg flex justify-center">  
                <button
                  onClick={addCriterion}
                  className="text-lg text-[#4A2B4A] underline mt-1"
                  type="button"
                >
                  + Add another criterion
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-lg flex justify-between items-center pt-4">
            <button
              onClick={() => {
                setPendingDeleteId(userStory.uuid);
                setShowDeleteConfirm(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
              type="button"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleTryClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-black"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
                type="button"
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
            <DialogPanel className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
              <DialogTitle className="text-xl font-bold text-[#4A2B4A]">Unsaved Changes</DialogTitle>
              <p className="my-4 text-lg">You have unsaved changes. Are you sure you want to close without saving?</p>
              <div className="text-lg flex justify-between items-center gap-2">
                <button 
                  onClick={handleCancelClose} 
                  className="text-lg px-4 py-2 border border-gray-300 rounded-md"
                >
                  Keep Editing
                </button>
                <button 
                  onClick={handleConfirmClose} 
                  className="text-lg px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Discard Changes
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete User Story"
          message={"Are you sure you want to delete this user story?\n This action cannot be undone."}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPendingDeleteId(null);
          }}
          onConfirm={() => {
            if (pendingDeleteId) {
                onDelete(pendingDeleteId);
            }
            setShowDeleteConfirm(false);
            onClose();
          }}
        />
      )}

    </Dialog>
  );

  const modalRoot = typeof window !== 'undefined' ? document.getElementById('modal-root') : null;
    
  return modalRoot ? createPortal(modalContent, modalRoot) : null;

};

export default UserStoryEditModal;
