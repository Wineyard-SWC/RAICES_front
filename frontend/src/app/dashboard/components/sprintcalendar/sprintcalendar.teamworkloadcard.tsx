import { Users } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { Progress } from "@/components/progress"
import {styles} from "../../styles/calendarstyles"
import { useEffect, useState } from "react"
import { Task } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Interface for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
}

interface UserWorkload {
  id: string;
  name: string;
  progress: number;
  tasks: string;
  completedTasks: number;
  totalTasks: number;
}

interface TeamWorkloadCardProps {
  projectId?: string;
}

const TeamWorkloadCard = ({ projectId }: TeamWorkloadCardProps) => {
  const [users, setUsers] = useState<UserWorkload[]>([]);
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
        
        // Create user workload objects with user data from API
        const workloadPromises = Object.entries(tasksByAssignee).map(async ([userId, tasks]) => {
          const completedTasks = tasks.filter(task => task.status_khanban === 'Done').length;
          const totalTasks = tasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          // Fetch user data
          const userData = await fetchUserData(userId);
          
          return {
            id: userId,
            name: userData?.name || userId,
            progress,
            tasks: `${completedTasks}/${totalTasks} Tasks`,
            completedTasks,
            totalTasks
          };
        });
        
        const workloadData = await Promise.all(workloadPromises);
        setUsers(workloadData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  if (loading) {
    return (
      <ProgressCard
        title="Team Workload"
        icon={<Users className={styles.icon} />}
      >
        <div className="p-4 text-center text-gray-500">Loading team workload...</div>
      </ProgressCard>
    );
  }

  if (users.length === 0) {
    return (
      <ProgressCard
        title="Team Workload"
        icon={<Users className={styles.icon} />}
      >
        <div className="p-4 text-center text-gray-500">No team members with assigned tasks</div>
      </ProgressCard>
    );
  }

  return (
    <ProgressCard
      title="Team Workload"
      icon={<Users className={styles.icon} />}
    >
      <div className="space-y-4">
        {users.map((user, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                  <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <span className="text-sm text-gray-600">{user.tasks}</span>
            </div>

            {/* Progress bar */}
            <Progress
              value={user.progress}
              className={styles.progressBar}
              indicatorClassName={styles.progressBarIndicator}
            />
          </div>
        ))}
      </div>
    </ProgressCard>
  );
};

export default TeamWorkloadCard
