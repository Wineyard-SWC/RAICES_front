"use client"

import type React from "react"

import { useState, useEffect, Fragment } from "react"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { useUser } from "@/contexts/usercontext"
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { v4 as uuidv4 } from "uuid"
import type { BugSeverity, BugType, BugPriority } from "@/types/bug"
import {
  X,
  Bug,
  AlertTriangle,
  AlertCircle,
  Laptop,
  Globe,
  Smartphone,
  Tag,
  FileText,
  ListOrdered,
  PlusCircle,
  Trash,
} from "lucide-react"
import { useBugs } from "@/contexts/bugscontext"
import type { Bug as BugInterface } from "@/types/bug"
import { createBug } from "@/hooks/useBug"

interface BugReportFormProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

const BugReportForm: React.FC<BugReportFormProps> = ({ isOpen, onClose, projectId }) => {
  const { updateBug } = useKanban()
  const { userId, userData } = useUser()
  const { addBugToProject } = useBugs()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [stepsToReproduce, setStepsToReproduce] = useState<string[]>([])
  const [newStep, setNewStep] = useState("")
  const [severity, setSeverity] = useState<BugSeverity>("Major")
  const [priority, setPriority] = useState<BugPriority>("Medium")
  const [bugType, setBugType] = useState<BugType>("Functional")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [affectedComponents, setAffectedComponents] = useState<string[]>([])
  const [newComponent, setNewComponent] = useState("")
  const [visibleToCustomers, setVisibleToCustomers] = useState(false)

  // Environment details
  const [environment, setEnvironment] = useState({
    browser: "",
    os: "",
    device: "",
    version: "",
    otherDetails: "",
  })

  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStepsToReproduce([])
    setNewStep("")
    setSeverity("Major")
    setPriority("Medium")
    setBugType("Functional")
    setErrors({})
    setAffectedComponents([])
    setNewComponent("")
    setVisibleToCustomers(false)
    setEnvironment({
      browser: "",
      os: "",
      device: "",
      version: "",
      otherDetails: "",
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddStep = () => {
    if (newStep.trim()) {
      setStepsToReproduce([...stepsToReproduce, newStep.trim()])
      setNewStep("")
    }
  }

  const handleRemoveStep = (index: number) => {
    const updatedSteps = [...stepsToReproduce]
    updatedSteps.splice(index, 1)
    setStepsToReproduce(updatedSteps)
  }

  const handleAddComponent = () => {
    if (newComponent.trim() && !affectedComponents.includes(newComponent.trim())) {
      setAffectedComponents([...affectedComponents, newComponent.trim()])
      setNewComponent("")
    }
  }

  const handleRemoveComponent = (component: string) => {
    setAffectedComponents(affectedComponents.filter((c) => c !== component))
  }

  const handleEnvironmentChange = (field: keyof typeof environment, value: string) => {
    setEnvironment({
      ...environment,
      [field]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const bugId = uuidv4()
      const currentDate = new Date().toISOString()

      const reportedBy = {
        users: [userId || "", userData?.name || ""] as [string, string],
      }

      const newBug: BugInterface = {
        id: bugId,
        title,
        description,
        type: bugType,
        severity,
        priority,
        status_khanban: "Backlog",
        bug_status: "New",
        projectId,
        reportedBy,
        assignee: [],
        createdAt: currentDate,
        modifiedAt: currentDate,
        stepsToReproduce,
        visibleToCustomers,
        affectedComponents: affectedComponents.length > 0 ? affectedComponents : undefined,
        environment: Object.values(environment).some((val) => val.trim() !== "")
          ? {
              browser: environment.browser || undefined,
              os: environment.os || undefined,
              device: environment.device || undefined,
              version: environment.version || undefined,
              otherDetails: environment.otherDetails || undefined,
            }
          : undefined,
      }

      addBugToProject(projectId, newBug)

      await createBug(newBug)

      onClose()
    } catch (error) {
      console.error("Error creating bug:", error)
      setErrors({ submit: "Failed to create bug. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const severityOptions = [
    { value: "Blocker", label: "Blocker", icon: <AlertCircle className="h-4 w-4 text-red-600" /> },
    { value: "Critical", label: "Critical", icon: <AlertTriangle className="h-4 w-4 text-red-600" /> },
    { value: "Major", label: "Major", icon: <AlertTriangle className="h-4 w-4 text-orange-500" /> },
    { value: "Minor", label: "Minor", icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
    { value: "Trivial", label: "Trivial", icon: <AlertTriangle className="h-4 w-4 text-blue-500" /> },
  ]

  const priorityOptions = [
    { value: "High", label: "High", color: "bg-red-100 text-red-800 border-red-200" },
    { value: "Medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "Low", label: "Low", color: "bg-green-100 text-green-800 border-green-200" },
  ]

  const bugTypeOptions = [
    { value: "Functional", label: "Functional", description: "The feature doesn't work as expected" },
    { value: "Visual", label: "Visual", description: "UI issues, layout problems, or styling errors" },
    { value: "Performance", label: "Performance", description: "Slow loading times or high resource usage" },
    { value: "Security", label: "Security", description: "Vulnerabilities or security concerns" },
    { value: "Compatibility", label: "Compatibility", description: "Issues with specific browsers or devices" },
    { value: "Usability", label: "Usability", description: "Difficult to use or understand features" },
    { value: "Other", label: "Other", description: "Other types of bugs" },
  ]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="bg-[#F5F0F1] rounded-xl shadow-xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <Bug className="h-7 w-7 text-red-600" />
                    <DialogTitle as="h3" className="text-2xl font-bold text-[#4A2B4A]">
                      Report a Bug
                    </DialogTitle>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-200 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  {/* Basic Information Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4 flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Basic Information
                    </h4>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="title" className="block text-lg font-medium text-black">
                          Bug Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter a descriptive title"
                          className={`h-12 bg-white text-lg text-black ${errors.title ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Severity */}
                        <div className="space-y-2">
                          <label htmlFor="severity" className="block text-lg font-medium text-black">
                            Severity
                          </label>
                          <select
                            id="severity"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                            className="w-full h-12 rounded-md border-gray-300 bg-white text-lg text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                          >
                            {severityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            {severityOptions.find((o) => o.value === severity)?.icon}
                            <span>
                              {severity === "Blocker"
                                ? "Completely blocks development or testing work"
                                : severity === "Critical"
                                  ? "No workaround, severe impact on users"
                                  : severity === "Major"
                                    ? "Major feature impact, workaround possible"
                                    : severity === "Minor"
                                      ? "Minor loss of function"
                                      : "Cosmetic issue only"}
                            </span>
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                          <label htmlFor="priority" className="block text-lg font-medium text-black">
                            Priority
                          </label>
                          <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as BugPriority)}
                            className="w-full h-12 rounded-md border-gray-300 bg-white text-lg text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                          >
                            {priorityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                priorityOptions.find((o) => o.value === priority)?.color
                              }`}
                            >
                              {priority}
                            </span>
                          </div>
                        </div>

                        {/* Bug Type */}
                        <div className="space-y-2">
                          <label htmlFor="type" className="block text-lg font-medium text-black">
                            Bug Type
                          </label>
                          <select
                            id="type"
                            value={bugType}
                            onChange={(e) => setBugType(e.target.value as BugType)}
                            className="w-full h-12 rounded-md border-gray-300 bg-white text-lg text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                          >
                            {bugTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <p className="text-sm text-gray-600 mt-1">
                            {bugTypeOptions.find((o) => o.value === bugType)?.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="description" className="block text-lg font-medium text-black">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the bug in detail"
                          rows={4}
                          className={`w-full rounded-md border p-3 bg-white text-lg text-black ${
                            errors.description ? "border-red-500" : "border-gray-300"
                          } shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]`}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                      </div>

                      <div className="flex items-center">
                        <input
                          id="visibleToCustomers"
                          type="checkbox"
                          checked={visibleToCustomers}
                          onChange={(e) => setVisibleToCustomers(e.target.checked)}
                          className="h-5 w-5 text-[#4A2B4A] focus:ring-[#4A2B4A] border-gray-300 rounded"
                        />
                        <label htmlFor="visibleToCustomers" className="ml-2 block text-base text-red-600 font-medium">
                          This bug is visible to customers
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Steps to Reproduce Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4 flex items-center gap-2">
                      <ListOrdered className="h-5 w-5" />
                      Steps to Reproduce
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={newStep}
                            onChange={(e) => setNewStep(e.target.value)}
                            placeholder="Add a step to reproduce the bug"
                            className="w-full h-12 rounded-md border-gray-300 bg-white text-lg text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddStep()
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddStep}
                          className="bg-[#4A2B4A] hover:bg-[#3a2248] h-12 px-4"
                        >
                          <PlusCircle className="h-5 w-5" />
                          <span className="sr-only">Add Step</span>
                        </Button>
                      </div>

                      {stepsToReproduce.length > 0 ? (
                        <ul className="space-y-2 mt-2">
                          {stepsToReproduce.map((step, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-[#F5F0F1] p-3 rounded-md border border-gray-200"
                            >
                              <div className="flex items-center gap-2">
                                <span className="bg-[#4A2B4A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </span>
                                <span className="text-lg">{step}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveStep(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-5 w-5" />
                                <span className="sr-only">Remove Step</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No steps added yet. Add steps to help reproduce the bug.</p>
                      )}
                    </div>
                  </div>

                  {/* Environment Details Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4 flex items-center gap-2">
                      <Laptop className="h-5 w-5" />
                      Environment Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="browser"
                          className="block text-base font-medium text-black flex items-center gap-1.5"
                        >
                          <Globe className="h-4 w-4 text-gray-600" />
                          Browser
                        </label>
                        <input
                          id="browser"
                          type="text"
                          value={environment.browser}
                          onChange={(e) => handleEnvironmentChange("browser", e.target.value)}
                          placeholder="e.g., Chrome 98, Firefox 97"
                          className="w-full h-10 rounded-md border-gray-300 bg-white text-base text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="os"
                          className="block text-base font-medium text-black flex items-center gap-1.5"
                        >
                          <Laptop className="h-4 w-4 text-gray-600" />
                          Operating System
                        </label>
                        <input
                          id="os"
                          type="text"
                          value={environment.os}
                          onChange={(e) => handleEnvironmentChange("os", e.target.value)}
                          placeholder="e.g., Windows 11, macOS 12"
                          className="w-full h-10 rounded-md border-gray-300 bg-white text-base text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="device"
                          className="block text-base font-medium text-black flex items-center gap-1.5"
                        >
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          Device
                        </label>
                        <input
                          id="device"
                          type="text"
                          value={environment.device}
                          onChange={(e) => handleEnvironmentChange("device", e.target.value)}
                          placeholder="e.g., iPhone 13, Desktop"
                          className="w-full h-10 rounded-md border-gray-300 bg-white text-base text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="version"
                          className="block text-base font-medium text-black flex items-center gap-1.5"
                        >
                          <Tag className="h-4 w-4 text-gray-600" />
                          App Version
                        </label>
                        <input
                          id="version"
                          type="text"
                          value={environment.version}
                          onChange={(e) => handleEnvironmentChange("version", e.target.value)}
                          placeholder="e.g., v2.1.0"
                          className="w-full h-10 rounded-md border-gray-300 bg-white text-base text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label
                          htmlFor="otherDetails"
                          className="block text-base font-medium text-black flex items-center gap-1.5"
                        >
                          <FileText className="h-4 w-4 text-gray-600" />
                          Other Details
                        </label>
                        <textarea
                          id="otherDetails"
                          value={environment.otherDetails}
                          onChange={(e) => handleEnvironmentChange("otherDetails", e.target.value)}
                          placeholder="Any other relevant environment details"
                          rows={2}
                          className="w-full rounded-md border border-gray-300 p-3 bg-white text-base text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Affected Components Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Affected Components
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={newComponent}
                            onChange={(e) => setNewComponent(e.target.value)}
                            placeholder="Add affected component"
                            className="w-full h-12 rounded-md border-gray-300 bg-white text-lg text-black shadow-sm focus:border-[#4A2B4A] focus:ring-[#4A2B4A]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleAddComponent()
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddComponent}
                          className="bg-[#4A2B4A] hover:bg-[#3a2248] h-12 px-4"
                        >
                          <PlusCircle className="h-5 w-5" />
                          <span className="sr-only">Add Component</span>
                        </Button>
                      </div>

                      {affectedComponents.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {affectedComponents.map((component) => (
                            <div
                              key={component}
                              className="flex items-center gap-1.5 bg-[#F5F0F1] px-3 py-1.5 rounded-full"
                            >
                              <span>{component}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveComponent(component)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No components added yet. Add components affected by this bug.
                        </p>
                      )}
                    </div>
                  </div>

                  {errors.submit && <p className="text-red-500 text-lg">{errors.submit}</p>}

                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-[#4A2B4A] bg-white px-5 py-3 text-lg font-medium text-[#4A2B4A] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4A2B4A] focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      className="bg-[#4A2B4A] hover:bg-[#3a2248] text-lg px-5 py-3 h-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Report Bug"}
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default BugReportForm