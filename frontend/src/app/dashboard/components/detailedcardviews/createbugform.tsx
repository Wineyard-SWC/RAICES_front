import { useState } from "react";
import { Save, X, Plus, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BugSeverity, BugType, BugPriority } from "@/types/bug";
import { v4 as uuidv4 } from "uuid"

interface CreateBugFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  availableUsers?: Array<{ id: string; name: string }>;
  availableSprints?: Array<{ id: string; name: string }>;
  availableTasks?: Array<{ id: string; title: string }>;
  availableUserStories?: Array<{ id: string; title: string }>;
}
const CreateBugForm = ({ 
  onSave, 
  onCancel, 
  availableUsers = [], 
  availableSprints = [], 
  availableTasks = [], 
  availableUserStories = [] 
}: CreateBugFormProps) => { 
   const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as BugPriority,
    severity: "Major" as BugSeverity,
    type: "Functional" as BugType,
    visibleToCustomers: false,
    stepsToReproduce: [] as string[],
    affectedComponents: [] as string[],
    tags: [] as string[],
    relatedBugs: [] as string[],
    status_khanban: "Backlog" as "Backlog" | "To Do" | "In Progress" | "In Review" | "Done",
    bug_status: "New" as "New" | "Triaged" | "In_progress" | "Testing" | "Reopened" | "Resolved" | "Closed",
    taskRelated: "",
    userStoryRelated: "",
    sprintId: "",
    assignees: [] as Array<{ users: [string, string] }>,
    expectedBehavior: "",
    actualBehavior: "",
    duplicateOf: "",
    isRegression: false,
    affectedUsers: 0,
    environment: {
      browser: "",
      os: "",
      device: "",
      version: "",
      otherDetails: "",
    },
  });

  const [tempInputs, setTempInputs] = useState({
    newStep: "",
    newComponent: "",
    newTag: "",
    newRelatedBug: "",
    newAssignee: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAssignee = () => {
    if (tempInputs.newAssignee && !formData.assignees.some(a => a.users[0] === tempInputs.newAssignee)) {
      const user = availableUsers.find(u => u.id === tempInputs.newAssignee);
      if (user) {
        setFormData({
          ...formData,
          assignees: [...formData.assignees, { users: [user.id, user.name] }],
        });
        setTempInputs({ ...tempInputs, newAssignee: "" });
      }
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setFormData({
      ...formData,
      assignees: formData.assignees.filter(a => a.users[0] !== userId),
    });
  };

  const handleAddStep = () => {
    if (tempInputs.newStep.trim()) {
      setFormData({
        ...formData,
        stepsToReproduce: [...formData.stepsToReproduce, tempInputs.newStep.trim()],
      });
      setTempInputs({ ...tempInputs, newStep: "" });
    }
  };

  const handleRemoveStep = (index: number) => {
    const updated = [...formData.stepsToReproduce];
    updated.splice(index, 1);
    setFormData({ ...formData, stepsToReproduce: updated });
  };

  const handleAddComponent = () => {
    if (tempInputs.newComponent.trim() && !formData.affectedComponents.includes(tempInputs.newComponent.trim())) {
      setFormData({
        ...formData,
        affectedComponents: [...formData.affectedComponents, tempInputs.newComponent.trim()],
      });
      setTempInputs({ ...tempInputs, newComponent: "" });
    }
  };

  const handleRemoveComponent = (component: string) => {
    setFormData({
      ...formData,
      affectedComponents: formData.affectedComponents.filter(c => c !== component),
    });
  };

  const handleAddTag = () => {
    if (tempInputs.newTag.trim() && !formData.tags.includes(tempInputs.newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tempInputs.newTag.trim()],
      });
      setTempInputs({ ...tempInputs, newTag: "" });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleAddRelatedBug = () => {
    if (tempInputs.newRelatedBug.trim() && !formData.relatedBugs.includes(tempInputs.newRelatedBug.trim())) {
      setFormData({
        ...formData,
        relatedBugs: [...formData.relatedBugs, tempInputs.newRelatedBug.trim()],
      });
      setTempInputs({ ...tempInputs, newRelatedBug: "" });
    }
  };

  const handleRemoveRelatedBug = (bugId: string) => {
    setFormData({
      ...formData,
      relatedBugs: formData.relatedBugs.filter(b => b !== bugId),
    });
  };

  const handleEnvironmentChange = (field: keyof typeof formData.environment, value: string) => {
    setFormData({
      ...formData,
      environment: {
        ...formData.environment,
        [field]: value,
      },
    });
  };


  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const bugId = uuidv4();
    const bugData = {
      id: bugId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      severity: formData.severity,
      type: formData.type,
      status_khanban: formData.status_khanban,
      bug_status: formData.bug_status,
      visibleToCustomers: formData.visibleToCustomers,
      stepsToReproduce: formData.stepsToReproduce,
      affectedComponents: formData.affectedComponents.length > 0 ? formData.affectedComponents : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      relatedBugs: formData.relatedBugs.length > 0 ? formData.relatedBugs : undefined,
      taskRelated: formData.taskRelated || undefined,
      userStoryRelated: formData.userStoryRelated || undefined,
      sprintId: formData.sprintId || undefined,
      assignees: formData.assignees,
      expectedBehavior: formData.expectedBehavior || undefined,
      actualBehavior: formData.actualBehavior || undefined,
      duplicateOf: formData.duplicateOf || undefined,
      isRegression: formData.isRegression,
      affectedUsers: formData.affectedUsers || undefined,
      environment: Object.values(formData.environment).some((val) => val.trim() !== "")
        ? {
            browser: formData.environment.browser || undefined,
            os: formData.environment.os || undefined,
            device: formData.environment.device || undefined,
            version: formData.environment.version || undefined,
            otherDetails: formData.environment.otherDetails || undefined,
          }
        : undefined,
    };

    onSave(bugData);
  };

  const severityOptions = [
    { value: "Blocker", label: "Blocker", description: "Completely blocks development", icon: <AlertTriangle className="h-4 w-4 text-red-600" /> },
    { value: "Critical", label: "Critical", description: "No workaround, severe impact", icon: <AlertTriangle className="h-4 w-4 text-red-600" /> },
    { value: "Major", label: "Major", description: "Major feature impact", icon: <AlertTriangle className="h-4 w-4 text-orange-500" /> },
    { value: "Minor", label: "Minor", description: "Minor loss of function", icon: <AlertTriangle className="h-4 w-4 text-yellow-500" /> },
    { value: "Trivial", label: "Trivial", description: "Cosmetic issue only", icon: <AlertTriangle className="h-4 w-4 text-blue-500" /> },
  ];

  const bugTypeOptions = [
    { value: "Functional", label: "Functional", description: "Feature doesn't work as expected" },
    { value: "Visual", label: "Visual", description: "UI issues or styling errors" },
    { value: "Performance", label: "Performance", description: "Slow loading or high resource usage" },
    { value: "Security", label: "Security", description: "Security vulnerabilities" },
    { value: "Compatibility", label: "Compatibility", description: "Browser or device issues" },
    { value: "Usability", label: "Usability", description: "Difficult to use features" },
    { value: "Other", label: "Other", description: "Other types of bugs" },
  ];


  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Title */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Bug Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full p-3 border rounded-md text-lg ${errors.title ? "border-red-500" : "border-gray-300"}`}
          placeholder="Enter a descriptive bug title"
        />
        {errors.title && <p className="text-red-500 text-lg mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className={`w-full p-3 border rounded-md text-lg ${errors.description ? "border-red-500" : "border-gray-300"}`}
          placeholder="Describe the bug in detail"
        />
        {errors.description && <p className="text-red-500 text-lg mt-1">{errors.description}</p>}
      </div>

      {/* Priority, Severity, Type */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Priority</label>
          <select
            aria-label="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as BugPriority })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
           </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Severity</label>
          <select
            aria-label="severity"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as BugSeverity })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-lg text-gray-600 mt-1">
            {severityOptions.find((o) => o.value === formData.severity)?.description}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Bug Type</label>
          <select
            aria-label="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as BugType })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            {bugTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-lg text-gray-600 mt-1">
            {bugTypeOptions.find((o) => o.value === formData.type)?.description}
          </p>
        </div>
      </div>

      {/* Board Status and Bug Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
            Kanban Status
          </label>
          <select
            aria-label="status_khanban"
            value={formData.status_khanban}
            onChange={(e) => setFormData({ ...formData, status_khanban: e.target.value as any })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="Backlog">Backlog</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
            Bug Status
          </label>
          <select
            aria-label="bug_status"
            value={formData.bug_status}
            onChange={(e) => setFormData({ ...formData, bug_status: e.target.value as any })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="New">New</option>
            <option value="Triaged">Triaged</option>
            <option value="In_progress">In Progress</option>
            <option value="Testing">Testing</option>
            <option value="Reopened">Reopened</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Related Items */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Related Task</label>
          <select
            aria-label="taskrelated"
            value={formData.taskRelated}
            onChange={(e) => setFormData({ ...formData, taskRelated: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="">-- No Task --</option>
            {availableTasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Related User Story</label>
          <select
            aria-label="storyrelated"
            value={formData.userStoryRelated}
            onChange={(e) => setFormData({ ...formData, userStoryRelated: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="">-- No User Story --</option>
            {availableUserStories.map(story => (
              <option key={story.id} value={story.id}>
                {story.title}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Sprint</label>
          <select
            aria-label="sprint"
            value={formData.sprintId}
            onChange={(e) => setFormData({ ...formData, sprintId: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
          >
            <option value="">-- No Sprint --</option>
            {availableSprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignees */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Assignees</label>
        
        {/* Current assignees */}
        {formData.assignees.length > 0 && (
          <div className="mb-3 space-y-2">
            {formData.assignees.map((assignee, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-lg">{assignee.users[1]} ({assignee.users[0]})</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveAssignee(assignee.users[0])}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new assignee */}
        <div className="flex gap-2">
          <select
            aria-label="assignee"
            value={tempInputs.newAssignee}
            onChange={(e) => setTempInputs({ ...tempInputs, newAssignee: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
          >
            <option value="">Select user to assign</option>
            {availableUsers
              .filter(u => !formData.assignees.some(a => a.users[0] === u.id))
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
          <Button
            type="button"
            onClick={handleAddAssignee}
            variant="outline"
            size="sm"
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expected vs Actual Behavior */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Expected Behavior:</p>
        <textarea
          value={formData.expectedBehavior}
          onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
          placeholder="What should happen?"
        />
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Actual Behavior:</p>
        <textarea
          value={formData.actualBehavior}
          onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
          rows={2}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
          placeholder="What actually happens?"
        />
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Affected Users:</p>
          <input
            aria-label="users"
            type="number"
            min="0"
            value={formData.affectedUsers}
            onChange={(e) => setFormData({ ...formData, affectedUsers: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Duplicate Of:</p>
          <input
            type="text"
            value={formData.duplicateOf}
            onChange={(e) => setFormData({ ...formData, duplicateOf: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Bug ID"
          />
        </div>
      </div>

      {/* Regression Checkbox */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRegression"
            checked={formData.isRegression}
            onChange={(e) => setFormData({ ...formData, isRegression: e.target.checked })}
            className="h-4 w-4 text-[#4A2B4A] focus:ring-[#4A2B4A] border-gray-300 rounded mr-2"
          />
          <label htmlFor="isRegression" className="text-lg font-medium text-[#4A2B4A]">
            This is a regression
          </label>
        </div>
      </div>

      {/* Visible to Customers */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="visibleToCustomers"
            checked={formData.visibleToCustomers}
            onChange={(e) => setFormData({ ...formData, visibleToCustomers: e.target.checked })}
            className="h-4 w-4 text-[#4A2B4A] focus:ring-[#4A2B4A] border-gray-300 rounded mr-2"
          />
          <label htmlFor="visibleToCustomers" className="text-lg font-medium text-red-600">
            This bug is visible to customers
          </label>
        </div>
      </div>

      {/* Environment Details */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Environment Details:</p>
        <div className="grid grid-cols-1 gap-2">
          <input
            type="text"
            value={formData.environment.browser}
            onChange={(e) => handleEnvironmentChange("browser", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Browser (e.g., Chrome 98)"
          />
          <input
            type="text"
            value={formData.environment.os}
            onChange={(e) => handleEnvironmentChange("os", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Operating System (e.g., Windows 11)"
          />
          <input
            type="text"
            value={formData.environment.device}
            onChange={(e) => handleEnvironmentChange("device", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Device (e.g., iPhone 13)"
          />
          <input
            type="text"
            value={formData.environment.version}
            onChange={(e) => handleEnvironmentChange("version", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            placeholder="App Version (e.g., v2.1.0)"
          />
          <textarea
            value={formData.environment.otherDetails}
            onChange={(e) => handleEnvironmentChange("otherDetails", e.target.value)}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Other relevant details"
          />
        </div>
      </div>

      {/* Steps to Reproduce */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Steps to Reproduce:</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tempInputs.newStep}
            onChange={(e) => setTempInputs({ ...tempInputs, newStep: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Add a step to reproduce"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddStep();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddStep}
            variant="outline"
            size="sm"
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.stepsToReproduce.length > 0 ? (
          <div className="space-y-2">
            {formData.stepsToReproduce.map((step, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md">
                <span className="bg-[#4A2B4A] text-white w-5 h-5 rounded-full flex items-center justify-center text-lg">
                  {index + 1}
                </span>
                <span className="flex-1 text-lg">{step}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveStep(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-lg">No steps added yet</p>
        )}
      </div>

      {/* Affected Components */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Affected Components:</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tempInputs.newComponent}
            onChange={(e) => setTempInputs({ ...tempInputs, newComponent: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Add affected component"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddComponent();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddComponent}
            variant="outline"
            size="sm"
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.affectedComponents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.affectedComponents.map((component) => (
              <div key={component} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-lg">{component}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveComponent(component)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 p-0 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-lg">No components added yet</p>
        )}
      </div>

      {/* Tags */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Tags:</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tempInputs.newTag}
            onChange={(e) => setTempInputs({ ...tempInputs, newTag: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Add tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            size="sm"
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                <span className="text-lg text-blue-800">{tag}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 p-0 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-lg">No tags added yet</p>
        )}
      </div>

      {/* Related Bugs */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Related Bugs:</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tempInputs.newRelatedBug}
            onChange={(e) => setTempInputs({ ...tempInputs, newRelatedBug: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
            placeholder="Add related bug ID"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddRelatedBug();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddRelatedBug}
            variant="outline"
            size="sm"
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.relatedBugs.length > 0 ? (
          <div className="space-y-2">
            {formData.relatedBugs.map((bugId) => (
              <div key={bugId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-lg">{bugId}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveRelatedBug(bugId)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-lg">No related bugs added yet</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onCancel}
          type="button"
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
        >
          <Save className="h-4 w-4 mr-2" />
          Report Bug
        </Button>
      </div>
    </form>
  );
};


export default CreateBugForm;