"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { MoreVertical, Calendar, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { useKanban } from '@/contexts/unifieddashboardcontext';

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
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
  onTaskMenuClick?: (taskId: string) => void;
  projectId?: string;
}

// Individual Task Card component matching your TaskCard format
const TaskCard: React.FC<Task & { onMenuClick?: (taskId: string) => void }> = ({
  id,
  title,
  description,
  status_khanban,
  priority,
  story_points,
  comments = [],
  created_at,
  updated_at,
  onMenuClick
}) => {
  // Type color mapping based on priority
  const typeColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800"
  };
  
  // Status color mapping
  const statusColors = {
    'To Do': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'Done': 'bg-green-100 text-green-800',
    'In Review': 'bg-yellow-100 text-yellow-800',
    'Backlog': 'bg-gray-100 text-gray-800',
  };
  
  const typeColor = typeColors[priority as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  const statusColor = statusColors[status_khanban as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  
  // Format date for display
  const createdDate = new Date(created_at);
  const updatedDate = new Date(updated_at);
  
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
          <span>Created: {createdDate.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {comments.length > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{comments.length}</span>
            </div>
          )}
          
          <span className={`px-2 py-1 rounded-full text-xs ${typeColor}`}>
            {priority}
          </span>
          
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {status_khanban}
          </span>
          
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {story_points} pts
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

interface Workinguser {
  id: string;
  name: string;
}
export default function TeamTasksView({ 
  onTaskMenuClick,
  projectId
}: TeamTasksViewProps) {
  // Use the unified Kanban context instead of fetching data
  const { tasks, isLoading, currentProjectId } = useKanban();
  
  // Helper function to get user info from assignee (which could be tuple or array)
  const getUserFromAssignee = (assignee: [string, string] | Workinguser[] | string | null | undefined): { id: string; name: string } => {
    // If it's null or undefined
    if (!assignee) {
      return { id: 'unassigned', name: 'Unassigned' };
    }
    
    // If it's a simple string (just the ID)
    if (typeof assignee === 'string') {
      return { id: assignee, name: assignee };
    }
    
    // If it's an array of Workinguser objects
    if (Array.isArray(assignee) && assignee.length > 0 && typeof assignee[0] === 'object') {
      const firstUser = assignee[0] as Workinguser;
      return { id: firstUser.id, name: firstUser.name };
    }
    
    // If it's a tuple [id, name]
    if (Array.isArray(assignee) && assignee.length >= 2 && typeof assignee[0] === 'string') {
      return { id: assignee[0], name: assignee[1] };
    }
    
    return { id: 'unassigned', name: 'Unassigned' };
  };

  // Memoized developers data processed from unified context
  const developers = useMemo(() => {
    if (!tasks) return [];

    // Get all tasks from all columns (excluding backlog stories)
    const allTasks: Task[] = [
      ...tasks.todo,
      ...tasks.inprogress,
      ...tasks.inreview,
      ...tasks.done
    ].filter(task => 'assignee' in task && task.assignee) as Task[];

    // Group tasks by assignee
    const tasksByAssignee = allTasks.reduce((acc, task) => {
      const user = getUserFromAssignee(task.assignee);
      const userId = user.id;
      
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Create developer objects
    return Object.entries(tasksByAssignee).map(([userId, tasks]) => {
      const user = getUserFromAssignee(tasks[0].assignee);
      
      // Calculate hours based on story points (assuming 1 point = 2 hours)
      const totalPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
      const hoursAllocated = totalPoints * 2;
      
      return {
        id: userId,
        name: user.name,
        role: "Team Member", // We could get this from user data if needed
        hoursAllocated: hoursAllocated,
        hoursTotal: 40, // Default work week
        tasks: tasks
      };
    });
  }, [tasks]);

  // Check if we're viewing the right project
  const isCorrectProject = !projectId || projectId === currentProjectId;

  // Don't render anything if we're looking at a different project
  if (!isCorrectProject) {
    return null;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading team tasks...</div>;
  }

  if (developers.length === 0) {
    return <div className="p-4 text-center">No tasks assigned to team members</div>;
  }

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