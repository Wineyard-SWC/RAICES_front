import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { UserStory } from "@/types/userstory";
import { Save, X, Plus, Trash } from "lucide-react";

interface TaskEditFormProps {
  task: Task;
  onSave: (updatedFields: any) => void;
  onCancel: () => void;
  userstories?: UserStory[];
  availableUsers?: Array<{ id: string; name: string }>;
  availableSprints?: Array<{ id: string; name: string }>;
  validationErrors?: Record<string, string>; // Add this prop
}

const TaskEditForm = ({ task, onSave, onCancel, userstories, availableUsers = [], availableSprints = []  }: TaskEditFormProps) => {
   const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    deadline: task.deadline || "",
    status_khanban: task.status_khanban || "Backlog",
    user_story_id: task.user_story_id || "",
    user_story_title: task.user_story_title || "",
    story_points: task.story_points || 0,
    sprint_id: task.sprint_id || "",
    assignee: task.assignee || [],
  });

   const [newAssignee, setNewAssignee] = useState("");

  useEffect(() => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      deadline: task.deadline || "",
      status_khanban: task.status_khanban || "Backlog",
      user_story_id: task.user_story_id || "",
      user_story_title: task.user_story_title || "",
      story_points: task.story_points || 0,
      sprint_id: task.sprint_id || "",
      assignee: task.assignee || [],
    });
  }, [task]);

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

   const handleSave = () => {
    const updatedFields: any = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "High" | "Medium" | "Low",
      deadline: formData.deadline,
      status_khanban: formData.status_khanban,
      user_story_id: formData.user_story_id,
      user_story_title: formData.user_story_title,
      story_points: Number(formData.story_points) || 0,
      sprint_id: formData.sprint_id,
      assignee: formData.assignee,
    };
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
          aria-label="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as "High"|"Medium"|"Low"})}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Story Points */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Story Points
        </label>
        <input
          aria-label="points"
          type="number"
          min="0"
          value={formData.story_points}
          onChange={e => setFormData({ ...formData, story_points: parseInt(e.target.value) || 0 })}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
        />
      </div>

      {/* Deadline */}
      {"deadline" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Deadline:</p>
          <input
            aria-label="deadline"
            type="date"
            value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ""}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
          />
        </div>
      )}

      {/* Status Kanban */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Backlog Status
        </label>
        <select
          aria-label="status"
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

       {/* User Story selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Related User Story
        </label>
        <select 
          aria-label="story"
          value={formData.user_story_id}
          onChange={e => handleUserStoryChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md text-lg"
        >
          <option value="">-- Unassigned --</option>
          {userstories?.map(us => (
            <option key={us.uuid} value={us.uuid}>
              {us.title}
            </option>
          ))}
        </select>
      </div>
      
      {/* Sprint selection */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Sprint
        </label>
        <select 
          aria-label="sprint"
          value={formData.sprint_id}
          onChange={e => setFormData({ ...formData, sprint_id: e.target.value })}
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

      {/* Assignees */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">
          Assignees
        </label>
        
        {/* Current assignees */}
        {formData.assignee.length > 0 && (
          <div className="mb-3 space-y-2">
            {formData.assignee.map((assignee, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-lg">{assignee.users[1]}</span>
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
            aria-label="add new assignee"
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
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248]"
          >
            <Plus className="h-4 w-4" />
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
          onClick={handleSave}
          className="flex-1 bg-green-600 text-white hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </>
  );
};


export default TaskEditForm;