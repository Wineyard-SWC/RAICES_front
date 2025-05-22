import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";

interface TaskEditFormProps {
  task: Task;
  onSave: (updatedFields: any) => void;
}

const TaskEditForm = ({ task, onSave }: TaskEditFormProps) => {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    deadline: "deadline" in task ? task.deadline || "" : "",
  });

  useEffect(() => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      deadline: "deadline" in task ? task.deadline || "" : "",
    });
  }, [task]);

  const handleSave = () => {
    const updatedFields = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "High" | "Medium" | "Low",
    };

    if (formData.deadline) {
      Object.assign(updatedFields, { deadline: formData.deadline });
    }

    onSave(updatedFields);
  };

  return (
    <>
      {/* Title */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Title:</p>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
          placeholder="Enter task title"
        />
      </div>

      {/* Description */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Description:</p>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
          placeholder="Enter task description"
        />
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Deadline */}
      {"deadline" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Deadline:</p>
          <input
            type="date"
            value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ""}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>
      )}

      {/* Save Button */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <Button 
          onClick={handleSave}
          className="w-full bg-green-600 text-white hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>
    </>
  );
};

export default TaskEditForm;