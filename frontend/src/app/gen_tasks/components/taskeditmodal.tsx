// components/TaskEditModal.tsx
"use client"

import React from "react"
import { Dialog } from "@headlessui/react"
import { createPortal } from "react-dom"
import type { Task } from "@/types/task"
import { useTaskEditLogic } from "../hooks/useTaskEditLogic"

interface TaskEditModalProps {
  task: Task
  open: boolean
  onClose: () => void
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  open,
  onClose,
  onUpdate,
}) => {
  const { formData, errors, handleChange, handleSubmit } =
    useTaskEditLogic(task, onUpdate, onClose)

  const modal = (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
          <Dialog.Title className="text-lg font-bold">Edit Task</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title, Description, User Story same as ManualTaskForm */}
            {/* ... */}
            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-2 py-1"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-2 py-1"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
            {/* Story Points, Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Story Points</label>
                <input
                  type="number"
                  name="story_points"
                  min={0}
                  max={13}
                  value={formData.story_points}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-2 py-1"
                />
                {errors.story_points && (
                  <p className="text-red-600 text-sm">{errors.story_points}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-2 py-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )

  const root = typeof window !== "undefined" && document.getElementById("modal-root")
  return root ? createPortal(modal, root) : null
}

export default TaskEditModal
