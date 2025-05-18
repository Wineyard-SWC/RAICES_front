"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTasks } from "@/contexts/taskcontext"



interface BurndownData {
  duration_days: number
  total_story_points: number
  remaining_story_points: number
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
  tasks_per_day: number
  estimated_days_remaining?: number
  quality_metrics: {
    bugs_found: number
    priority_distribution: string
  }
}

interface SprintDataContextType {
  burndownData: BurndownData | null
  teamMembers: TeamMember[]
  velocityData: VelocityPoint[]
  sprintComparison: SprintComparisonData[]
  refreshBurndownData: () => Promise<void>
  refreshVelocityData: () => Promise<void>
  refreshSprintComparison: () => Promise<void>
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
  const apiURL = process.env.NEXT_PUBLIC_API_URL || ""
  
  const {getTasksForProject} = useTasks();

  useEffect(() => {
    setIsClient(true)
    const storedProjectId = localStorage.getItem("currentProjectId")
    setProjectId(storedProjectId)
  }, [])


  const getTaskDataForGraphs = async() => {
    if (!project_id || !apiURL) return
    
    const currentprojecttasks = getTasksForProject(project_id)
    
    const requiredData = currentprojecttasks.map(t => ({
      status_khanban: t.status_khanban,
      story_points: t.story_points
    }), []);
    return requiredData
  }


  const fetchBurndownData = async () => {
    if (!project_id || !apiURL) return
    
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
      
      const { duration_days, total_story_points, remaining_story_points, team_members } = data

      const burndown: BurndownData = { duration_days, total_story_points, remaining_story_points }

      setBurndownData(burndown)
      setTeamMembers(team_members || [])
    } catch (error) {
      console.error("Error fetching burndown data:", error)
    }
  }

  const fetchVelocityData = async () => {
    if (!project_id || !apiURL) return

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
      setVelocityData(data)
    } catch (error) {
      console.error("Error fetching velocity data:", error)
    }
  }

  const fetchSprintComparison = async () => {
    if (!project_id || !apiURL) {
      console.log("Missing project_id or apiURL", { project_id, apiURL })
      return
    }

    try {
      const url = `${apiURL}/api/sprints/comparison?projectId=${project_id}`
      console.log("Fetching from:", url)
      const response = await fetch(url)
      const data = await response.json()
      console.log("Received sprint comparison data:", data)
      setSprintComparison(data)
    } catch (error) {
      console.error("Error fetching sprint comparison:", error)
    }
  }

  useEffect(() => {
    if (isClient && project_id) {
      fetchBurndownData()
      fetchVelocityData()
      fetchSprintComparison()
    }
  }, [isClient, project_id])

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
      }}
    >
      {children}
    </SprintDataContext.Provider>
  )
}