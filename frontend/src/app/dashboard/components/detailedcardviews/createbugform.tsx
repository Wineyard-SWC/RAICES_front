import { useState } from "react";
import { Save, X, Plus, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BugSeverity, BugType, BugPriority } from "@/types/bug";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/contexts/usercontext";

interface CreateBugFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  projectId: string;
  availableTasks?: Array<{ id: string; title: string }>;
  availableUserStories?: Array<{ uuid: string; title: string }>;  // Cambiado a uuid
  availableUsers?: Array<{ id: string; name: string }>;
  availableSprints?: Array<{ id: string; name: string }>;
}

const CreateBugForm = ({ 
  onSave, 
  onCancel,
  projectId,
  availableTasks = [], 
  availableUserStories = [],
  availableUsers = [],
  availableSprints = []
}: CreateBugFormProps) => { 
  const { userId } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
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
    userStoryRelated: "",  // Este guardará el uuid de la user story
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
      userStoryRelated: formData.userStoryRelated || undefined,  // Guardará el uuid
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Basic Information
          </h4>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Brief description of the bug"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                placeholder="Detailed description of the bug"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Priority and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as BugPriority })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as BugSeverity })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {severityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bug Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bug Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as BugType })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {bugTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Visible to Customers */}
            <div className="flex items-center">
              <input
                id="visibleToCustomers"
                type="checkbox"
                checked={formData.visibleToCustomers}
                onChange={(e) => setFormData({ ...formData, visibleToCustomers: e.target.checked })}
                className="h-4 w-4 text-[#4A2B4A] focus:ring-[#4A2B4A] border-gray-300 rounded"
              />
              <label htmlFor="visibleToCustomers" className="ml-2 block text-sm text-red-600 font-medium">
                This bug is visible to customers
              </label>
            </div>
          </div>
        </div>

        {/* Relationships Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Relationships</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Related Task */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Task</label>
              <select
                value={formData.taskRelated}
                onChange={(e) => setFormData({ ...formData, taskRelated: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- No Task --</option>
                {availableTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Related User Story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related User Story</label>
              <select
                value={formData.userStoryRelated}
                onChange={(e) => setFormData({ ...formData, userStoryRelated: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- No User Story --</option>
                {availableUserStories.map(story => (
                  <option key={story.uuid} value={story.uuid}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
              <select
                value={formData.sprintId}
                onChange={(e) => setFormData({ ...formData, sprintId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              >
                <option value="">-- No Sprint --</option>
                {availableSprints.map(sprint => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
              {isLoading && <p className="text-xs text-gray-500 mt-1">Loading sprints...</p>}
            </div>
          </div>
        </div>

        {/* Expected vs Actual Behavior */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Expected vs Actual Behavior</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Behavior</label>
              <textarea
                value={formData.expectedBehavior}
                onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md h-20"
                placeholder="What should happen?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Behavior</label>
              <textarea
                value={formData.actualBehavior}
                onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md h-20"
                placeholder="What actually happens?"
              />
            </div>
          </div>
        </div>

        {/* Assignees Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Assignees</h4>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <select
                value={tempInputs.newAssignee}
                onChange={(e) => setTempInputs({ ...tempInputs, newAssignee: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select user to assign</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={handleAddAssignee}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.assignees.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Assigned to:</p>
                {formData.assignees.map((assignee, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{assignee.users[1]}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignee(assignee.users[0])}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Steps to Reproduce */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Steps to Reproduce</h4>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tempInputs.newStep}
                onChange={(e) => setTempInputs({ ...tempInputs, newStep: e.target.value })}
                placeholder="Add a step to reproduce the bug"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
              />
              <Button type="button" onClick={handleAddStep}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.stepsToReproduce.length > 0 && (
              <div className="space-y-2">
                {formData.stepsToReproduce.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                    <span className="flex-1 text-sm">{step}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStep(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Environment Details */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Environment Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Browser</label>
              <input
                type="text"
                value={formData.environment.browser}
                onChange={(e) => handleEnvironmentChange("browser", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Chrome 98, Firefox 97"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating System</label>
              <input
                type="text"
                value={formData.environment.os}
                onChange={(e) => handleEnvironmentChange("os", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Windows 11, macOS 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
              <input
                type="text"
                value={formData.environment.device}
                onChange={(e) => handleEnvironmentChange("device", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., iPhone 13, Desktop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Version</label>
              <input
                type="text"
                value={formData.environment.version}
                onChange={(e) => handleEnvironmentChange("version", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., v2.1.0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Details</label>
              <textarea
                value={formData.environment.otherDetails}
                onChange={(e) => handleEnvironmentChange("otherDetails", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-16"
                placeholder="Any other relevant environment details"
              />
            </div>
          </div>
        </div>

        {/* Affected Components */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Affected Components</h4>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tempInputs.newComponent}
                onChange={(e) => setTempInputs({ ...tempInputs, newComponent: e.target.value })}
                placeholder="Add affected component"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComponent())}
              />
              <Button type="button" onClick={handleAddComponent}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.affectedComponents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.affectedComponents.map((component, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                    <span className="text-sm">{component}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveComponent(component)}
                      className="h-4 w-4 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-[#4A2B4A] mb-4">Additional Information</h4>
          
          <div className="space-y-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempInputs.newTag}
                  onChange={(e) => setTempInputs({ ...tempInputs, newTag: e.target.value })}
                  placeholder="Add tag"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-md">
                      <span className="text-sm">{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTag(tag)}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Bugs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Bug IDs</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempInputs.newRelatedBug}
                  onChange={(e) => setTempInputs({ ...tempInputs, newRelatedBug: e.target.value })}
                  placeholder="Add related bug ID"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRelatedBug())}
                />
                <Button type="button" onClick={handleAddRelatedBug}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.relatedBugs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.relatedBugs.map((bugId, index) => (
                    <div key={index} className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-md">
                      <span className="text-sm">{bugId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRelatedBug(bugId)}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duplicate of Bug ID</label>
                <input
                  type="text"
                  value={formData.duplicateOf}
                  onChange={(e) => setFormData({ ...formData, duplicateOf: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Bug ID this duplicates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affected Users (estimate)</label>
                <input
                  type="number"
                  value={formData.affectedUsers}
                  onChange={(e) => setFormData({ ...formData, affectedUsers: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Is Regression */}
            <div className="flex items-center">
              <input
                id="isRegression"
                type="checkbox"
                checked={formData.isRegression}
                onChange={(e) => setFormData({ ...formData, isRegression: e.target.checked })}
                className="h-4 w-4 text-[#4A2B4A] focus:ring-[#4A2B4A] border-gray-300 rounded"
              />
              <label htmlFor="isRegression" className="ml-2 block text-sm text-gray-700">
                This is a regression (previously working feature)
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button type="submit" className="bg-[#4A2B4A] text-white hover:bg-[#3A1F3A]">
            <Save className="h-4 w-4 mr-1" />
            Create Bug
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBugForm;