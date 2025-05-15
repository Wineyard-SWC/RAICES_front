import { styles } from "../../styles/calendarstyles"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { ListChecks } from "lucide-react"
import { useMemo } from "react"
import { useKanban } from "@/contexts/unifieddashboardcontext"

interface TaskStatusCardProps {
  projectId?: string
}

const TaskStatusCard = ({ projectId }: TaskStatusCardProps) => {
  const { tasks, isLoading, currentProjectId } = useKanban()

  // Calculate task counts from the unified context
  const statusCounts = useMemo(() => {
    // Check if we have tasks data
    if (!tasks) {
      return {
        todo: 0,
        inProgress: 0,
        inReview: 0,
        done: 0
      }
    }

    // Count tasks by status directly from the organized columns
    return {
      todo: tasks.todo?.length || 0,
      inProgress: tasks.inprogress?.length || 0,
      inReview: tasks.inreview?.length || 0,
      done: tasks.done?.length || 0
    }
  }, [tasks])

  // Check if we're viewing the right project
  const isCorrectProject = !projectId || projectId === currentProjectId

  // Don't render anything if we're looking at a different project
  if (!isCorrectProject) {
    return null
  }

  return (
    <ProgressCard
      title="Task Status"
      icon={<ListChecks className={styles.icon} />}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <span className="text-gray-500">Loading tasks...</span>
        </div>
      ) : (
        <div className={styles.taskStatusGrid}>
          <div className="bg-blue-100 rounded flex items-center justify-center py-2">
            <span className="text-sm font-medium text-blue-800">{statusCounts.todo} To Do</span>
          </div>
          <div className="bg-purple-100 rounded flex items-center justify-center py-2">
            <span className="text-sm font-medium text-purple-800">{statusCounts.inProgress} In Progress</span>
          </div>
          <div className="bg-yellow-100 rounded flex items-center justify-center py-2">
            <span className="text-sm font-medium text-yellow-800">{statusCounts.inReview} Review</span>
          </div>
          <div className="bg-green-100 rounded flex items-center justify-center py-2">
            <span className="text-sm font-medium text-green-800">{statusCounts.done} Done</span>
          </div>
        </div>
      )}
    </ProgressCard>
  )
}

export default TaskStatusCard