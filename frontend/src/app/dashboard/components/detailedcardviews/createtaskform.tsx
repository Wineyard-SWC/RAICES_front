import { useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateTaskFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

const CreateTaskForm = ({ onSave, onCancel }: CreateTaskFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    deadline: "",
    user_story_title: "",
    status_khanban: "Backlog" as "Backlog" | "To Do" | "In Progress" | "In Review" | "Done"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      deadline: formData.deadline || undefined,
      user_story_title: formData.user_story_title.trim() || undefined,
      status_khanban: formData.status_khanban,
    };

    onSave(taskData);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full p-3 border rounded-md text-lg ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter task title"
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
          className={`w-full p-3 border rounded-md text-lg ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Describe the task in detail"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Priority */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Priority</label>
        <select
          aria-label ="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as "High" | "Medium" | "Low" })}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      
      {/* Deadline */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Deadline (Optional)</label>
        <input
          aria-label ="date"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
        />
      </div>
      
      {/* Status Kanban */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Backlog Status
        </label>
        <select
          aria-label="status_khanban"
          value={formData.status_khanban}
          onChange={e => setFormData({ ...formData, status_khanban: e.target.value as any })}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
        >
          <option value="Backlog">Backlog</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Related User Story */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Related User Story (Optional)</label>
        <input
          type="text"
          value={formData.user_story_title}
          onChange={(e) => setFormData({ ...formData, user_story_title: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
          placeholder="Enter related user story title"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
        >
          <Save className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default CreateTaskForm;