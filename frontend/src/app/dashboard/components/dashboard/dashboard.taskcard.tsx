import { Button } from "@/components/ui/button"
import { MoreVertical, MessageSquare,Eye,Trash } from "lucide-react"
import { useState } from "react"
import TaskDetailModal from "./dashboard.taskdetails"
import { TaskOrStory } from "@/types/taskkanban"
import ConfirmDialog from "@/components/confimDialog"


interface TaskCardProps {
  task: TaskOrStory;
  columnId: string;
  view?: string;
  usertype?: string;
  onDelete?: (id: string, columid:string) => void;
}

export const TaskCard = ({ task, columnId, view, usertype, onDelete}: TaskCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; columnId: string } | null>(null);

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  }

  return (
    <div className="hover:bg-[#EBE5EB] cursor-pointer bg-white rounded-md p-4 shadow-sm border border-[#D3C7D3] mb-3 relative">
      <div className="absolute right-2 top-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)}>
          <MoreVertical className="h-4 w-4" />
        </Button>
        {menuOpen && view !== "dashboard" && (
          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#4A2B4A] hover:bg-gray-100"
              onClick={() => {
                setShowModal(true)
                setMenuOpen(false)
              }}
            >
              <Eye className="h-4 w-4" /> View Details
            </button>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false)
                setItemToDelete({ id: task.id, columnId });
                setShowDeleteConfirm(true);
              }}
            >
              <Trash className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
        {menuOpen && view === "dashboard" && (
          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-20">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#4A2B4A] hover:bg-gray-100"
              onClick={() => setShowModal(true)}
            >
              <Eye className="h-4 w-4" /> View Details
            </button>
          </div>
        )}
      </div>

      <h3 className="font-medium text-gray-900 pr-6">{task.title}</h3>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        {"date" in task && (
          <span>{task.date}</span>
        )}
        <div className="flex items-center gap-2">
          {Array.isArray(task.comments) && task.comments.length >= 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{task.comments.length}</span>
            </div>
          )}
          <span 
            className={` px-2 py-1 flex justify-between items-center rounded-full text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {showModal && (
        <TaskDetailModal open={showModal} task={task} onClose={() => setShowModal(false)} />
      )}


    {showDeleteConfirm && itemToDelete && (
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete && onDelete) {
            onDelete(itemToDelete.id, itemToDelete.columnId); 
          }
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
      />
    )}

    </div>
  )
} 
