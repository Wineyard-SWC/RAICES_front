"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ListChecks,
  Plus,
  Save,
  ArrowRight,
  RefreshCw,
  Trash2,
  Filter,
  Search,
} from "lucide-react"
import Navbar from "@/components/NavBar"
import ConfirmDialog from "@/components/confimDialog"
import TaskCard from "./components/taskcard"
import TaskEditModal from "./components/taskeditmodal"
import ManualTaskForm from "./components/ManualTaskForm"
import type { Task, TaskFormData } from "@/types/task"
import { useGenerateTasksLogic } from "./hooks/useGenerateTasksLogic"
import LoadingTasks from "@/components/animations/loadingTasks"

export default function GenerateTasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId =
    searchParams.get("projectId") ||
    (typeof window !== "undefined" && localStorage.getItem("currentProjectId")) ||
    ""

  const {
    userStories,
    isLoadingStories,
    storiesError,
    selectedUserStories,
    toggleSelectUserStory,
    generatedTasks,
    groupedByUserStory,
    userStoryTitles,
    error,
    isLoading,
    handleGenerate,
    handleSave,
    handleUpdateTask,
    handleDeleteTask,
    handleAddTask,
    handleSelectAll,
    handleClear,
  } = useGenerateTasksLogic()

  // UI states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [selectedUserStoryFilter, setSelectedUserStoryFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showSprintPlanningConfirm, setShowSprintPlanningConfirm] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Filter tasks
  const filteredTasks = generatedTasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = !filterPriority || task.priority === filterPriority
    const matchesStory =
      !selectedUserStoryFilter || task.user_story_id === selectedUserStoryFilter
    return matchesSearch && matchesPriority && matchesStory
  })

  return (
    <>
      <LoadingTasks isLoading={isLoadingStories || isLoading} />
      <Navbar projectSelected />

      <div className="min-h-screen bg-[#F5F0F1]/30">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <ListChecks className="w-8 h-8 text-[#4A2B4D]" />
              <h1 className="text-2xl font-bold text-[#4A2B4D]">Task Generation</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A2B4D] text-white rounded-lg hover:bg-[#3a2239] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
              <button
                onClick={handleGenerate}
                disabled={selectedUserStories.length === 0 || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedUserStories.length === 0 || isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#4A2B4D] text-white hover:bg-[#3a2239]"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {isLoading ? "Generating..." : "Generate Tasks"}
              </button>
              <button
                onClick={() => setShowSaveConfirm(true)}
                disabled={generatedTasks.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  generatedTasks.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#4A2B4D] text-white hover:bg-[#3a2239]"
                }`}
              >
                <Save className="w-4 h-4" />
                Save Tasks
              </button>
              <button
                onClick={() => setShowSprintPlanningConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A2B4D] text-white rounded-lg hover:bg-[#3a2239] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Sprint Planning
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-lg font-semibold text-[#4A2B4D] mb-4">User Stories</h2>
                {storiesError && <p className="text-red-600">{storiesError}</p>}
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                  {userStories.map((us) => (
                    <div
                      key={us.uuid}
                      onClick={() => toggleSelectUserStory(us.uuid)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUserStories.includes(us.uuid)
                          ? "border-[#4A2B4D] bg-[#F5F0F1]"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-[#4A2B4D]">{us.title}</h3>
                        <span className="text-xs text-[#4A2B4D]/70">
                          {groupedByUserStory[us.uuid]?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks area */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4 text-[#4A2B4D]" />
                    Filters
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Clear
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {(["High", "Medium", "Low"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              filterPriority === p
                                ? p === "High"
                                  ? "bg-red-100 text-red-700"
                                  : p === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Story
                      </label>
                      <select
                        value={selectedUserStoryFilter || ""}
                        onChange={(e) =>
                          setSelectedUserStoryFilter(e.target.value || null)
                        }
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50"
                      >
                        <option value="">All User Stories</option>
                        {userStories.map((us) => (
                          <option key={us.uuid} value={us.uuid}>
                            {us.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setFilterPriority(null)
                        setSelectedUserStoryFilter(null)
                        setSearchTerm("")
                      }}
                      className="self-end px-3 py-1 text-sm text-[#4A2B4D] hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}

              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      editMode
                      onUpdate={(data) => handleUpdateTask(task.id, data)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onEdit={() => setEditingTask(task)}
                      userStoryTitle={userStoryTitles[task.user_story_id]}
                    />
                  ))}
                </div>
              ) : generatedTasks.length > 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No tasks match your filters.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {selectedUserStories.length > 0
                      ? "Select user stories and click 'Generate Tasks' to create tasks automatically."
                      : "Select at least one user story from the sidebar to generate tasks."}
                  </p>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#4A2B4D] text-white rounded-lg hover:bg-[#3a2239] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task Manually
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showClearConfirm && (
        <ConfirmDialog
          open
          title="Clear Tasks"
          message="Are you sure you want to clear all tasks? This action cannot be undone."
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={() => {
            handleClear()
            setShowClearConfirm(false)
          }}
        />
      )}

      {showSaveConfirm && (
        <ConfirmDialog
          open
          title="Save Tasks"
          message="Are you sure you want to save these tasks to your project?"
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={() => {
            handleSave()
            setShowSaveConfirm(false)
          }}
        />
      )}

      {showSprintPlanningConfirm && (
        <ConfirmDialog
          open
          title="Go to Sprint Planning"
          message="Make sure to save your tasks before proceeding to Sprint Planning. Do you want to continue?"
          onCancel={() => setShowSprintPlanningConfirm(false)}
          onConfirm={() => {
            router.push(`/dashboard?projectId=${projectId}`)
            setShowSprintPlanningConfirm(false)
          }}
        />
      )}

    {editingTask && (
    <TaskEditModal
        task={editingTask}
        open
        onClose={() => setEditingTask(null)}
        onUpdate={(data) => {
        handleUpdateTask(editingTask.id, data)
        setEditingTask(null)
        }}
        /*  👇  añade esto */
        userStories={userStories.map((us) => ({ id: us.uuid, title: us.title }))}
    />
    )}


      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#4A2B4D] mb-4">Add New Task</h2>
            <ManualTaskForm
              onSubmit={(data) => {
                handleAddTask(data)
                setShowAddTaskModal(false)
              }}
              onCancel={() => setShowAddTaskModal(false)}
              userStories={userStories.map((us) => ({ id: us.uuid, title: us.title }))}
            />
          </div>
        </div>
      )}
    </>
  )
}
