'use client';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React from 'react';
import { X } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
};

const ConfirmDialog = ({
  open,
  title = 'Confirmation',
  message,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isLoading = false
}: ConfirmDialogProps) => {

  if (!open) return null;

  const messageLines = message.split('\n');


  const modalContent = (
    <Dialog open={open} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4">
          {title && (
            <DialogTitle className="text-2xl font-bold text-[#4A2B4A]">
              {title}
            </DialogTitle>
          )}
          <p className="text-lg text-gray-700 whitespace-pre-line">{message}</p>

          <div className="flex justify-end gap-2 pt-4">
             <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  return modalContent;
};

export default ConfirmDialog;