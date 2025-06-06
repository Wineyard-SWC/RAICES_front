// components/kanban/KanbanListView.tsx
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { 
getStatusColor, 
getPriorityColor,
getTypeColor, 
getTypeLabel 
} from "../../utils/kanabnUtils"
import { KanbanListViewProps } from "../../interfaces/kanbaninterfaces"

export const KanbanListView = ({
  items,
  onTaskSelect,
  onDelete,
  canManageItems,
  emptyMessage = "No tasks found"
}: KanbanListViewProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <Droppable droppableId="dashboard-list" isDropDisabled={true}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={true}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 ${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}`}
                  >
                    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        {/* Badges de estado, prioridad y tipo */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status_khanban)}`}>
                            {task.status_khanban}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(task)}`}>
                            {getTypeLabel(task)}
                          </span>
                        </div>
                        
                        {/* Título y descripción */}
                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {onTaskSelect && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onTaskSelect(task)
                            }}
                          >
                            View
                          </Button>
                        )}
                        {canManageItems && onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(task.id, task.status_khanban?.toLowerCase().replace(' ', '') || 'backlog')
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

