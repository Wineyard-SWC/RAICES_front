import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { X, Trash, Monitor, Globe, Smartphone, Tag, FileText, CheckCircle, Link, GitPullRequest } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { isBug, TaskOrStory } from "@/types/taskkanban"
import { useUser } from "@/contexts/usercontext"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { useMemo } from "react"
import { Comment, Task } from "@/types/task"
import { UserStory } from "@/types/userstory"


interface TaskDetailModalProps {
  open: boolean
  onClose: () => void
  task: TaskOrStory
}

const TaskDetailModal = ({ open, onClose, task }: TaskDetailModalProps) => {
  const [newComment, setNewComment] = useState("")
  const { userId, userData } = useUser()
  const { currentProjectId, tasks, updateTask, updateStory, updateBug  } = useKanban()
  const apiURL = process.env.NEXT_PUBLIC_API_URL!
  const project_id=currentProjectId
  const columns = ["backlog", "todo", "inprogress", "inreview", "done"] as const

  const currentTask = useMemo(() => {
    for (const column of Object.values(tasks)) {
      const foundTask = column.find(t => t.id === task.id)
      if (foundTask) return foundTask
    }
    return task
  }, [tasks, task.id])


  const isTask = (item: TaskOrStory): item is Task => {
    return 'user_story_id' in item || 
          (!('acceptanceCriteria' in item) && !('assigned_epic' in item))
  }

  const isUserStory = (item: TaskOrStory): item is UserStory => {
    return 'acceptanceCriteria' in item || 'assigned_epic' in item
  }


  const handleSubmit = async () => {
    const comment = {
      id: crypto.randomUUID(),
      user_id: userId,
      user_name: userData?.name || "Unknown User",
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    }

    try {
      // Usar las funciones helper para distinguir
      if (isUserStory(currentTask)) {
        const updatedComments = Array.isArray(currentTask.comments)
          ? [...currentTask.comments, comment]
          : [comment]
        
        await updateStory(task.id, {
          comments: updatedComments
        })
      }
      else if (isBug(currentTask)) {
        const updatedComments = Array.isArray(currentTask.comments)
          ? [...currentTask.comments, comment]
          : [comment]
        
        await updateBug(task.id, {
          comments: updatedComments
        })
      }
      else {
        // Es una Task
        const updatedComments = Array.isArray(currentTask.comments)
          ? [...currentTask.comments, comment]
          : [comment]
        
        await updateTask(task.id, {
          comments: updatedComments
        })
      }
      
      setNewComment("")
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!currentProjectId || !('comments' in currentTask)) return

    try {
      const updatedComments = Array.isArray(currentTask.comments)
        ? currentTask.comments.filter((c: Comment) => c.id !== commentId)
        : []
      
      if (isUserStory(currentTask)) {
        await updateStory(task.id, {
          comments: updatedComments
        })
      } 
      else if (isBug(currentTask)) {
        await updateBug(task.id, {
          comments: updatedComments
        })
      }
      else {
        await updateTask(task.id, {
          comments: updatedComments
        })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  return (
     <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-bold text-[#4A2B4A]">{isUserStory(currentTask) ? "User Story Details": isBug(currentTask) ? "Bug Details": "Task Details"}</DialogTitle>
            <Button variant="secondary" size="lg" onClick={onClose}>
              <X className="h-20 w-20 text-gray-600" />
            </Button>
          </div>

          <div className="space-y-8 text-lg">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold text-[#4A2B4A] text-xl mb-1">Title:</p>
              <p className="text-black text-xl">{currentTask.title}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold text-[#4A2B4A] text-xl mb-1">Description:</p>
              <p className="text-black text-lg">{currentTask.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {"date" in currentTask && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-[#4A2B4A] text-xl mb-1">Date:</p>
                  <p className="text-black text-lg">{currentTask.date}</p>
                </div>
              )}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-[#4A2B4A] text-xl mb-1">Priority:</p>
                <p className="text-black text-lg">{currentTask.priority}</p>
              </div>
            </div>

            {/* Si es un bug, mostrar detalles adicionales */}
            {isBug(currentTask) && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentTask.bug_status && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xl font-semibold text-[#4A2B4A] mb-1">Bug Status:</p>
                      <p className="text-lg text-black">{currentTask.bug_status}</p>
                    </div>
                  )}
                  {currentTask.severity && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xl font-semibold text-[#4A2B4A] mb-1">Severity:</p>
                      <p className="text-lg text-black">{currentTask.severity}</p>
                    </div>
                  )}
                  {currentTask.type && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-xl font-semibold text-[#4A2B4A] mb-1">Bug Type:</p>
                      <p className="text-lg text-black">{currentTask.type}</p>
                    </div>
                  )}
                  {currentTask.affectedComponents && currentTask.affectedComponents.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
                      <p className="text-xl font-semibold text-[#4A2B4A] mb-1">Affected Components:</p>
                      <p className="text-lg text-black">{currentTask.affectedComponents.join(", ")}</p>
                    </div>
                  )}
                  {currentTask.visibleToCustomers && (
                    <div className="bg-red-50 p-4 rounded-lg shadow-sm col-span-1 md:col-span-2 border border-red-200">
                      <p className="text-xl text-red-600 font-semibold flex items-center">
                        <span className="mr-2">⚠️</span> Bug is visible to customers
                      </p>
                    </div>
                  )}
                </div>

                {/* Environment details with icons */}
                {currentTask.environment && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-xl font-semibold text-[#4A2B4A] mb-4">Environment Details:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentTask.environment.os && (
                        <div className="flex items-start">
                          <Monitor className="h-6 w-6 text-[#4A2B4A] mr-3 mt-1" />
                          <div>
                            <p className="text-lg font-semibold text-[#4A2B4A]">OS:</p>
                            <p className="text-lg text-black">{currentTask.environment.os}</p>
                          </div>
                        </div>
                      )}
                      {currentTask.environment.browser && (
                        <div className="flex items-start">
                          <Globe className="h-6 w-6 text-[#4A2B4A] mr-3 mt-1" />
                          <div>
                            <p className="text-lg font-semibold text-[#4A2B4A]">Browser:</p>
                            <p className="text-lg text-black">{currentTask.environment.browser}</p>
                          </div>
                        </div>
                      )}
                      {currentTask.environment.device && (
                        <div className="flex items-start">
                          <Smartphone className="h-6 w-6 text-[#4A2B4A] mr-3 mt-1" />
                          <div>
                            <p className="text-lg font-semibold text-[#4A2B4A]">Device:</p>
                            <p className="text-lg text-black">{currentTask.environment.device}</p>
                          </div>
                        </div>
                      )}
                      {currentTask.environment.version && (
                        <div className="flex items-start">
                          <Tag className="h-6 w-6 text-[#4A2B4A] mr-3 mt-1" />
                          <div>
                            <p className="text-lg font-semibold text-[#4A2B4A]">Version:</p>
                            <p className="text-lg text-black">{currentTask.environment.version}</p>
                          </div>
                        </div>
                      )}
                      {currentTask.environment.otherDetails && (
                        <div className="flex items-start col-span-1 md:col-span-2">
                          <FileText className="h-6 w-6 text-[#4A2B4A] mr-3 mt-1" />
                          <div>
                            <p className="text-lg font-semibold text-[#4A2B4A]">Notes:</p>
                            <p className="text-lg text-black">{currentTask.environment.otherDetails}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resolution with icons */}
                {currentTask.resolution && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-xl font-semibold text-[#4A2B4A] mb-4 flex items-center">
                      <CheckCircle className="h-6 w-6 mr-2" /> Resolution:
                    </p>
                    <div className="space-y-3 pl-2">
                      <p className="text-lg text-black">
                        <span className="font-semibold">Status:</span> {currentTask.resolution.status}
                      </p>
                      <p className="text-lg text-black">
                        <span className="font-semibold">Description:</span> {currentTask.resolution.description}
                      </p>
                      {currentTask.resolution.commitId && (
                        <p className="text-lg text-black flex items-center">
                          <Link className="h-5 w-5 mr-2 text-[#4A2B4A]" />
                          <span className="font-semibold">Commit ID:</span> {currentTask.resolution.commitId}
                        </p>
                      )}
                      {currentTask.resolution.pullRequestUrl && (
                        <p className="text-lg text-black flex items-center">
                          <GitPullRequest className="h-5 w-5 mr-2 text-[#4A2B4A]" />
                          <span className="font-semibold">PR:</span>{" "}
                          <a
                            href={currentTask.resolution.pullRequestUrl}
                            className="text-blue-600 underline ml-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Pull Request
                          </a>
                        </p>
                      )}
                      <p className="text-lg text-black">
                        <span className="font-semibold">Resolved by:</span> {currentTask.resolution.resolvedBy}
                      </p>
                      <p className="text-lg text-black">
                        <span className="font-semibold">Resolved at:</span>{" "}
                        {new Date(currentTask.resolution.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {"comments" in currentTask && Array.isArray(currentTask.comments) && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-xl font-semibold text-[#4A2B4A] mb-4">Comments:</p>
                {currentTask.comments.length > 0 ? (
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {currentTask.comments.map((c:Comment) => (
                      <div key={c.id} className="bg-[#F5F0F1] border border-gray-200 p-4 rounded-md relative">
                        <div className="flex justify-between text-md text-gray-600">
                          <span>
                            <strong>{c.user_name}</strong> · {new Date(c.timestamp).toLocaleString()}
                          </span>
                          {c.user_id === userId && (
                            <button
                              aria-label="Delete Comment"
                              onClick={() => handleDelete(c.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        <p className="text-black mt-2 text-lg">{c.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg text-gray-500 italic">No comments yet</p>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <label htmlFor="comment" className="text-xl font-semibold text-[#4A2B4A] block mb-3">
                Add Comment:
              </label>
              <textarea
                id="comment"
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-[#F5F0F1] border border-gray-300 rounded-md resize-none text-lg"
                placeholder="Write your comment here..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-6 py-3 bg-[#4A2B4A] text-white rounded-md disabled:opacity-50 text-lg font-medium hover:bg-[#3A1B3A] transition-colors"
                onClick={handleSubmit}
                disabled={!newComment.trim() || !userId}
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
