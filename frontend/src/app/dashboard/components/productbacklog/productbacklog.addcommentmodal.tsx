import { Fragment, useState,useEffect, useRef } from "react"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { Trash, Send, X, MessageSquare } from "lucide-react"
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

export default function AddCommentModal({ onClose, comments,taskId, taskTitle,onCommentsChange }: AddCommentModalProps) {
    const [comment, setComment] = useState("")
    const modalRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { 
        updateTask,
        updateStory, 
        updateBug,
        tasks 
    } = useKanban()

    const {userData,userId} = useUser()

     useEffect(() => {
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }, [])

    // Handle ESC key to close the modal
    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    // Prevent body scrolling when modal is open
    useEffect(() => {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'auto'
      }
    }, [])

    const findTask = () => {
      const columns = ["backlog", "todo", "inprogress", "inreview", "done"] as const
      for (const column of columns) {
        const found = tasks[column].find(task => task.id === taskId)
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
          timestamp: new Date().toISOString(),
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
        const updatedComments = comments.filter(c => c.id !== commentId)
        
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

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    const formatMessageTime = (timestamp: string) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const groupCommentsByDate = (comments: Comments[]) => {
      const groups: { [key: string]: Comments[] } = {}

      comments.forEach((comment) => {
        const date = new Date(comment.timestamp).toLocaleDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(comment)
      })

      return groups
    }

    const groupedComments = groupCommentsByDate(comments)

    const handleBackdropClick = (e: React.MouseEvent) => {
      // Solo cierra si se hace clic en el fondo oscuro, no en el modal mismo
      if (e.target === e.currentTarget) {
        onClose()
      }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={handleBackdropClick}>
        {/* Overlay de fondo oscuro */}
        <div className="fixed inset-0 bg-black opacity-30"></div>
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className="bg-[#F5F0F1] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] z-[70] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#4A2B4A] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6" />
              <h2 className="text-xl font-bold">Comments on {taskTitle}</h2>
            </div>
            <button 
              aria-label="Close"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#F5F0F1]">
            {comments.length > 0 ? (
              Object.entries(groupedComments).map(([date, dateComments]) => (
                <div key={date} className="mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{date}</div>
                  </div>

                  {dateComments.map((comment) => {
                    const isCurrentUser = comment.user_id === userId

                    return (
                      <div
                        key={comment.id}
                        className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex max-w-[80%]">
                          {!isCurrentUser && (
                            <div className="mr-2 mt-1">
                              <div className="w-8 h-8 rounded-full bg-[#4A2B4A] text-white flex items-center justify-center text-sm font-medium">
                                {getInitials(comment.user_name)}
                              </div>
                            </div>
                          )}

                          <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                            {!isCurrentUser && (
                              <span className="text-xs text-gray-600 mb-1 ml-1">{comment.user_name}</span>
                            )}

                            <div className="flex items-end gap-2">
                              {isCurrentUser && (
                                <button
                                  onClick={() => handleDelete(comment.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete comment"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              )}

                              <div
                                className={`rounded-2xl py-2 px-4 break-words ${
                                  isCurrentUser
                                    ? "bg-[#4A2B4A] text-white rounded-tr-none"
                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                                }`}
                              >
                                <div className="text-base">{comment.text}</div>
                              </div>
                            </div>

                            <span className="text-xs text-gray-500 mt-1 mx-2">
                              {formatMessageTime(comment.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-lg">No comments yet</p>
                <p className="text-sm">Be the first to comment on this task</p>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-[#F5F0F1] rounded-2xl px-4 py-3">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-transparent text-base w-full border-none outline-none resize-none min-h-[60px] max-h-[150px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />
              </div>
              <button
                aria-label="Submit"
                onClick={handleSubmit}
                disabled={!comment.trim()}
                className="bg-[#4A2B4A] text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A1B3A] transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 ml-2">Press Enter to send, Shift+Enter for new line</div>
          </div>
        </div>
      </div>
      )
    }
