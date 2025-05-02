import {styles} from "../../styles/calendarstyles"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { ListChecks } from "lucide-react"
import { useEffect, useState } from "react"
import { Task } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface TaskStatusCardProps {
  projectId?: string
}

const TaskStatusCard = ({ projectId }: TaskStatusCardProps) => {
  const [statusCounts, setStatusCounts] = useState({
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        // Get project ID from localStorage if not provided as prop
        const currentProjectId = projectId || localStorage.getItem("currentProjectId")
        
        if (!currentProjectId) {
          console.error("No project ID available")
          return
        }

        const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks`)
        if (!response.ok) {
          throw new Error("Failed to fetch tasks")
        }
        
        const tasks: Task[] = await response.json()
        
        // Count tasks by status
        const counts = {
          todo: 0,
          inProgress: 0,
          inReview: 0,
          done: 0
        }
        
        tasks.forEach(task => {
          if (task.status_khanban === 'To Do') {
            counts.todo++
          } else if (task.status_khanban === 'In Progress') {
            counts.inProgress++
          } else if (task.status_khanban === 'In Review') {
            counts.inReview++
          } else if (task.status_khanban === 'Done') {
            counts.done++
          }
        })
        
        setStatusCounts(counts)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [projectId])

  return (
    <ProgressCard
      title="Task Status"
      icon={<ListChecks className={styles.icon} />} 
    >
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
    </ProgressCard>
  )
}

export default TaskStatusCard
