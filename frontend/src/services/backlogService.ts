// services/backlogService.ts

import { TaskOrStory } from "@/types/taskkanban"
import { UserStory } from "@/types/userstory"
import { getProjectUserStories } from "@/utils/getProjectUserStories"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export const backlogService = {
  
  fetchUserStories: async (projectId: string): Promise<UserStory[]> => {
    if (!projectId) {
      throw new Error("Project ID is required")
    }
    
    try {
      return await getProjectUserStories(projectId)
    } catch (error) {
      console.error("Failed to fetch user stories:", error)
      throw error
    }
  },

  fetchTaskById: async (projectId: string, taskId: string): Promise<TaskOrStory> => {
    if (!projectId || !taskId) {
      throw new Error("Project ID is required")
    }
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`)
      
      if (!response.ok) {
        throw new Error(`Error al obtener task: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Failed to fetch task with id: ${taskId}`, error)
      throw error
    }
  },

  fetchStoryById: async (projectId: string, storyId: string): Promise<UserStory> => {
    if (!projectId || !storyId) {
      throw new Error("Project ID and User Story ID is required")
    }
    
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/user-stories/${storyId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user story: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Failed to fetch user story with id: ${storyId}`, error)
      throw error
    }
  },

  updateTaskStatus: async (
    projectId: string, 
    taskId: string, 
    newStatus: string
  ): Promise<void> => {
    if (!projectId || !taskId) {
      throw new Error("Project ID and Task ID are required")
    }
    
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_khanban: newStatus }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Failed to update task status: ${errorData || response.statusText}`)
    }
  },

  
  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    if (!projectId || !taskId) {
      throw new Error("Project ID and Task ID are required")
    }
    
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Failed to delete task: ${errorData || response.statusText}`)
    }
  },


  deleteStory: async (projectId: string, storyId: string): Promise<void> => {
    if (!projectId || !storyId) {
      throw new Error("Project ID and Story ID are required")
    }
    
    const response = await fetch(`${API_URL}/projects/${projectId}/user-stories/${storyId}`, {
      method: "DELETE",
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Failed to delete user story: ${errorData || response.statusText}`)
    }
  },

  addComment: async (
    projectId: string, 
    taskId: string, 
    commentData: any
  ): Promise<any> => {
    if (!projectId || !taskId) {
      throw new Error("Project ID and Task ID are required")
    }
    
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commentData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Failed to add comment: ${errorData || response.statusText}`)
    }
    
    return await response.json()
  },

  deleteComment: async (
    projectId: string, 
    taskId: string, 
    commentId: string
  ): Promise<void> => {
    if (!projectId || !taskId || !commentId) {
      throw new Error("Project ID, Task ID, and Comment ID are required")
    }
    
    const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
      method: "DELETE",
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(`Failed to delete comment: ${errorData || response.statusText}`)
    }
  }
}