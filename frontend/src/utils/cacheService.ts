// utils/cacheService.ts

import { TaskColumns } from "@/types/taskkanban"
import { UserStory } from "@/types/userstory"

// Default cache expiration time: 30 minutes
const DEFAULT_CACHE_EXPIRATION_MS = 30 * 60 * 1000

interface CachedData {
  tasks: TaskColumns
  stories: UserStory[]
}


export const cacheService = {
 
  getCacheKeys: (projectId: string) => ({
    tasks: `cachedTasks_${projectId}`,
    stories: `cachedStories_${projectId}`,
    timestamp: `cachedTime_${projectId}`
  }),

  
  updateCache: (
    projectId: string, 
    data: CachedData, 
    expiration: number = DEFAULT_CACHE_EXPIRATION_MS
  ): void => {
    if (!projectId) return
    
    const cacheKeys = cacheService.getCacheKeys(projectId)
    const now = Date.now()
    
    sessionStorage.setItem(cacheKeys.tasks, JSON.stringify(data.tasks))
    sessionStorage.setItem(cacheKeys.stories, JSON.stringify(data.stories))
    sessionStorage.setItem(cacheKeys.timestamp, now.toString())
    
    sessionStorage.setItem(`${cacheKeys.timestamp}_exp`, (now + expiration).toString())
  },

  getFromCache: (
    projectId: string,
    expiration: number = DEFAULT_CACHE_EXPIRATION_MS
  ): CachedData | null => {
    if (!projectId) return null
    
    const cacheKeys = cacheService.getCacheKeys(projectId)
    const now = Date.now()
    
    const cachedTasks = sessionStorage.getItem(cacheKeys.tasks)
    const cachedStories = sessionStorage.getItem(cacheKeys.stories)
    const cachedTime = sessionStorage.getItem(cacheKeys.timestamp)
    
    if (!cachedTasks || !cachedStories || !cachedTime) {
      return null
    }
    
    const isCacheValid = now - parseInt(cachedTime) < expiration
    
    if (isCacheValid) {
      return {
        tasks: JSON.parse(cachedTasks),
        stories: JSON.parse(cachedStories)
      }
    }
    
    return null
  },

  clearCache: (projectId: string): void => {
    if (!projectId) return
    
    const cacheKeys = cacheService.getCacheKeys(projectId)
    
    sessionStorage.removeItem(cacheKeys.tasks)
    sessionStorage.removeItem(cacheKeys.stories)
    sessionStorage.removeItem(cacheKeys.timestamp)
    sessionStorage.removeItem(`${cacheKeys.timestamp}_exp`)
  }
}