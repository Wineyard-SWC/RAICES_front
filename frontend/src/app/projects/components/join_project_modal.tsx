"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

import { useUser } from "@/contexts/usercontext"
import { useGetProjectByCode } from "@/hooks/useGetProjectByCode"
import { useGetProjectOwner } from "@/hooks/useGetProjectOwner"
import { useJoinProject } from "@/hooks/useJoinProject"
import { useAvatar } from "@/contexts/AvatarContext"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"


interface JoinProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const JoinProjectModal = ({ isOpen, onClose, onSuccess }: JoinProjectModalProps) => {
  const [step, setStep] = useState<"enter-code" | "confirm-join">("enter-code")
  const [invitationCode, setInvitationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const { userId } = useUser()
  const { project, loading: loadingProject, error: projectError } = useGetProjectByCode(invitationCode);
  const { owner, loading: loadingOwner } = useGetProjectOwner(project?.id || null);
  const { joinProject, loading: joiningProject, error: joinError } = useJoinProject(userId);
  const { fetchAvatar } = useAvatar();
  const [ownerAvatarUrl, setOwnerAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (owner?.id) {
      fetchAvatar(owner.userRef)
        .then(url => {
          setOwnerAvatarUrl(url);
        })
        .catch(error => {
          console.error(`Error fetching avatar for owner ${owner.id}:`, error);
        });
    } else {
      console.log('No owner ID available yet');
    }
  }, [owner, fetchAvatar]);
  

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (invitationCode.trim() && project) {
      setStep("confirm-join")
    }
  }

  const handleJoinProject = async () => {
    if (!project) return

    setIsSubmitting(true)

    try {
      const success = await joinProject(project.id)

      if (success) {
        setSuccessMessage("You have successfully joined the project!")
        setTimeout(() => {
          onClose()
          if (onSuccess) onSuccess()
          // Reload the page to update the projects list
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error("Error joining project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">
            {step === "enter-code" ? "Join a Project" : "Project Invitation"}
          </h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === "enter-code" ? (
            <form onSubmit={handleSubmitCode}>
              <p className="text-[#694969] mb-4">Enter the invitation code you received to join a project:</p>

              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                placeholder="Enter invitation code"
                className="w-full p-3 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] mb-4"
                autoFocus
              />

              {loadingProject && <p className="text-[#694969]">Searching for project...</p>}
              {projectError && <p className="text-red-500">{projectError}</p>}

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] disabled:opacity-50"
                  disabled={!invitationCode.trim() || loadingProject || !project}
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full max-w-xl">
              {loadingOwner ? (
                <p className="text-[#694969]">Loading invitation details...</p>
              ) : (
                <>
                  <div className="flex items-start mb-6">
                    <div className="h-12 w-12 rounded-full bg-[#ebe5eb] overflow-hidden mr-4 shrink-0">
                      {owner?.id ? (
                        <AvatarProfileIcon 
                          avatarUrl={ownerAvatarUrl} 
                          size={48} 
                          borderWidth={2}
                          borderColor="#4a2b4a"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#4a2b4a] text-white">
                          {owner?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0"> 
                      <p className="text-[#4a2b4a] font-medium">
                        <span className="font-bold">{owner?.name}</span> has invited you to join:
                      </p>
                      <h3 className="text-xl font-bold text-[#4a2b4a] mt-1">{project?.title}</h3>
                      <div className="text-[#694969] text-sm mt-1 max-h-[100px] overflow-y-auto line-clamp-5">
                        {project?.description}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ebe5eb]/50 p-4 rounded-md mb-6">
                    <p className="text-[#4a2b4a] font-medium">Project details:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <p className="text-[#694969]">Status:</p>
                        <p className="font-medium text-[#4a2b4a]">{project?.status}</p>
                      </div>
                      <div>
                        <p className="text-[#694969]">Priority:</p>
                        <p className="font-medium text-[#4a2b4a]">{project?.priority}</p>
                      </div>
                      <div>
                        <p className="text-[#694969]">Team size:</p>
                        <p className="font-medium text-[#4a2b4a]">{project?.teamSize} members</p>
                      </div>
                      <div>
                        <p className="text-[#694969]">Progress:</p>
                        <p className="font-medium text-[#4a2b4a]">{project?.progress}% complete</p>
                      </div>
                    </div>
                  </div>

                  {joinError && <p className="text-red-500 mb-4">{joinError}</p>}
                  {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep("enter-code")}
                      className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoinProject}
                      className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] disabled:opacity-50"
                      disabled={isSubmitting || !!successMessage}
                    >
                      {isSubmitting ? "Joining..." : "Accept Invitation"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinProjectModal
