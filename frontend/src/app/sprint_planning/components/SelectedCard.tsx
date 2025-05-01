"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  id:         string
  type:       "story" | "bug"
  title?:     string
  points:     number
  tasksCount: number
  onRemove?:  () => void
}

export default function SelectedCard({
  type,
  title = "Untitled",
  points,
  tasksCount,
  onRemove,
}: Props) {
  const badge =
    type === "bug" ? (
      <span className="rounded bg-[#ff0000] px-1.5 py-0.5 text-[10px] font-medium text-white">BUG</span>
    ) : (
      <span className="rounded bg-[#440071] px-1.5 py-0.5 text-[10px] font-medium text-white">STORY</span>
    )

  return (
    <div className="rounded-md bg-[#f5f0f1] p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">{badge}</div>

        {onRemove && (
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0"
            onClick={onRemove}
            aria-label="Remove item"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="mt-1 text-xs">{title}</div>
      <div className="mt-0.5 text-[10px] text-gray-500">
        {points} points • {tasksCount} tasks
      </div>
    </div>
  )
}
