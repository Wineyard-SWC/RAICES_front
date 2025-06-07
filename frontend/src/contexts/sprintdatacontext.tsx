"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTasks } from "@/contexts/taskcontext"
import { print, printError } from "@/utils/debugLogger"

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

interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
  capacity: number
  allocated: number
}

interface VelocityPoint {
  sprint: string
  Planned: number
  Actual: number
}

interface BugSeverityDistribution {
  Blocker: number
  Critical: number
  Major: number
  Minor: number
  Trivial: number
}

interface SprintComparisonData {
  sprint_id: string
  sprint_name: string
  is_current: boolean
  total_story_points: number
  completed_story_points: number
  completion_percentage: number
  scope_changes: number
  bugs_found: number
  risk_assessment: string
  velocity: number
  average_velocity: number
  days_left: number
  start_date: string
  end_date: string
}

interface SprintDataContextType {
  burndownData: BurndownData | null
  teamMembers: TeamMember[]
  velocityData: VelocityPoint[]
  sprintComparison: SprintComparisonData[]
  refreshBurndownData: () => Promise<void>
  refreshVelocityData: () => Promise<void>
  refreshSprintComparison: () => Promise<void>
  isLoadingBurndown: boolean
  isLoadingVelocity: boolean
  isLoadingComparison: boolean
}

const SprintDataContext = createContext<SprintDataContextType | undefined>(undefined)

export const useSprintDataContext = () => {
  const context = useContext(SprintDataContext)
  if (!context) throw new Error("useSprintDataContext must be used inside a SprintDataProvider")
  return context
}

export const SprintDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [burndownData, setBurndownData] = useState<BurndownData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [velocityData, setVelocityData] = useState<VelocityPoint[]>([])
  const [sprintComparison, setSprintComparison] = useState<SprintComparisonData[]>([])
  const [isClient, setIsClient] = useState(false)
  const [project_id, setProjectId] = useState<string | null>(null)
  const [isLoadingBurndown, setIsLoadingBurndown] = useState(false)
  const [isLoadingVelocity, setIsLoadingVelocity] = useState(false)
  const [isLoadingComparison, setIsLoadingComparison] = useState(false)
  
  const [lastFetchedProjectId, setLastFetchedProjectId] = useState<string | null>(null)
  
  const apiURL = process.env.NEXT_PUBLIC_API_URL || ""
  
  const { getTasksForProject } = useTasks();

  useEffect(() => {
    setIsClient(true)
    const storedProjectId = localStorage.getItem("currentProjectId")
    print('🔍 [SPRINT CONTEXT] Initial project ID:', storedProjectId)
    setProjectId(storedProjectId)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleStorageChange = () => {
      const newProjectId = localStorage.getItem("currentProjectId")
      print('🔄 [SPRINT CONTEXT] Storage changed, new project ID:', newProjectId)
      if (newProjectId !== project_id) {
        setProjectId(newProjectId)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      const currentProjectId = localStorage.getItem("currentProjectId")
      if (currentProjectId !== project_id) {
        print('🔄 [SPRINT CONTEXT] Polling detected change:', currentProjectId)
        setProjectId(currentProjectId)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isClient, project_id])

  const getTaskDataForGraphs = async () => {
    if (!project_id || !apiURL) return
    
    const currentprojecttasks = getTasksForProject(project_id)
    
    return currentprojecttasks.map(t => ({
      status_khanban: t.status_khanban,
      story_points: t.story_points
    }))
  }

  const fetchBurndownData = async () => {
    if (!project_id || !apiURL) return
    setIsLoadingBurndown(true)
    
    const tasksData = await getTaskDataForGraphs() || []

    try {
      const response = await fetch(`${apiURL}/api/burndown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project_id,
          tasks: tasksData
        })
      })
      const data = await response.json()
      
      if (data.error) {
        printError(data.error)
        return
      }
      print('BURNDOWN CHART DATA:', JSON.parse(JSON.stringify(data)))
      setBurndownData(data)
    } catch (error) {
      printError("Error fetching burndown data:", error)
    } finally {
      setIsLoadingBurndown(false)
    }
  }

  const fetchVelocityData = async () => {
    if (!project_id || !apiURL) return
    setIsLoadingVelocity(true)

    const tasksData = await getTaskDataForGraphs() || []

    try {
      const response = await fetch(`${apiURL}/api/velocitytrend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project_id,
          tasks: tasksData
        })
      })

      const data = await response.json()
      print('VELOCITY DATA:', JSON.parse(JSON.stringify(data)))
      setVelocityData(data)
    } catch (error) {
      printError("Error fetching velocity data:", error)
    } finally {
      setIsLoadingVelocity(false)
    }
  }

  const fetchSprintComparison = async () => {
    if (!project_id || !apiURL) {
      print("Missing project_id or apiURL", { project_id, apiURL })
      return
    }
    
    if (isLoadingComparison || lastFetchedProjectId === project_id) {
      print("Already loading or already fetched for this project")
      return
    }
    
    setIsLoadingComparison(true)

    try {
      const url = `${apiURL}/api/sprints/comparison?projectId=${project_id}`
      const response = await fetch(url)
      const data = await response.json()
      print('SPRINT COMPARISON DATA:', JSON.parse(JSON.stringify(data)))  
      setSprintComparison(data)
      setLastFetchedProjectId(project_id)
    } catch (error) {
      printError("Error fetching sprint comparison:", error)
    } finally {
      setIsLoadingComparison(false)
    }
  }

  useEffect(() => {
    print('🧹 [SPRINT CONTEXT] Project changed to:', project_id, '- Clearing data')
    setBurndownData(null)
    setTeamMembers([])
    setVelocityData([])
    setSprintComparison([])
    setLastFetchedProjectId(null)
  }, [project_id])

  useEffect(() => {
    if (isClient && project_id && project_id !== lastFetchedProjectId) {
      print('🔄 [SPRINT CONTEXT] Fetching data for project:', project_id)
      fetchBurndownData()
      fetchVelocityData()
      fetchSprintComparison()
    }
  }, [isClient, project_id, lastFetchedProjectId])

  return (
    <SprintDataContext.Provider
      value={{
        burndownData,
        teamMembers,
        velocityData,
        sprintComparison,
        refreshBurndownData: fetchBurndownData,
        refreshVelocityData: fetchVelocityData,
        refreshSprintComparison: fetchSprintComparison,
        isLoadingBurndown,
        isLoadingVelocity,
        isLoadingComparison,
      }}
    >
      {children}
    </SprintDataContext.Provider>
  )
}