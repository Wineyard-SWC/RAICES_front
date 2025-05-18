import CalendarTaskCard from "./sprintcalendar.taskcard"
import { styles } from "../../styles/calendarstyles"
import { useEffect, useState, useMemo } from "react"
import { Task } from "@/types/task"
import { useUser } from "@/contexts/usercontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// We'll now work with actual dates rather than just day names
const today = new Date()

// Helper function to get the date for n days ago
const getDaysAgo = (daysAgo: number, referenceDate: Date = today) => {
  const date = new Date(referenceDate)
  date.setDate(referenceDate.getDate() - daysAgo)
  return date
}

// Format date as day name and number
const formatDate = (date: Date) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()
  return { dayName, dayNumber, fullDate: date }
}

// Get the dates for our 5-day view (4 previous days + today)
const getDates = (weekOffset: number = 0) => {
  // Calculate the reference date based on week offset
  const referenceDate = new Date(today)
  referenceDate.setDate(today.getDate() + (weekOffset * 7))
  
  return [
    formatDate(getDaysAgo(4, referenceDate)), // 4 days ago from reference
    formatDate(getDaysAgo(3, referenceDate)), // 3 days ago from reference
    formatDate(getDaysAgo(2, referenceDate)), // 2 days ago from reference
    formatDate(getDaysAgo(1, referenceDate)), // yesterday from reference
    formatDate(referenceDate),               // reference date (today + weekOffset)
  ]
}

interface CalendarGridProps {
  projectId?: string
  weekOffset?: number
}

// Interface for Workinguser
interface Workinguser {
  users :[string,string]
}

export const convertAssigneeToWorkinguser = (assignee: any[] | undefined): Workinguser[] => {
  if (!Array.isArray(assignee)) return []

  return assignee
    .filter(a => Array.isArray(a.users)) 
    .map(a => ({
      users: [a.users[0] || "", a.users[1] || ""]
    }));
}

// Calculate capacity per day (story points)
const calculateDailyCapacity = (teamSize = 3) => {
  // Assuming each team member can handle 3 story points per day on average
  return teamSize * 3;
}

