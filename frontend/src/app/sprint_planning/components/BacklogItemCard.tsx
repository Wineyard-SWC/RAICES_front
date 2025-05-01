"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserStory } from "@/types/userstory"
import type { Task } from "@/types/task"

interface Props {
  type: "story" | "bug"
  item: UserStory | undefined        // <- puede llegar undefined
  tasks: Task[] | undefined
  onAdd: () => void
  isSelected?: boolean
}

export default function BacklogItemCard({
  type,
  item,
  tasks = [],
  onAdd,
  isSelected = false,
}: Props) {
  /* ---------- salida temprana si item no existe ---------- */
  if (!item) return null

  /* ---------- helpers ---------- */
  const priority = (item as any).priority?.toLowerCase?.() ?? "medium"

  const getPriorityBadge = () => {
    switch (priority) {
      case "high":
        return (
          <span className="rounded bg-[#ffb8b8] px-2 py-0.5 text-xs font-medium text-[#730101]">
            high
          </span>
        )
      case "low":
        return (
          <span className="rounded bg-[#b8ffc4] px-2 py-0.5 text-xs font-medium text-[#0d7301]">
            low
          </span>
        )
      default:
        return (
          <span className="rounded bg-[#ffecb8] px-2 py-0.5 text-xs font-medium text-[#735a01]">
            medium
          </span>
        )
    }
  }

  const getTypeBadge = () =>
    type === "bug" ? (
      <span className="rounded bg-[#ff0000] px-2 py-0.5 text-xs font-medium text-white">
        BUG
      </span>
    ) : (
      <span className="rounded bg-[#440071] px-2 py-0.5 text-xs font-medium text-white">
        STORY
      </span>
    )

  const totalPoints = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0)

  /* ---------- render ---------- */
  return (
    <div
      className={`rounded-lg border ${
        isSelected ? "border-[#4A2B4D] bg-[#F5F0F1]/50" : "border-gray-200"
      } bg-white p-4`}
    >
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTypeBadge()}
          {getPriorityBadge()}
          <span className="text-xs text-gray-500">
            {item.uuid?.substring(0, 8) ?? "-"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{totalPoints} points</span>
          <Button
            size="sm"
            variant="outline"
            className={`h-7 gap-1 rounded-md ${
              isSelected
                ? "border-red-500 text-red-500"
                : "border-[#4a2b4a] text-[#4a2b4a]"
            } px-2 text-xs`}
            onClick={onAdd}
          >
            <Plus className="h-3 w-3" /> {isSelected ? "Remove" : "Add"}
          </Button>
        </div>
      </div>

      {/* body */}
      <h3 className="font-medium">{item.title}</h3>
      <p className="text-sm text-gray-500">{item.description}</p>

      {tasks.length > 0 && (
        <div className="mt-3 pl-3 border-l-2 border-gray-200">
          <div className="text-xs text-gray-500 mb-1">{tasks.length} tasks</div>
          {tasks.slice(0, 3).map(t => (
            <div key={t.id} className="text-xs text-gray-700">
              • {t.title}
            </div>
          ))}
          {tasks.length > 3 && (
            <div className="text-xs text-gray-500 mt-1">
              + {tasks.length - 3} more tasks
            </div>
          )}
        </div>
      )}
    </div>
  )
}
