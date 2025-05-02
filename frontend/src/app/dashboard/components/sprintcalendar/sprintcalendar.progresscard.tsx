import {styles} from "../../styles/calendarstyles"
import { Activity } from "lucide-react"
import { ProgressCard } from "../dashboard/dashboard.progresscard"
import { useEffect, useState } from "react"
import { Task } from "@/types/task"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

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

  // Data for the gauge chart
  const gaugeData = [
    { name: 'Completed', value: completionPercentage },
    { name: 'Remaining', value: 100 - completionPercentage }
  ]

  // Colors for the gauge chart
  const COLORS = ['#4a2b4a', '#e5e7eb']

  return (
    <ProgressCard
      title="Sprint Progress"
      icon={<Activity className={styles.icon} />}
    >
      <div className="space-y-4">
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
                  value={`${completionPercentage}%`}
                  position="center"
                  fill="#888888"
                  style={{ fontSize: '28px', fontWeight: 'bold' }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.progressText}>
          <span>{completionPercentage}% completed</span>
          <span>{completedTasks} of {totalTasks} tasks</span>
        </div>
      </div>
    </ProgressCard>
  )
}

export default SprintProgressCard