"use client"

import type React from "react"

import { useState } from "react"
import type { Task, TaskFormData } from "@/types/task"

export const useTaskEditLogic = (
  initialTask: Task,
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void,
  onClose: () => void,
) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialTask.title,
    description: initialTask.description,
    user_story_id: initialTask.user_story_id,
    user_story_title: initialTask.user_story_title,
    assignee: initialTask.assignee,
    assignee_id: initialTask.assignee_id,
    sprint_id: initialTask.sprint_id,
    sprint_name: initialTask.sprint_name,
    status: initialTask.status,
    priority: initialTask.priority,
    story_points: initialTask.story_points,
    deadline: initialTask.deadline,
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
      onUpdate(initialTask.id, formData)
      onClose()
    }
  }

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  }
}
