"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { useDeleteProject } from "@/hooks/useDeleteProject";
import { useDeleteProjectUsers } from "@/hooks/useDeleteProjectUsers";
import { printError } from "@/utils/debugLogger";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

const DeleteProjectModal = ({ isOpen, onClose, projectId, projectTitle }: DeleteProjectModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { deleteProject, error: deleteProjectError } = useDeleteProject();
  const { deleteProjectUsers, error: deleteRelationsError } = useDeleteProjectUsers();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // console.log("[DELETE PROJECT MODAL] Deleting project-user relations for project:", projectId);

      // Eliminar las relaciones de project_users
      const relationsDeleted = await deleteProjectUsers(projectId);
      if (!relationsDeleted) {
        printError("Failed to delete project-user relations");
        return;
      }

      // console.log("[DELETE PROJECT MODAL] Relations deleted successfully. Proceeding to delete project.");

      // Eliminar el proyecto
      const projectDeleted = await deleteProject(projectId);
      if (projectDeleted) {
        setSuccessMessage("Project deleted successfully");
        setTimeout(() => {
          onClose();
          // Refresh the page to update the project list
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      printError("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">Delete Project</h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4 text-amber-600">
            <AlertTriangle size={24} className="mr-2" />
            <h3 className="text-lg font-medium">Are you sure?</h3>
          </div>

          <p className="text-[#694969] mb-4">
            You are about to delete the project <strong>"{projectTitle}"</strong>. This action cannot be undone and all associated data will be deleted.
          </p>

          {deleteProjectError && <p className="text-red-500 mb-4">{deleteProjectError}</p>}
          {deleteRelationsError && <p className="text-red-500 mb-4">{deleteRelationsError}</p>}
          {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isDeleting || !!successMessage}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
