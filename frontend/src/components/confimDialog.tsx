'use client';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDialog = ({
  open,
  title = 'Confirmation',
  message,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
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
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
            >
              Confirm
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  return modalContent;
};

export default ConfirmDialog;