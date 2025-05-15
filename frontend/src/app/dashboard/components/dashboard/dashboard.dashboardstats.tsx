import { ProgressCard } from "./dashboard.progresscard"
import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { BurndownChart } from "@/components/burndownchart"
import { useEffect, useState, useMemo } from "react"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"

type Props = {
  onViewSprintDetails: () => void;
  onViewCalendar?: () => void;
}

interface BurndownDataPoint {
  day: string
  Remaining: number
  Ideal: number
}

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',  
    month: 'long',    
    day: 'numeric',   
})

const DashboardStats = ({ onViewSprintDetails, onViewCalendar}: Props) => {
  // State for burndown chart
  const [burndownChartData, setBurndownChartData] = useState<BurndownDataPoint[]>([])
  const [actualPercentage, setActualPercentage] = useState(0)
  const [idealPercentage, setIdealPercentage] = useState(0)
  
  // State for sprint progress
  const [sprintVelocity, setSprintVelocity] = useState(0)
  const [taskCompletion, setTaskCompletion] = useState(0)
  const [daysLeft, setDaysLeft] = useState(0)

  // Use the sprint data context to get the data
  const { 
    burndownData, 
    teamMembers, 
    velocityData,
    refreshBurndownData, 
    refreshVelocityData 
  } = useSprintDataContext()
  
  // Use the unified Kanban context instead of backlog context
  const { tasks, refreshKanban } = useKanban()

  // Process burndown data for chart
  useEffect(() => {
    if (!burndownData) return
  
    try {
      const { duration_days, total_story_points } = burndownData
      const totalDays = duration_days + 1
      const idealDropPerDay = total_story_points / duration_days
    
      const generatedData: BurndownDataPoint[] = []
      for (let day = 0; day < totalDays; day++) {
        const ideal = total_story_points - idealDropPerDay * day
        generatedData.push({
          day: `Day ${day}`,
          Ideal: parseFloat(ideal.toFixed(2)),
          Remaining: total_story_points, 
        })
      }
    
      setBurndownChartData(generatedData)
      
      // Calculate percentages
      const initial = total_story_points
      if (generatedData.length > 0) {
        const last = generatedData[generatedData.length - 1]
        setActualPercentage(Math.round(((initial - last.Remaining) / initial) * 100))
        setIdealPercentage(Math.round(((initial - last.Ideal) / initial) * 100))
      }

      // Calculate days left
      const sprintStartDate = localStorage.getItem("sprint_start_date")
      if (sprintStartDate) {
        const startDate = new Date(sprintStartDate)
        const currentDate = new Date()
        const endDate = new Date(startDate)
        
        // Add duration_days to startDate to get endDate
        endDate.setDate(startDate.getDate() + duration_days)
        
        // Calculate days remaining
        const msPerDay = 1000 * 60 * 60 * 24
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / msPerDay))
        
        setDaysLeft(daysRemaining)
      } else {
        // Fallback if no start date is found
        setDaysLeft(duration_days)
      }
    } catch (error) {
      console.error("Error processing burndown data:", error)
    }
  }, [burndownData])

  // Process velocity data
  useEffect(() => {
    if (!velocityData || velocityData.length === 0) return

    try {
      // Calculate average velocity from last 3 sprints
      const recentVelocity = velocityData.slice(-3)
      const avgVelocity = recentVelocity.reduce((sum, sprint) => sum + sprint.Actual, 0) / recentVelocity.length
      setSprintVelocity(Math.round(avgVelocity))
      
      // Get task completion from localStorage or calculate from recent sprint
      const storedCompletion = parseInt(localStorage.getItem("sprint_task_completion") || "0")
      if (storedCompletion) {
        setTaskCompletion(storedCompletion)
      } else if (velocityData.length > 0) {
        const latestSprint = velocityData[velocityData.length - 1]
        const completion = latestSprint.Actual / latestSprint.Planned * 100
        setTaskCompletion(Math.round(completion))
      }
    } catch (error) {
      console.error("Error processing velocity data:", error)
    }
  }, [velocityData])

  // Calculate task statistics from the TaskColumns
  const taskStats = useMemo(() => {
    if (!tasks) return { completedTasks: 0, inProgressTasks: 0, totalTasks: 0, completionPercentage: 0 }
    
    // Count tasks in each column
    const done = tasks.done?.length || 0
    const inProgress = tasks.inprogress?.length || 0
    const review = tasks.inreview?.length || 0
    const todo = tasks.todo?.length || 0
    
    const totalTasks = done + inProgress + review + todo
    const completionPercentage = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0
    
    return {
      completedTasks: done,
      inProgressTasks: inProgress, // Counting both in progress and review as active tasks
      totalTasks,
      completionPercentage
    }
  }, [tasks])
  
  localStorage.setItem("taskStadistics", JSON.stringify(taskStats))

  // Function to fetch or calculate sprint dates
  const calculateSprintDates = () => {
    // Try to get dates from context first
    if (burndownData?.duration_days) {
      const sprintStartDate = localStorage.getItem("sprint_start_date")
      
      if (sprintStartDate) {
        const startDate = new Date(sprintStartDate)
        const currentDate = new Date()
        const endDate = new Date(startDate)
        
        // Add duration_days to startDate to get endDate
        endDate.setDate(startDate.getDate() + burndownData.duration_days)
        
        // Calculate days remaining
        const msPerDay = 1000 * 60 * 60 * 24
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / msPerDay))
        
        setDaysLeft(daysRemaining)
      }
    }
  }
  
  // Call this function initially and whenever burndownData changes
  useEffect(() => {
    calculateSprintDates()
  }, [burndownData])

  // Refresh data when component mounts - IMPROVED VERSION TO AVOID CIRCULAR DEPENDENCY
  useEffect(() => {
    let isActive = true
    
    const loadData = async () => {
      try {
        // Stagger the calls to avoid timing issues
        await refreshBurndownData()
        
        if (isActive) {
          await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
          await refreshVelocityData()
        }
        
        if (isActive) {
          await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
          await refreshKanban()
        }
      } catch (error) {
        console.error("Error refreshing data:", error)
      }
    }
    
    loadData()
    
    // Cleanup function to prevent state updates if component unmounts
    return () => { isActive = false }
  }, []) // Remove all dependencies to avoid infinite loop

  return (
    <div className={s.container}>
      <ProgressCard
        title="Calendar & Burndown"
        icon={<Calendar className={s.icon} />}
        footer={
          <Button variant="default" 
          className={`${s.button} mt-4`}
          onClick={onViewCalendar}
          >
            View Calendar
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h3 className="text-gray-700">{todayString}</h3>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Burndown Chart</h4>
            <BurndownChart data={burndownChartData} height={120} simple />
          </div>

          <div className="space-y-2">
            <div className={s.progressText}>
              <span>Actual: {actualPercentage}%</span>
              <span>Ideal: {idealPercentage}%</span>
            </div>
          </div>
        </div>
      </ProgressCard>

      <ProgressCard
        title="Sprint Progress"
        icon={<BarChart2 className={s.icon} />}
        footer={
          <Button
            variant="default"
            className={`${s.button} mt-auto`}
            onClick={onViewSprintDetails}
          >
            View Sprint Details
          </Button>
        }
      >
        <div className={`${s.progressCard} flex flex-col space-y-4`}>
          <div className="mb-4">
            <div className={s.sprintLabel}>Sprint Velocity</div>
            <Progress 
              value={sprintVelocity > 0 ? Math.min(sprintVelocity, 100) : 0} 
              className={`${s.progressBar} mt-2 mb-2`} 
              indicatorClassName={s.progressBarIndicator} 
            />
            <div className={s.sprintStats}>
              <span>{sprintVelocity > 0 ? sprintVelocity : 0} SP/Sprint</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <div className={s.sprintLabel}>Task Completion</div>
              <div className={s.sprintStats}>{taskStats.completionPercentage}%</div>
            </div>
            <div className="mt-2">
              <Progress 
                value={taskStats.completionPercentage} 
                className={`${s.progressBar} mt-2 mb-2`} 
                indicatorClassName={s.progressBarIndicator} 
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
            
              <div className={s.statCard}>
                <Clock className={s.statIcon} />
                <div className={s.statValue}>{daysLeft}</div>
                <div className={s.statLabel}>Days Left</div>
              </div>
  
              <div className={s.statCard}>
                <BarChart2 className={s.statIcon} />
                <div className={s.statValue}>{taskStats.completionPercentage}%</div>
                <div className={s.statLabel}>Completion</div>
              </div>
            </div>
          </div>
        </div>
      </ProgressCard>

      <ProgressCard
        title="Personal Progress"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={s.svgIcon}
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        }
      >
        <div className="flex justify-center mb-4">
          <div className={s.profileWrapper}>
            <div className={s.profileCircle}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-16 w-16 text-white"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className={s.emojiBadge}>😄</div>
          </div>
        </div>
        
        <div className={`${s.progressCard} flex flex-col space-y-4`}>
          <div className={s.taskGrid}>
            <div className={s.statCard}>
              <div className={s.statValue}>{taskStats.completedTasks}</div>
              <div className={s.statLabel}>Completed Tasks</div>
            </div>
  
            <div className={s.statCard}>
              <div className={s.statValue}>{taskStats.inProgressTasks}</div>
              <div className={s.statLabel}>In Progress</div>
            </div>
          </div>
        </div>
      </ProgressCard>
    </div>
  );
}

export default DashboardStats;