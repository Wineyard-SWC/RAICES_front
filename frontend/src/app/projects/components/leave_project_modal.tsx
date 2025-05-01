"use client"

import { useState } from "react"
import { X, LogOut } from "lucide-react"
import { useUser } from "@/contexts/usercontext"
import { useLeaveProject } from "@/hooks/useLeaveProject"

interface LeaveProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
}

export default function LeaveProjectModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: LeaveProjectModalProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { userId } = useUser()

  // Usamos el hook con el userId del contexto
  const { leaveProject, error } = useLeaveProject(userId)

  const handleLeave = async () => {
    setIsLeaving(true)
    try {
      const success = await leaveProject(projectId)
      if (success) {
        setSuccessMessage("You have left the project successfully")
        setTimeout(() => {
          onClose()
          // Recargamos la página para actualizar la lista
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      console.error("Error leaving project:", err)
    } finally {
      setIsLeaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">Leave Project</h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4 text-amber-600">
            <LogOut size={24} className="mr-2" />
            <h3 className="text-lg font-medium">Are you sure?</h3>
          </div>

          <p className="text-[#694969] mb-4">
            You are about to leave the project <strong>{projectTitle}</strong>.
            You will no longer have access unless invited again.
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
              disabled={isLeaving}
            >
              Cancel
            </button>
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
              disabled={isLeaving || !!successMessage}
            >
              {isLeaving ? "Leaving..." : "Leave Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
