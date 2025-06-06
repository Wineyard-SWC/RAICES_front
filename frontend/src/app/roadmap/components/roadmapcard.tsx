"use client";

import React, { useState } from 'react';
import { TaskCardProps } from '@/types/roadmap';
import { 
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  User
} from 'lucide-react';
import { 
getTypeConfig,
getStatusColor,
getPriorityColor,
getDetailedInfo,
getBasicInfo,
getItemIcon,
truncateTitle
} from '../styles/items';
import { renderConnectionHandles } from '../subcomponents/roadmapcardconections';
import { getAssigneeName } from '@/app/dashboard/utils/secureAssigneeFormat';

const TaskCard: React.FC<TaskCardProps> = ({ data, isConnectable }) => {
  const { type, title, originalData, isCollapsed, hasCollapsibleChildren, hasConnections  } = data;
  const [showDetails, setShowDetails] = useState(false);
  const [cardIsConnectable, setCardIsConnectable] = useState(isConnectable || false)
  const [cardHasConnections, setCardHasConnections] = useState(hasConnections || false)
  
  const config = getTypeConfig(type);
  const basicInfo = getBasicInfo(type,originalData);
  const detailedInfo = getDetailedInfo(type,originalData);
  const renderData = {
    isConnectable: cardIsConnectable,
    hasConnections: cardHasConnections,
    nodeType: type === 'user-story' || type === 'task' || type === 'bug' ? type : undefined
  }

  return (
    <div className={`
      relative bg-white border border-gray-200 rounded-lg shadow-sm
      transition-all duration-200 hover:shadow-md cursor-pointer
      ${type === 'user-story' ? 'border-gray-300' : ''}
      ${showDetails ? 'min-h-32' : 'h-28'}
      w-56 max-w-56
      ${hasConnections ? 'ring-1 ring-gray-300' : ''}
      group
    `}>
      {/* Connection handles */}
      {type !== "phase" && renderConnectionHandles(renderData)}
      
      {/* Compact content */}
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-gray-500 flex-shrink-0 self-start">
              {getItemIcon(type)}
            </div>
            <h3
              className={`text-sm font-medium text-gray-900 ${showDetails ? '' : 'truncate'}`}
            >
              {title}
            </h3>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0 self-start">
            {hasCollapsibleChildren && (
              <button
                className="text-gray-400 hover:text-gray-600 p-1"
                title={isCollapsed ? "Expand" : "Collapse"}
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tags row */}
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

        {/* Show details text button */}
        <div className="mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="text-xs text-black hover:underline focus:outline-none"
            type="button"
            aria-label={showDetails ? "Hide details" : "Show details"}
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
        </div>
         
        {/* Expanded details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {'progress' in detailedInfo && detailedInfo.progress && (
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progress:</span>
                <span className="font-medium">{detailedInfo.progress}</span>
              </div>
            )}
            {'assignee' in detailedInfo && detailedInfo.assignee && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="w-3 h-3" />
                <span className="truncate">{detailedInfo.assignee}</span>
              </div>
            )}
            {'bugStatus' in detailedInfo && detailedInfo.bugStatus && (
              <div className="text-xs">
                <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600">
                  {(detailedInfo.bugStatus as string)?.replace('_', ' ')}
                </span>
              </div>
            )}
            {'description' in detailedInfo && detailedInfo.description && (
              <div className="text-xs text-gray-500 mt-2">
                <p className="line-clamp-2 ">{detailedInfo.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Type indicator */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
        type === 'user-story' ? 'bg-gray-400' : 
        type === 'task' ? 'bg-gray-300' : 
        'bg-gray-500'
      } opacity-60`}></div>
    </div>
  );
};
export default TaskCard;