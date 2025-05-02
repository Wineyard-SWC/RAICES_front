import { useState, Fragment } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { comments } from "@/types/userstory"
import { Trash } from "lucide-react"
import { useBacklogContext } from "@/contexts/backlogcontext"

interface AddCommentModalProps {
  onClose: () => void
  taskId: string
  taskTitle: string
  comments: comments[]
  onCommentsChange: (updated: comments[]) => void
}

export default function AddCommentModal({ onClose, comments,taskId, taskTitle,onCommentsChange }: AddCommentModalProps) {
    const [comment, setComment] = useState("")
    const userId = localStorage.getItem("userId")!
    const project_id = localStorage.getItem("currentProjectId")
    const apiURL = process.env.NEXT_PUBLIC_API_URL!

    const { tasks, setTasks } = useBacklogContext()
    const columns = ["backlog", "todo", "inprogress", "inreview", "done"] as const

    const handleSubmit = async () => {
        const newComment = {
          id: crypto.randomUUID(),
          user_id: userId,
          user_name: "Your Name",
          text: comment,
          timestamp: new Date().toISOString(),
        }
    
        const res = await fetch(`${apiURL}/projects/${project_id}/tasks/${taskId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newComment),
        })
    
        if (res.ok) {
          onCommentsChange([...comments, newComment])
          setComment("")
        }

        setTasks((prevTasks) => {
          const updated = { ...prevTasks }
          columns.forEach((col) => {
            updated[col] = updated[col].map(task => {
              if (task.id === taskId && Array.isArray(task.comments)) {
                return {
                  ...task,
                  comments: [...task.comments, newComment],
                }
              }
              return task
            })
          })
          return updated
        })
      
      }
    
    const handleDelete = async (commentId: string) => {
        const res = await fetch(`${apiURL}/projects/${project_id}/tasks/${taskId}/comments/${commentId}`, {
          method: "DELETE",
        })
    
        if (res.ok) {
          onCommentsChange(comments.filter(c => c.id !== commentId))
        }
      }


    return (
        <Transition show as={Fragment}>
          <Dialog onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <DialogPanel className="bg-[#F5F0F1] w-full max-w-2xl p-8 rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
                <DialogTitle className="text-2xl font-bold text-[#4A2B4A] mb-6">
                  Comment on {taskTitle}
                </DialogTitle>
    
                {comments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-black mb-3">Comments:</h4>
                    <div className="max-h-52 overflow-y-auto w-full">
                      {comments.map((comment) => (
                        <div key={comment.id} className="w-full border border-gray-300 rounded-lg p-3 bg-white relative">
                          <div className="text-base text-gray-600 mb-2 flex justify-between items-center">
                            <span>
                              <strong>{comment.user_name}</strong> · {new Date(comment.timestamp).toLocaleString()}
                            </span>
                            {comment.user_id === userId && (
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete comment"
                              >
                                <Trash className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                          <div className="text-lg text-gray-800">{comment.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
    
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment here..."
                  className="bg-white text-lg w-full border border-gray-400 rounded-lg p-4 mb-6 resize-none h-40 leading-relaxed"
                />
    
                <div className="flex justify-end gap-2">
                  <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-black">Cancel</button>
                  <button onClick={handleSubmit} className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md">Submit</button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </Transition>
      )
    }
