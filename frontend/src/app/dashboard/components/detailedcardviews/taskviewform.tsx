import { Clock, Calendar } from "lucide-react";
import { Task } from "@/types/task";

interface TaskViewFormProps {
  task: Task;
}

const TaskViewForm = ({ task }: TaskViewFormProps) => {
  return (
    <>
      {/* Title */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Title:</p>
        <p className="text-black text-lg">{task.title}</p>
      </div>

      {/* Description */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Description:</p>
        <p className="text-black text-lg">{task.description}</p>
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <p className="text-black text-lg">{task.priority}</p>
      </div>

      {/* Date */}
      {"date" in task && task.date && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Date:</p>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.date}</p>
          </div>
        </div>
      )}

      {/* Deadline */}
      {"deadline" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Deadline:</p>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">
              {task.deadline ? new Date(task.deadline).toLocaleDateString() : "None"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskViewForm;