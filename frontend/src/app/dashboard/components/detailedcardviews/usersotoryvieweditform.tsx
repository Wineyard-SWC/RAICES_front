import { useState, useEffect } from "react";
import { Save, Trash, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserStory } from "@/types/userstory";
import { useUser } from "@/contexts/usercontext";
import { v4 as uuidv4 } from "uuid"
import { getAssigneeName,getAssigneeId } from "../../utils/secureAssigneeFormat";

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


interface UserStoryEditFormProps {
  task: UserStory;
  onSave: (updatedFields: any) => void;
  onCancel: () => void;
  availableEpics?: Array<any>;
  availableSprints?: Array<any>;
  availableUsers?: Array<{ id: string; name: string }>;
  validationErrors?: Record<string, string>; // Add this prop
}

const getNow = () => new Date().toISOString();

const UserStoryEditForm = ({ task, onSave, onCancel, availableUsers = [], availableSprints = [], availableEpics = [] }: UserStoryEditFormProps) => {
  const { userId, userData } = useUser();

  const [formData, setFormData] = useState({
    idTitle: task.idTitle || "",
    title: task.title || "",
    description: task.description || "",
    priority: task.priority as "High" | "Medium" | "Low",
    deadline: task.deadline || "",
    storyPoints: task.points || 0,
    acceptanceCriteria: [] as AcceptanceCriteria[],
    assigned_epic: task.assigned_epic || "",
    assigned_sprint: task.assigned_sprint || "",
    status_khanban: task.status_khanban || "Backlog",
    assignee: task.assignee || [],
  });

  const [newAssignee, setNewAssignee] = useState("");

  useEffect(() => {
    let criteria: AcceptanceCriteria[] = [];

    if (Array.isArray(task.acceptanceCriteria)) {
      criteria = task.acceptanceCriteria.map((ac: any) =>
        typeof ac === "string"
          ? {
              id: uuidv4(),
              description: ac,
              date_completed: "",
              date_created: getNow(),
              date_modified: getNow(),
              finished_by: ["", ""],
              created_by: userId ? [userId, userData?.name ?? ""] : ["RAICES_IA", "RAICES_IA"],
              modified_by: userId ? [userId, userData?.name ?? ""] : ["RAICES_IA", "RAICES_IA"],
            }
          : {
              id: ac.id || uuidv4(),
              description: ac.description ?? "",
              date_completed: ac.date_completed ?? "",
              date_created: ac.date_created ?? "",
              date_modified: ac.date_modified ?? "",
              finished_by: ac.finished_by ?? ["", ""],
              created_by: ac.created_by ?? ["", ""],
              modified_by: ac.modified_by ?? ["", ""],
            }
      );
    }

    setFormData({
      idTitle: task.idTitle || "",
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      deadline: task.deadline || "",
      storyPoints: task.points || 0,
      acceptanceCriteria: criteria,
      assigned_epic: task.assigned_epic || "",
      assigned_sprint: task.assigned_sprint || "",
      status_khanban: task.status_khanban || "Backlog",
      assignee: task.assignee || [],
    });
  }, [task, userId, userData]);

  const handleAddAssignee = () => {
    if (newAssignee && !formData.assignee.some(a => getAssigneeId(a) === newAssignee)) {
      const user = availableUsers.find(u => u.id === newAssignee);
      if (user) {
        setFormData({
          ...formData,
          assignee: [...formData.assignee, { users: [user.id, user.name] }],
        });
        setNewAssignee("");
      }
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    setFormData({
      ...formData,
      assignee: formData.assignee.filter(a => getAssigneeId(a) !== userId),
    });
  };

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

  const handleSave = () => {
    const updatedFields: any = {
      idTitle: formData.idTitle,
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "High" | "Medium" | "Low",
      points: parseInt(formData.storyPoints.toString()) || 0,
      deadline: formData.deadline,
      acceptanceCriteria: formData.acceptanceCriteria,
      assigned_epic: formData.assigned_epic,
      assigned_sprint: formData.assigned_sprint,
      status_khanban: formData.status_khanban,
      assignee: formData.assignee,
    };

    onSave(updatedFields);
  };


  return (
    <>
      {/* ID Title */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">ID Title:</p>
        <input
          type="text"
          value={formData.idTitle}
          onChange={(e) => setFormData({ ...formData, idTitle: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
          placeholder="e.g., US-001"
        />
      </div>

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

      {/* Priority and Story Points */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
          <select
            aria-label="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as "High" | "Medium" | "Low"})}
            className="w-full p-2 border border-gray-300 rounded-md text-lg"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

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
      </div>

      {/* Status */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Status:</p>
        <select
          aria-label="status"
          value={formData.status_khanban}
          onChange={(e) => setFormData({ ...formData, status_khanban: e.target.value as any })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="Backlog">Backlog</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Epic Assignment */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Epic:</p>
        <select
          aria-label="epic"
          value={formData.assigned_epic}
          onChange={(e) => setFormData({ ...formData, assigned_epic: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="">-- No Epic --</option>
          {availableEpics.map(epic => (
            <option key={epic.id} value={epic.id}>
              {epic.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sprint Assignment */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Sprint:</p>
        <select
          aria-label='sprintselect'
          value={formData.assigned_sprint}
          onChange={(e) => setFormData({ ...formData, assigned_sprint: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
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
        <label className="block text-lg font-semibold text-[#4A2B4A] mb-2">Assignees</label>
        
        {/* Current assignees */}
        {formData.assignee.length > 0 && (
          <div className="mb-3 space-y-2">
            {formData.assignee.map((assignee, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-lg">{getAssigneeName(assignee)}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveAssignee(getAssigneeId(assignee))}
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
            aria-label="newuser"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
          >
            <option value="">Select user to assign</option>
            {availableUsers
              .filter(u => !formData.assignee.some(a => getAssigneeId(a) === u.id))
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

      {/* Deadline */}
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

      {/* Acceptance Criteria */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-[#4A2B4A] text-lg">Acceptance Criteria:</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddAcceptanceCriteria}
            className="bg-[#4A2B4A] text-white hover:bg-[#3a2248] text-lg py-1 px-2"
          >
            + Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.acceptanceCriteria.map((criteria, index) => (
            <div key={index} className="flex gap-2">
              <input 
                type="text"
                value={criteria.description}
                onChange={(e) => handleUpdateAcceptanceCriteria(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
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
          className="flex-1 bg-[#694969] text-white hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>
    </>
  );
};

export default UserStoryEditForm;