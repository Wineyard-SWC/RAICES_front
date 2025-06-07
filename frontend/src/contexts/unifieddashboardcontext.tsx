"use client"

import React, { createContext, useContext, 
  useState, useCallback, useEffect, useRef } from "react"
import { TaskColumns, TaskOrStory, isBug,isTask,isUserStory } from "@/types/taskkanban"
import { KanbanStatus, Task, TaskFormData } from "@/types/task"
import { UserStory } from "@/types/userstory"
import { useTasks } from "@/contexts/taskcontext"
import { useUserStories } from "@/contexts/saveduserstoriescontext"
import { useUser } from "./usercontext"
import { getProjectUserStories } from "@/utils/getProjectUserStories"
import { getProjectTasks } from "@/utils/postTasks"
import { getProjectBugs } from "@/utils/getProjectBugs" 
import { useBugs } from "./bugscontext"
import { Bug } from "@/types/bug"
import { print, printError } from "@/utils/debugLogger"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Define the Workinguser interface to match your data structure
interface Workinguser {
  users: [string, string]
}

// Backend format for assignee (from Firestore)
interface FirestoreAssignee {
  id: string
  name:string
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
  updateBugStatus: (bugId: string, newStatus: KanbanStatus) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deleteStory: (storyId: string) => Promise<void>
  refreshKanban: () => Promise<void>
  createTask: (taskData: Omit<TaskFormData, 'id' | 'created_by' | 'modified_by'>) => Promise<void>
  updateTask: (taskId: string, taskData: Partial<TaskFormData>) => Promise<void>
  updateTaskComments: (taskId: string, comments: any[]) => Promise<void>
  updateStoryComments: (storyId: string, comments: any[]) => Promise<void>
  updateStory: (story_id: string, storyData: Partial<UserStory>) => Promise<void>
  updateBug: (bug_id: string, bugData: Partial<Bug>) => Promise<void>
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
  const bugsContext = useBugs();
  const { userId, userData, isLoading: isUserLoading, error: userError } = useUser()
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null)

  
  const reset = () => {
    setCurrentProjectId(null)
    setError(null)
    setIsLoading(false)
    tasksContext.clearAllCache()
    storiesContext.clearAllCache()
    bugsContext.clearAllCache()
    localStorage.removeItem("currentProjectId")
   }

  const getUserInfo = useCallback((): [string, string] => {
    if (!userId || isUserLoading || userError) {
      return ["", ""]
    }
    return [userId, userData?.name || ""]
  }, [userId, userData?.name, isUserLoading, userError])

  const convertAssigneeFromBackend = (backendAssignee: any): Workinguser[] => {
    if (!backendAssignee) return []
  
    if (Array.isArray(backendAssignee)) {
      return backendAssignee.map(user => {
        // Si es un objeto { id, name } (formato de Firestore)
        if (typeof user === 'object' && 'id' in user && 'name' in user) {
          return { users: [user.id, user.name] as [string, string] }
        }
        // Si es una tupla [id, name] (compatibilidad hacia atrás)
        else if (Array.isArray(user) && user.length >= 2) {
          return { users: [user[0], user[1]] as [string, string] }
        }
        // Si ya tiene el formato correcto { users: [id, name] }
        else if (typeof user === 'object' && 'users' in user && Array.isArray(user.users)) {
          return { users: [user.users[0], user.users[1]] as [string, string] }
        }
        console.warn('Unexpected assignee format:', user)
        return { users: ["", ""] as [string, string] }
      })
    }
    
    return []
  }

  const convertAssigneeToBackend = (frontendAssignee: Workinguser[]): FirestoreAssignee[] => {
  if (!frontendAssignee || !Array.isArray(frontendAssignee)) return []

    return frontendAssignee.map(workingUser => {
      if (!workingUser || !workingUser.users || !Array.isArray(workingUser.users)) {
        console.warn('Invalid assignee format:', workingUser)
        return { id: "", name: "" }
      }
      
      return {
        id: workingUser.users[0] || "",
        name: workingUser.users[1] || ""
      }
    }).filter(assignee => assignee.id !== "") 
  }

  

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
      
      let processedTask = { ...task }
      
      if (task.assignee && !Array.isArray(task.assignee)) {
        processedTask.assignee = convertAssigneeFromBackend(task.assignee)
      } else if (task.assignee && Array.isArray(task.assignee) && task.assignee.length > 0) {
        const firstItem = task.assignee[0]
        if (Array.isArray(firstItem)) {
          processedTask.assignee = task.assignee
        }
      }
      
      columns[statusKey].push(processedTask as Task)
    })

    return columns
  }, [])

  // Combinar tasks y stories en formato Kanban
    const combineTasksAndStories = useCallback((tasks: Task[], stories: UserStory[], bugs: Bug[]): TaskColumns => {
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

    bugs.forEach(bug => {
      const statusKey = statusMap[bug.status_khanban?.toLowerCase().trim() ?? ''] || 'backlog'
      taskColumns[statusKey].push(bug)
    })

    return taskColumns
    }, [convertTasksToColumns])

  const setCurrentProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId)
    
    if (typeof window !== "undefined") {
      localStorage.setItem("currentProjectId", projectId)
    }
  }, [])

  const prepareTaskDataForBackend = (taskData: Partial<TaskFormData>): Partial<BackendTaskFormData> => {
    const cleanData = { ...taskData }
    
    delete cleanData.id
    
    if (cleanData.assignee && Array.isArray(cleanData.assignee)) {
      const normalizedAssignees = cleanData.assignee.map(assignee => {

        if (assignee && typeof assignee === 'object' && 'users' in assignee && Array.isArray(assignee.users)) {
          return assignee
        }

        if (Array.isArray(assignee) && assignee.length >= 2) {
          return { users: [assignee[0], assignee[1]] }
        }

        console.warn('Invalid assignee format detected:', assignee)
        return null
      }).filter(Boolean) 
      
      return {
        ...cleanData,
        assignee: convertAssigneeToBackend(normalizedAssignees as Workinguser[]) as any[]
      }
    }
    
    return cleanData as Partial<BackendTaskFormData>
  }

  const prepareStoryDataForBackend = (storyData: Partial<UserStory>): Partial<BackendTaskFormData> => {
    const cleanData = { ...storyData }
    
    delete cleanData.id
    
    if (cleanData.assignee && Array.isArray(cleanData.assignee)) {
      const normalizedAssignees = cleanData.assignee.map(assignee => {
        if (assignee && typeof assignee === 'object' && 'users' in assignee && Array.isArray(assignee.users)) {
          return assignee
        }
        if (Array.isArray(assignee) && assignee.length >= 2) {
          return { users: [assignee[0], assignee[1]] }
        }
        console.warn('Invalid assignee format detected in story:', assignee)
        return null
      }).filter(Boolean)
      
      return {
        ...cleanData,
        assignee: convertAssigneeToBackend(normalizedAssignees as Workinguser[] )as any[]
      }
    }
    
    return cleanData as Partial<BackendTaskFormData>
  }

  const prepareBugDataForBackend = (storyData: Partial<Bug>): Partial<BackendTaskFormData> => {
    const cleanData = { ...storyData }
    
    delete cleanData.id
    
    if (cleanData.assignee && Array.isArray(cleanData.assignee)) {
      const normalizedAssignees = cleanData.assignee.map(assignee => {
        if (assignee && typeof assignee === 'object' && 'users' in assignee && Array.isArray(assignee.users)) {
          return assignee
        }
        if (Array.isArray(assignee) && assignee.length >= 2) {
          return { users: [assignee[0], assignee[1]] }
        }
        console.warn('Invalid assignee format detected in bug:', assignee)
        return null
      }).filter(Boolean)
      
      return {
        ...cleanData,
        assignee: convertAssigneeToBackend(normalizedAssignees as Workinguser[]) as any[]
      }
    }
    
    return cleanData as Partial<BackendTaskFormData>
  }

  const updateBug = useCallback(async (bug_id: string, bugData: Partial<Bug>) => {
    if (!currentProjectId) return

    setError(null)

    const updateData = {
      ...bugData,
    }
    print("UPDATE",updateData)
    try {
      // Prepare data for backend
      const backendData = prepareBugDataForBackend(updateData)

      print(backendData)
      // Backend call - using PUT for full bug update
      const response = await fetch(`${API_URL}/bugs/${bug_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        printError('Backend error:', errorData)
        throw new Error(`Failed to update task: ${response.status} ${errorData}`)
      }

      // Get the updated task from the response and convert format
      const updateBug = await response.json()
      // Convert assignee format for the context
      updateBug.assignee = convertAssigneeFromBackend(updateBug.assignee)
      
      // Optimistic update with properly formatted data
      const contextUpdate = {
        ...updateBug,
      }
      
      bugsContext.updateBugInProject(currentProjectId,bug_id, contextUpdate)

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update bug'))
      printError('Error updating bug:', err)
      
      // Revert optimistic update by fetching fresh data
      try {
        const freshData = await getProjectBugs(currentProjectId)
        bugsContext.setBugsForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        printError('Error refreshing after failed update:', refreshErr)
      }
    }
  }, [currentProjectId, getUserInfo, storiesContext])

  const updateBugStatus = useCallback(async (bugId: string, newStatus: KanbanStatus) => {
    if (!currentProjectId) return

    setError(null)

    try {
      const updateData = {
        status_khanban: newStatus,
        modifiedAt: new Date().toISOString(),
        ...(newStatus === 'Done' && { 
          finishedAt: new Date().toISOString()
        })
      }
      
      bugsContext.updateBugInProject(currentProjectId, bugId, updateData)

      const response = await fetch(`${API_URL}/projects/${currentProjectId}/bugs/${bugId}/status`, {
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
      printError('Error updating task status:', err)
      
      try {
        const freshData = await getProjectBugs(currentProjectId)
        bugsContext.setBugsForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        printError('Error refreshing after failed update:', refreshErr)
      }
    }
  }, [currentProjectId, bugsContext])

  const updateTask = useCallback(async (taskId: string, taskData: Partial<TaskFormData>) => {
    if (!currentProjectId) return

    setError(null)

    const updateData = {
      ...taskData,
      modified_by: getUserInfo(),
      date_modified: new Date().toISOString()
    }

    const normalizedData = {
      ...updateData,
      assignee: updateData.assignee ? updateData.assignee.map(assignee => {
        // Si ya tiene el formato correcto { users: [id, name] }
        if (assignee && typeof assignee === 'object' && 'users' in assignee) {
          return assignee
        }
        // Si es un array directo [id, name]
        if (Array.isArray(assignee) && (assignee as any[]).length >= 2) {
          return { users: [assignee[0], assignee[1]] } as Workinguser
        }
        // Formato inválido
        console.warn('Invalid assignee format in updateTask:', assignee)
        return null
      }).filter(Boolean) as Workinguser[] : []
    }

  try {
    // 3) Preparamos el payload para el backend (resto de campos, fechas, etc.)
    const backendData = prepareTaskDataForBackend(normalizedData);

    // 4) Llamada al PUT
    const response = await fetch(
      `${API_URL}/projects/${currentProjectId}/tasks/${taskId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData)
      }
    );
    if (!response.ok) {
      const errorData = await response.text();
      printError('Backend error:', errorData);
      throw new Error(`Failed to update task: ${response.status} ${errorData}`);
    }

    // 5) Actualizamos el contexto local
    const updatedTask = await response.json();
    // convertAssigneeFromBackend si necesitas volver a { users: [...] }
    updatedTask.assignee = convertAssigneeFromBackend(updatedTask.assignee);

    const contextUpdate = {
      ...updatedTask,
      modified_by: normalizedData.modified_by as [string, string],
      updated_at: new Date().toISOString()
    };
    tasksContext.updateTaskInProject(currentProjectId, taskId, contextUpdate);

  } catch (err) {
    setError(err instanceof Error ? err : new Error('Failed to update task'));
    printError('Error updating task:', err);

    // fallback: recargar todo si algo falla
    try {
      const freshData = await getProjectTasks(currentProjectId);
      tasksContext.setTasksForProject(currentProjectId, freshData);
    } catch (refreshErr) {
      printError('Error refreshing after failed update:', refreshErr);
    }
  }
}, [currentProjectId, getUserInfo, tasksContext]);

  const updateTaskComments = useCallback(async (taskId: string, comments: any[]) => {
    if (!currentProjectId) return

    setError(null)

    try {
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comments[comments.length - 1]) 
      })

      if (response.ok) {
        tasksContext.updateTaskInProject(currentProjectId, taskId, { comments })
        return
      }

      const allTasks = tasksContext.getTasksForProject(currentProjectId)
      const task = allTasks.find(t => t.id === taskId)
      
      if (!task || !isTask(task)) {
        throw new Error('Task not found or is not a task')
      }

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

      await updateTask(taskId, fullTaskData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update comments'))
      printError('Error updating comments:', err)
    }
  }, [currentProjectId, tasksContext, updateTask, getUserInfo, isTask])

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: KanbanStatus) => {
    if (!currentProjectId) return

    setError(null)

    try {
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
      printError('Error updating task status:', err)
      
      try {
        const freshData = await getProjectTasks(currentProjectId)
        tasksContext.setTasksForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        printError('Error refreshing after failed update:', refreshErr)
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
        printError('Backend error:', errorData)
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
      printError('Error updating task:', err)
      
      // Revert optimistic update by fetching fresh data
      try {
        const freshData = await getProjectUserStories(currentProjectId)
        storiesContext.setUserStoriesForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        printError('Error refreshing after failed update:', refreshErr)
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
      printError('Error updating story status:', err)
      
      // Revert optimistic update
      try {
        const freshData = await getProjectUserStories(currentProjectId)
        storiesContext.setUserStoriesForProject(currentProjectId, freshData)
      } catch (refreshErr) {
        printError('Error refreshing after failed update:', refreshErr)
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
      printError('Error updating story comments:', err)
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
        printError('Backend error:', errorData)
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
      const allItems = [
        ...tasksContext.getTasksForProject(currentProjectId),
        ...storiesContext.getUserStoriesForProject(currentProjectId),
        ...bugsContext.getBugsForProject(currentProjectId)
      ]
      
      const item = allItems.find(i => i.id === taskId)
      if (!item) {
        throw new Error('Item not found')
      }

      if (isTask(item)) {
        tasksContext.removeTaskFromProject(currentProjectId, taskId)
        await fetch(`${API_URL}/projects/${currentProjectId}/tasks/${taskId}`, { method: 'DELETE' })
      } 
      else if (isUserStory(item)) {
        storiesContext.removeUserStoryFromProject(currentProjectId, item.uuid)
        await deleteStory(taskId)
      } 
      else if (isBug(item)) {
        bugsContext.removeBugFromProject(currentProjectId, taskId)
        await fetch(`${API_URL}/bugs/${taskId}`, { method: 'DELETE' })
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'))
      printError('Error deleting item:', err)
    }
  }, [currentProjectId, tasksContext, storiesContext, bugsContext])

  // Delete story con optimistic updates
  const deleteStory = useCallback(async (storyId: string) => {
    if (!currentProjectId) return

    setError(null)

    try {
      const response = await fetch(`${API_URL}/projects/${currentProjectId}/userstories/${storyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete story')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete story'))
      printError('Error deleting story:', err)
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
      printError('Error refreshing tasks:', err)
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
      printError('Error refreshing stories:', err)
      setError(err instanceof Error ? err : new Error('Failed to refresh stories'))
    }
  }, [storiesContext, loadingProjectId])

   const refreshBugsForProject = useCallback(async (projectId: string) => {
    if (loadingProjectId === projectId) return
    try {
      await bugsContext.loadBugsIfNeeded(projectId, getProjectBugs, 1000 * 60 * 5)
    } catch (err) {
      printError('Error refreshing bugs:', err)
      setError(err instanceof Error ? err : new Error('Failed to refresh bugs'))
    }
  }, [bugsContext, loadingProjectId])

  // Refresh kanban data
  const refreshKanban = useCallback(async () => {
    if (!currentProjectId) return

    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([
        refreshTasksForProject(currentProjectId),
        refreshStoriesForProject(currentProjectId),
        refreshBugsForProject(currentProjectId)

      ])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh kanban'))
    } finally {
      setIsLoading(false)
    }
  }, [currentProjectId, refreshTasksForProject, refreshStoriesForProject,refreshBugsForProject])



  // Combinar datos para el Kanban
  const tasks = currentProjectId 
    ? combineTasksAndStories(
        tasksContext.getTasksForProject(currentProjectId),
        storiesContext.getUserStoriesForProject(currentProjectId),
        bugsContext.getBugsForProject(currentProjectId)
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
        updateBug,
        updateBugStatus,
        reset,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}