import { CheckCircle, Calendar, Clock } from "lucide-react";
import { UserStory } from "@/types/userstory";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { TaskOrStory } from "@/types/taskkanban";

interface UserStoryViewFormProps {
  task: UserStory;
}

const UserStoryViewForm = ({ task }: UserStoryViewFormProps) => {
  const { tasks } = useKanban();

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

      {/* Story Points */}
      {"points" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Story Points:</p>
          <p className="text-black text-lg">{task.points}</p>
        </div>
      )}

      {/* Acceptance Criteria */}
      {"acceptanceCriteria" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Acceptance Criteria:</p>
          <ul className="list-disc pl-4 space-y-1">
            {task.acceptanceCriteria?.map((criteria, index) => (
              <li key={index} className="text-lg">
                {typeof criteria === "string" ? criteria : criteria.description}
              </li>
            )) || <p className="text-gray-500 italic text-lg">No acceptance criteria defined</p>}
          </ul>
        </div>
      )}

      {/* Related Tasks */}
      {"task_list" in task && task.task_list && task.task_list.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Linked Tasks:</p>
          <ul className="space-y-1">
            {task.task_list.map((taskId) => {
              let taskDetails = null;
              for (const column of Object.values(tasks)) {
                const found = column.find((t: TaskOrStory) => t.id === taskId);
                if (found) {
                  taskDetails = found;
                  break;
                }
              }
              
              return (
                <li key={taskId} className="flex items-center gap-2">
                  {taskDetails ? (
                    <>
                      <span className={`text-xs ${taskDetails.status_khanban === "Done" ? "line-through text-gray-500" : ""}`}>
                        {taskDetails.title}
                      </span>
                      {taskDetails.status_khanban === "Done" && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">Task not found</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default UserStoryViewForm;