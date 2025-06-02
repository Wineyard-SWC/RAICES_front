"use client";

import { SavedRoadmap } from "@/types/roadmap";
import { X } from "lucide-react";

export default function RoadmapSelectorModal({
  savedRoadmaps,
  onClose,
  onSelect,
}: {
  savedRoadmaps: SavedRoadmap[];
  onClose: () => void;
  onSelect: (roadmap: SavedRoadmap) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden mx-4">
        <div className="p-6 border-b bg-gradient-to-r from-[#f5f0f1] to-[#ebe5eb]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4a2b4a]">Select Roadmap</h2>
              <p className="text-[#694969]">Choose an existing roadmap to work with</p>
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
        <div className="p-6 overflow-y-auto">
          <div className="space-y-3">
            {savedRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="border border-[#c7a0b8] rounded-xl p-4 hover:bg-[#f5f0f1] cursor-pointer transition-all hover:border-[#7d5c85]"
                onClick={() => onSelect(roadmap)}
              >
                <h3 className="font-semibold text-lg text-[#4a2b4a]">{roadmap.name}</h3>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}