// components/kanban/KanbanColumn.tsx
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { TaskCardCompactView } from "../dashboard/dashboard.taskcardcompactview"
import { KanbanColumnProps } from "../../interfaces/kanbaninterfaces"

export const KanbanColumn = ({
  columnId,
  title,
  items,
  count,
  colorClass,
  view,
  onDelete,
  onStatusUpdate,
  onTaskSelect,
  maxHeight = "35vh",
  onScroll,
  virtualizedContent
}: KanbanColumnProps) => {

 const getColumnClasses = () => {
    if (view === "dashboard") {
      return "bg-gray-100 rounded-md p-4 flex-1 min-w-0"
    } else {
      return "bg-gray-100 rounded-md p-4 min-w-[20vw] max-w-[20vw] flex-shrink-0"
    }
  }

  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={getColumnClasses()}
        >
          {/* Header de la columna */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-lg text-gray-700">{title}</h3>
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${colorClass}`}>
              {count}
            </span>
          </div>

          {/* Contenido de la columna */}
          <div
            className={`h-full overflow-y-auto pr-1`}
            style={{ maxHeight }}
            onScroll={onScroll}
          >
            {virtualizedContent || (
              items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCardCompactView
                        task={item}
                        columnId={columnId}
                        view={view}
                        onDelete={onDelete}
                        onChangeStatus={onStatusUpdate}
                        onViewDetails={onTaskSelect}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
          </div>
          
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}