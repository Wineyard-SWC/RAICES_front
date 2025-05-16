"use client"

import React, { createContext, useContext, 
  useState, useCallback, useEffect, useRef } from "react"
import { TaskColumns, TaskOrStory } from "@/types/taskkanban"
import { KanbanStatus, Task, TaskFormData } from "@/types/task"
import { UserStory } from "@/types/userstory"
import { useTasks } from "@/contexts/taskcontext"
import { useUserStories } from "@/contexts/saveduserstoriescontext"
import { useUser } from "./usercontext"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { getProjectTasks } from "@/utils/postTasks"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Define the Workinguser interface to match your data structure
interface Workinguser {
  users: [string, string]
}

// Backend format for assignee (from Firestore)
interface FirestoreAssignee {
  id: string
  name: string
}

type BackendTaskFormData = Omit<TaskFormData, 'assignee'> & {
  assignee?: FirestoreAssignee[]
}

// Mapear estatus a columnas
const statusToColumnMap: Record<KanbanStatus, keyof TaskColumns> = {
  "Backlog": "backlog",
  "To Do": "todo",
  "In Progress": "inprogress",
  "In Review": "inreview",
  "Done": "done"
}

interface KanbanContextType {
  // State
  tasks: TaskColumns
  isLoading: boolean
  error: Error | null
  currentProjectId: string | null
  
  
  // Actions
  setCurrentProject: (projectId: string) => void
  updateTaskStatus: (taskId: string, newStatus: KanbanStatus) => Promise<void>
  updateStoryStatus: (storyId: string, newStatus: KanbanStatus) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deleteStory: (storyId: string) => Promise<void>
  refreshKanban: () => Promise<void>
  createTask: (taskData: Omit<TaskFormData, 'id' | 'created_by' | 'modified_by'>) => Promise<void>
  updateTask: (taskId: string, taskData: Partial<TaskFormData>) => Promise<void>
  updateTaskComments: (taskId: string, comments: any[]) => Promise<void>
  updateStoryComments: (storyId: string, comments: any[]) => Promise<void>
  updateStory: (story_id: string, storyData: Partial<UserStory>) => Promise<void>
  reset: () => void
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined)

