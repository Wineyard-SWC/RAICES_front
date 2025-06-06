import { ProgressCard } from "./dashboard.progresscard"
import { Calendar, Clock, BarChart2, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import { dashboardStatsStyles as s } from "../../styles/dashboardstyles"
// import { BurndownChart } from "@/components/burndownchart"
import { useEffect, useState, useMemo, Suspense } from "react"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { useAvatar } from "@/contexts/AvatarContext"
import { useUserPermissions } from "@/contexts/UserPermissions"
import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import { EventCard } from "../sprintcalendar/EventCard"

// Importación dinámica del componente Three.js para evitar errores de SSR
const DynamicAnimatedAvatar = dynamic(
  () => import('./avatarConfig/avatarAnimationsDashboard').then((mod) => mod.AnimatedAvatar),
  { ssr: false }
)

type Props = {
  onViewSprintDetails: () => void;
  onViewCalendar?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Interface for event data
interface EventData {
  id: string
  project_id: string
  sprint_id: string
  created_by: string
  title: string
  description: string
  type: string
  priority: string
  start_date: string
  end_date: string
  is_all_day: boolean
  location: string | null
  participants: string[]
  related_tasks: string[]
  is_recurring: boolean
  recurrence: {
    frequency: string
    end_date: string
    excluded_dates: string[]
  } | null
  created_at: string
  updated_at: string
}

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',  
    month: 'long',    
    day: 'numeric',   
})

const DashboardStats = ({ onViewSprintDetails, onViewCalendar}: Props) => {
  // New state for today's meetings/events
  const [todayEvents, setTodayEvents] = useState<EventData[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)

  const { 
    sprintComparison,
    isLoadingComparison,
    refreshSprintComparison 
  } = useSprintDataContext()
  
  // Use the unified Kanban context instead of backlog context
  const { tasks, refreshKanban } = useKanban()

  // Add this to use the UserPermissions context
  const { getCurrentProject } = useUserPermissions()

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
      inProgressTasks: inProgress,
      totalTasks,
      completionPercentage
    }
  }, [tasks])
  
  localStorage.setItem("taskStadistics", JSON.stringify(taskStats))

  // Function to fetch today's events
  const fetchTodayEvents = async () => {
    try {
      setLoadingEvents(true)      
      
      // Get current project ID from the context instead of localStorage
      const projectId = getCurrentProject()
      
      if (!projectId) {
        console.error("No project ID found in current context")
        setLoadingEvents(false)
        return
      }
      console.log("Fetching today's events for project ID:", projectId)
      const response = await fetch(`${API_URL}/projects/${projectId}/events/today`)

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Today's events data:", data)

      setTodayEvents(data)
    } catch (error) {
      console.error("Error fetching today's events:", error)
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    if (hasLoadedInitialData) return
    
    const loadData = async () => {
      try {
        const projectId = getCurrentProject()
        if (!projectId) {
          console.log("No project ID available, skipping data load")
          return
        }

        console.log("Loading initial dashboard data for project:", projectId)
        
        if (sprintComparison.length === 0 && !isLoadingComparison) {
          console.log("Loading sprint comparison data...")
          await refreshSprintComparison()
        }

        console.log("Loading today's events...")
        await fetchTodayEvents()
        
        setHasLoadedInitialData(true)
        
      } catch (error) {
        console.error("Error loading initial dashboard data:", error)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    const projectId = getCurrentProject()
    if (projectId) {
      setHasLoadedInitialData(false)
      setTodayEvents([])
    }
  }, [getCurrentProject()])

  const currentSprintData = useMemo(() => {
    if (!Array.isArray(sprintComparison) || sprintComparison.length === 0) {
      return null
    }
    
    return sprintComparison.find(sprint => sprint.is_current) || 
           sprintComparison[sprintComparison.length - 1]
  }, [sprintComparison])

  // Obtener avatar y género desde el contexto
  const { avatarUrl, gender } = useAvatar()

  // Fetch today's events on component mount
  useEffect(() => {
    fetchTodayEvents()
  }, [])

  return (
    <div className={s.container}>
      <ProgressCard
        title="Calendar & Meetings"
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
          
          {loadingEvents ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {todayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No meetings scheduled for today</p>
            </div>
          )}
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
              value={(currentSprintData?.total_story_points || 0) > 0 
                ? Math.min(((currentSprintData?.completed_story_points || 0) / (currentSprintData?.total_story_points || 1)) * 100, 100) 
                : 0
              } 
              className={`${s.progressBar} mt-2 mb-2`} 
              indicatorClassName={s.progressBarIndicator} 
            />
            <div className={s.sprintStats}>
              <span>{currentSprintData?.completed_story_points || 0}/{currentSprintData?.total_story_points || 0} SP</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <div className={s.sprintLabel}>Task Completion</div>
              <div className={s.sprintStats}>{currentSprintData?.completion_percentage || 0}%</div>
            </div>
            <div className="mt-2">
              <Progress 
                value={currentSprintData?.completion_percentage || 0} 
                className={`${s.progressBar} mt-2 mb-2`} 
                indicatorClassName={s.progressBarIndicator} 
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={s.statCard}>
                <Clock className={s.statIcon} />
                <div className={s.statValue}>{currentSprintData?.days_left || 0}</div>
                <div className={s.statLabel}>Days Left</div>
              </div>
    
              <div className={s.statCard}>
                <BarChart2 className={s.statIcon} />
                <div className={s.statValue}>{currentSprintData?.completion_percentage || 0}%</div>
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
                border: "6px solid #C7A0B8"
              }}>
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