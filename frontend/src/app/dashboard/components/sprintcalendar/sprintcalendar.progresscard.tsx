import {styles} from "../../styles/calendarstyles"
import { Activity } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { Progress } from "@/components/progress"
import { useEffect, useState } from "react"
import { Task } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface SprintProgressCardProps {
  projectId?: string
}

const SprintProgressCard = ({ projectId }: SprintProgressCardProps) => {
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
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
        
        // Count tasks with status "In Progress", "In Review", "To Do", and "Done" as the total
        const relevantTasks = tasks.filter(task => 
          task.status_khanban === 'In Progress' || 
          task.status_khanban === 'In Review' || 
          task.status_khanban === 'To Do' || 
          task.status_khanban === 'Done'
        )
        
        // Count only tasks with status "Done" as completed tasks
        const doneTasks = tasks.filter(task => task.status_khanban === 'Done')
        
        setTotalTasks(relevantTasks.length)
        setCompletedTasks(doneTasks.length)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [projectId])

  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0

  return (
    <ProgressCard
      title="Sprint Progress"
      icon={<Activity className={styles.icon} />}
    >
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress
            value={completionPercentage}
            className={styles.progressBar}
            indicatorClassName={styles.progressBarIndicator}
          />
          <div className={styles.progressText}>
            <span>{completionPercentage}% completed</span>
            <span>{completedTasks} of {totalTasks} tasks</span>
          </div>
        </div>
      </div>
    </ProgressCard>
  )
}

export default SprintProgressCard