import { Users } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { Progress } from "@/components/progress"
import { styles } from "../../styles/calendarstyles"
import { useMemo } from "react"
import { useKanban } from "@/contexts/unifieddashboardcontext"

// Interface for user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
}

// Interface for Workinguser
interface Workinguser {
  id: string;
  name: string;
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
  // Use the unified Kanban context instead of fetching data
  const { tasks, isLoading, currentProjectId } = useKanban();

  // Helper function to get user info from assignee
  const getUserFromAssignee = (assignee: Workinguser[] | null | undefined): { id: string; name: string } => {
    if (!assignee || !Array.isArray(assignee) || assignee.length === 0) {
      return { id: 'unassigned', name: 'Unassigned' };
    }
    
    const firstUser = assignee[0];
    return { id: firstUser.id, name: firstUser.name };
  };

  // Memoized team workload data processed from unified context
  const users = useMemo(() => {
    if (!tasks) return [];

    // Get all tasks from all columns
    const allTasks = [
      ...tasks.todo,
      ...tasks.inprogress,
      ...tasks.inreview,
      ...tasks.done
    ].filter(task => 'assignee' in task && task.assignee);

    // Group tasks by assignee
    const tasksByAssignee: Record<string, any[]> = {};
    
    allTasks.forEach(task => {
      if (!task.assignee) return;
      
      const user = getUserFromAssignee(task.assignee);
      const userId = user.id;
      
      if (!tasksByAssignee[userId]) {
        tasksByAssignee[userId] = [];
      }
      
      tasksByAssignee[userId].push(task);
    });

    // Create user workload objects
    return Object.entries(tasksByAssignee).map(([userId, tasks]) => {
      const completedTasks = tasks.filter(task => task.status_khanban === 'Done').length;
      const totalTasks = tasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Get user info from the assignee array
      const user = getUserFromAssignee(tasks[0].assignee);
      
      return {
        id: userId,
        name: user.name,
        progress,
        tasks: `${completedTasks}/${totalTasks} Tasks`,
        completedTasks,
        totalTasks
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
          <div key={user.id}>
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

export default TeamWorkloadCard;