// hooks/useBacklogData.ts

import { useState, useEffect, useCallback } from "react"
import { TaskColumns, TaskOrStory } from "@/types/taskkanban"
import { KanbanStatus } from "@/types/task"
import { UserStory } from "@/types/userstory"
import { backlogService } from "@/services/backlogService"
import { cacheService } from "@/utils/cacheService"
import { useProjectTasks } from "@/hooks/useProjectTasks"

const DEBOUNCE_TIME_MS = 5000

const statusToColumnMap: Record<KanbanStatus, keyof TaskColumns> = {
    "Backlog": "backlog",
    "To Do": "todo",
    "In Progress": "inprogress",
    "In Review": "inreview",
    "Done": "done"
  }

export const useBacklogData = (initialProjectId: string = "") => {
    const [projectId, setProjectId] = useState(initialProjectId)
    const [stories, setStories] = useState<UserStory[]>([])
    const [isLoadingStories, setIsLoadingStories] = useState(false)
    const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
    const [fetchRequestId, setFetchRequestId] = useState(0)
    const [error, setError] = useState<Error | null>(null)

    const { tasks, setTasks, loading: isLoadingTasks } = useProjectTasks(projectId)

    useEffect(() => {
        if (!initialProjectId) {
        const storedProjectId = typeof window !== "undefined" 
            ? localStorage.getItem("currentProjectId") 
            : null
            
        if (storedProjectId) {
            setProjectId(storedProjectId)
        }
        }
    }, [initialProjectId])


    const fetchStories = useCallback(async (force: boolean = false): Promise<void> => {
        if (!projectId) return
        
        const now = Date.now()
        
        if (!force && lastFetchTime && now - lastFetchTime < DEBOUNCE_TIME_MS) {
        return
        }
        
        const requestId = fetchRequestId + 1
        setFetchRequestId(requestId)
        setLastFetchTime(now)
        setIsLoadingStories(true)
        setError(null)
        
        try {
        const cachedData = cacheService.getFromCache(projectId)
        
        if (cachedData && !force) {
            setStories(cachedData.stories)
            setTasks(cachedData.tasks)
        } else {
            const userStories = await backlogService.fetchUserStories(projectId)
            
            if (requestId === fetchRequestId) {
            setStories(userStories)
            
            cacheService.updateCache(projectId, {
                tasks,
                stories: userStories
            })
            }
        }
        } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
        } finally {
        setIsLoadingStories(false)
        }
    }, [projectId, lastFetchTime, fetchRequestId, tasks, setTasks])

 
    useEffect(() => {
        if (projectId) {
        fetchStories()
        }
    }, [projectId, fetchStories])

  
    const updateTaskStatus = useCallback(async (
        taskId: string, 
        newStatus: string
    ): Promise<void> => {
        if (!projectId) return

        const validStatus = newStatus as KanbanStatus
        if (!Object.keys(statusToColumnMap).includes(validStatus)) {
        setError(new Error(`Invalid status: ${newStatus}`))
        return
        }
        
        setTasks(prevTasks => {
            const updatedTasks = { ...prevTasks }
            
            // Find and remove task from its current column
            const columns = Object.keys(updatedTasks) as Array<keyof TaskColumns>
            columns.forEach(column => {
            updatedTasks[column] = updatedTasks[column].filter(task => task.id !== taskId)
            })
            
            // Find the task to move
            let taskToMove: TaskOrStory | undefined
            columns.forEach(column => {
            const found = prevTasks[column].find(task => task.id === taskId)
            if (found) taskToMove = found
            })
            
            if (taskToMove) {
            const updatedTask = { ...taskToMove, status_khanban: validStatus }
            
            const columnKey = statusToColumnMap[validStatus]
            
            updatedTasks[columnKey] = [...updatedTasks[columnKey], updatedTask]
            }
            
            return updatedTasks
        })
        
        try {
        await backlogService.updateTaskStatus(projectId, taskId, newStatus)
        
        cacheService.updateCache(projectId, { tasks, stories })
        } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update task status'))
        fetchStories(true) 
        }
    }, [projectId, tasks, stories, setTasks, fetchStories])

 
    const deleteTask = useCallback(async (taskId: string): Promise<void> => {
        if (!projectId) return
        
        setTasks(prevTasks => {
            const updatedTasks = { ...prevTasks }
            
            const columns = Object.keys(updatedTasks) as Array<keyof TaskColumns>
            columns.forEach(column => {
            updatedTasks[column] = updatedTasks[column].filter(task => task.id !== taskId)
            })
            
            return updatedTasks
        })
        
        try {
            await backlogService.deleteTask(projectId, taskId)
            
            cacheService.updateCache(projectId, { tasks, stories })
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete task'))
            fetchStories(true)
        }
    }, [projectId, tasks, stories, setTasks, fetchStories])

  
    const deleteStory = useCallback(async (storyId: string): Promise<void> => {
        if (!projectId) return
        
        const updatedStories = stories.filter(story => story.id !== storyId)
        setStories(updatedStories)
        
        try {
        await backlogService.deleteStory(projectId, storyId)
        
        cacheService.updateCache(projectId, { tasks, stories: updatedStories })
        } catch (err) {

        setError(err instanceof Error ? err : new Error('Failed to delete user story'))
        fetchStories(true) 
        }
    }, [projectId, tasks, stories, fetchStories])

    return {
        projectId,
        tasks,
        stories,
        isLoading: isLoadingTasks || isLoadingStories,
        error,
        setTasks,
        setStories,
        refreshData: (force: boolean = false) => fetchStories(force),
        updateTaskStatus,
        deleteTask,
        deleteStory
    }
}