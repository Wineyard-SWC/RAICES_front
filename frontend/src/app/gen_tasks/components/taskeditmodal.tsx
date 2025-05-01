"use client"

import type React from "react"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import type { Task } from "@/types/task"
import { useTaskEditLogic } from "../hooks/useTaskEditLogic"
import { taskFormStyles } from "../styles/task.module"
import { createPortal } from "react-dom"

interface TaskEditModalProps {
  task: Task
  open: boolean
  onClose: () => void
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void
  userStories: { id: string; title: string }[]
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, open, onClose, onUpdate, userStories }) => {
  const { formData, errors, handleChange, handleSubmit } = useTaskEditLogic(task, onUpdate, onClose)

  const modalContent = (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4">
          <DialogTitle className="text-lg font-bold text-[#4A2B4A]">Edit Task</DialogTitle>

          <form onSubmit={handleSubmit} className={taskFormStyles.form}>
            <div className={taskFormStyles.formGroup}>
              <label htmlFor="title" className={taskFormStyles.label}>
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={taskFormStyles.input}
                required
              />
              {errors.title && <p className={taskFormStyles.error}>{errors.title}</p>}
            </div>

            <div className={taskFormStyles.formGroup}>
              <label htmlFor="description" className={taskFormStyles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={taskFormStyles.textarea}
              />
            </div>

            <div className={taskFormStyles.formGroup}>
              <label htmlFor="user_story_id" className={taskFormStyles.label}>
                User Story
              </label>
              <select
                id="user_story_id"
                name="user_story_id"
                value={formData.user_story_id}
                onChange={handleChange}
                className={taskFormStyles.select}
                required
              >
                <option value="">Select a user story</option>
                {userStories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
              {errors.user_story_id && <p className={taskFormStyles.error}>{errors.user_story_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={taskFormStyles.formGroup}>
                <label htmlFor="priority" className={taskFormStyles.label}>
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={taskFormStyles.select}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className={taskFormStyles.formGroup}>
                <label htmlFor="status" className={taskFormStyles.label}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={taskFormStyles.select}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={taskFormStyles.formGroup}>
                <label htmlFor="story_points" className={taskFormStyles.label}>
                  Story Points (0-13)
                </label>
                <input
                  type="number"
                  id="story_points"
                  name="story_points"
                  min="0"
                  max="13"
                  value={formData.story_points}
                  onChange={handleChange}
                  className={taskFormStyles.input}
                />
                {errors.story_points && <p className={taskFormStyles.error}>{errors.story_points}</p>}
              </div>

              <div className={taskFormStyles.formGroup}>
                <label htmlFor="deadline" className={taskFormStyles.label}>
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline || ""}
                  onChange={handleChange}
                  className={taskFormStyles.input}
                />
              </div>
            </div>

            <div className={taskFormStyles.buttonGroup}>
              <button type="button" onClick={onClose} className={taskFormStyles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={taskFormStyles.submitButton}>
                Save Changes
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )

  const modalRoot = typeof window !== "undefined" ? document.getElementById("modal-root") : null

  return modalRoot ? createPortal(modalContent, modalRoot) : null
}

export default TaskEditModal
