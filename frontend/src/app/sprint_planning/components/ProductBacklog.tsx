"use client"
import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BacklogItemCard from "./BacklogItemCard"
import type { SprintUserStory } from "@/types/sprint"
import type { Task } from "@/types/task"

interface Props {
  userStories: SprintUserStory[]
  onToggleUserStory: (id: string) => void
  tasks: Task[]
}

export default function ProductBacklog({ userStories, tasks, onToggleUserStory }: Props) {
  const [searchTerm,      setSearchTerm]   = useState("")
  const [priorityFilter,  setPriority]     = useState<string | null>(null)

  const tasksMap = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach(task => {
      map.set(task.id, task);
    });
    return map;
  }, [tasks]);

  const enrichedUserStories = useMemo(() => {
    return userStories.map(sprintStory => ({
      ...sprintStory,
      taskObjects: sprintStory.tasks
        .map(taskId => tasksMap.get(taskId))
        .filter(Boolean) as Task[]
    }));
  }, [userStories, tasksMap]);

  /* ------------ helpers ------------ */
  const nextPriority = () => {
    if (!priorityFilter)        return "high"
    if (priorityFilter === "high")   return "medium"
    if (priorityFilter === "medium") return "low"
    return null
  }

  /* ------------ filtro seguro ------------ */
  const filteredStories = enrichedUserStories
    .filter(Boolean)                               // quita nulos en el array
    .filter(us => !!us.userStory)                  // quita los que no traen historia
    .filter(us => {
      const story = us.userStory!                  // ya existe por la línea anterior

      /* --- búsqueda libre --- */
      const matchesSearch =
        !searchTerm ||
        story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchTerm.toLowerCase())

      /* --- prioridad --- */
      const matchesPriority =
        !priorityFilter ||
        (story.priority?.toLowerCase() ?? "medium") === priorityFilter

      return matchesSearch && matchesPriority
    })

  /* ------------ UI ------------ */
  return (
    <div className="space-y-4 mb-6">
      {/* header filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Product Backlog</h2>

        <div className="flex items-center gap-2">
          {/* búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search items…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* filtro prioridad */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPriority(nextPriority())}
              className={
                priorityFilter === "high"
                  ? "border-red-500 text-red-500"
                  : priorityFilter === "medium"
                  ? "border-yellow-500 text-yellow-500"
                  : priorityFilter === "low"
                  ? "border-green-500 text-green-500"
                  : ""
              }
            >
              <Filter className="h-4 w-4" />
            </Button>

            {priorityFilter && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#4A2B4D] text-[10px] text-white">
                {priorityFilter[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* lista historias */}
      <div>
        <h3 className="text-md font-medium mb-2 text-[#4a2b4a]">User Stories</h3>

        <div className="space-y-3">
          {filteredStories.length === 0 ? (
            // 🔥 FIX: Mensaje cuando no hay user stories
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <svg 
                  className="h-8 w-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              {userStories.length === 0 ? (
                // No hay user stories en absoluto
                <>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    No User Stories Available
                  </h4>
                  <p className="text-sm text-gray-500 mb-1">
                    Create user stories in your project backlog first
                  </p>
                  <p className="text-xs text-gray-400">
                    User stories help organize work into manageable pieces for your sprint
                  </p>
                </>
              ) : (
                // Hay user stories pero están filtradas
                <>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    No Stories Match Your Filters
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Try adjusting your search term or priority filter
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="text-xs"
                    >
                      Clear Search
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriority(null)}
                      className="text-xs"
                    >
                      Clear Filter
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // 🔥 FIX: Lista normal cuando hay stories
            filteredStories.map(sprintStory => (
              <BacklogItemCard
                key={sprintStory.id}
                type="story"
                item={sprintStory.userStory}
                tasks={sprintStory.taskObjects}
                isSelected={sprintStory.selected}
                onAdd={() => onToggleUserStory(sprintStory.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
