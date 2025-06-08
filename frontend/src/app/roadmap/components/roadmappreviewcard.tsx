import React from "react";
import { RoadmapItem } from "@/types/roadmap";
import { getBasicInfo, getItemIcon, getPriorityColor, getStatusColor } from "../styles/items";
import { getItemTitle } from "@/types/roadmap";

interface Props {
  item: RoadmapItem;
  itemType: string;
}

const PreviewCard: React.FC<Props> = ({ item, itemType }) => {
  const basicInfo = getBasicInfo(itemType, item);

  return (
    <div className={`
      relative bg-white border border-gray-200 rounded-lg shadow-sm
      transition-all duration-200 cursor-pointer
      ${itemType === 'user-story' ? 'border-gray-300' : ''}
      h-28 w-56 max-w-56
    `}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-gray-500 flex-shrink-0 self-start">
              {getItemIcon(itemType)}
            </div>
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {getItemTitle(item)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {'priority' in basicInfo && basicInfo.priority && (
            <span className={`px-2 py-0.5 rounded border ${getPriorityColor(basicInfo.priority as string)}`}>
              {basicInfo.priority}
            </span>
          )}
          {'status' in basicInfo && basicInfo.status && (
            <span className={`px-2 py-0.5 rounded border ${getStatusColor(basicInfo.status as string)}`}>
              {basicInfo.status}
            </span>
          )}
          {'points' in basicInfo && basicInfo.points && (
            <span className="px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-600">
              {basicInfo.points}pt
            </span>
          )}
          {'severity' in basicInfo && basicInfo.severity && (
            <span className="px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-600">
              {basicInfo.severity}
            </span>
          )}
        </div>
      </div>

      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
        itemType === 'user-story' ? 'bg-gray-400' :
        itemType === 'task' ? 'bg-gray-300' :
        'bg-gray-500'
      } opacity-60`}></div>
    </div>
  );
};

export default PreviewCard;
