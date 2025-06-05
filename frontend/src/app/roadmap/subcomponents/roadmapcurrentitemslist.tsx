// components/roadmap/CurrentRoadmapItemsList.tsx
import React from "react";
import { RoadmapItem } from "@/types/roadmap";
import { getItemId, getItemPriority, getItemStatus, getItemTitle } from "@/types/roadmap";
import { getPriorityColor, getStatusColor } from "../styles/items";

type Props = {
  items: RoadmapItem[];
  onRemoveItem: (itemId: string) => void;
};

const CurrentRoadmapItemsList: React.FC<Props> = ({ items, onRemoveItem }) => {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={getItemId(item)} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-all">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800 text-sm truncate">
                {getItemTitle(item)}
              </h4>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs px-1 py-0.5 rounded border ${getPriorityColor(getItemPriority(item))}`}>
                  {getItemPriority(item)}
                </span>
                <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(getItemStatus(item))}`}>
                  {getItemStatus(item)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onRemoveItem(getItemId(item))}
              className="ml-2 text-red-500 hover:text-red-700 text-lg hover:bg-red-50 rounded p-1 transition-colors"
              title="Remove from roadmap"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CurrentRoadmapItemsList;
