// components/ManualTaskForm.tsx
"use client"

import React, { useState } from "react"
import type { TaskFormData } from "@/types/task"

interface ManualTaskFormProps {
  onSubmit: (taskData: TaskFormData) => void
  onCancel: () => void
  userStories: { id: string; title: string }[]
}

const ManualTaskForm: React.FC<ManualTaskFormProps> = ({
  onSubmit,
  onCancel,
  userStories,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    user_story_id: "",
    assignee: "",
    sprint_id: undefined,
    status: "To Do",
    priority: "Medium",
    story_points: 0,
    deadline: undefined,
    comments: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "story_points" ? Number.parseInt(value) || 0 : (value as any),
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const cp = { ...prev }
        delete cp[name]
        return cp
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.user_story_id)
      newErrors.user_story_id = "User story is required"
    if (formData.story_points < 0 || formData.story_points > 13)
      newErrors.story_points = "Story points must be 0–13"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-2 py-1"
        />
        {errors.title && (
          <p className="text-red-600 text-sm">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-2 py-1"
        />
      </div>

      {/* User Story */}
      <div>
        <label className="block text-sm font-medium">User Story</label>
        <select
          name="user_story_id"
          value={formData.user_story_id}
          onChange={handleChange}
          className="mt-1 block w-full border rounded px-2 py-1"
        >
          <option value="">— Select —</option>
          {userStories.map((us) => (
            <option key={us.id} value={us.id}>
              {us.title}
            </option>
          ))}
        </select>
        {errors.user_story_id && (
          <p className="text-red-600 text-sm">{errors.user_story_id}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
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
        {/* Status */}
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

      {/* Story Points */}
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

      {/* Deadline */}
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

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border rounded"
        >
          Cancel
        </button>
        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">
          Add
        </button>
      </div>
    </form>
  )
}

export default ManualTaskForm
