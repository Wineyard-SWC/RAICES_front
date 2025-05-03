"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface BurndownData {
  duration_days: number
  total_story_points: number
  remaining_story_points: number[]
}

interface TeamMember {
  id: number
  name: string
  story_points: number[]
}

interface VelocityPoint {
  sprint: string
  story_points: number
}

interface SprintDataContextType {
  burndownData: BurndownData | null
  teamMembers: TeamMember[]
  velocityData: VelocityPoint[]
  refreshBurndownData: () => void
  refreshVelocityData: () => void
}

const SprintDataContext = createContext<SprintDataContextType | undefined>(undefined)

export const useSprintDataContext = () => {
  const context = useContext(SprintDataContext)
  if (!context) {
    throw new Error("useSprintDataContext must be used inside a SprintDataProvider")
  }
  return context
}

export const SprintDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [burndownData, setBurndownData] = useState<BurndownData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [velocityData, setVelocityData] = useState<VelocityPoint[]>([])

  const searchParams = useSearchParams()
  const project_id = searchParams.get("projectId")
  const apiURL = process.env.NEXT_PUBLIC_API_URL || ""

  const localKey = (base: string) => `${base}_${project_id}`

  const fetchBurndownData = async () => {
    if (!project_id || !apiURL) return
    try {
      const response = await fetch(`${apiURL}/api/burndown?projectId=${project_id}`)
      const data = await response.json()

      const { duration_days, total_story_points, remaining_story_points, team_members, start_date, name } = data

      const burndown: BurndownData = {
        duration_days,
        total_story_points,
        remaining_story_points,
      }

      setBurndownData(burndown)
      setTeamMembers(team_members || [])

      localStorage.setItem(localKey("sprint_burndown"), JSON.stringify(burndown))
      localStorage.setItem(localKey("sprint_team_members"), JSON.stringify(team_members || []))
      localStorage.setItem(localKey("sprint_duration_days"), String(duration_days))
      localStorage.setItem(localKey("sprint_total_story_points"), String(total_story_points))
      localStorage.setItem(localKey("sprint_start_date"), String(start_date))
      localStorage.setItem(localKey("sprint_name"), String(name))
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
      localStorage.setItem(localKey("sprint_velocity_data"), JSON.stringify(data))
    } catch (error) {
      console.error("Error fetching velocity data:", error)
    }
  }

  useEffect(() => {
    if (!project_id) return

    const storedBurndown = localStorage.getItem(localKey("sprint_burndown"))
    if (storedBurndown) {
      setBurndownData(JSON.parse(storedBurndown))
    }

    const storedTeamMembers = localStorage.getItem(localKey("sprint_team_members"))
    if (storedTeamMembers) {
      setTeamMembers(JSON.parse(storedTeamMembers))
    }

    const storedVelocity = localStorage.getItem(localKey("sprint_velocity_data"))
    if (storedVelocity) {
      setVelocityData(JSON.parse(storedVelocity))
    }
  }, [project_id])

  useEffect(() => {
    if (!project_id) return

    if (!burndownData) fetchBurndownData()
    if (!velocityData || velocityData.length === 0) fetchVelocityData()
  }, [project_id])

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