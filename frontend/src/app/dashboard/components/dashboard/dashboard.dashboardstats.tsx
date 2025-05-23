import { ProgressCard } from "./dashboard.progresscard"
import { Calendar, Clock, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
import { BurndownChart } from "@/components/burndownchart"
import { useEffect, useState, useMemo, Suspense } from "react"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { useAvatar } from "@/contexts/AvatarContext"
import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'

// Importación dinámica del componente Three.js para evitar errores de SSR
const DynamicAnimatedAvatar = dynamic(
  () => import('./avatarConfig/avatarAnimationsDashboard').then((mod) => mod.AnimatedAvatar),
  { ssr: false }
)

type Props = {
  onViewSprintDetails: () => void;
  onViewCalendar?: () => void;
}

interface BurndownDataPoint {
  day: string
  date: string
  Remaining: number
  Ideal: number
  Completed: number
  CompletedCumulative: number
}

interface SprintInfo {
  name: string
  start_date: string
  end_date: string
  total_story_points: number
  duration_days: number
}

interface BurndownData {
  sprint_info: SprintInfo
  chart_data: BurndownDataPoint[]
}

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',  
    month: 'long',    
    day: 'numeric',   
})

const DashboardStats = ({ onViewSprintDetails, onViewCalendar}: Props) => {
  const [burndownChartData, setBurndownChartData] = useState<BurndownDataPoint[]>([])
  const [actualPercentage, setActualPercentage] = useState(0)
  const [idealPercentage, setIdealPercentage] = useState(0)
  const [sprintVelocity, setSprintVelocity] = useState(0)
  const [taskCompletion, setTaskCompletion] = useState(0)
  const [daysLeft, setDaysLeft] = useState(0)
  const [taskStadistics, setTaskStadistics] = useState({
    completedTasks: 0,
    inProgressTasks: 0,
    totalTasks: 0,
    completionPercentage: 0
  })

  const { 
    burndownData, 
    teamMembers, 
    velocityData,
    refreshBurndownData, 
    refreshVelocityData 
  } = useSprintDataContext()
  
  const { tasks, refreshKanban } = useKanban()

  const safeNumber = (n: any, fallback = 0) =>
    typeof n === "number" && !isNaN(n) && isFinite(n) ? n : fallback;

  useEffect(() => {
  if (!burndownData || !burndownData.chart_data || !burndownData.sprint_info) {
    setBurndownChartData([])
    setActualPercentage(0)
    setIdealPercentage(0)
    return
  }

  setBurndownChartData(burndownData.chart_data)

  const initial = burndownData.sprint_info.total_story_points
  const last = burndownData.chart_data[burndownData.chart_data.length - 1]

  if (initial > 0 && last) {
    setActualPercentage(Math.round(((initial - last.Remaining) / initial) * 100))
    setIdealPercentage(Math.round(((initial - last.Ideal) / initial) * 100))
  } else {
    setActualPercentage(0)
    setIdealPercentage(0)
  }
}, [burndownData])

  useEffect(() => {
  if (!Array.isArray(velocityData) || velocityData.length === 0) {
    setSprintVelocity(0)
    setTaskCompletion(0)
    return
  }

  try {
    const recentVelocity = velocityData.slice(-3)
    const avgVelocity = recentVelocity.reduce((sum, sprint) => sum + sprint.Actual, 0) / recentVelocity.length
    setSprintVelocity(Math.round(avgVelocity))

    const latestSprint = velocityData[velocityData.length - 1]
    const completion = latestSprint.Planned > 0
      ? (latestSprint.Actual / latestSprint.Planned) * 100
      : 0

    setTaskCompletion(Math.round(completion))
  } catch (error) {
    console.error("Error processing velocity data:", error)
    setSprintVelocity(0)
    setTaskCompletion(0)
  }
}, [velocityData])

  const taskStats = useMemo(() => {
    if (!tasks) return { completedTasks: 0, inProgressTasks: 0, totalTasks: 0, completionPercentage: 0 }
    
    const done = tasks.done?.length || 0
    const inProgress = tasks.inprogress?.length || 0
    const review = tasks.inreview?.length || 0
    const todo = tasks.todo?.length || 0
    
    const totalTasks = done + inProgress + review + todo
    const completionPercentage = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0
    
    return {
      completedTasks: done,
      inProgressTasks: inProgress, 
      totalTasks,
      completionPercentage
    }
  }, [tasks])
  
  localStorage.setItem("taskStadistics", JSON.stringify(taskStats))

  // Function to fetch or calculate sprint dates
  const calculateSprintDates = () => {
    // Try to get dates from context first
    if (burndownData?.sprint_info.duration_days) {
      const sprintStartDate = localStorage.getItem("sprint_start_date")
      
      if (sprintStartDate) {
        const startDate = new Date(sprintStartDate)
        const currentDate = new Date()
        const endDate = new Date(startDate)
        
        endDate.setDate(startDate.getDate() + burndownData.sprint_info.duration_days)
        
        const msPerDay = 1000 * 60 * 60 * 24
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / msPerDay))
        
        setDaysLeft(daysRemaining)
      }
    }
  }

  useEffect(() => {
    calculateSprintDates()
  }, [burndownData])

  useEffect(() => {
    let isActive = true
    
    const loadData = async () => {
      try {
        await refreshBurndownData()
        
        if (isActive) {
          await new Promise(resolve => setTimeout(resolve, 100)) 
          await refreshVelocityData()
        }
        
        if (isActive) {
          await new Promise(resolve => setTimeout(resolve, 100)) 
          await refreshKanban()
        }
      } catch (error) {
        console.error("Error refreshing data:", error)
      }
    }
    
    loadData()
    
    return () => { isActive = false }
  }, []) 

  const { avatarUrl, gender } = useAvatar()
  
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
            <BurndownChart data={burndownChartData} height={150}/>
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
              <div className={s.sprintStats}>{safeNumber(taskStats.completionPercentage)}%</div>
            </div>
            <div className="mt-2">
              <Progress 
                value={safeNumber(taskStats.completionPercentage)} 
                className={`${s.progressBar} mt-2 mb-2`} 
                indicatorClassName={s.progressBarIndicator} 
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
            
              <div className={s.statCard}>
                <Clock className={s.statIcon} />
                <div className={s.statValue}>{safeNumber(daysLeft)}</div>
                <div className={s.statLabel}>Days Left</div>
              </div>
  
              <div className={s.statCard}>
                <BarChart2 className={s.statIcon} />
                <div className={s.statValue}>{safeNumber(taskStats.completionPercentage)}%</div>
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
            {avatarUrl ? (
              <div className={s.profileCircle} style={{ 
                backgroundColor: "#4891E0", 
                border: "6px solid #C7A0B8" // Contorno añadido de color C7A0B8
              }}>
                {/* Usar Canvas para renderizar el avatar 3D con Three.js */}
                <div style={{ width: "100%", height: "100%" }}>
                  <Canvas camera={{ position: [0, 0.4, 3.5], fov: 25 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[0, 0, 4]} intensity={1} />
                    <Suspense fallback={null}>
                      <DynamicAnimatedAvatar
                        avatarUrl={avatarUrl}
                        gender={gender === 'female' ? 'feminine' : 'masculine'}
                        minDelay={3000}
                        maxDelay={8000}
                        idleTime={5000}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              </div>
            ) : (
              // Fallback a SVG si no hay avatar
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
            )}
            <div className={s.emojiBadge}>😄</div>
          </div>
        </div>
        
        <div className={`${s.progressCard} flex flex-col space-y-4`}>
          <div className={s.taskGrid}>
            <div className={s.statCard}>
              <div className={s.statValue}>{safeNumber(taskStats.completedTasks)}</div>
              <div className={s.statLabel}>Completed Tasks</div>
            </div>

            <div className={s.statCard}>
              <div className={s.statValue}>{safeNumber(taskStats.inProgressTasks)}</div>
              <div className={s.statLabel}>In Progress</div>
            </div>
          </div>
        </div>
      </ProgressCard>
    </div>
  );
}

export default DashboardStats;