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
          {filteredStories.map(sprintStory => (
            <BacklogItemCard
              key={sprintStory.id}
              type="story"
              item={sprintStory.userStory}     // ¡ya existe!
              tasks={sprintStory.taskObjects}
              isSelected={sprintStory.selected}
              onAdd={() => onToggleUserStory(sprintStory.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
