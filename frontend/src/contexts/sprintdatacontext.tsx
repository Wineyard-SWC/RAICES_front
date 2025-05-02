"use client"

import { createContext, useContext, useEffect, useState } from "react"

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

interface SprintDataContextType {
  burndownData: BurndownData | null
  teamMembers: TeamMember[]
  velocityData: VelocityPoint[]
  refreshBurndownData: () => Promise<void>
  refreshVelocityData: () => Promise<void>
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
  const [isClient, setIsClient] = useState(false)
  const [project_id, setProjectId] = useState<string | null>(null)
  const apiURL = process.env.NEXT_PUBLIC_API_URL || ""

  useEffect(() => {
    setIsClient(true)
    
    const storedProjectId = localStorage.getItem("currentProjectId")
    setProjectId(storedProjectId)

    const storedBurndown = localStorage.getItem("sprint_burndown")
    if (storedBurndown) setBurndownData(JSON.parse(storedBurndown))
    
    const storedTeamMembers = localStorage.getItem("sprint_team_members")
    if (storedTeamMembers) setTeamMembers(JSON.parse(storedTeamMembers))
    
    const storedVelocity = localStorage.getItem("sprint_velocity_data")
    if (storedVelocity) setVelocityData(JSON.parse(storedVelocity))
  }, [])

  const fetchBurndownData = async () => {
    if (!project_id || !apiURL) return
    
    try {
      const response = await fetch(`${apiURL}/api/burndown?projectId=${project_id}`)
      const data = await response.json()
      
      const { duration_days, total_story_points, remaining_story_points, team_members, start_date, name} = data

      const burndown: BurndownData = { duration_days, total_story_points, remaining_story_points }

      setBurndownData(burndown)
      setTeamMembers(team_members || [])

      // Save to localStorage
      localStorage.setItem("sprint_burndown", JSON.stringify(burndown))
      localStorage.setItem("sprint_team_members", JSON.stringify(team_members || []))
      localStorage.setItem("sprint_duration_days", String(duration_days))
      localStorage.setItem("sprint_total_story_points", String(total_story_points))
      localStorage.setItem("sprint_start_date", String(start_date))
      localStorage.setItem("sprint_name", String(name))
    } catch (error) {
      console.error("Error fetching burndown data:", error)
    }
  }

  const fetchVelocityData = async () => {
    if (!project_id || !apiURL) return

    try {
      const response = await fetch(`${apiURL}/api/velocitytrend?projectId=${project_id}`)
      const data = await response.json()

      setVelocityData(data)
      localStorage.setItem("sprint_velocity_data", JSON.stringify(data))
    } catch (error) {
      console.error("Error fetching velocity data:", error)
    }
  }

  // Load data once client is ready and project ID is available
  useEffect(() => {
    if (isClient && project_id) {
      if (!burndownData) fetchBurndownData()
      if (!velocityData || velocityData.length === 0) fetchVelocityData()
    }
  }, [isClient, project_id])


  return (
    <SprintDataContext.Provider
      value={{
        burndownData,
        teamMembers,
        velocityData,
        refreshBurndownData: fetchBurndownData,
        refreshVelocityData: fetchVelocityData,
      }}
    >
      {children}
    </SprintDataContext.Provider>
  )
}
