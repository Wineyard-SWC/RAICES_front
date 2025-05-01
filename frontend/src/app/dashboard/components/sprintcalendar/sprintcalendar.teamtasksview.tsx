"use client";
import React from 'react';
import { MoreVertical, Calendar, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Define the task interface
interface Task {
  id: string;
  title: string;
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: string;
  type: string;
  points: number;
  comments?: number;
}

// Define developer interface
interface Developer {
  id: string;
  name: string;
  role: string;
  hoursAllocated: number;
  hoursTotal: number;
  tasks: Task[];
}

interface TeamTasksViewProps {
  developers: Developer[];
  onTaskMenuClick?: (taskId: string) => void;
}

// Individual Task Card component matching your TaskCard format
const TaskCard: React.FC<Task & { onMenuClick?: (taskId: string) => void }> = ({
  id,
  title,
  description,
  dateRange,
  status,
  type,
  points,
  comments = 1,
  onMenuClick
}) => {
  // Type color mapping
  const typeColors = {
    'BUG': 'bg-red-100 text-red-800',
    'STORY': 'bg-purple-100 text-purple-800',
    'TASK': 'bg-green-100 text-green-800',
  };
  
  // Status color mapping
  const statusColors = {
    'To do': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Done': 'bg-green-100 text-green-800',
    'Review': 'bg-orange-100 text-orange-800',
  };
  
  const typeColor = typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  const statusColor = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  
  return (
    <div className="hover:bg-[#EBE5EB] cursor-pointer bg-white rounded-md p-4 shadow-sm border border-[#D3C7D3] mb-3 relative">
      <div className="absolute right-2 top-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => onMenuClick && onMenuClick(id)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <h3 className="font-medium text-gray-900 pr-6">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Mar {dateRange.start} - Mar {dateRange.end}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {comments > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments}</span>
            </div>
          )}
          
          <span className={`px-2 py-1 rounded-full text-xs ${typeColor}`}>
            {type}
          </span>
          
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {status}
          </span>
          
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {points} pts
          </span>
        </div>
      </div>
    </div>
  );
};

// Developer section component
const DeveloperSection: React.FC<{ developer: Developer, onTaskMenuClick?: (taskId: string) => void }> = ({
  developer,
  onTaskMenuClick
}) => {
  const progressPercentage = Math.round((developer.hoursAllocated / developer.hoursTotal) * 100);
  
  return (
    <div className="bg-white rounded-md p-4 shadow-sm border border-[#D3C7D3] mb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-[#E9DEE9] flex items-center justify-center mr-3">
          <span className="text-[#4A2B4D] text-sm font-medium">
            {developer.name.charAt(0)}
          </span>
        </div>
        
        <div>
          <h2 className="font-medium text-gray-900">{developer.name}</h2>
          <p className="text-sm text-gray-600">{developer.role}</p>
        </div>
        
        <div className="ml-auto text-right">
          <p className="text-sm font-medium text-gray-900">
            {developer.tasks.length} tasks
          </p>
          <p className="text-xs text-gray-600">
            {developer.hoursAllocated}h / {developer.hoursTotal}h
          </p>
        </div>
      </div>
      
      {/* Workload progress bar */}
      <div className="mb-4">
        <div className="h-2 w-full bg-gray-100 rounded-full">
          <div 
            className="h-2 bg-[#4A2B4D] rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">Workload</span>
          <span className="text-xs text-gray-600">{progressPercentage}%</span>
        </div>
      </div>
      
      {/* Tasks */}
      <div className="space-y-3 mt-4">
        {developer.tasks.map(task => (
          <TaskCard 
            key={task.id}
            {...task}
            onMenuClick={onTaskMenuClick}
          />
        ))}
      </div>
    </div>
  );
};

// Main team tasks view component
export default function TeamTasksView({ 
  developers,
  onTaskMenuClick
}: TeamTasksViewProps) {
  return (
    <div className="space-y-4 mt-4">
      {developers.map(developer => (
        <DeveloperSection
          key={developer.id}
          developer={developer}
          onTaskMenuClick={onTaskMenuClick}
        />
      ))}
    </div>
  );
}