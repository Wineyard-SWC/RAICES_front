import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TaskOrStory } from "@/types/taskkanban"

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  task: TaskOrStory
  onAddComment?: (comment: string) => void
}

const TaskDetailModal = ({ open, onClose, task, onAddComment }: TaskDetailModalProps) => {
  const [newComment, setNewComment] = useState("")

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim())
      setNewComment("")
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold text-[#4A2B4A]">Task Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-black">Title:</p>
              <p className="text-md text-black">{task.title}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-black">Description:</p>
              <p className="text-md text-black">{task.description}</p>
            </div>

            <div className="flex justify-between gap-4">
              {"date" in task && (
                <div>
                  <p className="text-sm font-semibold text-black">Date:</p>
                  <p className="text-md text-black">{task.date}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-black">Priority:</p>
                <p className="text-md text-black">{task.priority}</p>
              </div>
            </div>

            {"comments" in task && (
            <div>
                <p className="text-sm font-semibold text-gray-600">Comments:</p>
                {Array.isArray(task.comments) && task.comments.length > 0 ? (
                  <p className="text-md text-black">{task.comments.length} comment(s)</p>
                ) : (
                  <p className="text-md text-gray-500 italic">No comments yet</p>
                )};
            </div>)}

            <div>
              <label htmlFor="comment" className="text-sm font-semibold text-gray-600">Add Comment:</label>
              <textarea
                id="comment"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Write your comment here..."
              />
              <Button className="mt-2 bg-[#4A2B4A] text-white hover:bg-[#3a2248]" onClick={handleSubmit}>
                Submit Comment
              </Button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default TaskDetailModal
