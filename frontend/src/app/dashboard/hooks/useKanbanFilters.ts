// hooks/useKanbanFilters.ts
import { useState, useCallback } from "react"
import { KanbanFilters } from "../interfaces/kanbaninterfaces"
import { UseKanbanFiltersReturn } from "../interfaces/kanbaninterfaces"

export const useKanbanFilters = (view?: string): UseKanbanFiltersReturn => {
  const [filters, setFilters] = useState<KanbanFilters>({
    searchTerm: "",
    typeFilter: "All",
    priorityFilter: "All"
  })

  const updateSearchTerm = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }))
  }, [])

  const updateTypeFilter = useCallback((type: string) => {
    setFilters(prev => ({ ...prev, typeFilter: type }))
  }, [])

  const updatePriorityFilter = useCallback((priority: string) => {
    setFilters(prev => ({ ...prev, priorityFilter: priority }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      typeFilter: "All", 
      priorityFilter: "All"
    })
  }, [])

  const hasActiveFilters = filters.searchTerm !== "" || 
                          filters.typeFilter !== "All" || 
                          filters.priorityFilter !== "All"

  return {
    filters,
    updateSearchTerm,
    updateTypeFilter,
    updatePriorityFilter,
    clearFilters,
    hasActiveFilters
  }
}