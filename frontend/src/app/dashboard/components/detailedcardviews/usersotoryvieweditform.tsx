import { useState, useEffect } from "react";
import { Save, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserStory } from "@/types/userstory";

interface UserStoryEditFormProps {
  task: UserStory;
  onSave: (updatedFields: any) => void;
}

const UserStoryEditForm = ({ task, onSave }: UserStoryEditFormProps) => {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority as "High" | "Medium" | "Low" ,
    deadline: "deadline" in task ? task.deadline || "" : "",
    storyPoints: "points" in task ? task.points || 0 : 0,
    acceptanceCriteria: [] as string[],
  });

  useEffect(() => {
    const criteria = "acceptanceCriteria" in task && task.acceptanceCriteria
      ? (task.acceptanceCriteria as any[]).map((ac: any) => 
          typeof ac === "string" ? ac : ac.description
        )
      : [];

    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      deadline: "deadline" in task ? task.deadline || "" : "",
      storyPoints: "points" in task ? task.points || 0 : 0,
      acceptanceCriteria: criteria,
    });
  }, [task]);

  const handleSave = () => {
    const updatedFields: any = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "High" | "Medium" | "Low",
    };

    if ("points" in task) {
      updatedFields.story_points = parseInt(formData.storyPoints.toString()) || 0;
    }

    if ("acceptanceCriteria" in task) {
      updatedFields.acceptanceCriteria = formData.acceptanceCriteria;
    }

    if (formData.deadline) {
      updatedFields.deadline = formData.deadline;
    }

    onSave(updatedFields);
  };

  const handleAddAcceptanceCriteria = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [...formData.acceptanceCriteria, ""]
    });
  };

  const handleUpdateAcceptanceCriteria = (index: number, value: string) => {
    const updated = [...formData.acceptanceCriteria];
    updated[index] = value;
    setFormData({
      ...formData,
      acceptanceCriteria: updated
    });
  };

  const handleRemoveAcceptanceCriteria = (index: number) => {
    const updated = [...formData.acceptanceCriteria];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      acceptanceCriteria: updated
    });
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
          placeholder="Enter user story title"
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
          placeholder="Enter user story description"
        />
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <select
        aria-label="date"
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
            aria-label="date"
            type="date"
            value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ""}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>
      )}

      {/* Story Points */}
      {"points" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Story Points:</p>
          <input
            aria-label="points"
            type="number"
            min="0"
            value={formData.storyPoints}
            onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>
      )}

      {/* Acceptance Criteria */}
      {"acceptanceCriteria" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-[#4A2B4A] text-lg">Acceptance Criteria:</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddAcceptanceCriteria}
              className="bg-[#4A2B4A] text-white hover:bg-[#3a2248] text-xs py-1 px-2"
            >
              + Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.acceptanceCriteria.map((criteria, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text"
                  value={criteria}
                  onChange={(e) => handleUpdateAcceptanceCriteria(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-xs"
                  placeholder="Enter acceptance criteria"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveAcceptanceCriteria(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
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

export default UserStoryEditForm;