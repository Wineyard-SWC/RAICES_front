import { Button } from "@/components/ui/button"
import { MoreVertical, MessageSquare } from "lucide-react"
import { Task } from "@/types/task"

interface TaskCardProps {
  task: Task
  columnId: string
}

export const TaskCard = ({ task, columnId }: TaskCardProps) => {
  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  }

  return (
    <div className="bg-white rounded-md p-4 shadow-sm border border-gray-100 mb-3 relative">
      <div className="absolute right-2 top-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      <h3 className="font-medium text-gray-900 pr-6">{task.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{task.description}</p>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <span className="text-xs">{task.date}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.comments > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{task.comments}</span>
            </div>
          )}
          <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  )
}