"use client"

import { useState, useMemo } from "react"
import { DragDropContext, Draggable } from "@hello-pangea/dnd"
import { 
Card, 
CardTitle,
CardHeader,
CardContent 
} from "@/components/card"
import { TaskOrStory } from "@/types/taskkanban"
import { useKanbanLogic } from "../../hooks/useKanbanLogic"
import { useKanbanFilters } from "../../hooks/useKanbanFilters"
import { useKanbanDragDrop } from "../../hooks/useKanbanDragDrop"

import { useUserPermissions } from "@/contexts/UserPermissions"

import { KanbanFilters } from "../kanban/kanbanfilters"
import { KanbanColumn } from "../kanban/kanbancolumn"
import { KanbanListView } from "../kanban/kanbanlistview"
import { TaskCardCompactView } from "./dashboard.taskcardcompactview"
import ConfirmDialog from "@/components/confimDialog"

import { TasksKanbanProps } from "../../interfaces/kanbaninterfaces"

const PERMISSION_REQ_MANAGE = 1 << 2
const ITEMS_PER_COLUMN = 10
const ESTIMATED_CARD_HEIGHT = 360


   

export const TasksKanban = ({onNavigate, view, onTaskSelect }: TasksKanbanProps) => {
  const projectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") || "" : "";

  const { filters, updateSearchTerm, updateTypeFilter, updatePriorityFilter } = useKanbanFilters(view)
  const { 
    kanbanData, 
    isLoading, 
    refreshData, 
    updateItemStatus, 
    deleteItem, 
    stats 
  } = useKanbanLogic({ projectId, view, filters })
  const { onDragEnd } = useKanbanDragDrop({ kanbanData, onStatusUpdate: updateItemStatus })

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; columnId: string } | null>(null)
  const [visibleStartIndexes, setVisibleStartIndexes] = useState<Record<string, number>>({
    backlog: 0,
    todo: 0,
    inprogress: 0,
    inreview: 0,
    done: 0,
  })

  // Permisos
  const { hasPermission } = useUserPermissions()
  const canManageItems = hasPermission(PERMISSION_REQ_MANAGE)

  // Configuración de columnas
  const columnStyles = useMemo(() => ({
    backlog: {
      count: stats.backlog,
      header: "Backlog",
      color: "bg-green-100 text-green-800"
    },
    todo: {
      count: stats.todo,
      header: "To Do", 
      color: "bg-blue-100 text-blue-800"
    },
    inprogress: {
      count: stats.inprogress,
      header: "In Progress",
      color: "bg-yellow-100 text-yellow-800"
    },
    inreview: {
      count: stats.inreview,
      header: "In Review",
      color: "bg-purple-100 text-purple-800"
    },
    done: {
      count: stats.done,
      header: "Done",
      color: "bg-orange-100 text-orange-800"
    },
  }), [stats])

  // Handlers
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, columnId: string) => {
    const scrollTop = e.currentTarget.scrollTop
    const startIndex = Math.floor(scrollTop / ESTIMATED_CARD_HEIGHT)
    setVisibleStartIndexes(prev => ({ ...prev, [columnId]: startIndex }))
  }

  const handleDelete = (taskId: string, columnId: string) => {
    setItemToDelete({ id: taskId, columnId })
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    
    try {
      await deleteItem(itemToDelete.id)
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Obtener datos para vista dashboard
  const getDashboardTasks = () => {
    const relevantColumns = ["inprogress", "inreview", "done"] as const
    return relevantColumns.flatMap(columnId => 
      kanbanData[columnId].map(task => ({
        ...task,
        status: columnStyles[columnId].header
      }))
    )
  }

  // Crear contenido virtualizado para columnas
  const createVirtualizedContent = (columnId: string, items: TaskOrStory[]) => {
    const start = visibleStartIndexes[columnId] || 0
    const end = Math.min(start + ITEMS_PER_COLUMN, items.length)
    const visibleItems = items.slice(start, end)

    return (
      <>
        <div style={{ height: `${start * ESTIMATED_CARD_HEIGHT}px` }} />
        
        {visibleItems.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={start + index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <TaskCardCompactView
                  task={task}
                  columnId={columnId}
                  view={view}
                  onDelete={canManageItems ? handleDelete : undefined}
                  onChangeStatus={updateItemStatus}
                  onViewDetails={onTaskSelect}
                />
              </div>
            )}
          </Draggable>
        ))}
        
        <div style={{ height: `${(items.length - end) * ESTIMATED_CARD_HEIGHT}px` }} />
      </>
    )
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
        <CardTitle className={view === "dashboard" ? "text-2xl font-semibold" : "text-2xl font-bold"}>
          {view === "dashboard" ? "My Tasks" : "All Backlog Items"}
        </CardTitle>
        
        <KanbanFilters
          searchTerm={filters.searchTerm}
          typeFilter={filters.typeFilter}
          priorityFilter={filters.priorityFilter}
          onSearchChange={updateSearchTerm}
          onTypeChange={updateTypeFilter}
          onPriorityChange={updatePriorityFilter}
          onNavigate={onNavigate}
          view={view}
          viewMode={viewMode}
          onViewModeChange={() => setViewMode(prev => prev === "list" ? "kanban" : "list")}
          showAllFilters={view !== "dashboard"}
        />
      </CardHeader>

      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          {view === "dashboard" ? (
            // Vista Dashboard
            viewMode === "list" ? (
              <KanbanListView
                items={getDashboardTasks()}
                onTaskSelect={onTaskSelect}
                onDelete={canManageItems ? handleDelete : undefined}
                canManageItems={canManageItems}
                emptyMessage="No tasks assigned to you"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(columnStyles)
                  .filter(([key]) => ["inprogress", "inreview", "done"].includes(key))
                  .map(([columnId, column]) => (
                    <KanbanColumn
                      key={columnId}
                      columnId={columnId}
                      title={column.header}
                      items={kanbanData[columnId as keyof typeof kanbanData]}
                      count={column.count}
                      colorClass={column.color}
                      view={view}
                      onDelete={canManageItems ? handleDelete : undefined}
                      onStatusUpdate={updateItemStatus}
                      onTaskSelect={onTaskSelect}
                      maxHeight="35vh"
                    />
                  ))}
              </div>
            )
          ) : (
            <div className="h-[70vh] flex gap-6 overflow-x-auto pb-2">
              {Object.entries(columnStyles).map(([columnId, column]) => (
                <KanbanColumn
                  key={columnId}
                  columnId={columnId}
                  title={column.header}
                  items={kanbanData[columnId as keyof typeof kanbanData]}
                  count={column.count}
                  colorClass={column.color}
                  view={view}
                  onDelete={canManageItems ? handleDelete : undefined}
                  onStatusUpdate={updateItemStatus}
                  onTaskSelect={onTaskSelect}
                  maxHeight="100%"
                  onScroll={(e) => handleScroll(e, columnId)}
                  virtualizedContent={createVirtualizedContent(
                    columnId, 
                    kanbanData[columnId as keyof typeof kanbanData]
                  )}
                />
              ))}
            </div>
          )}
        </DragDropContext>
      </CardContent>

      {/* Dialog de confirmación */}
      {showDeleteConfirm && itemToDelete && canManageItems && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          onCancel={() => {
            setShowDeleteConfirm(false)
            setItemToDelete(null)
          }}
          onConfirm={confirmDelete}
        />
      )}
    </Card>
  )
}
