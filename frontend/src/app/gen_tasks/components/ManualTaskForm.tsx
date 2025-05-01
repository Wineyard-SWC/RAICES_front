"use client"

import type React from "react"

import { useState } from "react"
import type { TaskFormData } from "@/types/task"
import { taskFormStyles } from "../styles/task.module"

interface ManualTaskFormProps {
  onSubmit: (taskData: TaskFormData) => void
  onCancel: () => void
  userStories: { id: string; title: string }[]
}

const ManualTaskForm: React.FC<ManualTaskFormProps> = ({ onSubmit, onCancel, userStories }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    user_story_id: "",
    assignee: "",
    status: "To Do",
    priority: "Medium",
    story_points: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "story_points" ? Number.parseInt(value) || 0 : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.user_story_id) {
      newErrors.user_story_id = "User story is required"
    }

    if (formData.story_points < 0 || formData.story_points > 13) {
      newErrors.story_points = "Story points must be between 0 and 13"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Find the user story title
      const userStory = userStories.find((us) => us.id === formData.user_story_id)

      onSubmit({
        ...formData,
        user_story_title: userStory?.title,
      })
    }
  }

  return (
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

      <div className={taskFormStyles.buttonGroup}>
        <button type="button" onClick={onCancel} className={taskFormStyles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={taskFormStyles.submitButton}>
          Add Task
        </button>
      </div>
    </form>
  )
}

export default ManualTaskForm
