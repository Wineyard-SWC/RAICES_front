import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { X,Trash } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TaskOrStory } from "@/types/taskkanban"
import { useBacklogContext } from "@/contexts/backlogcontext"

interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  task: TaskOrStory
}

const TaskDetailModal = ({ open, onClose, task }: TaskDetailModalProps) => {
  const [newComment, setNewComment] = useState("")
  const userId = localStorage.getItem("userId")!
  const project_id = localStorage.getItem("currentProjectId")
  const apiURL = process.env.NEXT_PUBLIC_API_URL!

  const { tasks, setTasks } = useBacklogContext()
  const columns = ["backlog", "todo", "inprogress", "inreview", "done"] as const

  const handleSubmit = async () => {
    const comment = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_name: "Your Name",
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    }

    const res = await fetch(`${apiURL}/projects/${project_id}/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    })

    if (res.ok) {
      setNewComment("")
      setTasks((prev) => {
        const updated = { ...prev }
        columns.forEach((col) => {
          updated[col] = updated[col].map((t) =>
            t.id === task.id && Array.isArray(t.comments)
              ? { ...t, comments: [...t.comments, comment] }
              : t
          )
        })
        return updated
      })
    }
  }

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`${apiURL}/projects/${project_id}/tasks/${task.id}/comments/${commentId}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setTasks((prev) => {
        const updated = { ...prev }
        columns.forEach((col) => {
          updated[col] = updated[col].map((t) =>
            t.id === task.id && Array.isArray(t.comments)
              ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
              : t
          )
        })
        return updated
      })
    }
  }


  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold text-[#4A2B4A]">Task Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-black">Title:</p>
              <p className="text-md text-black">{task.title}</p>
            </div>

            <div>
              <p className="text-lg font-semibold text-black">Description:</p>
              <p className="text-md text-black">{task.description}</p>
            </div>

            <div className="flex justify-between gap-4">
              {"date" in task && (
                <div>
                  <p className="text-lg font-semibold text-black">Date:</p>
                  <p className="text-md text-black">{task.date}</p>
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-black">Priority:</p>
                <p className="text-md text-black">{task.priority}</p>
              </div>
            </div>

            {"comments" in task && Array.isArray(task.comments) && (
              <div>
                <p className="text-lg font-semibold text-black mb-2">Comments:</p>
                {task.comments.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {task.comments.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white border border-gray-200 p-2 rounded-md relative"
                      >
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            <strong>{c.user_name}</strong> ·{" "}
                            {new Date(c.timestamp).toLocaleString()}
                          </span>
                          {c.user_id === userId && (
                            <button
                              aria-label="Delete Comment"
                              onClick={() => handleDelete(c.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-black mt-1">{c.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-md text-gray-500 italic">No comments yet</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="comment" className="text-lg font-semibold text-black">Add Comment:</label>
              <textarea
                id="comment"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-gray-300 rounded-md resize-none"
                placeholder="Write your comment here..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
                onClick={handleSubmit}
                disabled={!newComment.trim()}
              >
                Submit Comment
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default TaskDetailModal
