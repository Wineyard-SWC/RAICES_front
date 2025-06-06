import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Columns, List } from "lucide-react"
import { KanbanFiltersProps } from "../../interfaces/kanbaninterfaces"

export const KanbanFilters = ({
  searchTerm,
  typeFilter,
  priorityFilter,
  onSearchChange,
  onTypeChange,
  onPriorityChange,
  onNavigate,
  view,
  viewMode,
  onViewModeChange,
  showAllFilters = true
}: KanbanFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-lg text-gray-400" />
        <Input
          placeholder={view === "dashboard" ? "Search sprint tasks..." : "Search..."}
          className="pl-8 h-9 bg-white"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Filtros adicionales (solo en vista completa) */}
      {showAllFilters && view !== "dashboard" && (
        <>
          <select 
            aria-label="Type"
            value={typeFilter} 
            onChange={(e) => onTypeChange(e.target.value)} 
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
            onChange={(e) => onPriorityChange(e.target.value)} 
            className="h-9 px-2 border rounded-md"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </>
      )}
      
      {/* Botón para vista completa */}
      {view === "dashboard" && onNavigate && (
        <Button 
          variant="default" 
          className="bg-[#4a2b5c] hover:bg-[#3a2248]"
          onClick={onNavigate}
        >
          View full Backlog
        </Button>
      )}
      
      {/* Toggle vista lista/kanban */}
      {view === "dashboard" && onViewModeChange && (
        <Button 
          variant="default" 
          onClick={onViewModeChange}
          className="bg-[#4a2b5c] hover:bg-[#3a2248] flex items-center gap-2"
        >
          {viewMode === "list" ? <Columns className="h-4 w-4" /> : <List className="h-4 w-4" />}
          {viewMode === "list" ? "Kanban" : "List"}
        </Button>
      )}
    </div>
  )
}