// Helper function to distribute tasks based on completion date or move to today
const distributeTasksByCompletionDate = (tasks: Task[], weekOffset: number = 0) => {
  if (!tasks || tasks.length === 0) return { 0: [], 1: [], 2: [], 3: [], 4: [] };
  
  const dates = getDates(weekOffset);
  const distribution: {[key: number]: Task[]} = {0: [], 1: [], 2: [], 3: [], 4: []};
  
  // Get midnight timestamps for each day for comparison
  const dayTimestamps = dates.map(date => {
    const d = new Date(date.fullDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  
  tasks.forEach(task => {
    // Parse the updated_at date
    const updatedDate = new Date(task.updated_at);
    updatedDate.setHours(0, 0, 0, 0);
    const updatedTimestamp = updatedDate.getTime();
    
    if (task.status_khanban === 'Done') {
      // For completed tasks, place them on the day they were completed
      let placed = false;
      
      // Check if the task was completed on one of our displayed days
      for (let i = 0; i < 5; i++) {
        if (updatedTimestamp === dayTimestamps[i]) {
          distribution[i].push(task);
          placed = true;
          break;
        }
      }
      
      // If the task was completed before our displayed range, don't show it
      if (!placed && updatedTimestamp < dayTimestamps[0]) {
        // Task completed before our displayed range, don't show it
      }
      // If the task was completed after our range (shouldn't happen, but just in case)
      else if (!placed) {
        distribution[4].push(task); // Put it in today's column
      }
    } else {
      // For non-completed tasks, always place them in today's column (index 4)
      distribution[4].push(task);
    }
  });
  
  return distribution;
};


const CalendarGrid = ({ projectId, weekOffset = 0 }: CalendarGridProps) => {
  // Use the unified Kanban context instead of fetching data
  const { tasks: kanbanTasks, isLoading, currentProjectId } = useKanban();

  const [taskDistribution, setTaskDistribution] = useState<{[key: number]: Task[]}>({0: [], 1: [], 2: [], 3: [], 4: []});
  const [capacityUsage, setCapacityUsage] = useState<number[]>([0, 0, 0, 0, 0]);
  const [dates, setDates] = useState(getDates(weekOffset));
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(true);
  const { userId } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Helper function to check if task is assigned to current user
  const isTaskAssignedToMe = (task: Task, userId: string | null): boolean => {
    if (!userId || !task.assignee) return false;

    // Si assignee es del tipo Workinguser[]
    if (Array.isArray(task.assignee)) {
      return task.assignee.some(user => Array.isArray(user.users) && user.users[0] === userId);
    }

    // Fallback si viene como string (muy raro en tu caso)
    if (typeof task.assignee === 'string') {
      return task.assignee === userId;
    }

    return false;
  };

  // Get all tasks from kanban context (exclude stories)
  const allTasks = useMemo(() => {
    if (!kanbanTasks) return [];
    
    return [
      ...kanbanTasks.todo,
      ...kanbanTasks.inprogress,
      ...kanbanTasks.inreview,
      ...kanbanTasks.done
    ].filter(item => {
      // Filter to only include Tasks (not Stories)
      // Tasks have user_story_id while Stories have tasklist
      return 'user_story_id' in item || 
             ('assignee' in item && !('tasklist' in item));
    }) as Task[];
  }, [kanbanTasks]);

  // Function to filter tasks based on search term, status, and user assignment
  const filterTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter ? task.status_khanban === statusFilter : true;
      
      const matchesUser = showOnlyMyTasks ? isTaskAssignedToMe(task, userId) : true;
      
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [allTasks, searchTerm, statusFilter, showOnlyMyTasks, userId]);

  // Check if we're viewing the right project
  const isCorrectProject = !projectId || projectId === currentProjectId;

  // Update dates when weekOffset changes
  useEffect(() => {
    setDates(getDates(weekOffset));
  }, [weekOffset]);

  // Effect to update task distribution when filters change
  useEffect(() => {
    if (filterTasks.length >= 0) {
      const distribution = distributeTasksByCompletionDate(filterTasks, weekOffset);
      setTaskDistribution(distribution);
      
      // Calculate capacity usage for each day
      const dailyCapacity = calculateDailyCapacity();
      const usage = Object.values(distribution).map(dayTasks => {
        const totalPoints = dayTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
        return Math.min(Math.round((totalPoints / dailyCapacity) * 100), 100);
      });
      
      setCapacityUsage(usage);
    }
  }, [filterTasks, weekOffset, dates]);

  // Get status color for task card border
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'border-purple-500';
      case 'To Do': return 'border-blue-500';
      case 'In Review': return 'border-yellow-500';
      case 'Done': return 'border-green-500';
      case 'Backlog': return 'border-gray-500';
      default: return 'border-gray-500';
    }
  };

  // Get background color based on status
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-purple-50';
      case 'To Do': return 'bg-blue-50';
      case 'In Review': return 'bg-yellow-50';
      case 'Done': return 'bg-green-50';
      case 'Backlog': return 'bg-gray-50';
      default: return 'bg-gray-50';
    }
  };
  
  // Get text color for the tag based on status
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-purple-800';
      case 'To Do': return 'text-blue-800';
      case 'In Review': return 'text-yellow-800';
      case 'Done': return 'text-green-800';
      case 'Backlog': return 'text-gray-800';
      default: return 'text-gray-800';
    }
  };

  // Don't render anything if we're looking at a different project
  if (!isCorrectProject) {
    return null;
  }
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading sprint calendar...</div>;
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-700">
          {showOnlyMyTasks && userId ? "Showing only my tasks" : "Showing all team tasks"}
          {searchTerm && ` • Filtered by: "${searchTerm}"`}
          {statusFilter && ` • Status: ${statusFilter}`}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              aria-label="statusfilter"
              className="h-9 px-3 py-1 rounded border border-gray-300 text-sm bg-white"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showOnlyMyTasks} 
              onChange={() => setShowOnlyMyTasks(!showOnlyMyTasks)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Show only my tasks</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {dates.map((date, idx) => {
          const isCurrentDay = idx === 4 && weekOffset === 0;
          return (
            <div 
              key={idx} 
              className={`${styles.calendarDayHeader} ${isCurrentDay ? 'bg-purple-50 border border-purple-200' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className={isCurrentDay ? 'font-bold' : ''}>
                  {date.dayName} {date.dayNumber}
                  {isCurrentDay && <span className="ml-1 text-purple-700">(Today)</span>}
                </span>
                <span className="text-xs font-medium">
                  {capacityUsage[idx]}% capacity
                </span>
              </div>
              {/* Capacity bar */}
              <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div 
                  className={`h-1 rounded-full ${
                    isCurrentDay ? (
                      capacityUsage[idx] > 90 ? 'bg-red-500' : 
                      capacityUsage[idx] > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    ) : 'bg-gray-400' 
                  }`} 
                  style={{ width: `${capacityUsage[idx]}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-5 gap-2 h-96">
        {[...Array(5)].map((_, dayIndex) => {
          const isCurrentDay = dayIndex === 4 && weekOffset === 0;
          return (
            <div 
              key={dayIndex} 
              className={`shadow-sm border rounded-lg p-2 h-full overflow-y-auto ${
                isCurrentDay ? 'border-purple-300 bg-purple-50' : 'border-[#D3C7D3]'
              }`}
            >
              {taskDistribution[dayIndex]?.map((task) => (
                <CalendarTaskCard 
                  key={`task-${task.id}`}
                  title={task.title}
                  type={`${task.story_points} pts`}
                  time={task.status_khanban}
                  borderColor={getStatusColor(task.status_khanban)}
                  bgColor={getStatusBgColor(task.status_khanban)}
                  textColor={getStatusTextColor(task.status_khanban)}
                  assignee={convertAssigneeToWorkinguser(task.assignee)}
                />
              ))}
              {isCurrentDay && taskDistribution[dayIndex].length === 0 && (
                <div className="text-center p-4 text-gray-500 italic">
                  No active tasks for today
                </div>
              )}
              {!isCurrentDay && taskDistribution[dayIndex].length === 0 && (
                <div className="text-center p-4 text-gray-500 italic">
                  No tasks completed on this day
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CalendarGrid