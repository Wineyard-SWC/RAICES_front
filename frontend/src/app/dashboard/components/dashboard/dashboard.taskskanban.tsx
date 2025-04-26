"use client"

import { useState } from "react"
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
}


export const TasksKanban = ({ tasks, onNavigate, view }: TasksKanbanProps) => {
  const [taskState, setTaskState] = useState(tasks)

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

  const columnStyles = {
    inProgress: {
      count: taskState.inProgress.length,
      header: "In Progress",
      color: "bg-blue-100 text-blue-800"
    },
    inReview: {
      count: taskState.inReview.length,
      header: "In Review",
      color: "bg-yellow-100 text-yellow-800"
    },
    completed: {
      count: taskState.completed.length,
      header: "Completed",
      color: "bg-green-100 text-green-800"
    },
  }

  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search tasks..." className="pl-8 h-9 bg-white" />
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(columnStyles).map(([columnId, column]) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-50 rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">{column.header}</h3>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${column.color}`}>
                        {column.count}
                      </span>
                    </div>

                    <div>
                      {taskState[columnId as keyof typeof taskState].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <TaskCard task={task} columnId={columnId} />
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
        </DragDropContext>
      </CardContent>
    </Card>
  )
}