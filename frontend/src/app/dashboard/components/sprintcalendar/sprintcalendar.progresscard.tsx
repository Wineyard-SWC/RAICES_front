import { styles } from "../../styles/calendarstyles"
import { Activity } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { useMemo } from "react"
import { Task } from "@/types/task"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import { useKanban } from "@/contexts/unifieddashboardcontext"

interface SprintProgressCardProps {
  projectId?: string
}

const SprintProgressCard = ({ projectId }: SprintProgressCardProps) => {
  // Use the unified Kanban context instead of fetching data
  const { tasks, isLoading, currentProjectId } = useKanban()

  // Calculate task stats using useMemo
  const taskStats = useMemo(() => {
    if (!tasks) return { completedTasks: 0, totalTasks: 0, completionPercentage: 0 }

    // Get all tasks (exclude stories) from all columns
    const allTasksAndStories = [
      ...tasks.todo,
      ...tasks.inprogress,
      ...tasks.inreview,
      ...tasks.done
    ]

    // Filter to only include Tasks (not Stories)
    const allTasks = allTasksAndStories.filter(item => {
      // Tasks have user_story_id while Stories have tasklist
      return 'user_story_id' in item || 
             ('assignee' in item && !('tasklist' in item));
    }) as Task[]

    // Count only tasks with status "Done" as completed tasks
    const doneTasks = allTasks.filter(task => task.status_khanban === 'Done')

    // Total tasks includes all task statuses
    const totalTasks = allTasks.length
    const completedTasks = doneTasks.length

    const completionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0

    return {
      completedTasks,
      totalTasks,
      completionPercentage
    }
  }, [tasks])

  // Check if we're viewing the right project
  const isCorrectProject = !projectId || projectId === currentProjectId

  // Don't render anything if we're looking at a different project
  if (!isCorrectProject) {
    return null
  }

  // Data for the gauge chart
  const gaugeData = [
    { name: 'Completed', value: taskStats.completionPercentage },
    { name: 'Remaining', value: 100 - taskStats.completionPercentage }
  ]

  // Colors for the gauge chart
  const COLORS = ['#4a2b4a', '#e5e7eb']

  return (
    <ProgressCard
      title="Sprint Progress"
      icon={<Activity className={styles.icon} />}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="w-full h-52 flex items-center justify-center">
            <span className="text-gray-500">Loading sprint progress...</span>
          </div>
        ) : (
          <>
            {/* Gauge Chart */}
            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="65%"
                    outerRadius="95%"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label
                      value={`${taskStats.completionPercentage}%`}
                      position="center"
                      fill="#888888"
                      style={{ fontSize: '28px', fontWeight: 'bold' }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.progressText}>
              <span>{taskStats.completionPercentage}% completed</span>
              <span>{taskStats.completedTasks} of {taskStats.totalTasks} tasks</span>
            </div>
          </>
        )}
      </div>
    </ProgressCard>
  )
}

export default SprintProgressCard