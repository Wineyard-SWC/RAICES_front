import { useState } from "react";
import { Save, X,Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserStory } from "@/types/userstory";

interface CreateTaskFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
  userstories?: UserStory[];
  availableUsers?: Array<{ id: string; name: string }>;
  availableSprints?: Array<{ id: string; name: string }>;
}

const CreateTaskForm = ({ onSave, onCancel, userstories, availableUsers = [], availableSprints = []  }: CreateTaskFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    deadline: "",
    user_story_id: "",
    user_story_title: "",
    status_khanban: "Backlog" as "Backlog" | "To Do" | "In Progress" | "In Review" | "Done",
    story_points: 0,
    sprint_id: "",
    assignee: [] as Array<{users:[string, string]}>,
  });

  const [newAssignee, setNewAssignee] = useState("");
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

  const handleUserStoryChange = (id: string) => {
    const selected = userstories?.find(us => us.uuid === id);
    setFormData({
      ...formData,
      user_story_id: id,
      user_story_title: selected ? selected.title : "",
    });
  };

  const handleAddAssignee = () => {
    if (newAssignee && !formData.assignee.some(a => a.users[0] === newAssignee)) {
      const user = availableUsers.find(u => u.id === newAssignee);
      if (user) {
        setFormData({
          ...formData,
          assignee: [...formData.assignee, {users:[user.id, user.name]}],
        });
        setNewAssignee("");
      }
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setFormData({
      ...formData,
      assignee: formData.assignee.filter(a => a.users[0] !== userId),
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      deadline: formData.deadline || undefined,
      user_story_id: formData.user_story_id || undefined,
      user_story_title: formData.user_story_title || undefined,
      status_khanban: formData.status_khanban,
      story_points: formData.story_points,
      sprint_id: formData.sprint_id || undefined,
      assignee: formData.assignee,
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

      {/* Priority and Story Points */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Priority</label>
          <select
            aria-label="priority"
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
            value={formData.story_points}
            onChange={(e) => setFormData({ ...formData, story_points: parseInt(e.target.value) || 0 })}
            className="w-full p-3 border border-gray-300 rounded-md text-lg"
            placeholder="0"
          />
        </div>
      </div>

      {/* Status Kanban */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Status
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
      
    
      {/* Related User Story */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Related User Story</label>
        <select
          aria-label="story"
          value={formData.user_story_id}
          onChange={(e) => handleUserStoryChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
        >
          <option value="">-- No User Story --</option>
          {userstories?.map(us => (
            <option key={us.uuid} value={us.uuid}>
              {us.title}
            </option>
          ))}
        </select>
      </div>

      {/* Sprint */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Sprint</label>
        <select
          aria-label="sprint"
          value={formData.sprint_id}
          onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
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
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Assignees</label>
          {/* Current assignees */}
          {formData.assignee.length > 0 && (
            <div className="mb-3 space-y-2">
              {formData.assignee.map((assignee, index) => (
                <div key={assignee.users[0]} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-lg">{assignee.users[1]}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveAssignee(assignee.users[0])}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

      {/* Add new assignee */}
      <div className="flex gap-2">
        <select
          aria-label="new assignee"
          value={newAssignee}
          onChange={(e) => setNewAssignee(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="">Select user to assign</option>
          {availableUsers
            .filter(u => !formData.assignee.some(a => a.users[0] === u.id))
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
        >
          Add
        </Button>
      </div>
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