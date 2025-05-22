import { Fragment, useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition
} from "@headlessui/react"
import { Trash } from "lucide-react"
import { Comments } from "@/types/userstory"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { isUserStory, isBug } from "@/types/taskkanban"
import { useUser } from "@/contexts/usercontext"

interface AddCommentModalProps {
  onClose: () => void
  taskId: string
  taskTitle: string
  comments: Comments[]
  onCommentsChange: (updated: Comments[]) => void
}

export default function AddCommentModal({
  onClose,
  comments,
  taskId,
  taskTitle,
  onCommentsChange
}: AddCommentModalProps) {
  const [comment, setComment] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { updateTask, updateStory, updateBug, tasks } = useKanban()
  const { userData, userId } = useUser()

  const columns = ["backlog", "todo", "inprogress", "inreview", "done"] as const

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const findTask = () => {
    for (const col of columns) {
      const found = tasks[col].find((task) => task.id === taskId)
      if (found) return found
    }
    return null
  }

  const currentTask = findTask()

  const handleSubmit = async () => {
    if (!comment.trim()) return

    const newComment = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_name: userData?.name || "Your Name",
      text: comment,
      timestamp: new Date().toISOString()
    }

    const updatedComments = [...comments, newComment]

    try {
      if (currentTask) {
        if (isUserStory(currentTask)) {
          await updateStory(taskId, { comments: updatedComments })
        } else if (isBug(currentTask)) {
          await updateBug(taskId, { comments: updatedComments })
        } else {
          await updateTask(taskId, { comments: updatedComments })
        }
      }

      onCommentsChange(updatedComments)
      setComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleDelete = async (commentId: string) => {
    const updatedComments = comments.filter((c) => c.id !== commentId)

    try {
      if (currentTask) {
        if (isUserStory(currentTask)) {
          await updateStory(taskId, { comments: updatedComments })
        } else if (isBug(currentTask)) {
          await updateBug(taskId, { comments: updatedComments })
        } else {
          await updateTask(taskId, { comments: updatedComments })
        }
      }

      onCommentsChange(updatedComments)
    } catch (error) {
      console.error("Error deleting comment:", error)
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
                <h4 className="text-xl font-semibold text-black mb-3">
                  Comments:
                </h4>
                <div className="max-h-52 overflow-y-auto w-full">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="w-full bg-white border border-gray-200 shadow-sm rounded-xl p-4 mb-4 hover:shadow-md transition-shadow duration-300 relative group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xl">
                          {comment.user_name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                              <strong className="text-base">
                                {comment.user_name}
                              </strong>
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>

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
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="bg-white text-base w-full border border-gray-300 rounded-xl p-4 mb-6 resize-none h-36 shadow-sm focus:ring-2 focus:ring-purple-300 focus:outline-none transition-all"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}