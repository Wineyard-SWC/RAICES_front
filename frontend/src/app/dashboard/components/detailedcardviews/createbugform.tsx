import { useState } from "react";
import { Save, X, Plus, Trash, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BugSeverity, BugType, BugPriority } from "@/types/bug";
import { v4 as uuidv4 } from "uuid"

interface CreateBugFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CreateBugForm = ({ onSave, onCancel }: CreateBugFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as BugPriority,
    severity: "Major" as BugSeverity,
    type: "Functional" as BugType,
    visibleToCustomers: false,
    stepsToReproduce: [] as string[],
    affectedComponents: [] as string[],
    status_khanban: "Backlog" as "Backlog" | "To Do" | "In Progress" | "In Review" | "Done",
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (
      tempInputs.newComponent.trim() &&
      !formData.affectedComponents.includes(tempInputs.newComponent.trim())
    ) {
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
      affectedComponents: formData.affectedComponents.filter((c) => c !== component),
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
      visibleToCustomers: formData.visibleToCustomers,
      stepsToReproduce: formData.stepsToReproduce,
      affectedComponents: formData.affectedComponents.length > 0 ? formData.affectedComponents : undefined,
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
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
            <option value="High">Trivial</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="High">Critical</option>
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
          <p className="text-xs text-gray-600 mt-1">
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
          <p className="text-xs text-gray-600 mt-1">
            {bugTypeOptions.find((o) => o.value === formData.type)?.description}
          </p>
        </div>
      </div>

      {/* Board Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Backlog Status
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

      {/* Visible to Customers */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="visibleToCustomers"
            checked={formData.visibleToCustomers}
            onChange={(e) => setFormData({ ...formData, visibleToCustomers: e.target.checked })}
            className="h-4 w-4 text-[#4A2B4A] focus:ring-[#4A2B4A] border-gray-300 rounded mr-3"
          />
          <label htmlFor="visibleToCustomers" className="text-lg font-medium text-red-600 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            This bug is visible to customers
          </label>
        </div>
      </div>

      {/* Steps to Reproduce */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-3">Steps to Reproduce</label>
        <div className="flex gap-2 mb-3">
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
                <span className="bg-[#4A2B4A] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
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

      {/* Environment Details */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-3">Environment Details</label>
        <div className="grid grid-cols-1 gap-3">
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

      {/* Affected Components */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-3">Affected Components</label>
        <div className="flex gap-2 mb-3">
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