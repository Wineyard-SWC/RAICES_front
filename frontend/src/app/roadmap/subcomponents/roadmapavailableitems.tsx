import React from "react";
import { RoadmapItem } from "@/types/roadmap";
import { Plus } from "lucide-react";
import { getItemId, getItemTitle, getItemType, getItemPriority,getItemStatus } from "@/types/roadmap";
import { getPriorityColor, getStatusColor } from "../styles/items";

type Props = {
  items: RoadmapItem[];
  addRelatedItems: boolean;
  getRelatedItemsCount: (item: RoadmapItem) => number;
  onAddItem: (item: RoadmapItem) => void;
  selectedTab: string;
  onShowPreview: (item: RoadmapItem) => void;
};

const AvailableItemsList: React.FC<Props> = ({
  items,
  addRelatedItems,
  getRelatedItemsCount,
  onAddItem,
  selectedTab,
  onShowPreview
}) => {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const relatedCount = getRelatedItemsCount(item);
        const canShowPreview = getItemType(item) === 'user-story';
        return (
          <div
            key={getItemId(item)}
            className="border border-[#c7a0b8] rounded-xl p-4 hover:shadow-md transition-all bg-white hover:border-[#7d5c85]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(getItemPriority(item))}`}>
                    {getItemPriority(item)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(getItemStatus(item))}`}>
                    {getItemStatus(item)}
                  </span>
                  {relatedCount > 0 && addRelatedItems && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200">
                      +{relatedCount} related
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-gray-800 mb-1">
                  {getItemTitle(item)}
                </h4>
                {'description' in item && item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Additional info based on type */}
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                {selectedTab === 'user-story' && 'points' in item && (
                    <span>Story Points: <strong>{item.points}</strong></span>
                )}
                {selectedTab === 'task' && 'story_points' in item && (
                    <span>Story Points: <strong>{item.story_points}</strong></span>
                )}
                {selectedTab === 'bug' && 'severity' in item && (
                    <span>Severity: <strong className={
                    item.severity === 'Critical' || item.severity === 'Blocker' ? 'text-red-600' :
                    item.severity === 'Major' ? 'text-orange-600' : 'text-gray-600'
                    }>{item.severity}</strong></span>
                )}
                {('assignee' in item) && item.assignee && Array.isArray(item.assignee) && item.assignee.length > 0 && (
                    <span>Assignee: <strong>{item.assignee[0].users[1]}</strong></span>
                )}
                </div>
              </div>
               <div className="flex items-center gap-2">
                {canShowPreview && (
                  <button
                    onClick={() => onShowPreview(item)}
                    className="text-xs text-[#7d5c85] underline hover:text-[#4a2b4a] transition-colors"
                    type="button"
                  >
                    Show Preview
                  </button>
                )}
                <button
                  onClick={() => onAddItem(item)}
                  className="ml-2 px-4 py-2 bg-[#7d5c85] text-white rounded-lg hover:bg-[#694969] transition-colors text-sm flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add {relatedCount > 0 && addRelatedItems ? `(+${relatedCount})` : ''}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailableItemsList;
