"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { TaskCard } from "./dashboard.taskcard"
import { TaskColumns } from "@/types/taskkanban"
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
    deleteTask,
    deleteStory
  } = useKanban()

  const [searchTerm, setSearchTerm] = useState("")
  const [localTasks, setLocalTasks] = useState<TaskColumns>({
    backlog: [],
    todo: [],
    inprogress: [],
    inreview: [],
    done: [],
  })

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

  const statusDisplayMap: Record<keyof typeof localTasks, string> = {
    backlog: "Backlog",
    todo: "To Do",
    inprogress: "In Progress",
    inreview: "In Review",
    done: "Done",
  }

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
      } else if (isTask(item)) {
        await updateTaskStatus(item.id, newStatus)
      } else {
        console.error('Unknown item type:', item)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }, [updateTaskStatus, updateStoryStatus, isTask, isUserStory])

   const onDragEnd = useCallback((result: any) => {
    const { source, destination } = result

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return
    }

    const sourceCol = source.droppableId as keyof typeof localTasks
    const destCol = destination.droppableId as keyof typeof localTasks

    // Obtener el item que se está moviendo ANTES de actualizar el estado
    const draggedItem = localTasks[sourceCol][source.index]

    // Actualizar el estado local optimistamente
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

    // Actualizar status en el backend solo si cambió de columna
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

      if (isUserStory(item)) {
        await deleteStory(taskId)
      } else if (isTask(item)) {
        await deleteTask(taskId)
      } else {
        console.error('Unknown item type for delete:', item)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }, [localTasks, deleteTask, deleteStory, isTask, isUserStory])
  
  const columnStyles = {
    backlog: {
      count: localTasks.backlog.length,
      header: "Backlog",
      color: "bg-green-100 text-green-800"
    },
    todo: {
      count: localTasks.todo.length,
      header: "To do",
      color: "bg-blue-100 text-blue-800"
    },
    inprogress: {
      count: localTasks.inprogress.length,
      header: "In Progress",
      color: "bg-yellow-100 text-yellow-800"
    },
    inreview: {
      count: localTasks.inreview.length, 
      header: "In Review",
      color: "bg-purple-100 text-purple-800"
    },
    done: {
      count: localTasks.done.length,
      header: "Done",
      color: "bg-orange-100 text-orange-800"
    },
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

  console.log(localTasks)
  return (
    <Card className="border border-[#D3C7D3] shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle 
          className={view === "dashboard" ? "text-2xl font-semibold" : "text-2xl font-bold"}
        >
          {view === "dashboard" ? "My Task" : "All Backlog Items"}
        </CardTitle>
        <div className="flex items-center gap-2">
          {view === "dashboard" && (
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-lg text-gray-400" />
              <Input
                placeholder="Search sprint tasks..."
                className="pl-8 h-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          {view === "dashboard" && (
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

                        <div className="h-full overflow-y-auto max-h-[500px] pr-1">
                          {localTasks[columnId as keyof typeof localTasks]
                            .filter(task => 
                                task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                task.description.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <TaskCard task={task} columnId={columnId} view={view} />
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
            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {Object.entries(columnStyles).map(([columnId, column]) => (
                <Droppable key={columnId} droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-100 rounded-md p-4 min-w-[450px] max-w-[450px] flex-shrink-0"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-lg text-gray-700">{column.header}</h3>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${column.color}`}>
                          {column.count}
                        </span>
                      </div>

                      <div className="h-full overflow-y-auto max-h-[500px] pr-1">
                        {localTasks[columnId as keyof typeof localTasks]
                          .filter(task => 
                            task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <TaskCard task={task} columnId={columnId} onDelete={handleDelete} />
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
          )}
        </DragDropContext>
      </CardContent>
    </Card>
  )
}