import React from "react";
import { SavedRoadmap } from "@/types/roadmap";
import { Clock } from "lucide-react";

interface RecentlyUsedRoadmapsProps {
  roadmaps: SavedRoadmap[];
  onSelect: (roadmap: SavedRoadmap) => void;
  maxToShow?: number;
}

export default function RecentlyUsedRoadmaps({
  roadmaps,
  onSelect,
  maxToShow = 5,
}: RecentlyUsedRoadmapsProps) {
  const sorted = [...roadmaps].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
    return dateB - dateA;
  });

  const toShow = sorted.slice(0, maxToShow);

  if (toShow.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No recent dependencies yet.
      </div>
    );
  }

   return (
    <div className="bg-white rounded-xl shadow-lg border-1 border-[#694969] h-full flex flex-col">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl px-6 py-4 border-b border-gray-900 flex items-center gap-3">
        <Clock className="w-6 h-6 text-[#694969]" />
        <div>
          <h3 className="text-lg font-bold text-black">Recently Used Dependency Maps</h3>
          <p className="text-gray-600 text-sm mt-1">
            Quickly access your most recently edited dependency maps
          </p>
        </div>
      </div>
      <div className="flex-1 px-4 py-4">
        <div className="overflow-y-auto max-h-[400px]">
          {toShow.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No recent roadmaps yet.
            </div>
          ) : (
            <ul className="">
              {toShow.map((roadmap) => (
                <li key={roadmap.id} className="shadow-lg rounded-xl border-1 border-[#694969] mt-6 px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#694969] truncate overflow-hidden whitespace-nowrap max-w-[300px]">
                    {roadmap.name}
                    </div>                    
                    <div className="text-sm text-gray-500">
                      Last updated:{" "}
                      {new Date(roadmap.updatedAt || roadmap.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelect(roadmap)}
                    className="ml-4 px-3 py-1 rounded bg-[#694969] text-white text-xs hover:bg-[#4a2b4a] transition-colors"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}