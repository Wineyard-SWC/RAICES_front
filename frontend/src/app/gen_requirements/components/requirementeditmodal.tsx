'use client';

import { createPortal } from 'react-dom';
import { Requirement } from "@/types/requirement";
import React, { useState } from 'react';
import { Dialog,DialogPanel, DialogTitle } from "@headlessui/react";
import { useRequirementEditLogic } from '../hooks/useRequirementEditLogic';
import ConfirmDialog from '@/components/confimDialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (updated: Requirement) => void;
  requirement: Pick<Requirement, 'id' | 'idTitle' | 'title' | 'description' | 'priority'| 'category'|'uuid'>;
  onDelete: (uuid: string) => void;
};

const RequirementEditModal = ({ open, onClose, requirement, onSave, onDelete }: Props) => {
  
  const {
    title,
    description,
    priority,
    category,
    errors,
    showConfirmation,
    setTitle,
    setDescription,
    setPriority,
    setCategory,
    handleSave,
    handleTryClose,
    handleConfirmClose,
    handleCancelClose,
    handleDelete
  } = useRequirementEditLogic(requirement, onSave, onClose, onDelete);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const modalContent =  (
    <Dialog open={open} onClose={handleTryClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
          <DialogTitle className="text-xl font-bold text-[#4A2B4A]">Edit Requirement</DialogTitle>

          <div className="space-y-1 text-lg">
            <label htmlFor="titleInput" className="text-lg font-medium text-black">Title</label>
            <input
              id="titleInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full border p-2 rounded-md bg-white ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter the title"
            />
            {errors.title && <p className="text-red-500 text-lg mt-1">{errors.title}</p>}
          </div>

          <div className="space-y-1 text-lg">
            <label htmlFor="descriptionInput" className="text-lg font-medium text-black">Description</label>
            <textarea
                id="descriptionInput"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full border p-2 rounded-md resize-none min-h-[150px] bg-white ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                placeholder="Write a short description"
            />
            {errors.description && <p className="text-red-500 text-lg mt-1">{errors.description}</p>}
          </div>

          <div className="space-y-1 text-lg">
            <label htmlFor="prioritySelect" className="text-lg font-medium text-black">Priority</label>
            <select
              id="prioritySelect"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Requirement['priority'])}
              className="w-full text-lg border border-gray-300 bg-white rounded-md p-2"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="space-y-1 text-lg">
            <label htmlFor="categorySelect" className="text-lg font-medium text-black">Category</label>
            <select
              id="categorySelect"
              value={category}
              onChange={(e) => setCategory(e.target.value as Requirement['category'])}
              className="w-full text-lg border border-gray-300 bg-white rounded-md p-2"
              required
            >
              <option value="Funcional">Functional</option>
              <option value="No Funcional">Non Functional</option>
            </select>
          </div>

          <div className=" text-lg flex justify-between items-center pt-4">
            <button
              onClick={() => {
                setPendingDeleteId(requirement.uuid);
                setShowDeleteConfirm(true);
              }}
              className="text-lg px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
            <div className="text-lg flex gap-2 text-lg">
              <button
                onClick={handleTryClose}
                className="text-lg px-4 py-2 border border-gray-300 rounded-md text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-lg px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
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
            <DialogPanel className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
              <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Unsaved Changes</DialogTitle>
              <p className="my-4 text-lg">You have unsaved changes. Are you sure you want to close without saving?</p>
              <div className="text-lg flex justify-between items-center gap-2">
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

      {showDeleteConfirm && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete Requirement"
          message={"Are you sure you want to delete this requirement?\nThis action cannot be undone."}
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

export default RequirementEditModal;
