import { TaskColumns, TaskOrStory } from "@/types/taskkanban"
import { KanbanStatus } from "@/types/task"

export interface KanbanFilters {
  searchTerm: string
  typeFilter: string
  priorityFilter: string
}

export interface UseKanbanLogicProps {
  projectId: string | null
  view?: string
  filters: KanbanFilters
}

export interface UseKanbanFiltersReturn {
  filters: KanbanFilters
  updateSearchTerm: (term: string) => void
  updateTypeFilter: (type: string) => void
  updatePriorityFilter: (priority: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export interface UseKanbanDragDropProps {
  kanbanData: TaskColumns
  onStatusUpdate: (item: TaskOrStory, newStatus: KanbanStatus) => Promise<void>
}

export interface KanbanFiltersProps extends KanbanFilters {
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onNavigate?: () => void
  view?: string
  viewMode?: "list" | "kanban"
  onViewModeChange?: () => void
  showAllFilters?: boolean
}

export interface KanbanColumnProps {
  columnId: string
  title: string
  items: TaskOrStory[]
  count: number
  colorClass: string
  view?: string
  onDelete?: (taskId: string, columnId: string) => void
  onStatusUpdate?: (item: TaskOrStory, newStatus: KanbanStatus) => Promise<void>
  onTaskSelect?: (task: TaskOrStory) => void
  maxHeight?: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  virtualizedContent?: React.ReactNode
}

export interface KanbanListViewProps {
  items: TaskOrStory[]
  onTaskSelect?: (task: TaskOrStory) => void
  onDelete?: (taskId: string, status: string) => void
  canManageItems?: boolean
  emptyMessage?: string
}

export interface TasksKanbanProps {
  onNavigate?: () => void;
  view?: string;
  onTaskSelect?: (task: TaskOrStory) => void;
}