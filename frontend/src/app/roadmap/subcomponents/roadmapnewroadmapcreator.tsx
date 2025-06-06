"use client";

export default function NewRoadmapDialog({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onClose,
  onCreate,
}: {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-[#4a2b4a]">Create New Roadmap</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#694969] mb-2">
              Roadmap Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-[#c7a0b8] rounded-lg focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent"
              placeholder="e.g., MVP Release v1.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#694969] mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-4 py-2 border border-[#c7a0b8] rounded-lg focus:ring-2 focus:ring-[#7d5c85] focus:border-transparent"
              rows={3}
              placeholder="Roadmap description..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#694969] rounded-lg border border-gray-300 shadow shadow-mb hover:text-[#4a2b4a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className="px-6 py-2 bg-[#7d5c85] text-white rounded-lg hover:bg-[#694969] transition-colors"
          >
            Create Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}