import { useState, Fragment } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { comments } from "@/types/userstory"
import { Trash } from "lucide-react"

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
          <DialogPanel className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl">
            <DialogTitle className="text-xl font-bold text-[#4A2B4A] mb-4">
              Comment on {taskTitle}
            </DialogTitle>
            
            {comments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Comments:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-md p-2 bg-gray-50 relative">
                      <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
                        <span>
                          <strong>{comment.user_name}</strong> · {new Date(comment.timestamp).toLocaleString()}
                        </span>
                        {comment.user_id === userId && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete comment"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-800">{comment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full border border-gray-300 rounded-md p-2 mb-4 resize-none h-32 text-sm"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}
