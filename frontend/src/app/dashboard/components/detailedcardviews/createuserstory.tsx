import { useState } from "react";
import { Save, X, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/usercontext";
import { v4 as uuidv4 } from "uuid"

interface CreateUserStoryFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

interface AcceptanceCriteria {
  id: string;
  description: string;
  date_completed: string;
  date_created: string;
  date_modified: string;
  finished_by: [string, string];
  created_by: [string, string];
  modified_by: [string, string];
}

const getNow = () => new Date().toISOString();


const CreateUserStoryForm = ({ onSave, onCancel }: CreateUserStoryFormProps) => {
  const { userId, userData } = useUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    deadline: "",
    points: 0,
    acceptanceCriteria: [] as AcceptanceCriteria[],
    assigned_epic: "",
    status_khanban: "Backlog" as "Backlog" | "To Do" | "In Progress" | "In Review" | "Done"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddAcceptanceCriteria = () => {
    const now = getNow();
    setFormData({
      ...formData,
      acceptanceCriteria: [
        ...formData.acceptanceCriteria,
        {
          id: uuidv4(),
          description: "",
          date_completed: "",
          date_created: now,
          date_modified: now,
          finished_by: ["", ""],
          created_by: userId ? [userId, userData?.name ?? ""] : ["RAICES_IA", "RAICES_IA"],
          modified_by: userId ? [userId, userData?.name ?? ""] : ["RAICES_IA", "RAICES_IA"],
        }
      ]
    });
  };


  const handleUpdateAcceptanceCriteria = (index: number, value: string) => {
    const updated = [...formData.acceptanceCriteria];
    updated[index] = {
      ...updated[index],
      description: value,
      date_modified: getNow(),
      modified_by: userId ? [userId, userData?.name ?? ""] : ["RAICES_IA", "RAICES_IA"],
    };
    setFormData({ ...formData, acceptanceCriteria: updated });
  };

  const handleRemoveAcceptanceCriteria = (index: number) => {
    const updated = [...formData.acceptanceCriteria];
    updated.splice(index, 1);
    setFormData({ ...formData, acceptanceCriteria: updated });
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const userStoryData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      deadline: formData.deadline || undefined,
      points: formData.points,
      acceptanceCriteria: formData.acceptanceCriteria.filter(
        criteria => criteria.description.trim() !== ""
      ),
      assigned_epic: formData.assigned_epic.trim() || undefined,
      status_khanban: formData.status_khanban,
    };
    onSave(userStoryData);
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
          placeholder="As a [user], I want [goal] so that [benefit]"
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
          placeholder="Provide detailed information about this user story"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Priority and Story Points */}
      <div className="grid grid-cols-2 gap-4">
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

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Story Points</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
            placeholder="0"
          />
        </div>
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

      {/* Epic Assignment */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Assigned Epic (Optional)</label>
        <input
          type="text"
          value={formData.assigned_epic}
          onChange={(e) => setFormData({ ...formData, assigned_epic: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
          placeholder="Enter epic name"
        />
      </div>

      {/* Board Status */}
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

      {/* Acceptance Criteria */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-lg font-semibold text-[#4A2B4A]">Acceptance Criteria</label>
          <Button
            type="button"
            onClick={handleAddAcceptanceCriteria}
            variant="outline"
            size="sm"
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Criteria
          </Button>
        </div>

        {formData.acceptanceCriteria.length > 0 ? (
          <div className="space-y-2">
            {formData.acceptanceCriteria.map((criteria, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={criteria.description}
                  onChange={(e) => handleUpdateAcceptanceCriteria(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
                  placeholder={`Acceptance criteria ${index + 1}`}
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveAcceptanceCriteria(index)}
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
          <p className="text-gray-500 italic text-lg">No acceptance criteria added yet</p>
        )}
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
          Create User Story
        </Button>
      </div>
    </div>
  );
};

export default CreateUserStoryForm;