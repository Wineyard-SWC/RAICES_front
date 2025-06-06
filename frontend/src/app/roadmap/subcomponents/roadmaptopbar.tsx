"use client";

import { SavedRoadmap } from "@/types/roadmap";
import { X, Copy, Folder, FileText, ArrowBigLeftIcon } from "lucide-react";


export default function RoadmapTopBar({
  roadmap,
  onNew,
  onLoad,
  onExport,
  onDuplicate,
  onHide,
  onGoBack
}: {
  roadmap: SavedRoadmap;
  onNew: () => void;
  onLoad: () => void;
  onExport: () => void;
  onDuplicate: () => void;
  onHide: () => void;
  onGoBack: () => void;
}) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800 truncate overflow-hidden whitespace-nowrap max-w-[400px]">{roadmap.name}</h1>
                {roadmap.description && (
                  <p className="text-sm text-gray-600 truncate overflow-hidden whitespace-nowrap max-w-[400px]">{roadmap.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{roadmap.items.length} items</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{roadmap.phases.length} phases</span>
                <span>Updated: {new Date(roadmap.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
            <div className="flex items-center gap-2">
            <button
              onClick={onNew}
              className="px-4 py-2 text-[#694969] rounded-lg border border-black shadow shadow-mb hover:bg-[#694969] hover:text-white transition-colors flex items-center gap-2"
            >
              <span className="text-lg font-bold">+</span>
              <span>New</span>
            </button>
            <button
              onClick={onLoad}
              className="px-4 py-2 text-[#694969] rounded-lg border border-black shadow shadow-mb hover:bg-[#694969] hover:text-white transition-colors flex items-center gap-2"
            >
              <Folder className="w-5 h-5" />
              <span>Load</span>
            </button>
            <button
              onClick={onDuplicate}
              className="px-4 py-2 text-[#694969] rounded-lg border border-black shadow shadow-mb hover:bg-[#694969] hover:text-white transition-colors flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={onGoBack}
              className="absolute top-22 left-4 px-4 py-2 text-[#694969] rounded-lg border border-black shadow shadow-mb hover:bg-[#694969] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowBigLeftIcon className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            <button 
              onClick={onHide} 
              aria-label='exit'
              className="absolute top-22 right-4 text-[#694969] hover:text-[#4a2b4a] text-2xl font-bold p-2 hover:bg-[#ebe5eb] rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
