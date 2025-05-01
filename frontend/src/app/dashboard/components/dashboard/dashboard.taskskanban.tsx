"use client"

import { useState,useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { TaskCard } from "./dashboard.taskcard"
import { TaskColumns } from "@/types/taskkanban"

interface TasksKanbanProps {
  tasks: TaskColumns
  onNavigate?: () => void;
  view?: string;
  refreshTasks?: () => void;
}


export const TasksKanban = ({ tasks, onNavigate, view, refreshTasks }: TasksKanbanProps) => {
  const [taskState, setTaskState] = useState<TaskColumns>({
    backlog: tasks.backlog || [],
    todo: tasks.todo || [],
    inprogress: tasks.inprogress || [],
    inreview: tasks.inreview || [],
    done: tasks.done || [],
  });

  useEffect(() => {
    setTaskState({
      backlog: tasks.backlog || [],
      todo: tasks.todo || [],
      inprogress: tasks.inprogress || [],
      inreview: tasks.inreview || [],
      done: tasks.done || [],
    });
  }, [tasks]);

  const onDragEnd = (result: any) => {
    const { source, destination } = result

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return
    }

    setTaskState((prev) => {
      const newState = { ...prev }
      const sourceCol = source.droppableId as keyof typeof newState
      const destCol = destination.droppableId as keyof typeof newState

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
  }

  const handleDelete = (taskId: string, columnId: string) => {
    setTaskState((prev) => {
      const newState = { ...prev }
      newState[columnId as keyof typeof newState] = newState[columnId as keyof typeof newState].filter(task => task.id !== taskId);
      return newState
    });
  }

  const columnStyles = {
    backlog: {
      count: taskState.backlog.length,
      header: "Backlog",
      color: "bg-green-100 text-green-800"
    },
    todo: {
      count: taskState.todo.length,
      header: "To do",
      color: "bg-blue-100 text-blue-800"
    },
    inprogress: {
      count: taskState.inprogress.length,
      header: "In Progress",
      color: "bg-yellow-100 text-yellow-800"
    },
    inreview: {
      count: taskState.inreview.length, 
      header: "In Review",
      color: "bg-purple-100 text-purple-800"
    },
    done: {
      count: taskState.done.length,
      header: "Done",
      color: "bg-orange-100 text-orange-800"
    },
  }

  return (
    <Card 
    className="border border-[#D3C7D3] shadow-sm ">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle 
          className={view === "dashboard" ? "text-2xl font-semibold" : "text-2xl font-bold"}
        >
          {view === "dashboard" ? "My Task" : "All Backlog Items"}
        </CardTitle>
        <div className="flex items-center gap-2">
          {view === "dashboard" ? (
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-lg text-gray-400" />
              <Input placeholder="Search tasks..." className="pl-8 h-9 bg-white" /> 
            </div> 
          ):('')}
          {view === "dashboard" ? (
            <Button 
            variant="default" 
            className="bg-[#4a2b5c] hover:bg-[#3a2248]"
            onClick={onNavigate}
            >
              View full Backlog
            </Button>):('')}
          
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
                            {taskState[columnId as keyof typeof taskState].map((task, index) => (
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
                        className="bg-gray-100 rounded-md p-4 min-w-[500px] max-w-[500px] flex-shrink-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-lg text-gray-700">{column.header}</h3>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${column.color}`}>
                            {column.count}
                          </span>
                        </div>

                        <div className="h-full overflow-y-auto max-h-[500px] pr-1">
                          {taskState[columnId as keyof typeof taskState].map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <TaskCard task={task} columnId={columnId} onDelete={() => handleDelete(task.id, columnId)} />
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