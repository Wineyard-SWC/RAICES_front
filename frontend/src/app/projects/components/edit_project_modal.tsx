"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Project } from "@/types/project"
import { useUpdateProject } from "@/hooks/useUpdateProjects"

interface EditProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

const EditProjectModal = ({ isOpen, onClose, project }: EditProjectModalProps) => {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)
  const [status, setStatus] = useState(project.status)
  const [priority, setPriority] = useState(project.priority)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const { updateProject, loading, error } = useUpdateProject()

  // Format dates for the date input
  useEffect(() => {
    if (project.startDate) {
      const formattedStartDate = new Date(project.startDate).toISOString().split("T")[0]
      setStartDate(formattedStartDate)
    }

    if (project.endDate) {
      const formattedEndDate = new Date(project.endDate).toISOString().split("T")[0]
      setEndDate(formattedEndDate)
    }
  }, [project.startDate, project.endDate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!startDate) newErrors.startDate = "Start date is required"
    if (!endDate) newErrors.endDate = "End date is required"

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSuccessMessage("")

    try {
      const projectData = {
        title,
        description,
        status,
        priority,
        startDate,
        endDate,
        invitationCode: project.invitationCode,
        progress: project.progress,
        tasksCompleted: project.tasksCompleted,
        totalTasks: project.totalTasks,
        team: project.team,
        teamSize: project.teamSize,
      }

      const result = await updateProject(project.id, projectData)

      if (result) {
        setSuccessMessage("Project updated successfully!")
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error("Error updating project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">Edit Project</h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-2 border ${errors.title ? "border-red-500" : "border-[#ebe5eb]"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
                placeholder="Enter project title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border ${errors.description ? "border-red-500" : "border-[#ebe5eb]"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] min-h-[100px]`}
                placeholder="Describe the project"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full p-2 border ${errors.startDate ? "border-red-500" : "border-[#ebe5eb]"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a2b4a] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full p-2 border ${errors.endDate ? "border-red-500" : "border-[#ebe5eb]"} rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a]`}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}
          {successMessage && <p className="text-green-600 mt-4">{successMessage}</p>}

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProjectModal
