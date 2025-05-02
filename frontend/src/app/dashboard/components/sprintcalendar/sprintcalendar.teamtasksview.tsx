"use client";
import React, { useEffect, useState } from 'react';
import { MoreVertical, Calendar, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Main team tasks view component
export default function TeamTasksView({ 
  onTaskMenuClick,
  projectId
}: TeamTasksViewProps) {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  // Function to get user data from API or cache
  const fetchUserData = async (userId: string): Promise<User | null> => {
    // Check if we already have this user in our map
    if (userMap[userId]) {
      return userMap[userId];
    }

    // Check if we have the user in localStorage
    const cachedUsers = localStorage.getItem('cached_users');
    const cachedUserMap: Record<string, User> = cachedUsers ? JSON.parse(cachedUsers) : {};
    
    if (cachedUserMap[userId]) {
      // Update our in-memory map
      setUserMap(prev => ({ ...prev, [userId]: cachedUserMap[userId] }));
      return cachedUserMap[userId];
    }

    // If not in cache, fetch from API
    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const userData = await response.json();
      
      // Update our cache
      cachedUserMap[userId] = userData;
      localStorage.setItem('cached_users', JSON.stringify(cachedUserMap));
      
      // Update our in-memory map
      setUserMap(prev => ({ ...prev, [userId]: userData }));
      
      return userData;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Get project ID from localStorage if not provided as prop
        const currentProjectId = projectId || localStorage.getItem("currentProjectId");
        
        if (!currentProjectId) {
          console.error("No project ID available");
          return;
        }

        const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        
        const tasks: Task[] = await response.json();
        
        // Group tasks by assignee
        const tasksByAssignee: Record<string, Task[]> = {};
        
        tasks.forEach(task => {
          if (!task.assignee) return;
          
          if (!tasksByAssignee[task.assignee]) {
            tasksByAssignee[task.assignee] = [];
          }
          
          tasksByAssignee[task.assignee].push(task);
        });
        
        // Create developer objects with user data from API
        const developerPromises = Object.entries(tasksByAssignee).map(async ([userId, tasks]) => {
          // Calculate hours based on story points (assuming 1 point = 2 hours)
          const totalPoints = tasks.reduce((sum, task) => sum + task.story_points, 0);
          const hoursAllocated = totalPoints * 2;
          
          // Fetch user data
          const userData = await fetchUserData(userId);
          
          return {
            id: userId,
            name: userData?.name || userId,
            role: userData?.role || "Team Member", // Use role from API or default
            hoursAllocated: hoursAllocated,
            hoursTotal: 40, // Default work week
            tasks: tasks
          };
        });
        
        const developersData = await Promise.all(developerPromises);
        setDevelopers(developersData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  if (loading) {
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