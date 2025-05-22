import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bug as BugType } from "@/types/bug";

interface BugEditFormProps {
  task: BugType;
  onSave: (updatedFields: any) => void;
}

const BugEditForm = ({ task, onSave }: BugEditFormProps) => {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    severity: task.severity || "Major",
    bugStatus: task.bug_status || "New",
    visibleToCustomers: task.visibleToCustomers || false,
  });

  useEffect(() => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      severity: task.severity || "Major",
      bugStatus: task.bug_status || "New",
      visibleToCustomers: task.visibleToCustomers || false,
    });
  }, [task]);

  const handleSave = () => {
    const updatedFields = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as "High" | "Medium" | "Low",
      severity: formData.severity,
      bug_status: formData.bugStatus,
      visibleToCustomers: formData.visibleToCustomers,
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
          placeholder="Enter bug title"
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
          placeholder="Enter bug description"
        />
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <select
          aria-label="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Bug Status */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Bug Status:</p>
        <select
          aria-label="bugStatus"
          value={formData.bugStatus}
          onChange={(e) => setFormData({ ...formData, bugStatus: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="New">New</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Fixed">Fixed</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Severity */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Severity:</p>
        <select
          aria-label="severity"
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-lg"
        >
          <option value="Blocker">Blocker</option>
          <option value="Critical">Critical</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
          <option value="Trivial">Trivial</option>
        </select>
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

export default BugEditForm;