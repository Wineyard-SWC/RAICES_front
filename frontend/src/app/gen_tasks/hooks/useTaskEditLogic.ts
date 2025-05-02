// hooks/useTaskEditLogic.ts
"use client"

import { useState } from "react"
import type React from "react"
import type { Task, TaskFormData } from "@/types/task"

export const useTaskEditLogic = (
  initialTask: Task,
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void,
  onClose: () => void
) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialTask.title,
    description: initialTask.description,
    user_story_id: initialTask.user_story_id,
    assignee: initialTask.assignee,
    sprint_id: initialTask.sprint_id,
    status: initialTask.status,
    priority: initialTask.priority,
    story_points: initialTask.story_points,
    deadline: initialTask.deadline,
    comments: [], // no envías comentarios aquí
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
        const copy = { ...prev }
        delete copy[name]
        return copy
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
    onUpdate(initialTask.id, formData)
    onClose()
  }

  return { formData, errors, handleChange, handleSubmit }
}
