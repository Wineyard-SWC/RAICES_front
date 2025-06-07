"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {ListChecks,Plus,Save,ArrowRight,RefreshCw,Trash2,
        Filter,Search,Download,ChevronDown,ChevronRight} from "lucide-react"
import Navbar from "@/components/NavBar"
import ConfirmDialog from "@/components/confimDialog"
import TaskCard from "./components/taskcard"
import TaskEditModal from "./components/taskeditmodal"
import ManualTaskForm from "./components/ManualTaskForm"
import type { Task, TaskFormData } from "@/types/task"
import { useGenerateTasksLogic } from "./hooks/useGenerateTasksLogic"
import LoadingTasks from "@/components/animations/loadingTasks"
import Toast from '@/components/toast';
import useToast from '@/hooks/useToast';
import { printError } from "@/utils/debugLogger"



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
    handleSelectAlltasks,
    handleToggleSelectTask,
    handleClear,
    toggleSelectAllTasks,
    allSelected,
    isSavingTasks,
    handleImportUnassignedTasks,
    isLoadingUnassigned
  } = useGenerateTasksLogic()


  const handleSaveWithFeedback = async () => {
    try {
      setIsSaving(true);
      setIsSaving(false);
      setShowSaveConfirm(false);
      await handleSave();
    } catch (error) {
      printError('Error saving tasks:', error);
      showToast('Error saving tasks. Please try again.', 'error');
    } finally {
      showToast('Tasks saved successfully!', 'success');
    }
  };
  
  const handleGenerateWithFeedback = async () => {
    try {
      setIsGenerating(true);      
      setShowGenerateConfirm(false);
      await handleGenerate();
      showToast('Tasks generated successfully!', 'success');
    } catch (error) {
      showToast('Error generating tasks. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleClearWithFeedback = () => {
    handleClear();
    setShowClearConfirm(false);
    showToast('All tasks cleared successfully', 'success');
  };

  const handleImportWithFeedback = async () => {
    try {
      await handleImportUnassignedTasks();
      showToast('Unassigned tasks imported successfully!', 'success');
    } catch (error) {
      showToast('Error importing unassigned tasks. Please try again.', 'error');
    }
  };

  const handleUpdateWithFeedback = (taskId: string, updatedData: Partial<Task>) => {
    handleUpdateTask(taskId, updatedData);
    showToast('Task updated successfully!', 'success');
  };

  const handleDeleteWithFeedback = (taskId: string) => {
    handleDeleteTask(taskId);
    showToast('Task deleted successfully!', 'success');
  };

  const handleSubmitWithFeedback = (data: TaskFormData) => {
    handleAddTask(data);
    setShowAddTaskModal(false);
    showToast('Task added successfully!', 'success');
  };

  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [selectedUserStoryFilter, setSelectedUserStoryFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showSprintPlanningConfirm, setShowSprintPlanningConfirm] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

   const toggleSection = (storyId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }))
  }

  // Filtrar tareas
  const groupedFilteredTasks = generatedTasks.reduce((acc, task) => {
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesStory = !selectedUserStoryFilter || task.user_story_id === selectedUserStoryFilter;
  
    if (matchesSearch && matchesPriority && matchesStory) {
      const storyId = task.user_story_id ?? 'Unassigned';
      if (!acc[storyId]) acc[storyId] = [];
      acc[storyId].push(task);
    }
  
    return acc;
  }, {} as Record<string, Task[]>);



  return (
    <>
      <LoadingTasks isLoading={isLoadingStories || isLoading} useFlower={isSavingTasks} />
      <Navbar projectSelected />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />

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
                onClick={()=>{setShowGenerateConfirm(true)}}
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

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[60vh] ">
            {/* Sidebar de User Stories */}
            <div className="lg:col-span-1 h-full">
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col h-full mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#4A2B4D]">User Stories</h2>
                  <button
                    onClick={() => {
                      const allSelected = userStories.every(us =>
                        selectedUserStories.includes(us.uuid)
                      )
                      if (allSelected) {
                        userStories.forEach(us => {
                          if (selectedUserStories.includes(us.uuid)) {
                            toggleSelectUserStory(us.uuid)
                          }
                        })
                      } else {
                        userStories.forEach(us => {
                          if (!selectedUserStories.includes(us.uuid)) {
                            toggleSelectUserStory(us.uuid)
                          }
                        })
                      }
                    }}
                    className="text-sm text-[#4A2B4D] hover:underline"
                  >
                    Select All
                  </button>
                </div>

                {storiesError && <p className="text-red-600">{storiesError}</p>}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 flex-1">
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
            <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-4 flex flex-col h-full">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative w-full">
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
                        aria-label="Select User Stories"
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
              <div className="overflow-y-auto flex-1 pr-2 space-y-6 min-h-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#4A2B4D]">Tasks</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAllTasks}
                      className="text-sm text-[#4A2B4D] hover:underline"
                    >
                      {allSelected ? "Deselect All Tasks" : "Select All Tasks"}
                    </button>
                    <button
                      onClick={handleImportWithFeedback}
                      disabled={isLoadingUnassigned}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                        isLoadingUnassigned
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#4A2B4D] text-white hover:bg-[#3a2239]"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      {isLoadingUnassigned ? "Importing..." : "Import Unassigned Tasks"}
                    </button>
                  </div>
                </div>
                 {Object.entries(groupedFilteredTasks).length > 0 ? (
                  <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-6 ">
                    {Object.entries(groupedFilteredTasks).map(([storyId, tasks]) => {
                      const isCollapsed = collapsedSections[storyId]
                      const storyTitle = userStoryTitles[storyId] ?? "Unassigned"
                      
                      return (
                        <div key={storyId} className="border border-gray-200 rounded-lg shadow-sm bg-white">
                          {/* Card Header */}
                          <div 
                            onClick={() => toggleSection(storyId)}
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isCollapsed ? (
                                  <ChevronRight className="w-5 h-5 text-[#4A2B4D]" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-[#4A2B4D]" />
                                )}
                                <h3 className="text-lg font-semibold text-[#4A2B4D]">
                                  {storyTitle}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {tasks.filter(t => t.selected).length} selected
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Card Content */}
                          {!isCollapsed && (
                            <div className="p-4 space-y-4">
                              {tasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  editMode
                                  onUpdate={(data) => handleUpdateWithFeedback(task.id, data)}
                                  onDelete={() => handleDeleteWithFeedback(task.id)}
                                  onEdit={() => setEditingTask(task)}
                                  onSelect={() => handleToggleSelectTask(task.id)}
                                  userStoryTitle={storyTitle}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {selectedUserStories.length > 0
                      ? "No tasks match your filters."
                      : "Select user stories and click 'Generate Tasks' to create tasks automatically."}
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
      </div>

      {/* Modals */}
      {showClearConfirm && (
        <ConfirmDialog
          open
          title="Clear Tasks"
          message="Are you sure you want to clear all tasks? This action cannot be undone."
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={handleClearWithFeedback}
        />
      )}

      {showSaveConfirm && (
        <ConfirmDialog
          open
          title="Save Tasks"
          message={
            generatedTasks.some(t => t.selected && t.user_story_title === "Unassigned" && t.user_story_id === "Unassigned")
              ? `Are you sure you want to save these tasks to your project? Tasks marked as "Unassigned" will be skipped as they don't have a valid user story.\n\nTasks that are not currently selected will not be saved.`
              : `Are you sure you want to save this tasks to your project.\nThe tasks that are not currently selected will not be saved.`
          }
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSaveWithFeedback}
          isLoading={isSaving}
          confirmText={isSaving ? "Saving..." : "Save"}
        />
      )}

      {showGenerateConfirm && (
        <ConfirmDialog
          open={showGenerateConfirm}
          title="Generate Tasks"
          message={`Generating tasks will overwrite the AI generated tasks of the same user story, new ones will be integrated to the current list.\nManual tasks you've created will stay as they are.`}
          onCancel={() => setShowGenerateConfirm(false)}
          onConfirm={handleGenerateWithFeedback}
          isLoading={isGenerating}
          confirmText={isGenerating ? "Generating..." : "Generate"}
        />
      )}

      {showSprintPlanningConfirm && (
        <ConfirmDialog
          open
          title="Go to Sprint Planning"
          message="Make sure to save your tasks before proceeding to Sprint Planning. Do you want to continue?"
          onCancel={() => setShowSprintPlanningConfirm(false)}
          onConfirm={() => {
            router.push(`/sprint_planning?projectId=${projectId}`)
            setShowSprintPlanningConfirm(false)
          }}
        />
      )}

    {editingTask && (
    <TaskEditModal
        task={editingTask}
        open
        onClose={() => setEditingTask(null)}
        onUpdate={(taskId, updatedData) => {
          handleUpdateWithFeedback(taskId, updatedData)
        }}
        userStories={userStories.map((us) => ({ id: us.uuid, title: us.title }))}
    />
    )}


      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F0F1] rounded-xl shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-[#4A2B4D] mb-4">Add New Task</h2>
            <ManualTaskForm
              onSubmit={(data) => {
                handleSubmitWithFeedback(data)
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
