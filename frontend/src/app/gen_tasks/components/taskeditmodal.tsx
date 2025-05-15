// components/TaskEditModal.tsx
"use client"

import React from "react"
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { createPortal } from "react-dom"
import type { Task } from "@/types/task"
import { useTaskEditLogic } from "../hooks/useTaskEditLogic"
import { useEffect } from "react"


interface TaskEditModalProps {
  task: Task
  open: boolean
  onClose: () => void
  onUpdate: (taskId: string, updatedData: Partial<Task>) => void
  userStories: { id: string; title: string }[]
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  open,
  onClose,
  onUpdate,
  userStories
}) => {
  const { formData, errors, handleChange, handleSubmit } =
    useTaskEditLogic(task, onUpdate, onClose)

    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open])
  
    // Force focus to stay within modal
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const modal = (
      <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30" 
          aria-hidden="true"
          onClick={onClose}
        />
        
        {/* Modal content */}
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-xl w-full p-6 space-y-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#4A2B4D]">Edit Task</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-lg font-medium text-black">Title</label>
                <input
                  aria-label="|"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 bg-white block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-lg font-medium text-black">Description</label>
                <textarea
                  aria-label="|"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block bg-white w-full text-lg border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              {/* User Story */}
              <div>
                <label className="block text-lg font-medium text-black">User Story</label>
                <select
                  aria-label="|"
                  name="user_story_id"
                  value={formData.user_story_id}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-white text-lg border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  {userStories.map((us) => (
                    <option key={us.id} value={us.id}>
                      {us.title}
                    </option>
                  ))}
                </select>
              </div>
  
              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-black">Priority</label>
                  <select
                    aria-label="|"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="mt-1 bg-white block text-lg w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-medium text-black">Status</label>
                  <select
                    aria-label="|"
                    name="status_khanban"
                    value={formData.status_khanban}
                    onChange={handleChange}
                    className="mt-1 bg-white block w-full text-lg border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              
              {/* Story Points & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-black">Story Points</label>
                  <input
                    aria-label="|"
                    type="number"
                    name="story_points"
                    min={0}
                    max={13}
                    value={formData.story_points}
                    onChange={handleChange}
                    className="mt-1 bg-white block w-full text-lg border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  {errors.story_points && (
                    <p className="text-red-500 text-lg mt-1">{errors.story_points}</p>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-medium text-black">Deadline</label>
                  <input
                    aria-label="|"
                    type="date"
                    name="deadline"
                    value={formData.deadline || ""}
                    onChange={handleChange}
                    className="mt-1 block bg-white text-lg w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              
              {/* Task metadata (read-only) */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-black mb-2">History</h3>
                <div className="text-m text-black">
                  {task.created_by && task.created_by[1] && task.date_created && (
                    <p>Created by {task.created_by[1]} el {new Date(task.date_created).toLocaleDateString()}</p>
                  )}
                  {task.modified_by && task.modified_by[1] && task.date_modified && (
                    <p>Last change made by {task.modified_by[1]} date: {new Date(task.date_modified).toLocaleDateString()}</p>
                  )}
                  {task.finished_by && task.finished_by[1] && task.date_completed && (
                    <p>Marked completed by {task.finished_by[1]} el {new Date(task.date_completed).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#4A2B4D] text-white rounded-md hover:bg-[#3a2239] focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  
    // Use portal for modal to avoid z-index issues
    if (typeof window !== "undefined") {
      // Create modal root if it doesn't exist
      let modalRoot = document.getElementById("modal-root")
      if (!modalRoot) {
        modalRoot = document.createElement("div")
        modalRoot.id = "modal-root"
        document.body.appendChild(modalRoot)
      }
      
      return createPortal(modal, modalRoot)
    }
    
    return null
  }

export default TaskEditModal
