import CalendarTaskCard from "./sprintcalendar.taskcard"
import {styles} from "../../styles/calendarstyles"
import { useEffect, useState } from "react"
import { Task } from "@/types/task"

// Modified to only include weekdays
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"]

const today = new Date()

// Helper function to get the current week's Monday as the starting point
const getMonday = () => {
  const day = today.getDay()
  // If Sunday (0) or Saturday (6), find the next Monday
  if (day === 0) {
    return new Date(today.setDate(today.getDate() + 1))
  } else if (day === 6) {
    return new Date(today.setDate(today.getDate() + 2))
  }
  // Otherwise, go back to the most recent Monday
  return new Date(today.setDate(today.getDate() - day + 1))
}

const monday = getMonday()

const getDayAndDate = (offset: number) => {
  const date = new Date(monday)
  date.setDate(monday.getDate() + offset)
  // We're using fixed workdays now (Monday to Friday)
  const dayName = daysOfWeek[offset]
  const dayNumber = date.getDate()
  return { dayName, dayNumber }
}

interface CalendarGridProps {
  projectId?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Calculate capacity per day (story points)
// This is a simple implementation - in a real app, you'd factor in team members' availability
const calculateDailyCapacity = (teamSize = 3) => {
  // Assuming each team member can handle 3 story points per day on average
  return teamSize * 3;
}

// Helper function to distribute tasks across days based on capacity
const distributeTasksByCapacity = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) return { 0: [], 1: [], 2: [], 3: [], 4: [] };
  
  // Filter out Done tasks
  const activeTasks = tasks.filter(task => 
    task.status_khanban !== 'Done' && task.status_khanban !== 'Backlog'
  );
  
  // Sort tasks by priority and status
  const sortedTasks = [...activeTasks].sort((a, b) => {
    // Prioritize In Progress tasks
    if (a.status_khanban === 'In Progress' && b.status_khanban !== 'In Progress') return -1;
    if (b.status_khanban === 'In Progress' && a.status_khanban !== 'In Progress') return 1;
    
    // Then by priority
    const priorityWeight = (p: string) => p === 'High' ? 3 : p === 'Medium' ? 2 : 1;
    return priorityWeight(b.priority) - priorityWeight(a.priority);
  });
  
  // Calculate daily capacity
  const dailyCapacity = calculateDailyCapacity();
  
  // Initialize distribution
  const distribution: {[key: number]: Task[]} = {0: [], 1: [], 2: [], 3: [], 4: []};
  
  // Track remaining capacity for each day
  const remainingCapacity = [dailyCapacity, dailyCapacity, dailyCapacity, dailyCapacity, dailyCapacity];
  
  // First pass: assign In Progress tasks to earlier days
  sortedTasks.forEach(task => {
    if (task.status_khanban === 'In Progress') {
      // Find the earliest day with enough capacity
      for (let i = 0; i < 5; i++) {
        if (remainingCapacity[i] >= task.story_points) {
          distribution[i].push(task);
          remainingCapacity[i] -= task.story_points;
          return; // Task assigned, move to next
        }
      }
      // If we get here, no day had enough capacity, put in first day anyway
      distribution[0].push(task);
    }
  });
  
  // Second pass: distribute remaining tasks
  sortedTasks.forEach(task => {
    if (task.status_khanban !== 'In Progress') {
      // Find the day with the most remaining capacity
      let bestDay = 0;
      for (let i = 0; i < 5; i++) {
        if (remainingCapacity[i] > remainingCapacity[bestDay]) {
          bestDay = i;
        }
      }
      
      distribution[bestDay].push(task);
      remainingCapacity[bestDay] -= task.story_points;
    }
  });
  
  return distribution;
};

const CalendarGrid = ({ projectId }: CalendarGridProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskDistribution, setTaskDistribution] = useState<{[key: number]: Task[]}>({0: [], 1: [], 2: [], 3: [], 4: []});
  const [capacityUsage, setCapacityUsage] = useState<number[]>([0, 0, 0, 0, 0]);
  
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
        
        const fetchedTasks: Task[] = await response.json();
        setTasks(fetchedTasks);
        
        // Distribute tasks across days
        const distribution = distributeTasksByCapacity(fetchedTasks);
        setTaskDistribution(distribution);
        
        // Calculate capacity usage for each day
        const dailyCapacity = calculateDailyCapacity();
        const usage = Object.entries(distribution).map(([day, dayTasks]) => {
          const pointsUsed = dayTasks.reduce((sum, task) => sum + task.story_points, 0);
          return Math.min(100, Math.round((pointsUsed / dailyCapacity) * 100));
        });
        
        setCapacityUsage(usage);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);
  
  // Get status color for task card border
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'border-yellow-500';
      case 'To Do': return 'border-blue-500';
      case 'In Review': return 'border-orange-500';
      case 'Done': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading sprint calendar...</div>;
  }
  
  return (
    <>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {[...Array(5)].map((_, idx) => {
          const { dayName, dayNumber } = getDayAndDate(idx);
          return (
            <div key={idx} className={styles.calendarDayHeader}>
              <div className="flex justify-between items-center">
                <span>{dayName} {dayNumber}</span>
                <span className="text-xs font-medium">
                  {capacityUsage[idx]}% capacity
                </span>
              </div>
              {/* Capacity bar */}
              <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                <div 
                  className={`h-1 rounded-full ${
                    capacityUsage[idx] > 90 ? 'bg-red-500' : 
                    capacityUsage[idx] > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} 
                  style={{ width: `${capacityUsage[idx]}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-5 gap-2 h-96">
        {[...Array(5)].map((_, dayIndex) => (
          <div key={dayIndex} className="shadow-sm border border-[#D3C7D3] rounded-lg p-2 h-full overflow-y-auto">
            {taskDistribution[dayIndex]?.map((task) => (
              <CalendarTaskCard 
                key={`task-${task.id}`}
                title={task.title}
                type={`${task.story_points} pts`}
                time={task.status_khanban}
                borderColor={getStatusColor(task.status_khanban)}
                assignee={task.assignee}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default CalendarGrid