export const useKanban = () => {
  const context = useContext(KanbanContext)
  if (!context) {
    throw new Error("useKanban must be used within KanbanProvider")
  }
  return context
}

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Usar los contextos existentes
  const tasksContext = useTasks()
  const storiesContext = useUserStories()
  const { userId, userData, isLoading: isUserLoading, error: userError } = useUser()
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null)

  
  const reset = () => {
    setCurrentProjectId(null)
    setError(null)
    setIsLoading(false)
    tasksContext.clearAllCache()
    storiesContext.clearAllCache()
    localStorage.removeItem("currentProjectId")
   }

  // Helper para obtener información del usuario sin dependencias circulares
  const getUserInfo = useCallback((): [string, string] => {
    if (!userId || isUserLoading || userError) {
      return ["", ""]
    }
    return [userId, userData?.name || ""]
  }, [userId, userData?.name, isUserLoading, userError])

  // Helper para determinar si un item es una Task o Story
  const isTask = (item: TaskOrStory): item is Task => {
    return !('acceptanceCriteria' in item) && !('assigned_epic' in item) && 'user_story_id' in item
  }

  // Convertir assignee desde formato backend (Firestore) a formato TaskFormData
  const convertAssigneeFromBackend = (backendAssignee: any): Workinguser[] => {
    if (!backendAssignee) return []
    
    if (Array.isArray(backendAssignee)) {
      return backendAssignee.map(user => {
        if (typeof user === 'object' && 'id' in user && 'name' in user) {
          // Formato Firestore: {id: string, name: string}
          return { users: [user.id, user.name] as [string, string] }
        } else if (Array.isArray(user) && user.length >= 2) {
          // Ya es tupla, convertir a Workinguser
          return { users: [user[0], user[1]] as [string, string] }
        }
        console.warn('Unexpected assignee format:', user)
        return { users: ["", ""] as [string, string] }
      })
    }
    
    return []
  }

  // Convertir assignee desde formato TaskFormData (Workinguser[]) a backend (Firestore)
  const convertAssigneeToBackend = (frontendAssignee: Workinguser[]): FirestoreAssignee[] => {
    if (!frontendAssignee || !Array.isArray(frontendAssignee)) return []
    
    return frontendAssignee.map(workingUser => ({
      id: workingUser.users[0] || "",
      name: workingUser.users[1] || ""
    }))
  }

  // Helper para convertir entre formatos internos (Task requiere [string, string][], TaskFormData requiere Workinguser[])
  const convertWorkingusersToTuples = (users: Workinguser[]): [string, string][] => {
    return users.map(u => u.users);
  };

  const convertTuplesToWorkingusers = (tuples: [string, string][]): Workinguser[] => {
    return tuples.map(t => ({ users: t }));
  };
  // Convertir tasks array a TaskColumns
  const convertTasksToColumns = useCallback((tasks: Task[]): TaskColumns => {
    const columns: TaskColumns = {
      backlog: [],
      todo: [],
      inprogress: [],
      inreview: [],
      done: []
    }

    const statusMap: Record<string, keyof TaskColumns> = {
      'backlog': 'backlog',
      'to do': 'todo',
      'in progress': 'inprogress',
      'in review': 'inreview',
      'done': 'done'
    }

    tasks.forEach(task => {
      const statusKey = statusMap[task.status_khanban?.toLowerCase().trim() ?? ''] || 'backlog'
      
      // Asegurar que el formato de assignee sea consistente con el tipo Task
      let processedTask = { ...task }
      
      // Si task.assignee está en formato Workinguser[], mantenerlo
      // Si está en otro formato, convertirlo
      if (task.assignee && !Array.isArray(task.assignee)) {
        processedTask.assignee = convertAssigneeFromBackend(task.assignee)
      } else if (task.assignee && Array.isArray(task.assignee) && task.assignee.length > 0) {
        // Verificar si es array de tuplas o array de Workinguser
        const firstItem = task.assignee[0]
        if (Array.isArray(firstItem)) {
          // Es array de tuplas, convertir a Workinguser[]
          processedTask.assignee = task.assignee
        }
        // Si ya es Workinguser[], mantenerlo tal como está
      }
      
      columns[statusKey].push(processedTask as Task)
    })

    return columns
  }, [])

  // Combinar tasks y stories en formato Kanban
    const combineTasksAndStories = useCallback((tasks: Task[], stories: UserStory[]): TaskColumns => {
    const taskColumns = convertTasksToColumns(tasks)
    
    const statusMap: Record<string, keyof TaskColumns> = {
        'backlog': 'backlog',
        'to do': 'todo',
        'in progress': 'inprogress',
        'in review': 'inreview',
        'done': 'done'
    }
    
    stories.forEach(story => {
        // Usar la misma lógica que las Tasks
        const statusKey = statusMap[story.status_khanban?.toLowerCase().trim() ?? ''] || 'backlog'
        taskColumns[statusKey].push(story)
    })

    return taskColumns
    }, [convertTasksToColumns])

  // Set current project
  const setCurrentProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId)
    
    if (typeof window !== "undefined") {
      localStorage.setItem("currentProjectId", projectId)
    }
  }, [])

  const prepareTaskDataForBackend = (taskData: Partial<TaskFormData>): Partial<BackendTaskFormData> => {
    const cleanData = { ...taskData }
    
    // Remove properties that should not be sent to the backend
    delete cleanData.id
    
    // Convert assignee format for backend
    if (cleanData.assignee && Array.isArray(cleanData.assignee)) {
      return {
        ...cleanData,
        assignee: convertAssigneeToBackend(cleanData.assignee)
      }
    }
    
    return cleanData as Partial<BackendTaskFormData>
  }

  const prepareStoryDataForBackend = (storyData: Partial<UserStory>): Partial<BackendTaskFormData> => {
    const cleanData = { ...storyData }
    
    // Remove properties that should not be sent to the backend
    delete cleanData.id
    
    // Convert assignee format for backend
    if (cleanData.assignee && Array.isArray(cleanData.assignee)) {
      return {
        ...cleanData,
        assignee: convertAssigneeToBackend(cleanData.assignee)
      }
    }
    
    return cleanData as Partial<BackendTaskFormData>
  }

  // Update task con información de usuario
  const updateTask = useCallback(async (taskId: string, taskData: Partial<TaskFormData>) => {
    if (!currentProjectId) return

    setError(null)

    const updateData = {
      ...taskData,
      modified_by: getUserInfo(),
      date_modified: new Date().toISOString()
    }

    try {
      // Prepare data for backend
      const backendData = prepareTaskDataForBackend(updateData)

      // Backend call - using PUT for full task update
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error:', errorData)
        throw new Error(`Failed to update task: ${response.status} ${errorData}`)
      }

      // Get the updated task from the response and convert format
      const updatedTask = await response.json()
      // Convert assignee format for the context
      updatedTask.assignee = convertAssigneeFromBackend(updatedTask.assignee)
      
      // Optimistic update with properly formatted data
      const contextUpdate = {
        ...updatedTask,
        modified_by: updateData.modified_by as [string, string],
        updated_at: new Date().toISOString()
      }
      
      tasksContext.updateTaskInProject(currentProjectId, taskId, contextUpdate)

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'))
      console.error('Error updating task:', err)
      
      // Revert optimistic update by fetching fresh data
      try {
        const freshData = await getProjectTasks(currentProjectId)
        tasksContext.setTasksForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        console.error('Error refreshing after failed update:', refreshErr)
      }
    }
  }, [currentProjectId, getUserInfo, tasksContext])

  // Update task comments - Fixed to send proper data structure
  const updateTaskComments = useCallback(async (taskId: string, comments: any[]) => {
    if (!currentProjectId) return

    setError(null)

    try {
      // First, try the comments endpoint (POST for adding new comment)
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comments[comments.length - 1]) // Send the latest comment
      })

      if (response.ok) {
        // If successful, update the context optimistically
        tasksContext.updateTaskInProject(currentProjectId, taskId, { comments })
        return
      }

      // If comments endpoint doesn't work, get the full task data and update it completely
      const allTasks = tasksContext.getTasksForProject(currentProjectId)
      const task = allTasks.find(t => t.id === taskId)
      
      if (!task || !isTask(task)) {
        throw new Error('Task not found or is not a task')
      }

      // Create full task data for update - ensuring all required fields are present
      const fullTaskData: TaskFormData = {
        id: task.id,
        title: task.title,
        description: task.description,
        user_story_id: task.user_story_id,
        assignee: task.assignee || [],
        sprint_id: task.sprint_id || "",
        status_khanban: task.status_khanban,
        priority: task.priority,
        story_points: task.story_points,
        deadline: task.deadline || "",
        comments: comments,
        created_by: task.created_by || ["", ""],
        modified_by: getUserInfo(),
        finished_by: task.finished_by || ["", ""],
        date_created: task.date_created || "",
        date_modified: new Date().toISOString(),
        date_completed: task.date_completed || ""
      }

      // Use updateTask with complete data
      await updateTask(taskId, fullTaskData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update comments'))
      console.error('Error updating comments:', err)
    }
  }, [currentProjectId, tasksContext, updateTask, getUserInfo, isTask])

  // Update task status
  const updateTaskStatus = useCallback(async (taskId: string, newStatus: KanbanStatus) => {
    if (!currentProjectId) return

    setError(null)

    try {
      // Optimistic update
      const updateData = {
        status_khanban: newStatus,
        modified_by: getUserInfo() as [string, string],
        date_modified: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(newStatus === 'Done' && { 
          finished_by: getUserInfo() as [string, string],
          date_completed: new Date().toISOString()
        })
      }
      
      tasksContext.updateTaskInProject(currentProjectId, taskId, updateData)

      // Backend call - using PATCH for status update only
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_khanban: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task status'))
      console.error('Error updating task status:', err)
      
      // Revert optimistic update
      try {
        const freshData = await getProjectTasks(currentProjectId)
        tasksContext.setTasksForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        console.error('Error refreshing after failed update:', refreshErr)
      }
    }
  }, [currentProjectId, getUserInfo, tasksContext])


  // Update task con información de usuario
  const updateStory = useCallback(async (story_id: string, storyData: Partial<UserStory>) => {
    if (!currentProjectId) return

    setError(null)

    const updateData = {
      ...storyData,
    }

    try {
      // Prepare data for backend
      const backendData = prepareStoryDataForBackend(updateData)

      // Backend call - using PUT for full task update
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/userstories/${story_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error:', errorData)
        throw new Error(`Failed to update task: ${response.status} ${errorData}`)
      }

      // Get the updated task from the response and convert format
      const updateStory = await response.json()
      // Convert assignee format for the context
      updateStory.assignee = convertAssigneeFromBackend(updateStory.assignee)
      
      // Optimistic update with properly formatted data
      const contextUpdate = {
        ...updateStory,
      }
      
      storiesContext.updateUserStoryInProject(currentProjectId,story_id, contextUpdate)

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'))
      console.error('Error updating task:', err)
      
      // Revert optimistic update by fetching fresh data
      try {
        const freshData = await getProjectUserStories(currentProjectId)
        storiesContext.setUserStoriesForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        console.error('Error refreshing after failed update:', refreshErr)
      }
    }
  }, [currentProjectId, getUserInfo, storiesContext])

  // Update story status
  const updateStoryStatus = useCallback(async (storyId: string, newStatus: KanbanStatus) => {
    if (!currentProjectId) return

    setError(null)  

    try {
      // Optimistic update
      storiesContext.updateUserStoryInProject(currentProjectId, storyId, {
        status_khanban: newStatus
      })

      // Backend call for story status update (same endpoint as tasks)
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/userstories/${storyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_khanban: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update story status')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update story status'))
      console.error('Error updating story status:', err)
      
      // Revert optimistic update
      try {
        const freshData = await getProjectUserStories(currentProjectId)
        storiesContext.setUserStoriesForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        console.error('Error refreshing after failed update:', refreshErr)
      }
    }
  }, [currentProjectId, storiesContext])

  // Update story comments
  const updateStoryComments = useCallback(async (storyId: string, comments: any[]) => {
    if (!currentProjectId) return

    setError(null)

    try {
      // Optimistic update
      storiesContext.updateUserStoryInProject(currentProjectId, storyId, {
        comments: comments
      })

      // Backend call for story comments update (same endpoint as tasks)
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/userstories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comments[comments.length - 1]) // Assuming we're adding the last comment
      })

      if (!response.ok) {
        throw new Error('Failed to update story comments')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update story comments'))
      console.error('Error updating story comments:', err)
    }
  }, [currentProjectId, storiesContext])

  // Create task con información de usuario  
  const createTask = useCallback(async (taskData: Omit<TaskFormData, 'id' | 'created_by' | 'modified_by'>) => {
    if (!currentProjectId) return

    setError(null)

    const userInfo = getUserInfo()
    const fullTaskData: Omit<TaskFormData, 'id'> = {
      ...taskData,
      created_by: userInfo,
      modified_by: userInfo,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString()
    }

    try {
      // Prepare data for backend
      const backendData = prepareTaskDataForBackend(fullTaskData)

      const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Backend error:', errorData)
        throw new Error(`Failed to create task: ${response.status} ${errorData}`)
      }

      const newTask = await response.json()
      // Convert assignee format before adding to context
      newTask.assignee = convertAssigneeFromBackend(newTask.assignee)
      tasksContext.addTaskToProject(currentProjectId, newTask)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'))
    }
  }, [currentProjectId, getUserInfo, tasksContext])

  // Delete task or story con optimistic updates
  const deleteTask = useCallback(async (taskId: string) => {
    if (!currentProjectId) return

    setError(null)

    try {
      // Find the item to determine if it's a task or story
      const allItems = [
        ...tasksContext.getTasksForProject(currentProjectId),
        ...storiesContext.getUserStoriesForProject(currentProjectId)
      ]
      
      const item = allItems.find(i => i.id === taskId)
      if (!item) {
        throw new Error('Item not found')
      }

      if (isTask(item)) {
        // It's a task
        tasksContext.removeTaskFromProject(currentProjectId, taskId)

        const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks/${taskId}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to delete task')
        }
      } else {
        // It's a story - use deleteStory instead
        await deleteStory(taskId)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'))
      console.error('Error deleting item:', err)
    }
  }, [currentProjectId, tasksContext, storiesContext])

  // Delete story con optimistic updates
  const deleteStory = useCallback(async (storyId: string) => {
    if (!currentProjectId) return

    setError(null)

    try {
      storiesContext.removeUserStoryFromProject(currentProjectId, storyId)

      const response = await fetch(`${API_URL}/projects/${currentProjectId}/userstories/${storyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete story')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete story'))
      console.error('Error deleting story:', err)
    }
  }, [currentProjectId, storiesContext])

  // Fetch tasks with proper assignee conversion
  const fetchTasks = useCallback(async (projectId: string): Promise<Task[]> => {
    const cachedTasks = tasksContext.getTasksForProject(projectId)

    if (cachedTasks.length === 0) {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks/khanban`)
      if (!response.ok) {
        throw new Error(`Failed to fetch kanban tasks: ${response.statusText}`)
      }
      const fullTasks: Task[] = await response.json()
      // Convert assignee format for all tasks
      fullTasks.forEach(task => {
        task.assignee = convertAssigneeFromBackend(task.assignee)
      })
      return fullTasks
    }

    // Check if tasks are partial and need enrichment
    const sample = cachedTasks[0]
    const isPartial = !sample.user_story_title || !sample.sprint_name

    if (isPartial) {
      const response = await fetch(`${API_URL}/projects/${projectId}/tasks_partial`)
      if (!response.ok) {
        throw new Error(`Failed to fetch partial task data: ${response.statusText}`)
      }

      const partialData = await response.json()
      const partialMap = Object.fromEntries(partialData.map((t: any) => [t.id, t]))

      const enrichedTasks = cachedTasks.map(task => {
        const partial = partialMap[task.id]
        return partial
          ? { ...task, 
              user_story_title: partial.user_story_title, 
              sprint_name: partial.sprint_name,
              assignee: convertAssigneeFromBackend(task.assignee) // Ensure proper format
            }
          : { ...task, assignee: convertAssigneeFromBackend(task.assignee) }
      })

      return enrichedTasks
    }

    // Ensure proper assignee format for cached tasks
    return cachedTasks.map(task => ({
      ...task,
      assignee: convertAssigneeFromBackend(task.assignee)
    }))
  }, [tasksContext])

  // Refresh functions
  const refreshTasksForProject = useCallback(async (projectId: string) => {
    // Verificar si ya estamos cargando este proyecto
    if (loadingProjectId === projectId) {
      return
    }
    
    try {
      await tasksContext.loadTasksIfNeeded(projectId, fetchTasks, 1000 * 60 * 5)
    } catch (err) {
      console.error('Error refreshing tasks:', err)
      setError(err instanceof Error ? err : new Error('Failed to refresh tasks'))
    }
  }, [tasksContext, fetchTasks, loadingProjectId])

   const refreshStoriesForProject = useCallback(async (projectId: string) => {
    // Verificar si ya estamos cargando este proyecto
    if (loadingProjectId === projectId) {
      return
    }
    
    try {
      await storiesContext.loadUserStoriesIfNeeded(projectId, getProjectUserStories, 1000 * 60 * 5)
    } catch (err) {
      console.error('Error refreshing stories:', err)
      setError(err instanceof Error ? err : new Error('Failed to refresh stories'))
    }
  }, [storiesContext, loadingProjectId])

  // Refresh kanban data
  const refreshKanban = useCallback(async () => {
    if (!currentProjectId) return

    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([
        refreshTasksForProject(currentProjectId),
        refreshStoriesForProject(currentProjectId)
      ])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh kanban'))
    } finally {
      setIsLoading(false)
    }
  }, [currentProjectId, refreshTasksForProject, refreshStoriesForProject])



  // Combinar datos para el Kanban
  const tasks = currentProjectId 
    ? combineTasksAndStories(
        tasksContext.getTasksForProject(currentProjectId),
        storiesContext.getUserStoriesForProject(currentProjectId)
      )
    : {
        backlog: [],
        todo: [],
        inprogress: [],
        inreview: [],
        done: []
      }

  // Determinar el estado de loading
  const contextIsLoading = currentProjectId 
    ? tasksContext.isLoading(currentProjectId) || storiesContext.isLoading(currentProjectId)
    : false

  return (
    <KanbanContext.Provider
      value={{
        tasks,
        isLoading: isLoading || contextIsLoading,
        error,
        currentProjectId,
        setCurrentProject,
        updateTaskStatus,
        updateStoryStatus,
        deleteTask,
        deleteStory,
        refreshKanban,
        createTask,
        updateTask,
        updateTaskComments,
        updateStoryComments,
        updateStory,
        reset,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}