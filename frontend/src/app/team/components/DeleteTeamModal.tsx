"use client";
import { createPortal } from "react-dom";

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamName: string;
}

export const DeleteTeamModal: React.FC<DeleteTeamModalProps> = ({ isOpen, onClose, onConfirm, teamName }) => {
  const modal = (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>      
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 relative z-10" onClick={e => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-[#4A2B4D]">Delete Team</h2>
          <p className="text-lg text-black">Are you sure you want to delete the team "{teamName}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50">Cancel</button>
            <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400/50">Delete Team</button>
          </div>
        </div>
      </div>
    </div>
  );
  if (typeof window !== "undefined") {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    return createPortal(modal, root);
  }
  return null;
};
