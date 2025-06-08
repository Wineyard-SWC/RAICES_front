"use client";
import { useState } from "react";
import { SavedRoadmap } from "@/types/roadmap";
import { X, Pencil,Trash2} from "lucide-react";
import ConfirmDialog from "@/components/confimDialog";

export default function RoadmapSelectorModal({
  savedRoadmaps,
  onClose,
  onSelect,
  onEdit,
  onDelete,
}: {
  savedRoadmaps: SavedRoadmap[];
  onClose: () => void;
  onSelect: (roadmap: SavedRoadmap) => void;
  onEdit: (
    roadmap: SavedRoadmap,
    newRoadmapName:string,
    newRoadmapDescription:string) => void;
  onDelete: (roadmap: SavedRoadmap) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState(""); 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<SavedRoadmap | null>(null);

  const handleEditClick = (roadmap: SavedRoadmap) => {
    setEditingId(roadmap.id);
    setEditName(roadmap.name);
    setEditDescription(roadmap.description || "");
  };

  const handleEditConfirm = (roadmap: SavedRoadmap) => {
    onEdit(roadmap, editName, editDescription);
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

   const handleDeleteClick = (roadmap: SavedRoadmap) => {
    setRoadmapToDelete(roadmap);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roadmapToDelete) {
      onDelete(roadmapToDelete);
      setDeleteDialogOpen(false);
      setRoadmapToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRoadmapToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden mx-4">
        <div className="p-6 border-b bg-gradient-to-r from-[#f5f0f1] to-[#ebe5eb]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4a2b4a]">Select Map</h2>
              <p className="text-[#694969]">Choose an existing dependency map to work with</p>
            </div>
            <button
              aria-label="exit"
              onClick={onClose}
              className="text-[#694969] hover:text-[#4a2b4a] text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
         <div className="space-y-3 overflow-y-auto h-[450px]">
            {savedRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="border border-[#694969] rounded-xl p-4 hover:bg-[#f5f0f1] transition-all hover:border-[#7d5c85]"
              >
                {editingId === roadmap.id ? (
                  // Formulario de edición
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-white px-3 py-2 border border-[#694969] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent"
                        placeholder="Nombre del roadmap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4a2b4a] mb-1">
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-white px-3 py-2 border border-[#694969] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Descripción del roadmap (opcional)"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleEditCancel}
                        className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditConfirm(roadmap)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#7d5c85] text-white hover:bg-[#6b4f73] rounded"
                        disabled={!editName.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // Vista normal del roadmap
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => onSelect(roadmap)}
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-[#4a2b4a] flex items-center gap-2">
                        {roadmap.name}
                      </h3>
                      {roadmap.description && (
                        <p className="text-sm text-[#694969] mt-1">{roadmap.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-[#694969]">
                        <span className="bg-[#c7a0b8] text-[#4a2b4a] px-2 py-1 rounded">
                          {roadmap.items.length} items
                        </span>
                        <span className="bg-[#7d5c85] text-white px-2 py-1 rounded">
                          {roadmap.phases.length} phases
                        </span>
                        <span>
                          Updated: {new Date(roadmap.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {/* Botones de editar y borrar */}
                    <div className="flex flex-col gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEditClick(roadmap)}
                        className="p-1 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil className="w-5 h-5 text-[#694969]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(roadmap)}
                        className="p-1 rounded hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Roadmap"
        message={`Are you sure you want to delete "${roadmapToDelete?.name}"?\nThis action cannot be undone.`}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        cancelText="Cancel"
        confirmText="Delete"
      />
    </div>

  );
}