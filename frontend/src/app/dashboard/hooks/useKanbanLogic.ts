// hooks/useKanbanLogic.ts
import { useState, useEffect, useCallback, useMemo } from "react"
import { TaskColumns, TaskOrStory, isBug, isTask, isUserStory } from "@/types/taskkanban"
import { KanbanStatus } from "@/types/task"
import { useTasks } from "@/contexts/taskcontext"
import { useUserStories } from "@/contexts/saveduserstoriescontext"
import { useBugs } from "@/contexts/bugscontext"
import { useUser } from "@/contexts/usercontext"
import { UseKanbanLogicProps } from "../interfaces/kanbaninterfaces"

export const useKanbanLogic = ({ projectId, view, filters }: UseKanbanLogicProps) => {
  const { searchTerm, typeFilter, priorityFilter } = filters
  const { userId } = useUser()
  
  const tasksContext = useTasks()
  const storiesContext = useUserStories()
  const bugsContext = useBugs()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const tasks = projectId ? tasksContext.getTasksForProject(projectId) : []
  const stories = projectId ? storiesContext.getUserStoriesForProject(projectId) : []
  const bugs = projectId ? bugsContext.getBugsForProject(projectId) : []

  const isLoading = projectId ? (
    tasksContext.isLoading(projectId) || 
    storiesContext.isLoading(projectId) || 
    bugsContext.isLoading(projectId)
  ) : false

  const statusToColumnMap: Record<string, keyof TaskColumns> = {
    'backlog': 'backlog',
    'to do': 'todo', 
    'in progress': 'inprogress',
    'in review': 'inreview',
    'done': 'done'
  }

  const filterItems = useCallback((items: TaskOrStory[]) => {
    return items.filter(item => {
      // Filtro de búsqueda
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filtro de tipo
      const matchesType =
        typeFilter === "All" ||
        (typeFilter === "Bug" && isBug(item)) ||
        (typeFilter === "Task" && isTask(item) && !isBug(item)) ||
        (typeFilter === "Story" && isUserStory(item))
      
      // Filtro de prioridad
      const matchesPriority =
        priorityFilter === "All" || item.priority?.toLowerCase() === priorityFilter.toLowerCase()
      
      let matchesAssignee = true
      if (view === "dashboard" && userId) {
        matchesAssignee = Array.isArray(item.assignee) && item.assignee.some(assignee => {
          // Verificar que assignee existe y no es null/undefined
          if (!assignee) return false
          
          // Formato { users: [id, name] } - Verificar users existe antes de acceder
          if (assignee.users && Array.isArray(assignee.users) && assignee.users.length > 0) {
            // Verificar si es el primer elemento (formato simple [id, name])
            if (assignee.users[0] === userId) return true
            
            // Buscar en posiciones pares para formato [id1, name1, id2, name2, ...]
            for (let i = 0; i < assignee.users.length; i += 2) {
              if (assignee.users[i] === userId) {
                return true
              }
            }
          }
          
          // Formato { id, name }
          if ((assignee as any).id === userId) return true
          
          // Formato [id, name] (assignee es un array)
          if (Array.isArray(assignee) && assignee.length > 0 && assignee[0] === userId) return true
          
          return false
        })
      }
      
      const finalMatch = matchesSearch && matchesType && matchesPriority && matchesAssignee
      
    
      return finalMatch
    })
  }, [searchTerm, typeFilter, priorityFilter, view, userId])

  const kanbanData = useMemo(() => {
    const allItems = [...tasks, ...stories, ...bugs]
    
    const columns: TaskColumns = {
      backlog: [],
      todo: [],
      inprogress: [],
      inreview: [],
      done: []
    }

    allItems.forEach(item => {
      const statusKey = statusToColumnMap[item.status_khanban?.toLowerCase().trim() ?? ''] || 'backlog'
      columns[statusKey].push(item)
    })

    return {
      backlog: filterItems(columns.backlog),
      todo: filterItems(columns.todo),
      inprogress: filterItems(columns.inprogress),
      inreview: filterItems(columns.inreview),
      done: filterItems(columns.done)
    }
  }, [tasks, stories, bugs, filterItems, statusToColumnMap])

  const refreshData = useCallback(async () => {
    if (!projectId || isRefreshing) return

    setIsRefreshing(true)
    try {
      await Promise.all([
        tasksContext.loadTasksIfNeeded(projectId, async (pid) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${pid}/tasks/khanban`)
          if (!response.ok) throw new Error('Failed to fetch tasks')
          return response.json()
        }, 1000 * 60 * 5),
        
        storiesContext.loadUserStoriesIfNeeded(projectId, async (pid) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${pid}/userstories`)
          if (!response.ok) throw new Error('Failed to fetch stories')
          return response.json()
        }, 1000 * 60 * 5),
        
        bugsContext.loadBugsIfNeeded(projectId, async (pid) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bugs/project/${pid}`)
          if (!response.ok) throw new Error('Failed to fetch bugs')
          return response.json()
        }, 1000 * 60 * 5)
      ])
    } catch (error) {
      console.error('Error refreshing kanban data:', error)
      throw error
    } finally {
      setIsRefreshing(false)
    }
  }, [projectId, isRefreshing, tasksContext, storiesContext, bugsContext])

  const updateItemStatus = useCallback(async (item: TaskOrStory, newStatus: KanbanStatus) => {
    if (!projectId) return

    try {
      if (isUserStory(item)) {
        storiesContext.updateUserStoryInProject(projectId, item.uuid, { status_khanban: newStatus })
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/userstories/${item.uuid}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status_khanban: newStatus })
        })
        
        if (!response.ok) throw new Error('Failed to update story status')
      } 
      else if (isBug(item)) {
        bugsContext.updateBugInProject(projectId, item.id, { status_khanban: newStatus })
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/bugs/${item.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status_khanban: newStatus })
        })
        
        if (!response.ok) throw new Error('Failed to update bug status')
      } 
      else if (isTask(item)) {
        tasksContext.updateTaskInProject(projectId, item.id, { status_khanban: newStatus })
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${item.id}/status`, {
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status_khanban: newStatus })
        })
        
        if (!response.ok) throw new Error('Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating item status:', error)
      await refreshData()
      throw error
    }
  }, [projectId, tasksContext, storiesContext, bugsContext, refreshData])

  const deleteItem = useCallback(async (itemId: string) => {
    if (!projectId) return

    try {
      const allItems = [...tasks, ...stories, ...bugs]
      const item = allItems.find(i => i.id === itemId)
      
      if (!item) throw new Error('Item not found')

      if (isTask(item)) {
        tasksContext.removeTaskFromProject(projectId, itemId)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${itemId}`, { 
          method: 'DELETE' 
        })
      } 
      else if (isUserStory(item)) {
        storiesContext.removeUserStoryFromProject(projectId, item.uuid)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/userstories/${itemId}`, { 
          method: 'DELETE' 
        })
      } 
      else if (isBug(item)) {
        bugsContext.removeBugFromProject(projectId, itemId)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bugs/${itemId}`, { 
          method: 'DELETE' 
        })
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      await refreshData()
      throw error
    }
  }, [projectId, tasks, stories, bugs, tasksContext, storiesContext, bugsContext, refreshData])

  useEffect(() => {
    if (projectId) {
      refreshData().catch(console.error)
    }
  }, [projectId])

  return {
    kanbanData,
    isLoading: isLoading || isRefreshing,
    refreshData,
    updateItemStatus,
    deleteItem,
    
    stats: {
      backlog: kanbanData.backlog.length,
      todo: kanbanData.todo.length, 
      inprogress: kanbanData.inprogress.length,
      inreview: kanbanData.inreview.length,
      done: kanbanData.done.length,
      total: Object.values(kanbanData).flat().length
    }
  }
}