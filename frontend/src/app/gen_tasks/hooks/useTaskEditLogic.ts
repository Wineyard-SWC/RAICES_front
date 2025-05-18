// hooks/useTaskEditLogic.ts
"use client"

import { useUser } from "@/contexts/usercontext"
import { useState } from "react"
import type React from "react"
import type { Task, TaskFormData, KanbanStatus } from "@/types/task"

export const useTaskEditLogic = (
  initialTask: Task,
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void,
  onClose: () => void
) => {
  const now = new Date().toISOString();
  const { userData } = useUser();
  
  const getUserInfo = (): [string, string] => {
    const userId = localStorage.getItem("userId") || "RAICES_IA";
    const userName = userData?.name || "RAICES_IA";
    return [userId, userName];
  };
  const userInfo = getUserInfo();

  const isCompletingTask = initialTask.status_khanban !== "Done";


  const [formData, setFormData] = useState<TaskFormData>({
    title: initialTask.title,
    description: initialTask.description,
    user_story_id: initialTask.user_story_id,
    assignee: initialTask.assignee || [],
    sprint_id: initialTask.sprint_id,
    status_khanban: initialTask.status_khanban,
    priority: initialTask.priority,
    story_points: initialTask.story_points,
    deadline: initialTask.deadline,
    comments: initialTask.comments || [],
    created_by: initialTask.created_by || userInfo,
    date_created: initialTask.date_created || now,
    modified_by: userInfo,
    date_modified: now,
    finished_by: initialTask.finished_by || ['', ''],
    date_completed: initialTask.date_completed || '',
  });


  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "status_khanban") {
      // Si estamos cambiando a "Done" y no estaba en "Done"
      if (value === "Done" && formData.status_khanban !== "Done") {
        setFormData((prev) => ({
          ...prev,
          status_khanban: value as KanbanStatus, // Aseguramos que es del tipo correcto
          finished_by: userInfo,
          date_completed: now,
        }));
      } 
      // Si estamos cambiando desde "Done" a otro estado
      else if (value !== "Done" && formData.status_khanban === "Done") {
        setFormData((prev) => ({
          ...prev,
          status_khanban: value as KanbanStatus, // Aseguramos que es del tipo correcto
          finished_by: ['', ''],
          date_completed: '',
        }));
      }
      // Cualquier otro cambio de estado
      else {
        setFormData((prev) => ({
          ...prev,
          status_khanban: value as KanbanStatus, // Aseguramos que es del tipo correcto
        }));
      }
    }
    // Manejo normal para otros campos
    else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "story_points" ? Number.parseInt(value) || 0 : (value as any),
      }));
    }

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
      newErrors.story_points = "Story points must be 0-13"
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
