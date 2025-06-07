"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Sprint, SprintFormData, SprintMember } from "@/types/sprint"
import type { Task } from "@/types/task"
import type { UserStory } from "@/types/userstory"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { getProjectTasks } from "@/utils/getProjectTasks"
import { printError } from "@/utils/debugLogger"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export const useSprintPlanning = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId =
    searchParams.get("projectId") || (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) || ""

  // Data states
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [userStories, setUserStories] = useState<UserStory[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<SprintMember[]>([])

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Fetch data
  useEffect(() => {
    if (!projectId) return

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch user stories
        const stories = await getProjectUserStories(projectId)
        setUserStories(stories)

        // Fetch tasks
        const projectTasks = await getProjectTasks(projectId)
        setTasks(projectTasks)

        // Fetch team members
        const response = await fetch(`${API_URL}/project_users/project/${projectId}`)
        if (!response.ok) throw new Error("Failed to fetch team members")
        const members = await response.json()

        // Transform to SprintMember format
        const sprintMembers: SprintMember[] = members.map((member: any) => ({
          id: member.id,
          name: member.name || member.email || "Team Member",
          role: member.role || "Team Member",
          avatar: member.avatar,
          capacity: 40, // Default 40 hours per week
          allocated: 0,
        }))

        setTeamMembers(sprintMembers)

        // Initialize sprint if not exists
        if (!sprint) {
          const newSprint: Sprint = {
            id: `temp-${Date.now()}`,
            name: `Sprint ${new Date().getMonth() + 1}`,
            project_id: projectId,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
            duration_weeks: 2,
            status: "planning",
            team_members: sprintMembers,
            user_stories: stories.map((story) => ({
              id: story.uuid,
              userStory: story,
              tasks: projectTasks.filter((task) => task.user_story_id === story.uuid),
              selected: false,
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setSprint(newSprint)
        }
      } catch (err) {
        printError("Error fetching sprint data:", err)
        setError("Failed to load sprint data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  // Sprint actions
  const updateSprintDetails = (data: Partial<SprintFormData>) => {
    if (!sprint) return
    setSprint({
      ...sprint,
      ...data,
      updated_at: new Date().toISOString(),
    })
  }

  const toggleUserStory = (userStoryId: string) => {
    if (!sprint) return
    setSprint({
      ...sprint,
      user_stories: sprint.user_stories.map((us) => (us.id === userStoryId ? { ...us, selected: !us.selected } : us)),
      updated_at: new Date().toISOString(),
    })
  }

  const addTeamMember = (member: Omit<SprintMember, "id" | "allocated">) => {
    if (!sprint) return
    const newMember: SprintMember = {
      ...member,
      id: `temp-${Date.now()}`,
      allocated: 0,
    }
    setSprint({
      ...sprint,
      team_members: [...sprint.team_members, newMember],
      updated_at: new Date().toISOString(),
    })
  }

  const updateTeamMember = (memberId: string, data: Partial<SprintMember>) => {
    if (!sprint) return
    setSprint({
      ...sprint,
      team_members: sprint.team_members.map((member) => (member.id === memberId ? { ...member, ...data } : member)),
      updated_at: new Date().toISOString(),
    })
  }

  const removeTeamMember = (memberId: string) => {
    if (!sprint) return
    setSprint({
      ...sprint,
      team_members: sprint.team_members.filter((member) => member.id !== memberId),
      updated_at: new Date().toISOString(),
    })
  }

  const assignTask = (taskId: string, memberId: string) => {
    if (!sprint) return

    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Update the task's assignee
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, assignee_id: memberId } : t))
    setTasks(updatedTasks)

    // Update the member's allocated time
    const storyPoints = task.story_points || 0
    const hoursPerPoint = 2 // Assuming 2 hours per story point
    const additionalHours = storyPoints * hoursPerPoint

    setSprint({
      ...sprint,
      team_members: sprint.team_members.map((member) =>
        member.id === memberId ? { ...member, allocated: member.allocated + additionalHours } : member,
      ),
      user_stories: sprint.user_stories.map((us) => ({
        ...us,
        tasks: us.tasks.map((t) => (t.id === taskId ? { ...t, assignee_id: memberId } : t)),
      })),
      updated_at: new Date().toISOString(),
    })
  }

  const saveSprint = async () => {
    if (!sprint) return

    setIsLoading(true)
    setError(null)

    try {
      // Create the sprint in your backend
      const response = await fetch(`${API_URL}/sprints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sprint),
      })

      if (!response.ok) throw new Error("Failed to save sprint")

      const savedSprint = await response.json()
      setSprint(savedSprint)

      return savedSprint
    } catch (err) {
      printError("Error saving sprint:", err)
      setError("Failed to save sprint. Please try again.")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sprint,
    userStories,
    tasks,
    teamMembers,
    isLoading,
    error,
    isSidebarOpen,
    setIsSidebarOpen,
    updateSprintDetails,
    toggleUserStory,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    assignTask,
    saveSprint,
  }
}
