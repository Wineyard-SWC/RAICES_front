import { BookOpen, CheckSquare, BugIcon, ChevronRight,ChevronDown } from "lucide-react";
import { RoadmapItem, RoadmapPhase, TypeConfig } from "@/types/roadmap";
import { UserStory } from "@/types/userstory";
import { Task } from "@/types/task";
import { Bug } from "@/types/bug";
import { getAssigneeName } from "@/app/dashboard/utils/secureAssigneeFormat";

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50';
    case 'Medium': return 'text-yellow-600 bg-yellow-50';
    case 'Low': return 'text-green-600 bg-green-50';
    default: return 'text-[#694969] bg-[#ebe5eb] border-[#c7a0b8]';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Done': return 'text-orange-800 bg-orange-200';
    case 'In Progress': return 'text-yellow-800 bg-yellow-200';
    case 'In Review': return 'text-purple-800 bg-purple-200';
    case 'To Do': return 'text-blue-800 bg-blue-200';
    case 'Backlog': return 'text-green-800 bg-green-200';
    default: return 'text-[#694969] bg-[#ebe5eb]';
  }
};

export const getItemIcon = (type: string) => {
  switch (type) {
    case 'user-story': return <BookOpen className="w-4 h-4" />;
    case 'task': return <CheckSquare className="w-4 h-4" />;
    case 'bug': return <BugIcon className="w-4 h-4" />;
    default: return <CheckSquare className="w-4 h-4" />;
  }
};

export const getTypeConfig = (type: string): TypeConfig => {
  switch (type) {
    case 'user-story': 
      return {
        color: 'bg-[#f5f0f1] border-[#7d5c85] text-[#4a2b4a] shadow-[#ebe5eb]',
        icon: <BookOpen className="w-4 h-4" />,
        label: 'USER STORY'
      };
    case 'task': 
      return {
        color: 'bg-[#f5f0f1] border-[#694969] text-[#4a2b4a] shadow-[#ebe5eb]',
        icon: <CheckSquare className="w-4 h-4" />,
        label: 'TASK'
      };
    case 'bug': 
      return {
        color: 'bg-[#f5f0f1] border-[#c7a0b8] text-[#4a2b4a] shadow-[#ebe5eb]',
        icon: <BugIcon className="w-4 h-4" />,
        label: 'BUG'
      };
    default: 
      return {
        color: 'bg-[#f5f0f1] border-[#c7a0b8] text-[#4a2b4a] shadow-[#ebe5eb]',
        icon: <CheckSquare className="w-4 h-4" />,
        label: 'ITEM'
      };
    }
};

export const getCardSize = (type:string) => {
    switch (type) {
      case 'user-story':
        return 'min-w-64 max-w-80'; 
      case 'task':
        return 'min-w-56 max-w-72'; 
      case 'bug':
        return 'min-w-52 max-w-68'; 
      default:
        return 'min-w-52 max-w-72';
    }
};

export const getCardElevation = (type:string) => {
    switch (type) {
      case 'user-story':
        return 'shadow-xl hover:shadow-2xl'; 
      case 'task':
        return 'shadow-lg hover:shadow-xl';
      case 'bug':
        return 'shadow-md hover:shadow-lg';
      default:
        return 'shadow-lg hover:shadow-xl';
    }
};

export const getCollapseIcon = (isCollapsed:boolean,hasCollapsibleChildren:boolean) => {
    if (!hasCollapsibleChildren) return null;
    
    return isCollapsed ? (
      <ChevronRight className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
};

export const getBasicInfo = (type: string, originalData: RoadmapItem | RoadmapPhase) => {
    switch (type) {
      case 'user-story':
        const userStory = originalData as UserStory;
        return {
          priority: userStory.priority,
          status: userStory.status_khanban,
          points: userStory.points
        };
      
      case 'task':
        const task = originalData as Task;
        return {
          priority: task.priority,
          status: task.status_khanban,
          points: task.story_points
        };
      
      case 'bug':
        const bug = originalData as Bug;
        return {
          priority: bug.priority,
          status: bug.status_khanban,
          severity: bug.severity
        };
      
      default:
        return {};
    }
};

export const getDetailedInfo = (type:string, originalData:RoadmapItem | RoadmapPhase) => {
    switch (type) {
      case 'user-story':
        const userStory = originalData as UserStory;
        return {
          progress: userStory.task_completed && userStory.total_tasks 
            ? `${userStory.task_completed}/${userStory.total_tasks} tasks` 
            : null,
          description: userStory.description
        };
      
      case 'task':
        const task = originalData as Task;
        return {
          assignee: task.assignee?.[0] ? getAssigneeName(task.assignee[0]) : null,
          description: task.description
        };
      
      case 'bug':
        const bug = originalData as Bug;
        return {
          bugStatus: bug.bug_status,
          description: bug.description
        };
      
      default:
        return {};
    }
};

export const truncateTitle = (title: string, maxLength: number = 40) => {
  return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
};