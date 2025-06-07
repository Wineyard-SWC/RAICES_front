// hooks/useKanbanDragDrop.ts
import { useCallback } from "react"
import { TaskColumns } from "@/types/taskkanban"
import { KanbanStatus } from "@/types/task"
import { UseKanbanDragDropProps } from "../interfaces/kanbaninterfaces"
import { printError } from "@/utils/debugLogger"


const kanbanStatusMap: Record<string, KanbanStatus> = {
  backlog: "Backlog",
  todo: "To Do", 
  inprogress: "In Progress",
  inreview: "In Review",
  done: "Done"
}

export const useKanbanDragDrop = ({ kanbanData, onStatusUpdate }: UseKanbanDragDropProps) => {
  
  const onDragEnd = useCallback(async (result: any) => {
    const { source, destination } = result

    if (!destination || (
      source.droppableId === destination.droppableId && 
      source.index === destination.index
    )) {
      return
    }

    const sourceCol = source.droppableId as keyof TaskColumns
    const destCol = destination.droppableId as keyof TaskColumns

    const draggedItem = kanbanData[sourceCol][source.index]
    
    if (!draggedItem) {
      printError('Dragged item not found')
      return
    }

    if (sourceCol !== destCol) {
      const newStatus = kanbanStatusMap[destCol]
      
      if (!newStatus) {
        printError('Invalid destination column:', destCol)
        return
      }

      try {
        await onStatusUpdate(draggedItem, newStatus)
      } catch (error) {
        printError('Error updating item status during drag:', error)
      }
    }
  }, [kanbanData, onStatusUpdate])

  return {
    onDragEnd
  }
}