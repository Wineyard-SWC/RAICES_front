"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { TaskCard } from "./dashboard.taskcard"
import { isBug, TaskColumns } from "@/types/taskkanban"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { TaskOrStory } from "@/types/taskkanban"
import { Task } from "@/types/task"
import { UserStory } from "@/types/userstory"

interface TasksKanbanProps {
  onNavigate?: () => void;
  view?: string;
}

export const TasksKanban = ({ onNavigate, view }: TasksKanbanProps) => {
  const { 
    tasks,
    isLoading,
    updateTaskStatus,
    updateStoryStatus,
    updateBugStatus,
    deleteTask,
  } = useKanban()

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [priorityFilter, setPriorityFilter] = useState<string>("All")
  const [localTasks, setLocalTasks] = useState<TaskColumns>({
    backlog: [],
    todo: [],
    inprogress: [],
    inreview: [],
    done: [],
  })

  const [visibleStartIndexes, setVisibleStartIndexes] = useState<Record<string, number>>({
    backlog: 0,
    todo: 0,
    inprogress: 0,
    inreview: 0,
    done: 0,
  })

  const ITEMS_PER_COLUMN = 10
  const ESTIMATED_CARD_HEIGHT = 360 

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, columnId: string) => {
    const scrollTop = e.currentTarget.scrollTop
    const startIndex = Math.floor(scrollTop / ESTIMATED_CARD_HEIGHT)
    setVisibleStartIndexes((prev) => ({
      ...prev,
      [columnId]: startIndex,
    }))
  }

  const isTask = (item: TaskOrStory): item is Task => {
    return 'user_story_id' in item || 
          (!('acceptanceCriteria' in item) && !('assigned_epic' in item))
  }
  
  const isUserStory = (item: TaskOrStory): item is UserStory => {
    return 'acceptanceCriteria' in item || 'assigned_epic' in item
  }

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const kanbanStatusMap: Record<string, 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done'> = {
    backlog: "Backlog",
    todo: "To Do",
    inprogress: "In Progress",
    inreview: "In Review",
    done: "Done",
  }

  const handleStatusUpdate = useCallback(async (
    item: TaskOrStory, 
    newStatus: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done'
  ) => {
    try {
      if (isUserStory(item)) {
        await updateStoryStatus(item.id, newStatus)
      } 
      else if (isBug(item)) {
        await updateBugStatus(item.id, newStatus)
      } 
      else if (isTask(item)) {
        await updateTaskStatus(item.id, newStatus)
      } else {
        console.error('Unknown item type:', item)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }, [updateTaskStatus, updateStoryStatus, updateBugStatus])

  const onDragEnd = useCallback((result: any) => {
    const { source, destination } = result

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return
    }

    const sourceCol = source.droppableId as keyof typeof localTasks
    const destCol = destination.droppableId as keyof typeof localTasks

    const draggedItem = localTasks[sourceCol][source.index]

    setLocalTasks((prev) => {
      const newState = { ...prev }
      const sourceTasks = [...newState[sourceCol]]
      const [movedTask] = sourceTasks.splice(source.index, 1)
  
      if (sourceCol === destCol) {
        sourceTasks.splice(destination.index, 0, movedTask)
        newState[sourceCol] = sourceTasks
      } else {
        const destTasks = [...newState[destCol]]
        destTasks.splice(destination.index, 0, movedTask)
        newState[sourceCol] = sourceTasks
        newState[destCol] = destTasks
      }
  
      return newState
    })

    if (sourceCol !== destCol && draggedItem) {
      const newStatus = kanbanStatusMap[destCol]
      handleStatusUpdate(draggedItem, newStatus)
    }
  }, [localTasks, handleStatusUpdate, kanbanStatusMap])

  const handleDelete = useCallback(async (taskId: string, columnId: string) => {
    try {
      const column = localTasks[columnId as keyof TaskColumns]
      const item = column.find(item => item.id === taskId)
      
      if (!item) {
        console.error('Item not found:', taskId)
        return
      }
      else {
        await deleteTask(taskId)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }, [localTasks, deleteTask])
  
  const columnStyles = {
    backlog: {
      count: filtered(localTasks.backlog).length,
      header: "Backlog",
      color: "bg-green-100 text-green-800"
    },
    todo: {
      count: filtered(localTasks.todo).length,
      header: "To Do",
      color: "bg-blue-100 text-blue-800"
    },
    inprogress: {
      count: filtered(localTasks.inprogress).length,
      header: "In Progress",
      color: "bg-yellow-100 text-yellow-800"
    },
    inreview: {
      count: filtered(localTasks.inreview).length, 
      header: "In Review",
      color: "bg-purple-100 text-purple-800"
    },
    done: {
      count: filtered(localTasks.done).length,
      header: "Done",
      color: "bg-orange-100 text-orange-800"
    },
  }

  function filtered(column: TaskOrStory[]) {
    return column.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType =
        typeFilter === "All" ||
        (typeFilter === "Bug" && isBug(task)) ||
        (typeFilter === "Task" && isTask(task) && !isBug(task)) ||
        (typeFilter === "Story" && isUserStory(task))
      
      const matchesPriority =
        priorityFilter === "All" || task.priority?.toLowerCase() === priorityFilter.toLowerCase()
      
      return matchesSearch && matchesType && matchesPriority
    })
  }

  if (isLoading) {
    return (
      <Card className="border border-[#D3C7D3] shadow-sm">
        <CardContent className="flex items-center justify-center py-8">
          <p>Loading tasks...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-[#D3C7D3] shadow-sm">
      <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <CardTitle 
          className={view === "dashboard" ? "text-2xl font-semibold" : "text-2xl font-bold"}
        >
          {view === "dashboard" ? "My Tasks" : "All Backlog Items"}
        </CardTitle>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-lg text-gray-400" />
            <Input
              placeholder={view === "dashboard" ? "Search sprint tasks..." : "Search..."}
              className="pl-8 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtros solo visibles en la vista completa */}
          {view !== "dashboard" && (
            <>
              <select 
                aria-label="Type"
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)} 
                className="h-9 px-2 border rounded-md"
              >
                <option value="All">All Types</option>
                <option value="Bug">Bugs</option>
                <option value="Task">Tasks</option>
                <option value="Story">User Stories</option>
              </select>
              <select 
                aria-label="Priority"
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)} 
                className="h-9 px-2 border rounded-md"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </>
          )}
          
          {/* Botón para navegar a la vista completa */}
          {view === "dashboard" && onNavigate && (
            <Button 
              variant="default" 
              className="bg-[#4a2b5c] hover:bg-[#3a2248]"
              onClick={onNavigate}
            >
              View full Backlog
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          {view === "dashboard" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(columnStyles)
                .filter(([key]) => ["inprogress", "inreview", "done"].includes(key))
                .map(([columnId, column]) => (
                  <Droppable key={columnId} droppableId={columnId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="bg-gray-100 rounded-md p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-lg text-gray-700">{column.header}</h3>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${column.color}`}>
                            {column.count}
                          </span>
                        </div>

                        <div className="h-full overflow-y-auto max-h-[35vh] pr-1">
                          {filtered(localTasks[columnId as keyof typeof localTasks])
                            .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TaskCard 
                                    task={task} 
                                    columnId={columnId} 
                                    view={view} 
                                    onChangeStatus={handleStatusUpdate}
                                    onDelete={handleDelete} 
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
            </div>
          ) : (
            <div className="h-[70vh] flex gap-6 overflow-x-auto pb-2">
              {Object.entries(columnStyles).map(([columnId, column]) => (
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-100 rounded-md p-4 min-w-[20vw] max-w-[20vw] flex-shrink-0"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-lg text-gray-700">{column.header}</h3>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${column.color}`}>
                          {column.count}
                        </span>
                      </div>
                      
                      <div
                        className="h-full overflow-y-auto pr-1"
                        onScroll={(e) => handleScroll(e, columnId)}
                      >
                        {(() => {
                          const tasks = filtered(localTasks[columnId as keyof typeof localTasks]);
                          const start = visibleStartIndexes[columnId] || 0;
                          const end = Math.min(start + ITEMS_PER_COLUMN, tasks.length);
                          const visibleTasks = tasks.slice(start, end);

                          return (
                            <>
                              <div style={{ height: `${start * ESTIMATED_CARD_HEIGHT}px` }} />

                              {visibleTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={start + index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <TaskCard
                                        task={task}
                                        columnId={columnId}
                                        view={view}
                                        onDelete={handleDelete}
                                        onChangeStatus={handleStatusUpdate}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}

                              <div style={{ height: `${(tasks.length - end) * ESTIMATED_CARD_HEIGHT}px` }} />
                            </>
                          );
                        })()}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          )}
        </DragDropContext>
      </CardContent>
    </Card>
  )
}