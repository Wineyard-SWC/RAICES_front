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
                        <div
                          key={comment.id}
                          className="w-full bg-white border border-gray-200 shadow-sm rounded-xl p-4 mb-4 hover:shadow-md transition-shadow duration-300 relative group"
                          >
                          <div className="flex items-start gap-4">
                          {/* Avatar inicial */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xl">
                            {comment.user_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1">
                            {/* Encabezado: nombre y fecha */}
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-700">
                              <strong className="text-base">{comment.user_name}</strong>
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>

                            {/* Botón eliminar solo si el usuario es el autor */}
                            {comment.user_id === userId && (
                              <button
                              onClick={() => handleDelete(comment.id)}
                              className="text-gray-400 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"
                              title="Delete comment"
                              >
                              <Trash className="h-5 w-5" />
                              </button>
                              )}
                            </div>

                            {/* Texto del comentario */}
                            <p className="mt-2 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                             {comment.text}
                            </p>
                           </div>
                         </div>
                       </div>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment here..."
                  className="bg-white text-base w-full border border-gray-300 rounded-xl p-4 mb-6 resize-none h-36 shadow-sm focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all"
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
