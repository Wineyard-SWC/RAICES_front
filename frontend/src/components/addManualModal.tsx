import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

type AddModalProps<T> = {
  open: boolean;
  onClose: () => void;
  onAdd: (item: T) => void;
  renderForm: (onSubmit: (item: T) => void, onCancel: () => void) => JSX.Element;
};

const AddManualModal = <T,>({ open, onClose, onAdd, renderForm }: AddModalProps<T>) => {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Add Manually</DialogTitle>
          {renderForm(onAdd, onClose)}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddManualModal;